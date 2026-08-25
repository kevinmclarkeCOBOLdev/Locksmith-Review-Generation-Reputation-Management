import { NextResponse } from 'next/server';
import { z } from 'zod';
import { submitPrivateFeedback } from '@/services/public-review.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

const feedbackSchema = z.object({
  token: z.string().min(1, 'Review token is required'),
  feedbackText: z.string().min(1, 'Please provide feedback comments').max(2000, 'Feedback is too long'),
  requestContact: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = feedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.issues?.[0]?.message || validation.error.message || 'Invalid feedback payload',
        },
        { status: 400 }
      );
    }

    const { token, feedbackText, requestContact } = validation.data;
    const result = await submitPrivateFeedback(token, feedbackText, requestContact);

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
      message: result.message,
    });
  } catch (error: any) {
    console.error('[API /api/reviews/public/feedback] Error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to submit private feedback',
      },
      { status: 400 }
    );
  }
}
