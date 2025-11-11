# Deployment & Performance Guide

Complete guide for deploying the enhanced Client Portal to production and optimizing performance.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [API Configuration](#api-configuration)
5. [Deployment Steps](#deployment-steps)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Hardening](#security-hardening)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript files compile without errors (`npm run type-check`)
- [ ] ESLint passes all checks (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials or secrets

### Features Verification
- [ ] Activity Feed displays correctly
- [ ] Design Projects filters work
- [ ] Design Viewer zoom and comments function
- [ ] Notifications filter and group properly
- [ ] User Profile editing works
- [ ] Real-time updates trigger correctly

### Performance
- [ ] Lighthouse score >= 90 (Performance)
- [ ] Bundle size analyzed and optimized
- [ ] No memory leaks in long sessions
- [ ] API response times < 200ms
- [ ] Database queries optimized (use EXPLAIN ANALYZE)

### Security
- [ ] CORS properly configured
- [ ] RLS policies verified on all tables
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] SQL injection prevention verified

### Data
- [ ] Database backups configured
- [ ] Data migration plan ready
- [ ] Rollback strategy prepared
- [ ] Seed data for testing available

---

## Environment Configuration

### Production Environment Variables

Create `.env.production` with all necessary values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://app.example.com
NODE_ENV=production

# API Configuration
API_TIMEOUT=30000
MAX_UPLOAD_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# Real-time Configuration
REALTIME_ENABLED=true
POLLING_INTERVAL_ACTIVITY=5000
POLLING_INTERVAL_NOTIFICATIONS=3000

# Logging
LOG_LEVEL=info
SENTRY_DSN=https://your-sentry-dsn

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Performance
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_CACHE_TTL=3600
```

### Production Build Configuration

Update `next.config.ts`:

```typescript
const nextConfig = {
  // Enable SWR for improved performance
  swrConfig: {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-project.supabase.co',
      },
    ],
    unoptimized: false,
  },

  // Compression
  compress: true,
  productionBrowserSourceMaps: false,

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

---

## Database Setup

### Apply Migrations

```bash
# 1. Connect to Supabase PostgreSQL
psql "postgresql://postgres:password@your-project.db.supabase.co:5432/postgres"

# 2. Run migrations
\i migrations/add_realtime_features.sql

# 3. Verify tables created
\dt activities notifications

# 4. Verify indexes
\di

# 5. Test RLS policies
SELECT * FROM activities LIMIT 1;  -- Should filter by user
```

### Seed Initial Data

```bash
# For development/testing
npm run seed:dev

# Verify data loaded
SELECT COUNT(*) FROM activities;
SELECT COUNT(*) FROM notifications;
```

### Backup Configuration

```sql
-- Enable automated backups
ALTER DATABASE your_db SET backup_enabled = true;

-- Set backup retention
ALTER DATABASE your_db SET backup_retention_days = 30;

-- Manual backup
pg_dump "your_connection_string" > backup_$(date +%Y%m%d).sql

-- Restore from backup
psql "your_connection_string" < backup_20240101.sql
```

---

## API Configuration

### Edge Functions Deployment

```bash
# Deploy Supabase Edge Functions
supabase functions deploy --project-id your-project-id invite
supabase functions deploy --project-id your-project-id accept-invite

# Set secrets
supabase secrets set --project-id your-project-id SENDGRID_API_KEY=sk_...
```

### API Rate Limiting Setup

```typescript
// middleware/rateLimit.ts
import { rateLimit } from 'express-rate-limit';

export const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 30,                    // 30 comments per window
  message: 'Too many comments created',
  standardHeaders: true,
  legacyHeaders: false,
});

export const notificationLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 60,                    // 60 polls per minute
  skip: (req) => req.user?.id === 'admin', // Skip for admin
});
```

### CORS Configuration

```typescript
// middleware/cors.ts
export const corsOptions = {
  origin: process.env.NEXT_PUBLIC_APP_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

---

## Deployment Steps

### 1. Pre-Deployment Validation

```bash
# Run all checks
npm run type-check
npm run lint
npm test

# Build production bundle
npm run build

# Test production build locally
npm start

# Analyze bundle size
npm run analyze
```

### 2. Database Migration

```bash
# Create backup before migration
pg_dump "$DATABASE_URL" > backup_$(date +%s).sql

# Run migrations
npx supabase migration up

# Verify migration
npx supabase migration list

# Test critical queries
npm run test:db
```

### 3. Deploy to Vercel

```bash
# Option 1: Git push (automatic deployment)
git push origin main

# Option 2: Manual deployment
vercel deploy --prod

# Option 3: Using Vercel CLI
vercel env pull .env.production.local
npm run build
vercel deploy --prod --prebuilt
```

### 4. Verify Deployment

```bash
# Health check endpoint
curl https://app.example.com/api/health

# Check database connection
curl https://app.example.com/api/db/health

# Verify real-time updates
curl https://app.example.com/api/realtime/status

# Check error logs
vercel logs --scope=your-workspace
```

### 5. Smoke Tests

```bash
# Run basic functionality tests
npm run test:smoke

# Test key user flows
npm run test:e2e --grep "Activity Feed|Design Viewer|Notifications"

# Load testing
npm run test:load -- --users=100 --duration=300
```

### 6. Post-Deployment Monitoring

Monitor these metrics for 24 hours:

- **Error Rate**: Should be < 0.1%
- **Response Time**: p95 < 500ms
- **Database CPU**: < 70%
- **Storage**: Monitor growth rate
- **Concurrent Users**: Monitor during peak hours

---

## Performance Optimization

### Frontend Optimization

#### Code Splitting

```typescript
// app.config.ts
export const codeConfig = {
  bundles: {
    main: ['components/layout', 'components/common'],
    activities: ['components/client/ActivityFeed'],
    projects: ['components/client/ClientProjects'],
    viewer: ['components/common/DesignViewer'],
  },
};
```

#### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={designUrl}
  alt="Design version"
  width={800}
  height={600}
  priority={false}
  loading="lazy"
  quality={85}
/>
```

#### Lazy Loading

```typescript
// Lazy load heavy components
const DesignViewer = dynamic(
  () => import('@/components/common/DesignViewer'),
  {
    loading: () => <Skeleton />,
    ssr: false,
  }
);
```

### Backend Optimization

#### Database Query Optimization

```sql
-- Add composite indexes
CREATE INDEX idx_activities_client_created
ON activities(project_id, created_at DESC)
WHERE deleted_at IS NULL;

-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM activities WHERE created_at > NOW() - INTERVAL '7 days';

-- Monitor slow queries
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- 1 second
SELECT pg_reload_conf();
```

#### Caching Strategy

```typescript
// Use Redis for caching
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Cache activity feed for 5 minutes
const activityCache = await redis.get(`activities:${clientId}`);
if (!activityCache) {
  const activities = await fetchActivities(clientId);
  await redis.setex(`activities:${clientId}`, 300, JSON.stringify(activities));
}
```

#### Connection Pooling

```typescript
// Configure Supabase connection pool
const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Connection': 'keep-alive',
    },
  },
});
```

### Network Optimization

#### Minification & Compression

```bash
# Gzip compression (automatic with Vercel)
# Enable Brotli for better compression
# Configure CDN caching headers

# Check compression
curl -I https://app.example.com | grep -i "content-encoding"
```

#### HTTP/2 Push

```typescript
// Preload critical resources
const criticalResources = [
  '/fonts/inter.woff2',
  '/images/logo.svg',
];
```

### Monitoring Performance

```typescript
// lib/performance.ts
export function trackMetrics() {
  // Web Vitals
  const vitals = {
    LCP: 0,  // Largest Contentful Paint
    FID: 0,  // First Input Delay
    CLS: 0,  // Cumulative Layout Shift
  };

  // Track with analytics
  reportWebVitals((metric) => {
    console.log(metric);
    // Send to analytics service
  });
}
```

---

## Monitoring & Logging

### Error Tracking with Sentry

```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

### Application Logging

```typescript
// lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});

// Usage
logger.info({ activityId: 'a1' }, 'Activity created');
logger.error({ error: err }, 'Failed to fetch activities');
```

### Database Monitoring

```sql
-- Monitor active connections
SELECT
  datname,
  usename,
  application_name,
  state,
  count(*) as conn_count
FROM pg_stat_activity
GROUP BY datname, usename, application_name, state;

-- Monitor slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Monitor table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Uptime Monitoring

```bash
# Using Uptime Robot or similar
# Monitor critical endpoints:
# - /api/health
# - /api/db/health
# - https://app.example.com

# Alert thresholds:
# - Response time > 5 seconds
# - Error rate > 1%
# - Uptime < 99.9%
```

---

## Security Hardening

### Authentication & Authorization

```typescript
// Middleware for API routes
export async function withAuth(handler) {
  return async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const user = await verifyToken(token);
      req.user = user;
      return handler(req, res);
    } catch (error) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  };
}
```

### Input Validation

```typescript
// lib/validation.ts
import { z } from 'zod';

export const commentSchema = z.object({
  content: z.string().min(1).max(5000),
  versionId: z.string().uuid(),
  projectId: z.string().uuid(),
  attachmentUrl: z.string().url().optional(),
});

// Usage
const validated = commentSchema.parse(req.body);
```

### File Upload Security

```typescript
// lib/fileUpload.ts
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function validateFile(file: File) {
  if (!ALLOWED_MIMETYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }

  // Scan for malware (e.g., using ClamAV)
  // await scanFile(file);
}
```

### HTTPS & TLS

```bash
# Enforce HTTPS only
export const nextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ],
    },
  ],
};
```

### Secrets Management

```bash
# Never commit secrets
echo ".env.local" >> .gitignore

# Use Vercel secrets for production
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Rotate secrets regularly
# Schedule: Monthly for API keys, Quarterly for database passwords
```

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: Slow Activity Feed Loading

**Symptoms**: Activity feed takes > 3 seconds to load

**Solutions**:
1. Check database indexes: `EXPLAIN ANALYZE SELECT * FROM activities ...`
2. Reduce initial data load: Implement pagination
3. Enable Redis caching
4. Check API response times with `curl -w "@curl-format.txt"`

#### Issue: Notifications Not Appearing

**Symptoms**: Notifications created but don't show up

**Solutions**:
1. Verify notifications table exists
2. Check RLS policies: `SELECT * FROM pg_policies WHERE tablename='notifications'`
3. Verify triggers are active: `SELECT * FROM information_schema.triggers`
4. Check browser console for JavaScript errors
5. Test with direct database query

#### Issue: Real-time Updates Not Working

**Symptoms**: Changes don't appear without page refresh

**Solutions**:
1. Verify polling is active: Check Network tab for /api/activity-feed requests
2. Check subscription cleanup: `getActiveSubscriptionCount()` should increase/decrease
3. Increase polling frequency temporarily for testing
4. Check browser DevTools for subscription errors
5. Verify API endpoint is responding

#### Issue: Design Viewer Memory Leak

**Symptoms**: Browser uses increasing memory when switching between designs

**Solutions**:
1. Check component cleanup in useEffect
2. Clear image cache: `<img src={...} decoding="async" />`
3. Remove event listeners on unmount
4. Use React.memo for expensive components
5. Profile with Chrome DevTools Memory tab

### Debug Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs --follow

# Check environment variables
vercel env ls

# Test specific endpoint
curl -v https://app.example.com/api/health

# Monitor real-time
watch -n 1 'curl -s https://app.example.com/api/stats | jq'

# Database query performance
psql "your_connection_string" -c "EXPLAIN ANALYZE SELECT ..."

# Check disk usage
du -sh .next/ node_modules/
```

---

## Rollback Procedures

### Immediate Rollback (if critical issue)

```bash
# Option 1: Vercel Dashboard
# Go to Deployments → Click the previous version → Promote to Production

# Option 2: CLI
vercel rollback

# Option 3: Redeploy specific version
vercel deploy --prod --prebuilt --same-version
```

### Database Rollback

```bash
# If migration caused issues

# 1. Backup current state
pg_dump "$DATABASE_URL" > backup_rollback_$(date +%s).sql

# 2. Restore previous backup
psql "$DATABASE_URL" < backup_20240101.sql

# 3. Verify data integrity
SELECT COUNT(*) FROM activities;
SELECT COUNT(*) FROM notifications;

# 4. Run integrity checks
ANALYZE;
REINDEX DATABASE your_db;
```

### Partial Feature Rollback

```typescript
// Use feature flags for gradual rollout
export const isFeatureEnabled = (feature: string) => {
  const flags = {
    newActivityFeed: false,      // Rollback this
    designViewer: true,
    notifications: true,
  };

  return flags[feature as keyof typeof flags] ?? false;
};

// Usage
{isFeatureEnabled('newActivityFeed') && <ActivityFeed />}
```

---

## Deployment Checklist - Final

Before going live:

- [ ] All tests passing
- [ ] Code review completed
- [ ] Performance baseline established
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Team notified
- [ ] Runbook documented
- [ ] Rollback plan ready

Post-deployment:

- [ ] Monitor error rate (24 hours)
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] User testing confirms functionality
- [ ] Performance acceptable
- [ ] No critical issues reported

---

## Support & Escalation

**Deployment Issues**: ops-team@example.com
**Database Issues**: dba-team@example.com
**On-call**: Check PagerDuty
**Critical Issues**: Slack #incidents channel

---

This deployment guide ensures a smooth, safe release of the enhanced Client Portal to production. Always test thoroughly before deploying to production.
