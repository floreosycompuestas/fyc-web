/**
 * API Endpoints and Constants
 */

// Base API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGOUT: '/api/auth/logout',
  },

  // Breeders
  BREEDERS: {
    CURRENT: '/api/breeders/me/breeder',
    BYID: (id: number) => `/api/breeders/${id}`,
  },

  // Birds
  BIRDS: {
    LIST: '/api/birds',
    BYID: (id: number) => `/api/birds/${id}`,
    BY_BREEDER: (breederId: number) => `/api/birds/breeder/${breederId}?skip=0&limit=100`,
    CREATE: '/api/birds',
    UPDATE: (id: number) => `/api/birds/${id}`,
    DELETE: (id: number) => `/api/birds/${id}`,
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Fetch options
export const FETCH_OPTIONS = {
  DEFAULT: {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include' as const,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  BREEDER_FETCH_FAILED: 'Failed to fetch breeder information',
  BIRDS_FETCH_FAILED: 'Failed to fetch birds',
  BIRD_CREATE_FAILED: 'Failed to create bird',
  BIRD_UPDATE_FAILED: 'Failed to update bird',
  BIRD_DELETE_FAILED: 'Failed to delete bird',
  LOGOUT_FAILED: 'Failed to logout',
  VALIDATION_REQUIRED: 'Please fill in all required fields',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  BIRD_CREATED: 'Bird created successfully',
  BIRD_UPDATED: 'Bird updated successfully',
  BIRD_DELETED: 'Bird deleted successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
} as const;

// Navigation items
export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Breeders', href: '/breeders' },
  { label: 'Profile', href: '/profile' },
] as const;

// Form validation
export const FORM_VALIDATION = {
  BAND_ID_REQUIRED: 'Band ID is required',
  BAND_ID_PLACEHOLDER: 'e.g., BAND-2026-001',
  BIRD_NAME_PLACEHOLDER: 'e.g., Tweety',
} as const;

// Sex options
export const SEX_OPTIONS = [
  { value: 'M', label: 'Male (M)' },
  { value: 'F', label: 'Female (F)' },
] as const;

