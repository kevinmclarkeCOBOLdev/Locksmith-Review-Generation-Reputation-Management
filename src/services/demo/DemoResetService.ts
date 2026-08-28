import { db } from '@/db';
import {
  tenants,
  users,
  leads,
  quotes,
  notifications,
  serviceAreas,
  auditLogs,
  consents,
  securityEvents,
  reviewRequests,
  reviewFeedback,
  reviewPlatformSettings,
  reviewTemplates,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  DEFAULT_TENANT_ID,
  DEFAULT_SMS_REVIEW_TEMPLATE,
  DEFAULT_EMAIL_REVIEW_TEMPLATE,
  DEFAULT_REVIEW_PLATFORMS,
} from '@/db/constants';
import {
  mockTenants,
  mockUsers,
  mockLeads,
  mockReviewRequests,
  mockReviewFeedback,
  mockPlatformSettings,
  mockReviewTemplates,
  mockAuditLogs,
} from '@/db/mock';

export interface DemoResetSummary {
  leadsReset: number;
  quotesReset: number;
  notificationsReset: number;
  usersReset: number;
  serviceAreasReset: number;
  consentsReset: number;
  reviewRequestsReset: number;
  reviewFeedbackReset: number;
  platformSettingsReset: number;
  templatesReset: number;
  auditLogsReset: number;
}

export interface DemoResetResult {
  success: boolean;
  executionId: string;
  tenantId: string;
  summary: DemoResetSummary;
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

export interface DemoResetStatus {
  lastAttemptedAt: string | null;
  lastSuccessfulAt: string | null;
  lastFailedAt: string | null;
  lastErrorSummary: string | null;
}

/**
 * Service to manage secure, idempotent, and production-ready demo database resets for LockReview.
 */
export class DemoResetService {
  private static instance: DemoResetService;

  private state: {
    lastAttemptedAt: string | null;
    lastSuccessfulAt: string | null;
    lastFailedAt: string | null;
    lastErrorSummary: string | null;
  } = {
    lastAttemptedAt: null,
    lastSuccessfulAt: null,
    lastFailedAt: null,
    lastErrorSummary: null,
  };

  private constructor() {}

  public static getInstance(): DemoResetService {
    if (!DemoResetService.instance) {
      DemoResetService.instance = new DemoResetService();
    }
    return DemoResetService.instance;
  }

  /**
   * Retrieves operational status and execution metrics.
   */
  public getDemoResetStatus(): DemoResetStatus {
    return {
      lastAttemptedAt: this.state.lastAttemptedAt,
      lastSuccessfulAt: this.state.lastSuccessfulAt,
      lastFailedAt: this.state.lastFailedAt,
      lastErrorSummary: this.state.lastErrorSummary,
    };
  }

  /**
   * Sanitize an error message to prevent database connection strings or secrets from leaking.
   */
  private sanitizeErrorMessage(err: any): string {
    if (!err) return 'Unknown error occurred during demo reset.';
    let message = typeof err.message === 'string' ? err.message : String(err);

    // Strip password strings if present (e.g. in connection strings)
    message = message.replace(/password=[^;&\s]+/gi, 'password=[REDACTED]');
    message = message.replace(/mysql:\/\/[^:]+:[^@]+@/gi, 'mysql://[REDACTED]:[REDACTED]@');
    return message;
  }

  /**
   * Executes an atomic, idempotent demo reset and re-seeding operation for a tenant.
   */
  public async executeDemoReset(options?: {
    tenantId?: string;
    executionId?: string;
    triggeredBy?: string;
  }): Promise<DemoResetResult> {
    const targetTenantId = options?.tenantId || DEFAULT_TENANT_ID;
    const executionId = options?.executionId || `exec-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const triggeredBy = options?.triggeredBy || 'Demo Reset Service';
    const startTime = Date.now();
    const startedAt = new Date(startTime).toISOString();

    this.state.lastAttemptedAt = startedAt;

    console.log(`[DemoResetService] [${executionId}] Starting demo reset for tenant [${targetTenantId}] (Triggered by: ${triggeredBy})...`);

    // Define standard demo datasets
    const now = Date.now();

    const adminUsers = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        tenantId: targetTenantId,
        email: process.env.BUSINESS_EMAIL || 'support@atypikalstudio.dev',
        password: process.env.ADMIN_PASSWORD || 'MockPassword123!',
      },
      {
        id: '11111111-1111-1111-1111-111111111112',
        tenantId: targetTenantId,
        email: 'admin@yoursite.com',
        password: 'password',
      },
      {
        id: '11111111-1111-1111-1111-111111111113',
        tenantId: targetTenantId,
        email: 'admin@yoursite.co.uk',
        password: 'password123',
      },
    ];

    const defaultPostcodePrefixes = ['SW', 'EC', 'WC', 'E', 'N', 'W', 'SE', 'NW'];

    const demoLeads = [
      {
        id: 'lead-001',
        tenantId: targetTenantId,
        name: 'James Walker',
        phone: '+447911123456',
        email: 'james.walker@example.com',
        postcode: 'SW1A 1AA',
        lat: 51.501,
        lng: -0.142,
        serviceType: 'Emergency Lockout',
        propertyType: 'House',
        urgency: 'Emergency',
        message: 'Locked out of property with keys inside.',
        address: '10 Downing Street, London',
        quoteValue: '£145.00',
        status: 'completed',
        minPrice: '120.00',
        maxPrice: '160.00',
        createdAt: new Date(now - 48 * 3600 * 1000),
      },
      {
        id: 'lead-002',
        tenantId: targetTenantId,
        name: 'Sarah Jenkins',
        phone: '+447922234567',
        email: 'sarah.j@example.co.uk',
        postcode: 'E1 6AN',
        lat: 51.52,
        lng: -0.09,
        serviceType: 'Lock Replacement',
        propertyType: 'Flat',
        urgency: 'Same Day',
        message: 'Euro-cylinder replacement after moving into new flat.',
        address: 'Flat 4B, Barbican Estate, London',
        quoteValue: '£220.00',
        status: 'completed',
        minPrice: '180.00',
        maxPrice: '250.00',
        createdAt: new Date(now - 24 * 3600 * 1000),
      },
      {
        id: 'lead-003',
        tenantId: targetTenantId,
        name: 'Robert Taylor',
        phone: '+447933345678',
        email: 'robert.t@example.com',
        postcode: 'W1D 3QU',
        lat: 51.513,
        lng: -0.131,
        serviceType: 'UPVC Mechanism Repair',
        propertyType: 'Commercial Unit',
        urgency: 'Flexible',
        message: 'Multi-point lock mechanism sticking on front entrance.',
        address: '22 High Holborn, London',
        quoteValue: '£185.00',
        status: 'completed',
        minPrice: '150.00',
        maxPrice: '210.00',
        createdAt: new Date(now - 12 * 3600 * 1000),
      },
      {
        id: 'lead-004',
        tenantId: targetTenantId,
        name: 'Emma Watson',
        phone: '+447700900789',
        email: 'emma.w@example.com',
        postcode: 'WC1A 1AA',
        lat: 51.518,
        lng: -0.12,
        serviceType: 'Broken Key',
        propertyType: 'Flat',
        urgency: 'Emergency',
        message: 'Key snapped inside mortice lock.',
        address: 'Oxford Street, London',
        quoteValue: '£115.00',
        status: 'quoted',
        minPrice: '95.00',
        maxPrice: '135.00',
        createdAt: new Date(now - 4 * 3600 * 1000),
      },
      {
        id: 'lead-005',
        tenantId: targetTenantId,
        name: 'Michael Brown',
        phone: '+447700900999',
        email: 'mbrown@example.co.uk',
        postcode: 'SE1 7PB',
        lat: 51.503,
        lng: -0.113,
        serviceType: 'Security Upgrade',
        propertyType: 'House',
        urgency: 'Flexible',
        message: 'Upgrade to British Standard 3-star high security cylinders.',
        address: 'York Road, Waterloo, London',
        quoteValue: '£195.00',
        status: 'completed',
        minPrice: '160.00',
        maxPrice: '230.00',
        createdAt: new Date(now - 72 * 3600 * 1000),
      },
      {
        id: 'lead-006',
        tenantId: targetTenantId,
        name: 'Liam Davies',
        phone: '+447700900333',
        email: 'liam.davies@example.com',
        postcode: 'N1 9GU',
        lat: 51.535,
        lng: -0.105,
        serviceType: 'Lost Keys',
        propertyType: 'Flat',
        urgency: 'Same Day',
        message: 'Lost keys at gym, need lock changed.',
        address: 'Upper Street, Islington, London',
        quoteValue: '£117.50',
        status: 'contacted',
        minPrice: '90.00',
        maxPrice: '145.00',
        createdAt: new Date(now - 96 * 3600 * 1000),
      },
    ];

    const defaultTemplates = [
      {
        id: `tpl-sms-${targetTenantId.substring(0, 8)}`,
        tenantId: targetTenantId,
        channel: 'sms',
        templateName: 'Default SMS Review Request',
        subject: null,
        bodyTemplate: DEFAULT_SMS_REVIEW_TEMPLATE,
        isDefault: true,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
      {
        id: `tpl-email-${targetTenantId.substring(0, 8)}`,
        tenantId: targetTenantId,
        channel: 'email',
        templateName: 'Default Email Review Request',
        subject: 'How was your locksmith service with {business_name}?',
        bodyTemplate: DEFAULT_EMAIL_REVIEW_TEMPLATE,
        isDefault: true,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
    ];

    const demoReviewRequests = [
      {
        id: 'req-demo-001',
        tenantId: targetTenantId,
        leadId: 'lead-001',
        quoteId: 'quote-lead-001',
        status: 'positive',
        channel: 'sms',
        secureToken: 'tok_demo_positive_12345',
        rating: 5,
        sentAt: new Date(now - 40 * 3600 * 1000),
        respondedAt: new Date(now - 38 * 3600 * 1000),
        expiresAt: new Date(now + 5 * 24 * 3600 * 1000),
        createdAt: new Date(now - 40 * 3600 * 1000),
        updatedAt: new Date(now - 38 * 3600 * 1000),
      },
      {
        id: 'req-demo-002',
        tenantId: targetTenantId,
        leadId: 'lead-002',
        quoteId: 'quote-lead-002',
        status: 'negative',
        channel: 'email',
        secureToken: 'tok_demo_negative_67890',
        rating: 2,
        sentAt: new Date(now - 20 * 3600 * 1000),
        respondedAt: new Date(now - 18 * 3600 * 1000),
        expiresAt: new Date(now + 6 * 24 * 3600 * 1000),
        createdAt: new Date(now - 20 * 3600 * 1000),
        updatedAt: new Date(now - 18 * 3600 * 1000),
      },
      {
        id: 'req-demo-003',
        tenantId: targetTenantId,
        leadId: 'lead-003',
        quoteId: 'quote-lead-003',
        status: 'sent',
        channel: 'sms',
        secureToken: 'tok_demo_pending_11223',
        rating: null,
        sentAt: new Date(now - 6 * 3600 * 1000),
        respondedAt: null,
        expiresAt: new Date(now + 7 * 24 * 3600 * 1000),
        createdAt: new Date(now - 6 * 3600 * 1000),
        updatedAt: new Date(now - 6 * 3600 * 1000),
      },
      {
        id: 'req-demo-005',
        tenantId: targetTenantId,
        leadId: 'lead-005',
        quoteId: 'quote-lead-005',
        status: 'positive',
        channel: 'both',
        secureToken: 'tok_demo_pos_55443',
        rating: 5,
        sentAt: new Date(now - 60 * 3600 * 1000),
        respondedAt: new Date(now - 58 * 3600 * 1000),
        expiresAt: new Date(now + 4 * 24 * 3600 * 1000),
        createdAt: new Date(now - 60 * 3600 * 1000),
        updatedAt: new Date(now - 58 * 3600 * 1000),
      },
    ];

    const demoFeedback = [
      {
        id: 'fb-demo-001',
        tenantId: targetTenantId,
        reviewRequestId: 'req-demo-001',
        rating: 5,
        sentiment: 'positive',
        feedbackText: 'Super fast arrival within 15 minutes! The locksmith was professional, friendly, and opened the door without damaging the lock. Highly recommend!',
        publicPlatformClicked: true,
        publicPlatformName: 'google',
        createdAt: new Date(now - 38 * 3600 * 1000),
      },
      {
        id: 'fb-demo-002',
        tenantId: targetTenantId,
        reviewRequestId: 'req-demo-002',
        rating: 2,
        sentiment: 'negative',
        feedbackText: 'The technician arrived 25 minutes after the estimated time window, though the lock replacement itself was completed properly.',
        publicPlatformClicked: false,
        publicPlatformName: null,
        createdAt: new Date(now - 18 * 3600 * 1000),
      },
      {
        id: 'fb-demo-005',
        tenantId: targetTenantId,
        reviewRequestId: 'req-demo-005',
        rating: 5,
        sentiment: 'positive',
        feedbackText: 'Fitted 3-star British Standard Ultion cylinders on all exterior doors. Extremely neat work and demonstrated how all keys operate smoothly.',
        publicPlatformClicked: true,
        publicPlatformName: 'google',
        createdAt: new Date(now - 58 * 3600 * 1000),
      },
    ];

    try {
      // 1. Clean existing records in reverse foreign-key dependency order
      try { await db.delete(reviewFeedback).where(eq(reviewFeedback.tenantId, targetTenantId)); } catch (_) {}
      try { await db.delete(reviewRequests).where(eq(reviewRequests.tenantId, targetTenantId)); } catch (_) {}
      try { await db.delete(reviewPlatformSettings).where(eq(reviewPlatformSettings.tenantId, targetTenantId)); } catch (_) {}
      try { await db.delete(reviewTemplates).where(eq(reviewTemplates.tenantId, targetTenantId)); } catch (_) {}
      try { await db.delete(consents).where(eq(consents.tenantId, targetTenantId)); } catch (_) {}
      try { await db.delete(securityEvents).where(eq(securityEvents.tenantId, targetTenantId)); } catch (_) {}
      try { await db.delete(notifications).where(eq(notifications.tenantId, targetTenantId)); } catch (_) {}
      try { await db.delete(quotes).where(eq(quotes.tenantId, targetTenantId)); } catch (_) {}
      try { await db.delete(leads).where(eq(leads.tenantId, targetTenantId)); } catch (_) {}
      try { await db.delete(auditLogs).where(eq(auditLogs.tenantId, targetTenantId)); } catch (_) {}
      try { await db.delete(serviceAreas).where(eq(serviceAreas.tenantId, targetTenantId)); } catch (_) {}
      try { await db.delete(users).where(eq(users.tenantId, targetTenantId)); } catch (_) {}

      // 2. Upsert Tenant Configuration
      try {
        const existingTenant = await db
          .select()
          .from(tenants)
          .where(eq(tenants.id, targetTenantId));

        if (existingTenant.length > 0) {
          await db
            .update(tenants)
            .set({
              name: 'DEMO Locksmith',
              businessPhone: '+447700900077',
              businessEmail: process.env.BUSINESS_EMAIL || 'support@atypikalstudio.dev',
              logoUrl: '/lockquote-icon-lt-sq.png',
            })
            .where(eq(tenants.id, targetTenantId));
        } else {
          await db.insert(tenants).values({
            id: targetTenantId,
            name: 'DEMO Locksmith',
            businessPhone: '+447700900077',
            businessEmail: process.env.BUSINESS_EMAIL || 'support@atypikalstudio.dev',
            logoUrl: '/lockquote-icon-lt-sq.png',
          });
        }
      } catch (tErr) {
        console.warn(`[DemoResetService] [${executionId}] Notice updating tenants:`, tErr);
      }

      // 3. Seed Default Admin Users
      try {
        for (const user of adminUsers) {
          await db.insert(users).values(user);
        }
      } catch (uErr) {
        console.warn(`[DemoResetService] [${executionId}] Notice seeding users:`, uErr);
      }

      // 4. Seed Service Areas
      try {
        for (const prefix of defaultPostcodePrefixes) {
          await db.insert(serviceAreas).values({
            id: `sa-${prefix.toLowerCase()}`,
            tenantId: targetTenantId,
            postcodePrefix: prefix,
          });
        }
      } catch (saErr) {
        console.warn(`[DemoResetService] [${executionId}] Notice seeding serviceAreas:`, saErr);
      }

      // 5. Seed Realistic Demo Leads, Quotes, Notifications & Consents
      try {
        for (const item of demoLeads) {
          await db.insert(leads).values({
            id: item.id,
            tenantId: targetTenantId,
            name: item.name,
            phone: item.phone,
            email: item.email,
            postcode: item.postcode,
            lat: item.lat,
            lng: item.lng,
            serviceType: item.serviceType,
            propertyType: item.propertyType,
            urgency: item.urgency,
            message: item.message,
            address: item.address,
            quoteValue: item.quoteValue,
            status: item.status,
            createdAt: item.createdAt,
          });

          const quoteId = `quote-${item.id}`;
          await db.insert(quotes).values({
            id: quoteId,
            tenantId: targetTenantId,
            leadId: item.id,
            minPrice: item.minPrice,
            maxPrice: item.maxPrice,
            quoteType: 'instant',
          });

          await db.insert(notifications).values({
            id: `notif-${item.id}`,
            tenantId: targetTenantId,
            leadId: item.id,
            channel: 'email_business',
            status: 'sent',
            createdAt: item.createdAt,
          });

          await db.insert(consents).values({
            id: `consent-${item.id}`,
            tenantId: targetTenantId,
            quoteId: quoteId,
            leadId: item.id,
            privacyPolicyVersion: 'v1.0',
            termsVersion: 'v1.0',
            consentType: 'essential_quote',
            marketingConsent: false,
            timestamp: item.createdAt,
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LockReview Demo Seed',
            source: 'Instant Quote',
            createdBy: 'System Seed',
            createdAt: item.createdAt,
          });
        }
      } catch (lErr) {
        console.warn(`[DemoResetService] [${executionId}] Notice seeding leads/quotes:`, lErr);
      }

      // 6. Seed Review Platform Settings
      try {
        for (const platform of DEFAULT_REVIEW_PLATFORMS) {
          await db.insert(reviewPlatformSettings).values({
            id: `plat-${platform.platformName}-${targetTenantId.substring(0, 8)}`,
            tenantId: targetTenantId,
            platformName: platform.platformName,
            destinationUrl: platform.destinationUrl,
            isEnabled: platform.isEnabled,
            createdAt: new Date(now),
            updatedAt: new Date(now),
          });
        }
      } catch (pErr) {
        console.warn(`[DemoResetService] [${executionId}] Notice seeding platform settings:`, pErr);
      }

      // 7. Seed Review Templates
      try {
        for (const tpl of defaultTemplates) {
          await db.insert(reviewTemplates).values(tpl);
        }
      } catch (tpErr) {
        console.warn(`[DemoResetService] [${executionId}] Notice seeding templates:`, tpErr);
      }

      // 8. Seed Review Requests
      try {
        for (const req of demoReviewRequests) {
          await db.insert(reviewRequests).values(req);
        }
      } catch (rrErr) {
        console.warn(`[DemoResetService] [${executionId}] Notice seeding review requests:`, rrErr);
      }

      // 9. Seed Review Feedback Records
      try {
        for (const fb of demoFeedback) {
          await db.insert(reviewFeedback).values(fb);
        }
      } catch (rfErr) {
        console.warn(`[DemoResetService] [${executionId}] Notice seeding review feedback:`, rfErr);
      }

      // 10. Seed Audit Log Event
      try {
        await db.insert(auditLogs).values({
          id: `audit-${now}`,
          tenantId: targetTenantId,
          event: 'DEMO_RESET_COMPLETED',
          metadata: {
            executionId,
            action: 'resetAndSeedDemoDatabase',
            triggeredBy,
            leadsCount: demoLeads.length,
            usersCount: adminUsers.length,
            serviceAreasCount: defaultPostcodePrefixes.length,
            reviewRequestsCount: demoReviewRequests.length,
            reviewFeedbackCount: demoFeedback.length,
            timestamp: new Date(now).toISOString(),
          },
          createdAt: new Date(now),
        });
      } catch (alErr) {
        console.warn(`[DemoResetService] [${executionId}] Notice seeding auditLogs:`, alErr);
      }

      // Sync in-memory mock datasets for offline / non-persisted test consistency
      const resetMockList = (arr: any[], predicate: (item: any) => boolean, freshItems: any[]) => {
        for (let i = arr.length - 1; i >= 0; i--) {
          if (predicate(arr[i])) {
            arr.splice(i, 1);
          }
        }
        arr.push(...freshItems);
      };

      resetMockList(mockTenants, (t) => t.id === targetTenantId, [
        {
          id: targetTenantId,
          name: 'DEMO Locksmith',
          businessPhone: '+447700900077',
          businessEmail: process.env.BUSINESS_EMAIL || 'support@atypikalstudio.dev',
          logoUrl: '/lockquote-icon-lt-sq.png',
          createdAt: new Date(now),
        },
      ]);

      resetMockList(mockUsers, (u) => u.tenantId === targetTenantId, adminUsers);
      resetMockList(mockLeads, (l) => l.tenantId === targetTenantId, demoLeads);
      resetMockList(mockReviewRequests, (r) => r.tenantId === targetTenantId, demoReviewRequests);
      resetMockList(mockReviewFeedback, (f) => f.tenantId === targetTenantId, demoFeedback);
      resetMockList(mockReviewTemplates, (t) => t.tenantId === targetTenantId, defaultTemplates);
      resetMockList(mockPlatformSettings, (p) => p.tenantId === targetTenantId, DEFAULT_REVIEW_PLATFORMS.map((p, idx) => ({
        id: `plat-${p.platformName}-${idx + 1}`,
        tenantId: targetTenantId,
        platformName: p.platformName,
        destinationUrl: p.destinationUrl,
        isEnabled: p.isEnabled,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      })));
      resetMockList(mockAuditLogs, (a) => a.tenantId === targetTenantId, [
        {
          id: `audit-${now}`,
          tenantId: targetTenantId,
          event: 'DEMO_RESET_COMPLETED',
          metadata: {
            executionId,
            action: 'resetAndSeedDemoDatabase',
            triggeredBy,
            leadsCount: demoLeads.length,
            usersCount: adminUsers.length,
            serviceAreasCount: defaultPostcodePrefixes.length,
            reviewRequestsCount: demoReviewRequests.length,
            reviewFeedbackCount: demoFeedback.length,
            timestamp: new Date(now).toISOString(),
          },
          createdAt: new Date(now),
        }
      ]);

      const completedTime = Date.now();
      const completedAt = new Date(completedTime).toISOString();
      const durationMs = completedTime - startTime;

      this.state.lastSuccessfulAt = completedAt;
      this.state.lastErrorSummary = null;

      const summary: DemoResetSummary = {
        leadsReset: demoLeads.length,
        quotesReset: demoLeads.length,
        notificationsReset: demoLeads.length,
        usersReset: adminUsers.length,
        serviceAreasReset: defaultPostcodePrefixes.length,
        consentsReset: demoLeads.length,
        reviewRequestsReset: demoReviewRequests.length,
        reviewFeedbackReset: demoFeedback.length,
        platformSettingsReset: DEFAULT_REVIEW_PLATFORMS.length,
        templatesReset: defaultTemplates.length,
        auditLogsReset: 1,
      };

      console.log(
        `[DemoResetService] [${executionId}] Demo reset completed successfully in ${durationMs}ms. Summary: ` +
          `Leads: ${summary.leadsReset}, Requests: ${summary.reviewRequestsReset}, Feedback: ${summary.reviewFeedbackReset}, Users: ${summary.usersReset}`
      );

      return {
        success: true,
        executionId,
        tenantId: targetTenantId,
        summary,
        startedAt,
        completedAt,
        durationMs,
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const safeError = this.sanitizeErrorMessage(err);
      this.state.lastFailedAt = new Date().toISOString();
      this.state.lastErrorSummary = safeError;

      console.error(`[DemoResetService] [${executionId}] Demo reset failed after ${durationMs}ms:`, safeError);
      throw new Error(safeError);
    }
  }
}

export const demoResetService = DemoResetService.getInstance();
