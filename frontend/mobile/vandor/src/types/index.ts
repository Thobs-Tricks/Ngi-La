export type Gender = 'female' | 'male' | 'other';

export interface VendorUser {
  id: string;
  fullNames: string;
  gender: Gender;
  phoneNumber: string;
  email: string;
}

export interface AuthSession {
  user: VendorUser;
  token: string;
  /** epoch ms — session is valid until this time (12h from login) */
  expiresAt: number;
}

export interface LoginPayload {
  identifier: string; // phone or email
  password: string;
}

export interface RegisterPayload {
  fullNames: string;
  gender: Gender;
  phoneNumber: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}
