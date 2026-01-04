# HttpOnly Cookies Implementation

## Overview

The application now uses **HttpOnly cookies** for storing JWT authentication tokens instead of returning them in the response body. This provides enhanced security by preventing XSS (Cross-Site Scripting) attacks from accessing authentication tokens via JavaScript.

## Security Benefits

✅ **HttpOnly Flag**: Prevents JavaScript from accessing the token (XSS protection)  
✅ **Secure Flag**: Only sent over HTTPS in production  
✅ **SameSite=Lax**: Provides CSRF (Cross-Site Request Forgery) protection  
✅ **Token Rotation**: Access tokens expire in 15 minutes, refresh tokens in 7 days  

## Configuration

### Backend Settings (config.py)

```python
# Cookie Configuration
SECURE_COOKIE: bool = False  # Set to True in production (requires HTTPS)
COOKIE_DOMAIN: Optional[str] = None  # None for same-origin only
ACCESS_COOKIE_MAX_AGE: int = 15 * 60  # 15 minutes in seconds
REFRESH_COOKIE_MAX_AGE: int = 7 * 24 * 60 * 60  # 7 days in seconds
COOKIE_SAMESITE: str = "lax"  # CSRF protection
```

**For Production**: Set `SECURE_COOKIE=True` in `.env`

## API Endpoints

### POST /auth/login

**Request:**
```json
{
    "username_or_email": "user@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "message": "Login successful",
    "user_id": 1,
    "email": "user@example.com"
}
```

**Cookies Set** (HttpOnly, SameSite=Lax):
- `access_token`: JWT token (expires in 15 minutes)
- `refresh_token`: JWT token (expires in 7 days)

---

### POST /auth/refresh

**Request:** (No body needed, uses refresh_token cookie automatically)

**Response:**
```json
{
    "message": "Token refreshed successfully",
    "user_id": 1,
    "email": "user@example.com"
}
```

**Cookies Updated:**
- `access_token`: New JWT token (expires in 15 minutes)
- `refresh_token`: New JWT token (expires in 7 days)

---

### POST /auth/logout

**Request:** (No body needed)

**Response:**
```json
{
    "message": "Successfully logged out"
}
```

**Cookies Cleared:**
- Both `access_token` and `refresh_token` are deleted

---

## Frontend Integration (Next.js)

### Login Example

```typescript
// pages/login.tsx
async function handleLogin(email: string, password: string) {
    const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        credentials: 'include',  // ✅ CRITICAL: Include cookies
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username_or_email: email,
            password: password,
        }),
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        // Redirect to dashboard
        router.push('/dashboard');
    } else {
        const error = await response.json();
        console.error('Login failed:', error.detail);
    }
}
```

### Fetch with Cookies

All API requests to protected endpoints **must** include `credentials: 'include'`:

```typescript
// Example: Fetch user data
async function getUserData() {
    const response = await fetch('http://localhost:8000/users/me', {
        method: 'GET',
        credentials: 'include',  // ✅ Automatically includes cookies
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 401) {
        // Token expired, try to refresh
        await refreshToken();
        // Retry the request
        return getUserData();
    }

    return response.json();
}
```

### Refresh Token Handling

```typescript
// utils/api.ts - Centralized API client with auto-refresh
async function apiCall(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    let response = await fetch(url, {
        ...options,
        credentials: 'include',  // ✅ Include cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    // If 401, try to refresh token
    if (response.status === 401) {
        const refreshResponse = await fetch(
            'http://localhost:8000/auth/refresh',
            {
                method: 'POST',
                credentials: 'include',
            }
        );

        if (refreshResponse.ok) {
            // Retry original request with new token
            response = await fetch(url, {
                ...options,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });
        } else {
            // Refresh failed, redirect to login
            window.location.href = '/login';
        }
    }

    return response;
}
```

### Logout Example

```typescript
// pages/dashboard.tsx
async function handleLogout() {
    const response = await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        credentials: 'include',  // ✅ Include cookies
    });

    if (response.ok) {
        // Cookies are cleared by the server
        router.push('/login');
    }
}
```

### Context API for Auth State (Optional)

```typescript
// context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    userId: number | null;
    email: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    const login = async (username_or_email: string, password: string) => {
        const response = await fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username_or_email, password }),
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        setIsAuthenticated(true);
        setUserId(data.user_id);
        setEmail(data.email);
    };

    const logout = async () => {
        await fetch('http://localhost:8000/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });

        setIsAuthenticated(false);
        setUserId(null);
        setEmail(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userId, email, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
```

## CORS Configuration

The backend CORS is now configured to support cookies:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Explicit origins required
    allow_credentials=True,  # ✅ Enables cookie support
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Important:** When using credentials, `allow_origins` cannot be `["*"]`. Origins must be explicitly listed in `ALLOWED_HOSTS`.

## Environment Variables

### Development

```env
# .env
SECURE_COOKIE=false
COOKIE_DOMAIN=
ALLOWED_HOSTS=http://localhost:3000,http://localhost:8000
```

### Production

```env
# .env.production
SECURE_COOKIE=true
COOKIE_DOMAIN=.yourdomain.com
ALLOWED_HOSTS=https://yourdomain.com,https://www.yourdomain.com
```

## Testing with cURL

```bash
# Login
curl -c cookies.txt \
  -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email": "user@example.com", "password": "password123"}'

# Use stored cookies for authenticated request
curl -b cookies.txt \
  -X GET http://localhost:8000/users/me

# Refresh token
curl -b cookies.txt \
  -X POST http://localhost:8000/auth/refresh

# Logout
curl -b cookies.txt \
  -X POST http://localhost:8000/auth/logout
```

## Testing with Postman

1. **Settings** → **General** → Enable **Automatically follow redirects** and **Preserve cookies**
2. **POST** to `/auth/login`
3. Postman will automatically manage cookies for subsequent requests
4. **POST** to `/auth/refresh` to get new tokens
5. **POST** to `/auth/logout` to clear cookies

## Troubleshooting

### Cookies Not Being Set

**Issue:** Cookies not appearing in browser  
**Solution:** 
- Ensure frontend uses `credentials: 'include'` in fetch requests
- Check CORS configuration allows the frontend origin
- In development, `SECURE_COOKIE=false` allows non-HTTPS cookies
- Check browser console for CORS errors

### 401 Unauthorized on Protected Endpoints

**Issue:** Getting 401 even after login  
**Solution:**
- Verify cookies are sent with each request (`credentials: 'include'`)
- Check if access token expired (15 min default)
- Implement token refresh logic
- Verify `get_current_user` dependency is applied to routes

### "Not authenticated - missing access token"

**Issue:** Token cookie not found  
**Solution:**
- Ensure login was successful (check login response)
- Verify cookies are being sent (`credentials: 'include'`)
- Check browser DevTools → Application → Cookies
- Clear cookies and login again

## Security Checklist

- ✅ HttpOnly flag prevents JavaScript access
- ✅ Secure flag (production only) forces HTTPS
- ✅ SameSite=Lax prevents CSRF attacks
- ✅ Token expiration (15 min access, 7 day refresh)
- ✅ Token revocation via Redis
- ✅ CORS restricted to specific origins
- ✅ Passwords hashed with bcrypt (max 72 bytes)
- ✅ Tokens stored in Redis for revocation tracking

## Additional Resources

- [OWASP: Cross-Site Scripting (XSS)](https://owasp.org/www-community/attacks/xss/)
- [OWASP: Cross-Site Request Forgery (CSRF)](https://owasp.org/www-community/attacks/csrf)
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [FastAPI: Security](https://fastapi.tiangolo.com/tutorial/security/)

