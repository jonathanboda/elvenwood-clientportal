-- Migration: Add Real-time Features Tables
-- Description: Creates tables and indexes for activity feed, notifications, and enhanced features
-- Created: 2024-11-08

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ACTIVITIES TABLE
-- ============================================================================
-- Tracks all activities in the system for the activity feed
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'version_uploaded', 'comment_added', 'design_accepted'
  version_id UUID REFERENCES versions(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for activity feed queries
CREATE INDEX idx_activities_project_id ON activities(project_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_project_created ON activities(project_id, created_at DESC);
CREATE INDEX idx_activities_type ON activities(type);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
-- Stores all notifications for users
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'version_uploaded', 'comment_added', 'design_accepted'
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  version_id UUID REFERENCES versions(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for notification queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================================================
-- ENHANCE EXISTING COMMENTS TABLE
-- ============================================================================
-- Add missing fields to comments table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE comments ADD COLUMN attachment_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'attachment_type'
  ) THEN
    ALTER TABLE comments ADD COLUMN attachment_type VARCHAR(20); -- 'image', 'file'
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'parent_comment_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- ENHANCE VERSIONS TABLE
-- ============================================================================
-- Add missing fields if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'versions' AND column_name = 'is_accepted'
  ) THEN
    ALTER TABLE versions ADD COLUMN is_accepted BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'versions' AND column_name = 'file_name'
  ) THEN
    ALTER TABLE versions ADD COLUMN file_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'versions' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE versions ADD COLUMN file_size INTEGER;
  END IF;
END $$;

-- ============================================================================
-- ACTIVITY FEED VIEW
-- ============================================================================
-- View for easy activity feed querying (client's projects)
CREATE OR REPLACE VIEW activity_feed_view AS
SELECT
  a.id,
  a.project_id,
  a.type,
  p.full_name as user_name,
  pr.avatar_url as user_avatar,
  proj.project_name,
  v.version_number,
  v.file_path as design_thumbnail,
  c.content as comment_text,
  a.description,
  a.created_at,
  p.id as user_id
FROM activities a
LEFT JOIN profiles p ON a.user_id = p.id
LEFT JOIN versions v ON a.version_id = v.id
LEFT JOIN comments c ON a.comment_id = c.id
LEFT JOIN projects proj ON a.project_id = proj.id
LEFT JOIN profiles pr ON a.user_id = pr.id
ORDER BY a.created_at DESC;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to create notification on version upload
CREATE OR REPLACE FUNCTION notify_on_version_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for project client
  INSERT INTO notifications (
    user_id,
    type,
    project_id,
    version_id,
    content,
    created_at
  )
  SELECT
    p.client_id,
    'version_uploaded',
    NEW.project_id,
    NEW.id,
    'Designer uploaded a new design version',
    NOW()
  FROM projects p
  WHERE p.id = NEW.project_id AND p.client_id IS NOT NULL;

  -- Create activity feed entry
  INSERT INTO activities (
    project_id,
    user_id,
    type,
    version_id,
    created_at
  )
  SELECT
    NEW.project_id,
    NEW.uploaded_by,
    'version_uploaded',
    NEW.id,
    NOW()
  FROM projects p
  WHERE p.id = NEW.project_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for version uploads
DROP TRIGGER IF EXISTS version_upload_notification ON versions;
CREATE TRIGGER version_upload_notification
AFTER INSERT ON versions
FOR EACH ROW
EXECUTE FUNCTION notify_on_version_upload();

-- ============================================================================
-- Function to create notification on comment
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for version creator
  INSERT INTO notifications (
    user_id,
    type,
    project_id,
    comment_id,
    content,
    created_at
  )
  SELECT
    v.uploaded_by,
    'comment_added',
    NEW.project_id,
    NEW.id,
    'Comment added to your design',
    NOW()
  FROM versions v
  WHERE v.id = NEW.version_id AND v.uploaded_by != NEW.author_id;

  -- Create activity feed entry
  INSERT INTO activities (
    project_id,
    user_id,
    type,
    comment_id,
    created_at
  )
  VALUES (
    NEW.project_id,
    NEW.author_id,
    'comment_added',
    NEW.id,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments
DROP TRIGGER IF EXISTS comment_notification ON comments;
CREATE TRIGGER comment_notification
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION notify_on_comment();

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure to get activity feed for a client
CREATE OR REPLACE FUNCTION get_activity_feed(
  p_client_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  activity_id UUID,
  project_id UUID,
  project_name TEXT,
  activity_type VARCHAR,
  user_name TEXT,
  user_avatar TEXT,
  content TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.project_id,
    proj.project_name,
    a.type,
    p.full_name,
    p.avatar_url,
    COALESCE(c.content, v.changelog, a.description),
    a.created_at
  FROM activities a
  LEFT JOIN profiles p ON a.user_id = p.id
  LEFT JOIN projects proj ON a.project_id = proj.id
  LEFT JOIN versions v ON a.version_id = v.id
  LEFT JOIN comments c ON a.comment_id = c.id
  WHERE proj.client_id = p_client_id
  ORDER BY a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Procedure to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count
  FROM notifications
  WHERE user_id = p_user_id AND is_read = FALSE;
  RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Procedure to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_as_read(p_user_id UUID, p_notification_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id
    AND is_read = FALSE
    AND (p_notification_id IS NULL OR id = p_notification_id);

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on activities table
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Clients can see activities for their projects
CREATE POLICY activities_select_own_projects ON activities
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE client_id = auth.uid() OR designer_id = auth.uid()
    )
  );

-- Designers can create activities for their projects
CREATE POLICY activities_insert_own_projects ON activities
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    project_id IN (
      SELECT id FROM projects WHERE designer_id = auth.uid()
    )
  );

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY notifications_insert_system ON notifications
  FOR INSERT
  WITH CHECK (TRUE);

-- Users can update their own notifications
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC)
WHERE is_read = FALSE;

CREATE INDEX idx_activities_project_user ON activities(project_id, user_id);

CREATE INDEX idx_comments_version_created ON comments(version_id, created_at DESC)
WHERE parent_comment_id IS NULL;

CREATE INDEX idx_versions_project_accepted ON versions(project_id, is_accepted, created_at DESC);

-- ============================================================================
-- MIGRATION STATUS
-- ============================================================================

-- Create migrations table to track applied migrations
CREATE TABLE IF NOT EXISTS migrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW()
);

-- Record this migration
INSERT INTO migrations (name) VALUES ('add_realtime_features') ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
/*
This migration adds the following capabilities:

1. ACTIVITIES TABLE
   - Tracks all activities (uploads, comments, acceptances)
   - Indexes for efficient activity feed queries
   - Links to versions and comments

2. NOTIFICATIONS TABLE
   - Stores user notifications
   - Tracks read/unread status
   - Supports filtering and sorting

3. ENHANCED TABLES
   - Comments: Added attachment support and threading
   - Versions: Added acceptance status and file metadata

4. VIEWS & FUNCTIONS
   - Activity feed view for easy querying
   - Stored procedures for common operations
   - Automatic notification creation via triggers

5. SECURITY
   - RLS policies for multi-tenant access control
   - Role-based access to activities and notifications

6. PERFORMANCE
   - Strategic indexes on frequently queried columns
   - Composite indexes for common query patterns
   - Partitioning ready (can be added later for scale)

To apply this migration:
1. Run all SQL statements in order
2. Test notifications and activity feed
3. Verify indexes are being used (EXPLAIN ANALYZE)
4. Monitor performance under load
*/
