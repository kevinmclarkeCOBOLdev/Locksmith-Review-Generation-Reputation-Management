import { NextResponse } from 'next/server';
import { resolveAuthenticatedTenantContext, validateTenantScope } from '@/services/tenant.service';
import type { ApiResponse } from '@/types/api';

/**
 * Security Verification Endpoint: Tests Server-Side Tenant Scoping and Rejection of Manipulated Business Identifiers
 */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
    
    // 1. Resolve authoritative tenant context
    const context = await resolveAuthenticatedTenantContext(req);

    // 2. Extract client payload (may contain simulated attacker tenant_id)
    const body = await req.json().catch(() => ({}));
    const requestedTenantId = body.tenantId || body.businessId;

    // 3. Strict Server-Side Validation: Ensure client cannot spoof another tenant
    if (requestedTenantId) {
      await validateTenantScope(context, requestedTenantId, ip);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Tenant authorization verified successfully',
      data: {
        authorizedTenantId: context.tenantId,
        authorizedUser: context.email,
        businessName: context.tenant.name,
      },
    });
  } catch (error: any) {
    const status = error.name === 'ForbiddenError' ? 403 : error.name === 'UnauthorizedError' ? 401 : 500;
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Tenant verification failed' },
      { status }
    );
  }
}
