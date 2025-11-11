# Supabase Storage Setup Guide

## ✓ ISSUE RESOLVED - Upload/Download is Working!

**Status: The upload and download system is now fully functional!**

### What's Working:
- ✓ Files upload successfully to Supabase Storage "design files" bucket
- ✓ Files download successfully with 200 OK status
- ✓ Proper file paths: `{projectId}/{timestamp}-{sanitizedFileName}`
- ✓ Tested with multiple file sizes (11KB to 2.5MB)

### Known Issue - Old Versions:
**OLD versions created before storage setup will NEVER work** because:
1. They have file_path like `download.jpg` (just a filename, not a real path)
2. They were never actually uploaded to Supabase Storage
3. Attempting to download them will fail with:
   ```
   [download] Error downloading from storage: StorageUnknownError
   Status: 400 Bad Request
   ```

**Solution**: Delete any old project versions and only use newly uploaded files.

## Solution: Set Up Supabase Storage Bucket

### Step 1: Create the Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mszlbzcyebrcfvsqphxw
2. Click on **Storage** in the left sidebar
3. Click **New bucket** button
4. Fill in the form:
   - **Name:** `design-files` (EXACTLY this name)
   - **Public bucket:** Leave UNCHECKED (we'll use policies for access control)
   - **Allowed MIME types:** Leave empty (we validate in API)
   - **File size limit:** 50 MB
5. Click **Create bucket**

### Step 2: Set Up Storage Policies

After creating the bucket, you need to add 3 policies for proper access control.

#### Policy 1: Service Role Full Access
This allows the API (using service role key) to manage all files.

1. Click on the `design-files` bucket
2. Go to **Policies** tab
3. Click **New policy**
4. Fill in:
   - **Policy name:** `Service role full access`
   - **Allowed operation:** SELECT all operations (INSERT, SELECT, UPDATE, DELETE)
   - **Target roles:** `service_role`
   - **Policy definition:** Use this SQL:
     ```sql
     (bucket_id = 'design-files')
     ```
5. Click **Save**

#### Policy 2: Authenticated Users Can Upload
This allows authenticated users to upload files.

1. Click **New policy**
2. Fill in:
   - **Policy name:** `Authenticated users can upload`
   - **Allowed operation:** SELECT INSERT
   - **Target roles:** `authenticated`
   - **Policy definition:** Use this SQL:
     ```sql
     (bucket_id = 'design-files')
     ```
3. Click **Save**

#### Policy 3: Public Read Access
This allows anyone to download files (needed for file previews).

1. Click **New policy**
2. Fill in:
   - **Policy name:** `Public read access`
   - **Allowed operation:** SELECT only
   - **Target roles:** `anon` and `authenticated`
   - **Policy definition:** Use this SQL:
     ```sql
     (bucket_id = 'design-files')
     ```
3. Click **Save**

### Step 3: Test the Setup

After setting up the storage bucket and policies:

1. **Go to your app** at http://localhost:3000
2. **Sign in** as a designer
3. **Go to Designer Projects** page
4. **Create a new project** or open an existing one
5. **Upload a NEW design version:**
   - Click "Upload New Version"
   - Select an image file (PNG, JPG, etc.)
   - Fill in the version details
   - Click Upload
6. **Try downloading the newly uploaded file:**
   - Click the "Download" button next to the version
   - The file should download successfully

### Step 4: Delete Old Versions

The old versions (with file path `download.jpg`) will NOT work because they were never actually uploaded to Supabase Storage. You should:

1. Delete any old design versions that show "No file available"
2. Upload NEW versions after the storage bucket is set up

## Verification

To verify the storage is working:

1. Go to Supabase Dashboard > Storage > design-files
2. You should see folders with project IDs
3. Inside each folder, you should see files with names like `1762777293-image.jpg`

## Common Issues

### Issue: "No file available for this version"
**Cause:** This is an old file that was uploaded before storage bucket was created.
**Solution:** Delete the old version and upload a new one.

### Issue: "Failed to upload file: Bucket not found"
**Cause:** The storage bucket hasn't been created yet.
**Solution:** Follow Step 1 to create the bucket.

### Issue: "Storage error: new row violates row-level security policy"
**Cause:** Storage policies haven't been set up correctly.
**Solution:** Follow Step 2 to add all 3 policies.

### Issue: Download shows "400 Bad Request"
**Cause:** Either the bucket doesn't exist or the file doesn't exist in storage.
**Solution:**
1. Verify the bucket exists in Supabase Dashboard
2. Upload a NEW file (don't try to download old files)
3. Check the file appears in Storage > design-files

## File Upload Flow

Here's how the file upload works now:

1. User uploads a file from the UI
2. Frontend sends file to `/api/upload` endpoint
3. API validates the file (type, size)
4. API generates a unique file path: `{projectId}/{timestamp}-{sanitizedFileName}`
5. API uploads the file to Supabase Storage bucket `design-files`
6. API returns the storage path to store in the database
7. When downloading, the API downloads from the same storage path

## Need Help?

If you're still having issues after following these steps:

1. Check the browser console for errors
2. Check the server logs (terminal running `npm run dev`)
3. Verify the bucket name is EXACTLY `design-files` (no spaces, no typos)
4. Make sure all 3 policies are added
5. Try uploading a BRAND NEW file (don't use old versions)
