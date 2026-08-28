import { DemoResetScheduler } from '../src/services/demo/DemoResetScheduler';
import { demoResetService } from '../src/services/demo/DemoResetService';
import { DEFAULT_TENANT_ID } from '../src/db/constants';
import assert from 'assert';

let passedCount = 0;
function pass(message: string) {
  console.log(`✅ PASSED: ${message}`);
  passedCount++;
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('🔄 LOCKREVIEW: NIGHTLY DEMO RESET & SCHEDULER TESTS (02:00)');
  console.log('=============================================================\n');

  const originalEnv = { ...process.env };
  const scheduler = new DemoResetScheduler();

  try {
    // --- TEST 1: Configuration & Schedule Time Parsing ---
    console.log('--- Test 1: Configuration & Schedule Time Parsing ---');
    delete process.env.DEMO_RESET_SCHEDULE_TIME;
    const defaultTime = scheduler.getScheduleTime();
    assert.strictEqual(defaultTime.hour, 2, 'Default hour is 2 (02:00)');
    assert.strictEqual(defaultTime.minute, 0, 'Default minute is 0');
    assert.strictEqual(defaultTime.raw, '02:00', 'Default time formatted is 02:00');
    pass('Default schedule time parses to 02:00 when env variable is not set');

    process.env.DEMO_RESET_SCHEDULE_TIME = '03:45';
    const customTime = scheduler.getScheduleTime();
    assert.strictEqual(customTime.hour, 3, 'Custom hour parsed correctly');
    assert.strictEqual(customTime.minute, 45, 'Custom minute parsed correctly');
    assert.strictEqual(customTime.raw, '03:45', 'Custom raw string formatted correctly');
    pass('Custom schedule time parses correctly');

    process.env.DEMO_RESET_SCHEDULE_TIME = 'invalid-time-format';
    const fallbackTime = scheduler.getScheduleTime();
    assert.strictEqual(fallbackTime.hour, 2, 'Fallback hour is 2');
    assert.strictEqual(fallbackTime.minute, 0, 'Fallback minute is 0');
    assert.strictEqual(fallbackTime.raw, '02:00', 'Fallback raw string is 02:00');
    pass('Malformed time string safely falls back to default 02:00');

    process.env.DEMO_RESET_SCHEDULE_ENABLED = 'false';
    assert.strictEqual(scheduler.isEnabled(), false, 'Disabled when DEMO_RESET_SCHEDULE_ENABLED=false');
    process.env.DEMO_RESET_SCHEDULE_ENABLED = 'true';
    assert.strictEqual(scheduler.isEnabled(), true, 'Enabled when DEMO_RESET_SCHEDULE_ENABLED=true');
    pass('Scheduler respects DEMO_RESET_SCHEDULE_ENABLED configuration');

    // Reset env
    delete process.env.DEMO_RESET_SCHEDULE_TIME;
    delete process.env.DEMO_RESET_SCHEDULE_ENABLED;

    // --- TEST 2: calculateNextRun Target Calculations ---
    console.log('\n--- Test 2: calculateNextRun Target Calculations ---');
    // Scenario 2a: Mock time is 01:15 (before 02:00) -> should target today 02:00 (45 mins away)
    const mockBefore = new Date('2026-08-28T01:15:00.000Z');
    mockBefore.setHours(1, 15, 0, 0);
    const runBefore = scheduler.calculateNextRun(mockBefore);
    assert.strictEqual(runBefore.nextRunDate.getDate(), mockBefore.getDate(), 'Targets same day');
    assert.strictEqual(runBefore.nextRunDate.getHours(), 2, 'Targets 02:00 hour');
    assert.strictEqual(runBefore.nextRunDate.getMinutes(), 0, 'Targets 00 minute');
    assert.strictEqual(runBefore.delayMs, 45 * 60 * 1000, 'Delay is exactly 45 minutes');
    pass('calculateNextRun accurately targets today 02:00 if current time is before 02:00');

    // Scenario 2b: Mock time is 02:30 (after 02:00) -> should target tomorrow 02:00 (~23.5 hours away)
    const mockAfter = new Date('2026-08-28T02:30:00.000Z');
    mockAfter.setHours(2, 30, 0, 0);
    const runAfter = scheduler.calculateNextRun(mockAfter);
    const expectedTomorrow = new Date(mockAfter.getTime());
    expectedTomorrow.setDate(expectedTomorrow.getDate() + 1);
    assert.strictEqual(runAfter.nextRunDate.getDate(), expectedTomorrow.getDate(), 'Targets tomorrow');
    assert.strictEqual(runAfter.nextRunDate.getHours(), 2, 'Targets 02:00 hour');
    assert.strictEqual(runAfter.delayMs, 23.5 * 3600 * 1000, 'Delay is exactly 23.5 hours');
    pass('calculateNextRun accurately targets tomorrow 02:00 if current time is after 02:00');

    // Scenario 2c: Mock time is exactly 02:00:00 -> should target tomorrow 02:00 (24 hours away)
    const mockExact = new Date('2026-08-28T02:00:00.000Z');
    mockExact.setHours(2, 0, 0, 0);
    const runExact = scheduler.calculateNextRun(mockExact);
    assert.strictEqual(runExact.delayMs, 24 * 3600 * 1000, 'Delay is exactly 24 hours');
    pass('calculateNextRun accurately schedules next day when triggered exactly at 02:00');

    // --- TEST 3: Scheduler Lifecycle & Status Reporting ---
    console.log('\n--- Test 3: Scheduler Lifecycle & Status Reporting ---');
    const started = scheduler.startScheduler();
    assert.strictEqual(started, true, 'startScheduler returns true');

    let status = scheduler.getStatus();
    assert.strictEqual(status.active, true, 'Scheduler status is active');
    assert.strictEqual(status.scheduleTime, '02:00', 'Schedule time is 02:00');
    assert.ok(status.nextScheduledRunAt, 'nextScheduledRunAt timestamp is populated');

    // Multiple startScheduler calls are safe & idempotent
    const startedAgain = scheduler.startScheduler();
    assert.strictEqual(startedAgain, true, 'Subsequent startScheduler is idempotent');

    scheduler.stopScheduler();
    status = scheduler.getStatus();
    assert.strictEqual(status.active, false, 'Scheduler status is inactive after stop');
    assert.strictEqual(status.nextScheduledRunAt, null, 'nextScheduledRunAt is null after stop');
    pass('Scheduler starts, reports active status, and stops cleanly');

    // --- TEST 4: DemoResetService Execution & Idempotency ---
    console.log('\n--- Test 4: DemoResetService Execution & Idempotency ---');
    const result1 = await demoResetService.executeDemoReset({
      tenantId: DEFAULT_TENANT_ID,
      triggeredBy: 'Automated Test Suite (Run 1)',
    });

    assert.strictEqual(result1.success, true, 'Demo reset execution succeeded');
    assert.strictEqual(result1.tenantId, DEFAULT_TENANT_ID, 'Target tenant matches default');
    assert.ok(result1.summary.leadsReset >= 6, 'Demo leads reset');
    assert.ok(result1.summary.reviewRequestsReset >= 4, 'Demo review requests reset');
    assert.ok(result1.summary.reviewFeedbackReset >= 3, 'Demo review feedback reset');
    assert.ok(result1.summary.usersReset >= 3, 'Demo admin users reset');
    assert.strictEqual(result1.summary.platformSettingsReset, 3, 'Default review platforms reset (Google, Trustpilot, Checkatrade)');
    assert.strictEqual(result1.summary.templatesReset, 2, 'Default SMS & Email review templates reset');

    // Run 2 immediately after to verify idempotency
    const result2 = await demoResetService.executeDemoReset({
      tenantId: DEFAULT_TENANT_ID,
      triggeredBy: 'Automated Test Suite (Run 2)',
    });
    assert.strictEqual(result2.success, true, 'Second consecutive demo reset succeeded cleanly');
    assert.strictEqual(result2.summary.leadsReset, result1.summary.leadsReset, 'Idempotent leads count');
    assert.strictEqual(result2.summary.reviewRequestsReset, result1.summary.reviewRequestsReset, 'Idempotent requests count');
    pass('executeDemoReset executes idempotently without duplicate record pollution');

    // Check service status
    const serviceStatus = demoResetService.getDemoResetStatus();
    assert.ok(serviceStatus.lastAttemptedAt, 'lastAttemptedAt is tracked');
    assert.ok(serviceStatus.lastSuccessfulAt, 'lastSuccessfulAt is tracked');
    assert.strictEqual(serviceStatus.lastFailedAt, null, 'lastFailedAt remains null');
    assert.strictEqual(serviceStatus.lastErrorSummary, null, 'lastErrorSummary remains null');
    pass('DemoResetService status metrics track timestamps and health');

    // --- TEST 5: Secret Sanitization Defense ---
    console.log('\n--- Test 5: Secret Sanitization Defense ---');
    const demoServiceAny = demoResetService as any;
    const sensitiveError = new Error(
      'Database failed on mysql://root:SuperSecretPassword123!@127.0.0.1:3306/lockquote?password=SuperSecretPassword123!'
    );
    const sanitized = demoServiceAny.sanitizeErrorMessage(sensitiveError);
    assert.doesNotMatch(sanitized, /SuperSecretPassword123!/, 'Password must NOT be leaked in error message');
    assert.match(sanitized, /\[REDACTED\]/, 'Sensitive credentials replaced with [REDACTED]');
    pass('sanitizeErrorMessage scrubs sensitive database passwords and connection strings');

    console.log('\n=============================================================');
    console.log(`🎉 ALL NIGHTLY DEMO RESET TESTS PASSED: ${passedCount} / ${passedCount} assertions`);
    console.log('=============================================================\n');
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  } finally {
    scheduler.stopScheduler();
    process.env = { ...originalEnv };
  }
}

runTests();
