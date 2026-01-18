/**
 * Bird entity type definition
 */
export interface Bird {
  id: number;
  band_id: string;
  name?: string;
  dob?: string;
  sex?: string;
  father_id?: number;
  mother_id?: number;
  breeder_id: number;
  owner_id?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Bird form data (subset of Bird without system fields)
 */
export type BirdFormData = Omit<Bird, 'id' | 'created_at' | 'updated_at'>;

/**
 * Bird creation payload
 */
export type CreateBirdPayload = Omit<Bird, 'id' | 'created_at' | 'updated_at' | 'breeder_id'>;

/**
 * Bird update payload
 */
export type UpdateBirdPayload = Partial<BirdFormData>;

