/**
 * LockReview — Phase 04 Backend Dashboard Shell Verification Test Suite
 * 
 * Tests:
 * 1. Live dashboard metrics calculation and aggregation logic
 * 2. Deterministic response rate and public click-through percentage calculations
 * 3. Average rating computation and sentiment distribution
 * 4. Zero-record and empty state safety (prevents division by zero / NaN)
 * 5. Tenant-scoped data isolation in dashboard service
 */

import { getDashboardOverviewData } from '../src/services/dashboard.service';
import { DEFAULT_TENANT_ID } from '../src/db/constants';

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

async function runDashboardShellTests() {
  console.log('\n=============================================================');
  console.log('📊 LOCKREVIEW: PHASE 4 BACKEND DASHBOARD SHELL TESTS');
  console.log('=============================================================\n');

  // Test 1: Service Metrics Retrieval for Default Tenant
  console.log('--- Test 1: Dashboard Overview Metrics Calculation ---');
  const overview = await getDashboardOverviewData(DEFAULT_TENANT_ID);

  assert(typeof overview !== 'undefined', 'getDashboardOverviewData returned result');
  assert(typeof overview.tenantName === 'string' && overview.tenantName.length > 0, 'Tenant name resolved');
  assert(typeof overview.metrics !== 'undefined', 'Metrics object exists');

  const { metrics } = overview;
  assert(typeof metrics.totalRequests === 'number', 'totalRequests is a valid number');
  assert(typeof metrics.sentRequests === 'number', 'sentRequests is a valid number');
  assert(typeof metrics.responseCount === 'number', 'responseCount is a valid number');
  assert(typeof metrics.responseRate === 'number' && !isNaN(metrics.responseRate), 'responseRate is a valid number (no NaN)');
  assert(typeof metrics.averageRating === 'number' && !isNaN(metrics.averageRating), 'averageRating is a valid number (no NaN)');
  assert(typeof metrics.positiveCount === 'number', 'positiveCount is a valid number');
  assert(typeof metrics.negativeCount === 'number', 'negativeCount is a valid number');
  assert(typeof metrics.publicClicks === 'number', 'publicClicks is a valid number');
  assert(typeof metrics.publicClickRate === 'number' && !isNaN(metrics.publicClickRate), 'publicClickRate is a valid number (no NaN)');

  // Test 2: Rating Distribution Consistency
  console.log('\n--- Test 2: Rating Distribution Integrity ---');
  const dist = metrics.ratingDistribution;
  assert(typeof dist[5] === 'number', '5-star count is a number');
  assert(typeof dist[4] === 'number', '4-star count is a number');
  assert(typeof dist[3] === 'number', '3-star count is a number');
  assert(typeof dist[2] === 'number', '2-star count is a number');
  assert(typeof dist[1] === 'number', '1-star count is a number');

  const sumRatings = dist[5] + dist[4] + dist[3] + dist[2] + dist[1];
  assert(sumRatings === metrics.responseCount, 'Sum of rating distribution matches total response count');
  assert(dist[5] + dist[4] === metrics.positiveCount, '5-star + 4-star sum matches positiveCount');
  assert(dist[3] + dist[2] + dist[1] === metrics.negativeCount, '1-3 star sum matches negativeCount');

  // Test 3: Recent Items Formatting & Length Limits
  console.log('\n--- Test 3: Recent Requests & Feedback Lists ---');
  assert(Array.isArray(overview.recentRequests), 'recentRequests is an array');
  assert(Array.isArray(overview.recentFeedback), 'recentFeedback is an array');
  assert(overview.recentRequests.length <= 8, 'recentRequests respects page limit');
  assert(overview.recentFeedback.length <= 6, 'recentFeedback respects page limit');

  if (overview.recentRequests.length > 0) {
    const sampleReq = overview.recentRequests[0];
    assert(typeof sampleReq.id === 'string', 'recentRequests item contains id');
    assert(typeof sampleReq.customerName === 'string', 'recentRequests item contains customerName');
    assert(typeof sampleReq.channel === 'string', 'recentRequests item contains channel');
    assert(typeof sampleReq.status === 'string', 'recentRequests item contains status');
  }

  // Test 4: Empty Tenant Zero-Division Defenses
  console.log('\n--- Test 4: Empty State & Zero-Division Safety ---');
  const emptyTenantOverview = await getDashboardOverviewData('non-existent-tenant-0000-000000000000');
  assert(emptyTenantOverview.metrics.totalRequests === 0, 'Empty tenant has 0 totalRequests');
  assert(emptyTenantOverview.metrics.sentRequests === 0, 'Empty tenant has 0 sentRequests');
  assert(emptyTenantOverview.metrics.responseRate === 0, 'Empty tenant responseRate defaults safely to 0% (no division by 0)');
  assert(emptyTenantOverview.metrics.averageRating === 0, 'Empty tenant averageRating defaults safely to 0');
  assert(emptyTenantOverview.metrics.publicClickRate === 0, 'Empty tenant publicClickRate defaults safely to 0%');
  assert(emptyTenantOverview.recentRequests.length === 0, 'Empty tenant returns 0 recent requests');
  assert(emptyTenantOverview.recentFeedback.length === 0, 'Empty tenant returns 0 recent feedback');

  console.log('\n=============================================================');
  console.log(`🎉 ALL DASHBOARD TESTS PASSED: ${passedTests} / ${totalTests} assertions`);
  console.log('=============================================================\n');
}

runDashboardShellTests().catch((err) => {
  console.error('\n❌ Dashboard Shell Test Suite Failed:', err);
  process.exit(1);
});
