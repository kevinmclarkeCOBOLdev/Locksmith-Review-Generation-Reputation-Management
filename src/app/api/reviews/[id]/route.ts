import { NextResponse } from 'next/server';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { getReviewRequestById } from '@/services/review.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const context = await resolveAuthenticatedTenantContext(req);
    const requestId = params.id;

    if (!requestId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Review Request ID is required' },
        { status: 400 }
      );
    }

    const item = await getReviewRequestById(context.tenantId, requestId);

    if (!item) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Review request not found or access denied.' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<typeof item>>({
      success: true,
      data: item,
    });
  } catch (error: any) {
    console.error('[API /api/reviews/[id]] Error:', error);
    const status = error.name === 'UnauthorizedError' ? 401 : error.name === 'ForbiddenError' ? 403 : 500;
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to retrieve review request',
      },
      { status }
    );
  }
}
