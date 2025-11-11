# File Upload - Troubleshooting Guide

**Issue:** "Failed to fetch" error when uploading files
**Error Type:** Console TypeError
**Status:** Diagnostic & Recovery Guide

---

## Understanding the "Failed to fetch" Error

### What It Means
When you see "Failed to fetch" in the browser console while uploading a file, it means the browser **cannot reach the API endpoint** (`/api/upload`).

### Common Causes

| Cause | Symptoms | Solution |
|-------|----------|----------|
| **Dev server not running** | No console output | Start dev server |
| **Wrong port** | Server on 3000, browser on 3008 | Check port match |
| **API endpoint down** | Server running, but 500 error | Check server logs |
| **Network connectivity** | Can't reach localhost | Check WiFi/network |
| **CORS issue** | Network request blocked | Check CORS headers |
| **Missing .next folder** | Build error | Run clean rebuild |

---

## Quick Fix Steps

### Step 1: Verify Dev Server is Running

**Check if server is running:**
```bash
curl http://localhost:3009
```

**Expected Response:**
- HTML page content (server is working)
- "Connection refused" (server NOT running)

### Step 2: Check Current Port

**Find which port the server is using:**
```bash
# On Windows
netstat -ano | findstr :30

# On Mac/Linux
lsof -i :3000
lsof -i :3008
lsof -i :3009
```

**Common ports:**
- `:3000` - Next.js default
- `:3008` - Previous session
- `:3009` - Current session
- `:3010` - If conflicts occur

### Step 3: Start/Restart Dev Server

**If server not running:**
```bash
cd "C:\Users\Jonathan\Documents\clientportal"
npm run dev
```

**Wait for message:**
```
▲ Next.js 15.5.6
ready - started server on 0.0.0.0:3009
```

### Step 4: Access Correct URL

**Check your browser URL matches the server port:**

| Server | Access URL |
|--------|-----------|
| Running on :3000 | http://localhost:3000/designer/profile |
| Running on :3008 | http://localhost:3008/designer/profile |
| Running on :3009 | http://localhost:3009/designer/profile |

### Step 5: Hard Refresh Browser

**Clear cache and reload:**
- Windows: `Ctrl + Shift + Delete`
- Mac: `Cmd + Shift + Delete`
- Or: `Ctrl + F5` (Windows) / `Cmd + Shift + R` (Mac)

### Step 6: Try Upload Again

**Test file upload:**
1. Click "Upload Photo"
2. Select a small JPG (< 1MB)
3. Check if it works
4. Check browser console (F12) for errors

---

## Detailed Diagnostic Steps

### If Still Getting "Failed to fetch"

**Open Browser Console (F12):**

1. **Press F12** to open DevTools
2. **Go to Console tab**
3. **Look for errors** - should show:
   ```
   TypeError: Failed to fetch
   ```
4. **Go to Network tab**
5. **Try upload again**
6. **Look for `/api/upload` request**
   - If red/failed: Server not responding
   - If 500 error: Server error
   - If 404 error: Endpoint not found

### Check Server Status

**In your terminal/command prompt:**

```bash
# See if Node/npm is running
tasklist | findstr node

# Check which process uses port 3009
netstat -ano | findstr 3009

# Check server output
npm run dev
```

**Look for:**
- ✅ "ready - started server on..."
- ❌ "Failed to start server"
- ❌ "EADDRINUSE: address already in use"

### Clear Node Modules Cache

**If server won't start:**
```bash
cd "C:\Users\Jonathan\Documents\clientportal"
rm -rf .next node_modules
npm install
npm run dev
```

---

## Error Messages & Solutions

### Error: "Cannot connect to server"
**Meaning:** Dev server is not running or not accessible

**Solutions:**
1. Start dev server: `npm run dev`
2. Wait 5-10 seconds for server to fully start
3. Check URL matches port (localhost:3009)
4. Hard refresh browser (Ctrl+F5)

### Error: "File is too large"
**Meaning:** File exceeds 5MB limit

**Solution:**
- Reduce file size
- Use image compression tool
- Maximum: 5MB

### Error: "Invalid file type"
**Meaning:** File type not supported

**Supported:** JPG, PNG, WebP
**Not Supported:** PDF, DOCX, GIF, SVG

---

## Server Port Issues

### Port Already In Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3009
```

**Solution:**
```bash
# Find process using port
netstat -ano | findstr 3009

# Kill the process (replace PID with actual number)
taskkill /PID [PID] /F

# Or use a different port
PORT=3011 npm run dev
```

### Multiple Servers Running

**Check running servers:**
```bash
# List all Node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"}

# Or use netstat
netstat -ano | findstr 30
```

**Kill all Node processes:**
```bash
# Force kill all Node processes (be careful!)
taskkill /F /IM node.exe
```

---

## Network & CORS Issues

### CORS (Cross-Origin) Error

**If you see CORS error in console:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**This shouldn't happen in development, but if it does:**
1. Check API endpoint is `/api/upload` (same origin)
2. Verify no proxy is interfering
3. Check browser extensions (some block requests)

### Localhost Not Accessible

**If you get "Connection refused":**
1. Ensure dev server is running
2. Check firewall isn't blocking port
3. Try 127.0.0.1 instead of localhost
4. Restart computer if needed

---

## Browser-Specific Issues

### Chrome/Edge
```
Failed to fetch → Server not accessible
Check: F12 Console → Network tab → api/upload request
```

### Firefox
```
NetworkError when attempting to fetch resource
Check: Console → Network tab for failed requests
```

### Safari
```
Load failed → May need to enable cookie/storage
Check: Settings → Privacy → Allow storage
```

### Mobile Browser
```
Connection refused → May be DNS issue
Try: Use IP address (192.168.x.x) instead of localhost
```

---

## Step-by-Step Recovery Plan

### If Upload Fails:

**1. Check Server Status** (1 min)
```bash
# Can you access the page?
curl http://localhost:3009/designer/profile
```

**2. Check Console Errors** (2 min)
- Open browser DevTools (F12)
- Go to Console tab
- Look for red error messages
- Check Network tab for failed requests

**3. Verify Network Connection** (1 min)
- Try other websites
- Check WiFi/network status
- Restart WiFi if needed

**4. Restart Dev Server** (3 min)
```bash
# Kill old server
taskkill /F /IM node.exe

# Clear cache
rm -rf .next

# Start fresh
npm run dev
```

**5. Hard Refresh Browser** (1 min)
- Ctrl+F5 or Cmd+Shift+R
- Close and reopen browser tab
- Clear browser cache if needed

**6. Try Upload Again** (1 min)
- Click Upload Photo
- Select small test file
- Check console for new errors

---

## Testing Checklist

- [ ] Dev server is running (`npm run dev`)
- [ ] Server shows "ready on" message
- [ ] Browser can access http://localhost:3009/designer/profile
- [ ] No CORS errors in console
- [ ] No 500 errors in Network tab
- [ ] File is JPG or PNG (not PDF/DOCX)
- [ ] File size is under 5MB
- [ ] Browser has permission to access files
- [ ] Network connection is stable

---

## Advanced Debugging

### Enable Verbose Logging

**Add to your upload handler (temporary):**
```typescript
try {
  console.log("Starting upload for file:", file.name);
  const formData = new FormData();
  formData.append("file", file);

  console.log("Sending request to /api/upload");
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  console.log("Response status:", response.status);
  const data = await response.json();
  console.log("Response data:", data);
  // ... rest of code
} catch (error: any) {
  console.error("Upload failed:", error);
  console.error("Error message:", error.message);
  console.error("Error stack:", error.stack);
}
```

### Monitor Network Requests

**In DevTools Network Tab:**
1. Open F12 → Network tab
2. Click Upload Photo
3. Watch for `/api/upload` request
4. Check:
   - **Status**: Should be 200 (success)
   - **Type**: Should be `fetch`
   - **Size**: Should show response data
   - **Time**: Usually < 1 second

### Check Server Logs

**Terminal shows:**
```
POST /api/upload 200 in 234ms
```

If not showing:
- Request didn't reach server
- Network/CORS issue
- Wrong port

---

## When to Report Issues

**Gather this information:**
1. Error message (exact text)
2. Browser type & version
3. Operating system
4. Server port (from terminal)
5. Network setup (WiFi, VPN, etc.)
6. Console errors (screenshot)
7. Network tab errors (screenshot)

**Then check:**
1. Is the .next folder present?
2. Is node_modules folder complete?
3. Are there recent code changes?
4. Did it work before? When?

---

## Quick Reference

| Issue | Command | Expected |
|-------|---------|----------|
| Check server | `curl http://localhost:3009` | HTML response |
| Start server | `npm run dev` | "ready on..." message |
| Kill server | `taskkill /F /IM node.exe` | Process terminated |
| Clear build | `rm -rf .next` | Folder deleted |
| Check port | `netstat -ano \| findstr 3009` | Process ID shown |

---

## Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Browser DevTools:** F12 in any browser
- **Network Debugging:** Chrome DevTools Network tab
- **Port Checking:** `netstat -ano` on Windows

---

## Summary

**"Failed to fetch" usually means:**
1. Dev server not running
2. Server on wrong port
3. Network connectivity issue
4. Browser can't reach localhost

**Quick Fix:**
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Clean rebuild
rm -rf .next

# Start fresh
npm run dev

# Hard refresh browser
# Then try upload again
```

**Expected result:** File uploads successfully, green success message appears.

---

Last Updated: November 9, 2025
Status: Ready for Troubleshooting
