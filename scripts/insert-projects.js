// Script to insert real projects into Supabase
// Usage: node scripts/insert-projects.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const clientEmail = 'jonathanboda193@gmail.com';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertProjects() {
  try {
    console.log('🔍 Finding designer in database...');

    // First, get a designer from the database (or create one for testing)
    const { data: designers, error: designerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'designer')
      .limit(1);

    if (designerError) {
      console.error('❌ Error fetching designers:', designerError);
      process.exit(1);
    }

    let designerId;
    if (designers && designers.length > 0) {
      designerId = designers[0].id;
      console.log(`✅ Found designer: ${designers[0].full_name || designers[0].email}`);
    } else {
      console.log('⚠️  No designer found. You need to create a designer account first.');
      console.log('Please sign up as a designer in the app before running this script.');
      process.exit(1);
    }

    // Real projects to insert
    const realProjects = [
      {
        designer_id: designerId,
        project_name: 'Modern Living Room Redesign',
        description: 'Complete redesign of modern living room with contemporary furniture and lighting. Includes detailed floor plans, material selections, and 3D visualizations.',
        client_email: clientEmail,
        status: 'in_progress',
      },
      {
        designer_id: designerId,
        project_name: 'Kitchen Renovation Project',
        description: 'Modern kitchen with smart appliances and updated cabinetry. Features include custom islands, granite countertops, and ambient lighting design.',
        client_email: clientEmail,
        status: 'in_progress',
      },
      {
        designer_id: designerId,
        project_name: 'Bedroom Makeover',
        description: 'Luxurious bedroom redesign with accent walls, custom bedding, and built-in storage solutions. Focuses on comfort and aesthetic appeal.',
        client_email: clientEmail,
        status: 'review',
      },
      {
        designer_id: designerId,
        project_name: 'Home Office Setup',
        description: 'Professional home office design with ergonomic furniture, optimal lighting for video calls, and organized storage for productivity.',
        client_email: clientEmail,
        status: 'in_progress',
      },
    ];

    console.log(`\n📝 Inserting ${realProjects.length} projects for ${clientEmail}...`);

    // Insert projects
    const { data, error } = await supabase
      .from('projects')
      .insert(realProjects)
      .select();

    if (error) {
      if (error.message.includes('duplicate')) {
        console.log('⚠️  Some projects already exist. Fetching existing projects...');

        // Fetch existing projects instead
        const { data: existingProjects, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('client_email', clientEmail);

        if (fetchError) {
          console.error('❌ Error fetching projects:', fetchError);
          process.exit(1);
        }

        console.log(`✅ Found ${existingProjects.length} existing projects for ${clientEmail}:`);
        existingProjects.forEach((project, index) => {
          console.log(`  ${index + 1}. ${project.project_name} (${project.status})`);
        });
      } else {
        console.error('❌ Error inserting projects:', error);
        process.exit(1);
      }
    } else {
      console.log(`✅ Successfully inserted ${data.length} projects!`);
      data.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.project_name} (ID: ${project.id})`);
        console.log(`     Status: ${project.status}`);
        console.log(`     Client: ${project.client_email}`);
      });
    }

    console.log('\n🎉 Done! Projects are now available in the client portal.');
    console.log(`   Client can log in with: ${clientEmail}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

insertProjects();
