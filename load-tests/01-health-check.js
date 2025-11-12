// Health Check Load Test
// Simple test to verify the app is responding

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { BASE_URL, thresholds } from './utils/config.js';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration - Start with baseline
export const options = {
  vus: 10,  // 10 virtual users
  duration: '1m',  // Run for 1 minute
  thresholds,
};

export default function() {
  // Test homepage
  const res = http.get(BASE_URL);

  // Check if request was successful
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'page loads in < 1s': (r) => r.timings.duration < 1000,
    'response has content': (r) => r.body.length > 0,
  });

  errorRate.add(!success);

  sleep(1); // Think time between requests
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  let output = '\n';

  output += `${indent}Test Summary:\n`;
  output += `${indent}================\n`;
  output += `${indent}Duration: ${data.state.testRunDurationMs / 1000}s\n`;
  output += `${indent}Virtual Users: ${data.metrics.vus.values.max}\n`;
  output += `${indent}\n`;
  output += `${indent}HTTP Requests:\n`;
  output += `${indent}  Total: ${data.metrics.http_reqs.values.count}\n`;
  output += `${indent}  Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n`;
  output += `${indent}\n`;
  output += `${indent}Response Times:\n`;
  output += `${indent}  Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
  output += `${indent}  Med: ${data.metrics.http_req_duration.values.med.toFixed(2)}ms\n`;
  output += `${indent}  p95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  output += `${indent}  p99: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  output += `${indent}  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
  output += `${indent}\n`;

  const errorRate = data.metrics.http_req_failed ?
    (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : 0;
  output += `${indent}Error Rate: ${errorRate}%\n`;

  return output;
}
