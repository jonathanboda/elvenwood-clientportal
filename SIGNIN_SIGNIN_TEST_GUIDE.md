# Complete Sign-Up & Sign-In Test Guide

## Overview

This guide walks you through testing the complete authentication flow with the fixes for "Invalid login credentials" error.

---

## What We Fixed

### The Problem
- Users could sign up but couldn't sign in immediately
- Error: "Invalid login credentials" from Supabase
- **Root cause:** Email confirmation requirement

### The Solution
1. **Auto-confirmation endpoint** - Marks email as confirmed after signup
2. **Graceful error handling** - Better error messages
3. **Email confirmation SQL** - Manual confirmation if needed

---

## Complete Test Flow

### Step 1: Start the Development Server

```bash
cd C:\Users\Jonathan\Documents\clientportal
npm run dev
```

Open browser: `http://localhost:3000`

You should see the Elvenwood home page with "Sign In" and "Sign Up" buttons.

---

### Step 2: Create a New Account (Sign Up)

1. Click **"Sign Up"** or navigate to `http://localhost:3000/signup`
2. Fill in the form:
   - **Full Name:** Test User
   - **Email:** testuser@example.com
   - **Password:** Test123!@#
3. Click **"Sign up"** button
4. You should see: **"Account created successfully! Redirecting..."**

**Expected behavior after 1.5 seconds:**
- ✅ Redirected to `/dashboard`
- ✅ Logged in as designer (default role)
- ✅ See Designer Dashboard with:
  - Summary cards (Awaiting Projects, In Progress, Awaiting Review, Approved Designs)
  - Project list with 3 demo projects
  - Designer/Client toggle buttons
  - Logout button

**If this works → Skip to Step 4**

**If signup fails:**
- Check error message displayed
- Check browser console (F12 → Console tab)
- Review "Debugging" section below

---

### Step 3: Manual Email Confirmation (If Signup Didn't Redirect)

If signup worked but auto-confirmation failed:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → Authentication → Users
3. Find your test user (testuser@example.com)
4. Check "Email Confirmed At" field
   - **If NULL:** Email not confirmed yet
   - **If has timestamp:** Email already confirmed

**To manually confirm:**

Option A (SQL - Recommended):
1. Go to SQL Editor in Supabase
2. Copy-paste this query:
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = CURRENT_TIMESTAMP
   WHERE email = 'testuser@example.com';
   ```
3. Click "Run"
4. Success! Now try signing in

Option B (Admin API via curl):
```bash
curl -X PATCH \
  https://YOUR_PROJECT.supabase.co/auth/v1/admin/users/USER_ID \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email_confirmed_at": "2025-01-01T00:00:00Z"}'
```

---

### Step 4: Test Sign-In

1. Navigate to `http://localhost:3000/signin`
   - Or click "Sign in to your account" link from signup page
2. Enter credentials:
   - **Email:** testuser@example.com
   - **Password:** Test123!@#
3. Click **"Sign in"** button

**Expected behavior:**
- ✅ 1-2 second delay while signing in
- ✅ Redirected to `/dashboard`
- ✅ See Designer Dashboard
- ✅ User role stored in localStorage

**If signin fails:**
- ✅ Error message displayed: "Invalid email or password..."
- ✅ Check browser console for details
- ✅ Verify email was confirmed (see Step 3)

---

### Step 5: Test Role Switching

1. On the Designer Dashboard, locate toggle buttons in top-right:
   - **"Designer"** button (highlighted in blue)
   - **"Client"** button (outline style)
2. Click **"Client"** button

**Expected behavior:**
- ✅ Page content changes slightly
- ✅ Button styles switch (Client becomes highlighted)
- ✅ Dashboard title changes to "Client Portal"
- ✅ Summary cards are hidden
- ✅ Activity feed displayed instead

3. Click **"Designer"** button to return to Designer view

**Expected behavior:**
- ✅ Page content changes back
- ✅ Designer button becomes highlighted
- ✅ Dashboard title changes back to "Designer Dashboard"
- ✅ Summary cards and projects displayed again

---

### Step 6: Navigate to Separate Client Portal

From Designer Dashboard:

1. Click **"Client"** toggle button to switch roles
2. Refresh the page (F5) or navigate directly to `http://localhost:3000/client-portal`

**Expected behavior:**
- ✅ Completely different layout
- ✅ Sidebar on left with different menu items
- ✅ No Designer Dashboard components
- ✅ Client Portal sidebar shows:
  - Dashboard
  - Design Viewer
  - Profile
  - Logout
- ✅ Header with notifications bell and avatar

---

### Step 7: Test Sign Out

1. In Designer Dashboard, click **"Sign Out"** button in top-right
2. Or in Client Portal, click **"Logout"** in sidebar

**Expected behavior:**
- ✅ Redirected to `/signin`
- ✅ localStorage cleared (userRole removed)
- ✅ Session ended in Supabase

---

### Step 8: Test Sign-In Again After Sign-Out

1. After sign-out, you're on `/signin` page
2. Re-enter credentials:
   - **Email:** testuser@example.com
   - **Password:** Test123!@#
3. Click **"Sign in"**

**Expected behavior:**
- ✅ Successfully signed in
- ✅ Redirected to `/dashboard` (Designer Portal - default)
- ✅ Can toggle to Client Portal again
- ✅ Role selection persists across page reloads

---

## Success Criteria

All tests passed if:

- ✅ Sign up creates account → auto-confirms email → signs in → redirects to Designer Dashboard
- ✅ Sign in with correct credentials → redirects to Dashboard
- ✅ Sign in with wrong credentials → shows error message
- ✅ Can toggle between Designer and Client portal
- ✅ Designer Portal shows MUI-based layout with cards
- ✅ Client Portal shows Tailwind-based layout with different sidebar
- ✅ Sign out clears session and localStorage
- ✅ After sign-out, can sign-in again
- ✅ Role persists across page reloads

---

## Debugging Common Issues

### Issue 1: "Invalid login credentials" error on signin

**Diagnosis:**
- Email might not be confirmed
- Wrong password entered
- Account doesn't exist

**Solution:**
1. Verify email exists in Supabase:
   - Go to Authentication → Users in Supabase dashboard
   - Look for testuser@example.com
2. Check email_confirmed_at field:
   - If NULL, run confirmation SQL from Step 3
   - If has timestamp, email is confirmed
3. Verify password is correct (case-sensitive)
4. Try with different email: newtest@example.com

### Issue 2: Signup works but doesn't redirect

**Diagnosis:**
- Account created but auto-confirmation failed
- Browser console shows fetch error

**Solution:**
1. Check browser console (F12 → Console)
2. Look for error messages
3. Manually confirm email using SQL from Step 3:
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = CURRENT_TIMESTAMP
   WHERE email = 'testuser@example.com';
   ```
4. Try signing in from `/signin` page

### Issue 3: Signin page shows demo credentials hint

**Expected:**
- No demo credentials shown
- Just email and password input fields

**If you see demo text:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Try in incognito window

### Issue 4: Can't access Client Portal

**Diagnosis:**
- Might get redirected to signin
- Or see "You are not logged in" message

**Solution:**
1. Ensure you're signed in
2. Check localStorage contains "userRole" = "client":
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Look for "userRole" key
3. If missing, toggle to Client manually and refresh
4. If still not working, sign out and sign in again

### Issue 5: Role doesn't persist after page reload

**Diagnosis:**
- Signed in, click Client button
- Refresh page → Back to Designer view

**Solution:**
1. Check localStorage is not disabled in browser
2. Try in different browser (Chrome, Firefox, Edge)
3. Make sure JavaScript is enabled
4. Check browser console for errors (F12 → Console)

---

## Environment Variables Checklist

Ensure `.env.local` contains (found in project root):

```
NEXT_PUBLIC_SUPABASE_URL=https://mszlbzcyebrcfvsqphxw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

If missing, the app will fall back to demo mode.

---

## Browser Console Checks

When troubleshooting, check browser console for helpful error messages:

1. Open DevTools: **F12**
2. Go to **Console** tab
3. Look for errors like:
   - `"Sign in error: Invalid login credentials"`
   - `"POST /api/auth/confirm-email: 404"`
   - `"SUPABASE_SERVICE_ROLE_KEY not configured"`

These messages help identify the exact issue.

---

## Test Scenarios

### Scenario 1: Fresh User - Complete Signup Flow
```
New device/browser → Signup → Signin → Designer Dashboard
```

### Scenario 2: Existing User - Signin After Signout
```
Signed in → Signout → Signin → Designer Dashboard
```

### Scenario 3: Role Switching
```
Designer Portal → Click Client → Client Portal → Refresh → Still Client Portal
```

### Scenario 4: Multi-Tab Testing
```
Tab 1: Sign in
Tab 2: Open Developer Portal in Tab 1
See user in Supabase → Compare with Tab 1
```

---

## Permanent Fix: Disable Email Confirmation in Supabase

For the most permanent solution:

1. Go to [Supabase Dashboard](https://app.supabase.co)
2. Select your project
3. Go to Settings → Authentication
4. Under "Email" section, find "Confirm email"
5. Toggle it **OFF**
6. Click **Save**

After this:
- All new signups won't require confirmation
- Existing unconfirmed users can still signin
- The auto-confirmation endpoint becomes optional

---

## Files Involved in Auth Flow

| File | Purpose |
|------|---------|
| `app/signup/page.tsx` | Signup form + auto-confirmation |
| `app/signin/page.tsx` | Signin form + auth validation |
| `app/dashboard/page.tsx` | Role routing (Designer vs Client) |
| `app/dashboard/layout.tsx` | Dashboard layout wrapper |
| `app/client-portal/layout.tsx` | Client portal separate layout |
| `lib/supabase.ts` | Supabase client singleton |
| `app/api/auth/confirm-email/route.ts` | Email confirmation endpoint |
| `SUPABASE_AUTH_CONFIG.sql` | Manual confirmation SQL |

---

## Next Steps

After successful testing:

1. ✅ Authentication working
2. ✅ Role switching working
3. 📝 Create additional test users
4. 🔐 Test permission rules (RLS policies)
5. 📱 Test on mobile devices
6. 🌐 Test in different browsers
7. 🚀 Deploy to production (update Supabase settings for email confirmation)

---

## Quick Links

- **Signup:** `http://localhost:3000/signup`
- **Signin:** `http://localhost:3000/signin`
- **Dashboard:** `http://localhost:3000/dashboard`
- **Client Portal:** `http://localhost:3000/client-portal`
- **Supabase Dashboard:** `https://app.supabase.com`

---

## Support

If you encounter issues not covered here:

1. Check browser console (F12 → Console tab)
2. Check Supabase logs (Dashboard → Logs)
3. Review `AUTH_TROUBLESHOOTING.md` for detailed debugging
4. Check environment variables in `.env.local`
5. Try with completely fresh email address

Good luck testing! 🚀

