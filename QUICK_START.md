# Elvenwood Interiors - Quick Start Guide

Get your Elvenwood Interior Design App running in 15 minutes!

---

## Prerequisites

- Node.js 18+
- Supabase account (free at https://supabase.com)
- Text editor or VS Code

---

## 1. Supabase Setup (5 minutes)

### Create Supabase Project
1. Go to https://supabase.com and create account
2. Click "New Project"
3. Fill in project name: `elvenwood-design`
4. Set password and region
5. Wait for project to initialize (~5 mins)

### Get Credentials
Go to **Settings > API** and copy:
- `Project URL` → save as `SUPABASE_URL`
- `anon public` → save as `ANON_KEY`
- `service_role` → save as `SERVICE_ROLE_KEY`

---

## 2. Database Setup (3 minutes)

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Open and copy `SUPABASE_SCHEMA.sql`
4. Paste into SQL editor and click **Run**

5. Create a new query and copy `SUPABASE_RLS_POLICIES.sql`
6. Paste and click **Run**

7. Go to **Storage** and create bucket:
   - Name: `designs`
   - Type: Private

---

## 3. Deploy Edge Functions (2 minutes)

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Create functions directory
mkdir -p supabase/functions/invite supabase/functions/acceptInvite

# Copy function files
cp supabase_edge_functions_invite.ts supabase/functions/invite/index.ts
cp supabase_edge_functions_accept_invite.ts supabase/functions/acceptInvite/index.ts

# Deploy
supabase functions deploy invite
supabase functions deploy acceptInvite
```

---

## 4. Frontend Setup (3 minutes)

```bash
# Create Next.js project
npx create-next-app@latest elvenwood-design --typescript --tailwind

# Install dependencies
cd elvenwood-design
npm install @supabase/ssr @supabase/supabase-js

# Copy all app files from this project
# - Copy app/ folder
# - Copy lib/supabase.ts
# - Copy .env.local.example as .env.local
```

### Setup Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Run Locally (2 minutes)

```bash
npm run dev
```

Open http://localhost:3000 and you're ready to go!

---

## Quick Test

1. **Sign up** with email `designer@test.com`
2. **Create project** "Test Project"
3. **Invite client** with email `client@test.com`
4. **Sign up as client** and accept invite
5. **View project** from client dashboard

---

## What You Get

✅ Multi-user authentication with role-based access
✅ Designer portal - create projects and invite clients
✅ Client portal - view designs and provide feedback
✅ Project management with version history
✅ Comments and collaboration
✅ Secure RLS policies
✅ Production-ready architecture

---

## Next Steps

- Deploy to Vercel (see `SETUP_AND_DEPLOYMENT.md`)
- Add file upload UI for design versions
- Customize styling
- Add more features from the roadmap

---

## Troubleshooting

### Can't create account
- Check email is confirmed in Supabase
- Verify authentication providers are enabled

### Edge functions 401 error
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify function environment variables

### Projects not appearing
- Check RLS policies are enabled on tables
- Verify user role is set in profiles table

### Styling looks broken
- Ensure Tailwind CSS is configured
- Check globals.css is imported

---

For detailed setup, see `SETUP_AND_DEPLOYMENT.md`
