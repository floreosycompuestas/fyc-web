# HttpOnly Cookies Backend Implementation Guide
## Overview
Your frontend is now ready to use **HttpOnly cookies** for secure token storage. The backend (FastAPI) needs to be updated to set and manage these cookies.
---
## Backend Changes Required
### 1. Update CORS Configuration
**File**: `/api/app/main.py`
```python
from fastapi.proxy.cors import CORSMiddleware
# Add or update CORS proxy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,  # ✅ CRITICAL: Allow cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```
**Key**: `allow_credentials=True` is ESSENTIAL for cookies to work.
---
### 2. Update Login Endpoint
**File**: `/api/app/routers/auth.py`
```python
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
import jwt
router = APIRouter(prefix="/auth", tags=["auth"])
@router.post("/login")
async def login(credentials: LoginSchema):
    """Login endpoint with HttpOnly cookie tokens"""
    # Validate credentials
    user = await authenticate_user(
        credentials.username_or_email,
        credentials.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    # Generate tokens
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=15)  # ✅ Short expiration
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(days=7)  # ✅ Longer expiration
    )
    # Create response
    response = JSONResponse(
        content={"message": "Login successful"},
        status_code=status.HTTP_200_OK
    )
    # Set access token as HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,           # ✅ Prevents JavaScript access
        secure=True,             # ✅ HTTPS only (set False for local dev)
        samesite="lax",          # ✅ CSRF protection
        max_age=900,             # ✅ 15 minutes
        path="/",                # ✅ Available to all routes
    )
    # Set refresh token as HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,             # Set to False for local development
        samesite="lax",
        max_age=604800,          # ✅ 7 days
        path="/",
    )
    return response
```
---
### 3. Add Logout Endpoint
**File**: `/api/app/routers/auth.py`
```python
@router.post("/logout")
async def logout():
    """Logout endpoint - clears HttpOnly cookies"""
    response = JSONResponse(
        content={"message": "Logout successful"},
        status_code=status.HTTP_200_OK
    )
    # Clear access token cookie
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="lax"
    )
    # Clear refresh token cookie
    response.delete_cookie(
        key="refresh_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="lax"
    )
    return response
```
---
### 4. Add Token Refresh Endpoint
**File**: `/api/app/routers/auth.py`
```python
from fastapi import Request, Depends
@router.post("/refresh")
async def refresh_token(request: Request):
    """Refresh access token using refresh_token cookie"""
    # Get refresh token from cookies
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )
    try:
        # Verify refresh token
        payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    # Generate new access token
    new_access_token = create_access_token(
        data={"sub": user_id},
        expires_delta=timedelta(minutes=15)
    )
    # Create response with new token
    response = JSONResponse(
        content={"message": "Token refreshed"},
        status_code=status.HTTP_200_OK
    )
    # Set new access token cookie
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=900,
        path="/",
    )
    return response
```
---
### 5. Update Protected Routes to Use Cookie Tokens
For routes that need authentication, extract token from cookies:
```python
from fastapi import Request
async def get_current_user(request: Request):
    """Extract and validate token from HttpOnly cookie"""
    # Get access token from cookies
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    # Get user from database
    user = await get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user
# Use in protected routes
@router.get("/me")
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }
```
---
## Configuration for Different Environments
### Development (Local - HTTP)
```python
# In config or main.py
import os
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
# In login endpoint
response.set_cookie(
    key="access_token",
    value=access_token,
    httponly=True,
    secure=ENVIRONMENT == "production",  # False for dev, True for prod
    samesite="lax",
    max_age=900,
    path="/",
)
```
### Environment Variables
**.env.local** (development)
```
ENVIRONMENT=development
SECURE_COOKIES=false
```
**.env.production** (production)
```
ENVIRONMENT=production
SECURE_COOKIES=true
```
---
## Testing HttpOnly Cookies
### 1. Verify Cookies in Browser
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Login and check the response headers
4. Look for `Set-Cookie: access_token=...;HttpOnly;Secure`
### 2. Test with cURL
```bash
# Login
curl -c cookies.txt -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"test","password":"test"}'
# Make authenticated request
curl -b cookies.txt http://localhost:8000/users/me
# Logout
curl -b cookies.txt -X POST http://localhost:8000/auth/logout
```
### 3. Verify JavaScript Cannot Access Cookies
In browser console:
```javascript
// This should be EMPTY (HttpOnly cookies are hidden)
console.log(document.cookie);
// Should NOT show access_token or refresh_token
```
---
## Full Example Implementation
### `/api/app/routers/auth.py` (Complete)
```python
from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
import jwt
from app.schemas.auth import LoginSchema
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
router = APIRouter(prefix="/auth", tags=["auth"])
# Placeholder - implement your authentication logic
async def authenticate_user(username_or_email: str, password: str):
    """Authenticate user and return user object"""
    # TODO: Implement
    pass
async def get_user(user_id: str):
    """Get user by ID"""
    # TODO: Implement
    pass
@router.post("/login")
async def login(credentials: LoginSchema):
    """Login with HttpOnly cookies"""
    user = await authenticate_user(
        credentials.username_or_email,
        credentials.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=15)
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(days=7)
    )
    response = JSONResponse(
        content={"message": "Login successful"},
        status_code=status.HTTP_200_OK
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=900,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=604800,
        path="/",
    )
    return response
@router.post("/logout")
async def logout():
    """Logout and clear cookies"""
    response = JSONResponse(
        content={"message": "Logout successful"},
        status_code=status.HTTP_200_OK
    )
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="lax"
    )
    response.delete_cookie(
        key="refresh_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="lax"
    )
    return response
@router.post("/refresh")
async def refresh_access_token(request: Request):
    """Refresh access token"""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )
    try:
        payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    new_access_token = create_access_token(
        data={"sub": user_id},
        expires_delta=timedelta(minutes=15)
    )
    response = JSONResponse(
        content={"message": "Token refreshed"},
        status_code=status.HTTP_200_OK
    )
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=900,
        path="/",
    )
    return response
async def get_current_user_from_cookie(request: Request):
    """Dependency for protected routes"""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    user = await get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user
@router.get("/me")
async def get_me(current_user = Depends(get_current_user_from_cookie)):
    """Get current user info"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }
```
---
## Checklist for Backend Implementation
- [ ] Update CORS with `allow_credentials=True`
- [ ] Update login endpoint to set HttpOnly cookies
- [ ] Add logout endpoint to clear cookies
- [ ] Add refresh endpoint for token refresh
- [ ] Update protected routes to read from cookies
- [ ] Add `get_current_user_from_cookie` dependency
- [ ] Test with browser DevTools
- [ ] Test with cURL
- [ ] Verify JavaScript cannot access cookies
- [ ] Set `secure=False` for local dev, `secure=True` for prod
---
## Frontend Status
✅ **Frontend is ready**:
- Login page: Uses `credentials: "include"`
- Dashboard: Uses `credentials: "include"` for logout
- API helper: `authenticatedFetch()` includes cookies
- TokenStorage: No longer touches localStorage
**Next Step**: Implement backend changes above
---
## Quick Start
1. Copy the complete auth.py example above
2. Update your existing auth endpoints
3. Test login flow
4. Verify cookies in DevTools
5. Test logout flow
6. Test token refresh
---
## Troubleshooting
### Cookies not being set?
- Check CORS `allow_credentials=True`
- Verify `httponly=True` in cookie
- Check browser console for CORS errors
### Cannot read cookies on backend?
- Make sure frontend sends `credentials: "include"`
- Check that cookies are being sent in request
### Cookies being cleared on page reload?
- Check `max_age` is set (e.g., 900 for 15 min)
- Verify `path="/"` 
### JavaScript can see cookies?
- Ensure `httponly=True` is set
- Check in DevTools Application > Cookies
