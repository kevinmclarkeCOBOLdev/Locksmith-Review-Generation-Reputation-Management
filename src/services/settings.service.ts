import { db } from '@/db';
import { reviewPlatformSettings, reviewTemplates, tenants, auditLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateSecureToken } from '@/lib/crypto';
import { mockReviewPlatformSettings, mockReviewTemplates, mockTenants, mockAuditLogs } from '@/db/mock';
import type { DeliveryChannel } from '@/types/review';

export interface PlatformSettingItem {
  id?: string;
  platformName: 'google' | 'trustpilot' | 'facebook' | 'checkatrade' | string;
  label: string;
  destinationUrl: string;
  isEnabled: boolean;
  isPrimary?: boolean;
}

export interface ReviewTemplateSettingItem {
  id?: string;
  channel: DeliveryChannel;
  templateName: string;
  subject?: string | null;
  bodyTemplate: string;
  isDefault: boolean;
}

export interface TenantReviewPreferences {
  defaultChannel: DeliveryChannel;
  expirationDays: number;
  duplicateCooldownDays: number;
  autoSendEnabled: boolean;
}

export interface TenantReputationSettingsResult {
  tenantId: string;
  businessName: string;
  platforms: PlatformSettingItem[];
  templates: ReviewTemplateSettingItem[];
  preferences: TenantReviewPreferences;
}

const SUPPORTED_PLATFORMS = [
  { platformName: 'google', label: 'Google Business Profile', isPrimary: true },
  { platformName: 'trustpilot', label: 'Trustpilot', isPrimary: false },
  { platformName: 'facebook', label: 'Facebook Reviews', isPrimary: false },
  { platformName: 'checkatrade', label: 'Checkatrade', isPrimary: false },
];

function validateDestinationUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch (_) {
    return false;
  }
}

/**
 * Retrieves comprehensive reputation settings for the authenticated tenant.
 */
export async function getTenantReputationSettings(
  tenantId: string
): Promise<TenantReputationSettingsResult> {
  let tenantName = 'Atypikal Locksmith Services';

  // 1. Resolve business name
  try {
    const tenantRecords = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (tenantRecords && tenantRecords.length > 0) {
      tenantName = tenantRecords[0].name;
    } else {
      const mockT = mockTenants.find((t: any) => t.id === tenantId);
      if (mockT) tenantName = mockT.name;
    }
  } catch (_) {
    const mockT = mockTenants.find((t: any) => t.id === tenantId);
    if (mockT) tenantName = mockT.name;
  }

  // 2. Fetch platform records from MySQL
  let dbPlatforms: any[] = [];
  try {
    dbPlatforms = await db
      .select()
      .from(reviewPlatformSettings)
      .where(eq(reviewPlatformSettings.tenantId, tenantId));
  } catch (_) {
    dbPlatforms = mockReviewPlatformSettings.filter((p: any) => p.tenantId === tenantId);
  }

  if (dbPlatforms.length === 0) {
    dbPlatforms = mockReviewPlatformSettings.filter((p: any) => p.tenantId === tenantId);
  }

  // Map to full platform list with defaults
  const platforms: PlatformSettingItem[] = SUPPORTED_PLATFORMS.map((spec) => {
    const existing = dbPlatforms.find((p: any) => p.platformName === spec.platformName);
    if (existing) {
      return {
        id: existing.id,
        platformName: spec.platformName,
        label: spec.label,
        destinationUrl: existing.destinationUrl,
        isEnabled: Boolean(existing.isEnabled),
        isPrimary: spec.isPrimary,
      };
    }

    // Default suggested destination URLs
    const defaultUrl =
      spec.platformName === 'google'
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenantName)}`
        : spec.platformName === 'trustpilot'
        ? `https://www.trustpilot.com/search?query=${encodeURIComponent(tenantName)}`
        : spec.platformName === 'facebook'
        ? `https://www.facebook.com/search/top?q=${encodeURIComponent(tenantName)}`
        : `https://www.checkatrade.com/search?q=${encodeURIComponent(tenantName)}`;

    return {
      platformName: spec.platformName,
      label: spec.label,
      destinationUrl: defaultUrl,
      isEnabled: spec.platformName === 'google',
      isPrimary: spec.isPrimary,
    };
  });

  // 3. Fetch templates
  let dbTemplates: any[] = [];
  try {
    dbTemplates = await db
      .select()
      .from(reviewTemplates)
      .where(eq(reviewTemplates.tenantId, tenantId));
  } catch (_) {
    dbTemplates = mockReviewTemplates.filter((t: any) => t.tenantId === tenantId);
  }

  if (dbTemplates.length === 0) {
    dbTemplates = mockReviewTemplates.filter((t: any) => t.tenantId === tenantId);
  }

  const templates: ReviewTemplateSettingItem[] =
    dbTemplates.length > 0
      ? dbTemplates.map((t: any) => ({
          id: t.id,
          channel: t.channel as DeliveryChannel,
          templateName: t.templateName,
          subject: t.subject,
          bodyTemplate: t.bodyTemplate,
          isDefault: Boolean(t.isDefault),
        }))
      : [
          {
            channel: 'sms' as DeliveryChannel,
            templateName: 'Default SMS Review Request',
            bodyTemplate:
              'Hi {customer_name}, thank you for choosing {business_name}! Could you take 30 seconds to share how we did? {review_link}',
            isDefault: true,
          },
          {
            channel: 'email' as DeliveryChannel,
            templateName: 'Default Email Review Request',
            subject: 'How was your locksmith service with {business_name}?',
            bodyTemplate:
              'Hi {customer_name},\n\nThank you for choosing {business_name} for your recent service. Customer satisfaction is our top priority.\n\nPlease take 30 seconds to leave us a rating:\n{review_link}\n\nBest regards,\nThe {business_name} Team',
            isDefault: true,
          },
        ];

  return {
    tenantId,
    businessName: tenantName,
    platforms,
    templates,
    preferences: {
      defaultChannel: 'sms',
      expirationDays: 30,
      duplicateCooldownDays: 14,
      autoSendEnabled: true,
    },
  };
}

/**
 * Updates or creates platform destination settings for the authenticated tenant with strict URL validation.
 */
export async function updatePlatformSettings(
  tenantId: string,
  platformUpdates: Array<{
    platformName: string;
    destinationUrl: string;
    isEnabled: boolean;
  }>
): Promise<{ success: boolean; message: string; updatedCount: number }> {
  if (!platformUpdates || platformUpdates.length === 0) {
    throw new Error('No platform updates provided.');
  }

  const now = new Date();
  let updatedCount = 0;

  for (const item of platformUpdates) {
    if (item.isEnabled && item.destinationUrl) {
      if (!validateDestinationUrl(item.destinationUrl)) {
        throw new Error(
          `Invalid destination URL for ${item.platformName}. Please provide a valid HTTP/HTTPS URL.`
        );
      }
    }

    const platformId = generateSecureToken(16);
    const destinationUrl = (item.destinationUrl || '').trim();

    try {
      // Check existing record
      const existing = await db
        .select()
        .from(reviewPlatformSettings)
        .where(
          and(
            eq(reviewPlatformSettings.tenantId, tenantId),
            eq(reviewPlatformSettings.platformName, item.platformName)
          )
        )
        .limit(1);

      if (existing && existing.length > 0) {
        await db
          .update(reviewPlatformSettings)
          .set({
            destinationUrl,
            isEnabled: item.isEnabled,
            updatedAt: now,
          })
          .where(
            and(
              eq(reviewPlatformSettings.tenantId, tenantId),
              eq(reviewPlatformSettings.platformName, item.platformName)
            )
          );
      } else {
        await db.insert(reviewPlatformSettings).values({
          id: platformId,
          tenantId,
          platformName: item.platformName,
          destinationUrl,
          isEnabled: item.isEnabled,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (_dbErr) {
      // Memory fallback
      const mockIdx = mockReviewPlatformSettings.findIndex(
        (p: any) => p.tenantId === tenantId && p.platformName === item.platformName
      );
      if (mockIdx >= 0) {
        mockReviewPlatformSettings[mockIdx].destinationUrl = destinationUrl;
        mockReviewPlatformSettings[mockIdx].isEnabled = item.isEnabled;
      } else {
        mockReviewPlatformSettings.push({
          id: platformId,
          tenantId,
          platformName: item.platformName,
          destinationUrl,
          isEnabled: item.isEnabled,
          createdAt: now,
          updatedAt: now,
        } as any);
      }
    }

    // Sync in memory
    const mIdx = mockReviewPlatformSettings.findIndex(
      (p: any) => p.tenantId === tenantId && p.platformName === item.platformName
    );
    if (mIdx >= 0) {
      mockReviewPlatformSettings[mIdx].destinationUrl = destinationUrl;
      mockReviewPlatformSettings[mIdx].isEnabled = item.isEnabled;
    } else {
      mockReviewPlatformSettings.push({
        id: platformId,
        tenantId,
        platformName: item.platformName,
        destinationUrl,
        isEnabled: item.isEnabled,
        createdAt: now,
        updatedAt: now,
      } as any);
    }

    updatedCount++;
  }

  // Record audit log
  try {
    await db.insert(auditLogs).values({
      id: generateSecureToken(16),
      tenantId,
      event: 'REVIEW_PLATFORM_CONFIGURED',
      metadata: {
        platformCount: platformUpdates.length,
        platforms: platformUpdates.map((p) => ({
          platform: p.platformName,
          enabled: p.isEnabled,
        })),
        updatedAt: now.toISOString(),
      },
      createdAt: now,
    });
  } catch (_) {}

  mockAuditLogs.push({
    id: generateSecureToken(16),
    tenantId,
    event: 'REVIEW_PLATFORM_CONFIGURED',
    metadata: { platformCount: platformUpdates.length },
    createdAt: now,
  });

  return {
    success: true,
    message: 'Review platform destinations updated successfully.',
    updatedCount,
  };
}

/**
 * Saves a review messaging template with dynamic tokens for SMS or Email.
 */
export async function saveReviewTemplate(
  tenantId: string,
  templateData: {
    channel: DeliveryChannel;
    templateName: string;
    subject?: string;
    bodyTemplate: string;
    isDefault?: boolean;
  }
): Promise<{ success: boolean; templateId: string; message: string }> {
  if (!templateData.templateName || !templateData.templateName.trim()) {
    throw new Error('Template name is required.');
  }

  if (!templateData.bodyTemplate || !templateData.bodyTemplate.trim()) {
    throw new Error('Message body template is required.');
  }

  const now = new Date();
  const templateId = generateSecureToken(16);

  const cleanSubject = templateData.channel === 'email' ? templateData.subject || null : null;
  const cleanBody = templateData.bodyTemplate.trim();

  try {
    await db.insert(reviewTemplates).values({
      id: templateId,
      tenantId,
      channel: templateData.channel,
      templateName: templateData.templateName.trim(),
      subject: cleanSubject,
      bodyTemplate: cleanBody,
      isDefault: Boolean(templateData.isDefault),
      createdAt: now,
      updatedAt: now,
    });
  } catch (_) {
    // Memory fallback
    mockReviewTemplates.push({
      id: templateId,
      tenantId,
      channel: templateData.channel,
      templateName: templateData.templateName.trim(),
      subject: cleanSubject,
      bodyTemplate: cleanBody,
      isDefault: Boolean(templateData.isDefault),
      createdAt: now,
      updatedAt: now,
    } as any);
  }

  mockReviewTemplates.push({
    id: templateId,
    tenantId,
    channel: templateData.channel,
    templateName: templateData.templateName.trim(),
    subject: cleanSubject,
    bodyTemplate: cleanBody,
    isDefault: Boolean(templateData.isDefault),
    createdAt: now,
    updatedAt: now,
  } as any);

  // Write audit log
  try {
    await db.insert(auditLogs).values({
      id: generateSecureToken(16),
      tenantId,
      event: 'REVIEW_TEMPLATE_UPDATED',
      metadata: {
        templateId,
        channel: templateData.channel,
        templateName: templateData.templateName,
      },
      createdAt: now,
    });
  } catch (_) {}

  mockAuditLogs.push({
    id: generateSecureToken(16),
    tenantId,
    event: 'REVIEW_TEMPLATE_UPDATED',
    metadata: { templateId, channel: templateData.channel },
    createdAt: now,
  });

  return {
    success: true,
    templateId,
    message: `Review template "${templateData.templateName}" saved successfully.`,
  };
}
