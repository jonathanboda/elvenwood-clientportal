# Design Viewer Implementation Guide

## Overview

This guide provides complete documentation for the Design Viewer feature, including frontend components, backend API endpoints, database schema, and testing procedures.

## Table of Contents

1. [Frontend Components](#frontend-components)
2. [Backend API Endpoints](#backend-api-endpoints)
3. [Database Schema](#database-schema)
4. [File Upload & Storage](#file-upload--storage)
5. [Real-time Updates](#real-time-updates)
6. [Testing Guide](#testing-guide)

---

## Frontend Components

### 1. Client Portal Layout (`app/client-portal/layout.tsx`)

Provides the sidebar navigation for the client portal with:
- Dashboard link
- Design Viewer link
- User Profile link
- Logout button
- Collapsible sidebar toggle

```tsx
// Sidebar menu items
const menuItems = [
  { label: "Dashboard", href: "/client-portal", icon: LayoutDashboard },
  { label: "Design Viewer", href: "/client-portal/design-viewer", icon: ImageIcon },
  { label: "Profile", href: "/client-portal/profile", icon: User },
];
```

### 2. Design Viewer Page (`app/client-portal/design-viewer/page.tsx`)

Main design viewing and feedback interface with:

#### Features:
- **Design Canvas Section**
  - Display design image with zoom controls (50%-200%)
  - Toolbar with zoom in/out, reset, fullscreen, download buttons
  - Design metadata (name, version, description)

- **Feedback Section**
  - Multi-line textarea for comments
  - File upload for reference images/PDFs (max 10MB)
  - Submit and Cancel buttons
  - Loading states and validation

- **Comments Section**
  - List of all feedback comments (reverse chronological)
  - Each comment shows:
    - User avatar and name
    - Timestamp
    - Comment text
    - Attachment preview (clickable)
    - Edit/Delete buttons (for own comments)
    - Resolved status badge
  - Nested replies with indentation
  - Edit mode for own comments

#### State Management:
```tsx
const [design, setDesign] = useState<Design>(mockDesign);
const [comments, setComments] = useState<Comment[]>(mockComments);
const [zoomLevel, setZoomLevel] = useState(100);
const [feedbackText, setFeedbackText] = useState("");
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
```

#### Interfaces:
```tsx
interface Attachment {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  attachments: Attachment[];
  createdAt: string;
  canEdit: boolean;
  canDelete: boolean;
  replies?: Comment[];
  resolved?: boolean;
}

interface Design {
  id: string;
  name: string;
  version: string;
  description: string;
  fileUrl: string;
  fileType: "image" | "pdf" | "gltf";
  createdAt: string;
}
```

---

## Backend API Endpoints

### 1. Get Version Details

**Endpoint:** `GET /api/versions/:id`

**Response:**
```json
{
  "data": {
    "id": "design-1",
    "name": "Modern Living Room Redesign",
    "version": "v3.0",
    "description": "Contemporary design",
    "fileUrl": "https://...",
    "fileType": "image",
    "createdAt": "2024-11-08"
  }
}
```

**Implementation:** `app/api/versions/[id]/route.ts`

### 2. Get Comments for Version

**Endpoint:** `GET /api/versions/:id/comments`

**Response:**
```json
{
  "data": [
    {
      "id": "comment-1",
      "versionId": "design-1",
      "authorId": "user-1",
      "authorName": "Sarah Johnson",
      "content": "Love the design!",
      "attachments": [],
      "createdAt": "2024-11-07T14:30:00Z",
      "canEdit": true,
      "canDelete": true,
      "replies": []
    }
  ]
}
```

**Implementation:** `app/api/versions/[id]/comments/route.ts`

### 3. Post Comment

**Endpoint:** `POST /api/versions/:id/comments`

**Request Body:**
```json
{
  "content": "This looks great!",
  "authorId": "current-user-id",
  "authorName": "John Doe",
  "attachments": [
    {
      "fileName": "reference.jpg",
      "fileSize": 245000,
      "fileType": "image/jpeg",
      "url": "signed-url"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "comment-new",
    "versionId": "design-1",
    "content": "This looks great!",
    "attachments": [...],
    "createdAt": "2024-11-08T10:30:00Z"
  }
}
```

**Implementation:** `app/api/versions/[id]/comments/route.ts`

### 4. Upload File

**Endpoint:** `POST /api/upload`

**Request:** Form data with `file` field

**Response:**
```json
{
  "data": {
    "id": "attachment-1730814600000",
    "fileName": "reference.jpg",
    "fileSize": 245000,
    "fileType": "image/jpeg",
    "url": "https://...",
    "storagePath": "comments/1730814600000-reference.jpg"
  }
}
```

**Implementation:** `app/api/upload/route.ts`

---

## Database Schema

### Tables

#### 1. `versions` Table
```sql
CREATE TABLE versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) DEFAULT 'image',
  name VARCHAR(255),
  description TEXT,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  UNIQUE(project_id, version_number)
);

CREATE INDEX idx_versions_project_id ON versions(project_id);
CREATE INDEX idx_versions_created_at ON versions(created_at DESC);
```

#### 2. `comments` Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT comments_content_not_empty CHECK (length(trim(content)) > 0)
);

CREATE INDEX idx_comments_version_id ON comments(version_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

#### 3. `comment_attachments` Table
```sql
CREATE TABLE comment_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  storage_path VARCHAR(500) NOT NULL
);

CREATE INDEX idx_comment_attachments_comment_id ON comment_attachments(comment_id);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view comments on versions in their projects
CREATE POLICY "view_comments" ON comments
  FOR SELECT USING (
    version_id IN (
      SELECT v.id FROM versions v
      JOIN projects p ON v.project_id = p.id
      WHERE p.client_id = auth.uid() OR p.designer_id = auth.uid()
    )
  );

-- Users can create comments on versions in their projects
CREATE POLICY "create_comments" ON comments
  FOR INSERT WITH CHECK (
    version_id IN (
      SELECT v.id FROM versions v
      JOIN projects p ON v.project_id = p.id
      WHERE p.client_id = auth.uid() OR p.designer_id = auth.uid()
    ) AND author_id = auth.uid()
  );

-- Users can only update their own comments
CREATE POLICY "update_own_comments" ON comments
  FOR UPDATE USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Users can only delete their own comments
CREATE POLICY "delete_own_comments" ON comments
  FOR DELETE USING (author_id = auth.uid());

-- Attachment access follows comment access
CREATE POLICY "view_attachments" ON comment_attachments
  FOR SELECT USING (
    comment_id IN (
      SELECT id FROM comments WHERE version_id IN (
        SELECT v.id FROM versions v
        JOIN projects p ON v.project_id = p.id
        WHERE p.client_id = auth.uid() OR p.designer_id = auth.uid()
      )
    )
  );
```

### Triggers for Automatic Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_versions_updated_at
  BEFORE UPDATE ON versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## File Upload & Storage

### Supabase Storage Configuration

1. **Create Storage Bucket:**
   - Go to Supabase Dashboard > Storage
   - Create new bucket named `designs`
   - Make it private (authenticated users only)

2. **Storage Bucket RLS Policy:**
```sql
CREATE POLICY "Users can upload comment attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'designs' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view attachments from their projects"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'designs' AND
  (
    auth.uid() IN (
      SELECT client_id FROM projects WHERE id IN (
        SELECT project_id FROM versions WHERE id IN (
          SELECT version_id FROM comments WHERE author_id = auth.uid()
        )
      )
    ) OR
    auth.uid() IN (
      SELECT designer_id FROM projects WHERE id IN (
        SELECT project_id FROM versions WHERE id IN (
          SELECT version_id FROM comments WHERE author_id = auth.uid()
        )
      )
    )
  )
);
```

3. **Upload Implementation:**
```tsx
const uploadFile = async (file: File) => {
  const storagePath = `comments/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from('designs')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get signed URL (valid for 1 hour)
  const { data: urlData } = await supabase.storage
    .from('designs')
    .createSignedUrl(storagePath, 3600);

  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    url: urlData?.signedUrl,
    storagePath,
  };
};
```

---

## Real-time Updates

### Supabase Realtime Setup

1. **Enable Realtime on tables:**
```sql
ALTER TABLE comments REPLICA IDENTITY FULL;
ALTER TABLE comment_attachments REPLICA IDENTITY FULL;
```

2. **Frontend Subscription:**
```tsx
useEffect(() => {
  const subscription = supabase
    .channel(`comments:version_id=eq.${versionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `version_id=eq.${versionId}`,
      },
      (payload) => {
        // Update comments list optimistically
        if (payload.eventType === 'INSERT') {
          setComments([payload.new, ...comments]);
        } else if (payload.eventType === 'UPDATE') {
          setComments(prev =>
            prev.map(c => c.id === payload.new.id ? payload.new : c)
          );
        } else if (payload.eventType === 'DELETE') {
          setComments(prev => prev.filter(c => c.id !== payload.old.id));
        }
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [versionId]);
```

---

## Testing Guide

### Manual Testing Checklist

#### 1. Comment Submission
- [ ] Open Design Viewer page
- [ ] Type text in feedback textarea
- [ ] Submit feedback
- [ ] Verify comment appears at top of list
- [ ] Verify form clears after submission

#### 2. File Upload
- [ ] Select an image file (< 10MB)
- [ ] Verify file preview shows in upload area
- [ ] Submit feedback with file
- [ ] Verify file thumbnail appears in comment
- [ ] Click file to open in new tab

#### 3. Comment Editing
- [ ] Click "Edit" on your own comment
- [ ] Modify text
- [ ] Click "Save"
- [ ] Verify comment updates immediately

#### 4. Comment Deletion
- [ ] Click "Delete" on your own comment
- [ ] Confirm deletion
- [ ] Verify comment is removed from list

#### 5. Zoom Controls
- [ ] Click zoom in (should increase to 200%)
- [ ] Click zoom out (should decrease to 50%)
- [ ] Click reset (should return to 100%)

#### 6. Nested Replies
- [ ] View comment with designer reply
- [ ] Verify reply is indented under original comment
- [ ] Verify designer name shows in reply

#### 7. Resolved Status
- [ ] View comment marked as resolved
- [ ] Verify "Resolved" badge appears
- [ ] Verify comment background is green

### Automated Testing Script

```bash
# Test endpoint responses
echo "Testing API endpoints..."

# Test get version
curl http://localhost:3000/api/versions/design-1

# Test get comments
curl http://localhost:3000/api/versions/design-1/comments

# Test post comment
curl -X POST http://localhost:3000/api/versions/design-1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test comment",
    "authorId": "user-123",
    "authorName": "Test User",
    "attachments": []
  }'

# Test file upload
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/test/image.jpg"
```

### Performance Testing

Monitor in browser DevTools:
- [ ] Page load time < 2 seconds
- [ ] Comment submission < 1 second
- [ ] File upload progress for large files
- [ ] Memory usage with 100+ comments loaded

### Accessibility Testing

- [ ] Tab through form elements (design → feedback → submit)
- [ ] Screen reader reads comment content
- [ ] Keyboard shortcuts: Enter to submit (with Cmd/Ctrl), Escape to cancel
- [ ] Color contrast passes WCAG AA standards

---

## Deployment Checklist

- [ ] Environment variables configured (Supabase URL, API keys)
- [ ] Database migrations applied
- [ ] Storage bucket created and policies set
- [ ] API endpoints tested in production
- [ ] Real-time subscriptions working
- [ ] File upload virus scanning enabled
- [ ] Signed URL expiration set (e.g., 1 hour)
- [ ] CORS headers configured
- [ ] Rate limiting configured (e.g., 100 comments per hour per user)
- [ ] Error logging enabled (Sentry or similar)

---

## Troubleshooting

### Images not loading
- Check `next.config.ts` has correct image domains
- Verify Supabase signed URL not expired
- Check browser CORS settings

### Comments not appearing
- Check browser console for API errors
- Verify user has project access (RLS)
- Check database for comment records

### File upload failing
- Verify file size < 10MB
- Check file type is image or PDF
- Verify storage bucket exists
- Check storage bucket RLS policies

### Real-time updates not working
- Enable Realtime on tables (`REPLICA IDENTITY FULL`)
- Check Realtime is enabled in Supabase settings
- Verify channel subscription is correct
- Check browser DevTools WebSocket connection

---

## Security Considerations

1. **File Upload Validation**
   - Validate file type server-side
   - Limit file size to 10MB
   - Scan uploads for malware (ClamAV, VirusTotal)
   - Sanitize file names

2. **Access Control**
   - RLS policies enforce project membership
   - Users can only edit/delete own comments
   - Signed URLs expire after 1 hour
   - IP-based rate limiting

3. **Data Privacy**
   - Comments stored encrypted in Supabase
   - Files in private storage bucket
   - HTTPS only in production
   - PII redacted from logs

4. **Input Sanitization**
   - HTML/JS stripped from comments
   - SQL injection prevented by parameterized queries
   - XSS protection via React's built-in escaping

---

## Future Enhancements

- [ ] 3D model viewer (glTF/GLB support with Three.js)
- [ ] PDF viewer with annotation tools
- [ ] Image markup tools (arrows, circles, highlights)
- [ ] Batch comment actions (mark all as resolved)
- [ ] Comment search and filtering
- [ ] Email notifications for replies
- [ ] Slack integration for designer notifications
- [ ] Analytics dashboard (response times, feedback volume)

