# Elvenwood Interiors - Deployment Checklist

Use this checklist to ensure all components are properly configured before deploying to production.

---

## Phase 1: Local Development Setup

- [ ] **Node.js & npm installed**
  - Verify: `node --version` (should be 18+)
  - Verify: `npm --version`

- [ ] **Supabase account created**
  - Account activated
  - Email confirmed

- [ ] **Supabase project created**
  - Project name: `elvenwood-design`
  - Region selected (closest to users)
  - Project status: "Active"

- [ ] **Database initialized**
  - Run `SUPABASE_SCHEMA.sql`
  - Verify all tables created
  - Verify all indexes created
  - Run `SUPABASE_RLS_POLICIES.sql`
  - Verify RLS policies enabled on all tables

- [ ] **Storage bucket created**
  - Bucket name: `designs`
  - Privacy: Private
  - Can upload/download files

- [ ] **Authentication configured**
  - Email provider enabled
  - Password authentication enabled
  - Confirm email enabled (optional)

- [ ] **Environment variables set**
  - `.env.local` created
  - `NEXT_PUBLIC_SUPABASE_URL` set correctly
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` set correctly
  - `SUPABASE_SERVICE_ROLE_KEY` set correctly
  - `NEXT_PUBLIC_APP_URL` set to http://localhost:3000

- [ ] **Next.js project created**
  - `npx create-next-app` completed
  - Dependencies installed
  - `@supabase/ssr` and `@supabase/supabase-js` added

- [ ] **Application files copied**
  - `app/` directory copied
  - `lib/supabase.ts` copied
  - All components imported correctly

- [ ] **Development server runs**
  - `npm run dev` starts without errors
  - http://localhost:3000 loads
  - No console errors

---

## Phase 2: Edge Functions Deployment

- [ ] **Supabase CLI installed**
  - Verify: `supabase --version`

- [ ] **Supabase CLI authenticated**
  - `supabase login` completed
  - Access token configured

- [ ] **Functions directory created**
  - `supabase/functions/invite/` exists
  - `supabase/functions/acceptInvite/` exists

- [ ] **Invite function deployed**
  - `supabase_edge_functions_invite.ts` copied to `supabase/functions/invite/index.ts`
  - `supabase functions deploy invite` completed
  - Function shows "Active" in Supabase dashboard
  - Environment variable `APP_URL` set

- [ ] **Accept Invite function deployed**
  - `supabase_edge_functions_accept_invite.ts` copied to `supabase/functions/acceptInvite/index.ts`
  - `supabase functions deploy acceptInvite` completed
  - Function shows "Active" in Supabase dashboard

- [ ] **Functions tested locally**
  - Call `/functions/v1/invite` with valid JWT
  - Call `/functions/v1/acceptInvite` with valid token
  - Both return success responses

---

## Phase 3: Local Testing

- [ ] **Home page loads**
  - Navigate to http://localhost:3000
  - Landing page displays
  - Sign in/Sign up buttons visible

- [ ] **User sign-up works**
  - Navigate to /signup
  - Create account with test email
  - Account created in Supabase auth
  - Profile created in database

- [ ] **User sign-in works**
  - Navigate to /signin
  - Sign in with existing account
  - Redirected to /dashboard
  - JWT token stored

- [ ] **Designer dashboard loads**
  - Sign in as designer
  - Dashboard shows summary cards
  - "New Project" button visible
  - "Invite Client" button visible

- [ ] **Create project works**
  - Click "New Project"
  - Enter project name and description
  - Project created in database
  - Project appears in dashboard

- [ ] **Invite client works**
  - Select project
  - Click "Invite Client"
  - Enter client name and email
  - Invite created in database
  - Status is "pending"
  - Invite token generated

- [ ] **Accept invite works**
  - Get invite token from database
  - Navigate to /accept-invite?token=XXXXX
  - Invite details display
  - Sign up as new client
  - Invite status changed to "accepted"
  - Client linked to project

- [ ] **Client dashboard loads**
  - Sign in as client
  - Client dashboard displays
  - Invited project appears
  - Activity feed shows (if versions exist)

- [ ] **View project works**
  - Client clicks on project
  - Project detail page loads
  - Designer name displayed
  - Client email displayed
  - Comments section visible

- [ ] **Add comment works**
  - Client writes comment
  - Clicks "Post Comment"
  - Comment appears in list
  - Author and timestamp show

- [ ] **Sign out works**
  - Click user menu
  - Click "Sign Out"
  - Redirected to home page
  - Session cleared

---

## Phase 4: Security Verification

- [ ] **RLS policies working**
  - Designer cannot see other designer's projects
  - Client can only see their linked projects
  - Comments only visible to project members
  - Non-authenticated users blocked from data

- [ ] **Authentication tokens valid**
  - JWT tokens properly issued
  - Tokens expire after configured time
  - Refresh token mechanism works
  - Tokens are httpOnly (not accessible via JS)

- [ ] **Service role key protected**
  - Not exposed in browser
  - Only used in Edge Functions
  - Not in `.env.local` git commit

- [ ] **Email addresses private**
  - Profiles don't expose emails to wrong users
  - Invite emails not leaked

- [ ] **Files secure**
  - Storage bucket is private
  - Only authenticated users can upload
  - Only authorized users can download

---

## Phase 5: Production Preparation

- [ ] **Environment file created**
  - `.env.local` not tracked in git
  - `.env.local.example` created with template

- [ ] **Build succeeds**
  - `npm run build` completes without errors
  - No TypeScript errors
  - No Next.js warnings

- [ ] **Type checking passes**
  - `tsc --noEmit` completes
  - All types correct

- [ ] **Production URLs configured**
  - `NEXT_PUBLIC_APP_URL` points to production domain
  - Supabase project has production setting
  - All API calls use HTTPS

- [ ] **Error handling in place**
  - 404 pages display
  - Error boundaries catch exceptions
  - Loading states show
  - API errors handled gracefully

- [ ] **Redirects configured**
  - Protected routes redirect to login
  - After login redirects to dashboard
  - Invite links work from any domain

---

## Phase 6: Deployment (Choose One)

### Option A: Vercel Deployment

- [ ] **GitHub repository created**
  - Project pushed to GitHub
  - `.env.local` in `.gitignore`
  - All files committed

- [ ] **Vercel project created**
  - Repository imported
  - Project name set to `elvenwood-design`

- [ ] **Environment variables added**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app`

- [ ] **Deployment successful**
  - Build completes
  - Functions deploy
  - Preview URL accessible
  - Production domain set up

### Option B: Self-Hosted (Node.js)

- [ ] **Server prepared**
  - Node.js 18+ installed
  - PM2 or similar process manager ready
  - Nginx/Apache for reverse proxy configured

- [ ] **Environment file uploaded**
  - `.env.local` uploaded securely
  - Permissions set correctly (owner only)

- [ ] **Application deployed**
  - `npm install` completed
  - `npm run build` completed
  - Build artifacts verified
  - Process manager started application

- [ ] **Proxy configured**
  - HTTPS certificates installed
  - HTTP redirects to HTTPS
  - Reverse proxy points to Node process
  - Ports configured correctly

- [ ] **Monitoring set up**
  - Log aggregation configured
  - Error tracking enabled (Sentry, etc.)
  - Uptime monitoring active

### Option C: Docker Deployment

- [ ] **Dockerfile created**
  - Based on Node 18 alpine
  - Multi-stage build for optimization
  - Correct EXPOSE port

- [ ] **Docker image built**
  - `docker build` completes
  - Image has reasonable size

- [ ] **Container runs**
  - `docker run` starts successfully
  - Environment variables passed
  - Port mapping correct

- [ ] **Container registry uploaded**
  - Image pushed to Docker Hub or private registry
  - Tag set correctly

- [ ] **Orchestration ready** (if using)
  - Kubernetes manifests created
  - Helm charts configured
  - Replicas set appropriately

---

## Phase 7: Post-Deployment Testing

- [ ] **Production site loads**
  - Home page accessible
  - No mixed content warnings
  - HTTPS certificate valid
  - No console errors

- [ ] **Authentication works in production**
  - Create account
  - Sign in
  - Sign out
  - Session persists

- [ ] **Invite flow works in production**
  - Designer creates project
  - Client invited
  - Invite link works
  - Client can accept

- [ ] **Supabase connection works**
  - Data loads from production database
  - No CORS errors
  - RLS policies enforced

- [ ] **Edge Functions work in production**
  - Invite function creates records
  - Accept function links users
  - Proper error handling

- [ ] **Storage works in production**
  - Files can be uploaded (when implemented)
  - Files can be downloaded
  - Permissions enforced

- [ ] **Email configuration works** (if enabled)
  - Invites send emails
  - Links in emails work
  - Email templates display correctly

- [ ] **Performance acceptable**
  - Page load times < 3 seconds
  - API responses < 500ms
  - No visual issues
  - Mobile responsive

---

## Phase 8: Monitoring & Maintenance

- [ ] **Logging enabled**
  - Error logs captured
  - Usage logs tracked
  - Supabase logs accessible

- [ ] **Backups configured**
  - Supabase auto-backups enabled
  - Backup retention set
  - Test restore process

- [ ] **Security hardened**
  - HTTPS enforced
  - HSTS headers set
  - CSP headers configured
  - CORS properly restricted

- [ ] **Updates scheduled**
  - Supabase dashboard monitored
  - Dependencies updated regularly
  - Security patches applied

- [ ] **Monitoring alerts configured**
  - High error rate alerts
  - Uptime alerts
  - Performance alerts
  - Slack/email notifications

- [ ] **Documentation updated**
  - Production URLs documented
  - Runbooks created
  - Support procedures documented
  - Team trained on deployment

---

## Phase 9: Go-Live Handoff

- [ ] **Team trained**
  - Product managers understand features
  - Developers understand codebase
  - Support team can troubleshoot
  - Designers know workflow

- [ ] **Communication plan ready**
  - Launch announcement prepared
  - User guides created
  - FAQ documented
  - Support channels set up

- [ ] **Rollback plan ready**
  - Previous version backed up
  - Rollback procedure documented
  - Team trained on rollback
  - Quick rollback trigger defined

- [ ] **Success metrics defined**
  - Target user numbers
  - Performance targets
  - Error rate thresholds
  - User satisfaction metrics

- [ ] **Launch authorized**
  - Stakeholders approve go-live
  - Budgets approved
  - Resources allocated
  - Timeline confirmed

---

## Post-Launch (Week 1)

- [ ] **Monitor closely**
  - Watch error logs
  - Check performance metrics
  - Monitor user feedback
  - Be ready to respond quickly

- [ ] **Fix critical issues**
  - Any show-stoppers addressed immediately
  - Security issues patched
  - Performance issues optimized

- [ ] **Gather feedback**
  - Collect user feedback
  - Track requested features
  - Document bugs
  - Plan improvements

- [ ] **Update documentation**
  - Fix any outdated docs
  - Add troubleshooting guides
  - Update runbooks
  - Share learnings with team

---

## Sign-Off

- **Deployment Date**: _______________
- **Deployed By**: _______________
- **Verified By**: _______________
- **Sign-Off By**: _______________
- **Date**: _______________

---

## Notes

```
Use this space for deployment notes, issues encountered,
and how they were resolved.

_________________________________________________
_________________________________________________
_________________________________________________
_________________________________________________
```
