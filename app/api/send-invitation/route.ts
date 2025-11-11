import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

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
    const { email, projectName, message, designerName, projectId, designerId, invitedName } = body;

    // Validate required fields
    if (!email || !projectName || !projectId) {
      return NextResponse.json(
        { error: 'Email, project name, and project ID are required' },
        { status: 400 }
      );
    }

    if (!designerId) {
      return NextResponse.json(
        { error: 'Designer ID is required. Please sign in and try again.' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Ensure designer has a profile (create if missing)
    if (designerId) {
      const { data: profile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', designerId)
        .single();

      if (profileCheckError || !profile) {
        // Get user data from auth
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(designerId);

        if (!userError && user) {
          // Create missing profile
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email,
              role: 'designer'
            }]);

          if (createProfileError) {
            console.error('Error creating profile:', createProfileError);
            return NextResponse.json(
              { error: 'Failed to create designer profile. Please contact support.' },
              { status: 500 }
            );
          }
        }
      }
    }

    // Generate unique token for the invitation
    const token = randomUUID();

    console.log('[send-invitation] Creating invite with token:', token);

    // Set expiration to 30 days from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Create invite record in database
    const { data: inviteRecord, error: inviteError } = await supabase
      .from('invites')
      .insert([
        {
          project_id: projectId,
          designer_id: designerId,
          invited_email: email,
          invited_name: invitedName || email,
          token: token,
          expires_at: expiresAt,
          status: 'pending',
        },
      ])
      .select();

    console.log('[send-invitation] Invite creation result:', { inviteRecord, error: inviteError });

    if (inviteError) {
      console.error('Error creating invite record:', inviteError);
      return NextResponse.json(
        { error: `Failed to create invitation: ${inviteError.message}` },
        { status: 500 }
      );
    }

    // Check if Resend API key is configured
    if (!resend) {
      console.warn('Resend API key not configured. Email invitation feature requires RESEND_API_KEY.');
      // For development, return success with a warning (email not actually sent)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV MODE] Would send invitation email to: ${email} for project: ${projectName}`);
        console.log(`[DEV MODE] Invitation token: ${token}`);
        return NextResponse.json(
          {
            success: true,
            message: 'Invitation created (email not sent - dev mode)',
            warning: 'Resend API key not configured. To send real emails, add RESEND_API_KEY to .env.local',
            token: token,
            inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${token}`,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' },
          { status: 500 }
        );
      }
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${token}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
      .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
      .footer { font-size: 12px; color: #999; margin-top: 20px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Project Invitation</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>You have been invited to collaborate on the design project <strong>${projectName}</strong>${designerName ? ` by ${designerName}` : ''}.</p>

        ${message ? `<p><strong>Message from designer:</strong></p><p>${message}</p>` : ''}

        <p>Click the button below to accept the invitation and access the project:</p>

        <a href="${inviteLink}" class="button">Accept Invitation</a>

        <p>This invitation will expire in 30 days. If you have any questions, feel free to reach out to your designer.</p>

        <p>Best regards,<br/>Design Studio Team</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Design Studio. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
    `;

    // Send email using Resend
    const result = await resend.emails.send({
      from: 'noreply@elvenwood.in',
      to: email,
      subject: `You're invited to collaborate on ${projectName}`,
      html: htmlContent,
    });

    if (result.error) {
      console.error('Resend error:', result.error);

      // Check for common Resend testing mode error
      if (result.error.message?.includes('only send testing emails to your own email address')) {
        return NextResponse.json(
          {
            success: true,
            message: 'Invitation created successfully',
            warning: `Resend is in testing mode. Email only sent to verified addresses. Invitation link: ${inviteLink}`,
            token: token,
            inviteLink: inviteLink,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: result.error.message || 'Failed to send invitation email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Invitation sent successfully',
        token: token,
        inviteLink: inviteLink,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
