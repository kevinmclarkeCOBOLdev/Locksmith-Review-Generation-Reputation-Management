import { db } from '../src/db';
import { reviewPlatformSettings, reviewTemplates, tenants, auditLogs } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import {
  getTenantReputationSettings,
  updatePlatformSettings,
  saveReviewTemplate,
} from '../src/services/settings.service';
import { mockTenants, mockAuditLogs } from '../src/db/mock';
import assert from 'assert';

const TENANT_A = 'test-sett-tenant-a';
const TENANT_B = 'test-sett-tenant-b';

let passedCount = 0;
function pass(message: string) {
  console.log(`✅ PASSED: ${message}`);
  passedCount++;
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('⚙️ LOCKREVIEW: PHASE 10 REPUTATION SETTINGS & PLATFORMS TESTS');
  console.log('=============================================================\n');

  try {
    // 0. Seed test fixtures
    console.log('--- Step 0: Seeding Isolated Test Fixtures ---');
    mockTenants.push(
      {
        id: TENANT_A,
        name: 'Prime Locksmiths London',
        businessPhone: '07700900333',
        businessEmail: 'prime@locksmith.test',
        logoUrl: null,
        createdAt: new Date(),
      },
      {
        id: TENANT_B,
        name: 'Guardian Locksmiths Ltd',
        businessPhone: '07700900444',
        businessEmail: 'guardian@locksmith.test',
        logoUrl: null,
        createdAt: new Date(),
      }
    );

    // --- TEST 1: Tenant Reputation Settings Retrieval & Defaults ---
    console.log('\n--- Test 1: Tenant Reputation Settings Retrieval & Defaults ---');
    const settingsA = await getTenantReputationSettings(TENANT_A);
    assert.strictEqual(settingsA.tenantId, TENANT_A, 'Tenant ID matches');
    assert.strictEqual(settingsA.businessName, 'Prime Locksmiths London', 'Business name matches');
    assert(Array.isArray(settingsA.platforms) && settingsA.platforms.length >= 4, 'Includes supported platforms');

    const googlePlatform = settingsA.platforms.find((p) => p.platformName === 'google');
    assert(googlePlatform !== undefined, 'Google Reviews platform is present');
    assert.strictEqual(googlePlatform?.isPrimary, true, 'Google is marked as primary destination');

    const smsTemplate = settingsA.templates.find((t) => t.channel === 'sms');
    assert(smsTemplate !== undefined, 'Default SMS template exists');
    assert(smsTemplate?.bodyTemplate.includes('{customer_name}'), 'SMS template contains dynamic token');
    pass('getTenantReputationSettings returns multi-platform configurations and dynamic templates');

    // --- TEST 2: Valid Review Destination URL Updates ---
    console.log('\n--- Test 2: Valid Review Destination URL Updates ---');
    const customGoogleUrl = 'https://g.page/r/Cb41234LondonLocksmiths/review';
    const customTrustpilotUrl = 'https://uk.trustpilot.com/review/primelocksmithslondon.co.uk';

    const updateResult = await updatePlatformSettings(TENANT_A, [
      { platformName: 'google', destinationUrl: customGoogleUrl, isEnabled: true },
      { platformName: 'trustpilot', destinationUrl: customTrustpilotUrl, isEnabled: true },
    ]);

    assert.strictEqual(updateResult.success, true, 'updatePlatformSettings returns success');
    assert.strictEqual(updateResult.updatedCount, 2, 'Updated 2 platform destinations');

    // Verify retrieval after update
    const updatedSettingsA = await getTenantReputationSettings(TENANT_A);
    const updatedGoogle = updatedSettingsA.platforms.find((p) => p.platformName === 'google');
    assert.strictEqual(updatedGoogle?.destinationUrl, customGoogleUrl, 'Custom Google Review URL persisted');
    assert.strictEqual(updatedGoogle?.isEnabled, true, 'Google platform is enabled');

    // Verify audit log
    const auditRecord = mockAuditLogs.find(
      (a: any) => a.tenantId === TENANT_A && a.event === 'REVIEW_PLATFORM_CONFIGURED'
    );
    assert(auditRecord !== undefined, 'REVIEW_PLATFORM_CONFIGURED audit log event written');
    pass('updatePlatformSettings persists validated destination URLs and logs audit trail');

    // --- TEST 3: Invalid Destination URL Rejection ---
    console.log('\n--- Test 3: Invalid Destination URL Rejection ---');
    let rejectedInvalidUrl = false;
    try {
      await updatePlatformSettings(TENANT_A, [
        { platformName: 'google', destinationUrl: 'invalid-url-without-scheme', isEnabled: true },
      ]);
    } catch (_) {
      rejectedInvalidUrl = true;
    }
    assert(rejectedInvalidUrl, 'Malformed URL without http/https must be rejected');

    let rejectedJsUrl = false;
    try {
      await updatePlatformSettings(TENANT_A, [
        { platformName: 'google', destinationUrl: 'javascript:alert("hack")', isEnabled: true },
      ]);
    } catch (_) {
      rejectedJsUrl = true;
    }
    assert(rejectedJsUrl, 'javascript: URI scheme must be rejected');
    pass('Strict destination URL validation rejects malformed and unsafe URLs');

    // --- TEST 4: Review Template Customization ---
    console.log('\n--- Test 4: Review Template Customization ---');
    const customSmsTemplate =
      'Hi {customer_name}! Thank you for choosing {business_name}. Rate your locksmith service in 1 click: {review_link}';

    const saveTemplateResult = await saveReviewTemplate(TENANT_A, {
      channel: 'sms',
      templateName: 'Short SMS Request',
      bodyTemplate: customSmsTemplate,
      isDefault: true,
    });

    assert.strictEqual(saveTemplateResult.success, true, 'saveReviewTemplate returns success');

    const templateAudit = mockAuditLogs.find(
      (a: any) => a.tenantId === TENANT_A && a.event === 'REVIEW_TEMPLATE_UPDATED'
    );
    assert(templateAudit !== undefined, 'REVIEW_TEMPLATE_UPDATED audit log event written');
    pass('saveReviewTemplate persists custom dynamic template and records audit event');

    // --- TEST 5: Cross-Tenant Settings Isolation ---
    console.log('\n--- Test 5: Cross-Tenant Settings Isolation ---');
    const settingsB = await getTenantReputationSettings(TENANT_B);
    const googleB = settingsB.platforms.find((p) => p.platformName === 'google');
    assert.notStrictEqual(
      googleB?.destinationUrl,
      customGoogleUrl,
      'Tenant B must NOT inherit Tenant A custom Google review URL'
    );
    pass('Tenant platform settings remain strictly isolated between business accounts');

    // Clean up
    try {
      await db.delete(auditLogs).where(eq(auditLogs.tenantId, TENANT_A));
      await db.delete(auditLogs).where(eq(auditLogs.tenantId, TENANT_B));
      await db.delete(reviewPlatformSettings).where(eq(reviewPlatformSettings.tenantId, TENANT_A));
      await db.delete(reviewPlatformSettings).where(eq(reviewPlatformSettings.tenantId, TENANT_B));
      await db.delete(reviewTemplates).where(eq(reviewTemplates.tenantId, TENANT_A));
      await db.delete(reviewTemplates).where(eq(reviewTemplates.tenantId, TENANT_B));
      await db.delete(tenants).where(eq(tenants.id, TENANT_A));
      await db.delete(tenants).where(eq(tenants.id, TENANT_B));
    } catch (_) {}

    console.log('\n=============================================================');
    console.log(`🎉 ALL PHASE 10 REPUTATION SETTINGS TESTS PASSED: ${passedCount} / ${passedCount} assertions`);
    console.log('=============================================================\n');
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

runTests();
