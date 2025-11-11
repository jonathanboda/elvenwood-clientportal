import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Get the authorization header to verify the user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Get user from access token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid session' },
        { status: 401 }
      );
    }

    // Find the invite by token
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*, projects(project_name, designer_id)')
      .eq('token', token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    // Check if invite is still valid
    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: `Invite has already been ${invite.status}` },
        { status: 400 }
      );
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invite has expired' },
        { status: 400 }
      );
    }

    // Ensure user has a profile (create if missing)
    const { data: profile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileCheckError || !profile) {
      // Create missing profile with client role
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email,
          role: 'client'
        }]);

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }
    } else {
      // Update existing profile to client role if needed
      const { error: updateRoleError } = await supabase
        .from('profiles')
        .update({ role: 'client' })
        .eq('id', user.id);

      if (updateRoleError) {
        console.error('Error updating profile role:', updateRoleError);
      }
    }

    // Update the invite status to accepted
    const { error: updateInviteError } = await supabase
      .from('invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('token', token);

    if (updateInviteError) {
      console.error('Error updating invite:', updateInviteError);
      return NextResponse.json(
        { error: 'Failed to accept invite' },
        { status: 500 }
      );
    }

    // Update the project's client_id if not already set
    if (invite.projects) {
      const { error: updateProjectError } = await supabase
        .from('projects')
        .update({ client_id: user.id })
        .eq('id', invite.project_id)
        .is('client_id', null);

      if (updateProjectError) {
        console.error('Error updating project client:', updateProjectError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Invitation accepted successfully',
        project_id: invite.project_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
