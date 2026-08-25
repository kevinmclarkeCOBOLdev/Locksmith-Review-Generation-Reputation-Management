import { NextResponse } from 'next/server';
import { getFeedbackDetail } from '@/services/feedback-inbox.service';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const context = await resolveAuthenticatedTenantContext(req);
    if (!context || !context.tenant) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized: Session expired or invalid.' },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Feedback ID is required.' },
        { status: 400 }
      );
    }

    const item = await getFeedbackDetail(context.tenant.id, id);

    if (!item) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Feedback item not found or unauthorized.' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<typeof item>>({
      success: true,
      data: item,
    });
  } catch (error: any) {
    console.error('[API /api/feedback/[id]] Error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to fetch feedback detail.',
      },
      { status: 500 }
    );
  }
}
