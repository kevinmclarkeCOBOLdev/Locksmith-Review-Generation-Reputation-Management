import { NextResponse } from 'next/server';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { getDashboardOverviewData } from '@/services/dashboard.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const context = await resolveAuthenticatedTenantContext(req);
    const data = await getDashboardOverviewData(context.tenantId);

    return NextResponse.json<ApiResponse<typeof data>>({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[API /api/dashboard/overview] Error:', error);
    const status = error.name === 'UnauthorizedError' ? 401 : error.name === 'ForbiddenError' ? 403 : 500;
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to fetch dashboard metrics',
      },
      { status }
    );
  }
}
