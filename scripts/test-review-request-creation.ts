import { db } from '../src/db';
import { leads, reviewRequests, tenants } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import {
  getEligibleLeads,
  checkDuplicateRequest,
  createReviewRequest,
  getReviewRequests,
  getReviewRequestById,
  renderTemplatePreview,
} from '../src/services/review.service';
import { mockLeads, mockTenants } from '../src/db/mock';
import assert from 'assert';

const TEST_TENANT_A = 'test-tenant-phase5-a';
const TEST_TENANT_B = 'test-tenant-phase5-b';
const TEST_LEAD_A1 = 'test-lead-p5-a1';
const TEST_LEAD_A2_NOPHONE = 'test-lead-p5-a2';
const TEST_LEAD_B1 = 'test-lead-p5-b1';

let passedCount = 0;
function pass(message: string) {
  console.log(`✅ PASSED: ${message}`);
  passedCount++;
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('📨 LOCKREVIEW: PHASE 5 REVIEW REQUEST CREATION TESTS');
  console.log('=============================================================\n');

  try {
    // 0. Seed test tenants and leads in database (or memory fallback)
    console.log('--- Step 0: Seeding Isolated Test Fixtures ---');
    mockTenants.push(
      { id: TEST_TENANT_A, name: 'Alpha 24/7 Locksmiths', businessPhone: '07700900111', businessEmail: 'alpha@locksmith.test', logoUrl: null, createdAt: new Date() },
      { id: TEST_TENANT_B, name: 'Beta Lock Security', businessPhone: '07700900222', businessEmail: 'beta@locksmith.test', logoUrl: null, createdAt: new Date() }
    );
    mockLeads.push(
      {
        id: TEST_LEAD_A1,
        tenantId: TEST_TENANT_A,
        name: 'Alice Smith',
        phone: '+447911000111',
        email: 'alice@example.com',
        postcode: 'SW1A 1AA',
        serviceType: 'Emergency Lockout',
        propertyType: 'Residential',
        urgency: 'Emergency',
        status: 'completed',
        createdAt: new Date(),
      },
      {
        id: TEST_LEAD_A2_NOPHONE,
        tenantId: TEST_TENANT_A,
        name: 'Arthur NoPhone',
        phone: '',
        email: 'arthur@example.com',
        postcode: 'E1 6AN',
        serviceType: 'UPVC Lock Fix',
        propertyType: 'Flat',
        urgency: 'Same Day',
        status: 'completed',
        createdAt: new Date(),
      },
      {
        id: TEST_LEAD_B1,
        tenantId: TEST_TENANT_B,
        name: 'Bob Jones (Tenant B)',
        phone: '+447922000222',
        email: 'bob@example.com',
        postcode: 'M1 1AE',
        serviceType: 'Commercial Access',
        propertyType: 'Office',
        urgency: 'Flexible',
        status: 'completed',
        createdAt: new Date(),
      }
    );

    try {
      await db.insert(tenants).values([
        { id: TEST_TENANT_A, name: 'Alpha 24/7 Locksmiths', businessPhone: '07700900111', businessEmail: 'alpha@locksmith.test' },
        { id: TEST_TENANT_B, name: 'Beta Lock Security', businessPhone: '07700900222', businessEmail: 'beta@locksmith.test' },
      ]);
    } catch (_) {}

    try {
      await db.insert(leads).values([
        {
          id: TEST_LEAD_A1,
          tenantId: TEST_TENANT_A,
          name: 'Alice Smith',
          phone: '+447911000111',
          email: 'alice@example.com',
          postcode: 'SW1A 1AA',
          serviceType: 'Emergency Lockout',
          propertyType: 'Residential',
          urgency: 'Emergency',
          status: 'completed',
        },
        {
          id: TEST_LEAD_A2_NOPHONE,
          tenantId: TEST_TENANT_A,
          name: 'Arthur NoPhone',
          phone: '',
          email: 'arthur@example.com',
          postcode: 'E1 6AN',
          serviceType: 'UPVC Lock Fix',
          propertyType: 'Flat',
          urgency: 'Same Day',
          status: 'completed',
        },
        {
          id: TEST_LEAD_B1,
          tenantId: TEST_TENANT_B,
          name: 'Bob Jones (Tenant B)',
          phone: '+447922000222',
          email: 'bob@example.com',
          postcode: 'M1 1AE',
          serviceType: 'Commercial Access',
          propertyType: 'Office',
          urgency: 'Flexible',
          status: 'completed',
        },
      ]);
    } catch (_) {}

    // --- TEST 1: Tenant-Scoped Eligible Leads Lookup ---
    console.log('\n--- Test 1: Tenant-Scoped Eligible Leads Lookup ---');
    const leadsResultA = await getEligibleLeads(TEST_TENANT_A, { limit: 10 });
    assert(leadsResultA.items.length >= 2, 'Should find at least 2 leads for Tenant A');
    const tenantBLeadsInA = leadsResultA.items.filter((l) => l.tenantId === TEST_TENANT_B);
    assert.strictEqual(tenantBLeadsInA.length, 0, 'Tenant A lookup must never contain Tenant B leads');
    pass('getEligibleLeads strictly isolates leads by tenantId');

    const searchResult = await getEligibleLeads(TEST_TENANT_A, { search: 'Alice' });
    assert(searchResult.items.some((l) => l.name === 'Alice Smith'), 'Should find lead Alice by search term');
    pass('Search filtering by customer name works accurately');

    // --- TEST 2: Template Interpolation ---
    console.log('\n--- Test 2: Dynamic Template Variable Interpolation ---');
    const rendered = renderTemplatePreview({
      templateBody: 'Hi {customer_name}, thanks for using {business_name}! Review: {review_link}',
      subject: 'Review request for {business_name}',
      customerName: 'Alice Smith',
      businessName: 'Alpha 24/7 Locksmiths',
      reviewLink: 'https://lockreview.atypikalstudio.dev/review/tok_1234567890abcdef',
    });

    assert(rendered.renderedBody.includes('Alice Smith'), 'Rendered body contains customer name');
    assert(rendered.renderedBody.includes('Alpha 24/7 Locksmiths'), 'Rendered body contains business name');
    assert(rendered.renderedBody.includes('tok_1234567890abcdef'), 'Rendered body contains review link');
    assert(!rendered.renderedBody.includes('{customer_name}'), 'All template variables interpolated');
    assert(rendered.renderedSubject?.includes('Alpha 24/7 Locksmiths'), 'Subject interpolated with business name');
    pass('renderTemplatePreview cleanly interpolates all dynamic tokens');

    // --- TEST 3: Contact Channel Validation ---
    console.log('\n--- Test 3: Contact Channel Validation ---');
    let phoneErrorCaught = false;
    try {
      await createReviewRequest({
        tenantId: TEST_TENANT_A,
        leadId: TEST_LEAD_A2_NOPHONE,
        channel: 'sms',
      });
    } catch (err: any) {
      phoneErrorCaught = true;
      assert(err.message.toLowerCase().includes('no phone number'), 'Error specifies missing phone');
    }
    assert(phoneErrorCaught, 'Should reject SMS review request when phone number is missing');
    pass('Channel contact validation prevents SMS requests to phone-less leads');

    // --- TEST 4: Review Request Creation & Cryptographic Token Generation ---
    console.log('\n--- Test 4: Review Request Creation & Cryptographic Token Generation ---');
    const createdReq = await createReviewRequest({
      tenantId: TEST_TENANT_A,
      leadId: TEST_LEAD_A1,
      channel: 'sms',
    });

    assert(createdReq.id, 'Created request must have an ID');
    assert.strictEqual(createdReq.tenantId, TEST_TENANT_A, 'Request must match tenantId');
    assert.strictEqual(createdReq.leadId, TEST_LEAD_A1, 'Request must match leadId');
    assert.strictEqual(createdReq.status, 'pending', 'Initial status must be pending');
    assert.strictEqual(createdReq.channel, 'sms', 'Channel must be sms');
    assert(createdReq.secureToken && createdReq.secureToken.length === 64, 'Token must be 64-character high-entropy hex string');
    pass('createReviewRequest generates valid record with 64-character secure token');

    // --- TEST 5: Duplicate Review Request Detection ---
    console.log('\n--- Test 5: Duplicate Review Request Detection ---');
    const dupCheck = await checkDuplicateRequest(TEST_TENANT_A, TEST_LEAD_A1);
    assert.strictEqual(dupCheck.isDuplicate, true, 'Should detect duplicate active review request');
    pass('checkDuplicateRequest detects active/recent request');

    let duplicateErrorCaught = false;
    try {
      await createReviewRequest({
        tenantId: TEST_TENANT_A,
        leadId: TEST_LEAD_A1,
        channel: 'sms',
        allowDuplicate: false,
      });
    } catch (err: any) {
      duplicateErrorCaught = true;
      assert.strictEqual(err.code, 'DUPLICATE_REQUEST_DETECTED', 'Error code must be DUPLICATE_REQUEST_DETECTED');
    }
    assert(duplicateErrorCaught, 'Should prevent duplicate request creation when allowDuplicate is false');
    pass('Duplicate prevention guard blocks redundant requests');

    // --- TEST 6: Explicit Duplicate Override ---
    console.log('\n--- Test 6: Explicit Duplicate Override ---');
    const overrideReq = await createReviewRequest({
      tenantId: TEST_TENANT_A,
      leadId: TEST_LEAD_A1,
      channel: 'email',
      allowDuplicate: true,
    });
    assert(overrideReq.id !== createdReq.id, 'Should create new request when allowDuplicate is true');
    pass('Explicit duplicate override allows intentional re-sending');

    // --- TEST 7: Cross-Tenant Modification & Inspection Defense ---
    console.log('\n--- Test 7: Cross-Tenant Modification & Inspection Defense ---');
    let crossTenantErrorCaught = false;
    try {
      // Tenant A trying to create a request for Tenant B's lead
      await createReviewRequest({
        tenantId: TEST_TENANT_A,
        leadId: TEST_LEAD_B1,
        channel: 'sms',
      });
    } catch (err: any) {
      crossTenantErrorCaught = true;
      assert(err.message.includes('not found or does not belong'), 'Error states record not found for tenant');
    }
    assert(crossTenantErrorCaught, 'Cross-tenant lead request creation must be rejected');
    pass('Cross-tenant lead request creation strictly blocked');

    // Tenant B trying to fetch Tenant A's review request by ID
    const crossTenantGet = await getReviewRequestById(TEST_TENANT_B, createdReq.id);
    assert.strictEqual(crossTenantGet, null, 'Tenant B must receive null when querying Tenant A request');
    pass('Cross-tenant request lookup returns null');

    // --- TEST 8: Pagination & Joined Lead Info ---
    console.log('\n--- Test 8: Pagination & Joined Lead Data ---');
    const listResult = await getReviewRequests(TEST_TENANT_A, { page: 1, limit: 10 });
    assert(listResult.items.length >= 2, 'Should retrieve list of created requests');
    assert(listResult.items[0].customerName, 'Review request must include joined customerName');
    assert(listResult.items[0].serviceType, 'Review request must include joined serviceType');
    pass('getReviewRequests returns paginated list with joined customer data');

    // Clean up test records
    try {
      await db.delete(reviewRequests).where(eq(reviewRequests.tenantId, TEST_TENANT_A));
      await db.delete(reviewRequests).where(eq(reviewRequests.tenantId, TEST_TENANT_B));
      await db.delete(leads).where(eq(leads.tenantId, TEST_TENANT_A));
      await db.delete(leads).where(eq(leads.tenantId, TEST_TENANT_B));
      await db.delete(tenants).where(eq(tenants.id, TEST_TENANT_A));
      await db.delete(tenants).where(eq(tenants.id, TEST_TENANT_B));
    } catch (_) {}

    console.log('\n=============================================================');
    console.log(`🎉 ALL PHASE 5 REVIEW REQUEST TESTS PASSED: ${passedCount} / ${passedCount} assertions`);
    console.log('=============================================================\n');
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

runTests();
