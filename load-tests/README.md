# Load Testing for Elvenwood Interiors

This directory contains load testing scripts using k6 to test the performance and scalability of the Elvenwood Interiors application.

## Prerequisites

- k6 installed (already done!)
- Your application deployed to Vercel: https://clientportal-vert.vercel.app

## Test Files

### 1. `01-health-check.js`
Basic health check to verify the app is responding.
- **Duration**: 1 minute
- **Virtual Users**: 10
- **Tests**: Homepage load, response times

### 2. `02-auth-test.js`
Tests authentication flow (login + session validation).
- **Duration**: 3 minutes
- **Virtual Users**: Ramps from 0 to 10
- **Tests**: Login API, session verification

### 3. `03-projects-api-test.js`
Tests project listing and detail retrieval.
- **Duration**: 5 minutes
- **Virtual Users**: Ramps from 0 to 20
- **Tests**: List projects, get project details

## Quick Start

### Run Your First Test

Open a **new terminal** (to pick up the k6 installation) and run:

```bash
cd C:\Users\Jonathan\Documents\clientportal\load-tests

# Test 1: Health Check (fastest, 1 minute)
k6 run 01-health-check.js

# Test 2: Authentication (3 minutes)
k6 run 02-auth-test.js

# Test 3: Projects API (5 minutes)
k6 run 03-projects-api-test.js
```

### Run with Custom Configuration

```bash
# Override base URL
k6 run --env BASE_URL=https://your-domain.com 01-health-check.js

# Run with more users
k6 run --vus 20 --duration 2m 01-health-check.js

# Save results to JSON
k6 run --out json=results.json 01-health-check.js
```

## Understanding the Results

After running a test, you'll see output like:

```
✓ status is 200
✓ page loads in < 1s
✓ response has content

checks.........................: 98.50% ✓ 590       ✗ 10
data_received..................: 2.5 MB 42 kB/s
http_req_duration..............: avg=245ms  min=98ms  med=220ms  max=1.2s  p(95)=485ms  p(99)=890ms
http_req_failed................: 1.50%  ✓ 9         ✗ 591
http_reqs......................: 600    10/s
vus............................: 10     min=10      max=10
```

### Key Metrics

- **checks**: Percentage of successful assertions
- **http_req_duration p(95)**: 95% of requests completed within this time
- **http_req_duration p(99)**: 99% of requests completed within this time
- **http_req_failed**: Percentage of failed requests (errors)
- **http_reqs**: Total requests and requests per second

### Performance Goals

| Metric | Good | Acceptable | Poor |
|--------|------|------------|------|
| p95 | < 500ms | < 1s | > 1s |
| p99 | < 1s | < 2s | > 2s |
| Error Rate | < 1% | < 5% | > 5% |

## Test Scenarios

### Baseline Test (Current Setup)
- **Purpose**: Establish performance baseline
- **Users**: 10 concurrent
- **Duration**: 1-3 minutes
- **Run**: Before major changes

### Load Test (Recommended Weekly)
```bash
# Edit test file to use 'load' scenario from config.js
k6 run 03-projects-api-test.js
```
- **Users**: Ramps to 20
- **Duration**: 5 minutes
- **Purpose**: Verify normal traffic handling

### Stress Test (Monthly)
```bash
# Create stress-test.js or modify existing tests
k6 run --vus 50 --duration 10m 01-health-check.js
```
- **Users**: 50-200+
- **Duration**: 10-15 minutes
- **Purpose**: Find breaking point

## Before Running Tests

### 1. Create Test Accounts (Important!)

The authentication tests need real test accounts. Create these in your app:

- `designer@elvenwood.test` (password: `TestPassword123!`)
- `client@elvenwood.test` (password: `TestPassword123!`)

Or update the test files with your actual test credentials.

### 2. Verify Your Supabase Connection Pool

Load tests can exhaust database connections. Check your Supabase dashboard:
- Go to Settings → Database
- Note your connection limit (typically 100 on free tier)
- Enable connection pooling if not already enabled

### 3. Monitor During Tests

While tests run, monitor:
- **Vercel Dashboard**: https://vercel.com/jonathans-projects-6b1233ea/clientportal
  - Function invocations
  - Error rates
  - Function duration

- **Supabase Dashboard**: https://supabase.com/dashboard/project/YOUR_PROJECT
  - Active connections
  - Query performance
  - Error logs

## Troubleshooting

### "k6: command not found"

**Solution**: Restart your terminal to pick up the PATH changes after installation.

Or use full path:
```bash
"C:\Program Files\k6\k6.exe" run 01-health-check.js
```

### High Error Rates

If you see > 5% errors:
1. Check if test credentials are correct
2. Verify API endpoints exist
3. Check Vercel function logs for errors
4. Reduce virtual users if overwhelming the system

### Tests Timeout

If tests hang:
1. Verify the application URL is correct
2. Check if Vercel deployment is live
3. Reduce test duration or virtual users

## Next Steps

### 1. Automated Testing

Add to CI/CD pipeline (GitHub Actions):

```yaml
# .github/workflows/load-test.yml
name: Load Test
on:
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday 2 AM

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Run tests
        run: |
          cd load-tests
          k6 run 01-health-check.js
```

### 2. Advanced Scenarios

Create more tests for:
- File upload stress testing
- WebSocket/real-time features
- Client invitation workflow
- Concurrent user operations

### 3. Performance Optimization

Based on test results:
- Optimize slow API endpoints
- Add caching for frequently accessed data
- Optimize database queries
- Consider upgrading Vercel/Supabase plans if needed

## Resources

- **k6 Documentation**: https://k6.io/docs/
- **Vercel Limits**: https://vercel.com/docs/functions/limitations
- **Supabase Performance**: https://supabase.com/docs/guides/platform/performance

## Questions?

If you encounter issues:
1. Check test output for specific error messages
2. Review Vercel deployment logs
3. Check Supabase database logs
4. Verify environment variables are set correctly

Happy Testing! 🚀
