import { NextResponse } from 'next/server';
import { validateReviewToken } from '@/services/public-review.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Review token parameter is required.' },
        { status: 400 }
      );
    }

    const viewModel = await validateReviewToken(token);

    return NextResponse.json<ApiResponse<typeof viewModel>>({
      success: viewModel.status === 'valid' || viewModel.status === 'already_responded',
      data: viewModel,
    });
  } catch (error: any) {
    console.error('[API /api/reviews/public/validate] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to validate review token.' },
      { status: 500 }
    );
  }
}
