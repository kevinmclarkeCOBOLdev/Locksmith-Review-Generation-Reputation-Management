import { NextResponse } from 'next/server';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { getNotificationHealth } from '@/services/notification.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await resolveAuthenticatedTenantContext(req);
    const health = await getNotificationHealth();

    return NextResponse.json<ApiResponse<typeof health>>({
      success: true,
      data: health,
    });
  } catch (error: any) {
    console.error('[API /api/notifications/health] Error:', error);
    const status = error.name === 'UnauthorizedError' ? 401 : error.name === 'ForbiddenError' ? 403 : 500;
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to check notification health',
      },
      { status }
    );
  }
}
