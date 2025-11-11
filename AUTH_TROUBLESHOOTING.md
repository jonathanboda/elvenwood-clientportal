# Authentication Troubleshooting Guide

## Problem: "Invalid login credentials" Error

When trying to sign in after signup, you may encounter:
```
Error Type Console AuthApiError - Invalid login credentials
```

This occurs at `supabase.auth.signInWithPassword()` and is typically caused by **email confirmation requirement**.

---

## Root Cause

Supabase has email confirmation **enabled by default**. This means:

1. ✅ User signs up → Account created in Supabase
2. ❌ User tries to sign in immediately → Fails because email not confirmed
3. 📧 User must check email and click confirmation link
4. ✅ After confirmation, user can sign in

For development/demo purposes, this is inconvenient.

---

## Solution Overview

We've implemented **two-part fix**:

### Part 1: Auto-Confirmation During Signup
**File:** `app/signup/page.tsx`

When a user signs up:
1. Account created in Supabase ✓
2. Auto-confirm email via API endpoint ✓
3. Attempt immediate sign-in ✓
4. Redirect to dashboard ✓

### Part 2: Email Confirmation API Endpoint
**File:** `app/api/auth/confirm-email/route.ts`

Server-side endpoint that:
- Accepts POST requests with email
- Uses Supabase Service Role Key (admin access)
- Marks user's email as confirmed
- Returns success/error status

### Part 3: Graceful Error Handling
**Files:** `app/signin/page.tsx`, `app/signup/page.tsx`

- Better error messages for users
- Checks for unconfirmed email status
- Suggests users check their email if needed

---

## How It Works

### Signup Flow (Updated)
```
User enters email/password/name
    ↓
POST /signup with credentials
    ↓
Supabase creates account (email_confirmed_at = NULL)
    ↓
Call POST /api/auth/confirm-email
    ↓
Service marks email_confirmed_at = CURRENT_TIMESTAMP
    ↓
Automatically sign in user
    ↓
Redirect to /dashboard (Designer Portal)
    ↓
✓ Success
```

### Signin Flow (Updated)
```
User enters email/password
    ↓
POST /signin with credentials
    ↓
Supabase validates credentials
    ↓
Check if email_confirmed_at is set
    ↓
If NULL: Show message "Email confirmation pending"
If SET: Sign in and redirect to /dashboard
    ↓
✓ Success or ❌ Error with helpful message
```

---

## Configuration Steps

### Step 1: Disable Email Confirmation in Supabase (Recommended for Development)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → Settings → Auth
3. Under "Email" section, find "Confirm email"
4. Toggle it **OFF**
5. Click "Save"

This is the most permanent solution and disables the requirement for all new signups.

### Step 2: Confirm Existing Unconfirmed Users (If Needed)

If you already have users in the database with unconfirmed emails:

1. Go to SQL Editor in Supabase
2. Run the query in `SUPABASE_AUTH_CONFIG.sql`:
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = CURRENT_TIMESTAMP
   WHERE email_confirmed_at IS NULL;
   ```
3. This confirms all pending users at once

### Step 3: Test the Flow

1. Navigate to `http://localhost:3000/signup`
2. Create account with any email/password:
   - Email: `testuser@example.com`
   - Password: `Test123!@#`
   - Name: `Test User`
3. Account should be auto-confirmed and you'll be redirected to Designer Dashboard
4. Try signing in with the same credentials

---

## Endpoint Details

### POST /api/auth/confirm-email

**Purpose:** Auto-confirm user email (Development/Demo)

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email confirmed successfully"
}
```

**Response (Error):**
```json
{
  "error": "User not found"
}
```

**Status Codes:**
- `200` - Email confirmed successfully
- `400` - Missing email parameter
- `404` - User not found
- `500` - Server error

**Security Note:** This endpoint uses `SUPABASE_SERVICE_ROLE_KEY` for admin operations. It should only be used in development. For production, require actual email confirmation.

---

## Debugging

### If signup still fails:

1. **Check browser console** for detailed error messages
2. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs
   - Look for auth-related errors
3. **Verify environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` is set
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
   - `SUPABASE_SERVICE_ROLE_KEY` is set
4. **Try signup again** with different email

### If signin fails after signup:

1. **Check if email was confirmed:**
   - Go to Supabase → Auth → Users
   - Look for your test user
   - Check if "Email Confirmed At" has a timestamp
2. **If NULL:** Try running the SQL confirmation query
3. **If SET:** Try signin with exact email/password used in signup

### Manual Email Confirmation

If auto-confirmation fails, manually confirm a user:

1. Go to Supabase SQL Editor
2. Run:
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = CURRENT_TIMESTAMP
   WHERE email = 'user@example.com';
   ```
3. Try signing in again

---

## Environment Variables Needed

Ensure these are in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The **Service Role Key** is required for the email confirmation endpoint.

---

## Production Considerations

### For Development/Demo:
✅ Email confirmation disabled (this setup)
✅ Auto-confirmation during signup
✅ Users can sign in immediately

### For Production:
⚠️ Enable email confirmation requirement
⚠️ Remove auto-confirmation endpoint (`/api/auth/confirm-email`)
⚠️ Send actual confirmation emails
⚠️ Require users to click confirmation link
⚠️ Use Supabase Edge Functions for email notifications

---

## Files Modified/Created

### Created:
- `SUPABASE_AUTH_CONFIG.sql` - SQL for confirming users
- `app/api/auth/confirm-email/route.ts` - Auto-confirmation endpoint
- `AUTH_TROUBLESHOOTING.md` - This guide

### Modified:
- `app/signup/page.tsx` - Added auto-confirmation after signup
- `app/signin/page.tsx` - Added better error messages

---

## Quick Reference

| Scenario | Solution |
|----------|----------|
| "Invalid login credentials" on signin | Ensure email confirmed, run SQL or disable confirmation in Supabase |
| Signup works but can't signin | Email not confirmed, run auto-confirmation SQL |
| Signup doesn't work at all | Check SUPABASE_SERVICE_ROLE_KEY in environment |
| Want permanent fix | Disable email confirmation in Supabase settings |
| Want to confirm existing users | Run SUPABASE_AUTH_CONFIG.sql |

---

## Success Indicators

✅ Signup page creates account successfully
✅ After signup, redirected to Designer Dashboard
✅ Can sign in with created credentials
✅ Signin redirects to Designer Dashboard
✅ Can toggle to Client Portal
✅ Client Portal shows different layout

---

## Next Steps

1. **Immediate:** Run signup → signin test flow
2. **If it fails:** Check "Debugging" section above
3. **For production:** Implement real email confirmation
4. **Optional:** Add password reset functionality

---

## Support

If you encounter issues:

1. Check browser console for error messages
2. Review Supabase logs for auth failures
3. Verify all environment variables are set correctly
4. Run `SUPABASE_AUTH_CONFIG.sql` to confirm users manually
5. Try with a completely new email address

