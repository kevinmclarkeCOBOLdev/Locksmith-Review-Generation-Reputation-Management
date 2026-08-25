import { db } from '../src/db';
import { leads, reviewRequests, tenants, auditLogs } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import {
  evaluateLeadReviewEligibility,
  processCompletedJobAutomations,
  triggerLeadJobCompletionAutomation,
} from '../src/services/automation.service';
import { mockLeads, mockTenants, mockReviewRequests, mockAuditLogs } from '../src/db/mock';
import assert from 'assert';

const TENANT_A = 'test-auto-tenant-a';
const TENANT_B = 'test-auto-tenant-b';

let passedCount = 0;
function pass(message: string) {
  console.log(`✅ PASSED: ${message}`);
  passedCount++;
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('⚡ LOCKREVIEW: PHASE 12 AUTOMATION & POST-JOB TRIGGERS TESTS');
  console.log('=============================================================\n');

  try {
    // 0. Seed test fixtures
    console.log('--- Step 0: Seeding Isolated Test Fixtures ---');
    mockTenants.push(
      {
        id: TENANT_A,
        name: 'Apex Locksmith Solutions',
        businessPhone: '07700900777',
        businessEmail: 'apex@locksmith.test',
        logoUrl: null,
        createdAt: new Date(),
      },
      {
        id: TENANT_B,
        name: 'SafeGuard Locksmiths',
        businessPhone: '07700900888',
        businessEmail: 'safeguard@locksmith.test',
        logoUrl: null,
        createdAt: new Date(),
      }
    );

    const qualifyingLeadId = 'auto-lead-qualifying';
    const incompleteLeadId = 'auto-lead-new-status';
    const noContactLeadId = 'auto-lead-no-contacts';

    mockLeads.push(
      {
        id: qualifyingLeadId,
        tenantId: TENANT_A,
        name: 'Marcus Brody',
        phone: '+447911223344',
        email: 'marcus.brody@example.com',
        postcode: 'NW1 6XE',
        serviceType: 'Lock Replacement',
        propertyType: 'Commercial',
        urgency: 'Standard',
        status: 'completed',
        createdAt: new Date(),
      } as any,
      {
        id: incompleteLeadId,
        tenantId: TENANT_A,
        name: 'Chloe Sullivan',
        phone: '+447911334455',
        email: 'chloe@example.com',
        postcode: 'SW1 1AA',
        serviceType: 'Emergency Lockout',
        propertyType: 'Residential',
        urgency: 'Emergency',
        status: 'quoted', // Not completed
        createdAt: new Date(),
      } as any,
      {
        id: noContactLeadId,
        tenantId: TENANT_A,
        name: 'Anonymous Customer',
        phone: null,
        email: null,
        postcode: 'EC1A 1BB',
        serviceType: 'Key Duplication',
        propertyType: 'Residential',
        urgency: 'Low',
        status: 'completed',
        createdAt: new Date(),
      } as any
    );

    // --- TEST 1: Automated Detection of Completed Leads in Shared MySQL ---
    console.log('\n--- Test 1: Automated Detection of Completed Leads ---');
    const decision1 = await evaluateLeadReviewEligibility(TENANT_A, qualifyingLeadId);
    assert.strictEqual(decision1.isEligible, true, 'Completed lead with valid contacts is eligible');
    assert.strictEqual(decision1.channel, 'both', 'Both SMS and Email channels available');
    assert.strictEqual(decision1.reason, 'QUALIFIED_COMPLETED_JOB', 'Reason indicates qualified job');
    pass('evaluateLeadReviewEligibility detects qualifying completed work in shared MySQL');

    // --- TEST 2: Automatic Review Request Creation & Dispatch ---
    console.log('\n--- Test 2: Automatic Review Request Creation & Dispatch ---');
    const triggerResult = await triggerLeadJobCompletionAutomation(qualifyingLeadId);
    assert.strictEqual(triggerResult.success, true, 'triggerLeadJobCompletionAutomation returns success');
    assert(triggerResult.reviewRequestId !== undefined, 'Review request ID generated');

    const createdReq = mockReviewRequests.find((r: any) => r.id === triggerResult.reviewRequestId);
    assert(createdReq !== undefined, 'Review request record persisted in memory/MySQL');
    assert.strictEqual(createdReq?.tenantId, TENANT_A, 'Review request scoped to correct tenant');
    assert.strictEqual(createdReq?.leadId, qualifyingLeadId, 'Linked to completed lead');
    assert(createdReq?.secureToken.length >= 32, 'Cryptographic secure token assigned');

    const dispatchAudit = mockAuditLogs.find(
      (a: any) => a.tenantId === TENANT_A && a.event === 'AUTOMATION_POST_JOB_DISPATCHED'
    );
    assert(dispatchAudit !== undefined, 'AUTOMATION_POST_JOB_DISPATCHED audit log event written');
    pass('triggerLeadJobCompletionAutomation creates request, assigns secure token, and dispatches notification');

    // --- TEST 3: Duplicate Cooldown & Anti-Fatigue Guard ---
    console.log('\n--- Test 3: Duplicate Cooldown & Anti-Fatigue Guard ---');
    const decisionDuplicate = await evaluateLeadReviewEligibility(TENANT_A, qualifyingLeadId);
    assert.strictEqual(decisionDuplicate.isEligible, false, 'Duplicate lead must be flagged ineligible');
    assert(decisionDuplicate.reason.includes('SKIPPED_DUPLICATE'), 'Reason indicates duplicate skip');

    // Run batch automations to ensure duplicate lead is safely skipped
    const batchResult = await processCompletedJobAutomations(TENANT_A);
    assert.strictEqual(batchResult.success, true, 'Batch automation runs successfully');
    assert(batchResult.totalSkipped >= 1, 'Duplicate lead was safely skipped');
    pass('Anti-fatigue duplicate guard blocks repeat campaigns to recently contacted customers');

    // --- TEST 4: Incomplete Lead Status Rejection ---
    console.log('\n--- Test 4: Incomplete Lead Status Rejection ---');
    const decisionIncomplete = await evaluateLeadReviewEligibility(TENANT_A, incompleteLeadId);
    assert.strictEqual(decisionIncomplete.isEligible, false, 'Non-completed lead is ineligible');
    assert(decisionIncomplete.reason.includes('JOB_NOT_COMPLETED'), 'Reason reflects incomplete status');
    pass('Incomplete lead status (new/quoted/booked) cleanly rejected by automation engine');

    // --- TEST 5: Missing Contact Details Rejection ---
    console.log('\n--- Test 5: Missing Contact Details Rejection ---');
    const decisionNoContact = await evaluateLeadReviewEligibility(TENANT_A, noContactLeadId);
    assert.strictEqual(decisionNoContact.isEligible, false, 'Lead without phone or email is ineligible');
    assert(decisionNoContact.reason.includes('NO_VALID_CONTACT_CHANNEL'), 'Reason reflects missing channel');
    pass('Leads lacking contact information are safely rejected without error');

    // --- TEST 6: Strict Cross-Tenant Automation Safety ---
    console.log('\n--- Test 6: Strict Cross-Tenant Automation Safety ---');
    const batchResultB = await processCompletedJobAutomations(TENANT_B);
    assert.strictEqual(batchResultB.totalDispatched, 0, 'Tenant B has no completed leads, 0 dispatched');
    pass('Post-job automations strictly isolate candidate leads per tenant account');

    // Clean up
    try {
      await db.delete(auditLogs).where(eq(auditLogs.tenantId, TENANT_A));
      await db.delete(auditLogs).where(eq(auditLogs.tenantId, TENANT_B));
      await db.delete(reviewRequests).where(eq(reviewRequests.tenantId, TENANT_A));
      await db.delete(reviewRequests).where(eq(reviewRequests.tenantId, TENANT_B));
      await db.delete(leads).where(eq(leads.tenantId, TENANT_A));
      await db.delete(leads).where(eq(leads.tenantId, TENANT_B));
      await db.delete(tenants).where(eq(tenants.id, TENANT_A));
      await db.delete(tenants).where(eq(tenants.id, TENANT_B));
    } catch (_) {}

    console.log('\n=============================================================');
    console.log(`🎉 ALL PHASE 12 POST-JOB AUTOMATION TESTS PASSED: ${passedCount} / ${passedCount} assertions`);
    console.log('=============================================================\n');
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

runTests();
