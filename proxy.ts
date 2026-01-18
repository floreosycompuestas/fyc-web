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
 * 1. No tokens → allow public routes, redirect others to login
 * 2. Has access_token → check if auth route (redirect to dashboard), otherwise allow
 * 3. Only refresh_token → attempt refresh to get new access_token
 * 4. Refresh success → allow request with new token
 * 5. Refresh fail → redirect to login
 *
 * Note: Access token validation is deferred to the client via fetch requests.
 * If a 401 is received on any API call, client will initiate refresh flow.
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const hasAccessToken = request.cookies.has(COOKIE_ACCESS_TOKEN);
    const hasRefreshToken = request.cookies.has(COOKIE_REFRESH_TOKEN);

    console.log(`[PROXY] ${request.method} ${pathname} - AccessToken: ${hasAccessToken}, RefreshToken: ${hasRefreshToken}`);

    // No tokens at all - user not logged in
    if (!hasAccessToken && !hasRefreshToken) {
        if (PUBLIC_ROUTES.includes(pathname)) {
            console.log(`[PROXY] Public route allowed: ${pathname}`);
            return NextResponse.next();
        }

        console.log(`[PROXY] No tokens found, redirecting to login`);
        return redirectToLogin(pathname, request);
    }

    // User has access token - allow the request
    if (hasAccessToken) {
        // Redirect logged-in users away from auth pages
        if (isAuthRoute(pathname)) {
            console.log(`[PROXY] User logged in, redirecting from ${pathname} to /dashboard`);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        console.log(`[PROXY] Access token present, allowing request to ${pathname}`);
        return NextResponse.next();
    }

    // Only refresh token exists - need to refresh before accessing protected routes
    if (hasRefreshToken) {
        // Allow public routes even with only refresh token
        if (PUBLIC_ROUTES.includes(pathname)) {
            console.log(`[PROXY] Public route allowed with refresh token: ${pathname}`);
            return NextResponse.next();
        }

        console.log(`[PROXY] Only refresh token found, attempting refresh for ${pathname}`);
        return await attemptTokenRefresh(request, pathname);
    }

    // Fallback (shouldn't reach here)
    return redirectToLogin(pathname, request);
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
        // Use getSetCookie() if available, fallback to get('set-cookie')
        let setCookieHeaders: string[] = [];
        try {
            if (refreshResponse.headers.getSetCookie) {
                setCookieHeaders = refreshResponse.headers.getSetCookie();
            } else {
                const setCookieHeader = refreshResponse.headers.get('set-cookie');
                if (setCookieHeader) {
                    setCookieHeaders = [setCookieHeader];
                }
            }
        } catch (err) {
            console.warn('[REFRESH] Error extracting cookies from response:', err);
        }

        if (setCookieHeaders.length > 0) {
            console.log(`[REFRESH] Setting ${setCookieHeaders.length} cookies from refresh response`);
            setCookieHeaders.forEach(cookie => {
                response.headers.append('set-cookie', cookie);
            });
        } else {
            console.warn('[REFRESH] No Set-Cookie headers found in refresh response');
        }

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

// Export proxy as middleware
export { proxy as middleware };
