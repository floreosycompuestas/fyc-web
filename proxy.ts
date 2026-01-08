import { NextRequest, NextResponse } from 'next/server';

// Configuration
const PUBLIC_ROUTES = ['/login', '/signup', '/register', '/forgot-password', '/', '/about'];
const COOKIE_ACCESS_TOKEN = 'access_token';
const COOKIE_REFRESH_TOKEN = 'refresh_token';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Validate backend URL on startup
if (!BACKEND_URL) {
    console.error('FATAL: NEXT_PUBLIC_API_BASE_URL is not configured');
}

/**
 * Main middleware function - handles authentication and token refresh
 * Flow:
 * 1. No tokens → redirect to login
 * 2. Has access_token → VALIDATE via /auth/me
 *    - Valid → allow request
 *    - Invalid (401) → try refresh if refresh_token exists
 * 3. Only refresh_token → attempt refresh to get new access_token
 * 4. Refresh success → allow request with new token
 * 5. Refresh fail → redirect to login
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const hasAccessToken = request.cookies.has(COOKIE_ACCESS_TOKEN);
    const hasRefreshToken = request.cookies.has(COOKIE_REFRESH_TOKEN);

    console.log(`[PROXY] ${request.method} ${pathname} - AccessToken: ${hasAccessToken}, RefreshToken: ${hasRefreshToken}`);

    // No tokens at all - user not logged in
    if (!hasAccessToken && !hasRefreshToken) {
       if(PUBLIC_ROUTES.includes(pathname))
           return NextResponse.next();

        console.log(`[PROXY] No tokens found, redirecting to login`);
        return redirectToLogin(pathname, request);
    }

    // User has access token - validate it via /auth/me
    if (hasAccessToken) {
        // Redirect logged-in users away from auth pages
        if (isAuthRoute(pathname)) {
            console.log(`[PROXY] User logged in, redirecting from ${pathname} to /dashboard`);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Validate the access token by calling /auth/me
        const isTokenValid = await validateAccessToken(request);

        if (isTokenValid) {
            console.log(`[PROXY] Access token validated, allowing request`);
            return NextResponse.next();
        }

        // Access token is invalid (expired or revoked)
        console.log(`[PROXY] Access token is invalid`);

        // Try to refresh if we have a refresh token
        if (hasRefreshToken) {
            console.log(`[PROXY] Attempting to refresh with refresh token`);
            return await attemptTokenRefresh(request, pathname);
        }

        // No refresh token, redirect to login
        console.log(`[PROXY] No refresh token available, redirecting to login`);
        return redirectToLogin(pathname, request);
    }

    // Only refresh token exists - need to refresh
    if (hasRefreshToken) {
        console.log(`[PROXY] Only refresh token found, attempting refresh`);
        return await attemptTokenRefresh(request, pathname);
    }

    // Fallback (shouldn't reach here)
    return redirectToLogin(pathname, request);
}

/**
 * Validate access token by calling /auth/me endpoint
 * Returns true if token is valid, false if invalid/expired
 */
async function validateAccessToken(request: NextRequest): Promise<boolean> {
    try {
        if (!BACKEND_URL) {
            console.error('[VALIDATE] Backend URL not configured');
            return false;
        }

        const accessToken = request.cookies.get(COOKIE_ACCESS_TOKEN)?.value;
        if (!accessToken) {
            console.warn('[VALIDATE] Access token missing from cookies');
            return false;
        }

        console.log('[VALIDATE] Calling /auth/me to validate access token');

        const response = await fetch(`${BACKEND_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Cookie': `${COOKIE_ACCESS_TOKEN}=${accessToken}`,
            },
        }).catch(err => {
            console.error('[VALIDATE] Fetch error:', err);
            return null;
        });

        if (!response) {
            console.error('[VALIDATE] Network error while validating token');
            return false;
        }

        if (response.ok) {
            console.log('[VALIDATE] Access token is valid');
            return true;
        }

        if (response.status === 401) {
            console.warn('[VALIDATE] Access token is invalid or expired');
            return false;
        }

        console.warn(`[VALIDATE] Unexpected response status ${response.status}`);
        return false;
    } catch (error) {
        console.error('[VALIDATE] Unexpected error during validation:', error);
        return false;
    }
}

/**
 * Refresh the access token using refresh token
 */
async function attemptTokenRefresh(request: NextRequest, pathname: string): Promise<NextResponse> {
    try {
        if (!BACKEND_URL) {
            console.error('[REFRESH] Backend URL not configured');
            return redirectToLogin(pathname, request);
        }

        const refreshToken = request.cookies.get(COOKIE_REFRESH_TOKEN)?.value;
        if (!refreshToken) {
            console.warn('[REFRESH] Refresh token missing from cookies');
            return redirectToLogin(pathname, request);
        }

        console.log('[REFRESH] Calling backend to refresh token...');

        const refreshResponse = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `${COOKIE_REFRESH_TOKEN}=${refreshToken}`,
            },
            body: JSON.stringify({}),
        }).catch(err => {
            console.error('[REFRESH] Fetch error:', err);
            throw err;
        });

        // Refresh failed
        if (!refreshResponse.ok) {
            console.warn(`[REFRESH] Refresh failed with status ${refreshResponse.status}`);
            return redirectToLogin(pathname, request);
        }

        // Refresh successful - create response with new cookies
        console.log('[REFRESH] Token refresh successful');

        // Redirect auth route users to dashboard after refresh
        const response = isAuthRoute(pathname)
            ? NextResponse.redirect(new URL('/dashboard', request.url))
            : NextResponse.next();

        // Apply new cookies from refresh response
        const setCookieHeaders = refreshResponse.headers.getSetCookie();
        console.log(`[REFRESH] Setting ${setCookieHeaders.length} cookies from refresh response`);

        setCookieHeaders.forEach(cookie => {
            response.headers.append('set-cookie', cookie);
        });

        return response;
    } catch (error) {
        console.error('[REFRESH] Unexpected error during refresh:', error);
        return redirectToLogin(pathname, request);
    }
}

/**
 * Check if route is an authentication route
 */
function isAuthRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.includes(pathname);
}

/**
 * Redirect to login page with original pathname as redirect parameter
 */
function redirectToLogin(pathname: string, request: NextRequest): NextResponse {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    const response = NextResponse.redirect(loginUrl);

    // Clear any invalid tokens
    response.cookies.delete(COOKIE_ACCESS_TOKEN);
    response.cookies.delete(COOKIE_REFRESH_TOKEN);

    console.log(`[PROXY] Redirecting to login with redirect=${pathname}`);
    return response;
}

// Middleware configuration - apply to all routes except API and static files
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};