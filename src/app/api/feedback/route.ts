import { NextResponse } from 'next/server';
import { getFeedbackInbox } from '@/services/feedback-inbox.service';
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sentiment = searchParams.get('sentiment') as any;
    const ratingParam = searchParams.get('rating');
    const rating = ratingParam && ratingParam !== 'all' ? parseInt(ratingParam, 10) : 'all';
    const platformClicked = searchParams.get('platformClicked') as any;
    const search = searchParams.get('search') || undefined;

    const result = await getFeedbackInbox(context.tenant.id, {
      page,
      limit,
      sentiment,
      rating,
      platformClicked,
      search,
    });

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API /api/feedback] Error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to fetch feedback inbox data.',
      },
      { status: 500 }
    );
  }
}
