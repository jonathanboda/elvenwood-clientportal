# Quick Start Guide - Load Testing

## Run Tests (Copy & Paste)

Open a **new terminal** (PowerShell or CMD) and run:

```bash
cd C:\Users\Jonathan\Documents\clientportal\load-tests
```

### Test 1: Health Check (1 minute) ⚡
```bash
"C:\Program Files\k6\k6.exe" run 01-health-check.js
```

### Test 2: Authentication (3 minutes) 🔐
```bash
"C:\Program Files\k6\k6.exe" run 02-auth-test.js
```

### Test 3: Projects API (5 minutes) 📊
```bash
"C:\Program Files\k6\k6.exe" run 03-projects-api-test.js
```

---

## Understanding Results

### Good Performance ✅
- p95 < 500ms
- p99 < 1000ms
- Error rate < 1%

### Your Current Baseline 🎉
- p95: **341ms** (Excellent!)
- p99: **631ms** (Excellent!)
- Error rate: **0%** (Perfect!)

---

## Common Commands

### Quick Test (30 seconds)
```bash
"C:\Program Files\k6\k6.exe" run --vus 5 --duration 30s 01-health-check.js
```

### Heavy Load Test
```bash
"C:\Program Files\k6\k6.exe" run --vus 50 --duration 5m 01-health-check.js
```

### Save Results
```bash
"C:\Program Files\k6\k6.exe" run --out json=results.json 01-health-check.js
```

---

## Files Created

- `01-health-check.js` - Basic homepage test
- `02-auth-test.js` - Login/authentication test
- `03-projects-api-test.js` - API endpoint test
- `utils/config.js` - Configuration
- `README.md` - Full documentation
- `BASELINE-RESULTS.md` - Your test results
- `QUICK-START.md` - This file

---

## Need Help?

1. Check `README.md` for detailed instructions
2. Check `BASELINE-RESULTS.md` for your results
3. Visit https://k6.io/docs/ for k6 documentation

---

## Testing Schedule

✅ **Completed**: Baseline test (Excellent results!)

📅 **Recommended**:
- Weekly: Load test (20 users)
- Monthly: Stress test (100+ users)
- Before major releases: Full test suite

---

**Your app is performing excellently! 🎉**
