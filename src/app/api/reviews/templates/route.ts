import { NextResponse } from 'next/server';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { getReviewTemplates } from '@/services/review.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const context = await resolveAuthenticatedTenantContext(req);
    const { searchParams } = new URL(req.url);

    const channelParam = searchParams.get('channel');
    const channel = channelParam === 'sms' || channelParam === 'email' ? channelParam : undefined;

    const templates = await getReviewTemplates(context.tenantId, channel);

    return NextResponse.json<ApiResponse<typeof templates>>({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    console.error('[API /api/reviews/templates] Error:', error);
    const status = error.name === 'UnauthorizedError' ? 401 : error.name === 'ForbiddenError' ? 403 : 500;
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to fetch review templates',
      },
      { status }
    );
  }
}
