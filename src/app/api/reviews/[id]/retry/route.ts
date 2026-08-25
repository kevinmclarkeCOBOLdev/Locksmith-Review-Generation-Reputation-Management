import { NextResponse } from 'next/server';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { retryReviewRequestDelivery } from '@/services/notification.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function POST(
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

    const result = await retryReviewRequestDelivery(context.tenantId, requestId);

    return NextResponse.json<ApiResponse<typeof result>>({
      success: result.success,
      data: result,
      message: result.success
        ? 'Review request redelivered successfully.'
        : `Retry incomplete: ${result.error}`,
    });
  } catch (error: any) {
    console.error('[API /api/reviews/[id]/retry] Error:', error);
    const status = error.name === 'UnauthorizedError' ? 401 : error.name === 'ForbiddenError' ? 403 : 500;
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to retry review request',
      },
      { status }
    );
  }
}
