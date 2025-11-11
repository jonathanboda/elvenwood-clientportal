# Notifications System Setup Guide

## Overview

The notification system has been fully implemented with the following features:

1. **File attachment support in comments** - Users can attach images and PDFs to comments
2. **Bidirectional comment sync** - Comments from both client and designer appear in both portals in real-time
3. **Notification system** - Users receive notifications when comments are added, with real-time updates

## Setup Instructions

### Step 1: Create the Notifications Table in Supabase

You need to run a SQL migration to create the notifications table in your Supabase database.

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mszlbzcyebrcfvsqphxw
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste the SQL from the file: `supabase/migrations/create_notifications_table.sql`
5. Click **Run** to execute the migration

The migration creates:
- `notifications` table with proper structure
- Row Level Security (RLS) policies
- Database indexes for performance

### Step 2: Enable Realtime for Comments and Notifications

Realtime synchronization requires enabling Realtime replication on the relevant tables.

1. In Supabase Dashboard, go to **Database** > **Replication**
2. Find the `comments` table in the list
3. Toggle **ON** the Realtime switch for the `comments` table
4. Find the `notifications` table in the list
5. Toggle **ON** the Realtime switch for the `notifications` table

This enables instant updates when:
- A new comment is added (both parties see it immediately)
- A new notification is created (notification bell updates in real-time)

### Step 3: Verify Storage Setup

Make sure the Supabase Storage bucket for file attachments is properly configured (this should already be done from previous setup):

1. Go to **Storage** in the Supabase Dashboard
2. Verify the `design files` bucket exists
3. Verify the storage policies are in place (see STORAGE_SETUP_GUIDE.md for details)

## Features Implemented

### 1. Comment Attachments

**Location:** `app/project/[id]/page.tsx`

Users can now attach files to comments:
- File input accepts images (PNG, JPG, etc.) and PDFs
- Files are uploaded to Supabase Storage
- Attachment URLs and filenames are stored in the database
- Attachments display with a download link in the comments section

**How it works:**
1. User selects a file when adding a comment
2. File is uploaded to `/api/upload` endpoint
3. Storage path is returned and saved with the comment
4. Other users can click to view/download the attachment

### 2. Bidirectional Comment Sync

**Location:** `app/project/[id]/page.tsx` (lines 63-86)

Real-time comment synchronization using Supabase Realtime:
```typescript
const channel = supabase
  .channel(`project-${projectId}-comments`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'comments',
    filter: `project_id=eq.${projectId}`,
  }, (payload) => {
    fetchProject(); // Refresh comments when changes detected
  })
  .subscribe();
```

**How it works:**
- Both client and designer use the same project detail page (`/project/[id]`)
- All comments are displayed without filtering by author
- When anyone adds a comment, all viewers see it instantly via Realtime
- Comments are fetched with author information to show who posted them

### 3. Notification System

**Components:**
- Database table: Created via SQL migration
- API endpoint: `app/api/notifications/route.ts`
- Notification creation: `app/project/[id]/page.tsx` (lines 211-254)
- UI component: Updated `app/components/layout/Header.tsx`

**How it works:**

1. **When a comment is added:**
   - The system identifies the current user (designer or client)
   - Creates a notification for the other party
   - Notification includes: title, message, project ID, comment ID
   - Example: "Jane Client commented on Kitchen Design with an attachment: 'Looks great! Can we make the cabinets darker?'"

2. **Notification display:**
   - Bell icon in the header shows unread count
   - Clicking the bell opens a dropdown with all notifications
   - Unread notifications are highlighted
   - Clicking a notification marks it as read and navigates to the project

3. **Real-time updates:**
   - Uses Supabase Realtime to update the notification bell instantly
   - When a new notification arrives, the count updates without refreshing
   - Notifications appear immediately in the dropdown

## Database Schema

### Notifications Table

```sql
notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  comment_id UUID REFERENCES comments(id),
  type VARCHAR(50),              -- 'new_comment', 'new_version', etc.
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  read_at TIMESTAMP
)
```

### Comments Table (updated)

The comments table now includes:
- `attachment_url` - URL to the uploaded file in Supabase Storage
- `attachment_name` - Original filename of the attachment

## Testing the Implementation

### Test Comment Attachments

1. Sign in as a designer or client
2. Navigate to a project: `/project/[project-id]`
3. Scroll to the comments section
4. Write a comment
5. Click the file input and select an image or PDF
6. Click "Post Comment"
7. Verify the file uploads successfully
8. Verify the attachment appears in the comment with a download link

### Test Bidirectional Comments

1. Open two browser windows (or use incognito mode)
2. Sign in as a designer in one window
3. Sign in as a client in the other window
4. Navigate both to the same project
5. Add a comment from the designer window
6. **Verify the comment appears instantly in the client window**
7. Add a comment from the client window
8. **Verify the comment appears instantly in the designer window**

### Test Notifications

1. Open two browser windows
2. Sign in as a designer in one window
3. Sign in as a client in the other window
4. Navigate both to the same project
5. As the client, add a comment
6. **In the designer window, verify:**
   - The notification bell shows a red badge with count
   - Clicking the bell shows the new notification
   - The notification message includes the comment preview
   - Clicking the notification navigates to the project
   - After clicking, the notification is marked as read
7. Repeat in reverse (designer comments, client receives notification)

## API Endpoints

### GET /api/notifications
Fetch notifications for the current user
- Requires: Authorization header with session token
- Returns: Array of notification objects

### POST /api/notifications
Create a new notification
- Body: `{ user_id, project_id, comment_id, type, title, message }`
- Used automatically when comments are added

### PATCH /api/notifications
Mark a notification as read
- Body: `{ notification_id }`
- Requires: Authorization header with session token

## Troubleshooting

### Comments not syncing in real-time

**Issue:** Comments added by one user don't appear for the other user without refreshing

**Solutions:**
1. Verify Realtime is enabled for the `comments` table in Supabase Dashboard
2. Check browser console for Realtime subscription errors
3. Ensure both users are viewing the same project (check project ID in URL)

### Notifications not appearing

**Issue:** No notifications appear when comments are added

**Solutions:**
1. Verify the notifications table was created (check SQL Editor)
2. Verify Realtime is enabled for the `notifications` table
3. Check browser console for API errors
4. Verify the `client_id` and `designer_id` fields are set in the projects table

### Attachment upload fails

**Issue:** File attachment upload shows an error

**Solutions:**
1. Verify the `design files` storage bucket exists in Supabase
2. Check storage policies are configured correctly (see STORAGE_SETUP_GUIDE.md)
3. Verify the file is under 50MB
4. Check the file type is allowed (images or PDFs)

### Notification bell doesn't update

**Issue:** Notification count doesn't update without refreshing

**Solutions:**
1. Verify Realtime is enabled for the `notifications` table
2. Check browser console for Realtime subscription errors
3. Verify the service role key is set in environment variables

## Files Modified/Created

### New Files
- `supabase/migrations/create_notifications_table.sql` - Database migration
- `app/api/notifications/route.ts` - Notifications API endpoint
- `app/components/NotificationBell.tsx` - Standalone notification component (alternative implementation)

### Modified Files
- `app/project/[id]/page.tsx` - Added comment attachments, real-time sync, and notification creation
- `app/components/layout/Header.tsx` - Updated to use real notifications with Realtime

## Next Steps (Optional Enhancements)

Consider implementing these additional features:

1. **Email notifications** - Send email when a notification is created
2. **Notification preferences** - Allow users to control what notifications they receive
3. **Push notifications** - Browser push notifications for instant alerts
4. **Notification categories** - Filter notifications by type
5. **Mark all as read** - Batch operation for clearing notifications
6. **Delete notifications** - Allow users to dismiss notifications

## Summary

All three requested features are now complete:

1. ✅ **Attachment in comment section** - Users can attach files to comments
2. ✅ **Bidirectional comment sync** - Comments reflect in both client and designer portals instantly
3. ✅ **Notification system** - Users receive notifications when comments are added

The system uses Supabase Realtime for instant synchronization, ensuring a smooth collaborative experience between designers and clients.
