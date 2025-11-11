# Elvenwood Interiors - Design Collaboration Portal

A full-stack interior design collaboration platform built with Next.js, React, and Supabase.

## 🎨 Features

### For Designers
- Create and manage design projects
- Invite clients to projects with secure links
- Upload design versions with changelogs
- Track project status from draft to approval
- View client feedback in real-time
- Dashboard with project overview

### For Clients
- Accept project invites via secure links
- View design versions and history
- Provide feedback through comments
- Track project progress and updates
- Activity feed showing latest updates
- Download design files

### Core Features
- **Authentication**: Email/password signup with magic link invites
- **Role-Based Access**: Designer, Client, and Admin roles
- **Row-Level Security**: Secure database policies
- **Real-Time Collaboration**: Comments and feedback system
- **File Storage**: Secure design file uploads and downloads
- **Activity Tracking**: Audit logs of all actions
- **Responsive Design**: Works on desktop, tablet, and mobile

---

## 📋 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **Real-Time Logic** | Supabase Edge Functions (Deno) |
| **Authentication** | JWT + Row-Level Security |
| **File Storage** | Supabase Storage (S3-compatible) |
| **Deployment** | Vercel, AWS, Docker, or self-hosted |

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Supabase account (free at https://supabase.com)
- Text editor or VS Code

### 2. Supabase Setup (5 minutes)
See **QUICK_START.md** for step-by-step instructions.

### 3. Run Locally
```bash
npm install
npm run dev
```
Visit http://localhost:3000

### 4. Deploy
See **SETUP_AND_DEPLOYMENT.md** for production deployment.

---

## 📁 Project Structure

```
elvenwood-design/
├── app/
│   ├── page.tsx                         # Home page
│   ├── signin/page.tsx                  # Sign in
│   ├── signup/page.tsx                  # Sign up
│   ├── dashboard/page.tsx               # Main dashboard
│   ├── accept-invite/page.tsx          # Accept invite
│   ├── project/[id]/page.tsx           # Project detail
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
│   └── supabase.ts                      # Supabase client
├── supabase/
│   └── functions/
│       ├── invite/
│       └── acceptInvite/
├── .env.local                           # Local env (not in git)
├── .env.local.example                   # Env template
├── SUPABASE_SCHEMA.sql                  # Database schema
├── SUPABASE_RLS_POLICIES.sql           # Security policies
├── QUICK_START.md                       # 15-minute setup
├── SETUP_AND_DEPLOYMENT.md              # Detailed guide
├── ARCHITECTURE.md                      # System design
├── DEPLOYMENT_CHECKLIST.md              # Pre-launch checklist
└── README.md                            # This file
```

---

## 🔐 Security

- **Authentication**: JWT tokens with email/password
- **Authorization**: Row-Level Security (RLS) policies
- **Encryption**: HTTPS in transit, encrypted at rest
- **Secrets**: Service role key never exposed to frontend
- **Audit**: All actions logged with user tracking
- **Privacy**: Users only see data they're authorized to access

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **QUICK_START.md** | Get running in 15 minutes |
| **SETUP_AND_DEPLOYMENT.md** | Detailed step-by-step guide |
| **ARCHITECTURE.md** | System design and data flows |
| **DEPLOYMENT_CHECKLIST.md** | Pre-launch verification |

---

## 🔄 User Workflows

### Designer Workflow
1. Sign up as designer
2. Create new project
3. Enter project details
4. Invite client with email
5. Receive confirmation when client accepts
6. Upload design versions
7. View client feedback
8. Update project status

### Client Workflow
1. Receive invite link
2. Click link to accept
3. Sign up as client (auto-role assignment)
4. View project in dashboard
5. Download design files
6. Post comments and feedback
7. Track project progress

### Invite Flow
1. Designer clicks "Invite Client"
2. Enters client email and name
3. Supabase Edge Function creates invite
4. Generates unique token with 48-hour expiry
5. Returns invite link
6. Client clicks link → accepts → gets access

---

## 🛠 Development

### Environment Variables
```bash
# Create .env.local from .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run Development Server
```bash
npm run dev
```

### Type Check
```bash
npm run type-check
```

### Build for Production
```bash
npm run build
npm start
```

---

## 📊 Database Schema

### Main Tables
- **profiles**: User information and roles
- **projects**: Design projects with designer and client info
- **invites**: Client invitations with tokens and expiry
- **versions**: Design file versions with changelog
- **comments**: Feedback and discussion threads
- **audit_logs**: Action tracking for security

All tables have:
- Row-Level Security (RLS) policies enabled
- Indexes on foreign keys for performance
- Automatic timestamps (`created_at`, `updated_at`)
- Proper constraints and relationships

---

## 🚀 Deployment

### Recommended: Vercel
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy with one click

### Other Options
- AWS Amplify
- Netlify
- Railway
- Docker + self-hosted
- AWS ECS, Lambda, etc.

See **SETUP_AND_DEPLOYMENT.md** for detailed instructions.

---

## 🐛 Troubleshooting

### Cannot create account
- Check email confirmation is enabled
- Verify Supabase authentication is configured

### Projects not showing
- Verify RLS policies are enabled
- Check user role in profiles table

### Edge Functions return 401
- Verify `SUPABASE_SERVICE_ROLE_KEY`
- Check function logs in Supabase dashboard

### Styling looks broken
- Ensure Tailwind CSS is configured
- Check `globals.css` is imported

For more issues, see **SETUP_AND_DEPLOYMENT.md** troubleshooting section.

---

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Authentication system
- ✅ Project management
- ✅ Invite system
- ✅ Comments and feedback
- ✅ Dashboard and UI

### Phase 2 (Future)
- [ ] Design file preview (image/PDF)
- [ ] Real-time notifications
- [ ] Team collaboration (multiple designers)
- [ ] Advanced comment features (mentions, reactions)
- [ ] Payment integration
- [ ] Custom branding

### Phase 3 (Later)
- [ ] Mobile app (React Native)
- [ ] API for integrations
- [ ] Analytics dashboard
- [ ] Batch operations
- [ ] Advanced search and filtering
- [ ] Scheduled uploads
- [ ] Automated workflows

---

## 📞 Support

### For Technical Issues
1. Check **SETUP_AND_DEPLOYMENT.md** troubleshooting
2. Review Supabase logs in dashboard
3. Check browser console for errors
4. Review application logs

### For Questions
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- PostgreSQL docs: https://www.postgresql.org/docs/

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

## 🤝 Contributing

To contribute to Elvenwood:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 💡 Tips for Success

1. **Read Documentation First**: Start with QUICK_START.md
2. **Test Locally**: Verify everything works before deploying
3. **Use Checklist**: Follow DEPLOYMENT_CHECKLIST.md before going live
4. **Monitor After Launch**: Watch logs and metrics for 24 hours
5. **Gather Feedback**: Iterate based on user input
6. **Keep Secrets Secure**: Never commit credentials
7. **Update Dependencies**: Keep packages current
8. **Test Thoroughly**: Especially authentication and permissions

---

## 🎯 Key Differentiators

✨ **Secure by Default**: RLS policies on every table
✨ **Scalable**: Supabase grows with your users
✨ **Developer Friendly**: Modern stack, great documentation
✨ **Production Ready**: Full authentication, audit logs, error handling
✨ **Invite Based**: No password sharing, secure client onboarding
✨ **Real-Time Capable**: Built on Supabase real-time infrastructure

---

## 📞 Questions?

Refer to the comprehensive guides:
- Quick setup: **QUICK_START.md** (15 minutes)
- Detailed guide: **SETUP_AND_DEPLOYMENT.md** (complete)
- System design: **ARCHITECTURE.md** (technical)
- Pre-launch: **DEPLOYMENT_CHECKLIST.md** (verification)

---

**Happy designing! 🎨**

Built with ❤️ for interior designers and their clients.
