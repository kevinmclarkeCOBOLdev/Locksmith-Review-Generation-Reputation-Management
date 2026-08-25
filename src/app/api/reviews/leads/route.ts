import { NextResponse } from 'next/server';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { getEligibleLeads } from '@/services/review.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const context = await resolveAuthenticatedTenantContext(req);
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getEligibleLeads(context.tenantId, {
      search,
      status,
      page,
      limit,
    });

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API /api/reviews/leads] Error:', error);
    const status = error.name === 'UnauthorizedError' ? 401 : error.name === 'ForbiddenError' ? 403 : 500;
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to fetch eligible leads',
      },
      { status }
    );
  }
}
