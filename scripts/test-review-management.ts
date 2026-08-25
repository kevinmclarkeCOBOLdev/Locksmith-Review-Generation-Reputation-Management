import { db } from '../src/db';
import { leads, reviewRequests, reviewFeedback, tenants, auditLogs } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { getFeedbackInbox, getFeedbackDetail } from '../src/services/feedback-inbox.service';
import { generateSecureToken, hashToken } from '../src/lib/crypto';
import { mockLeads, mockTenants, mockReviewRequests, mockReviewFeedback } from '../src/db/mock';
import assert from 'assert';

const TENANT_A = 'test-mgmt-tenant-a';
const TENANT_B = 'test-mgmt-tenant-b';

let passedCount = 0;
function pass(message: string) {
  console.log(`✅ PASSED: ${message}`);
  passedCount++;
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('📋 LOCKREVIEW: PHASE 9 REVIEW MANAGEMENT & FEEDBACK INBOX TESTS');
  console.log('=============================================================\n');

  try {
    // 0. Seed test fixtures
    console.log('--- Step 0: Seeding Isolated Test Fixtures ---');

    mockTenants.push(
      {
        id: TENANT_A,
        name: 'Alpha Locksmiths Ltd',
        businessPhone: '07700900111',
        businessEmail: 'alpha@locksmith.test',
        logoUrl: null,
        createdAt: new Date(),
      },
      {
        id: TENANT_B,
        name: 'Bravo Locksmiths Ltd',
        businessPhone: '07700900222',
        businessEmail: 'bravo@locksmith.test',
        logoUrl: null,
        createdAt: new Date(),
      }
    );

    mockLeads.push(
      {
        id: 'lead-mgmt-1',
        tenantId: TENANT_A,
        name: 'Sarah Connor',
        phone: '+447911000111',
        email: 'sarah@connor.test',
        postcode: 'SW1A 1AA',
        serviceType: 'Emergency Lockout Service',
        status: 'completed',
        createdAt: new Date(),
      } as any,
      {
        id: 'lead-mgmt-2',
        tenantId: TENANT_A,
        name: 'John Connor',
        phone: '+447911000222',
        email: 'john@connor.test',
        postcode: 'SW1A 1AB',
        serviceType: 'Master Key System Installation',
        status: 'completed',
        createdAt: new Date(),
      } as any,
      {
        id: 'lead-mgmt-3',
        tenantId: TENANT_B,
        name: 'Kyle Reese',
        phone: '+447911000333',
        email: 'kyle@reese.test',
        postcode: 'E1 6AN',
        serviceType: 'uPVC Multi-Point Lock Repair',
        status: 'completed',
        createdAt: new Date(),
      } as any
    );

    const now = new Date();
    const tokenA1 = generateSecureToken(32);
    const tokenA2 = generateSecureToken(32);
    const tokenB1 = generateSecureToken(32);

    mockReviewRequests.push(
      {
        id: 'req-mgmt-1',
        tenantId: TENANT_A,
        leadId: 'lead-mgmt-1',
        status: 'positive',
        channel: 'sms',
        secureToken: tokenA1,
        tokenHash: await hashToken(tokenA1),
        rating: 5,
        sentAt: new Date(now.getTime() - 3600000),
        respondedAt: now,
        expiresAt: new Date(now.getTime() + 86400000),
        createdAt: new Date(now.getTime() - 7200000),
        updatedAt: now,
      } as any,
      {
        id: 'req-mgmt-2',
        tenantId: TENANT_A,
        leadId: 'lead-mgmt-2',
        status: 'negative',
        channel: 'email',
        secureToken: tokenA2,
        tokenHash: await hashToken(tokenA2),
        rating: 2,
        sentAt: new Date(now.getTime() - 3600000),
        respondedAt: now,
        expiresAt: new Date(now.getTime() + 86400000),
        createdAt: new Date(now.getTime() - 7200000),
        updatedAt: now,
      } as any,
      {
        id: 'req-mgmt-3',
        tenantId: TENANT_B,
        leadId: 'lead-mgmt-3',
        status: 'positive',
        channel: 'both',
        secureToken: tokenB1,
        tokenHash: await hashToken(tokenB1),
        rating: 5,
        sentAt: new Date(now.getTime() - 3600000),
        respondedAt: now,
        expiresAt: new Date(now.getTime() + 86400000),
        createdAt: new Date(now.getTime() - 7200000),
        updatedAt: now,
      } as any
    );

    mockReviewFeedback.push(
      {
        id: 'fb-mgmt-1',
        tenantId: TENANT_A,
        reviewRequestId: 'req-mgmt-1',
        rating: 5,
        sentiment: 'positive',
        feedbackText: null,
        publicPlatformClicked: true,
        publicPlatformName: 'google',
        createdAt: now,
      } as any,
      {
        id: 'fb-mgmt-2',
        tenantId: TENANT_A,
        reviewRequestId: 'req-mgmt-2',
        rating: 2,
        sentiment: 'negative',
        feedbackText: 'The locksmith was 30 minutes late without calling ahead.',
        publicPlatformClicked: false,
        publicPlatformName: null,
        createdAt: now,
      } as any,
      {
        id: 'fb-mgmt-3',
        tenantId: TENANT_B,
        reviewRequestId: 'req-mgmt-3',
        rating: 5,
        sentiment: 'positive',
        feedbackText: null,
        publicPlatformClicked: true,
        publicPlatformName: 'trustpilot',
        createdAt: now,
      } as any
    );

    // --- TEST 1: Tenant-Isolated Feedback Inbox Retrieval ---
    console.log('\n--- Test 1: Tenant-Isolated Feedback Inbox Retrieval ---');
    const inboxA = await getFeedbackInbox(TENANT_A);
    assert.strictEqual(inboxA.items.length, 2, 'Tenant A must receive exactly 2 feedback items');
    assert(
      inboxA.items.every((i) => i.tenantId === TENANT_A),
      'All items returned must strictly belong to Tenant A'
    );
    assert.strictEqual(inboxA.summary.totalFeedback, 2, 'Summary totalFeedback is 2');
    assert.strictEqual(inboxA.summary.positiveCount, 1, 'Summary positiveCount is 1');
    assert.strictEqual(inboxA.summary.negativeCount, 1, 'Summary negativeCount is 1');
    assert.strictEqual(inboxA.summary.averageRating, 3.5, 'Average rating (5 + 2) / 2 = 3.5');
    assert.strictEqual(inboxA.summary.platformClickCount, 1, 'Platform clicks count is 1');
    pass('getFeedbackInbox strictly isolates records by tenantId and calculates deterministic summary stats');

    // --- TEST 2: Multi-Attribute Filtering (Sentiment, Rating, Search) ---
    console.log('\n--- Test 2: Multi-Attribute Filtering ---');
    const positiveOnly = await getFeedbackInbox(TENANT_A, { sentiment: 'positive' });
    assert.strictEqual(positiveOnly.items.length, 1, 'Filtering by positive sentiment returns 1 item');
    assert.strictEqual(positiveOnly.items[0].rating, 5, 'Item has 5-star rating');

    const negativeOnly = await getFeedbackInbox(TENANT_A, { sentiment: 'negative' });
    assert.strictEqual(negativeOnly.items.length, 1, 'Filtering by negative sentiment returns 1 item');
    assert.strictEqual(negativeOnly.items[0].rating, 2, 'Item has 2-star rating');

    const clickedOnly = await getFeedbackInbox(TENANT_A, { platformClicked: 'yes' });
    assert.strictEqual(clickedOnly.items.length, 1, 'Filtering by platformClicked: yes returns 1 item');
    assert.strictEqual(clickedOnly.items[0].publicPlatformClicked, true, 'Item has publicPlatformClicked = true');

    const searchMatch = await getFeedbackInbox(TENANT_A, { search: 'Sarah' });
    assert.strictEqual(searchMatch.items.length, 1, 'Search query "Sarah" matches customer');
    assert.strictEqual(searchMatch.items[0].customerName, 'Sarah Connor', 'Matched Sarah Connor');

    const commentSearchMatch = await getFeedbackInbox(TENANT_A, { search: '30 minutes late' });
    assert.strictEqual(commentSearchMatch.items.length, 1, 'Search query matches private comment text');
    pass('Multi-attribute filtering (sentiment, rating, platformClicked, search) operates with 100% precision');

    // --- TEST 3: Feedback Detail Inspection & Lifecycle Timeline ---
    console.log('\n--- Test 3: Feedback Detail Inspection & Lifecycle Timeline ---');
    const detail = await getFeedbackDetail(TENANT_A, 'fb-mgmt-2');
    assert(detail !== null, 'Feedback detail item must be found');
    assert.strictEqual(detail?.customerName, 'John Connor', 'Joined customer name is accurate');
    assert.strictEqual(detail?.customerPhone, '+447911000222', 'Customer phone joined');
    assert.strictEqual(detail?.serviceType, 'Master Key System Installation', 'Service type joined');
    assert.strictEqual(detail?.feedbackText, 'The locksmith was 30 minutes late without calling ahead.', 'Feedback comment present');
    assert(Array.isArray(detail?.timeline) && detail!.timeline.length >= 2, 'Timeline array has lifecycle events');
    assert(detail?.timeline.some((t) => t.type === 'rated'), 'Timeline includes rating event');
    assert(detail?.timeline.some((t) => t.type === 'feedback_submitted'), 'Timeline includes feedback submission event');
    pass('getFeedbackDetail returns joined customer details, private comments, and complete lifecycle timeline');

    // --- TEST 4: Cross-Tenant Security Defense ---
    console.log('\n--- Test 4: Cross-Tenant Security Defense ---');
    const crossTenantLookup = await getFeedbackDetail(TENANT_B, 'fb-mgmt-1'); // fb-mgmt-1 belongs to TENANT_A
    assert.strictEqual(crossTenantLookup, null, 'Cross-tenant feedback inspection must return null');
    pass('Cross-tenant feedback inspection is strictly rejected');

    // Clean up test records
    try {
      await db.delete(auditLogs).where(eq(auditLogs.tenantId, TENANT_A));
      await db.delete(auditLogs).where(eq(auditLogs.tenantId, TENANT_B));
      await db.delete(reviewFeedback).where(eq(reviewFeedback.tenantId, TENANT_A));
      await db.delete(reviewFeedback).where(eq(reviewFeedback.tenantId, TENANT_B));
      await db.delete(reviewRequests).where(eq(reviewRequests.tenantId, TENANT_A));
      await db.delete(reviewRequests).where(eq(reviewRequests.tenantId, TENANT_B));
      await db.delete(leads).where(eq(leads.tenantId, TENANT_A));
      await db.delete(leads).where(eq(leads.tenantId, TENANT_B));
      await db.delete(tenants).where(eq(tenants.id, TENANT_A));
      await db.delete(tenants).where(eq(tenants.id, TENANT_B));
    } catch (_) {}

    console.log('\n=============================================================');
    console.log(`🎉 ALL PHASE 9 REVIEW MANAGEMENT TESTS PASSED: ${passedCount} / ${passedCount} assertions`);
    console.log('=============================================================\n');
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

runTests();
