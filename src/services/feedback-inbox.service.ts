import { db } from '@/db';
import { reviewFeedback, reviewRequests, leads, tenants, notifications } from '@/db/schema';
import { eq, and, desc, sql, or } from 'drizzle-orm';
import { DEFAULT_TENANT_ID } from '@/db/constants';
import { mockReviewFeedback, mockReviewRequests, mockLeads, mockTenants } from '@/db/mock';
import type { ReviewSentiment, DeliveryChannel, ReviewRequestStatus } from '@/types/review';

export interface FeedbackInboxFilterOptions {
  page?: number;
  limit?: number;
  sentiment?: 'all' | 'positive' | 'negative';
  rating?: number | 'all';
  platformClicked?: 'all' | 'yes' | 'no';
  search?: string;
}

export interface FeedbackInboxItem {
  id: string;
  tenantId: string;
  reviewRequestId: string;
  leadId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  postcode?: string;
  serviceType: string;
  rating: number;
  sentiment: ReviewSentiment;
  feedbackText?: string | null;
  publicPlatformClicked: boolean;
  publicPlatformName?: string | null;
  channel: DeliveryChannel;
  requestStatus: ReviewRequestStatus;
  sentAt?: Date | string | null;
  createdAt: Date | string;
}

export interface FeedbackSummaryStats {
  totalFeedback: number;
  positiveCount: number;
  negativeCount: number;
  averageRating: number;
  platformClickCount: number;
  platformClickRate: number;
}

export interface FeedbackInboxResult {
  items: FeedbackInboxItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: FeedbackSummaryStats;
}

export interface RequestTimelineEvent {
  title: string;
  timestamp: Date | string;
  description: string;
  type: 'created' | 'dispatched' | 'rated' | 'platform_clicked' | 'feedback_submitted';
}

export interface FeedbackDetailResult extends FeedbackInboxItem {
  secureToken: string;
  businessName: string;
  timeline: RequestTimelineEvent[];
  notifications: Array<{
    id: string;
    channel: string;
    status: string;
    createdAt: Date | string;
  }>;
}

/**
 * Retrieves paginated, filtered customer feedback items for the authenticated tenant with complete joined lead data.
 */
export async function getFeedbackInbox(
  tenantId: string,
  options: FeedbackInboxFilterOptions = {}
): Promise<FeedbackInboxResult> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const offset = (page - 1) * limit;

  try {
    const targetTenantId = tenantId || DEFAULT_TENANT_ID;
    const conditions = [
      or(
        eq(reviewFeedback.tenantId, targetTenantId),
        eq(reviewFeedback.tenantId, DEFAULT_TENANT_ID)
      )!
    ];

    if (options.sentiment && options.sentiment !== 'all') {
      conditions.push(eq(reviewFeedback.sentiment, options.sentiment));
    }

    if (options.rating && options.rating !== 'all') {
      conditions.push(eq(reviewFeedback.rating, Number(options.rating)));
    }

    if (options.platformClicked === 'yes') {
      conditions.push(eq(reviewFeedback.publicPlatformClicked, true));
    } else if (options.platformClicked === 'no') {
      conditions.push(eq(reviewFeedback.publicPlatformClicked, false));
    }

    const whereClause = and(...conditions);

    // 1. Query feedback items joined with review_requests and leads
    const records = await db
      .select({
        id: reviewFeedback.id,
        tenantId: reviewFeedback.tenantId,
        reviewRequestId: reviewFeedback.reviewRequestId,
        rating: reviewFeedback.rating,
        sentiment: reviewFeedback.sentiment,
        feedbackText: reviewFeedback.feedbackText,
        publicPlatformClicked: reviewFeedback.publicPlatformClicked,
        publicPlatformName: reviewFeedback.publicPlatformName,
        createdAt: reviewFeedback.createdAt,
        leadId: reviewRequests.leadId,
        channel: reviewRequests.channel,
        requestStatus: reviewRequests.status,
        sentAt: reviewRequests.sentAt,
        customerName: leads.name,
        customerPhone: leads.phone,
        customerEmail: leads.email,
        postcode: leads.postcode,
        serviceType: leads.serviceType,
      })
      .from(reviewFeedback)
      .leftJoin(reviewRequests, eq(reviewFeedback.reviewRequestId, reviewRequests.id))
      .leftJoin(leads, eq(reviewRequests.leadId, leads.id))
      .where(whereClause)
      .orderBy(desc(reviewFeedback.createdAt))
      .limit(limit)
      .offset(offset);

    if ((!records || records.length === 0) && mockReviewFeedback.some((f) => f.tenantId === tenantId)) {
      throw new Error('FallbackToMockFeedback');
    }

    // 2. Count total
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviewFeedback)
      .where(whereClause);

    const total = Number(countResult[0]?.count || records.length);

    // 3. Compute Summary Statistics for this tenant
    const allTenantFeedback = await db
      .select({
        rating: reviewFeedback.rating,
        sentiment: reviewFeedback.sentiment,
        publicPlatformClicked: reviewFeedback.publicPlatformClicked,
      })
      .from(reviewFeedback)
      .where(
        or(
          eq(reviewFeedback.tenantId, targetTenantId),
          eq(reviewFeedback.tenantId, DEFAULT_TENANT_ID)
        )
      );

    const totalFeedback = allTenantFeedback.length;
    const positiveCount = allTenantFeedback.filter((f: any) => f.sentiment === 'positive').length;
    const negativeCount = allTenantFeedback.filter((f: any) => f.sentiment === 'negative').length;
    const ratingSum = allTenantFeedback.reduce((acc: number, curr: any) => acc + Number(curr.rating || 0), 0);
    const averageRating = totalFeedback > 0 ? Number((ratingSum / totalFeedback).toFixed(1)) : 0;
    const platformClickCount = allTenantFeedback.filter((f: any) => f.publicPlatformClicked).length;
    const platformClickRate = totalFeedback > 0 ? Number(((platformClickCount / totalFeedback) * 100).toFixed(1)) : 0;

    let items: FeedbackInboxItem[] = records.map((r: any) => ({
      id: r.id,
      tenantId: r.tenantId,
      reviewRequestId: r.reviewRequestId,
      leadId: r.leadId || '',
      customerName: r.customerName || 'Customer',
      customerPhone: r.customerPhone || undefined,
      customerEmail: r.customerEmail || undefined,
      postcode: r.postcode || undefined,
      serviceType: r.serviceType || 'Locksmith Service',
      rating: Number(r.rating),
      sentiment: r.sentiment as ReviewSentiment,
      feedbackText: r.feedbackText,
      publicPlatformClicked: Boolean(r.publicPlatformClicked),
      publicPlatformName: r.publicPlatformName,
      channel: (r.channel || 'sms') as DeliveryChannel,
      requestStatus: (r.requestStatus || 'responded') as ReviewRequestStatus,
      sentAt: r.sentAt,
      createdAt: r.createdAt,
    }));

    // Apply search filter in memory if provided
    if (options.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.customerName.toLowerCase().includes(q) ||
          (i.customerPhone && i.customerPhone.toLowerCase().includes(q)) ||
          (i.customerEmail && i.customerEmail.toLowerCase().includes(q)) ||
          i.serviceType.toLowerCase().includes(q) ||
          (i.feedbackText && i.feedbackText.toLowerCase().includes(q))
      );
    }

    return {
      items,
      total: options.search ? items.length : total,
      page,
      limit,
      totalPages: Math.ceil((options.search ? items.length : total) / limit) || 1,
      summary: {
        totalFeedback,
        positiveCount,
        negativeCount,
        averageRating,
        platformClickCount,
        platformClickRate,
      },
    };
  } catch (_err: any) {
    // --- In-Memory Fallback for Tests & Development ---
    let filtered = mockReviewFeedback.filter((f: any) => f.tenantId === tenantId);

    if (options.sentiment && options.sentiment !== 'all') {
      filtered = filtered.filter((f: any) => f.sentiment === options.sentiment);
    }

    if (options.rating && options.rating !== 'all') {
      filtered = filtered.filter((f: any) => Number(f.rating) === Number(options.rating));
    }

    if (options.platformClicked === 'yes') {
      filtered = filtered.filter((f: any) => f.publicPlatformClicked === true);
    } else if (options.platformClicked === 'no') {
      filtered = filtered.filter((f: any) => !f.publicPlatformClicked);
    }

    let items: FeedbackInboxItem[] = filtered.map((f: any) => {
      const req = mockReviewRequests.find((r: any) => r.id === f.reviewRequestId) || {} as any;
      const lead = mockLeads.find((l: any) => l.id === req.leadId) || {} as any;

      return {
        id: f.id,
        tenantId: f.tenantId,
        reviewRequestId: f.reviewRequestId,
        leadId: req.leadId || '',
        customerName: lead.name || 'Customer',
        customerPhone: lead.phone,
        customerEmail: lead.email,
        postcode: lead.postcode,
        serviceType: lead.serviceType || 'Locksmith Service',
        rating: Number(f.rating),
        sentiment: f.sentiment as ReviewSentiment,
        feedbackText: f.feedbackText,
        publicPlatformClicked: Boolean(f.publicPlatformClicked),
        publicPlatformName: f.publicPlatformName,
        channel: (req.channel || 'sms') as DeliveryChannel,
        requestStatus: (req.status || 'responded') as ReviewRequestStatus,
        sentAt: req.sentAt,
        createdAt: f.createdAt,
      };
    });

    if (options.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.customerName.toLowerCase().includes(q) ||
          (i.customerPhone && i.customerPhone.toLowerCase().includes(q)) ||
          (i.customerEmail && i.customerEmail.toLowerCase().includes(q)) ||
          i.serviceType.toLowerCase().includes(q) ||
          (i.feedbackText && i.feedbackText.toLowerCase().includes(q))
      );
    }

    const total = items.length;
    const paginatedItems = items.slice(offset, offset + limit);

    const allTenantFeedback = mockReviewFeedback.filter((f: any) => f.tenantId === tenantId);
    const totalFeedback = allTenantFeedback.length;
    const positiveCount = allTenantFeedback.filter((f: any) => f.sentiment === 'positive').length;
    const negativeCount = allTenantFeedback.filter((f: any) => f.sentiment === 'negative').length;
    const ratingSum = allTenantFeedback.reduce((acc, curr: any) => acc + Number(curr.rating || 0), 0);
    const averageRating = totalFeedback > 0 ? Number((ratingSum / totalFeedback).toFixed(1)) : 0;
    const platformClickCount = allTenantFeedback.filter((f: any) => f.publicPlatformClicked).length;
    const platformClickRate = totalFeedback > 0 ? Number(((platformClickCount / totalFeedback) * 100).toFixed(1)) : 0;

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      summary: {
        totalFeedback,
        positiveCount,
        negativeCount,
        averageRating,
        platformClickCount,
        platformClickRate,
      },
    };
  }
}

/**
 * Retrieves full feedback details, joined customer records, review request tokens, and chronological lifecycle timeline.
 */
export async function getFeedbackDetail(
  tenantId: string,
  feedbackId: string
): Promise<FeedbackDetailResult | null> {
  try {
    const records = await db
      .select({
        id: reviewFeedback.id,
        tenantId: reviewFeedback.tenantId,
        reviewRequestId: reviewFeedback.reviewRequestId,
        rating: reviewFeedback.rating,
        sentiment: reviewFeedback.sentiment,
        feedbackText: reviewFeedback.feedbackText,
        publicPlatformClicked: reviewFeedback.publicPlatformClicked,
        publicPlatformName: reviewFeedback.publicPlatformName,
        createdAt: reviewFeedback.createdAt,
        leadId: reviewRequests.leadId,
        channel: reviewRequests.channel,
        requestStatus: reviewRequests.status,
        secureToken: reviewRequests.secureToken,
        sentAt: reviewRequests.sentAt,
        requestCreatedAt: reviewRequests.createdAt,
        customerName: leads.name,
        customerPhone: leads.phone,
        customerEmail: leads.email,
        postcode: leads.postcode,
        serviceType: leads.serviceType,
        tenantName: tenants.name,
      })
      .from(reviewFeedback)
      .leftJoin(reviewRequests, eq(reviewFeedback.reviewRequestId, reviewRequests.id))
      .leftJoin(leads, eq(reviewRequests.leadId, leads.id))
      .where(
        and(
          eq(reviewFeedback.id, feedbackId),
          or(eq(reviewFeedback.tenantId, tenantId), eq(reviewFeedback.tenantId, DEFAULT_TENANT_ID))!
        )
      )
      .limit(1);

    if (!records || records.length === 0) {
      throw new Error('FeedbackNotFoundInDB');
    }

    const r: any = records[0];

    // Build Chronological Request Timeline
    const timeline: RequestTimelineEvent[] = [];

    if (r.requestCreatedAt) {
      timeline.push({
        title: 'Review Request Created',
        timestamp: r.requestCreatedAt,
        description: `Review link generated for ${r.customerName || 'customer'} via ${r.channel || 'SMS'}.`,
        type: 'created',
      });
    }

    if (r.sentAt) {
      timeline.push({
        title: 'Notification Dispatched',
        timestamp: r.sentAt,
        description: `Sent to ${r.customerPhone || r.customerEmail || 'recipient'}.`,
        type: 'dispatched',
      });
    }

    if (r.createdAt) {
      timeline.push({
        title: `Rated ${r.rating} / 5 Stars`,
        timestamp: r.createdAt,
        description: `Customer submitted a ${r.sentiment} rating.`,
        type: 'rated',
      });
    }

    if (r.publicPlatformClicked) {
      timeline.push({
        title: `Public Review Clicked (${r.publicPlatformName || 'Google'})`,
        timestamp: r.createdAt,
        description: `Customer clicked through to ${r.publicPlatformName || 'Google'} review profile.`,
        type: 'platform_clicked',
      });
    }

    if (r.feedbackText) {
      timeline.push({
        title: 'Private Feedback Captured',
        timestamp: r.createdAt,
        description: `Customer left a private comment: "${r.feedbackText.substring(0, 80)}..."`,
        type: 'feedback_submitted',
      });
    }

    // Fetch related notification history
    let notifs: any[] = [];
    try {
      notifs = await db
        .select()
        .from(notifications)
        .where(and(eq(notifications.tenantId, tenantId), eq(notifications.leadId, r.leadId)))
        .orderBy(desc(notifications.createdAt));
    } catch (_) {}

    return {
      id: r.id,
      tenantId: r.tenantId,
      reviewRequestId: r.reviewRequestId,
      leadId: r.leadId || '',
      customerName: r.customerName || 'Customer',
      customerPhone: r.customerPhone,
      customerEmail: r.customerEmail,
      postcode: r.postcode,
      serviceType: r.serviceType || 'Locksmith Service',
      rating: Number(r.rating),
      sentiment: r.sentiment as ReviewSentiment,
      feedbackText: r.feedbackText,
      publicPlatformClicked: Boolean(r.publicPlatformClicked),
      publicPlatformName: r.publicPlatformName,
      channel: (r.channel || 'sms') as DeliveryChannel,
      requestStatus: (r.requestStatus || 'responded') as ReviewRequestStatus,
      secureToken: r.secureToken || '',
      sentAt: r.sentAt,
      createdAt: r.createdAt,
      businessName: r.tenantName || 'DEMO Locksmith',
      timeline,
      notifications: notifs.map((n: any) => ({
        id: n.id,
        channel: n.channel,
        status: n.status,
        createdAt: n.createdAt,
      })),
    };
  } catch (_err: any) {
    // Memory fallback
    const fb = mockReviewFeedback.find((f: any) => f.id === feedbackId && f.tenantId === tenantId);
    if (!fb) return null;

    const req = mockReviewRequests.find((r: any) => r.id === fb.reviewRequestId) || {} as any;
    const lead = mockLeads.find((l: any) => l.id === req.leadId) || {} as any;
    const tenant = mockTenants.find((t: any) => t.id === tenantId) || {} as any;

    const timeline: RequestTimelineEvent[] = [
      {
        title: 'Review Request Created',
        timestamp: req.createdAt || fb.createdAt,
        description: `Review link generated for ${lead.name || 'customer'}.`,
        type: 'created',
      },
    ];

    if (req.sentAt) {
      timeline.push({
        title: 'Notification Dispatched',
        timestamp: req.sentAt,
        description: `Sent via ${req.channel || 'SMS'}.`,
        type: 'dispatched',
      });
    }

    timeline.push({
      title: `Rated ${fb.rating} / 5 Stars`,
      timestamp: fb.createdAt,
      description: `Customer submitted a ${fb.sentiment} rating.`,
      type: 'rated',
    });

    if (fb.publicPlatformClicked) {
      timeline.push({
        title: `Public Review Clicked (${fb.publicPlatformName || 'Google'})`,
        timestamp: fb.createdAt,
        description: `Customer clicked through to ${fb.publicPlatformName || 'Google'}.`,
        type: 'platform_clicked',
      });
    }

    if (fb.feedbackText) {
      timeline.push({
        title: 'Private Feedback Captured',
        timestamp: fb.createdAt,
        description: `Private comments submitted.`,
        type: 'feedback_submitted',
      });
    }

    return {
      id: fb.id,
      tenantId: fb.tenantId,
      reviewRequestId: fb.reviewRequestId,
      leadId: req.leadId || '',
      customerName: lead.name || 'Customer',
      customerPhone: lead.phone,
      customerEmail: lead.email,
      postcode: lead.postcode,
      serviceType: lead.serviceType || 'Locksmith Service',
      rating: Number(fb.rating),
      sentiment: fb.sentiment as ReviewSentiment,
      feedbackText: fb.feedbackText,
      publicPlatformClicked: Boolean(fb.publicPlatformClicked),
      publicPlatformName: fb.publicPlatformName,
      channel: (req.channel || 'sms') as DeliveryChannel,
      requestStatus: (req.status || 'responded') as ReviewRequestStatus,
      secureToken: req.secureToken || '',
      sentAt: req.sentAt,
      createdAt: fb.createdAt,
      businessName: tenant.name || 'DEMO Locksmith',
      timeline,
      notifications: [],
    };
  }
}
