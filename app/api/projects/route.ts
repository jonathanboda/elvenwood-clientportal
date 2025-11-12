import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, getAuthUser } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // Using optimized server client with connection pooling
    const { data, error } = await supabaseServer
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Using optimized auth helper
    const { user, error: authError } = await getAuthUser(request);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    // Ensure user has a profile (create if missing)
    const { data: profile, error: profileCheckError } = await supabaseServer
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileCheckError || !profile) {
      // Create missing profile
      const { error: createProfileError } = await supabaseServer
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email,
          role: 'designer'
        }]);

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        return NextResponse.json(
          { error: 'Failed to create user profile. Please try again.' },
          { status: 500 }
        );
      }
    }

    const body = await request.json();

    const {
      project_name,
      description,
      client_email,
      start_date,
      end_date,
      status,
    } = body;

    // Validation
    if (!project_name || !client_email) {
      return NextResponse.json(
        { error: 'Project name and client email are required' },
        { status: 400 }
      );
    }

    // Create the insert data object with authenticated user as designer
    const insertData: any = {
      project_name,
      description,
      client_email,
      status: status || 'draft',
      designer_id: user.id,
    };

    // Note: start_date and end_date columns don't exist in the actual database schema
    // Only include date fields if the API explicitly supports them

    // Using optimized server client with connection pooling
    const { data, error } = await supabaseServer
      .from('projects')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
