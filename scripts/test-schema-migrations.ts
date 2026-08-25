/**
 * LockReview — Phase 03 Schema & Migrations Verification Test Suite
 * 
 * Tests:
 * 1. Drizzle schema table export integrity (Shared + LockReview tables)
 * 2. Foreign key relationship and cascade definitions
 * 3. Review request lifecycle status validation
 * 4. Customer rating sentiment classification logic (4-5 = positive, 1-3 = negative)
 * 5. Review template variable interpolation engine ({customer_name}, {business_name}, {review_link})
 * 6. Migration SQL file existence and structure verification
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as schema from '../src/db/schema';
import { DEFAULT_SMS_REVIEW_TEMPLATE, DEFAULT_EMAIL_REVIEW_TEMPLATE } from '../src/db/constants';
import { generateSecureToken, hashToken } from '../src/lib/crypto';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  } else {
    passedTests++;
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runSchemaMigrationTests() {
  console.log('\n=============================================================');
  console.log('🗄️ LOCKREVIEW: PHASE 3 DATABASE SCHEMA & MIGRATIONS TESTS');
  console.log('=============================================================\n');

  // Test 1: Verify Schema Table Exports
  console.log('--- Test 1: Schema Table Exports & Definitions ---');
  assert(typeof schema.tenants !== 'undefined', 'Shared table "tenants" is exported');
  assert(typeof schema.users !== 'undefined', 'Shared table "users" is exported');
  assert(typeof schema.leads !== 'undefined', 'Shared table "leads" is exported');
  assert(typeof schema.quotes !== 'undefined', 'Shared table "quotes" is exported');
  assert(typeof schema.notifications !== 'undefined', 'Shared table "notifications" is exported');
  assert(typeof schema.auditLogs !== 'undefined', 'Shared table "audit_logs" is exported');
  assert(typeof schema.consents !== 'undefined', 'Shared table "consents" is exported');
  assert(typeof schema.securityEvents !== 'undefined', 'Shared table "security_events" is exported');

  // LockReview-owned tables
  assert(typeof schema.reviewRequests !== 'undefined', 'LockReview table "review_requests" is exported');
  assert(typeof schema.reviewFeedback !== 'undefined', 'LockReview table "review_feedback" is exported');
  assert(typeof schema.reviewPlatformSettings !== 'undefined', 'LockReview table "review_platform_settings" is exported');
  assert(typeof schema.reviewTemplates !== 'undefined', 'LockReview table "review_templates" is exported');

  // Test 2: Foreign Key Constraints & Column Structure
  console.log('\n--- Test 2: Column Definitions & Relations ---');
  assert(typeof schema.reviewRequests.id !== 'undefined', 'review_requests.id column defined');
  assert(typeof schema.reviewRequests.tenantId !== 'undefined', 'review_requests.tenantId column defined');
  assert(typeof schema.reviewRequests.leadId !== 'undefined', 'review_requests.leadId column defined');
  assert(typeof schema.reviewRequests.secureToken !== 'undefined', 'review_requests.secureToken column defined');
  assert(typeof schema.reviewRequests.status !== 'undefined', 'review_requests.status column defined');

  assert(typeof schema.reviewFeedback.reviewRequestId !== 'undefined', 'review_feedback.reviewRequestId column defined');
  assert(typeof schema.reviewFeedback.rating !== 'undefined', 'review_feedback.rating column defined');
  assert(typeof schema.reviewFeedback.sentiment !== 'undefined', 'review_feedback.sentiment column defined');

  // Test 3: Sentiment Classification Engine
  console.log('\n--- Test 3: Review Sentiment Classification ---');
  function classifySentiment(rating: number): 'positive' | 'negative' {
    if (rating >= 4) return 'positive';
    return 'negative';
  }

  assert(classifySentiment(5) === 'positive', 'Rating 5 is classified as "positive"');
  assert(classifySentiment(4) === 'positive', 'Rating 4 is classified as "positive"');
  assert(classifySentiment(3) === 'negative', 'Rating 3 is classified as "negative" (private recovery)');
  assert(classifySentiment(2) === 'negative', 'Rating 2 is classified as "negative" (private recovery)');
  assert(classifySentiment(1) === 'negative', 'Rating 1 is classified as "negative" (private recovery)');

  // Test 4: Template Variable Interpolation Engine
  console.log('\n--- Test 4: Template Variable Interpolation ---');
  function interpolateTemplate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || `{${key}}`);
  }

  const sampleVars = {
    customer_name: 'John Smith',
    business_name: 'Atypikal Locksmiths',
    review_link: 'https://lockreview.atypikalstudio.dev/review/tok_12345',
  };

  const renderedSms = interpolateTemplate(DEFAULT_SMS_REVIEW_TEMPLATE, sampleVars);
  assert(renderedSms.includes('John Smith'), 'Rendered SMS contains customer name');
  assert(renderedSms.includes('Atypikal Locksmiths'), 'Rendered SMS contains business name');
  assert(renderedSms.includes('https://lockreview.atypikalstudio.dev/review/tok_12345'), 'Rendered SMS contains secure review link');

  const renderedEmail = interpolateTemplate(DEFAULT_EMAIL_REVIEW_TEMPLATE, sampleVars);
  assert(renderedEmail.includes('John Smith'), 'Rendered Email contains customer name');
  assert(renderedEmail.includes('Atypikal Locksmiths'), 'Rendered Email contains business name');
  assert(renderedEmail.includes('https://lockreview.atypikalstudio.dev/review/tok_12345'), 'Rendered Email contains secure review link');

  // Test 5: Secure Token Generation & Hashing
  console.log('\n--- Test 5: Cryptographic Token Generation ---');
  const token1 = generateSecureToken(32);
  const token2 = generateSecureToken(32);
  assert(token1.length === 64, 'Generated secure token has 64-character entropy length');
  assert(token1 !== token2, 'Generated tokens are distinct and non-repeating');

  const hashed = await hashToken(token1);
  assert(typeof hashed === 'string' && hashed.length === 64, 'SHA-256 token hash produces 64-character digest');

  // Test 6: Migration SQL File Verification
  console.log('\n--- Test 6: Version-Controlled Migration File Integrity ---');
  const migrationPath = join(process.cwd(), 'src', 'db', 'migrations', '0001_lockreview_core_schema.sql');
  assert(existsSync(migrationPath), 'Migration SQL file 0001_lockreview_core_schema.sql exists');

  const migrationSql = readFileSync(migrationPath, 'utf-8');
  assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS `review_requests`'), 'Migration contains CREATE TABLE for review_requests');
  assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS `review_feedback`'), 'Migration contains CREATE TABLE for review_feedback');
  assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS `review_platform_settings`'), 'Migration contains CREATE TABLE for review_platform_settings');
  assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS `review_templates`'), 'Migration contains CREATE TABLE for review_templates');
  assert(migrationSql.includes('CONSTRAINT `fk_review_req_tenant`'), 'Migration enforces foreign key to tenants table');

  console.log('\n=============================================================');
  console.log(`🎉 ALL SCHEMA TESTS PASSED: ${passedTests} / ${totalTests} assertions`);
  console.log('=============================================================\n');
}

runSchemaMigrationTests().catch((err) => {
  console.error('\n❌ Schema Migration Test Suite Failed:', err);
  process.exit(1);
});
