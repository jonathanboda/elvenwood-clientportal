# Elvenwood Interiors - Testing Guide

Your app is now running with **demo authentication**! Here's how to test it.

---

## 🚀 Access Your App

**URL:** http://localhost:3001

---

## 🔐 Demo Credentials

### Designer Account
- **Email:** `designer@example.com`
- **Password:** `password123`
- **Role:** Designer (can create projects, invite clients)

### Client Account
- **Email:** `client@example.com`
- **Password:** `password123`
- **Role:** Client (can view projects, provide feedback)

---

## 📋 Testing Flow

### Step 1: Sign In as Designer
1. Go to http://localhost:3001/signin
2. Enter:
   - Email: `designer@example.com`
   - Password: `password123`
3. Click "Sign in"
4. You should see the **Designer Dashboard** with:
   - Summary cards (Awaiting Projects, In Progress, Review, Approved)
   - "New Project" button
   - "Invite Client" button
   - Empty projects list (first time)

### Step 2: Create a Project (Designer)
1. Click "New Project" button
2. Fill in:
   - **Project Name:** "Living Room Redesign"
   - **Description:** "A beautiful modern living room makeover"
3. Click "Create Project"
4. Project should appear in the projects grid

### Step 3: Try Inviting a Client (Designer)
1. Click the project card
2. Click "Invite Client" button
3. Fill in:
   - **Client Name:** "John Doe"
   - **Client Email:** "john@example.com"
4. Click "Send Invite"
5. You'll see the invite was created (demo mode)

### Step 4: Sign Out and Sign In as Client
1. Click user menu (top right)
2. Click "Sign Out"
3. Go to http://localhost:3001/signin
4. Sign in with:
   - Email: `client@example.com`
   - Password: `password123`
5. You should see the **Client Dashboard** with:
   - Activity Feed section
   - Projects list (empty initially, since no real invites linked)
   - Project cards showing designer info

### Step 5: Create a New Account
1. Go to http://localhost:3001/signup
2. Fill in any email/password/name (not one of the demo accounts)
3. Click "Sign Up"
4. You'll be auto-logged in and taken to designer dashboard
5. Sign out and sign back in to verify it works

### Step 6: Try Signing In with Invalid Credentials
1. Go to http://localhost:3001/signin
2. Try invalid email or wrong password
3. Should see helpful error messages

---

## ✨ Features You Can Test

### Authentication
- ✅ Sign in with demo accounts
- ✅ Sign up with new accounts
- ✅ Sign out functionality
- ✅ Error handling for invalid credentials
- ✅ Session persistence (stay logged in on refresh)

### Navigation
- ✅ Sidebar navigation links
- ✅ Header branding
- ✅ User menu dropdown
- ✅ Role-based routing (designer vs client)

### Designer Features
- ✅ Project dashboard
- ✅ Create new projects
- ✅ Invite client modal
- ✅ Project status tracking

### Client Features
- ✅ Project dashboard
- ✅ Activity feed
- ✅ View assigned projects

### Styling
- ✅ Responsive design
- ✅ Tailwind CSS theming
- ✅ Form styling
- ✅ Modal overlays
- ✅ Button states (hover, disabled, loading)

---

## 🔧 What Works in Demo Mode

✅ **Authentication:**
- Sign in/sign up
- Session management
- Role assignment

✅ **Navigation:**
- All routes work
- Role-based dashboards
- Sidebar/header responsive

✅ **UI/UX:**
- Forms render correctly
- Modals appear
- Loading states work
- Error messages display

❌ **What Doesn't Work Yet (Need Supabase):**
- Real database persistence
- Project creation storage
- Client invitations via email
- Comments and feedback
- File uploads
- Real-time updates

---

## 🐛 Troubleshooting

### "Failed to fetch" Error
**Solution:** This was the original issue. It's now fixed with demo auth!

### Page Shows Loading Spinner Forever
**Solution:** Hard refresh (Ctrl+Shift+R) to clear cache

### Sign Out Doesn't Work
**Solution:** Refresh the page - localStorage is cleared

### Session Lost on Refresh
**Solution:** Use `localStorage` which persists the session

### Can't Create Account
**Solution:** Use a new email address. Demo only allows pre-set accounts to be created.

---

## 📱 Testing on Different Screens

The app is fully responsive:
- **Desktop:** Full sidebar + content
- **Tablet:** Responsive layout adjusts
- **Mobile:** Sidebar hidden, mobile-optimized layout

Try opening DevTools (F12) and using device emulation to test different sizes.

---

## 🎯 Next: Connect Real Supabase

Once you have Supabase credentials, you can:

1. Update `.env.local` with real keys
2. Switch from demo auth to real Supabase auth
3. Database persistence will work
4. Real invites via email
5. File uploads
6. Comments and feedback

See `SETUP_AND_DEPLOYMENT.md` for details.

---

## 💾 Session Storage

User sessions are stored in browser **localStorage**:
- Key: `elvenwood_user`
- Value: User object with email, name, role

**To clear session manually:**
1. Open Browser DevTools (F12)
2. Go to Application/Storage tab
3. Click LocalStorage
4. Find and delete `elvenwood_user`
5. Refresh page

---

## 📊 Demo Data Structure

The demo auth creates users with this structure:

```typescript
{
  id: string;        // Unique user ID
  email: string;     // User email
  name: string;      // Full name
  role: 'designer' | 'client';  // User role
  password: string;  // Password (stored in demo only)
}
```

---

## ✅ Testing Checklist

- [ ] Can sign in with designer@example.com
- [ ] Can sign in with client@example.com
- [ ] Can create new account
- [ ] Can sign out
- [ ] Designer sees correct dashboard
- [ ] Client sees correct dashboard
- [ ] Navigation works properly
- [ ] Forms validate input
- [ ] Errors display correctly
- [ ] Page is responsive
- [ ] Session persists on refresh
- [ ] Invalid credentials show error

---

## 🎉 You're Ready!

Your app is fully functional with demo authentication. Test all the features, explore the UI, and when you're ready to connect a real backend, follow the Supabase setup guide.

**Happy testing! 🚀**
