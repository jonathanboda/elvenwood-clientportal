# Elvenwood Interiors - System Architecture

## Overview

Elvenwood is a full-stack interior design collaboration platform built with:
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Authentication**: JWT + RLS (Row-Level Security)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                         │
│              (Next.js React Application)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Pages:                                             │   │
│  │  - Home / Auth (signin/signup)                      │   │
│  │  - Dashboard (Designer/Client)                      │   │
│  │  - Project Detail                                   │   │
│  │  - Accept Invite                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/HTTPS
                           │ JWT Token
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
   ┌────▼────────────────────┐   ┌──────────▼────────────────┐
   │   SUPABASE BACKEND      │   │  SUPABASE EDGE FUNCTIONS  │
   │                         │   │                           │
   │ ┌─────────────────────┐ │   │  POST /functions/v1/      │
   │ │   POSTGRESQL DB     │ │   │  - invite                 │
   │ │  Tables:            │ │   │  - acceptInvite           │
   │ │  - profiles         │ │   │                           │
   │ │  - projects         │ │   │  (Deno Runtime)           │
   │ │  - invites          │ │   │  Uses service_role auth   │
   │ │  - versions         │ │   │  Enforces business logic  │
   │ │  - comments         │ │   │                           │
   │ │  - audit_logs       │ │   │                           │
   │ │                     │ │   │                           │
   │ │  RLS Policies:      │ │   │                           │
   │ │  - Enforce access   │ │   │                           │
   │ │  - User isolation   │ │   │                           │
   │ │  - Role-based       │ │   │                           │
   │ └─────────────────────┘ │   │                           │
   │                         │   │                           │
   │ ┌─────────────────────┐ │   │                           │
   │ │  AUTH SERVICE       │ │   │                           │
   │ │                     │ │   │                           │
   │ │  - Email/password   │ │   │                           │
   │ │  - JWT tokens       │ │   │                           │
   │ │  - Sessions         │ │   │                           │
   │ └─────────────────────┘ │   │                           │
   │                         │   │                           │
   │ ┌─────────────────────┐ │   │                           │
   │ │  STORAGE (S3)       │ │   │                           │
   │ │                     │ │   │                           │
   │ │  /designs bucket    │ │   │                           │
   │ │  - Design files     │ │   │                           │
   │ │  - Images/PDFs      │ │   │                           │
   │ │  - Private access   │ │   │                           │
   │ └─────────────────────┘ │   │                           │
   │                         │   │                           │
   └─────────────────────────┘   └───────────────────────────┘
```

---

## Data Flow

### 1. User Authentication Flow

```
User Input (Email/Password)
        ↓
Client-side form submission
        ↓
Supabase Auth.signUp() or signInWithPassword()
        ↓
JWT Token returned
        ↓
Stored in secure cookie (via SSR client)
        ↓
Used for subsequent API calls
```

### 2. Invite Flow

```
Designer clicks "Invite Client"
        ↓
Form: client email + name
        ↓
POST to /functions/v1/invite
        ↓
Edge Function validates:
  - User is designer
  - User owns project
        ↓
Insert into invites table:
  - token (unique)
  - project_id
  - invited_email
  - expires_at (48 hours)
        ↓
Return token to frontend
        ↓
Frontend shows link:
  /accept-invite?token=xxxxx
        ↓
Client receives magic link (future: email)
```

### 3. Accept Invite Flow

```
Client clicks invite link
        ↓
Page loads /accept-invite?token=xxxxx
        ↓
Verify token exists and not expired
        ↓
If not signed in → redirect to signup
        ↓
If signed in → call /functions/v1/acceptInvite
        ↓
Edge Function:
  - Validate token
  - Update invite.status = 'accepted'
  - Update projects.client_id = user_id
  - Update projects.client_email
        ↓
Redirect to /dashboard
        ↓
Client can now see project
```

### 4. File Upload Flow

```
Designer uploads design version
        ↓
File sent to /designs bucket (Supabase Storage)
        ↓
Create versions table entry:
  - version_number
  - file_path (S3 path)
  - changelog
  - created_at
        ↓
Emit real-time update (future)
        ↓
Client's activity feed updates
```

### 5. Comment Flow

```
Client/Designer posts comment
        ↓
Client-side: POST to comments table
        ↓
Server validates (via RLS):
  - User is project member
  - Version exists
        ↓
Insert comment:
  - version_id
  - author_id
  - content
  - timestamp
        ↓
Fetch updated comments
        ↓
UI updates in real-time
```

---

## Security Architecture

### Authentication Layer

```
┌─ User Sign-In ─────────────────────────┐
│                                        │
│  Email + Password → Supabase Auth     │
│         ↓                              │
│  JWT Token (contains user.id)         │
│         ↓                              │
│  Token stored in secure httpOnly      │
│  cookie (via SSR middleware)          │
│         ↓                              │
│  All API requests include token       │
│         ↓                              │
│  Supabase validates JWT               │
└────────────────────────────────────────┘
```

### Authorization Layer (RLS)

```
┌─ Request to Database ──────────────────┐
│                                        │
│  API call with JWT token              │
│         ↓                              │
│  Supabase extracts user.id from JWT   │
│         ↓                              │
│  Evaluate RLS policies:                │
│                                        │
│  Example: SELECT * FROM projects      │
│  WHERE designer_id = auth.uid()       │
│     OR client_id = auth.uid()         │
│     OR is_admin(auth.uid())           │
│         ↓                              │
│  Only matching rows returned          │
│                                        │
│  Unauthorized access: 403 error       │
└────────────────────────────────────────┘
```

### Role-Based Access

```
┌────────────────────────────────────────┐
│   DESIGNER ROLE (designer = true)      │
│                                        │
│  Can:                                  │
│  - Create projects                     │
│  - Create invites                      │
│  - Upload design versions              │
│  - View their projects                 │
│  - See client feedback                 │
│                                        │
│  Cannot:                               │
│  - View other designer projects        │
│  - Delete projects                     │
│  - Approve their own designs           │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│    CLIENT ROLE (designer = false)      │
│                                        │
│  Can:                                  │
│  - Accept invites                      │
│  - View invited projects               │
│  - Post comments                       │
│  - Download designs                    │
│                                        │
│  Cannot:                               │
│  - Create projects                     │
│  - Upload designs                      │
│  - View other projects                 │
│  - Delete projects                     │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      ADMIN ROLE (admin = true)         │
│                                        │
│  Can:                                  │
│  - View everything                     │
│  - Modify any record                   │
│  - Delete records                      │
│  - Access audit logs                   │
│                                        │
│  For internal use only                 │
└────────────────────────────────────────┘
```

---

## Database Schema

### Users (Authentication)

```
auth.users
├── id (UUID)
├── email (unique)
├── encrypted_password
├── created_at
└── updated_at
```

### Profiles (Extended User Data)

```
profiles
├── id (FK → auth.users)
├── email
├── full_name
├── company_name
├── avatar_url
├── role (admin | designer | client)
├── bio
├── created_at
└── updated_at
```

### Projects

```
projects
├── id (UUID)
├── designer_id (FK → profiles)
├── project_name
├── description
├── client_email (optional)
├── client_id (FK → profiles, optional)
├── status (draft | in_progress | review | approved)
├── created_at
└── updated_at
```

### Invites

```
invites
├── id (UUID)
├── project_id (FK → projects)
├── designer_id (FK → profiles)
├── invited_email
├── invited_name
├── status (pending | accepted | expired | rejected)
├── token (unique)
├── expires_at
├── accepted_at (nullable)
├── created_at
└── updated_at
```

### Versions

```
versions
├── id (UUID)
├── project_id (FK → projects)
├── version_number
├── file_name
├── file_path (S3 path)
├── file_size
├── file_type
├── changelog
├── uploaded_by (FK → profiles)
├── status (draft | in_progress | review | approved)
├── created_at
└── updated_at
```

### Comments

```
comments
├── id (UUID)
├── version_id (FK → versions)
├── project_id (FK → projects)
├── author_id (FK → profiles)
├── content
├── attachment_url (nullable)
├── attachment_type (image | file)
├── parent_comment_id (FK → comments, for threading)
├── created_at
└── updated_at
```

### Audit Logs

```
audit_logs
├── id (UUID)
├── user_id (FK → profiles)
├── action (CREATE | UPDATE | DELETE | INVITE_SENT | INVITE_ACCEPTED)
├── resource_type (project | invite | version | comment)
├── resource_id (UUID)
├── changes (JSONB)
├── ip_address (INET)
└── created_at
```

---

## API Endpoints

### Authentication (Supabase Auth)

- `POST /auth/v1/signup` - Create account
- `POST /auth/v1/token?grant_type=password` - Sign in
- `POST /auth/v1/token?grant_type=refresh_token` - Refresh token
- `POST /auth/v1/logout` - Sign out

### Edge Functions

- `POST /functions/v1/invite` - Send client invite
- `POST /functions/v1/acceptInvite` - Accept and link client

### Database (via Supabase SDK)

- `GET /rest/v1/profiles` - Get profile
- `GET /rest/v1/projects` - List projects
- `GET /rest/v1/versions` - List versions
- `POST /rest/v1/comments` - Create comment
- `GET /rest/v1/invites` - List invites

### Storage

- `PUT /storage/v1/object/designs/{path}` - Upload file
- `GET /storage/v1/object/public/designs/{path}` - Download file

---

## Performance Considerations

### Caching
- JWT tokens cached in httpOnly cookies
- Supabase SSR client handles refresh automatically
- Database queries use indexes on foreign keys

### Optimization
- RLS policies evaluated at database level (secure)
- Client-side filtering used for UI-level sorting
- Storage files use CDN for fast downloads

### Scalability
- PostgreSQL handles concurrent users
- Supabase manages replication and backups
- Edge Functions scale automatically
- Storage has unlimited capacity

---

## Monitoring & Debugging

### Supabase Dashboard
- **Logs**: View database and function logs
- **Metrics**: Monitor API usage
- **Auth**: See user signup/login events
- **Storage**: Track file uploads

### Application Logging
- Error tracking via console
- RLS policy violations show 403 errors
- Invalid tokens show 401 errors
- Audit logs record all actions

---

## Deployment Considerations

### Environment Variables
- `NEXT_PUBLIC_*` - Exposed to browser
- `SUPABASE_SERVICE_ROLE_KEY` - Never expose
- `APP_URL` - Changes per environment

### CORS
- Supabase handles CORS automatically
- Edge Functions require proper headers
- Storage has public/private bucket rules

### Secrets Management
- Use platform secrets (Vercel, Netlify, etc.)
- Never commit `.env.local`
- Rotate service keys periodically
- Use different keys per environment

---

## Future Architecture Enhancements

- [ ] Real-time subscriptions (Supabase Realtime)
- [ ] Full-text search on comments
- [ ] Image optimization pipeline
- [ ] Message queuing (Bull, RabbitMQ)
- [ ] Caching layer (Redis)
- [ ] CDN for static assets
- [ ] Mobile app (React Native)
- [ ] GraphQL API layer
- [ ] Webhooks for integrations
- [ ] API rate limiting service
