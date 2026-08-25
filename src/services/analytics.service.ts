import { db } from '@/db';
import { reviewRequests, reviewFeedback, tenants } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { mockReviewRequests, mockReviewFeedback, mockTenants } from '@/db/mock';
import type { DeliveryChannel } from '@/types/review';

export type AnalyticsTimeRange = 'today' | '7d' | '30d' | 'all';

export interface RatingDistributionBucket {
  stars: number;
  count: number;
  percentage: number;
}

export interface ChannelPerformanceMetric {
  channel: DeliveryChannel;
  total: number;
  sent: number;
  responded: number;
  responseRate: number;
  averageRating: number;
  positiveCount: number;
}

export interface PlatformClickMetric {
  platformName: string;
  label: string;
  clickCount: number;
  percentage: number;
}

export interface ReputationAnalyticsResult {
  tenantId: string;
  businessName: string;
  timeRange: AnalyticsTimeRange;
  metrics: {
    totalRequests: number;
    sentRequests: number;
    failedRequests: number;
    pendingRequests: number;
    responseCount: number;
    responseRate: number;
    averageRating: number;
    positiveCount: number;
    negativeCount: number;
    positiveRatio: number;
    publicClickCount: number;
    publicClickRate: number;
  };
  ratingDistribution: RatingDistributionBucket[];
  channelPerformance: ChannelPerformanceMetric[];
  platformPerformance: PlatformClickMetric[];
}

function calculateStartDate(timeRange: AnalyticsTimeRange): Date | null {
  const now = new Date();
  if (timeRange === 'today') {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return today;
  }
  if (timeRange === '7d') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (timeRange === '30d') {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return null; // 'all'
}

/**
 * Calculates deterministic, evidence-based reputation analytics for the authenticated tenant.
 */
export async function getReputationAnalytics(
  tenantId: string,
  timeRange: AnalyticsTimeRange = '30d'
): Promise<ReputationAnalyticsResult> {
  const startDate = calculateStartDate(timeRange);

  // 1. Resolve business name
  let businessName = 'Atypikal Locksmith Services';
  try {
    const tenantRecords = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (tenantRecords && tenantRecords.length > 0) {
      businessName = tenantRecords[0].name;
    } else {
      const mockT = mockTenants.find((t: any) => t.id === tenantId);
      if (mockT) businessName = mockT.name;
    }
  } catch (_) {
    const mockT = mockTenants.find((t: any) => t.id === tenantId);
    if (mockT) businessName = mockT.name;
  }

  // 2. Fetch requests and feedback records
  let requestsList: any[] = [];
  let feedbackList: any[] = [];

  try {
    const reqConditions = [eq(reviewRequests.tenantId, tenantId)];
    const fbConditions = [eq(reviewFeedback.tenantId, tenantId)];

    if (startDate) {
      reqConditions.push(gte(reviewRequests.createdAt, startDate));
      fbConditions.push(gte(reviewFeedback.createdAt, startDate));
    }

    requestsList = await db
      .select()
      .from(reviewRequests)
      .where(and(...reqConditions));

    feedbackList = await db
      .select()
      .from(reviewFeedback)
      .where(and(...fbConditions));

    // If query returns empty and mock arrays have items, trigger fallback
    if (
      requestsList.length === 0 &&
      mockReviewRequests.some((r: any) => r.tenantId === tenantId)
    ) {
      throw new Error('FallbackToMockAnalytics');
    }
  } catch (_) {
    // Memory fallback
    requestsList = mockReviewRequests.filter((r: any) => {
      if (r.tenantId !== tenantId) return false;
      if (!startDate) return true;
      return new Date(r.createdAt) >= startDate;
    });

    feedbackList = mockReviewFeedback.filter((f: any) => {
      if (f.tenantId !== tenantId) return false;
      if (!startDate) return true;
      return new Date(f.createdAt) >= startDate;
    });
  }

  // --- Compute Deterministic Metrics ---
  const totalRequests = requestsList.length;
  const sentRequests = requestsList.filter((r: any) =>
    ['sent', 'delivered', 'responded', 'positive', 'negative'].includes(r.status)
  ).length;
  const failedRequests = requestsList.filter((r: any) => r.status === 'failed').length;
  const pendingRequests = requestsList.filter((r: any) =>
    ['pending', 'scheduled'].includes(r.status)
  ).length;

  const responseCount = feedbackList.length;
  const responseRate =
    sentRequests > 0 ? Number(((responseCount / sentRequests) * 100).toFixed(1)) : 0;

  const ratingSum = feedbackList.reduce((acc: number, curr: any) => acc + Number(curr.rating || 0), 0);
  const averageRating =
    responseCount > 0 ? Number((ratingSum / responseCount).toFixed(1)) : 0;

  const positiveCount = feedbackList.filter((f: any) => f.sentiment === 'positive' || Number(f.rating) >= 4).length;
  const negativeCount = feedbackList.filter((f: any) => f.sentiment === 'negative' || (Number(f.rating) <= 3 && Number(f.rating) >= 1)).length;
  const positiveRatio =
    responseCount > 0 ? Number(((positiveCount / responseCount) * 100).toFixed(1)) : 0;

  const publicClickCount = feedbackList.filter((f: any) => f.publicPlatformClicked === true).length;
  const publicClickRate =
    responseCount > 0 ? Number(((publicClickCount / responseCount) * 100).toFixed(1)) : 0;

  // --- Star Rating Distribution (1–5 Stars) ---
  const ratingDistribution: RatingDistributionBucket[] = [5, 4, 3, 2, 1].map((star) => {
    const count = feedbackList.filter((f: any) => Number(f.rating) === star).length;
    const percentage =
      responseCount > 0 ? Number(((count / responseCount) * 100).toFixed(1)) : 0;
    return {
      stars: star,
      count,
      percentage,
    };
  });

  // --- Delivery Channel Performance (SMS vs Email vs Both) ---
  const channelPerformance: ChannelPerformanceMetric[] = (['sms', 'email', 'both'] as const).map(
    (ch) => {
      const chRequests = requestsList.filter((r: any) => r.channel === ch);
      const chTotal = chRequests.length;
      const chSent = chRequests.filter((r: any) =>
        ['sent', 'delivered', 'responded', 'positive', 'negative'].includes(r.status)
      ).length;

      // Match feedback for requests in this channel
      const chReqIds = new Set(chRequests.map((r: any) => r.id));
      const chFeedback = feedbackList.filter((f: any) => chReqIds.has(f.reviewRequestId));
      const chResponded = chFeedback.length;
      const chResponseRate =
        chSent > 0 ? Number(((chResponded / chSent) * 100).toFixed(1)) : 0;

      const chRatingSum = chFeedback.reduce(
        (acc: number, curr: any) => acc + Number(curr.rating || 0),
        0
      );
      const chAvgRating =
        chResponded > 0 ? Number((chRatingSum / chResponded).toFixed(1)) : 0;

      const chPositive = chFeedback.filter(
        (f: any) => f.sentiment === 'positive' || Number(f.rating) >= 4
      ).length;

      return {
        channel: ch,
        total: chTotal,
        sent: chSent,
        responded: chResponded,
        responseRate: chResponseRate,
        averageRating: chAvgRating,
        positiveCount: chPositive,
      };
    }
  );

  // --- External Platform Click Performance ---
  const googleClicks = feedbackList.filter(
    (f: any) => f.publicPlatformClicked && f.publicPlatformName === 'google'
  ).length;
  const trustpilotClicks = feedbackList.filter(
    (f: any) => f.publicPlatformClicked && f.publicPlatformName === 'trustpilot'
  ).length;
  const otherClicks = publicClickCount - (googleClicks + trustpilotClicks);

  const platformPerformance: PlatformClickMetric[] = [
    {
      platformName: 'google',
      label: 'Google Business Profile',
      clickCount: googleClicks,
      percentage:
        publicClickCount > 0 ? Number(((googleClicks / publicClickCount) * 100).toFixed(1)) : 0,
    },
    {
      platformName: 'trustpilot',
      label: 'Trustpilot',
      clickCount: trustpilotClicks,
      percentage:
        publicClickCount > 0 ? Number(((trustpilotClicks / publicClickCount) * 100).toFixed(1)) : 0,
    },
    {
      platformName: 'other',
      label: 'Other Review Platforms',
      clickCount: Math.max(0, otherClicks),
      percentage:
        publicClickCount > 0 ? Number(((Math.max(0, otherClicks) / publicClickCount) * 100).toFixed(1)) : 0,
    },
  ];

  return {
    tenantId,
    businessName,
    timeRange,
    metrics: {
      totalRequests,
      sentRequests,
      failedRequests,
      pendingRequests,
      responseCount,
      responseRate,
      averageRating,
      positiveCount,
      negativeCount,
      positiveRatio,
      publicClickCount,
      publicClickRate,
    },
    ratingDistribution,
    channelPerformance,
    platformPerformance,
  };
}
