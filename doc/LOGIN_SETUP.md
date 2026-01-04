# Login Implementation Guide

## Overview
This document describes the login implementation for the FYC application with the following endpoints:

- **Backend API**: `http://localhost:8000/auth/login`
- **Frontend**: `/login` page and `/api/auth/login` route handler

## Request/Response Format

### Login Request
```json
{
  "username_or_email": "string",
  "password": "string"
}
```

### Login Response (Success - 200)
```json
{
  "access_token": "string",
  "refresh_token": "string (optional)",
  "token_type": "bearer"
}
```

### Login Response (Error - 401)
```json
{
  "detail": "Incorrect email/username or password"
}
```

## Frontend Files

### 1. Login Page (`/app/login/page.tsx`)
A client-side React component that:
- Provides a login form with username/email and password fields
- Sends credentials to `/api/auth/login`
- Stores access and refresh tokens in localStorage
- Redirects to `/dashboard` on successful login
- Displays error messages on login failure

**Features:**
- Form validation
- Loading state during submission
- Error handling and display
- Dark mode support
- Responsive design with Tailwind CSS

### 2. API Route Handler (`/app/api/auth/login/route.ts`)
A Next.js API route that:
- Handles POST requests to `/api/auth/login`
- Validates request body (requires `username_or_email` and `password`)
- Forwards the request to the backend API at `http://localhost:8000/auth/login`
- Returns the tokens to the frontend

## Backend Integration

The backend API at `http://localhost:8000/auth/login` expects:
```python
{
  "username_or_email": str,  # Can be username or email
  "password": str             # User password (min 6, max 60 chars)
}
```

And returns:
```python
{
  "access_token": str,
  "refresh_token": str (optional),
  "token_type": "bearer"
}
```

## Configuration

### Next.js Config (`next.config.mjs`)
The application includes API rewrites to proxy requests:
```javascript
async rewrites() {
    return {
        beforeFiles: [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8000/:path*',
            },
        ],
    };
}
```

This allows direct API proxying through the Next.js server.

## Usage

### From the Frontend
```typescript
// In a client component
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username_or_email: 'user@example.com', // or username
    password: 'password123',
  }),
});

const data = await response.json();
// Returns: { access_token, refresh_token, token_type }
```

### Running the Application

1. **Start the backend API**:
   ```bash
   cd api
   # Run your FastAPI application
   ```

2. **Start the frontend development server**:
   ```bash
   cd web/fyc-web
   npm run dev
   # or
   pnpm dev
   ```

3. **Access the login page**:
   Open `http://localhost:3000/login` in your browser

## Token Storage

Currently, tokens are stored in `localStorage`:
- `access_token`: Used for API authentication
- `refresh_token`: Used to obtain a new access token when it expires

**⚠️ Security Note**: For production, consider using:
- HttpOnly cookies for token storage (more secure against XSS)
- CSRF protection
- Secure token transmission

## Next Steps

To fully integrate the login functionality:

1. Create a protected route layout that checks for valid tokens
2. Implement token refresh logic when access token expires
3. Add logout functionality that clears stored tokens
4. Create a registration page if needed
5. Implement proper error handling and user feedback
6. Add rate limiting to prevent brute force attacks

