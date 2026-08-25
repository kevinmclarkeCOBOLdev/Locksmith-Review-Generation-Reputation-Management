import { NextResponse } from 'next/server';
import { z } from 'zod';
import { trackPublicPlatformClick } from '@/services/public-review.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

const trackClickSchema = z.object({
  token: z.string().min(1, 'Review token is required'),
  platformName: z.string().min(1, 'Platform name is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = trackClickSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.issues?.[0]?.message || validation.error.message || 'Invalid track click payload',
        },
        { status: 400 }
      );
    }

    const { token, platformName } = validation.data;
    const result = await trackPublicPlatformClick(token, platformName);

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
      message: result.message,
    });
  } catch (error: any) {
    console.error('[API /api/reviews/public/track-click] Error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to track platform click',
      },
      { status: 400 }
    );
  }
}
