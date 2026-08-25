import { NextResponse } from 'next/server';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { renderTemplatePreview } from '@/services/review.service';
import { z } from 'zod';
import type { ApiResponse } from '@/types/api';

const previewSchema = z.object({
  templateBody: z.string().min(1, 'Template body is required'),
  subject: z.string().optional().nullable(),
  customerName: z.string().optional().default('James Walker'),
  businessName: z.string().optional().default('DEMO Locksmith'),
  reviewLink: z.string().optional().default('https://lockreview.atypikalstudio.dev/review/demo-preview-token'),
});

export async function POST(req: Request) {
  try {
    const context = await resolveAuthenticatedTenantContext(req);
    const body = await req.json();

    const validation = previewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.issues?.[0]?.message || validation.error.message || 'Invalid preview parameters',
        },
        { status: 400 }
      );
    }

    const { templateBody, subject, customerName, reviewLink } = validation.data;
    const businessName = context.tenant.name || validation.data.businessName;

    const rendered = renderTemplatePreview({
      templateBody,
      subject,
      customerName,
      businessName,
      reviewLink,
    });

    return NextResponse.json<ApiResponse<typeof rendered>>({
      success: true,
      data: rendered,
    });
  } catch (error: any) {
    console.error('[API /api/reviews/preview] Error:', error);
    const status = error.name === 'UnauthorizedError' ? 401 : error.name === 'ForbiddenError' ? 403 : 500;
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to render template preview',
      },
      { status }
    );
  }
}
