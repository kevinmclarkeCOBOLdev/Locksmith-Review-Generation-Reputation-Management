import { NextResponse } from 'next/server';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { securityEventService, SecurityEventType, SecurityEventCategory, SecurityEventSeverity } from '@/services/security.service';
import type { ApiResponse } from '@/types/api';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    try {
      const context = await resolveAuthenticatedTenantContext(req);
      await securityEventService.recordSecurityEvent({
        eventType: SecurityEventType.LOGOUT,
        severity: SecurityEventSeverity.INFO,
        category: SecurityEventCategory.AUTH,
        description: `User ${context.email} signed out from LockReview`,
        userId: context.userId,
        username: context.email,
        tenantId: context.tenantId,
        ipAddress: ip,
        userAgent,
        url: '/api/auth/logout',
        httpMethod: 'POST',
        httpStatusCode: 200,
      });
    } catch (_) {
      // Ignored if session is already missing or invalid
    }

    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Signed out successfully',
    });

    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[API /api/auth/logout] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to logout' },
      { status: 500 }
    );
  }
}
