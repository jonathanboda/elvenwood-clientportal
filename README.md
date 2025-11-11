# Elvenwood Interior Design - Client Portal

A modern, full-stack client-designer collaboration platform built with Next.js 15, Supabase, and deployed on Vercel.

## Features

- **Designer Dashboard**: Project management, client invitations, design uploads
- **Client Portal**: Project viewing, feedback, and real-time notifications
- **Design Viewer**: Interactive design review with commenting
- **Real-time Notifications**: Instant updates on project activities
- **Secure Authentication**: Supabase-powered auth with role-based access
- **File Management**: Secure upload and storage via Supabase Storage

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Material-UI
- **Backend**: Supabase (PostgreSQL, Authentication, Storage, Real-time)
- **Deployment**: Vercel
- **Email**: Resend API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jonathanboda/elvenwood-clientportal.git
   cd elvenwood-clientportal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Configure your `.env.local` with:
   - Supabase URL and keys
   - Resend API key (optional)
   - App URL

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Deployment

This project is configured for automatic deployment on Vercel:

- Push to `main` branch triggers production deployment
- Pull requests create preview deployments
- Environment variables managed in Vercel dashboard

**Live URL**: https://clientportal-oxe3ukpsl-jonathans-projects-6b1233ea.vercel.app

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── client-portal/     # Client-facing pages
│   ├── designer/          # Designer dashboard
│   └── components/        # Shared components
├── components/            # Legacy components
├── lib/                   # Utilities and configurations
├── supabase/             # Database migrations
└── public/               # Static assets
```

## Documentation

See the `/docs` directory for detailed guides on:
- Database setup
- Authentication configuration
- Deployment process
- Testing procedures

## License

Private - All Rights Reserved
