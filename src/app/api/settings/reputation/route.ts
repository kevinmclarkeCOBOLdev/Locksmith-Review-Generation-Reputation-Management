import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getTenantReputationSettings, updatePlatformSettings } from '@/services/settings.service';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

const updatePlatformsSchema = z.object({
  platforms: z.array(
    z.object({
      platformName: z.string().min(1),
      destinationUrl: z.string().url('Please provide a valid URL'),
      isEnabled: z.boolean(),
    })
  ).min(1, 'At least one platform configuration required'),
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

    return NextResponse.json<ApiResponse<typeof settings>>({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('[API /api/settings/reputation GET] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to retrieve reputation settings.' },
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
    const validation = updatePlatformsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.issues?.[0]?.message || validation.error.message || 'Invalid platform payload',
        },
        { status: 400 }
      );
    }

    const result = await updatePlatformSettings(context.tenant.id, validation.data.platforms);

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
      message: result.message,
    });
  } catch (error: any) {
    console.error('[API /api/settings/reputation POST] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to update platform settings.' },
      { status: 400 }
    );
  }
}
