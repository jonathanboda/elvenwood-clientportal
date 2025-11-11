import { NextRequest, NextResponse } from "next/server";

// Mock comments data for development
const mockComments = {
  "design-1": [
    {
      id: "comment-3",
      versionId: "design-1",
      authorId: "user-1",
      authorName: "Sarah Johnson",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      content:
        "Love the color scheme! The accent wall really brings out the space. Just wondering about the sofa size - can we make it a bit smaller?",
      attachments: [
        {
          id: "attachment-1",
          url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop",
          fileName: "reference.jpg",
          fileSize: 245000,
          fileType: "image/jpeg",
        },
      ],
      createdAt: "2024-11-07T14:30:00Z",
      canEdit: true,
      canDelete: true,
      replies: [
        {
          id: "comment-4",
          authorId: "designer-1",
          authorName: "Emma Williams (Designer)",
          authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
          content:
            "Great suggestion! I can adjust the sofa to a 2-seater configuration. Will show you in the next version.",
          attachments: [],
          createdAt: "2024-11-07T15:45:00Z",
          canEdit: false,
          canDelete: false,
        },
      ],
    },
    {
      id: "comment-2",
      versionId: "design-1",
      authorId: "user-2",
      authorName: "Michael Chen",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      content: "The lighting setup looks perfect! This will really enhance the ambiance of the room.",
      attachments: [],
      createdAt: "2024-11-06T10:15:00Z",
      canEdit: true,
      canDelete: true,
      resolved: true,
    },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // In production, fetch from Supabase:
    // const { data, error } = await supabase
    //   .from('comments')
    //   .select('*, attachments(*)')
    //   .eq('version_id', id)
    //   .order('created_at', { ascending: false });

    const comments = mockComments[id as keyof typeof mockComments] || [];

    return NextResponse.json({ data: comments });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { content, attachments, authorId, authorName } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Validate attachments size
    if (attachments && Array.isArray(attachments)) {
      for (const attachment of attachments) {
        if (attachment.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "File size must be less than 10MB" },
            { status: 400 }
          );
        }
      }
    }

    // In production:
    // 1. Upload files to Supabase storage: supabase.storage.from('designs').upload(...)
    // 2. Get signed URLs for the uploaded files
    // 3. Insert comment record with attachment URLs
    // 4. Trigger real-time update via Supabase Realtime
    // 5. Send notification to designer

    const newComment = {
      id: `comment-${Date.now()}`,
      versionId: id,
      authorId: authorId || "user-unknown",
      authorName: authorName || "Anonymous",
      content,
      attachments: attachments || [],
      createdAt: new Date().toISOString(),
      canEdit: true,
      canDelete: true,
    };

    return NextResponse.json({ data: newComment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

/**
 * Database schema for comments table with attachments:
 *
 * CREATE TABLE comments (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   version_id UUID NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
 *   author_id UUID NOT NULL REFERENCES profiles(id),
 *   content TEXT NOT NULL,
 *   parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
 *   is_resolved BOOLEAN DEFAULT FALSE,
 *   resolved_by UUID REFERENCES profiles(id),
 *   resolved_at TIMESTAMP,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW(),
 *   CONSTRAINT comments_content_not_empty CHECK (length(trim(content)) > 0)
 * );
 *
 * CREATE TABLE comment_attachments (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
 *   file_name VARCHAR(255) NOT NULL,
 *   file_url TEXT NOT NULL,
 *   file_size BIGINT,
 *   file_type VARCHAR(100),
 *   uploaded_at TIMESTAMP DEFAULT NOW(),
 *   storage_path VARCHAR(500) NOT NULL
 * );
 *
 * CREATE INDEX idx_comments_version_id ON comments(version_id);
 * CREATE INDEX idx_comments_author_id ON comments(author_id);
 * CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
 * CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
 * CREATE INDEX idx_comment_attachments_comment_id ON comment_attachments(comment_id);
 *
 * -- RLS Policies
 * ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE comment_attachments ENABLE ROW LEVEL SECURITY;
 *
 * -- Users can view comments on versions in their projects
 * CREATE POLICY "view_comments" ON comments
 *   FOR SELECT USING (
 *     version_id IN (
 *       SELECT v.id FROM versions v
 *       JOIN projects p ON v.project_id = p.id
 *       WHERE p.client_id = auth.uid() OR p.designer_id = auth.uid()
 *     )
 *   );
 *
 * -- Users can create comments on versions in their projects
 * CREATE POLICY "create_comments" ON comments
 *   FOR INSERT WITH CHECK (
 *     version_id IN (
 *       SELECT v.id FROM versions v
 *       JOIN projects p ON v.project_id = p.id
 *       WHERE p.client_id = auth.uid() OR p.designer_id = auth.uid()
 *     ) AND author_id = auth.uid()
 *   );
 *
 * -- Users can only update their own comments
 * CREATE POLICY "update_own_comments" ON comments
 *   FOR UPDATE USING (author_id = auth.uid())
 *   WITH CHECK (author_id = auth.uid());
 *
 * -- Users can only delete their own comments
 * CREATE POLICY "delete_own_comments" ON comments
 *   FOR DELETE USING (author_id = auth.uid());
 */
