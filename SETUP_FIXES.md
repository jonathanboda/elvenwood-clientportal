# Setup Fixes - Comments & Design Viewer

## Issue 1: Column `comments.attachment_name` Does Not Exist

### Problem
The application was trying to fetch `attachment_url` and `attachment_name` columns from the `comments` table, but these columns didn't exist in the database.

### Solution
Created a database migration to add the missing columns.

**File created:** `supabase/migrations/add_comment_attachments.sql`

### Setup Instructions

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mszlbzcyebrcfvsqphxw
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste the following SQL:

```sql
-- Add attachment columns to comments table
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN comments.attachment_url IS 'URL to the file stored in Supabase Storage';
COMMENT ON COLUMN comments.attachment_name IS 'Original filename of the attachment';
```

5. Click **Run** to execute the migration

### Verification
After running the migration, you can verify the columns were added:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'comments'
AND column_name IN ('attachment_url', 'attachment_name');
```

You should see both columns listed.

---

## Issue 2: Remove Demo Data from Design Viewer

### Problem
The design viewer (`/client-portal/design-viewer`) was showing demo/mock data instead of real data from the database.

### Solution
Completely rewrote the design viewer page to:
- Fetch real projects from Supabase database
- Display all client projects (not just one)
- Remove all references to mock data
- Use real project and version data

**File modified:** `app/client-portal/design-viewer/page.tsx`

### Changes Made

#### Before:
- Used `mockProjects` and `getProjectWithVersions()` from `@/lib/mockDataEnhanced`
- Displayed only the first mock project
- Had fake "Accept Design" functionality with alerts
- Used demo interfaces that didn't match database structure

#### After:
- Fetches real projects using Supabase client
- Queries projects where `client_id` matches the current user
- Includes related data (designer info, versions)
- Displays ALL projects for the client
- Removed "Accept Design" button (can be added later with real functionality)
- Updated interfaces to match actual database schema:
  - `project_name` instead of `name`
  - `version_number` instead of `versionNumber`
  - `created_at` instead of `submittedDate`
  - Designer has `full_name` and `email` instead of full object

### Database Query
The page now fetches data with this query:

```typescript
const { data, error } = await supabase
  .from("projects")
  .select(`
    id,
    project_name,
    description,
    status,
    designer:profiles!projects_designer_id_fkey(full_name, email),
    versions(
      id,
      version_number,
      changelog,
      file_name,
      file_path,
      created_at
    )
  `)
  .eq("client_id", user.id)
  .order("created_at", { ascending: false });
```

### User Experience

**Before:**
- Always showed the same demo project
- Didn't reflect actual user data
- "Accept Design" button showed an alert instead of doing anything

**After:**
- Shows all projects assigned to the logged-in client
- Empty state when no projects exist
- Each project shows:
  - Project name and description
  - Status
  - Number of design versions
  - Designer name
  - All versions with changelog and upload date
  - View Design button for each version

### Testing

1. Sign in as a client user
2. Navigate to `/client-portal/design-viewer`
3. You should see:
   - All projects where you are the client
   - Design versions for each project
   - Real data from the database
   - Empty state if you have no projects

---

## Summary

Both issues have been resolved:

1. ✅ **Database Migration**: Added `attachment_url` and `attachment_name` columns to the `comments` table
2. ✅ **Design Viewer**: Removed all demo data and implemented real database queries

## Action Required

You need to run the SQL migration in Supabase Dashboard to add the comment attachment columns. The design viewer changes are already in the code and will work immediately after you pull the latest changes.
