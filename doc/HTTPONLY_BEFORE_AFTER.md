# HttpOnly Cookies - Before & After Code Comparison

## 1. Authentication Flow - Backend Auth Router

### ❌ BEFORE: Bearer Token Approach

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Login returns tokens in response body"""
    # ... validation code ...
    
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})

    # ❌ Tokens exposed in response - client must store them
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/refresh")
async def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Refresh using Authorization header"""
    token = credentials.credentials
    # ... validation code ...
    
    # ❌ Tokens exposed in response again
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }

@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout using Authorization header"""
    token = credentials.credentials
    if revoke_token(token):
        return {"message": "Successfully logged out"}
```

### ✅ AFTER: HttpOnly Cookies

```python
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response

router = APIRouter(prefix="/auth", tags=["auth"])

def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Set HttpOnly cookies - tokens NOT exposed to client"""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,      # ✅ XSS Protection
        secure=settings.SECURE_COOKIE,  # ✅ HTTPS only
        samesite=settings.COOKIE_SAMESITE,  # ✅ CSRF Protection
        max_age=settings.ACCESS_COOKIE_MAX_AGE,
        domain=settings.COOKIE_DOMAIN,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,      # ✅ XSS Protection
        secure=settings.SECURE_COOKIE,  # ✅ HTTPS only
        samesite=settings.COOKIE_SAMESITE,  # ✅ CSRF Protection
        max_age=settings.REFRESH_COOKIE_MAX_AGE,
        domain=settings.COOKIE_DOMAIN,
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Login sets tokens as HttpOnly cookies"""
    # ... validation code ...
    
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})

    # ✅ Create response and set cookies
    response = Response(content='', status_code=status.HTTP_200_OK)
    _set_auth_cookies(response, access_token, refresh_token)
    
    # ✅ Only user data in response, NO tokens
    import json
    response.body = json.dumps({
        "message": "Login successful",
        "user_id": user.id,
        "email": user.email
    }).encode()
    response.headers["content-type"] = "application/json"
    
    return response

@router.post("/refresh")
async def refresh_token(request: Request):
    """Refresh using refresh_token cookie - client doesn't pass it explicitly"""
    token = request.cookies.get("refresh_token")  # ✅ Read from cookie
    # ... validation code ...
    
    # ✅ Response returns new tokens in cookies only
    response = Response(content='', status_code=status.HTTP_200_OK)
    _set_auth_cookies(response, new_access_token, new_refresh_token)
    
    import json
    response.body = json.dumps({
        "message": "Token refreshed successfully",
        "user_id": user_id,
        "email": email
    }).encode()
    response.headers["content-type"] = "application/json"
    
    return response

@router.post("/logout")
async def logout(request: Request, current_user: TokenData = Depends(get_current_user)):
    """Logout revokes token and clears cookies"""
    token = request.cookies.get("access_token")  # ✅ Read from cookie
    
    if token:
        revoke_token(token)
    
    response = Response(content='{"message": "Successfully logged out"}', status_code=status.HTTP_200_OK)
    response.headers["content-type"] = "application/json"
    
    # ✅ Clear both cookies
    response.delete_cookie(key="access_token", domain=settings.COOKIE_DOMAIN)
    response.delete_cookie(key="refresh_token", domain=settings.COOKIE_DOMAIN)
    
    return response
```

---

## 2. Token Extraction - Dependencies

### ❌ BEFORE: HTTPBearer Header

```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """
    Expects: Authorization: Bearer {token}
    """
    token = credentials.credentials  # Extract from header
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ... rest of validation ...
    return TokenData(user_id=user_id, sub=email)
```

### ✅ AFTER: HttpOnly Cookie

```python
from fastapi import Request

async def get_current_user(request: Request) -> TokenData:
    """
    Automatically extracts token from HttpOnly cookie
    No Authorization header needed
    """
    token = request.cookies.get("access_token")  # ✅ Read from cookie
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated - missing access token",
        )
    
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # ... rest of validation ...
    return TokenData(user_id=user_id, sub=email)
```

---

## 3. Frontend: Login Function

### ❌ BEFORE: Manual Token Storage

```typescript
// pages/login.tsx
async function handleLogin(email: string, password: string) {
    const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ❌ NO credentials: 'include' - cookies won't be sent/received
        body: JSON.stringify({
            username_or_email: email,
            password: password,
        }),
    });

    if (response.ok) {
        const data = await response.json();
        
        // ❌ Manual token storage - SECURITY RISK
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        // ❌ Tokens visible to JavaScript - vulnerable to XSS
        console.log('Token:', data.access_token);
        
        router.push('/dashboard');
    }
}
```

### ✅ AFTER: Automatic Cookie Handling

```typescript
// pages/login.tsx
async function handleLogin(email: string, password: string) {
    const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        credentials: 'include',  // ✅ CRITICAL - Enable cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username_or_email: email,
            password: password,
        }),
    });

    if (response.ok) {
        const data = await response.json();
        
        // ✅ NO manual token storage needed
        // Browser automatically sets HttpOnly cookies
        // Tokens are NOT accessible to JavaScript
        
        console.log('User:', data.user_id, data.email);
        
        router.push('/dashboard');
    }
}
```

---

## 4. Frontend: Protected API Calls

### ❌ BEFORE: Manual Token Headers

```typescript
// lib/api.ts
export async function apiCall(url: string) {
    // ❌ Must manually get token from storage
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(url, {
        method: 'GET',
        // ❌ Must manually set Authorization header
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 401) {
        // ❌ Must manually handle token refresh
        const refreshResponse = await fetch('/auth/refresh', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('refresh_token')}`,
            },
        });

        if (refreshResponse.ok) {
            const newData = await refreshResponse.json();
            // ❌ Manual token update
            localStorage.setItem('access_token', newData.access_token);
            localStorage.setItem('refresh_token', newData.refresh_token);
        }
    }

    return response;
}
```

### ✅ AFTER: Automatic Cookie Handling

```typescript
// lib/api.ts
export async function apiCall(url: string, options: RequestInit = {}) {
    const fullUrl = `http://localhost:8000${url}`;

    let response = await fetch(fullUrl, {
        ...options,
        credentials: 'include',  // ✅ Automatically includes cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (response.status === 401) {
        // ✅ Automatically refresh token
        const refreshResponse = await fetch(`${fullUrl}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });

        if (refreshResponse.ok) {
            // ✅ Browser automatically updated cookies
            // Retry original request
            response = await fetch(fullUrl, {
                ...options,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });
        } else {
            window.location.href = '/login';
        }
    }

    return response;
}
```

---

## 5. Frontend: Logout

### ❌ BEFORE: Manual Cleanup

```typescript
// components/LogoutButton.tsx
async function handleLogout() {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (response.ok) {
        // ❌ Must manually clear storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        router.push('/login');
    }
}
```

### ✅ AFTER: Server Handles Cleanup

```typescript
// components/LogoutButton.tsx
async function handleLogout() {
    const response = await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        credentials: 'include',  // ✅ Cookies sent automatically
    });

    if (response.ok) {
        // ✅ Server cleared cookies
        // Nothing to clean up on client side
        
        router.push('/login');
    }
}
```

---

## 6. Configuration

### ❌ BEFORE: CORS with Wildcard

```python
# app/main.py
from fastapi.proxy.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ❌ Works with Bearer but not with credentials
    allow_credentials=True,  # ❌ Conflicts with ["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### ✅ AFTER: CORS with Explicit Origins

```python
# app/main.py
from fastapi.proxy.cors import CORSMiddleware

allowed_origins = settings.ALLOWED_HOSTS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # ✅ Explicit origins required
    allow_credentials=True,  # ✅ Must specify origins when using credentials
    allow_methods=["*"],
    allow_headers=["*"],
)

# .env
ALLOWED_HOSTS=http://localhost:3000,http://localhost:8000
SECURE_COOKIE=false  # true in production
```

---

## 7. Response Models

### ❌ BEFORE: Tokens in Response

```python
from pydantic import BaseModel

class TokenResponse(BaseModel):
    access_token: str  # ❌ Exposed in response
    refresh_token: str  # ❌ Exposed in response
    token_type: str
```

### ✅ AFTER: Only User Data in Response

```python
from pydantic import BaseModel

class TokenResponse(BaseModel):
    """Tokens now sent via HttpOnly cookies, not in response"""
    message: str
    user_id: int
    email: str
    # No token fields!

class CookieTokenResponse(BaseModel):
    """For internal token operations only, never sent to client"""
    access_token: str
    refresh_token: str
    user_id: int
    email: str
```

---

## Key Differences Summary

| Aspect | Bearer Tokens | HttpOnly Cookies |
|--------|---------------|------------------|
| **Token Storage** | localStorage (XSS vulnerable) | HttpOnly cookie (XSS safe) |
| **Token Transmission** | Authorization header (manual) | Automatic with requests |
| **Token Visibility** | JavaScript accessible | JavaScript inaccessible |
| **CSRF Protection** | Must implement separately | SameSite attribute built-in |
| **Client Code** | More complex | Simpler, less boilerplate |
| **Security** | Good (with effort) | Better (defaults secure) |
| **API Response** | Contains tokens | Only user data |

---

## Migration Impact

### What You Need to Change

**Backend**:
- ✅ Already done! Updated auth.py, dependencies.py, config.py, main.py

**Frontend**:
- Add `credentials: 'include'` to all fetch calls
- Remove `localStorage` token management
- Remove manual Authorization headers
- Implement token refresh retry logic
- Update logout to just call endpoint

**Time to Migrate**: ~1-2 hours for typical Next.js app

---

## Testing

### cURL - BEFORE (Bearer)
```bash
# Login - returns tokens
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email": "user@example.com", "password": "pass"}'

# Result: { "access_token": "eyJ...", "refresh_token": "eyJ...", "token_type": "bearer" }

# Make authenticated request with header
curl -X GET http://localhost:8000/users/me \
  -H "Authorization: Bearer eyJ..."
```

### cURL - AFTER (Cookies)
```bash
# Login - returns user data, sets cookies
curl -c cookies.txt \
  -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email": "user@example.com", "password": "pass"}'

# Result: { "message": "Login successful", "user_id": 1, "email": "user@example.com" }

# Make authenticated request with cookies (no Authorization header)
curl -b cookies.txt \
  -X GET http://localhost:8000/users/me
```

---


