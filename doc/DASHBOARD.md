# Dashboard Page Documentation

## Overview

The dashboard page (`/dashboard`) is a protected route that authenticated users see after logging in. It provides a user-friendly interface with statistics, quick links, and activity tracking.

## Features

### 1. Authentication Check
- Automatically redirects unauthenticated users to `/login`
- Checks `tokenStorage.isAuthenticated()` on page load
- Shows loading state while verifying authentication

### 2. Navigation Header
- **FYC Logo** - Top-left branding
- **User Display** - Shows current username (placeholder for now)
- **Logout Button** - Clears tokens and redirects to login page

### 3. Dashboard Statistics Cards
Three stat cards displaying:
- **Total Users** - Blue card with user icon
- **Recent Activity** - Green card with activity icon
- **Account Status** - Purple card showing "Active" status

Each card includes:
- Icon with color-coded background
- Metric label
- Value/status display
- Responsive grid layout (1 col mobile, 2 cols tablet, 3 cols desktop)

### 4. Quick Links Section
Four quick navigation cards:
- Profile
- Settings
- Help
- Documentation

Hover effect for better UX, responsive grid layout

### 5. Recent Activity Section
Shows placeholder for activity log
- Ready to display user activities when backend is integrated
- Clean, centered message when no activity

## Styling

- **Framework**: Tailwind CSS v4
- **Color Scheme**: 
  - Light mode: White cards on light gray background
  - Dark mode: Zinc-900 cards on black background
- **Responsive**: Mobile-first design with breakpoints
- **Icons**: SVG icons with 2px stroke width

## File Structure

```
app/
├── dashboard/
│   └── page.tsx          # Main dashboard component
├── login/
│   └── page.tsx          # Login page
├── api/
│   └── auth/
│       └── login/
│           └── route.ts  # Login API handler
└── utils/
    └── tokenStorage.ts   # Token management
```

## Security

✅ **Protected Route**
- Requires valid `access_token` in localStorage
- Redirects to login if not authenticated
- Token check happens on page load

## Component Structure

```typescript
DashboardPage
├── useEffect (auth check)
├── handleLogout function
├── Loading state (spinner)
├── Navigation header
│   ├── FYC branding
│   ├── User display
│   └── Logout button
├── Main content
│   ├── Welcome section
│   ├── Stats cards grid
│   ├── Quick links section
│   └── Recent activity section
```

## States

1. **Loading** - Shows spinner while checking authentication
2. **Unauthenticated** - Redirects to `/login` if no token
3. **Authenticated** - Shows dashboard with full content

## Integration Points

### Current Implementation (Placeholder)
```typescript
// TODO: Fetch user profile from backend
// This would typically call an endpoint like GET /api/users/me
```

### To Be Implemented

1. **Fetch User Profile**
   ```typescript
   useEffect(() => {
     const fetchUser = async () => {
       const response = await authenticatedFetch('/api/users/me');
       const userData = await response.json();
       setUser(userData);
     };
     fetchUser();
   }, []);
   ```

2. **Fetch Dashboard Statistics**
   ```typescript
   const fetchStats = async () => {
     const response = await authenticatedFetch('/api/dashboard/stats');
     const stats = await response.json();
     setStats(stats);
   };
   ```

3. **Fetch Recent Activity**
   ```typescript
   const fetchActivity = async () => {
     const response = await authenticatedFetch('/api/dashboard/activity');
     const activities = await response.json();
     setActivities(activities);
   };
   ```

## Usage

### Access Dashboard
```
URL: http://localhost:3000/dashboard
```

### Logout
Click the "Logout" button in the top-right corner to:
1. Clear tokens from localStorage
2. Redirect to login page

## Customization

### Change Logo
Replace the text "FYC" in the navigation header

### Modify Statistics
Update the stat cards by changing:
- Card title
- Initial value (currently "--")
- Icon SVG
- Background color class

### Add Quick Links
Add more cards to the quick links section by duplicating the card structure

## Accessibility

- Proper heading hierarchy (h1, h2, h3)
- Semantic HTML elements
- Focus states on buttons
- Clear contrast in light and dark modes
- SVG icons with stroke for visibility

## Performance

- Client-side component (`'use client'`)
- No external API calls on mount (currently)
- Efficient re-renders with proper dependencies
- Lazy loading ready

## Future Enhancements

- [ ] Real user profile data
- [ ] Dynamic statistics from backend
- [ ] Activity feed integration
- [ ] User preferences/settings modal
- [ ] Notification system
- [ ] Role-based access control
- [ ] Analytics dashboard
- [ ] Export data functionality

