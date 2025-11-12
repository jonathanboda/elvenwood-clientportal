// Authentication Load Test
// Tests login and session validation

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { BASE_URL, thresholds } from './utils/config.js';

// Custom metrics
const loginErrorRate = new Rate('login_errors');
const sessionErrorRate = new Rate('session_errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up
    { duration: '2m', target: 10 },   // Sustained load
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    ...thresholds,
    login_errors: ['rate<0.05'],    // Login error rate < 5%
    session_errors: ['rate<0.05'],  // Session error rate < 5%
  },
};

// Test data - you should replace these with actual test credentials
const TEST_USERS = [
  { email: 'designer1@elvenwood.test', password: 'TestPassword123!' },
  { email: 'designer2@elvenwood.test', password: 'TestPassword123!' },
  { email: 'client1@elvenwood.test', password: 'TestPassword123!' },
];

export default function() {
  // Select a test user
  const user = TEST_USERS[__VU % TEST_USERS.length];

  group('Authentication Flow', function() {
    // Step 1: Login
    const loginPayload = JSON.stringify({
      email: user.email,
      password: user.password,
    });

    const loginParams = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const loginRes = http.post(
      `${BASE_URL}/api/auth/login`,
      loginPayload,
      loginParams
    );

    // Validate login response
    const loginSuccess = check(loginRes, {
      'login status is 200 or 201': (r) => r.status === 200 || r.status === 201,
      'login response time < 500ms': (r) => r.timings.duration < 500,
      'login returns data': (r) => r.body && r.body.length > 0,
    });

    loginErrorRate.add(!loginSuccess);

    // If login is implemented and successful, test session
    if (loginSuccess && loginRes.json('token')) {
      const token = loginRes.json('token');

      sleep(1); // Think time

      // Step 2: Verify session
      const sessionRes = http.get(
        `${BASE_URL}/api/auth/session`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const sessionSuccess = check(sessionRes, {
        'session status is 200': (r) => r.status === 200,
        'session response time < 300ms': (r) => r.timings.duration < 300,
      });

      sessionErrorRate.add(!sessionSuccess);
    }
  });

  sleep(Math.random() * 2 + 1); // Random think time 1-3 seconds
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('  Authentication Test Results');
  console.log('========================================\n');

  const httpReqs = data.metrics.http_reqs.values.count;
  const httpReqRate = data.metrics.http_reqs.values.rate.toFixed(2);
  const loginErrors = data.metrics.login_errors ?
    (data.metrics.login_errors.values.rate * 100).toFixed(2) : 0;
  const sessionErrors = data.metrics.session_errors ?
    (data.metrics.session_errors.values.rate * 100).toFixed(2) : 0;

  console.log(`Total Requests: ${httpReqs}`);
  console.log(`Request Rate: ${httpReqRate}/s`);
  console.log(`\nResponse Times (p95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
  console.log(`Response Times (p99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms`);
  console.log(`\nLogin Error Rate: ${loginErrors}%`);
  console.log(`Session Error Rate: ${sessionErrors}%`);
  console.log('\n========================================\n');

  return {};
}
