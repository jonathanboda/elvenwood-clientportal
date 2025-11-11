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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    console.log('[check-invite] Checking token:', token);

    // Check if invite exists and is valid
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('id, project_id, invited_email, invited_name, status, expires_at, projects(project_name, designer_id)')
      .eq('token', token)
      .single();

    console.log('[check-invite] Query result:', { invite, error: inviteError });

    if (inviteError || !invite) {
      console.error('[check-invite] Invite not found. Error:', inviteError);
      return NextResponse.json(
        { error: 'Invite not found', details: inviteError?.message },
        { status: 404 }
      );
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: `This invite has already been ${invite.status}` },
        { status: 400 }
      );
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        invite: {
          id: invite.id,
          project_id: invite.project_id,
          invited_email: invite.invited_email,
          invited_name: invite.invited_name,
          project_name: invite.projects?.project_name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking invitation:', error);
    return NextResponse.json(
      { error: 'Failed to check invitation' },
      { status: 500 }
    );
  }
}
