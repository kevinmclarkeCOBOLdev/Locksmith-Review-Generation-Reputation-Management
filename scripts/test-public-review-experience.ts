import { db } from '../src/db';
import { leads, reviewRequests, reviewFeedback, tenants } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { validateReviewToken, submitPublicRating } from '../src/services/public-review.service';
import { generateSecureToken, hashToken } from '../src/lib/crypto';
import { mockLeads, mockTenants, mockReviewRequests, mockReviewFeedback } from '../src/db/mock';
import assert from 'assert';

const TEST_TENANT = 'test-tenant-p7';
const TEST_LEAD_VALID = 'test-lead-p7-valid';
const TEST_LEAD_EXPIRED = 'test-lead-p7-expired';
const TEST_LEAD_CANCELLED = 'test-lead-p7-cancelled';
const TEST_LEAD_NEGATIVE = 'test-lead-p7-neg';

const TOKEN_VALID = generateSecureToken(32);
const TOKEN_EXPIRED = generateSecureToken(32);
const TOKEN_CANCELLED = generateSecureToken(32);
const TOKEN_NEGATIVE = generateSecureToken(32);

let passedCount = 0;
function pass(message: string) {
  console.log(`✅ PASSED: ${message}`);
  passedCount++;
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('⭐ LOCKREVIEW: PHASE 7 PUBLIC CUSTOMER REVIEW EXPERIENCE TESTS');
  console.log('=============================================================\n');

  try {
    // 0. Seed test fixtures
    console.log('--- Step 0: Seeding Isolated Test Fixtures ---');
    mockTenants.push({
      id: TEST_TENANT,
      name: 'Prime Locksmith Specialists',
      businessPhone: '07700900333',
      businessEmail: 'prime@locksmith.test',
      logoUrl: null,
      createdAt: new Date(),
    });

    mockLeads.push(
      {
        id: TEST_LEAD_VALID,
        tenantId: TEST_TENANT,
        name: 'Sarah Connor',
        phone: '+447911222333',
        email: 'sarah@example.com',
        postcode: 'W1A 1AA',
        serviceType: 'Emergency Residential Lockout',
        status: 'completed',
        createdAt: new Date(),
      } as any,
      {
        id: TEST_LEAD_EXPIRED,
        tenantId: TEST_TENANT,
        name: 'John Connor',
        phone: '+447911222444',
        email: 'john@example.com',
        postcode: 'W1A 1AB',
        serviceType: 'Lock Replacement',
        status: 'completed',
        createdAt: new Date(),
      } as any,
      {
        id: TEST_LEAD_CANCELLED,
        tenantId: TEST_TENANT,
        name: 'Kyle Reese',
        phone: '+447911222555',
        email: 'kyle@example.com',
        postcode: 'W1A 1AC',
        serviceType: 'Key Duplication',
        status: 'completed',
        createdAt: new Date(),
      } as any,
      {
        id: TEST_LEAD_NEGATIVE,
        tenantId: TEST_TENANT,
        name: 'Marcus Wright',
        phone: '+447911222666',
        email: 'marcus@example.com',
        postcode: 'W1A 1AD',
        serviceType: 'uPVC Multi-Point Repair',
        status: 'completed',
        createdAt: new Date(),
      } as any
    );

    const now = new Date();
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead

    const hashValid = await hashToken(TOKEN_VALID);
    const hashExpired = await hashToken(TOKEN_EXPIRED);
    const hashCancelled = await hashToken(TOKEN_CANCELLED);
    const hashNegative = await hashToken(TOKEN_NEGATIVE);

    mockReviewRequests.push(
      {
        id: 'p7-req-valid',
        tenantId: TEST_TENANT,
        leadId: TEST_LEAD_VALID,
        status: 'sent',
        channel: 'sms',
        secureToken: TOKEN_VALID,
        tokenHash: hashValid,
        rating: null,
        sentAt: now,
        respondedAt: null,
        expiresAt: futureDate,
        createdAt: now,
        updatedAt: now,
      } as any,
      {
        id: 'p7-req-expired',
        tenantId: TEST_TENANT,
        leadId: TEST_LEAD_EXPIRED,
        status: 'sent',
        channel: 'email',
        secureToken: TOKEN_EXPIRED,
        tokenHash: hashExpired,
        rating: null,
        sentAt: pastDate,
        respondedAt: null,
        expiresAt: pastDate,
        createdAt: pastDate,
        updatedAt: pastDate,
      } as any,
      {
        id: 'p7-req-cancelled',
        tenantId: TEST_TENANT,
        leadId: TEST_LEAD_CANCELLED,
        status: 'cancelled',
        channel: 'sms',
        secureToken: TOKEN_CANCELLED,
        tokenHash: hashCancelled,
        rating: null,
        sentAt: now,
        respondedAt: null,
        expiresAt: futureDate,
        createdAt: now,
        updatedAt: now,
      } as any,
      {
        id: 'p7-req-neg',
        tenantId: TEST_TENANT,
        leadId: TEST_LEAD_NEGATIVE,
        status: 'sent',
        channel: 'both',
        secureToken: TOKEN_NEGATIVE,
        tokenHash: hashNegative,
        rating: null,
        sentAt: now,
        respondedAt: null,
        expiresAt: futureDate,
        createdAt: now,
        updatedAt: now,
      } as any
    );

    // --- TEST 1: Valid Token Validation & Minimal Public Exposure ---
    console.log('\n--- Test 1: Valid Token Validation & Minimal Public Exposure ---');
    const validView = await validateReviewToken(TOKEN_VALID);
    assert.strictEqual(validView.status, 'valid', 'Valid token resolves to valid status');
    assert.strictEqual(validView.businessName, 'Prime Locksmith Specialists', 'Resolves tenant business name');
    assert.strictEqual(validView.customerFirstName, 'Sarah', 'Extracts only customer first name for privacy');
    assert.strictEqual((validView as any).customerEmail, undefined, 'No customer email leaked');
    assert.strictEqual((validView as any).customerPhone, undefined, 'No customer phone leaked');
    assert.strictEqual((validView as any).tenantId, undefined, 'No database tenantId leaked');
    pass('validateReviewToken exposes only minimal public view model');

    // --- TEST 2: Invalid Token Handling ---
    console.log('\n--- Test 2: Invalid Token Handling ---');
    const invalidView = await validateReviewToken('non-existent-token-12345');
    assert.strictEqual(invalidView.status, 'invalid', 'Non-existent token returns invalid status');
    const emptyView = await validateReviewToken('');
    assert.strictEqual(emptyView.status, 'invalid', 'Empty token returns invalid status');
    pass('validateReviewToken rejects non-existent and empty tokens');

    // --- TEST 3: Expired Token Handling ---
    console.log('\n--- Test 3: Expired Token Handling ---');
    const expiredView = await validateReviewToken(TOKEN_EXPIRED);
    assert.strictEqual(expiredView.status, 'expired', 'Expired token returns expired status');
    pass('validateReviewToken detects expired tokens');

    // --- TEST 4: Cancelled Token Handling ---
    console.log('\n--- Test 4: Cancelled Token Handling ---');
    const cancelledView = await validateReviewToken(TOKEN_CANCELLED);
    assert.strictEqual(cancelledView.status, 'cancelled', 'Cancelled token returns cancelled status');
    pass('validateReviewToken detects cancelled tokens');

    // --- TEST 5: Rating Input Validation (1-5 range) ---
    console.log('\n--- Test 5: Rating Input Validation ---');
    let zeroError = false;
    try {
      await submitPublicRating(TOKEN_VALID, 0);
    } catch (_) {
      zeroError = true;
    }
    assert(zeroError, 'Rating 0 must throw validation error');

    let sixError = false;
    try {
      await submitPublicRating(TOKEN_VALID, 6);
    } catch (_) {
      sixError = true;
    }
    assert(sixError, 'Rating 6 must throw validation error');

    let floatError = false;
    try {
      await submitPublicRating(TOKEN_VALID, 4.5);
    } catch (_) {
      floatError = true;
    }
    assert(floatError, 'Non-integer rating 4.5 must throw validation error');
    pass('submitPublicRating strictly enforces integer rating between 1 and 5');

    // --- TEST 6: Positive Rating Submission (5 Stars) ---
    console.log('\n--- Test 6: Positive Rating Submission (5 Stars) ---');
    const submitResult5 = await submitPublicRating(TOKEN_VALID, 5);
    assert.strictEqual(submitResult5.success, true, 'Submission returns success: true');
    assert.strictEqual(submitResult5.sentiment, 'positive', '5 stars classified as positive sentiment');
    assert.strictEqual(submitResult5.rating, 5, 'Recorded rating is 5');

    // Verify record in mockReviewRequests
    const req5 = mockReviewRequests.find((r) => r.secureToken === TOKEN_VALID);
    assert.strictEqual(req5?.status, 'positive', 'review_requests status updated to positive');
    assert.strictEqual(req5?.rating, 5, 'review_requests rating updated to 5');
    assert(req5?.respondedAt instanceof Date, 'respondedAt timestamp recorded');

    // Verify record in mockReviewFeedback
    const fb5 = mockReviewFeedback.find((f) => f.reviewRequestId === 'p7-req-valid');
    assert(fb5 !== undefined, 'review_feedback record created');
    assert.strictEqual(fb5?.rating, 5, 'review_feedback rating is 5');
    assert.strictEqual(fb5?.sentiment, 'positive', 'review_feedback sentiment is positive');
    pass('5-star submission persists positive sentiment in review_requests and review_feedback');

    // --- TEST 7: Duplicate Submission Prevention ---
    console.log('\n--- Test 7: Duplicate Submission Prevention ---');
    let duplicateErrorCaught = false;
    try {
      await submitPublicRating(TOKEN_VALID, 4); // attempt second submission
    } catch (err: any) {
      duplicateErrorCaught = true;
      assert(err.message.includes('already received a response'), 'Duplicate submission blocked with clear message');
    }
    assert(duplicateErrorCaught, 'Duplicate rating submission must be rejected');

    const alreadyRespondedView = await validateReviewToken(TOKEN_VALID);
    assert.strictEqual(alreadyRespondedView.status, 'already_responded', 'Subsequent token validation returns already_responded');
    assert.strictEqual(alreadyRespondedView.rating, 5, 'Shows previous rating of 5');
    assert.strictEqual(alreadyRespondedView.sentiment, 'positive', 'Shows previous positive sentiment');
    pass('Duplicate rating submission blocked and already_responded state displayed');

    // --- TEST 8: Negative / Constructive Rating Submission (2 Stars) ---
    console.log('\n--- Test 8: Negative Rating Submission (2 Stars) ---');
    const submitResult2 = await submitPublicRating(TOKEN_NEGATIVE, 2);
    assert.strictEqual(submitResult2.success, true, 'Submission returns success: true');
    assert.strictEqual(submitResult2.sentiment, 'negative', '2 stars classified as negative sentiment');
    assert.strictEqual(submitResult2.rating, 2, 'Recorded rating is 2');

    const req2 = mockReviewRequests.find((r) => r.secureToken === TOKEN_NEGATIVE);
    assert.strictEqual(req2?.status, 'negative', 'review_requests status updated to negative');
    assert.strictEqual(req2?.rating, 2, 'review_requests rating updated to 2');

    const fb2 = mockReviewFeedback.find((f) => f.reviewRequestId === 'p7-req-neg');
    assert(fb2 !== undefined, 'review_feedback record created for negative review');
    assert.strictEqual(fb2?.sentiment, 'negative', 'review_feedback sentiment is negative');
    pass('2-star submission persists negative sentiment for private service recovery');

    // Clean up test records
    try {
      await db.delete(reviewFeedback).where(eq(reviewFeedback.tenantId, TEST_TENANT));
      await db.delete(reviewRequests).where(eq(reviewRequests.tenantId, TEST_TENANT));
      await db.delete(leads).where(eq(leads.tenantId, TEST_TENANT));
      await db.delete(tenants).where(eq(tenants.id, TEST_TENANT));
    } catch (_) {}

    console.log('\n=============================================================');
    console.log(`🎉 ALL PHASE 7 PUBLIC CUSTOMER REVIEW TESTS PASSED: ${passedCount} / ${passedCount} assertions`);
    console.log('=============================================================\n');
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

runTests();
