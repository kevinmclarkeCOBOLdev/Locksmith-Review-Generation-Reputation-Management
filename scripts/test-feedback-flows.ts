import { db } from '../src/db';
import { leads, reviewRequests, reviewFeedback, reviewPlatformSettings, tenants, auditLogs } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import {
  submitPublicRating,
  getPublicPlatformDestinations,
  trackPublicPlatformClick,
  submitPrivateFeedback,
} from '../src/services/public-review.service';
import { generateSecureToken, hashToken } from '../src/lib/crypto';
import { mockLeads, mockTenants, mockReviewRequests, mockReviewFeedback, mockAuditLogs } from '../src/db/mock';
import assert from 'assert';

const TEST_TENANT = 'test-tenant-p8';
const TEST_LEAD_POS = 'test-lead-p8-pos';
const TEST_LEAD_NEG = 'test-lead-p8-neg';

const TOKEN_POS = generateSecureToken(32);
const TOKEN_NEG = generateSecureToken(32);

let passedCount = 0;
function pass(message: string) {
  console.log(`✅ PASSED: ${message}`);
  passedCount++;
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('🌟 LOCKREVIEW: PHASE 8 POSITIVE & PRIVATE FEEDBACK FLOW TESTS');
  console.log('=============================================================\n');

  try {
    // 0. Seed test fixtures
    console.log('--- Step 0: Seeding Isolated Test Fixtures ---');
    mockTenants.push({
      id: TEST_TENANT,
      name: 'Apex Locksmith Services',
      businessPhone: '07700900777',
      businessEmail: 'apex@locksmith.test',
      logoUrl: null,
      createdAt: new Date(),
    });

    mockLeads.push(
      {
        id: TEST_LEAD_POS,
        tenantId: TEST_TENANT,
        name: 'Diana Prince',
        phone: '+447911333444',
        email: 'diana@example.com',
        postcode: 'EC1A 1BB',
        serviceType: 'Emergency Lock Opening',
        status: 'completed',
        createdAt: new Date(),
      } as any,
      {
        id: TEST_LEAD_NEG,
        tenantId: TEST_TENANT,
        name: 'Arthur Curry',
        phone: '+447911333555',
        email: 'arthur@example.com',
        postcode: 'EC1A 1BC',
        serviceType: 'Cylinder Replacement',
        status: 'completed',
        createdAt: new Date(),
      } as any
    );

    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const hashPos = await hashToken(TOKEN_POS);
    const hashNeg = await hashToken(TOKEN_NEG);

    mockReviewRequests.push(
      {
        id: 'p8-req-pos',
        tenantId: TEST_TENANT,
        leadId: TEST_LEAD_POS,
        status: 'sent',
        channel: 'both',
        secureToken: TOKEN_POS,
        tokenHash: hashPos,
        rating: null,
        sentAt: now,
        respondedAt: null,
        expiresAt: futureDate,
        createdAt: now,
        updatedAt: now,
      } as any,
      {
        id: 'p8-req-neg',
        tenantId: TEST_TENANT,
        leadId: TEST_LEAD_NEG,
        status: 'sent',
        channel: 'sms',
        secureToken: TOKEN_NEG,
        tokenHash: hashNeg,
        rating: null,
        sentAt: now,
        respondedAt: null,
        expiresAt: futureDate,
        createdAt: now,
        updatedAt: now,
      } as any
    );

    // --- TEST 1: Positive 5-Star Rating & Platform Destinations ---
    console.log('\n--- Test 1: Positive 5-Star Rating & Platform Destinations ---');
    const posRatingResult = await submitPublicRating(TOKEN_POS, 5);
    assert.strictEqual(posRatingResult.success, true, '5-star rating submission returns success');
    assert.strictEqual(posRatingResult.sentiment, 'positive', 'Classified as positive sentiment');

    const platformsResult = await getPublicPlatformDestinations(TOKEN_POS);
    assert.strictEqual(platformsResult.businessName, 'Apex Locksmith Services', 'Resolves tenant business name');
    assert(Array.isArray(platformsResult.platforms) && platformsResult.platforms.length > 0, 'Returns platform destinations');
    const googlePlatform = platformsResult.platforms.find((p) => p.platformName === 'google');
    assert(googlePlatform !== undefined, 'Google Reviews platform is present');
    assert(googlePlatform?.destinationUrl.includes('google.com'), 'Google review URL is valid');
    assert.strictEqual(googlePlatform?.isPrimary, true, 'Google Reviews marked as primary CTA');
    pass('Positive rating flow returns configured review destinations with Google as primary');

    // --- TEST 2: Public Platform Click Tracking ---
    console.log('\n--- Test 2: Public Platform Click Tracking ---');
    const trackResult = await trackPublicPlatformClick(TOKEN_POS, 'google');
    assert.strictEqual(trackResult.success, true, 'Click tracking returns success: true');
    assert.strictEqual(trackResult.platformName, 'google', 'Tracked platform is google');

    // Verify review_feedback record in memory
    const fbPos = mockReviewFeedback.find((f: any) => f.reviewRequestId === 'p8-req-pos');
    assert(fbPos !== undefined, 'review_feedback record exists');
    assert.strictEqual(fbPos?.publicPlatformClicked, true, 'publicPlatformClicked set to true in review_feedback');
    assert.strictEqual(fbPos?.publicPlatformName, 'google', 'publicPlatformName set to google in review_feedback');

    // Verify audit log
    const auditPos = mockAuditLogs.find(
      (a: any) => a.metadata?.reviewRequestId === 'p8-req-pos' && a.event === 'PUBLIC_REVIEW_PLATFORM_CLICKED'
    );
    assert(auditPos !== undefined, 'Audit log event PUBLIC_REVIEW_PLATFORM_CLICKED recorded');
    pass('trackPublicPlatformClick records click evidence in review_feedback and audit_logs');

    // --- TEST 3: Negative 2-Star Rating Submission ---
    console.log('\n--- Test 3: Negative 2-Star Rating Submission ---');
    const negRatingResult = await submitPublicRating(TOKEN_NEG, 2);
    assert.strictEqual(negRatingResult.success, true, '2-star rating submission returns success');
    assert.strictEqual(negRatingResult.sentiment, 'negative', 'Classified as negative sentiment');

    const fbNeg = mockReviewFeedback.find((f: any) => f.reviewRequestId === 'p8-req-neg');
    assert(fbNeg !== undefined, 'review_feedback record created for negative review');
    assert.strictEqual(fbNeg?.rating, 2, 'Rating is 2 in review_feedback');
    assert.strictEqual(fbNeg?.sentiment, 'negative', 'Sentiment is negative');
    pass('Negative rating recorded without automatic public redirect');

    // --- TEST 4: Private Constructive Feedback Submission ---
    console.log('\n--- Test 4: Private Constructive Feedback Submission ---');
    const feedbackComment = 'The technician was delayed by 45 minutes and did not call in advance.';
    const privateFbResult = await submitPrivateFeedback(TOKEN_NEG, feedbackComment, true);
    assert.strictEqual(privateFbResult.success, true, 'Private feedback submission returns success');

    // Verify feedback text in review_feedback
    assert.strictEqual(fbNeg?.feedbackText, feedbackComment, 'feedbackText stored in review_feedback table');

    // Verify management recovery audit log
    const auditNeg = mockAuditLogs.find(
      (a: any) => a.metadata?.reviewRequestId === 'p8-req-neg' && a.event === 'PRIVATE_FEEDBACK_SUBMITTED'
    );
    assert(auditNeg !== undefined, 'High-priority PRIVATE_FEEDBACK_SUBMITTED audit log created');
    assert.strictEqual(auditNeg?.metadata?.requestContact, true, 'Audit log captures requestContact: true');
    pass('submitPrivateFeedback securely stores constructive criticism and logs management recovery alert');

    // --- TEST 5: Input Validation & Security Bounds ---
    console.log('\n--- Test 5: Input Validation & Security Bounds ---');
    let emptyFeedbackError = false;
    try {
      await submitPrivateFeedback(TOKEN_NEG, '');
    } catch (_) {
      emptyFeedbackError = true;
    }
    assert(emptyFeedbackError, 'Empty feedback comment must throw validation error');

    let invalidTokenError = false;
    try {
      await submitPrivateFeedback('invalid-token-xyz', 'Some text');
    } catch (_) {
      invalidTokenError = true;
    }
    assert(invalidTokenError, 'Invalid token must throw error');
    pass('Private feedback submission enforces text requirement and token validity');

    // Clean up test records
    try {
      await db.delete(auditLogs).where(eq(auditLogs.tenantId, TEST_TENANT));
      await db.delete(reviewFeedback).where(eq(reviewFeedback.tenantId, TEST_TENANT));
      await db.delete(reviewPlatformSettings).where(eq(reviewPlatformSettings.tenantId, TEST_TENANT));
      await db.delete(reviewRequests).where(eq(reviewRequests.tenantId, TEST_TENANT));
      await db.delete(leads).where(eq(leads.tenantId, TEST_TENANT));
      await db.delete(tenants).where(eq(tenants.id, TEST_TENANT));
    } catch (_) {}

    console.log('\n=============================================================');
    console.log(`🎉 ALL PHASE 8 POSITIVE & PRIVATE FEEDBACK TESTS PASSED: ${passedCount} / ${passedCount} assertions`);
    console.log('=============================================================\n');
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

runTests();
