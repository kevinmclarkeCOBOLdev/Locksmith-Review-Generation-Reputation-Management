import { db } from '../src/db';
import { reviewRequests, reviewFeedback, tenants, auditLogs } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { getReputationAnalytics } from '../src/services/analytics.service';
import { generateSecureToken, hashToken } from '../src/lib/crypto';
import { mockTenants, mockReviewRequests, mockReviewFeedback } from '../src/db/mock';
import assert from 'assert';

const TENANT_A = 'test-an-tenant-a';
const TENANT_B = 'test-an-tenant-b';

let passedCount = 0;
function pass(message: string) {
  console.log(`✅ PASSED: ${message}`);
  passedCount++;
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('📊 LOCKREVIEW: PHASE 11 REPUTATION ANALYTICS & REPORTING TESTS');
  console.log('=============================================================\n');

  try {
    // 0. Seed test fixtures
    console.log('--- Step 0: Seeding Isolated Test Fixtures ---');
    mockTenants.push(
      {
        id: TENANT_A,
        name: 'Vanguard Locksmiths',
        businessPhone: '07700900555',
        businessEmail: 'vanguard@locksmith.test',
        logoUrl: null,
        createdAt: new Date(),
      },
      {
        id: TENANT_B,
        name: 'Empty Test Locksmiths',
        businessPhone: '07700900666',
        businessEmail: 'empty@locksmith.test',
        logoUrl: null,
        createdAt: new Date(),
      }
    );

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);

    // Seed 4 requests for Tenant A:
    // Req 1: SMS, 1 day ago, sent, responded 5★, Google clicked
    const t1 = generateSecureToken(32);
    // Req 2: SMS, 1 day ago, sent, responded 5★, Google clicked
    const t2 = generateSecureToken(32);
    // Req 3: Email, 10 days ago, sent, responded 2★, no click
    const t3 = generateSecureToken(32);
    // Req 4: Email, 10 days ago, sent, pending response
    const t4 = generateSecureToken(32);
    // Req 5: SMS, 40 days ago, sent, responded 4★, Trustpilot clicked
    const t5 = generateSecureToken(32);

    mockReviewRequests.push(
      {
        id: 'an-req-1',
        tenantId: TENANT_A,
        leadId: 'an-lead-1',
        channel: 'sms',
        status: 'positive',
        secureToken: t1,
        tokenHash: await hashToken(t1),
        rating: 5,
        sentAt: oneDayAgo,
        respondedAt: oneDayAgo,
        createdAt: oneDayAgo,
        updatedAt: oneDayAgo,
      } as any,
      {
        id: 'an-req-2',
        tenantId: TENANT_A,
        leadId: 'an-lead-2',
        channel: 'sms',
        status: 'positive',
        secureToken: t2,
        tokenHash: await hashToken(t2),
        rating: 5,
        sentAt: oneDayAgo,
        respondedAt: oneDayAgo,
        createdAt: oneDayAgo,
        updatedAt: oneDayAgo,
      } as any,
      {
        id: 'an-req-3',
        tenantId: TENANT_A,
        leadId: 'an-lead-3',
        channel: 'email',
        status: 'negative',
        secureToken: t3,
        tokenHash: await hashToken(t3),
        rating: 2,
        sentAt: tenDaysAgo,
        respondedAt: tenDaysAgo,
        createdAt: tenDaysAgo,
        updatedAt: tenDaysAgo,
      } as any,
      {
        id: 'an-req-4',
        tenantId: TENANT_A,
        leadId: 'an-lead-4',
        channel: 'email',
        status: 'sent',
        secureToken: t4,
        tokenHash: await hashToken(t4),
        rating: null,
        sentAt: tenDaysAgo,
        respondedAt: null,
        createdAt: tenDaysAgo,
        updatedAt: tenDaysAgo,
      } as any,
      {
        id: 'an-req-5',
        tenantId: TENANT_A,
        leadId: 'an-lead-5',
        channel: 'sms',
        status: 'positive',
        secureToken: t5,
        tokenHash: await hashToken(t5),
        rating: 4,
        sentAt: fortyDaysAgo,
        respondedAt: fortyDaysAgo,
        createdAt: fortyDaysAgo,
        updatedAt: fortyDaysAgo,
      } as any
    );

    mockReviewFeedback.push(
      {
        id: 'an-fb-1',
        tenantId: TENANT_A,
        reviewRequestId: 'an-req-1',
        rating: 5,
        sentiment: 'positive',
        feedbackText: null,
        publicPlatformClicked: true,
        publicPlatformName: 'google',
        createdAt: oneDayAgo,
      } as any,
      {
        id: 'an-fb-2',
        tenantId: TENANT_A,
        reviewRequestId: 'an-req-2',
        rating: 5,
        sentiment: 'positive',
        feedbackText: null,
        publicPlatformClicked: true,
        publicPlatformName: 'google',
        createdAt: oneDayAgo,
      } as any,
      {
        id: 'an-fb-3',
        tenantId: TENANT_A,
        reviewRequestId: 'an-req-3',
        rating: 2,
        sentiment: 'negative',
        feedbackText: 'Slow arrival time.',
        publicPlatformClicked: false,
        publicPlatformName: null,
        createdAt: tenDaysAgo,
      } as any,
      {
        id: 'an-fb-5',
        tenantId: TENANT_A,
        reviewRequestId: 'an-req-5',
        rating: 4,
        sentiment: 'positive',
        feedbackText: null,
        publicPlatformClicked: true,
        publicPlatformName: 'trustpilot',
        createdAt: fortyDaysAgo,
      } as any
    );

    // --- TEST 1: Deterministic Metrics Math (30-Day Window) ---
    console.log('\n--- Test 1: Deterministic Metrics Math (30-Day Window) ---');
    const an30 = await getReputationAnalytics(TENANT_A, '30d');

    assert.strictEqual(an30.tenantId, TENANT_A, 'Tenant ID matches');
    assert.strictEqual(an30.businessName, 'Vanguard Locksmiths', 'Business name matches');
    assert.strictEqual(an30.metrics.totalRequests, 4, '4 requests created within 30 days');
    assert.strictEqual(an30.metrics.sentRequests, 4, '4 requests sent within 30 days');
    assert.strictEqual(an30.metrics.responseCount, 3, '3 customer responses received');
    assert.strictEqual(an30.metrics.responseRate, 75, '(3 responses / 4 sent) * 100 = 75%');
    assert.strictEqual(an30.metrics.averageRating, 4.0, 'Average rating is (5+5+2)/3 = 4.0');
    assert.strictEqual(an30.metrics.positiveCount, 2, '2 positive ratings (5★)');
    assert.strictEqual(an30.metrics.negativeCount, 1, '1 negative rating (2★)');
    assert.strictEqual(an30.metrics.publicClickCount, 2, '2 Google Review clicks');
    assert.strictEqual(an30.metrics.publicClickRate, 66.7, 'Public click rate is (2/3)*100 = 66.7%');
    pass('getReputationAnalytics computes exact evidence-based rates and averages for 30d window');

    // --- TEST 2: Rating Distribution Math Integrity ---
    console.log('\n--- Test 2: Rating Distribution Math Integrity ---');
    const starSum = an30.ratingDistribution.reduce((acc, curr) => acc + curr.count, 0);
    assert.strictEqual(starSum, an30.metrics.responseCount, 'Sum of rating buckets matches responseCount');

    const fiveStarBucket = an30.ratingDistribution.find((b) => b.stars === 5);
    assert.strictEqual(fiveStarBucket?.count, 2, '2 five-star ratings');
    assert.strictEqual(fiveStarBucket?.percentage, 66.7, '66.7% five-star percentage');

    const twoStarBucket = an30.ratingDistribution.find((b) => b.stars === 2);
    assert.strictEqual(twoStarBucket?.count, 1, '1 two-star rating');
    assert.strictEqual(twoStarBucket?.percentage, 33.3, '33.3% two-star percentage');
    pass('Rating distribution breakdown accurately partitions star counts and percentages');

    // --- TEST 3: Channel Performance Breakdown ---
    console.log('\n--- Test 3: Channel Performance Breakdown ---');
    const smsChannel = an30.channelPerformance.find((c) => c.channel === 'sms');
    assert.strictEqual(smsChannel?.sent, 2, '2 SMS requests sent');
    assert.strictEqual(smsChannel?.responded, 2, '2 SMS responses received');
    assert.strictEqual(smsChannel?.responseRate, 100, '100% SMS response rate');
    assert.strictEqual(smsChannel?.averageRating, 5.0, '5.0 SMS average rating');

    const emailChannel = an30.channelPerformance.find((c) => c.channel === 'email');
    assert.strictEqual(emailChannel?.sent, 2, '2 Email requests sent');
    assert.strictEqual(emailChannel?.responded, 1, '1 Email response received');
    assert.strictEqual(emailChannel?.responseRate, 50, '50% Email response rate');
    pass('Channel performance compares SMS and Email conversion rates with mathematical precision');

    // --- TEST 4: Date Range Scoping (All Time vs Today vs 7d) ---
    console.log('\n--- Test 4: Date Range Scoping ---');
    const anAll = await getReputationAnalytics(TENANT_A, 'all');
    assert.strictEqual(anAll.metrics.totalRequests, 5, 'All time includes older 40-day request');
    assert.strictEqual(anAll.metrics.responseCount, 4, 'All time includes older 4-star response');

    const an7d = await getReputationAnalytics(TENANT_A, '7d');
    assert.strictEqual(an7d.metrics.totalRequests, 2, 'Last 7 days includes only 1-day old requests');
    assert.strictEqual(an7d.metrics.responseCount, 2, 'Last 7 days includes 2 responses');
    pass('Time range filtering (7d, 30d, all) dynamically scopes query boundaries');

    // --- TEST 5: Empty State & Zero-Division Safety ---
    console.log('\n--- Test 5: Empty State & Zero-Division Safety ---');
    const anEmpty = await getReputationAnalytics(TENANT_B, 'all');
    assert.strictEqual(anEmpty.metrics.totalRequests, 0, 'Empty tenant has 0 requests');
    assert.strictEqual(anEmpty.metrics.sentRequests, 0, 'Empty tenant has 0 sent');
    assert.strictEqual(anEmpty.metrics.responseCount, 0, 'Empty tenant has 0 responses');
    assert.strictEqual(anEmpty.metrics.responseRate, 0, 'responseRate defaults safely to 0 (no NaN)');
    assert.strictEqual(anEmpty.metrics.averageRating, 0, 'averageRating defaults safely to 0 (no NaN)');
    assert.strictEqual(anEmpty.metrics.publicClickRate, 0, 'publicClickRate defaults safely to 0 (no NaN)');
    pass('Empty tenant calculations operate safely with zero-division guards');

    // --- TEST 6: Strict Cross-Tenant Analytics Isolation ---
    console.log('\n--- Test 6: Strict Cross-Tenant Analytics Isolation ---');
    assert.strictEqual(anEmpty.metrics.responseCount, 0, 'Tenant B metrics are completely isolated from Tenant A');
    pass('Cross-tenant analytics data isolation verified');

    // Clean up
    try {
      await db.delete(auditLogs).where(eq(auditLogs.tenantId, TENANT_A));
      await db.delete(auditLogs).where(eq(auditLogs.tenantId, TENANT_B));
      await db.delete(reviewFeedback).where(eq(reviewFeedback.tenantId, TENANT_A));
      await db.delete(reviewFeedback).where(eq(reviewFeedback.tenantId, TENANT_B));
      await db.delete(reviewRequests).where(eq(reviewRequests.tenantId, TENANT_A));
      await db.delete(reviewRequests).where(eq(reviewRequests.tenantId, TENANT_B));
      await db.delete(tenants).where(eq(tenants.id, TENANT_A));
      await db.delete(tenants).where(eq(tenants.id, TENANT_B));
    } catch (_) {}

    console.log('\n=============================================================');
    console.log(`🎉 ALL PHASE 11 REPUTATION ANALYTICS TESTS PASSED: ${passedCount} / ${passedCount} assertions`);
    console.log('=============================================================\n');
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

runTests();
