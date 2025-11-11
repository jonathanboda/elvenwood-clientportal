# Database Setup Guide - Elvenwood Interior Design Portal

This guide will help you set up the real Supabase database for the Elvenwood Interior Design application.

## Prerequisites

- A [Supabase](https://supabase.com) account (free tier available)
- Access to the Supabase dashboard
- This project repository

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"New Project"** or sign in to your dashboard
3. Fill in the project details:
   - **Name**: `elvenwood-interior-design` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Select the region closest to your users
4. Click **"Create new project"**
5. Wait for the project to initialize (2-3 minutes)

## Step 2: Get Your Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (keep this SECRET!)

## Step 3: Update Environment Variables

1. Open `.env.local` in your project root:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
   ```

2. Replace the placeholder values with your actual credentials from Step 2

3. Save the file

## Step 4: Create Database Tables

1. In your Supabase project, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents from `SUPABASE_SCHEMA.sql` in the project root
4. Paste it into the SQL Editor
5. Click **"Run"** to execute all the schema creation commands
6. You should see success messages for each table creation

## Step 5: Apply Row Level Security Policies

1. In the **SQL Editor**, click **"New Query"** again
2. Copy the entire contents from `SUPABASE_RLS_POLICIES.sql` in the project root
3. Paste it into the SQL Editor
4. Click **"Run"** to execute all the RLS policy creation commands
5. You should see success messages for each policy

## Step 6: Create Storage Buckets

1. In your Supabase project, go to **Storage**
2. Click **"Create a new bucket"**
3. Create a bucket named `design-files`
   - **Privacy**: Public (so users can view designs)
4. Create another bucket named `avatars`
   - **Privacy**: Public

## Step 7: Set Up Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Go to **Email Templates** and review the default templates
4. (Optional) Configure other providers like Google, GitHub, etc.

## Step 8: Test the Connection

1. Make sure `.env.local` is properly configured with your credentials
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Navigate to `http://localhost:3000`
4. Try to create a new account or sign in
5. If you see any errors, check your `.env.local` file and Supabase credentials

## Step 9: Create Test Users (Optional)

To test the application with different user roles:

1. Go to **Authentication** → **Users** in Supabase
2. Click **"Add user"** to create test accounts:
   - **Designer account**: `designer@example.com`
   - **Client account**: `client@example.com`
   - Set a password for each

3. Update their role in the **profiles** table:
   - Go to **SQL Editor** → **New Query**
   - Run these commands:
     ```sql
     UPDATE profiles
     SET role = 'designer'
     WHERE email = 'designer@example.com';

     UPDATE profiles
     SET role = 'client'
     WHERE email = 'client@example.com';
     ```

## Database Schema Overview

### Tables Created:

1. **profiles** - User information and roles
2. **projects** - Interior design projects
3. **invites** - Client invitations
4. **versions** - Design file versions
5. **comments** - Feedback and discussion
6. **audit_logs** - Activity tracking
7. **project_members** - Multi-designer support

### Key Features:

- **Row Level Security (RLS)** - Data access is automatically restricted based on user role
- **Automatic Timestamps** - `created_at` and `updated_at` are auto-managed
- **Referential Integrity** - Foreign keys ensure data consistency
- **Indexes** - Optimized queries for common operations

## Migration from Demo Data

The app currently uses localStorage for demo data. When you connect the real database:

1. The app will automatically start using Supabase instead of localStorage
2. Projects saved in localStorage won't transfer to Supabase (this is by design)
3. You can manually add projects through the UI, or:
   - Modify the API integration code to migrate localStorage data
   - Or simply start fresh with real data

## Troubleshooting

### "Invalid API Key" Error
- Check that you copied the correct key from Supabase
- Make sure your `.env.local` file is saved
- Restart your development server

### "No projects table" Error
- The SQL schema creation may have failed
- Check the SQL Editor for error messages
- Try running the schema script again, or contact Supabase support

### "RLS policy error"
- Make sure you ran the RLS policies script AFTER the schema script
- RLS policies depend on the tables existing first

### Users can't sign up
- Check that the Email provider is enabled in Authentication settings
- Verify that your project's API settings are correct

## Next Steps

1. **Enable real authentication**: Uncomment auth code in `/lib/supabase.ts`
2. **Update API calls**: Switch from mock data to real Supabase queries
3. **Test all features**: Projects, invites, comments, etc.
4. **Deploy to production**: See `DEPLOYMENT_GUIDE.md`

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env.local` to version control
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secret
- Use the anon key for client-side operations
- Use the service role key only in server-side code
- All data access is protected by RLS policies

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Community: https://discord.supabase.io
- Project Issues: Check the project's issue tracker

---

After completing these steps, your Elvenwood Interior Design Portal will be connected to a real, production-ready Supabase database!
