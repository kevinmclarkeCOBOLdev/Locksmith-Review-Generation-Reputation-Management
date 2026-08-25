import { db } from '@/db';
import { securityEvents } from '@/db/schema';
import { DEFAULT_TENANT_ID } from '@/db/constants';
import { generateSecureToken } from '@/lib/crypto';
import { mockSecurityEvents } from '@/db/mock';

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
  TENANT_TAMPER_DETECTED = 'TENANT_TAMPER_DETECTED',
  TOKEN_VALIDATION_FAILED = 'TOKEN_VALIDATION_FAILED',
}

export enum SecurityEventCategory {
  AUTH = 'auth',
  ACCESS_CONTROL = 'access_control',
  CSRF = 'csrf',
  RATE_LIMIT = 'rate_limit',
  INPUT_VALIDATION = 'input_validation',
}

export enum SecurityEventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface SecurityEventData {
  eventType: SecurityEventType | string;
  severity?: SecurityEventSeverity;
  category?: SecurityEventCategory;
  description: string;
  tenantId?: string;
  userId?: string;
  username?: string;
  role?: string;
  ipAddress?: string;
  userAgent?: string;
  url?: string;
  httpMethod?: string;
  httpStatusCode?: number;
  additionalDetails?: Record<string, any>;
}

// In-memory rate limiting tracker (sliding window)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const securityEventService = {
  checkRateLimit(key: string, limit: number = 10, windowMs: number = 60000): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    entry.count += 1;
    return { allowed: true, remaining: limit - entry.count };
  },

  async recordSecurityEvent(event: SecurityEventData): Promise<void> {
    try {
      const eventRecord = {
        id: generateSecureToken(16),
        tenantId: event.tenantId || DEFAULT_TENANT_ID,
        timestamp: new Date(),
        severity: event.severity || SecurityEventSeverity.INFO,
        category: event.category || SecurityEventCategory.AUTH,
        eventType: event.eventType,
        description: event.description,
        userId: event.userId || null,
        username: event.username || null,
        role: event.role || null,
        ipAddress: event.ipAddress || null,
        userAgent: event.userAgent || null,
        url: event.url || null,
        httpMethod: event.httpMethod || null,
        httpStatusCode: event.httpStatusCode || null,
        additionalDetails: event.additionalDetails || null,
      };

      try {
        await db.insert(securityEvents).values(eventRecord);
      } catch (dbErr) {
        mockSecurityEvents.push(eventRecord);
      }
    } catch (err) {
      console.error('[SecurityService] Failed to record security event:', err);
    }
  },
};
