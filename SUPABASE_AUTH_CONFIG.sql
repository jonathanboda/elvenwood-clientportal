-- Supabase Authentication Configuration Fix
-- This script disables email confirmation requirement for development/demo purposes
-- Run this in the Supabase SQL Editor

-- 1. Update auth.users to mark existing users as email confirmed
-- This is useful if you have users created before disabling email confirmation
UPDATE auth.users
SET email_confirmed_at = CURRENT_TIMESTAMP
WHERE email_confirmed_at IS NULL;

-- Note: To fully disable email confirmation requirement in your Supabase project:
-- 1. Go to https://app.supabase.com/project/_/settings/auth
-- 2. Under "Email" section, find "Confirm email"
-- 3. Toggle it OFF
-- 4. Save changes
--
-- This will prevent new signups from requiring email confirmation.
-- The SQL above confirms any existing unconfirmed users.

-- If you need to auto-confirm specific new users during testing,
-- use this SQL after they sign up:
-- UPDATE auth.users SET email_confirmed_at = CURRENT_TIMESTAMP WHERE email = 'user@example.com';
