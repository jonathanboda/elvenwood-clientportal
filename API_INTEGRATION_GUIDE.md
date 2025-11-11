# API Integration Guide

This guide explains how to integrate the enhanced components with your backend API and Supabase.

## Table of Contents

1. [Activity Feed API](#activity-feed-api)
2. [Comments API](#comments-api)
3. [Design Versions API](#design-versions-api)
4. [Notifications API](#notifications-api)
5. [User Profile API](#user-profile-api)
6. [File Upload API](#file-upload-api)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## Activity Feed API

### Fetch Activity Feed

**Endpoint**: `GET /api/activity-feed?clientId={clientId}&limit=20&offset=0`

**Description**: Get the activity feed for a client, including recent versions and comments.

**Request Parameters**:
```typescript
{
  clientId: string;        // Client user ID
  limit?: number;          // Max results (default: 20)
  offset?: number;         // For pagination (default: 0)
  type?: string;           // Filter: 'all' | 'upload' | 'comment'
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    activities: Activity[];
    total: number;
    hasMore: boolean;
  };
  error?: string;
}
```

**Example Implementation**:
```typescript
// lib/api/activities.ts
export async function fetchActivityFeed(clientId: string, limit = 20, offset = 0) {
  try {
    const response = await fetch(
      `/api/activity-feed?clientId=${clientId}&limit=${limit}&offset=${offset}`
    );

    if (!response.ok) throw new Error('Failed to fetch activities');

    return await response.json();
  } catch (error) {
    console.error('Activity feed error:', error);
    throw error;
  }
}
```

**Supabase Implementation**:
```typescript
export async function fetchActivityFeedFromSupabase(clientId: string) {
  const supabase = createClient();

  // Get client's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('client_id', clientId);

  if (!projects?.length) return { activities: [], total: 0 };

  const projectIds = projects.map(p => p.id);

  // Get recent versions
  const { data: versions } = await supabase
    .from('versions')
    .select(`
      id,
      version_number,
      created_at,
      file_path,
      changelog,
      project_id,
      project:projects(id, project_name),
      uploaded_by:profiles(id, full_name, avatar_url)
    `)
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })
    .limit(20);

  const activities: Activity[] = (versions || []).map(v => ({
    id: v.id,
    type: 'upload',
    user: {
      id: v.uploaded_by.id,
      name: v.uploaded_by.full_name,
      email: '',
      role: 'Designer',
      avatarUrl: v.uploaded_by.avatar_url,
    },
    project: {
      id: v.project.id,
      name: v.project.project_name,
    },
    timestamp: v.created_at,
    imageUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/designs/${v.file_path}`,
    postText: `Version ${v.version_number} uploaded`,
  }));

  return {
    activities,
    total: activities.length,
  };
}
```

---

## Comments API

### Add Comment

**Endpoint**: `POST /api/comments`

**Description**: Add a comment to a design version.

**Request Body**:
```typescript
{
  versionId: string;           // Design version ID
  projectId: string;           // Project ID
  content: string;             // Comment text
  attachmentUrl?: string;      // URL of uploaded attachment
  attachmentType?: 'image' | 'file'; // Type of attachment
  parentCommentId?: string;    // For nested replies
}
```

**Response**:
```typescript
{
  success: boolean;
  data?: {
    id: string;
    content: string;
    author: User;
    timestamp: string;
    attachmentUrl?: string;
  };
  error?: string;
}
```

**Implementation**:
```typescript
// lib/api/comments.ts
export async function addComment(
  versionId: string,
  projectId: string,
  content: string,
  attachment?: File,
  parentCommentId?: string
) {
  const supabase = createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Upload attachment if provided
  let attachmentUrl: string | null = null;
  if (attachment) {
    const fileName = `${Date.now()}-${attachment.name}`;
    const { data, error } = await supabase.storage
      .from('comments')
      .upload(`${projectId}/${fileName}`, attachment);

    if (error) throw error;
    attachmentUrl = data.path;
  }

  // Insert comment
  const { data, error } = await supabase
    .from('comments')
    .insert({
      version_id: versionId,
      project_id: projectId,
      author_id: user.id,
      content,
      attachment_url: attachmentUrl,
      parent_comment_id: parentCommentId,
    })
    .select(`
      id,
      content,
      created_at,
      author:profiles(id, full_name, avatar_url)
    `)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    content: data.content,
    author: {
      id: data.author.id,
      name: data.author.full_name,
      avatarUrl: data.author.avatar_url,
    },
    timestamp: data.created_at,
    attachmentUrl,
  };
}
```

### Fetch Comments

**Endpoint**: `GET /api/comments?versionId={versionId}`

**Response**:
```typescript
{
  success: boolean;
  data: Comment[];
  error?: string;
}
```

**Supabase Implementation**:
```typescript
export async function fetchComments(versionId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      attachment_url,
      author:profiles(id, full_name, avatar_url),
      replies:comments(id, content, created_at, author:profiles(id, full_name, avatar_url))
    `)
    .eq('version_id', versionId)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(comment => ({
    id: comment.id,
    user: {
      id: comment.author.id,
      name: comment.author.full_name,
      avatarUrl: comment.author.avatar_url,
    },
    text: comment.content,
    timestamp: comment.created_at,
    imageUrl: comment.attachment_url,
    replies: comment.replies.map(reply => ({
      id: reply.id,
      user: {
        id: reply.author.id,
        name: reply.author.full_name,
        avatarUrl: reply.author.avatar_url,
      },
      text: reply.content,
      timestamp: reply.created_at,
    })),
  }));
}
```

---

## Design Versions API

### Fetch Design Versions

**Endpoint**: `GET /api/projects/{projectId}/versions`

**Response**:
```typescript
{
  success: boolean;
  data: DesignVersion[];
  error?: string;
}
```

**Supabase Implementation**:
```typescript
export async function fetchDesignVersions(projectId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('versions')
    .select(`
      id,
      version_number,
      file_path,
      created_at,
      changelog,
      is_accepted,
      file_name,
      uploaded_by:profiles(full_name)
    `)
    .eq('project_id', projectId)
    .order('version_number', { ascending: false });

  if (error) throw error;

  return data.map(v => ({
    id: v.id,
    versionNumber: v.version_number,
    fileUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/designs/${v.file_path}`,
    submittedDate: v.created_at,
    changelog: v.changelog ? v.changelog.split('\n').filter(Boolean) : [],
    isAccepted: v.is_accepted,
    comments: [], // Fetch separately if needed
  }));
}
```

### Upload Design Version

**Endpoint**: `POST /api/projects/{projectId}/versions`

**Request**:
```typescript
{
  file: File;              // Design file
  changelog?: string;      // Changes in this version
  description?: string;    // Version description
}
```

**Supabase Implementation**:
```typescript
export async function uploadDesignVersion(
  projectId: string,
  file: File,
  changelog?: string
) {
  const supabase = createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get latest version number
  const { data: versions } = await supabase
    .from('versions')
    .select('version_number')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1);

  const nextVersion = (versions?.[0]?.version_number || 0) + 1;

  // Upload file to storage
  const fileName = `${projectId}/v${nextVersion}-${Date.now()}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('designs')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // Create version record
  const { data, error } = await supabase
    .from('versions')
    .insert({
      project_id: projectId,
      version_number: nextVersion,
      file_path: uploadData.path,
      file_name: file.name,
      file_size: file.size,
      changelog,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Create activity feed entry
  await supabase.from('activities').insert({
    project_id: projectId,
    user_id: user.id,
    type: 'version_uploaded',
    version_id: data.id,
  });

  return data;
}
```

### Accept Design

**Endpoint**: `POST /api/versions/{versionId}/accept`

**Supabase Implementation**:
```typescript
export async function acceptDesign(versionId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('versions')
    .update({ is_accepted: true })
    .eq('id', versionId)
    .select()
    .single();

  if (error) throw error;

  // Create notification for designer
  const { data: version } = await supabase
    .from('versions')
    .select(`
      project:projects(designer_id)
    `)
    .eq('id', versionId)
    .single();

  if (version) {
    await supabase.from('notifications').insert({
      user_id: version.project.designer_id,
      type: 'design_accepted',
      version_id: versionId,
      content: 'Your design has been accepted!',
    });
  }

  return data;
}
```

---

## Notifications API

### Fetch Notifications

**Endpoint**: `GET /api/notifications?userId={userId}&status=unread`

**Request Parameters**:
```typescript
{
  userId: string;
  status?: 'all' | 'unread' | 'read';  // default: 'all'
  limit?: number;                       // default: 50
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
  error?: string;
}
```

**Supabase Implementation**:
```typescript
export async function fetchNotifications(
  userId: string,
  status: 'all' | 'unread' | 'read' = 'all'
) {
  const supabase = createClient();

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('is_read', status === 'read');
  }

  const { data, error } = await query.limit(50);

  if (error) throw error;

  const unreadCount = data.filter(n => !n.is_read).length;

  return {
    notifications: data.map(n => ({
      id: n.id,
      text: getNotificationText(n.type, n.content),
      date: n.created_at,
      isRead: n.is_read,
      type: n.type,
    })),
    unreadCount,
  };
}

function getNotificationText(type: string, content: string): string {
  const messages: Record<string, string> = {
    version_uploaded: 'Designer uploaded a new design version',
    comment_added: 'Comment added to your design',
    design_accepted: 'Design has been accepted',
    project_updated: 'Project details were updated',
  };
  return messages[type] || content;
}
```

### Mark Notifications as Read

**Endpoint**: `PUT /api/notifications/{notificationId}/read`

**Supabase Implementation**:
```typescript
export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}
```

---

## User Profile API

### Fetch User Profile

**Endpoint**: `GET /api/users/{userId}`

**Response**:
```typescript
{
  success: boolean;
  data: User & {
    company?: string;
    projectStats: {
      active: number;
      completed: number;
    };
  };
  error?: string;
}
```

**Supabase Implementation**:
```typescript
export async function fetchUserProfile(userId: string) {
  const supabase = createClient();

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

  // Get project stats
  const { count: activeCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', userId)
    .neq('status', 'completed');

  const { count: completedCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', userId)
    .eq('status', 'completed');

  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
    avatarUrl: profile.avatar_url,
    company: profile.company_name,
    projectStats: {
      active: activeCount || 0,
      completed: completedCount || 0,
    },
  };
}
```

### Update User Profile

**Endpoint**: `PUT /api/users/{userId}`

**Request Body**:
```typescript
{
  fullName?: string;
  company?: string;
  avatar?: File;  // Optional avatar file
}
```

**Supabase Implementation**:
```typescript
export async function updateUserProfile(
  userId: string,
  updates: {
    fullName?: string;
    company?: string;
    avatar?: File;
  }
) {
  const supabase = createClient();

  let avatarUrl: string | null = null;

  // Upload avatar if provided
  if (updates.avatar) {
    const fileName = `${userId}-${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, updates.avatar, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(uploadData.path);

    avatarUrl = data.publicUrl;
  }

  // Update profile
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.fullName,
      company_name: updates.company,
      ...(avatarUrl && { avatar_url: avatarUrl }),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
```

### Change Password

**Endpoint**: `POST /api/users/{userId}/change-password`

**Request Body**:
```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

**Supabase Implementation**:
```typescript
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const supabase = createClient();

  // Verify current password
  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
    email: (await supabase.auth.getUser()).data.user?.email!,
    password: currentPassword,
  });

  if (authError) throw new Error('Current password is incorrect');

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}
```

---

## File Upload API

### Upload Design File

**Endpoint**: `POST /api/upload`

**Request** (multipart/form-data):
```typescript
{
  file: File;              // The file to upload
  type: 'design' | 'comment' | 'avatar';  // Upload destination
  projectId?: string;      // For designs and comments
}
```

**Response**:
```typescript
{
  success: boolean;
  data?: {
    url: string;
    path: string;
    size: number;
  };
  error?: string;
}
```

**Implementation**:
```typescript
// lib/api/upload.ts
export async function uploadFile(
  file: File,
  type: 'design' | 'comment' | 'avatar',
  projectId?: string
) {
  const supabase = createClient();

  // Validate file
  const maxSize = type === 'design' ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB or 10MB
  if (file.size > maxSize) {
    throw new Error(`File too large. Max size: ${maxSize / 1024 / 1024}MB`);
  }

  // Validate file type
  const allowedTypes: Record<string, string[]> = {
    design: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    comment: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    avatar: ['image/jpeg', 'image/png', 'image/webp'],
  };

  if (!allowedTypes[type].includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}`);
  }

  // Generate unique filename
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
  const filePath = projectId
    ? `${projectId}/${fileName}`
    : fileName;

  // Upload to Supabase Storage
  const bucketName = {
    design: 'designs',
    comment: 'comments',
    avatar: 'avatars',
  }[type];

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);

  if (error) throw error;

  return {
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${data.path}`,
    path: data.path,
    size: file.size,
  };
}

// Hook for React components
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, type: 'design' | 'comment' | 'avatar', projectId?: string) => {
    setIsUploading(true);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadFile(file, type, projectId);

      clearInterval(progressInterval);
      setProgress(100);

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return { upload, isUploading, progress, error };
}
```

---

## Error Handling

### Standard Error Response

All API endpoints should follow this error format:

```typescript
{
  success: false;
  error: {
    code: string;         // e.g., 'AUTH_REQUIRED', 'NOT_FOUND', 'VALIDATION_ERROR'
    message: string;      // User-friendly error message
    details?: Record<string, any>;  // Additional context
  };
}
```

### Error Handler Utility

```typescript
// lib/errors.ts
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
  }
}

export function handleError(error: unknown) {
  if (error instanceof APIError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production'
          ? 'An error occurred'
          : error.message,
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    },
  };
}
```

### React Error Boundary

```typescript
// components/ErrorBoundary.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Something went wrong
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {this.state.error?.message}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Testing

### API Testing with cURL

```bash
# Add a comment
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "versionId": "v1",
    "projectId": "p1",
    "content": "Great work!"
  }'

# Fetch notifications
curl -X GET "http://localhost:3000/api/notifications?userId=user1&status=unread"

# Update profile
curl -X PUT http://localhost:3000/api/users/user1 \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "company": "ACME Corp"
  }'
```

### React Component Integration Testing

```typescript
// __tests__/api.test.ts
import { addComment, fetchNotifications, updateUserProfile } from '@/lib/api';

describe('API Integration', () => {
  it('should add a comment', async () => {
    const result = await addComment(
      'version-1',
      'project-1',
      'Test comment'
    );

    expect(result).toHaveProperty('id');
    expect(result.content).toBe('Test comment');
  });

  it('should fetch notifications', async () => {
    const result = await fetchNotifications('user-1', 'unread');

    expect(Array.isArray(result.notifications)).toBe(true);
    expect(typeof result.unreadCount).toBe('number');
  });

  it('should update user profile', async () => {
    const result = await updateUserProfile('user-1', {
      fullName: 'Jane Doe',
      company: 'XYZ Corp',
    });

    expect(result.full_name).toBe('Jane Doe');
    expect(result.company_name).toBe('XYZ Corp');
  });
});
```

---

## Rate Limiting

Implement rate limiting for sensitive endpoints:

```typescript
// middleware/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return (req: NextRequest) => {
    const clientId = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    const record = rateLimitMap.get(clientId);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
      return NextResponse.next();
    }

    if (record.count >= maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    record.count++;
    return NextResponse.next();
  };
}
```

---

## Summary

This guide provides complete API integration examples for all enhanced features. All examples use Supabase as the backend database and storage solution. Adapt the code as needed for your specific authentication and database setup.
