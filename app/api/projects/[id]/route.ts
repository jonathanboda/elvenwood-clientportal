import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function createSupabaseClient_() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createSupabaseClient(supabaseUrl, anonKey);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient_();

    // First, verify the project exists
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id, designer_id, project_name')
      .eq('id', projectId)
      .single();

    if (fetchError) {
      console.error('Error fetching project for deletion:', fetchError);
      return NextResponse.json(
        { error: `Project not found: ${fetchError.message}` },
        { status: 404 }
      );
    }

    if (!project) {
      console.error('Project not found in database:', projectId);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete the project (this will cascade delete versions, comments, etc due to FK constraints)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return NextResponse.json(
        { error: `Failed to delete project: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Project deleted successfully',
        projectId: projectId,
        projectName: project.project_name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient_();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
