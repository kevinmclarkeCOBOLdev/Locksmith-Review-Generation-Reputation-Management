import { db } from '@/db';
import { reviewRequests, reviewFeedback, leads, tenants } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { mockReviewRequests, mockReviewFeedback, mockLeads } from '@/db/mock';

export interface DashboardMetrics {
  totalRequests: number;
  sentRequests: number;
  responseCount: number;
  responseRate: number; // percentage 0 - 100
  positiveCount: number; // 4 - 5 stars
  negativeCount: number; // 1 - 3 stars
  positiveRate: number; // percentage of positive / responded
  averageRating: number; // e.g. 4.8
  publicClicks: number; // Google/Trustpilot click events
  publicClickRate: number; // percentage of public clicks / positive feedback
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface RecentReviewRequestItem {
  id: string;
  leadId: string;
  customerName: string;
  serviceType: string;
  phone: string;
  email: string;
  channel: string;
  status: string;
  rating: number | null;
  secureToken: string;
  sentAt: Date | string | null;
  createdAt: Date | string;
}

export interface RecentFeedbackItem {
  id: string;
  reviewRequestId: string;
  customerName: string;
  serviceType: string;
  rating: number;
  sentiment: 'positive' | 'negative';
  feedbackText: string | null;
  publicPlatformClicked: boolean;
  publicPlatformName: string | null;
  createdAt: Date | string;
}

export interface DashboardOverviewData {
  tenantName: string;
  businessEmail?: string | null;
  businessPhone?: string | null;
  metrics: DashboardMetrics;
  recentRequests: RecentReviewRequestItem[];
  recentFeedback: RecentFeedbackItem[];
}

/**
 * Computes live MySQL reputation and review metrics for the specified tenant.
 * Uses strict tenant-scoped parameterised queries.
 */
export async function getDashboardOverviewData(tenantId: string): Promise<DashboardOverviewData> {
  try {
    // 1. Fetch tenant business branding details
    const tenantRecords = await db
      .select({
        name: tenants.name,
        businessEmail: tenants.businessEmail,
        businessPhone: tenants.businessPhone,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    const tenantInfo = tenantRecords[0] || {
      name: 'DEMO Locksmith',
      businessEmail: 'support@atypikalstudio.dev',
      businessPhone: '+447700900077',
    };

    // 2. Fetch all review requests for this tenant
    const requests = await db
      .select({
        id: reviewRequests.id,
        tenantId: reviewRequests.tenantId,
        leadId: reviewRequests.leadId,
        status: reviewRequests.status,
        channel: reviewRequests.channel,
        secureToken: reviewRequests.secureToken,
        rating: reviewRequests.rating,
        sentAt: reviewRequests.sentAt,
        createdAt: reviewRequests.createdAt,
        customerName: leads.name,
        serviceType: leads.serviceType,
        phone: leads.phone,
        email: leads.email,
      })
      .from(reviewRequests)
      .leftJoin(leads, eq(reviewRequests.leadId, leads.id))
      .where(eq(reviewRequests.tenantId, tenantId))
      .orderBy(desc(reviewRequests.createdAt));

    // 3. Fetch all feedback records for this tenant
    const feedbackList = await db
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
      })
      .from(reviewFeedback)
      .where(eq(reviewFeedback.tenantId, tenantId))
      .orderBy(desc(reviewFeedback.createdAt));

    // 4. Calculate deterministic evidence-based metrics
    const totalRequests = requests.length;
    const sentRequests = (requests as any[]).filter((r: any) =>
      ['sent', 'delivered', 'responded', 'positive', 'negative'].includes(r.status)
    ).length;

    const responseCount = feedbackList.length;
    const responseRate = sentRequests > 0 ? Math.round((responseCount / sentRequests) * 100) : 0;

    let totalRatingSum = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let publicClicks = 0;

    const ratingDistribution: DashboardMetrics['ratingDistribution'] = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    for (const f of feedbackList as any[]) {
      const r = f.rating as 1 | 2 | 3 | 4 | 5;
      if (r >= 1 && r <= 5) {
        ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
        totalRatingSum += r;
      }

      if (f.sentiment === 'positive' || f.rating >= 4) {
        positiveCount++;
      } else {
        negativeCount++;
      }

      if (f.publicPlatformClicked) {
        publicClicks++;
      }
    }

    const averageRating =
      responseCount > 0 ? parseFloat((totalRatingSum / responseCount).toFixed(1)) : 0;
    const positiveRate =
      responseCount > 0 ? Math.round((positiveCount / responseCount) * 100) : 0;
    const publicClickRate =
      positiveCount > 0 ? Math.round((publicClicks / positiveCount) * 100) : 0;

    // 5. Format recent requests
    const recentRequests: RecentReviewRequestItem[] = (requests as any[]).slice(0, 8).map((r: any) => ({
      id: r.id,
      leadId: r.leadId,
      customerName: r.customerName || 'Direct Customer',
      serviceType: r.serviceType || 'Locksmith Service',
      phone: r.phone || '',
      email: r.email || '',
      channel: r.channel,
      status: r.status,
      rating: r.rating,
      secureToken: r.secureToken,
      sentAt: r.sentAt,
      createdAt: r.createdAt,
    }));

    // 6. Format recent feedback joined with lead context
    const leadMap = new Map((requests as any[]).map((r: any) => [r.id, r]));

    const recentFeedback: RecentFeedbackItem[] = (feedbackList as any[]).slice(0, 6).map((f: any) => {
      const parentRequest = leadMap.get(f.reviewRequestId);
      return {
        id: f.id,
        reviewRequestId: f.reviewRequestId,
        customerName: parentRequest?.customerName || 'Customer',
        serviceType: parentRequest?.serviceType || 'Locksmith Service',
        rating: f.rating,
        sentiment: (f.sentiment as 'positive' | 'negative') || (f.rating >= 4 ? 'positive' : 'negative'),
        feedbackText: f.feedbackText,
        publicPlatformClicked: f.publicPlatformClicked,
        publicPlatformName: f.publicPlatformName,
        createdAt: f.createdAt,
      };
    });

    return {
      tenantName: tenantInfo.name,
      businessEmail: tenantInfo.businessEmail,
      businessPhone: tenantInfo.businessPhone,
      metrics: {
        totalRequests,
        sentRequests,
        responseCount,
        responseRate,
        positiveCount,
        negativeCount,
        positiveRate,
        averageRating,
        publicClicks,
        publicClickRate,
        ratingDistribution,
      },
      recentRequests,
      recentFeedback,
    };
  } catch (err: any) {
    console.warn(`[getDashboardOverviewData] Database query fallback: ${err?.message}`);

    // Safe in-memory fallback for local development / testing without live MySQL
    const fallbackRequests = mockReviewRequests.filter((r) => r.tenantId === tenantId);
    const fallbackFeedback = mockReviewFeedback.filter((f) => f.tenantId === tenantId);

    const totalRequests = fallbackRequests.length;
    const sentRequests = fallbackRequests.filter((r) =>
      ['sent', 'delivered', 'responded', 'positive', 'negative'].includes(r.status)
    ).length;
    const responseCount = fallbackFeedback.length;
    const responseRate = sentRequests > 0 ? Math.round((responseCount / sentRequests) * 100) : 0;

    let totalRatingSum = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let publicClicks = 0;

    const ratingDistribution: DashboardMetrics['ratingDistribution'] = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    for (const f of fallbackFeedback) {
      const r = f.rating as 1 | 2 | 3 | 4 | 5;
      if (r >= 1 && r <= 5) {
        ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
        totalRatingSum += r;
      }
      if (f.sentiment === 'positive' || f.rating >= 4) {
        positiveCount++;
      } else {
        negativeCount++;
      }
      if (f.publicPlatformClicked) {
        publicClicks++;
      }
    }

    const averageRating =
      responseCount > 0 ? parseFloat((totalRatingSum / responseCount).toFixed(1)) : 0;
    const positiveRate =
      responseCount > 0 ? Math.round((positiveCount / responseCount) * 100) : 0;
    const publicClickRate =
      positiveCount > 0 ? Math.round((publicClicks / positiveCount) * 100) : 0;

    const leadMap = new Map(mockLeads.map((l) => [l.id, l]));

    const recentRequests: RecentReviewRequestItem[] = fallbackRequests.slice(0, 8).map((r) => {
      const lead = leadMap.get(r.leadId);
      return {
        id: r.id,
        leadId: r.leadId,
        customerName: lead?.name || 'David Jones',
        serviceType: lead?.serviceType || 'Emergency Lockout',
        phone: lead?.phone || '07700 900077',
        email: lead?.email || 'customer@example.com',
        channel: r.channel,
        status: r.status,
        rating: r.rating,
        secureToken: r.secureToken,
        sentAt: r.sentAt,
        createdAt: r.createdAt,
      };
    });

    const reqMap = new Map(recentRequests.map((r) => [r.id, r]));

    const recentFeedback: RecentFeedbackItem[] = fallbackFeedback.slice(0, 6).map((f) => {
      const req = reqMap.get(f.reviewRequestId);
      return {
        id: f.id,
        reviewRequestId: f.reviewRequestId,
        customerName: req?.customerName || 'Emma Watson',
        serviceType: req?.serviceType || 'Lock Replacement',
        rating: f.rating,
        sentiment: f.sentiment as 'positive' | 'negative',
        feedbackText: f.feedbackText,
        publicPlatformClicked: f.publicPlatformClicked,
        publicPlatformName: f.publicPlatformName,
        createdAt: f.createdAt,
      };
    });

    return {
      tenantName: 'DEMO Locksmith',
      businessEmail: 'support@atypikalstudio.dev',
      businessPhone: '+447700900077',
      metrics: {
        totalRequests,
        sentRequests,
        responseCount,
        responseRate,
        positiveCount,
        negativeCount,
        positiveRate,
        averageRating,
        publicClicks,
        publicClickRate,
        ratingDistribution,
      },
      recentRequests,
      recentFeedback,
    };
  }
}
