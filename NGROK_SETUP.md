# Quick Setup: Test Invitations with ngrok

## What is ngrok?
ngrok creates a public URL that tunnels to your localhost, allowing clients anywhere to access your app.

## Setup Steps

### 1. Install ngrok
- Go to: https://ngrok.com/download
- Download and install for Windows
- Sign up for a free account

### 2. Authenticate
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```
(Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken)

### 3. Start ngrok
```bash
ngrok http 3001
```

### 4. Copy the Public URL
You'll see something like:
```
Forwarding  https://abc123-def456.ngrok-free.app -> http://localhost:3001
```

Copy the `https://abc123-def456.ngrok-free.app` URL

### 5. Update .env.local
Replace the NEXT_PUBLIC_APP_URL:
```env
NEXT_PUBLIC_APP_URL=https://abc123-def456.ngrok-free.app
```

### 6. Restart Your Dev Server
Stop the server (Ctrl+C) and restart:
```bash
npm run dev
```

### 7. Test the Invitation
- Send an invitation from your app
- The client will receive a link with the ngrok URL
- They can click it from anywhere in the world!

## Important Notes
- **Free ngrok URLs change** every time you restart ngrok
- **Update .env.local** each time with the new URL
- For permanent solution, deploy to Vercel/Netlify

## Alternative: Deploy to Production
For a permanent URL, deploy to Vercel:
```bash
npm install -g vercel
vercel login
vercel
```

Then set `NEXT_PUBLIC_APP_URL` to your Vercel URL.
