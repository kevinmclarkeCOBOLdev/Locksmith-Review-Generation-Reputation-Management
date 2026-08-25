import { NextResponse } from 'next/server';
import { z } from 'zod';
import { submitPublicRating } from '@/services/public-review.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

const submitRatingSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = submitRatingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.issues?.[0]?.message || validation.error.message || 'Invalid rating submission.',
        },
        { status: 400 }
      );
    }

    const { token, rating } = validation.data;

    const result = await submitPublicRating(token, rating);

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
      message: result.message,
    });
  } catch (error: any) {
    console.error('[API /api/reviews/public/submit] Error:', error);
    const message = error.message || 'Failed to submit review rating';
    const isClientError =
      message.includes('Rating must be') ||
      message.includes('already received') ||
      message.includes('expired') ||
      message.includes('cancelled') ||
      message.includes('Invalid');

    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: isClientError ? 400 : 500 }
    );
  }
}
