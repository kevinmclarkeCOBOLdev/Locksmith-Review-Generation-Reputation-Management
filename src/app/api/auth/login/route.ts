import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateUserCredentials, signJWT } from '@/services/auth.service';
import { securityEventService, SecurityEventType, SecurityEventCategory, SecurityEventSeverity } from '@/services/security.service';
import { getTenantById } from '@/db/helpers';
import type { ApiResponse } from '@/types/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // 1. Rate Limiting Check (10 attempts per minute per IP)
    const rateLimit = securityEventService.checkRateLimit(`login-ip-${ip}`, 10, 60000);
    if (!rateLimit.allowed) {
      await securityEventService.recordSecurityEvent({
        eventType: SecurityEventType.RATE_LIMIT_EXCEEDED,
        severity: SecurityEventSeverity.ERROR,
        category: SecurityEventCategory.RATE_LIMIT,
        description: `Login rate limit exceeded for IP ${ip}`,
        ipAddress: ip,
        userAgent,
        url: '/api/auth/login',
        httpMethod: 'POST',
        httpStatusCode: 429,
      });

      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Too many login attempts. Please try again in 1 minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    // 2. Validate credentials against shared MySQL users & tenant
    const user = await validateUserCredentials(email, password);

    if (!user) {
      await securityEventService.recordSecurityEvent({
        eventType: SecurityEventType.LOGIN_FAILED,
        severity: SecurityEventSeverity.WARNING,
        category: SecurityEventCategory.AUTH,
        description: `Failed login attempt for account ${email}`,
        username: email,
        ipAddress: ip,
        userAgent,
        url: '/api/auth/login',
        httpMethod: 'POST',
        httpStatusCode: 401,
      });

      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 3. Resolve tenant details
    const tenant = await getTenantById(user.tenantId);

    // 4. Sign JWT session token
    const token = await signJWT({
      id: user.id,
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role || 'admin',
    });

    // 5. Record successful login audit event
    await securityEventService.recordSecurityEvent({
      eventType: SecurityEventType.LOGIN_SUCCESS,
      severity: SecurityEventSeverity.INFO,
      category: SecurityEventCategory.AUTH,
      description: `User ${email} logged into LockReview successfully`,
      userId: user.id,
      username: email,
      tenantId: user.tenantId,
      ipAddress: ip,
      userAgent,
      url: '/api/auth/login',
      httpMethod: 'POST',
      httpStatusCode: 200,
    });

    // 6. Return response with HTTP-only cookie
    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role || 'admin',
        },
        tenant: tenant ? { id: tenant.id, name: tenant.name } : null,
      },
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[API /api/auth/login] Error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
