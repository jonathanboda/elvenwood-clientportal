# GitHub Actions Workflows

This directory contains automated workflows for CI/CD and performance testing.

## Workflows

### 1. Load Testing (`load-test.yml`)

**Purpose**: Comprehensive load testing to verify application performance under realistic traffic conditions.

**Triggers**:
- **Scheduled**: Every Monday at 2 AM UTC
- **Manual**: Via GitHub Actions UI (`workflow_dispatch`)
- **Pull Requests**: Commented out by default (uncomment lines 21-22 to enable)

**What it does**:
1. Installs k6 load testing tool
2. Runs three test suites:
   - `01-health-check.js` - Basic health verification
   - `02-auth-test.js` - Authentication flow testing
   - `03-projects-api-test.js` - Projects API testing
3. Uploads test results as artifacts (30-day retention)
4. Checks performance thresholds and fails if not met
5. Posts results to PR comments (if run on PR)
6. Creates GitHub step summary with results

**Manual Trigger**:
```bash
# Via GitHub CLI
gh workflow run load-test.yml

# Or via GitHub UI:
# Actions → Load Testing → Run workflow
```

**Customizing**:
You can pass custom parameters when manually triggering:
- `test_duration`: Duration for tests (default: 1m)
- `virtual_users`: Number of concurrent users (default: 10)

### 2. Performance Check (`performance-check.yml`)

**Purpose**: Quick performance verification after every deployment to main branch.

**Triggers**:
- **Push to main**: Automatically after merging/pushing to main
- **Manual**: Via GitHub Actions UI

**What it does**:
1. Waits 30 seconds for Vercel deployment to complete
2. Runs quick 30-second health check with 5 virtual users
3. Uploads results as artifacts (90-day retention)
4. Warns if performance thresholds not met (doesn't fail build)
5. Creates GitHub step summary

**Excluded files**:
The workflow skips running if only these files changed:
- Markdown files (`**.md`)
- Documentation (`docs/**`)
- GitHub workflows (`.github/**`)

## Viewing Test Results

### In GitHub Actions UI

1. Go to your repository
2. Click **Actions** tab
3. Click on a workflow run
4. View the **Summary** page for quick results
5. Download **Artifacts** for detailed JSON results

### Artifacts

Each workflow run produces artifacts:

**Load Testing**:
- `load-test-results` (30-day retention)
  - `health-check-results.json`
  - `auth-test-results.json`
  - `projects-test-results.json`

**Performance Check**:
- `performance-check-{SHA}` (90-day retention)
  - `quick-results.json`

### Reading JSON Results

The JSON files contain detailed metrics. Key fields:

```json
{
  "type": "Point",
  "metric": "http_req_duration",
  "data": {
    "time": "2025-11-12T...",
    "value": 124.5,
    "tags": {
      "status": "200"
    }
  }
}
```

To analyze:
```bash
# Count total requests
grep -c '"http_reqs"' results.json

# Find failed requests
grep '"http_req_failed".*"value":1' results.json

# Average response time
grep '"http_req_duration"' results.json | jq '.data.value' | awk '{sum+=$1; count+=1} END {print sum/count}'
```

## Performance Thresholds

The workflows enforce these thresholds:

| Metric | Threshold | Description |
|--------|-----------|-------------|
| p(95) | < 500ms | 95% of requests complete under 500ms |
| p(99) | < 1000ms | 99% of requests complete under 1s |
| Error Rate | < 1% | Less than 1% failed requests |

If thresholds are not met:
- **Load Testing**: Workflow fails, blocking merges if enabled on PR
- **Performance Check**: Workflow warns but doesn't fail

## Troubleshooting

### Workflow Fails with "k6 installation failed"

**Cause**: k6 GPG key server unreachable

**Fix**: The workflow uses `hkp://keyserver.ubuntu.com:80`. If it fails, update to use alternative keyserver:
```yaml
--keyserver hkp://keys.openpgp.org:80
```

### Tests Timeout or Fail

**Possible causes**:
1. Vercel deployment still in progress (increase wait time)
2. Database connection pool exhausted
3. Rate limiting triggered

**Check**:
- Vercel deployment logs
- Supabase connection count
- Test duration and virtual user count

### No Artifacts Uploaded

**Cause**: Tests failed before completion or results file not created

**Fix**: Check workflow logs for errors. The workflow uses `if: always()` to upload even on failure.

### Performance Thresholds Keep Failing

**Options**:
1. **Optimize**: Improve application performance
2. **Adjust Thresholds**: Edit `load-tests/utils/config.js`:
   ```javascript
   export const thresholds = {
     'http_req_duration': ['p(95)<1000', 'p(99)<2000'], // More lenient
     'http_req_failed': ['rate<0.05'], // 5% error rate
   };
   ```
3. **Reduce Load**: Decrease virtual users or duration

## Customization

### Run Tests on Every PR

Uncomment in `load-test.yml`:
```yaml
pull_request:
  branches: [ main ]
```

**Warning**: This can be expensive for high-traffic repos.

### Change Schedule

Edit the cron expression in `load-test.yml`:
```yaml
schedule:
  - cron: '0 2 * * 1'  # Every Monday at 2 AM
```

Common schedules:
- `'0 */6 * * *'` - Every 6 hours
- `'0 0 * * *'` - Daily at midnight
- `'0 0 * * 0'` - Weekly on Sunday

### Add Slack/Email Notifications

Add to the end of workflow:
```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "Load test failed on ${{ github.repository }}"
      }
```

### Test Different Environments

Add environment input:
```yaml
workflow_dispatch:
  inputs:
    environment:
      description: 'Environment to test'
      required: false
      default: 'production'
      type: choice
      options:
        - production
        - staging
```

Then use in test:
```bash
k6 run --env BASE_URL=${{ inputs.environment == 'staging' && 'https://staging.example.com' || 'https://clientportal-vert.vercel.app' }} 01-health-check.js
```

## Best Practices

1. **Monitor Regularly**: Review workflow runs weekly
2. **Set Alerts**: Configure GitHub notifications for workflow failures
3. **Update Baselines**: After major optimizations, update expected thresholds
4. **Retention**: Adjust artifact retention based on compliance needs
5. **Cost Management**: Be mindful of GitHub Actions minutes (2000/month free for private repos)

## Security

- Never commit test credentials to the repository
- Use GitHub Secrets for sensitive data:
  ```yaml
  env:
    TEST_USER: ${{ secrets.TEST_USER_EMAIL }}
    TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
  ```
- Restrict workflow permissions if needed:
  ```yaml
  permissions:
    contents: read
    issues: write
  ```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [k6 Documentation](https://k6.io/docs/)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

## Questions?

Review the workflow logs in GitHub Actions for detailed error messages and timing information.
