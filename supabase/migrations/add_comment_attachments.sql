-- Add attachment columns to comments table
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN comments.attachment_url IS 'URL to the file stored in Supabase Storage';
COMMENT ON COLUMN comments.attachment_name IS 'Original filename of the attachment';
