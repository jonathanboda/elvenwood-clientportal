# Supabase MCP Configuration Guide

## Overview

MCP (Model Context Protocol) allows Claude Code to connect to your Supabase backend directly, making it easier to manage your database and API without leaving the editor.

---

## 🔐 Security First

**⚠️ IMPORTANT:** Never commit real API keys to git!

The `anthropic.json` file in your project now has placeholders for your Supabase credentials.

---

## Setup Instructions

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click **Settings > API**
3. Copy these values:
   - **Project URL** → Extract the project ID from the URL
     - Example: `https://mszlbzcyebrcfvsqphxw.supabase.co` → Project ID is `mszlbzcyebrcfvsqphxw`
   - **`anon public`** → Your anonymous public key
   - **`service_role`** (optional) → For server-side operations (keep secret!)

### Step 2: Update anthropic.json

Replace the placeholders in your `anthropic.json`:

```json
{
  "mcp": {
    "sources": [
      {
        "name": "supabase-elvenwood",
        "type": "http",
        "url": "https://YOUR_PROJECT_ID.supabase.co/rest/v1",
        "headers": {
          "apikey": "YOUR_ANON_KEY_HERE",
          "Authorization": "Bearer YOUR_ANON_KEY_HERE",
          "Content-Type": "application/json"
        }
      }
    ]
  }
}
```

Example with real values (don't use these!):
```json
{
  "mcp": {
    "sources": [
      {
        "name": "supabase-elvenwood",
        "type": "http",
        "url": "https://mszlbzcyebrcfvsqphxw.supabase.co/rest/v1",
        "headers": {
          "apikey": "eyJhbGc...",
          "Authorization": "Bearer eyJhbGc...",
          "Content-Type": "application/json"
        }
      }
    ]
  }
}
```

### Step 3: Protect Your Credentials

**Add to `.gitignore`:**
```
anthropic.json
.env.local
.env
```

**Never commit credentials!**

---

## Using Supabase via MCP

Once configured, you can interact with Supabase through Claude Code:

### Query Data
```
Ask Claude to query your profiles table from Supabase
```

### View Tables
```
Ask Claude to list all records from the projects table
```

### Manage Data
```
Ask Claude to insert/update/delete records
```

### Browse Schema
```
Ask Claude to show the database schema
```

---

## API Endpoints Available

Once configured, you can access these Supabase REST endpoints:

### Tables (CRUD)
- `GET /rest/v1/profiles` - List profiles
- `GET /rest/v1/projects` - List projects
- `GET /rest/v1/invites` - List invites
- `GET /rest/v1/versions` - List versions
- `GET /rest/v1/comments` - List comments
- `POST /rest/v1/{table}` - Create record
- `PATCH /rest/v1/{table}?id=eq.{id}` - Update record
- `DELETE /rest/v1/{table}?id=eq.{id}` - Delete record

### RPC Functions
- Once you create custom RPC functions in Supabase, they'll be available too

---

## Environment Variables

You can also reference environment variables in your MCP config:

```json
{
  "mcp": {
    "sources": [
      {
        "name": "supabase-elvenwood",
        "type": "http",
        "url": "${SUPABASE_URL}/rest/v1",
        "headers": {
          "apikey": "${SUPABASE_ANON_KEY}",
          "Authorization": "Bearer ${SUPABASE_ANON_KEY}"
        }
      }
    ]
  }
}
```

Then set in your shell:
```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-anon-key
```

---

## Troubleshooting

### "MCP not loading"
- Check syntax in `anthropic.json`
- Verify credentials are correct
- Ensure JSON is valid (use a JSON validator)

### "Unauthorized 401"
- Check your API key is correct
- Verify it's the `anon` key, not `service_role`
- Check for extra spaces/characters

### "Table not found"
- Verify table exists in Supabase
- Check table name spelling
- Ensure RLS policies allow read access

### "CORS error"
- Supabase handles CORS automatically
- Make sure you're using the correct URL

---

## Security Best Practices

✅ **DO:**
- Use environment variables in production
- Rotate keys periodically
- Use `anon` key for client-side operations
- Use `service_role` only server-side
- Keep API keys in `.env.local`
- Add `anthropic.json` to `.gitignore` if it has real keys

❌ **DON'T:**
- Commit `anthropic.json` with real keys
- Share your API keys
- Use `service_role` in client code
- Expose keys in error messages
- Use the same keys across environments

---

## Advanced: Adding More MCP Sources

You can add multiple sources to your `anthropic.json`:

```json
{
  "mcp": {
    "sources": [
      {
        "name": "supabase-prod",
        "type": "http",
        "url": "https://prod-project.supabase.co/rest/v1",
        "headers": {
          "apikey": "YOUR_PROD_KEY",
          "Authorization": "Bearer YOUR_PROD_KEY"
        }
      },
      {
        "name": "supabase-dev",
        "type": "http",
        "url": "https://dev-project.supabase.co/rest/v1",
        "headers": {
          "apikey": "YOUR_DEV_KEY",
          "Authorization": "Bearer YOUR_DEV_KEY"
        }
      },
      {
        "name": "local-files",
        "type": "file",
        "path": "./"
      }
    ]
  }
}
```

---

## Testing Your Connection

To verify MCP is working:

1. Open Claude Code
2. Ask: "Connect to my Supabase database and show me the profiles table"
3. Claude should query the data

If it works, you'll see your data!

---

## For More Information

- Supabase API Docs: https://supabase.com/docs/guides/api
- Claude Code MCP Docs: https://docs.claude.com/en/docs/claude-code/mcp
- MCP Protocol: https://modelcontextprotocol.io

---

## Next Steps

1. Update `anthropic.json` with your real credentials
2. Test the connection
3. Use Claude to explore your database
4. Start managing your project via MCP

Your Elvenwood database is now accessible through Claude Code! 🚀
