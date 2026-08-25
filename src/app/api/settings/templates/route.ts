import { NextResponse } from 'next/server';
import { z } from 'zod';
import { saveReviewTemplate, getTenantReputationSettings } from '@/services/settings.service';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

const saveTemplateSchema = z.object({
  channel: z.enum(['sms', 'email']),
  templateName: z.string().min(1, 'Template name is required').max(100),
  subject: z.string().max(255).optional(),
  bodyTemplate: z.string().min(1, 'Body template is required').max(2000),
  isDefault: z.boolean().optional().default(false),
});

export async function GET(req: Request) {
  try {
    const context = await resolveAuthenticatedTenantContext(req);
    if (!context || !context.tenant) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized: Session invalid or expired.' },
        { status: 401 }
      );
    }

    const settings = await getTenantReputationSettings(context.tenant.id);

    return NextResponse.json<ApiResponse<typeof settings.templates>>({
      success: true,
      data: settings.templates,
    });
  } catch (error: any) {
    console.error('[API /api/settings/templates GET] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to retrieve templates.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveAuthenticatedTenantContext(req);
    if (!context || !context.tenant) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized: Session invalid or expired.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = saveTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.issues?.[0]?.message || validation.error.message || 'Invalid template payload',
        },
        { status: 400 }
      );
    }

    const result = await saveReviewTemplate(context.tenant.id, validation.data);

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
      message: result.message,
    });
  } catch (error: any) {
    console.error('[API /api/settings/templates POST] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to save review template.' },
      { status: 400 }
    );
  }
}
