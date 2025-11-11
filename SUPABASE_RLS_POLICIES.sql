-- Elvenwood Interior Design App - Row Level Security Policies
-- Run this in Supabase SQL Editor after running SUPABASE_SCHEMA.sql

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

-- Designers can delete their own projects
CREATE POLICY "Designers can delete their own projects"
  ON projects FOR DELETE
  USING (designer_id = auth.uid());

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

-- Anonymous users can check invite status by token (for accept invite flow)
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
