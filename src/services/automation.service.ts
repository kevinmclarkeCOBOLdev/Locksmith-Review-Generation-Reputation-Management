import { db } from '@/db';
import { leads, tenants, auditLogs } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createReviewRequest, checkDuplicateRequest } from './review.service';
import { dispatchReviewRequest } from './notification.service';
import { generateSecureToken } from '@/lib/crypto';
import { mockLeads, mockTenants, mockAuditLogs } from '@/db/mock';
import type { DeliveryChannel } from '@/types/review';

export interface LeadEligibilityDecision {
  leadId: string;
  tenantId: string;
  customerName: string;
  isEligible: boolean;
  channel?: DeliveryChannel;
  reason: string;
  existingRequestId?: string;
}

export interface AutomationRunResult {
  success: boolean;
  totalInspected: number;
  totalDispatched: number;
  totalSkipped: number;
  totalFailed: number;
  decisions: LeadEligibilityDecision[];
  timestamp: string;
}

/**
 * Evaluates whether a completed customer lead qualifies for an automated review request.
 */
export async function evaluateLeadReviewEligibility(
  tenantId: string,
  leadId: string
): Promise<LeadEligibilityDecision> {
  // 1. Fetch lead from shared MySQL database
  let lead: any = null;
  try {
    const leadRecords = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, leadId), eq(leads.tenantId, tenantId)))
      .limit(1);

    if (leadRecords && leadRecords.length > 0) {
      lead = leadRecords[0];
    } else {
      lead = mockLeads.find((l: any) => l.id === leadId && l.tenantId === tenantId);
    }
  } catch (_) {
    lead = mockLeads.find((l: any) => l.id === leadId && l.tenantId === tenantId);
  }

  if (!lead) {
    return {
      leadId,
      tenantId,
      customerName: 'Unknown',
      isEligible: false,
      reason: 'LEAD_NOT_FOUND',
    };
  }

  const customerName = lead.name || 'Customer';

  // 2. Check Job Status in shared MySQL
  if (lead.status !== 'completed') {
    return {
      leadId,
      tenantId,
      customerName,
      isEligible: false,
      reason: `JOB_NOT_COMPLETED (Current status: ${lead.status})`,
    };
  }

  // 3. Check Contact Channels availability
  const hasPhone = Boolean(lead.phone && lead.phone.trim().length >= 5);
  const hasEmail = Boolean(lead.email && lead.email.trim().includes('@'));

  if (!hasPhone && !hasEmail) {
    return {
      leadId,
      tenantId,
      customerName,
      isEligible: false,
      reason: 'NO_VALID_CONTACT_CHANNEL (Missing both phone and email)',
    };
  }

  const channel: DeliveryChannel =
    hasPhone && hasEmail ? 'both' : hasPhone ? 'sms' : 'email';

  // 4. Duplicate Guard (Anti-Fatigue Policy - Default 14 Days Cooldown)
  const duplicateCheck = await checkDuplicateRequest(tenantId, leadId);
  if (duplicateCheck.isDuplicate) {
    return {
      leadId,
      tenantId,
      customerName,
      isEligible: false,
      channel,
      reason: `SKIPPED_DUPLICATE (${duplicateCheck.message || 'Recently contacted'})`,
      existingRequestId: duplicateCheck.existingRequest?.id,
    };
  }

  return {
    leadId,
    tenantId,
    customerName,
    isEligible: true,
    channel,
    reason: 'QUALIFIED_COMPLETED_JOB',
  };
}

/**
 * Scans for completed jobs/leads across the tenant and dispatches review requests for eligible customers.
 */
export async function processCompletedJobAutomations(
  targetTenantId?: string
): Promise<AutomationRunResult> {
  const now = new Date();
  const decisions: LeadEligibilityDecision[] = [];
  let totalDispatched = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  // 1. Resolve tenants to process
  let tenantIds: string[] = [];
  if (targetTenantId) {
    tenantIds = [targetTenantId];
  } else {
    try {
      const activeTenants = await db.select({ id: tenants.id }).from(tenants);
      tenantIds = activeTenants.map((t: any) => t.id);
    } catch (_) {
      tenantIds = Array.from(new Set(mockTenants.map((t: any) => t.id)));
    }
  }

  // 2. For each tenant, query completed leads
  for (const tenantId of tenantIds) {
    let completedLeads: any[] = [];
    try {
      completedLeads = await db
        .select()
        .from(leads)
        .where(and(eq(leads.tenantId, tenantId), eq(leads.status, 'completed')))
        .orderBy(desc(leads.createdAt))
        .limit(50);

      if (
        completedLeads.length === 0 &&
        mockLeads.some((l: any) => l.tenantId === tenantId && l.status === 'completed')
      ) {
        completedLeads = mockLeads.filter(
          (l: any) => l.tenantId === tenantId && l.status === 'completed'
        );
      }
    } catch (_) {
      completedLeads = mockLeads.filter(
        (l: any) => l.tenantId === tenantId && l.status === 'completed'
      );
    }

    for (const lead of completedLeads) {
      const decision = await evaluateLeadReviewEligibility(tenantId, lead.id);
      decisions.push(decision);

      if (decision.isEligible && decision.channel) {
        try {
          // A. Create review request
          const createdRequest = await createReviewRequest({
            tenantId,
            leadId: lead.id,
            channel: decision.channel,
            allowDuplicate: false,
          });

          // B. Dispatch notification via SMS/Email
          await dispatchReviewRequest({
            reviewRequestId: createdRequest.id,
            tenantId,
          });

          // C. Record structured audit log
          try {
            await db.insert(auditLogs).values({
              id: generateSecureToken(16),
              tenantId,
              event: 'AUTOMATION_POST_JOB_DISPATCHED',
              metadata: {
                leadId: lead.id,
                customerName: decision.customerName,
                channel: decision.channel,
                reviewRequestId: createdRequest.id,
                triggerSource: 'LEAD_STATUS_COMPLETED',
                timestamp: now.toISOString(),
              },
              createdAt: now,
            });
          } catch (_) {}

          mockAuditLogs.push({
            id: generateSecureToken(16),
            tenantId,
            event: 'AUTOMATION_POST_JOB_DISPATCHED',
            metadata: {
              leadId: lead.id,
              reviewRequestId: createdRequest.id,
              channel: decision.channel,
            },
            createdAt: now,
          });

          totalDispatched++;
        } catch (err) {
          console.warn(`[processCompletedJobAutomations] Failed to dispatch for lead ${lead.id}:`, err);
          totalFailed++;
        }
      } else {
        totalSkipped++;
        // Log skipped decision in audit trail
        try {
          await db.insert(auditLogs).values({
            id: generateSecureToken(16),
            tenantId,
            event: 'AUTOMATION_SKIPPED',
            metadata: {
              leadId: lead.id,
              customerName: decision.customerName,
              reason: decision.reason,
              timestamp: now.toISOString(),
            },
            createdAt: now,
          });
        } catch (_) {}

        mockAuditLogs.push({
          id: generateSecureToken(16),
          tenantId,
          event: 'AUTOMATION_SKIPPED',
          metadata: { leadId: lead.id, reason: decision.reason },
          createdAt: now,
        });
      }
    }
  }

  return {
    success: true,
    totalInspected: decisions.length,
    totalDispatched,
    totalSkipped,
    totalFailed,
    decisions,
    timestamp: now.toISOString(),
  };
}

/**
 * Event-driven trigger executed immediately when a single lead reaches 'completed' status.
 */
export async function triggerLeadJobCompletionAutomation(
  leadId: string
): Promise<{ success: boolean; decision: LeadEligibilityDecision; reviewRequestId?: string }> {
  // 1. Resolve lead tenant
  let lead: any = null;
  try {
    const records = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    if (records && records.length > 0) lead = records[0];
    else lead = mockLeads.find((l: any) => l.id === leadId);
  } catch (_) {
    lead = mockLeads.find((l: any) => l.id === leadId);
  }

  if (!lead) {
    throw new Error(`Lead ${leadId} not found in database.`);
  }

  const decision = await evaluateLeadReviewEligibility(lead.tenantId, leadId);

  if (!decision.isEligible || !decision.channel) {
    return {
      success: false,
      decision,
    };
  }

  // Create request and dispatch
  const createdRequest = await createReviewRequest({
    tenantId: lead.tenantId,
    leadId: lead.id,
    channel: decision.channel,
    allowDuplicate: false,
  });

  await dispatchReviewRequest({
    reviewRequestId: createdRequest.id,
    tenantId: lead.tenantId,
  });

  const now = new Date();
  try {
    await db.insert(auditLogs).values({
      id: generateSecureToken(16),
      tenantId: lead.tenantId,
      event: 'AUTOMATION_POST_JOB_DISPATCHED',
      metadata: {
        leadId: lead.id,
        customerName: decision.customerName,
        channel: decision.channel,
        reviewRequestId: createdRequest.id,
        triggerSource: 'LEAD_STATUS_COMPLETED',
        timestamp: now.toISOString(),
      },
      createdAt: now,
    });
  } catch (_) {}

  mockAuditLogs.push({
    id: generateSecureToken(16),
    tenantId: lead.tenantId,
    event: 'AUTOMATION_POST_JOB_DISPATCHED',
    metadata: {
      leadId: lead.id,
      reviewRequestId: createdRequest.id,
      channel: decision.channel,
    },
    createdAt: now,
  });

  return {
    success: true,
    decision,
    reviewRequestId: createdRequest.id,
  };
}
