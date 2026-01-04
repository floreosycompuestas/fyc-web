# Console Logging Guide ✅
## Understanding console.log()
Frontend `console.log()` statements **do NOT print to your terminal**. They print to the **browser's developer console**.
---
## Where to View Console Logs
### 1. Browser Developer Console (Easiest)
**Chrome/Chromium:**
```
1. Open your app in browser (http://localhost:3000)
2. Press F12 (or Ctrl+Shift+I / Cmd+Option+I)
3. Click the "Console" tab
4. You'll see all console.log() output there
```
**Firefox:**
```
1. Open your app in browser
2. Press F12
3. Click the "Console" tab
4. View all logs
```
**Safari:**
```
1. Open your app in browser
2. Press Cmd+Option+I
3. Click the "Console" tab
4. View all logs
```
### 2. Backend Terminal (Server Logs)
If you want to see logs in the **terminal**, use backend logs:
**Python (FastAPI):**
```python
# In your backend code
print("This will show in the terminal where you ran: uvicorn app.main:app")
import logging
logging.info("This is an info log")
```
**To see backend logs:**
```bash
# Run backend with logging visible
cd /home/rgrullon/projects/fyc/api
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
---
## Current Setup Explained
### Frontend Console Logs (Dashboard)
In `/app/dashboard/page.tsx`:
```typescript
useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // ← If you add: console.log('User data:', userData);
        // ← This will print to BROWSER CONSOLE, not terminal
      } else {
        console.error('Failed to fetch user profile:', response.status);
        // ← This prints to browser console
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // ← This prints to browser console
    } finally {
      setIsLoading(false);
    }
  };
  fetchUserProfile();
}, []);
```
---
## How to Debug the Dashboard
### Step 1: Open Browser Console
```
1. Visit http://localhost:3000/dashboard
2. Press F12
3. Click "Console" tab
4. You'll see:
   - "Fetched user data: {...}" (if fetch succeeds)
   - "Failed to fetch user profile: 401" (if fetch fails)
   - "Error fetching user profile: ..." (if error occurs)
```
### Step 2: Check the Network Tab
```
1. Press F12
2. Click "Network" tab
3. Reload page (F5)
4. Look for GET /api/auth/me request
5. Check:
   - Status: 200 = success, 401 = not authenticated
   - Response: Should show user data
   - Headers: Should show cookies being sent
```
### Step 3: Check the Application Tab
```
1. Press F12
2. Click "Application" tab
3. Look for Cookies section
4. Check that access_token and refresh_token are there (HttpOnly)
```
---
## Adding Debugging to Your Code
### Option 1: Console Logs (Browser)
```typescript
useEffect(() => {
  const fetchUserProfile = async () => {
    console.log('🚀 Starting to fetch user profile...');
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('📡 Response status:', response.status);
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User data fetched:', userData);
        setUser(userData);
      } else {
        console.error('❌ Failed to fetch user profile:', response.status);
      }
    } catch (error) {
      console.error('💥 Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  fetchUserProfile();
}, []);
```
### Option 2: Browser DevTools Debugger
```typescript
useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      debugger;  // ← Execution pauses here when console is open
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      debugger;  // ← Check response here
      const userData = await response.json();
      debugger;  // ← Check userData here
      setUser(userData);
    } catch (error) {
      debugger;  // ← Check error here
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  fetchUserProfile();
}, []);
```
---
## Common Issues & Solutions
### Issue 1: User data shows as null/undefined
```
❌ Problem: User data is not being fetched
✅ Solution:
  1. Open browser console (F12)
  2. Look for "Failed to fetch user profile: 401"
  3. This means backend is returning 401 (not authenticated)
  4. Check if you're logged in
  5. Check cookies in Application tab
```
### Issue 2: "Failed to fetch" error
```
❌ Problem: Network error
✅ Solution:
  1. Check Network tab (F12 > Network)
  2. Look for failed requests
  3. Check CORS errors
  4. Verify backend is running on port 8000
  5. Check if /api/auth/me endpoint exists
```
### Issue 3: Cookies not being sent
```
❌ Problem: Cookies not in request
✅ Solution:
  1. Check Application tab (F12 > Application > Cookies)
  2. Make sure access_token exists
  3. Make sure refresh_token exists
  4. Check if they're HttpOnly (should show "HttpOnly" in table)
  5. Verify fetch has: credentials: 'include'
```
---
## Best Practices
✅ **Use console.log for debugging**
```typescript
console.log('Variable value:', myVar);
```
✅ **Use console.error for errors**
```typescript
console.error('Error message:', error);
```
✅ **Use console.warn for warnings**
```typescript
console.warn('Warning message:', data);
```
✅ **Use console.table for objects**
```typescript
console.table(userData);  // Shows in table format
```
✅ **Use debugger for step-through debugging**
```typescript
debugger;  // Pauses execution when console is open
```
---
## Terminal Output for Frontend
**Cannot print to terminal from browser code.**
BUT if you want terminal output, you can:
### Option 1: Add backend logging
```python
# In FastAPI endpoint
@router.get("/me")
async def get_current_user_info(current_user: TokenData = Depends(get_current_user)):
    print(f"🔍 Fetching user info for: {current_user.email}")
    print(f"👤 User ID: {current_user.user_id}")
    return {
        "user_id": current_user.user_id,
        "email": current_user.sub,
        "authenticated": True,
    }
```
Then run backend with:
```bash
cd /home/rgrullon/projects/fyc/api
uvicorn app.main:app --reload
```
**Output in terminal:**
```
🔍 Fetching user info for: user@example.com
👤 User ID: 123
```
### Option 2: Check Next.js server logs
```bash
# Run Next.js in development
cd /home/rgrullon/projects/fyc/web/fyc-web
npm run dev
```
Server logs will show in terminal, but **client-side logs won't**.
---
## Summary
| Log Location | How to View |
|---|---|
| Frontend console.log() | Browser DevTools (F12 > Console) |
| Backend print() | Terminal where backend is running |
| Network requests | Browser DevTools (F12 > Network) |
| Cookies | Browser DevTools (F12 > Application > Cookies) |
| Server logs | Terminal where Next.js/Node is running |
✅ **Always use Browser DevTools (F12) for frontend debugging!**
