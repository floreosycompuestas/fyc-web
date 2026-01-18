/**
 * Breeder entity type definition
 */
export interface Breeder {
  id: number;
  breeder_code: string;
  user_id?: number;
  owner_id?: number;
  organization_id: number;
  first_name: string;
  last_name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Breeder full name
 */
export interface BreederName {
  first_name: string;
  last_name: string;
}

/**
 * Get breeder display name
 */
export const getBreederFullName = (breeder: Breeder): string => {
  return `${breeder.first_name} ${breeder.last_name}`;
};

