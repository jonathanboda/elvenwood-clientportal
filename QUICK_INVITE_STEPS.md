# Quick Invite Client - 5 Minute Guide

**Goal:** Invite a client to view your designer project
**Time:** 5 minutes
**Dev Server:** http://localhost:3008

---

## The 5 Steps

### 1️⃣ Go to Designer Dashboard
```
http://localhost:3008/dashboard
↓
Sign in with designer account
↓
See your projects listed
```

### 2️⃣ Find Your Project
```
Look at the project list
↓
Find the project you want to share
↓
You'll see project cards with info
```

### 3️⃣ Click Project Menu
```
On the project card, look for ⋮ (three dots)
↓
OR right-click on project
↓
Menu appears with options
```

### 4️⃣ Click "Invite Client"
```
Click "Invite Client" from menu
↓
Modal dialog opens
↓
Ready to enter client info
```

### 5️⃣ Enter Client Details & Send
```
Email: client@example.com
Message: (optional) "Please review the design"
↓
Click "Send Invitation"
↓
Success! ✅
```

---

## Visual Flow

```
Dashboard
    ↓
[Project Card] ← Click ⋮ menu
    ↓
[Context Menu]
    └─ Invite Client ← Click here
    ↓
[Invite Modal]
    ├─ Email: _____________
    ├─ Message: _____________
    └─ [Send Invitation] ← Click
    ↓
Success Message ✅
Modal Auto-Closes
```

---

## Where to Click

### Designer Dashboard
- You see project cards
- Each project has a menu icon (⋮) in the corner
- Click that icon to see options

### Project Menu Options
- Invite Client ← This one
- View Project
- Edit Project
- Delete Project

### Invite Modal Dialog
1. **Email field** - Enter client's email
2. **Message field** - Add optional note
3. **Send Invitation button** - Click to send

---

## Example Flow

### Your Dashboard:
```
┌─────────────────────────────────┐
│ Designer Dashboard              │
├─────────────────────────────────┤
│ Projects:                       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Living Room Design      [⋮] │ ← Click here
│ │ Status: In Progress         │ │
│ │ Client: Not assigned        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Kitchen Remodel         [⋮] │ │
│ │ Status: Draft               │ │
│ │ Client: Not assigned        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### After Clicking ⋮:
```
┌─────────────────────────────────┐
│ Project Menu                    │
├─────────────────────────────────┤
│ • View Project                  │
│ • Edit Project                  │
│ • Invite Client         ← Click │
│ • Delete Project                │
└─────────────────────────────────┘
```

### Invite Modal Opens:
```
┌─────────────────────────────────┐
│ Invite Client to Project        │
├─────────────────────────────────┤
│ Project: Living Room Design     │
│                                 │
│ Client Email:                   │
│ [client@example.com]            │
│                                 │
│ Invitation Message (Optional):  │
│ ┌───────────────────────────┐   │
│ │ Please review the       │   │
│ │ initial color scheme    │   │
│ │                         │   │
│ └───────────────────────────┘   │
│                                 │
│ ℹ️ Client will receive email    │
│    with link to view designs    │
│                                 │
│ [Cancel]  [Send Invitation]     │
└─────────────────────────────────┘
```

### Success Message:
```
┌─────────────────────────────────┐
│ ✅ Invitation sent successfully!│
│                                 │
│ An invitation email has been    │
│ sent to client@example.com      │
│                                 │
│ [Close]                         │
└─────────────────────────────────┘
```

---

## What Happens Next

### For You (Designer):
- ✅ Client email recorded
- ✅ Project linked to client
- ✅ Ready for next steps

### For Client:
1. 📧 Receives email with invitation
2. 🔗 Email contains link to view designs
3. 👁️ Clicks link and sees Client Portal
4. 💬 Can view your design and comment
5. 📝 Provides feedback

---

## Keyboard Shortcuts (Optional)

**Desktop:**
- Tab to navigate inputs
- Enter to submit form
- Escape to close modal

**Mobile:**
- Tap email field
- Type email
- Tap message field (optional)
- Tap "Send Invitation"

---

## Common Questions

### Q: Where do I find the project menu?
**A:** Look for the ⋮ (three dots) icon on the project card. It's usually in the top-right corner.

### Q: Do I have to include a message?
**A:** No, the message is optional. But it's helpful to explain context.

### Q: What email should I use?
**A:** Use the client's actual email address. They'll receive the invitation there.

### Q: What if I enter wrong email?
**A:** Just send the invitation again with the correct email. You can send multiple invitations for the same project.

### Q: How does client see the design?
**A:** Client receives email with link. Clicking the link takes them to Client Portal where they can view and comment.

---

## Try It Now!

### Ready to Invite?

1. Open: **http://localhost:3008/dashboard**
2. Sign in (if not already)
3. Find a project
4. Click ⋮ menu
5. Click "Invite Client"
6. Enter email: **testclient@example.com**
7. Add message: **"Please review this design"**
8. Click "Send Invitation"
9. ✅ Done!

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't find menu icon | Look for ⋮ or right-click project |
| Modal won't open | Make sure you clicked "Invite Client" |
| Email field won't accept input | Check email format has @ symbol |
| Button disabled | Fill in email first, message is optional |
| Email bounces | Check client's email is correct |

---

## Next: What Client Sees

Once client receives the email:

1. Client clicks link
2. Client sees **Client Portal**
3. Can view your designs
4. Can add comments
5. Can request changes
6. You get notified

Then you can make updates and send updated designs!

---

## Summary

```
You:  "Check out my design!"
      (Click Invite Client)
      ↓
Client: "Looks good, but change the color"
        (Views design & comments)
      ↓
You:  "Updated! Take another look"
      (Send updated designs)
      ↓
Client: "Perfect! Let's do it"
        (Approves design)
      ↓
You: "Awesome! Let's schedule installation"
```

---

**That's it! You can now invite clients to view your designs. 🎉**

---

For more details: See **INVITE_CLIENT_GUIDE.md**

