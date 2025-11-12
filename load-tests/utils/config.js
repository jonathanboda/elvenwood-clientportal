// Load Testing Configuration for Elvenwood Interiors
// Base configuration and thresholds

export const BASE_URL = __ENV.BASE_URL || 'https://clientportal-vert.vercel.app';

// Performance thresholds
export const thresholds = {
  // 95% of requests should complete under 500ms
  'http_req_duration': ['p(95)<500', 'p(99)<1000'],
  // Error rate should be less than 1%
  'http_req_failed': ['rate<0.01'],
};

// Test configuration presets
export const scenarios = {
  // Baseline: Minimal load to establish performance baseline
  baseline: {
    executor: 'constant-vus',
    vus: 5,
    duration: '2m',
  },

  // Load: Normal expected traffic
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 20 },  // Ramp up to 20 users
      { duration: '3m', target: 20 },  // Stay at 20 for 3 minutes
      { duration: '1m', target: 0 },   // Ramp down
    ],
  },

  // Stress: Find breaking point
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 100 },
      { duration: '5m', target: 200 },
      { duration: '2m', target: 0 },
    ],
  },

  // Spike: Sudden traffic increase
  spike: {
    executor: 'ramping-vus',
    startVUs: 10,
    stages: [
      { duration: '30s', target: 100 }, // Sudden spike
      { duration: '3m', target: 100 },  // Sustained
      { duration: '30s', target: 10 },  // Drop back
    ],
  },
};

// Helper function to generate random string
export function randomString(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
