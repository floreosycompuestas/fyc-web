/**
 * Breeders API Service
 */

import { Breeder } from '@/app/types';
import { API_ENDPOINTS, FETCH_OPTIONS } from '@/app/lib/constants';

/**
 * Fetch the current user's breeder
 */
export const fetchCurrentBreeder = async (): Promise<Breeder> => {
  const response = await fetch(API_ENDPOINTS.BREEDERS.CURRENT, {
    ...FETCH_OPTIONS.DEFAULT,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch breeder information');
  }

  return response.json();
};

/**
 * Fetch a breeder by ID
 */
export const fetchBreederById = async (id: number): Promise<Breeder> => {
  const response = await fetch(API_ENDPOINTS.BREEDERS.BYID(id), {
    ...FETCH_OPTIONS.DEFAULT,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch breeder');
  }

  return response.json();
};

