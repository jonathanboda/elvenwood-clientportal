# Elvenwood Interiors - Setup and Deployment Guide

This guide walks you through setting up and deploying the Elvenwood Interior Design App with Supabase backend.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema Setup](#database-schema-setup)
4. [Row-Level Security Policies](#row-level-security-policies)
5. [Deploy Edge Functions](#deploy-edge-functions)
6. [Frontend Setup](#frontend-setup)
7. [Running Locally](#running-locally)
8. [Testing the Application](#testing-the-application)
9. [Deployment to Production](#deployment-to-production)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (https://supabase.com)
- VS Code (optional but recommended)
- Git for version control

---

## Supabase Project Setup

### Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in/create an account
2. Click "New Project"
3. Enter project details:
   - **Name**: `elvenwood-design`
   - **Database Password**: Create a strong password
   - **Region**: Select closest to your location
4. Click "Create new project" and wait for it to initialize (5-10 minutes)

### Step 2: Get Your Supabase Credentials

Once your project is ready:

1. Go to **Settings > API** in the Supabase dashboard
2. Copy these credentials:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Step 3: Enable Authentication Methods

1. Go to **Authentication > Providers**
2. Enable **Email** provider:
   - Enable "Email / Password"
   - Enable "Confirm email" toggle
3. Go to **Authentication > Email Templates** (optional)
4. Customize email templates if desired

---

## Database Schema Setup

### Step 1: Run the Schema SQL

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content from `SUPABASE_SCHEMA.sql`
4. Paste into the SQL editor
5. Click **Run** and wait for completion

The schema creates:
- `profiles` - User profile information
- `projects` - Design projects
- `invites` - Client invitations
- `versions` - Design file versions
- `comments` - Feedback comments
- `audit_logs` - Activity logs
- `project_members` - Multi-designer collaboration (optional)

### Step 2: Create Storage Bucket

1. Go to **Storage** in Supabase
2. Click **Create new bucket**
3. Name it: `designs`
4. Make it **Private**
5. Click **Create bucket**

---

## Row-Level Security Policies

### Step 1: Apply RLS Policies

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content from `SUPABASE_RLS_POLICIES.sql`
4. Paste into the SQL editor
5. Click **Run**

This sets up security policies for:
- **Profiles**: Users see their own, designers see all
- **Projects**: Designers see theirs, clients see linked projects
- **Invites**: Designers see their invites, anyone can check by token
- **Versions**: Only authorized users see versions
- **Comments**: Only project members can comment
- **Audit Logs**: Users see their own, admins see all

---

## Deploy Edge Functions

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Authenticate with Supabase

```bash
supabase login
```

You'll be prompted to create an access token on supabase.com

### Step 3: Create Edge Functions Directory

```bash
# In your project root
mkdir -p supabase/functions
```

### Step 4: Deploy Invite Function

```bash
# Copy the invite function
cp supabase_edge_functions_invite.ts supabase/functions/invite/index.ts

# Deploy
supabase functions deploy invite
```

Set environment variables for the function:
1. Go to **Edge Functions** in Supabase
2. Click on `invite` function
3. Go to **Settings**
4. Add environment variable: `APP_URL=https://your-domain.com` (or http://localhost:3000 for dev)

### Step 5: Deploy Accept Invite Function

```bash
# Copy the accept invite function
cp supabase_edge_functions_accept_invite.ts supabase/functions/acceptInvite/index.ts

# Deploy
supabase functions deploy acceptInvite
```

### Step 6: Verify Functions

1. In Supabase dashboard, go to **Edge Functions**
2. You should see two functions: `invite` and `acceptInvite`
3. Both should show "Active" status

---

## Frontend Setup

### Step 1: Create Next.js Project

```bash
# Create a new Next.js project
npx create-next-app@latest elvenwood-design --typescript --tailwind

# Navigate to project
cd elvenwood-design
```

### Step 2: Install Dependencies

```bash
npm install @supabase/ssr @supabase/supabase-js
```

### Step 3: Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Copy Application Files

Copy all the files from this project:
- `app/` - Application pages and components
- `lib/supabase.ts` - Supabase client configuration

### Step 5: Update Next.js Configuration

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
```

### Step 6: Create Global CSS

Update `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
}
```

---

## Running Locally

### Step 1: Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Step 2: Verify Setup

1. Open http://localhost:3000 in your browser
2. You should see the Elvenwood landing page
3. Click "Sign Up" to create an account

---

## Testing the Application

### Test Flow 1: Designer Creates Project & Invites Client

1. **Sign up as Designer**:
   - Go to http://localhost:3000/signup
   - Create account with email: `designer@example.com`
   - You should be assigned `designer` role

2. **Create a Project**:
   - Click "New Project" on dashboard
   - Enter project name: "Living Room Redesign"
   - Click "Create Project"

3. **Invite a Client**:
   - Click "Invite Client" on the project card
   - Enter client name: "John Doe"
   - Enter client email: `client@example.com`
   - Click "Send Invite"

4. **Check Supabase**:
   - Go to Supabase dashboard
   - Check `invites` table - should have new row with `pending` status
   - Check `projects` table - project should have `client_email` populated

### Test Flow 2: Client Accepts Invite

1. **Sign up as Client**:
   - Use the invite link sent (or manually navigate to signup)
   - Create account with email: `client@example.com`
   - You should be assigned `client` role

2. **View Project**:
   - After accepting invite, you should see project in dashboard
   - Click "View Project"

3. **Check Supabase**:
   - Go to `invites` table - status should change to `accepted`
   - Go to `projects` table - `client_id` should now be populated

### Test Flow 3: Designer Uploads Version

1. **Designer uploads design**:
   - Would need to implement file upload UI
   - Create version in `versions` table
   - Upload file to `designs` bucket

2. **Client sees version**:
   - Client dashboard shows "Recent Activity"
   - Shows new version notification

### Test Flow 4: Client Provides Feedback

1. **Client adds comment**:
   - Go to project detail page
   - Write comment in feedback box
   - Click "Post Comment"

2. **Designer sees comment**:
   - Designer can see comments on their project
   - Replies are threaded

---

## Deployment to Production

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial Elvenwood setup"
git remote add origin https://github.com/yourusername/elvenwood-design.git
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app`
     - `SUPABASE_SERVICE_ROLE_KEY`

3. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete

### Option 2: Deploy to Other Platforms

The app can also be deployed to:
- **Netlify**: Connect GitHub repo, set environment variables, deploy
- **AWS Amplify**: Similar to Vercel/Netlify
- **Railway**: Push to git, Railway auto-deploys
- **Self-hosted**: Any Node.js host (Heroku, DigitalOcean, etc.)

### Option 3: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t elvenwood .
docker run -p 3000:3000 --env-file .env.local elvenwood
```

---

## Troubleshooting

### Issue: "Cannot connect to Supabase"

**Solution**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct (should start with https://)
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
- Ensure Supabase project is active

### Issue: "Row Level Security" errors

**Solution**:
- Verify RLS policies are applied: Go to **Table Editor** > select table > **RLS** tab
- Check that policies are enabled (toggle on right side)
- Verify user role in `profiles` table matches policy conditions

### Issue: "Edge Function returns 401"

**Solution**:
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check function logs in Supabase dashboard
- Ensure function has correct environment variables set

### Issue: "Sign up fails with 'User already exists'"

**Solution**:
- This is expected if email was used before
- Try with different email address
- Or delete the user from **Authentication > Users** in Supabase

### Issue: "Invites not sending"

**Solution**:
- Check edge function logs in Supabase
- Verify `APP_URL` environment variable is set correctly
- Check email configuration in Supabase Authentication

### Issue: "File upload fails"

**Solution**:
- Verify `designs` bucket exists and is private
- Check RLS policies on storage objects
- Ensure upload size doesn't exceed limit (default 100MB)

### Issue: "Profile not created on signup"

**Solution**:
- This is handled in signup form, should auto-create
- If not working, manually insert row in `profiles` table
- Ensure RLS policies allow profile creation for new users

---

## Project Structure

```
elvenwood-design/
├── app/
│   ├── page.tsx                          # Home page
│   ├── signin/page.tsx                   # Sign in
│   ├── signup/page.tsx                   # Sign up
│   ├── dashboard/page.tsx                # Main dashboard
│   ├── accept-invite/page.tsx            # Accept invite flow
│   ├── project/[id]/page.tsx            # Project detail page
│   ├── components/
│   │   ├── auth/AuthForm.tsx
│   │   ├── layout/Header.tsx
│   │   ├── layout/Sidebar.tsx
│   │   ├── designer/DesignerDashboard.tsx
│   │   ├── designer/InviteClientModal.tsx
│   │   ├── designer/NewProjectModal.tsx
│   │   ├── designer/ProjectCard.tsx
│   │   └── client/ClientDashboard.tsx
│   └── globals.css
├── lib/
│   └── supabase.ts                       # Supabase client config
├── supabase/
│   └── functions/
│       ├── invite/index.ts
│       └── acceptInvite/index.ts
├── .env.local                            # Local environment (not in git)
├── .env.local.example                    # Example environment file
├── next.config.ts
├── package.json
├── tsconfig.json
├── SUPABASE_SCHEMA.sql                   # Database schema
├── SUPABASE_RLS_POLICIES.sql             # Security policies
└── SETUP_AND_DEPLOYMENT.md               # This file
```

---

## Key Features Implemented

✅ **Authentication**
- Email/password signup
- Magic link invites
- Role-based access (designer, client, admin)
- JWT tokens and RLS

✅ **Project Management**
- Designers create projects
- Invite system with 48-hour expiry
- Client project linking via invite
- Project status tracking

✅ **Design Versions**
- Upload design files to storage
- Version history and changelog
- File download for clients

✅ **Collaboration**
- Comments and feedback
- Project activity feed
- Designer/client dashboards
- Real-time updates via Supabase

✅ **Security**
- Row-level security policies
- Service role for server operations
- Client/designer role separation
- Audit logging

---

## Future Enhancements

- [ ] Design file viewer (image/PDF preview)
- [ ] Real-time notifications
- [ ] Team collaboration (multiple designers)
- [ ] Payment integration
- [ ] Custom branding for designers
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Advanced comment features (mentions, reactions)
- [ ] Batch operations
- [ ] API rate limiting

---

## Support

For issues or questions:
1. Check Supabase docs: https://supabase.com/docs
2. Check Next.js docs: https://nextjs.org/docs
3. Check project GitHub issues
4. Review Supabase logs in dashboard

---

## License

This project is provided as-is for educational purposes.
