import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * File Upload Handler
 *
 * Handles file uploads for comment attachments and design versions.
 * 1. Validates the file (type, size)
 * 2. Uploads to Supabase Storage
 * 3. Returns the file metadata and storage path
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB for design files)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 50MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "application/pdf"
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images and PDFs are allowed." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Generate storage path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = projectId
      ? `${projectId}/${timestamp}-${sanitizedFileName}`
      : `comments/${timestamp}-${sanitizedFileName}`;

    console.log('[upload] Uploading file:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      storagePath,
    });

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('design files')
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('[upload] Storage error:', error);
      return NextResponse.json(
        { error: `Failed to upload file: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('[upload] Upload successful:', data);

    return NextResponse.json(
      {
        data: {
          id: `attachment-${timestamp}`,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          storagePath: data.path,
          url: `/api/download?path=${encodeURIComponent(data.path)}&name=${encodeURIComponent(file.name)}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[upload] Error:', error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

/**
 * Supabase Storage Setup
 *
 * To use this in production:
 *
 * 1. Create a storage bucket in Supabase:
 *    - Go to Storage > New bucket
 *    - Name: "designs"
 *    - Make it private (authenticated users only)
 *
 * 2. Set up RLS policy for storage:
 *    CREATE POLICY "Users can upload to designs" ON storage.objects
 *    FOR INSERT WITH CHECK (bucket_id = 'designs');
 *
 * 3. Create a function to generate signed URLs:
 *    const { data } = await supabase
 *      .storage
 *      .from('designs')
 *      .createSignedUrl(storagePath, 3600); // 1 hour expiry
 *
 * 4. Environment variables needed:
 *    NEXT_PUBLIC_SUPABASE_URL=your_url
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
 */
