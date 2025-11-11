# Supabase Setup Instructions for Elvenwood Portal

## Your Credentials are Configured ✅

Your `.env.local` file has been updated with your Supabase credentials:
- **Project URL**: `https://mszlbzcyebrcfvsqphxw.supabase.co`
- **API Key**: Configured ✅

## Next Steps: Create Database Tables

### Step 1: Go to Supabase SQL Editor

1. Open your Supabase project dashboard
2. Navigate to the **SQL Editor** section (left sidebar)
3. Click **"New Query"** button

### Step 2: Run the Schema Script

1. Copy the entire contents of `SUPABASE_SCHEMA.sql` from your project root
2. Paste it into the SQL Editor
3. Click the **"Run"** button (or press Ctrl+Enter)
4. Wait for the script to complete (you should see green checkmarks)

**What this does:**
- Creates ENUM types for roles and statuses
- Creates 7 database tables (profiles, projects, invites, versions, comments, audit_logs, project_members)
- Creates indexes for performance
- Enables Row Level Security
- Creates automatic timestamp triggers

### Step 3: Run the RLS Policies Script

1. Click **"New Query"** again
2. Copy the entire contents of `SUPABASE_RLS_POLICIES.sql`
3. Paste it into the SQL Editor
4. Click **"Run"**
5. Wait for completion (you should see green checkmarks)

**What this does:**
- Creates helper functions for role checking
- Sets up Row Level Security policies
- Ensures users can only access data they're authorized to see

### Step 4: Create Storage Buckets

1. In your Supabase project, go to **Storage** section
2. Click **"Create a new bucket"**
3. Create the following buckets:
   - Name: `design-files` (Public)
   - Name: `avatars` (Public)

### Step 5: Verify Connection in Your App

1. The development server should automatically restart when you save `.env.local`
2. Go to `http://localhost:3000`
3. If you see the app load without errors, your connection is working!

## Testing the Database

### Test 1: Check Tables Were Created

1. In Supabase, go to **Table Editor**
2. You should see these tables in the left sidebar:
   - profiles
   - projects
   - invites
   - versions
   - comments
   - audit_logs
   - project_members

### Test 2: Sign Up a New User

1. Go to `http://localhost:3000`
2. Click **"Sign Up"**
3. Create an account with an email and password
4. Go to Supabase **Authentication** → **Users**
5. You should see your new user in the list!

### Test 3: Check Profile Was Created

1. Go to Supabase **Table Editor** → **profiles**
2. You should see a row with your email and role

## Troubleshooting

### "Table already exists" Error
- Your schema has already been created
- You can safely ignore this, or:
- Drop and recreate tables using: `DROP TABLE IF EXISTS projects CASCADE;` etc.

### "Syntax error near..."
- The SQL script has an error
- Check line numbers in error message
- Try running the script in smaller sections

### "No data in tables after signup"
- RLS policies might be preventing writes
- Check that RLS_POLICIES script ran successfully
- Verify policies in **Authentication** → **Policies**

### App still showing "No projects"
- You may need to refresh the page
- Your localStorage might have old demo data
  - Open DevTools (F12) → **Application** → **Local Storage**
  - Delete the `designerProjects` key
  - Refresh the page

## Files Reference

- **SUPABASE_SCHEMA.sql** - Database table definitions
- **SUPABASE_RLS_POLICIES.sql** - Security policies
- **.env.local** - Your credentials (already updated ✅)

## Next Steps

1. ✅ **Environment configured**
2. → **Run SQL Schema** (you are here)
3. → **Run RLS Policies**
4. → **Create Storage Buckets**
5. → **Test the connection**
6. → **Start using the real database!**

## Important Security Notes

⚠️ **KEEP YOUR CREDENTIALS SAFE**:
- Never share your `.env.local` file
- Never commit it to Git (it's in `.gitignore`)
- Keep the service role key secret (only use server-side)
- All user data is protected by RLS policies

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the error messages in Supabase SQL Editor
3. Consult the Supabase documentation: https://supabase.com/docs
4. Check the project's README for additional help

---

**You're ready to set up your database! Follow the steps above in your Supabase dashboard.**
