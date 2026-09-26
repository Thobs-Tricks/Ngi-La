// Matches the NGiLA API's Gender enum exactly (case-sensitive).
export type Gender = 'Female' | 'Male' | 'Other';

export interface VendorUser {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Filled in via GET /auth/me right after login (the login response itself
   * doesn't include it). */
  phoneNumber?: string;
  /** Same caveat as phoneNumber. */
  gender?: Gender;
  role?: string;
  emailConfirmed?: boolean;
  createdAt?: string;
}

export interface AuthSession {
  user: VendorUser;
  accessToken: string;
  refreshToken?: string;
  /** epoch ms */
  expiresAt: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  gender: Gender;
  /** client-side gate only — the API doesn't have a field for this */
  acceptedTerms: boolean;
}

/** /auth/register just confirms the account was created — it does not log
 * the user in. The API sends a confirmation email before login is allowed. */
export interface RegisterResult {
  message: string;
}

export interface Category {
  id: string;
  name: string;
  vendorCount: number;
}

/** Mirrors the API's AddVendorRequest — except categoryIds, which is plural
 * here because vendors asked to pick every category that fits (e.g. a shop
 * that's both Food and Fresh Produce). The live endpoint only accepts one
 * categoryId today; this stays UI-only until the backend supports the array. */
export interface VendorProfileDraft {
  businessName: string;
  description: string;
  categoryIds: string[];
  locationDescription: string;
  latitude: number | null;
  longitude: number | null;
  contactPhone: string;
  imageUri: string | null;
}
