import { NextResponse } from 'next/server';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import type { ApiResponse } from '@/types/api';

export async function GET(req: Request) {
  try {
    const context = await resolveAuthenticatedTenantContext(req);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: {
          id: context.userId,
          email: context.email,
          role: context.role,
        },
        tenant: context.tenant,
      },
    });
  } catch (error: any) {
    const status = error.name === 'ForbiddenError' ? 403 : 401;
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Unauthorized session' },
      { status }
    );
  }
}
