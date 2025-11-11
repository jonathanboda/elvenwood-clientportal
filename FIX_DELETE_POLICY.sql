-- Add policy for designers to delete their own projects
-- Run this in Supabase SQL Editor

CREATE POLICY "Designers can delete their own projects"
  ON projects FOR DELETE
  USING (designer_id = auth.uid());
