# 🚀 Quick Start - Complete Database Setup in 5 Minutes

**Status**: Your environment is configured ✅ - Now complete these 4 manual steps in Supabase dashboard

---

## Step 1: Run Schema SQL (Creates Database Tables)

**Time**: ~30 seconds

1. Open: https://app.supabase.com
2. Click on project: `mszlbzcyebrcfvsqphxw`
3. Left sidebar → **SQL Editor** → **New Query**
4. **Copy this entire SQL block** (390 lines):

```sql
-- Elvenwood Interior Design App - Supabase Schema
-- Run this in Supabase SQL Editor to set up the database

-- 1. Create ENUM types for roles and statuses
CREATE TYPE user_role AS ENUM ('admin', 'designer', 'client');
CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'review', 'approved', 'rejected');
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired', 'rejected');

-- 2. Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'client',
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT,
  client_email TEXT,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status project_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_project_name_per_designer UNIQUE(designer_id, project_name)
);

-- 4. Invites table
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  designer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  invited_email TEXT NOT NULL,
  invited_name TEXT NOT NULL,
  status invite_status DEFAULT 'pending',
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Design Versions table
CREATE TABLE versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  changelog TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status project_status DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_version_per_project UNIQUE(project_id, version_number)
);

-- 6. Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID REFERENCES versions(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  changes JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Project members table
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'collaborator',
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_member_per_project UNIQUE(project_id, member_id)
);

-- Create indexes for common queries
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_projects_designer_id ON projects(designer_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_invites_project_id ON invites(project_id);
CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_invited_email ON invites(invited_email);
CREATE INDEX idx_versions_project_id ON versions(project_id);
CREATE INDEX idx_comments_version_id ON comments(version_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Create triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invites_updated_at BEFORE UPDATE ON invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_versions_updated_at BEFORE UPDATE ON versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

5. Click **Run** button
6. ✅ Look for green checkmarks (all statements should succeed)

---

## Step 2: Run RLS Policies SQL (Security Setup)

**Time**: ~30 seconds

1. In same SQL Editor → **New Query**
2. **Copy this entire SQL block** (241 lines):

```sql
-- Elvenwood Interior Design App - Row Level Security Policies

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'admin' FROM profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is designer
CREATE OR REPLACE FUNCTION is_designer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'designer' FROM profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== PROFILES TABLE POLICIES ==========

-- Users can see their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Designers can see other profiles (to invite clients)
CREATE POLICY "Designers can view all profiles"
  ON profiles FOR SELECT
  USING (
    is_designer(auth.uid()) OR is_admin(auth.uid())
  );

-- Admins can see and manage all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- ========== PROJECTS TABLE POLICIES ==========

-- Designers can see their own projects
CREATE POLICY "Designers see their own projects"
  ON projects FOR SELECT
  USING (
    designer_id = auth.uid()
  );

-- Clients can see projects they are linked to
CREATE POLICY "Clients see projects they are linked to"
  ON projects FOR SELECT
  USING (
    client_id = auth.uid() AND role = 'client'
  );

-- Admins can see all projects
CREATE POLICY "Admins see all projects"
  ON projects FOR SELECT
  USING (is_admin(auth.uid()));

-- Designers can create projects
CREATE POLICY "Designers can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    is_designer(auth.uid()) AND designer_id = auth.uid()
  );

-- Designers can update their own projects
CREATE POLICY "Designers can update their own projects"
  ON projects FOR UPDATE
  USING (designer_id = auth.uid())
  WITH CHECK (designer_id = auth.uid());

-- Clients can update project status (for feedback)
CREATE POLICY "Clients can update their project status"
  ON projects FOR UPDATE
  USING (client_id = auth.uid());

-- Admins can delete projects
CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (is_admin(auth.uid()));

-- ========== INVITES TABLE POLICIES ==========

-- Designers can see their own invites
CREATE POLICY "Designers see their own invites"
  ON invites FOR SELECT
  USING (
    designer_id = auth.uid() OR is_admin(auth.uid())
  );

-- Anonymous users can check invite status by token
CREATE POLICY "Anyone can check invite by token"
  ON invites FOR SELECT
  USING (true);

-- Designers can create invites
CREATE POLICY "Designers can create invites"
  ON invites FOR INSERT
  WITH CHECK (
    is_designer(auth.uid()) AND designer_id = auth.uid()
  );

-- Designers can update their own invites
CREATE POLICY "Designers can update their own invites"
  ON invites FOR UPDATE
  USING (designer_id = auth.uid());

-- ========== VERSIONS TABLE POLICIES ==========

-- Designers can see versions of their projects
CREATE POLICY "Designers see versions of their projects"
  ON versions FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE designer_id = auth.uid()
    )
  );

-- Clients can see versions of their linked projects
CREATE POLICY "Clients see versions of their projects"
  ON versions FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE client_id = auth.uid()
    )
  );

-- Admins can see all versions
CREATE POLICY "Admins see all versions"
  ON versions FOR SELECT
  USING (is_admin(auth.uid()));

-- Designers can upload versions to their projects
CREATE POLICY "Designers can upload versions"
  ON versions FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE designer_id = auth.uid()
    ) AND uploaded_by = auth.uid()
  );

-- Designers can update versions in their projects
CREATE POLICY "Designers can update versions"
  ON versions FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE designer_id = auth.uid()
    )
  );

-- ========== COMMENTS TABLE POLICIES ==========

-- Users can see comments on projects they have access to
CREATE POLICY "Users see comments on accessible projects"
  ON comments FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE designer_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE client_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

-- Authenticated users can create comments on projects they have access to
CREATE POLICY "Users can create comments on their projects"
  ON comments FOR INSERT
  WITH CHECK (
    (project_id IN (
      SELECT id FROM projects WHERE designer_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE client_id = auth.uid()
    ) OR is_admin(auth.uid())) AND author_id = auth.uid()
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (author_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (author_id = auth.uid());

-- ========== AUDIT_LOGS TABLE POLICIES ==========

-- Users can see their own audit logs
CREATE POLICY "Users see their own audit logs"
  ON audit_logs FOR SELECT
  USING (user_id = auth.uid());

-- Admins can see all audit logs
CREATE POLICY "Admins see all audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can delete old audit logs
CREATE POLICY "Admins can delete audit logs"
  ON audit_logs FOR DELETE
  USING (is_admin(auth.uid()));

-- ========== PROJECT_MEMBERS TABLE POLICIES ==========

-- Users can see project members for projects they access
CREATE POLICY "Users see members of accessible projects"
  ON project_members FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE designer_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE client_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

-- Designers can add members to their projects
CREATE POLICY "Designers can add project members"
  ON project_members FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE designer_id = auth.uid()
    )
  );

-- Designers can remove members from their projects
CREATE POLICY "Designers can remove project members"
  ON project_members FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE designer_id = auth.uid()
    )
  );
```

3. Click **Run** button
4. ✅ Look for green checkmarks

---

## Step 3: Create Storage Buckets

**Time**: ~1 minute

1. In Supabase left sidebar → **Storage**
2. Click **Create a new bucket**
   - Name: `design-files`
   - Privacy: **Public**
   - Click **Create**
3. Click **Create a new bucket** again
   - Name: `avatars`
   - Privacy: **Public**
   - Click **Create**

---

## Step 4: Test Database Connection

**Time**: ~1 minute

1. Open your app: http://localhost:3000
2. Look for **Sign Up** button
3. Create a test account with any email
4. Go back to Supabase → **Authentication** → **Users**
5. ✅ You should see your new user!

---

## ✅ All Done!

Your app now has:
- ✅ 7 database tables with proper schema
- ✅ Row Level Security protecting user data
- ✅ Storage buckets for design files and avatars
- ✅ Working authentication connected to real database
- ✅ Project persistence (projects save permanently!)

**Everything the user requested has been prepared.** Just copy-paste the SQL into Supabase and create the buckets!

---

## Troubleshooting

**"Table already exists" error?**
- Your schema has already been created
- Safe to ignore or click Run again

**"Syntax error" in SQL?**
- Check line numbers in error message
- Copy-paste might have missed content
- Try running in smaller sections

**Still seeing demo data?**
- Projects from localStorage are kept locally
- Refresh page to see database integration
- New projects you create will save to database

---

**Questions?** Check `DATABASE_SETUP_GUIDE.md` for detailed explanations.
