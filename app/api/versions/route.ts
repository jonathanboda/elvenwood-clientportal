import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create a Supabase client using anon key (RLS should now be disabled)
function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createSupabaseClient(supabaseUrl, anonKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('versions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await request.json();

    const {
      project_id,
      version_number,
      file_name,
      file_path,
      changelog,
      uploaded_by,
      status,
    } = body;

    // Validation
    if (!project_id || !version_number || !file_name) {
      return NextResponse.json(
        { error: 'project_id, version_number, and file_name are required' },
        { status: 400 }
      );
    }

    // Build insert data - only include uploaded_by if provided
    const insertData: any = {
      project_id,
      version_number,
      file_name,
      file_path: file_path || file_name,
      changelog,
      status: status || 'draft',
      created_at: new Date().toISOString(),
    };

    // Only add uploaded_by if provided (it expects a UUID)
    if (uploaded_by) {
      insertData.uploaded_by = uploaded_by;
    }

    const { data, error } = await supabase
      .from('versions')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}
