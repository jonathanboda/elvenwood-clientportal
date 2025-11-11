import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const fileName = searchParams.get('name');

    if (!filePath || !fileName) {
      return NextResponse.json(
        { error: 'Missing path or name parameter' },
        { status: 400 }
      );
    }

    console.log('[download] Downloading file:', { filePath, fileName });

    const supabase = createSupabaseAdminClient();

    // Download file from Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('design files')
      .download(filePath);

    if (error) {
      console.error('[download] Error downloading from storage:', error);
      return NextResponse.json(
        { error: `Failed to download file: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Get the file extension to determine content type
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
    };
    const contentType = contentTypeMap[ext || ''] || 'application/octet-stream';

    // Convert blob to array buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}
