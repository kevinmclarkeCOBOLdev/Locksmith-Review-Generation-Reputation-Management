import { NextResponse } from 'next/server';
import { getPublicPlatformDestinations } from '@/services/public-review.service';
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

    const destinations = await getPublicPlatformDestinations(token);

    return NextResponse.json<ApiResponse<typeof destinations>>({
      success: true,
      data: destinations,
    });
  } catch (error: any) {
    console.error('[API /api/reviews/public/platforms] Error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to fetch review platforms',
      },
      { status: 400 }
    );
  }
}
