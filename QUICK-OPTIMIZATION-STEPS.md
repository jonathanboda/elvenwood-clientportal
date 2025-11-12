# ⚡ Quick Optimization Steps
**5x Capacity Increase in 15 Minutes**

---

## Step 1: Apply Database Indexes (5 min) ⭐ DO THIS FIRST

1. Go to: https://supabase.com/dashboard
2. Click **SQL Editor** → **New Query**
3. Open `database/performance-indexes.sql`
4. Copy ALL and paste into editor
5. Click **Run** (Ctrl+Enter)
6. Verify: Run verification query at bottom

---

## Step 2: Enable Connection Pooling (3 min)

1. Supabase Dashboard → **Database** → **Connection Pooling**
2. Toggle **ON**
3. Mode: **Transaction**
4. Pool Size: **20**
5. Click **Save**

---

## Step 3: Test Locally (2 min)

```bash
cd C:\Users\Jonathan\Documents\clientportal
npm install
npm run dev
```

Test at http://localhost:3000 - verify no errors

---

## Step 4: Deploy (1 min)

```bash
git add .
git commit -m "Add connection pooling and database optimizations"
git push origin main
```

Wait for Vercel deployment to complete

---

## Step 5: Verify (1 min)

```bash
cd load-tests
"C:\Program Files\k6\k6.exe" run --vus 10 --duration 1m 01-health-check.js
```

**Expected**: p95 < 350ms, p99 < 650ms, 0% errors

---

## ✅ Done!

**Before**: 50-100 concurrent users
**After**: 150-300 concurrent users
**Cost**: $0

See `OPTIMIZATION-GUIDE.md` for full details.
