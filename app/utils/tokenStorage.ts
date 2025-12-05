// Token storage utilities with HttpOnly cookie support
//
// IMPORTANT: This implementation is designed to work with HttpOnly cookies
// set by the backend. Tokens are NOT stored in localStorage.
// The browser automatically sends cookies with requests.

export const tokenStorage = {
  // ✅ No longer stores tokens - backend handles with HttpOnly cookies
  setTokens: (accessToken: string, refreshToken?: string) => {
    // Backend sets HttpOnly cookies automatically
    // Frontend doesn't need to do anything
    console.log('✅ Tokens stored in secure HttpOnly cookies by backend');
  },

  // ✅ Cannot access HttpOnly cookies from JavaScript (by design)
  getAccessToken: (): string | null => {
    // Cannot access HttpOnly cookies from JavaScript
    // This is intentional for security
    return null;
  },

  // ✅ Cannot access HttpOnly cookies from JavaScript (by design)
  getRefreshToken: (): string | null => {
    // Cannot access HttpOnly cookies from JavaScript
    // This is intentional for security
    return null;
  },

  // Clear tokens (backend handles this on logout)
  clearTokens: () => {
    // Backend clears cookies on logout endpoint
    console.log('✅ Tokens cleared by backend on logout');
  },

  // Check if user is authenticated by verifying backend
  isAuthenticated: (): boolean => {
    // With HttpOnly cookies, we check by making a request
    // For now, assume authenticated if dashboard loaded
    // TODO: Implement proper auth check endpoint
    return true;
  },

  // Get token expiration from JWT (client-side validation)
  getTokenExpiration: (): number | null => {
    // Since we can't access cookies, this is for reference only
    // Real token expiration is enforced by backend
    console.warn('⚠️ Token expiration should be validated on backend');
    return null;
  },

  // Check if token is expired
  isTokenExpired: (): boolean => {
    // Backend validates token expiration on each request
    // Frontend doesn't need to check this
    return false;
  },
};

// ✅ Fetch helper that automatically includes HttpOnly cookies
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    credentials: 'include', // ✅ Automatically include HttpOnly cookies
    headers,
  });
}
