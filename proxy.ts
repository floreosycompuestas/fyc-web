import { NextRequest, NextResponse } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/about', '/register', '/forgot-password', '/'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if user has authentication cookies
  const hasAccessToken = request.cookies.has('access_token');
  const hasRefreshToken = request.cookies.has('refresh_token');

  // If both tokens are missing, redirect to login
  if (!hasAccessToken && !hasRefreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If access token is missing but refresh token exists, try to refresh
  if (!hasAccessToken && hasRefreshToken) {
    try {
      // Call refresh endpoint to get new access token
      // Build full URL to backend server
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const refreshUrl = `${backendUrl}/auth/refresh`;

      // Get the refresh_token from the request cookies
      const refreshToken = request.cookies.get('refresh_token')?.value;

      const refreshResponse = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Manually set the Cookie header with refresh_token
          'Cookie': `refresh_token=${refreshToken}`,
        },
        body: JSON.stringify({}),
      });

      if (refreshResponse.ok) {
        // Refresh successful, allow request to proceed
        const response = NextResponse.next();

        // Copy Set-Cookie headers from refresh response to include new access_token
        const setCookieHeaders = refreshResponse.headers.getSetCookie();
        if (setCookieHeaders.length > 0) {
          // Add all Set-Cookie headers
          setCookieHeaders.forEach((cookie) => {
            response.headers.append('set-cookie', cookie);
          });
        }

        return response;
      } else {
        // Refresh failed (e.g., refresh token expired), redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // Error calling refresh endpoint, redirect to login
      console.error('Error refreshing token in proxy:', error);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Both tokens exist, allow request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

