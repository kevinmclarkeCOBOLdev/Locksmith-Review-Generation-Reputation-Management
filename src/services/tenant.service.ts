import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/jwt';
import { getTenantById } from '@/db/helpers';
import { DEFAULT_TENANT_ID } from '@/db/constants';
import { securityEventService, SecurityEventType, SecurityEventSeverity, SecurityEventCategory } from './security.service';
import type { TenantContext } from '@/types/auth';

export class UnauthorizedError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Access denied: invalid authorization') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Authoritative Server-Side Single-Tenant Resolution
 * 
 * Pipeline:
 * Extract Session Cookie -> Verify JWT HMAC Signature -> Validate Tenant Existence in Shared DB -> Return Immutable TenantContext
 */
export async function resolveAuthenticatedTenantContext(req?: Request): Promise<TenantContext> {
  let sessionToken: string | undefined;

  // 1. Extract session token from cookie store or request headers
  if (req) {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/session=([^;]+)/);
    if (match) {
      sessionToken = match[1];
    } else {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7);
      }
    }
  }

  if (!sessionToken) {
    try {
      const cookieStore = await cookies();
      sessionToken = cookieStore.get('session')?.value;
    } catch (_) {
      // Running in environment without next/headers context
    }
  }

  if (!sessionToken) {
    throw new UnauthorizedError('No active session token found. Please log in.');
  }

  // 2. Cryptographically verify JWT session
  const session = await verifyJWT(sessionToken);
  if (!session || !session.userId) {
    throw new UnauthorizedError('Invalid or expired session. Please log in again.');
  }

  const tenantId = session.tenantId || DEFAULT_TENANT_ID;

  // 3. Resolve single tenant details from shared MySQL persistence
  const tenant = await getTenantById(tenantId);
  if (!tenant) {
    throw new ForbiddenError(`Tenant account (${tenantId}) could not be resolved.`);
  }

  return {
    userId: session.userId,
    tenantId,
    email: session.email,
    role: session.role || 'admin',
    tenant: {
      id: tenant.id,
      name: tenant.name,
      businessPhone: tenant.businessPhone,
      businessEmail: tenant.businessEmail,
      logoUrl: tenant.logoUrl,
      createdAt: tenant.createdAt,
    },
  };
}

/**
 * Validates that an incoming requested tenant ID matches the single tenant context.
 */
export async function validateTenantScope(
  context: TenantContext,
  requestedTenantId?: string | null,
  ipAddress?: string
): Promise<void> {
  if (!requestedTenantId) return;

  if (context.tenantId !== requestedTenantId) {
    await securityEventService.recordSecurityEvent({
      eventType: SecurityEventType.TENANT_TAMPER_DETECTED,
      severity: SecurityEventSeverity.CRITICAL,
      category: SecurityEventCategory.ACCESS_CONTROL,
      description: `Tenant access mismatch: user (${context.email}) with tenant (${context.tenantId}) requested (${requestedTenantId})`,
      userId: context.userId,
      username: context.email,
      tenantId: context.tenantId,
      ipAddress,
      additionalDetails: {
        authorizedTenantId: context.tenantId,
        attemptedTenantId: requestedTenantId,
      },
    });

    throw new ForbiddenError('Unauthorized: Tenant mismatch in single-tenant deployment.');
  }
}
