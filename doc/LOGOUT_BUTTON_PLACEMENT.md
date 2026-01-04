# Logout Button Placement Guide 📍

## Overview

The logout button has been strategically placed on authenticated pages, NOT on the public landing/home page. This provides better UX and clearer navigation flows.

## Button Placement Strategy

### **Landing/Home Page** (`/app/page.tsx`)
✅ **Shows:** Login button only
❌ **Does NOT show:** Logout button

**Reason:**
- Landing page is public and meant for new visitors
- Logged-in users should go to Dashboard for full features
- Keeps landing page focused on onboarding

### **Dashboard Page** (`/app/dashboard/page.tsx`)
✅ **Shows:** Logout button in navigation
✅ **Shows:** Desktop nav + Mobile hamburger menu
✅ **Shows:** Mobile logout in menu

**Reason:**
- Authenticated users spend time here
- Easy access to logout from main workspace
- Already has hamburger menu on mobile with logout option

### **Other Protected Pages** (Future)
When you create these pages, add logout to:
- `/profile` - User profile page
- `/settings` - Settings page
- `/birds` - Birds management page
- `/breeders` - Breeders management page

## User Flow

```
┌─────────────────────────┐
│  Landing Page (/)       │
│  [Login Button]         │
└────────────┬────────────┘
             │
             ▼ (Click Login)
┌─────────────────────────┐
│  Login Page (/login)    │
│  [Sign In Form]         │
└────────────┬────────────┘
             │
             ▼ (Successful Login)
┌─────────────────────────┐
│  Dashboard (/dashboard) │
│  [Logout Button] ✓      │
│  [User Menu]     ✓      │
└─────────────────────────┘
             │
             ▼ (Click Logout)
┌─────────────────────────┐
│  Login Page (/login)    │
│  [Sign In Form]         │
└────────────┬────────────┘
             │
             ▼ (Can click back to home)
┌─────────────────────────┐
│  Landing Page (/)       │
│  [Login Button]         │
└─────────────────────────┘
```

## Navigation Bar Changes by Page

| Page | Button(s) | Location | Mobile |
|------|-----------|----------|--------|
| Landing (`/`) | Login | Top right | Top right |
| Login (`/login`) | None | N/A | N/A |
| Dashboard (`/dashboard`) | Logout | Desktop + Menu | Hamburger menu |
| Profile (`/profile`) | Logout | Top right | Hamburger menu |
| Settings (`/settings`) | Logout | Top right | Hamburger menu |

## Implementation Details

### Landing Page
```typescriptreact
// Always shows Login button
<Button colorScheme="blue" onClick={() => router.push("/login")}>
  Login
</Button>
```

### Dashboard Page (Already Implemented)
```typescriptreact
// Shows Logout button when authenticated
<Button colorScheme="red" onClick={handleLogout}>
  Logout
</Button>
```

## Why This Approach?

✅ **Clear User Intent**
- Landing page = Entry point (Login)
- Dashboard = Exit point (Logout)

✅ **Better UX**
- Users aren't confused by seeing logout on public pages
- Natural flow: Landing → Login → Dashboard → Logout

✅ **Consistent Navigation**
- All authenticated pages have logout
- Public pages don't

✅ **Mobile Friendly**
- Dashboard has hamburger menu with logout
- Easy access on small screens

## Testing

### Landing Page (`/`)
1. Not logged in: See "Login" button ✓
2. After login: Redirects to Dashboard
3. No logout button on landing page ✓

### Dashboard (`/dashboard`)
1. Must be logged in to access
2. See "Logout" button ✓
3. Click logout → Redirected to login

### Flow Test
1. Start at home (/) - see "Login"
2. Click Login → Goes to /login
3. Login with credentials → Redirected to /dashboard
4. See Logout button ✓
5. Click Logout → Back to /login
6. Can click home → See "Login" button again ✓

## Future Considerations

When adding more pages:
1. **Public Pages** - Show "Login" button
2. **Protected Pages** - Show "Logout" button
3. **Reusable Header Component** - Create a header that takes `isProtected` prop

Example:
```typescriptreact
<Header isProtected={true} />  // Shows Logout
<Header isProtected={false} /> // Shows Login
```

---

This design provides the cleanest UX with logout buttons only where they're needed! 🎯

