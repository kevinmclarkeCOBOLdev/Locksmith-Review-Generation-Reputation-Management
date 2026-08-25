import { db } from '../src/db';
import { leads, reviewRequests, tenants } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { ResendProvider } from '../src/providers/email/ResendProvider';
import { NodemailerProvider } from '../src/providers/email/NodemailerProvider';
import { DefaultSMSProvider } from '../src/providers/sms/SMSProvider';
import { dispatchReviewRequest, retryReviewRequestDelivery, getNotificationHealth } from '../src/services/notification.service';
import { createReviewRequest } from '../src/services/review.service';
import { mockLeads, mockTenants } from '../src/db/mock';
import assert from 'assert';

const TEST_TENANT_A = 'test-tenant-p6-a';
const TEST_TENANT_B = 'test-tenant-p6-b';
const TEST_LEAD_A = 'test-lead-p6-a';

let passedCount = 0;
function pass(message: string) {
  console.log(`✅ PASSED: ${message}`);
  passedCount++;
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('📬 LOCKREVIEW: PHASE 6 NOTIFICATION DELIVERY TESTS');
  console.log('=============================================================\n');

  try {
    // 0. Seed test fixtures
    console.log('--- Step 0: Seeding Isolated Test Fixtures ---');
    mockTenants.push(
      { id: TEST_TENANT_A, name: 'Alpha 24/7 Locksmiths', businessPhone: '07700900111', businessEmail: 'alpha@locksmith.test', logoUrl: null, createdAt: new Date() },
      { id: TEST_TENANT_B, name: 'Beta Lock Security', businessPhone: '07700900222', businessEmail: 'beta@locksmith.test', logoUrl: null, createdAt: new Date() }
    );
    mockLeads.push({
      id: TEST_LEAD_A,
      tenantId: TEST_TENANT_A,
      name: 'Oliver Queen',
      phone: '+447911999888',
      email: 'oliver.queen@example.com',
      postcode: 'SW1A 1AA',
      serviceType: 'High-Security Deadbolt Installation',
      propertyType: 'Penthouse',
      urgency: 'Same Day',
      status: 'completed',
      createdAt: new Date(),
    });

    try {
      await db.insert(tenants).values([
        { id: TEST_TENANT_A, name: 'Alpha 24/7 Locksmiths', businessPhone: '07700900111', businessEmail: 'alpha@locksmith.test' },
        { id: TEST_TENANT_B, name: 'Beta Lock Security', businessPhone: '07700900222', businessEmail: 'beta@locksmith.test' },
      ]);
    } catch (_) {}

    try {
      await db.insert(leads).values({
        id: TEST_LEAD_A,
        tenantId: TEST_TENANT_A,
        name: 'Oliver Queen',
        phone: '+447911999888',
        email: 'oliver.queen@example.com',
        postcode: 'SW1A 1AA',
        serviceType: 'High-Security Deadbolt Installation',
        propertyType: 'Penthouse',
        urgency: 'Same Day',
        status: 'completed',
      });
    } catch (_) {}

    // --- TEST 1: Resend Provider Abstraction ---
    console.log('\n--- Test 1: Resend Email Provider Abstraction ---');
    const resendProvider = new ResendProvider();
    const resendResult = await resendProvider.sendEmail({
      to: 'customer@example.com',
      subject: 'How was your locksmith service?',
      html: '<p>Please leave feedback</p>',
    });
    assert(resendResult.success === true, 'Resend sendEmail returns success');
    assert(typeof resendResult.id === 'string' && resendResult.id.length > 0, 'Resend provider returns message ID');
    assert.strictEqual(resendResult.provider, 'Resend', 'Provider identifier is Resend');
    pass('ResendProvider delivers and captures message ID');

    // --- TEST 2: Nodemailer (Hostinger SMTP) Provider Abstraction ---
    console.log('\n--- Test 2: Nodemailer SMTP Provider Abstraction ---');
    const nodemailerProvider = new NodemailerProvider();
    const smtpResult = await nodemailerProvider.sendEmail({
      to: 'customer@example.com',
      subject: 'Review request from DEMO Locksmith',
      html: '<p>Thank you for choosing our team.</p>',
    });
    assert(smtpResult.success === true, 'Nodemailer sendEmail returns success');
    assert(typeof smtpResult.id === 'string' && smtpResult.id.length > 0, 'SMTP provider returns message ID');
    pass('NodemailerProvider delivers and captures message ID');

    // --- TEST 3: SMS Provider Gateway & Validation ---
    console.log('\n--- Test 3: SMS Provider Gateway & Validation ---');
    const smsProvider = new DefaultSMSProvider();
    const smsResult = await smsProvider.sendSMS({
      to: '+447911999888',
      body: 'Hi Oliver, thanks for using Alpha Locksmiths! Please rate us: https://lockreview.atypikalstudio.dev/review/tok_123',
    });
    assert(smsResult.success === true, 'SMS send returns success');
    assert(typeof smsResult.messageId === 'string' && smsResult.messageId.startsWith('sms-msg-'), 'SMS provider returns formatted message ID');
    pass('DefaultSMSProvider dispatches and generates message ID');

    const emptyPhoneResult = await smsProvider.sendSMS({ to: '', body: 'Test' });
    assert(emptyPhoneResult.success === false, 'SMS send rejects empty recipient');
    pass('SMS provider validates recipient requirement');

    // --- TEST 4: End-to-End Notification Dispatch for Review Request ---
    console.log('\n--- Test 4: End-to-End Review Request Dispatch ---');
    const newReq = await createReviewRequest({
      tenantId: TEST_TENANT_A,
      leadId: TEST_LEAD_A,
      channel: 'both',
      allowDuplicate: true,
      autoDispatch: false, // create as pending first to test dispatch explicitly
    });

    assert.strictEqual(newReq.status, 'pending', 'Review request created in pending state');

    const dispatchResult = await dispatchReviewRequest({
      reviewRequestId: newReq.id,
      tenantId: TEST_TENANT_A,
    });

    assert.strictEqual(dispatchResult.success, true, 'dispatchReviewRequest returned success: true');
    assert.strictEqual(dispatchResult.status, 'sent', 'Status transitioned to sent');
    assert.strictEqual(dispatchResult.channels.length, 2, 'Dispatched to both SMS and Email channels');
    assert(dispatchResult.channels.every((c) => c.success), 'Both channels succeeded');
    assert(dispatchResult.sentAt instanceof Date, 'sentAt timestamp recorded');
    pass('dispatchReviewRequest dispatches to all configured channels and returns evidence');

    // --- TEST 5: Cross-Tenant Dispatch Protection ---
    console.log('\n--- Test 5: Cross-Tenant Dispatch Protection ---');
    let crossTenantErrorCaught = false;
    try {
      await dispatchReviewRequest({
        reviewRequestId: newReq.id,
        tenantId: TEST_TENANT_B, // Tenant B trying to dispatch Tenant A request
      });
    } catch (err: any) {
      crossTenantErrorCaught = true;
      assert(err.message.includes('not found or does not belong'), 'Error prevents cross-tenant dispatch');
    }
    assert(crossTenantErrorCaught, 'Cross-tenant dispatch attempt must be rejected');
    pass('Cross-tenant dispatch strictly blocked');

    // --- TEST 6: Retry Delivery Flow ---
    console.log('\n--- Test 6: Retry Delivery Flow ---');
    const retryResult = await retryReviewRequestDelivery(TEST_TENANT_A, newReq.id);
    assert.strictEqual(retryResult.success, true, 'retryReviewRequestDelivery returns success');
    assert.strictEqual(retryResult.status, 'sent', 'Status remains sent upon retry');
    pass('retryReviewRequestDelivery successfully re-dispatches notification');

    // --- TEST 7: Operational Health Check ---
    console.log('\n--- Test 7: Operational Health Check ---');
    const health = await getNotificationHealth();
    assert(typeof health.email === 'object', 'Email health status returned');
    assert(typeof health.sms === 'object', 'SMS health status returned');
    assert(health.sms.healthy === true, 'SMS gateway reports healthy');
    pass('getNotificationHealth returns operational diagnostics');

    // Clean up test records
    try {
      await db.delete(reviewRequests).where(eq(reviewRequests.tenantId, TEST_TENANT_A));
      await db.delete(leads).where(eq(leads.tenantId, TEST_TENANT_A));
      await db.delete(tenants).where(eq(tenants.id, TEST_TENANT_A));
      await db.delete(tenants).where(eq(tenants.id, TEST_TENANT_B));
    } catch (_) {}

    console.log('\n=============================================================');
    console.log(`🎉 ALL PHASE 6 NOTIFICATION DELIVERY TESTS PASSED: ${passedCount} / ${passedCount} assertions`);
    console.log('=============================================================\n');
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

runTests();
