import { NextResponse } from 'next/server';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { getReviewRequests, createReviewRequest } from '@/services/review.service';
import { z } from 'zod';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

const createReviewRequestSchema = z.object({
  leadId: z.string().min(1, 'Customer/Lead ID is required'),
  quoteId: z.string().optional().nullable(),
  channel: z.enum(['sms', 'email', 'both']),
  templateId: z.string().optional().nullable(),
  customMessage: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  allowDuplicate: z.boolean().optional().default(false),
  expirationDays: z.number().int().positive().optional().default(30),
});

export async function GET(req: Request) {
  try {
    const context = await resolveAuthenticatedTenantContext(req);
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const channel = searchParams.get('channel') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getReviewRequests(context.tenantId, {
      search,
      status,
      channel,
      page,
      limit,
    });

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API /api/reviews GET] Error:', error);
    const status = error.name === 'UnauthorizedError' ? 401 : error.name === 'ForbiddenError' ? 403 : 500;
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to fetch review requests',
      },
      { status }
    );
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveAuthenticatedTenantContext(req);
    const body = await req.json();

    const validation = createReviewRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.issues?.[0]?.message || validation.error.message || 'Invalid review request payload',
        },
        { status: 400 }
      );
    }

    const { leadId, quoteId, channel, templateId, customMessage, scheduledAt, allowDuplicate, expirationDays } =
      validation.data;

    const requestItem = await createReviewRequest({
      tenantId: context.tenantId,
      leadId,
      quoteId,
      channel,
      templateId,
      customMessage,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      allowDuplicate,
      expirationDays,
      autoDispatch: true,
    });

    return NextResponse.json<ApiResponse<typeof requestItem>>(
      {
        success: true,
        data: requestItem,
        message: 'Review request created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API /api/reviews POST] Error:', error);

    if (error.code === 'DUPLICATE_REQUEST_DETECTED') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
          data: {
            code: 'DUPLICATE_REQUEST_DETECTED',
            existingRequest: error.existingRequest,
          },
        },
        { status: 409 }
      );
    }

    const status = error.name === 'UnauthorizedError' ? 401 : error.name === 'ForbiddenError' ? 403 : 400;
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to create review request',
      },
      { status }
    );
  }
}
