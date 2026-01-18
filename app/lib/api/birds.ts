/**
 * Birds API Service
 */

import { Bird, CreateBirdPayload, UpdateBirdPayload } from '@/app/types';
import { API_ENDPOINTS, FETCH_OPTIONS } from '@/app/lib/constants';

/**
 * Fetch all birds for a specific breeder
 */
export const fetchBirdsByBreeder = async (breederId: number): Promise<Bird[]> => {
  const response = await fetch(API_ENDPOINTS.BIRDS.BY_BREEDER(breederId), {
    ...FETCH_OPTIONS.DEFAULT,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch birds');
  }

  return response.json();
};

/**
 * Fetch a single bird by ID
 */
export const fetchBirdById = async (id: number): Promise<Bird> => {
  const response = await fetch(API_ENDPOINTS.BIRDS.BYID(id), {
    ...FETCH_OPTIONS.DEFAULT,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bird');
  }

  return response.json();
};

/**
 * Create a new bird
 */
export const createBird = async (data: CreateBirdPayload): Promise<Bird> => {
  const response = await fetch(API_ENDPOINTS.BIRDS.CREATE, {
    ...FETCH_OPTIONS.DEFAULT,
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create bird');
  }

  return response.json();
};

/**
 * Update an existing bird
 */
export const updateBird = async (id: number, data: UpdateBirdPayload): Promise<Bird> => {
  const response = await fetch(API_ENDPOINTS.BIRDS.UPDATE(id), {
    ...FETCH_OPTIONS.DEFAULT,
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update bird');
  }

  return response.json();
};

/**
 * Delete a bird
 */
export const deleteBird = async (id: number): Promise<void> => {
  const response = await fetch(API_ENDPOINTS.BIRDS.DELETE(id), {
    ...FETCH_OPTIONS.DEFAULT,
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete bird');
  }
};

