import { NextRequest, NextResponse } from "next/server";

// Mock data for development
const mockVersions = {
  "design-1": {
    id: "design-1",
    name: "Modern Living Room Redesign",
    version: "v3.0",
    description: "Contemporary living room design with modern furniture and lighting",
    fileUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop",
    fileType: "image",
    createdAt: "2024-11-08",
    projectId: "project-1",
    clientId: "client-1",
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // In production, fetch from Supabase:
    // const { data, error } = await supabase
    //   .from('versions')
    //   .select('*')
    //   .eq('id', id)
    //   .single();

    const version = mockVersions[id as keyof typeof mockVersions];

    if (!version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: version });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch version" },
      { status: 500 }
    );
  }
}

/**
 * Database schema for versions table:
 *
 * CREATE TABLE versions (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   project_id UUID NOT NULL REFERENCES projects(id),
 *   version_number INT NOT NULL,
 *   file_url TEXT NOT NULL,
 *   file_type VARCHAR(50) DEFAULT 'image',
 *   name VARCHAR(255),
 *   description TEXT,
 *   is_accepted BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW(),
 *   created_by UUID NOT NULL REFERENCES profiles(id),
 *   UNIQUE(project_id, version_number)
 * );
 *
 * CREATE INDEX idx_versions_project_id ON versions(project_id);
 * CREATE INDEX idx_versions_created_at ON versions(created_at DESC);
 */
