// Projects API Load Test
// Tests project listing and detail retrieval

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { BASE_URL, thresholds, randomString } from './utils/config.js';

// Custom metrics
const apiErrorRate = new Rate('api_errors');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Ramp up to 20 users
    { duration: '3m', target: 20 },   // Stay at 20 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    ...thresholds,
    api_errors: ['rate<0.02'],  // API error rate < 2%
  },
};

// Test user credentials (replace with actual test accounts)
const TEST_USER = {
  email: 'designer@elvenwood.test',
  password: 'TestPassword123!',
};

export function setup() {
  // Login once to get token for all VUs
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify(TEST_USER),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (loginRes.status === 200 && loginRes.json('token')) {
    return { token: loginRes.json('token') };
  }

  console.warn('Setup: Login failed. Tests will run without authentication.');
  return { token: null };
}

export default function(data) {
  const headers = data.token ? {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  } : {
    'Content-Type': 'application/json',
  };

  group('List Projects', function() {
    const listRes = http.get(
      `${BASE_URL}/api/projects?page=1&limit=10`,
      { headers }
    );

    const success = check(listRes, {
      'list status is 200': (r) => r.status === 200,
      'list response time < 300ms': (r) => r.timings.duration < 300,
      'list returns array': (r) => {
        try {
          const body = r.json();
          return Array.isArray(body.projects || body.data || body);
        } catch {
          return false;
        }
      },
    });

    apiErrorRate.add(!success);
  });

  sleep(1);

  group('Get Project Details', function() {
    // Try to get a specific project
    // Note: This will fail if no projects exist - that's okay for testing
    const detailRes = http.get(
      `${BASE_URL}/api/projects/1`,
      { headers }
    );

    check(detailRes, {
      'detail response time < 200ms': (r) => r.timings.duration < 200,
      'detail status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    });
  });

  sleep(Math.random() * 2 + 1); // Think time 1-3 seconds
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('  Projects API Test Results');
  console.log('========================================\n');

  const httpReqs = data.metrics.http_reqs.values.count;
  const httpReqRate = data.metrics.http_reqs.values.rate.toFixed(2);
  const apiErrors = data.metrics.api_errors ?
    (data.metrics.api_errors.values.rate * 100).toFixed(2) : 0;

  console.log(`Total Requests: ${httpReqs}`);
  console.log(`Request Rate: ${httpReqRate}/s`);
  console.log(`\nResponse Times:`);
  console.log(`  Median: ${data.metrics.http_req_duration.values.med.toFixed(2)}ms`);
  console.log(`  p95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
  console.log(`  p99: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms`);
  console.log(`\nAPI Error Rate: ${apiErrors}%`);

  const checks = data.metrics.checks.values.passes /
    (data.metrics.checks.values.passes + data.metrics.checks.values.fails) * 100;
  console.log(`Check Success Rate: ${checks.toFixed(2)}%`);
  console.log('\n========================================\n');

  return {};
}
