// API endpoint to seed test projects
// Call with: POST /api/admin/seed-projects
// Body: { clientEmail: "jonathanboda193@gmail.com" }

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: NextRequest) {
  try {
    const { clientEmail } = await request.json();

    if (!clientEmail) {
      return NextResponse.json(
        { error: 'clientEmail is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Step 1: Check if there's a designer in the system
    const { data: designers, error: designerError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('role', 'designer')
      .limit(1);

    if (designerError) {
      return NextResponse.json(
        { error: `Failed to fetch designers: ${designerError.message}` },
        { status: 500 }
      );
    }

    if (!designers || designers.length === 0) {
      return NextResponse.json(
        {
          error: 'No designer found in the system',
          message: 'Please create a designer account first by signing up as a designer in the app',
        },
        { status: 400 }
      );
    }

    const designerId = designers[0].id;
    console.log(`✅ Found designer: ${designers[0].full_name || designers[0].email}`);

    // Step 2: Create sample projects
    const sampleProjects = [
      {
        designer_id: designerId,
        project_name: 'Modern Living Room Redesign',
        description:
          'Complete redesign of modern living room with contemporary furniture and lighting. Includes detailed floor plans, material selections, and 3D visualizations.',
        client_email: clientEmail,
        status: 'in_progress',
      },
      {
        designer_id: designerId,
        project_name: 'Kitchen Renovation Project',
        description:
          'Modern kitchen with smart appliances and updated cabinetry. Features include custom islands, granite countertops, and ambient lighting design.',
        client_email: clientEmail,
        status: 'in_progress',
      },
      {
        designer_id: designerId,
        project_name: 'Bedroom Makeover',
        description:
          'Luxurious bedroom redesign with accent walls, custom bedding, and built-in storage solutions. Focuses on comfort and aesthetic appeal.',
        client_email: clientEmail,
        status: 'review',
      },
      {
        designer_id: designerId,
        project_name: 'Home Office Setup',
        description:
          'Professional home office design with ergonomic furniture, optimal lighting for video calls, and organized storage for productivity.',
        client_email: clientEmail,
        status: 'in_progress',
      },
    ];

    // Step 3: Insert projects
    const { data: insertedProjects, error: insertError } = await supabase
      .from('projects')
      .insert(sampleProjects)
      .select('id, project_name, status, client_email');

    if (insertError) {
      if (insertError.message.includes('duplicate')) {
        // Projects might already exist, fetch them instead
        const { data: existingProjects, error: fetchError } = await supabase
          .from('projects')
          .select('id, project_name, status, client_email')
          .eq('client_email', clientEmail)
          .order('created_at', { ascending: false });

        if (fetchError) {
          return NextResponse.json(
            { error: `Failed to fetch existing projects: ${fetchError.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            message: 'Projects already exist for this client',
            count: existingProjects?.length || 0,
            projects: existingProjects || [],
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: `Failed to insert projects: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Projects seeded successfully',
        count: insertedProjects?.length || 0,
        projects: insertedProjects || [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error seeding projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
