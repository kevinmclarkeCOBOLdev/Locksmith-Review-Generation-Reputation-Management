import { NextResponse } from 'next/server';
import { getReputationAnalytics, type AnalyticsTimeRange } from '@/services/analytics.service';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const context = await resolveAuthenticatedTenantContext(req);
    if (!context || !context.tenant) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized: Session expired or invalid.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const timeRange = (searchParams.get('timeRange') || '30d') as AnalyticsTimeRange;

    const data = await getReputationAnalytics(context.tenant.id, timeRange);

    return NextResponse.json<ApiResponse<typeof data>>({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[API /api/analytics/reputation GET] Error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to calculate reputation analytics.',
      },
      { status: 500 }
    );
  }
}
