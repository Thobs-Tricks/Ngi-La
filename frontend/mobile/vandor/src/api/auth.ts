// Real calls against the NGiLA API (see .env for the base URL).
//
// Confirmed response shapes (from real requests against the live API):
//
// POST /auth/register -> { message: string }
//   No token, no user data — the account isn't usable until the person
//   confirms their email from the link the API sends them. So `register()`
//   does NOT create a session; it just reports the confirmation message.
//
// POST /auth/login -> {
//   userId, email, firstName, lastName, role,
//   accessToken, accessTokenExpiresAt (ISO string),
//   refreshToken, refreshTokenExpiresAt (ISO string)
// }
//   Doesn't include phoneNumber or gender, so login() alone leaves those
//   undefined — call getCurrentUser() right after to fill them in.
//
// GET /auth/me -> {
//   userId, email, firstName, lastName, phoneNumber, gender, role,
//   emailConfirmed, createdAt
// }
//   The full profile. Used right after login to fill in what the login
//   response leaves out.
import { apiClient } from './client';
import { decodeJwtExpiry } from '../lib/jwt';
import type { AuthSession, LoginPayload, RegisterPayload, RegisterResult, VendorUser } from '../types';

interface LoginResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export async function register(payload: RegisterPayload): Promise<RegisterResult> {
  const data = await apiClient.post<{ message: string }>('/auth/register', {
    userType: 'Vendor',
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    password: payload.password,
    gender: payload.gender,
  });

  return { message: data.message };
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const data = await apiClient.post<LoginResponse>('/auth/login', {
    email: payload.email,
    password: payload.password,
  });

  const user: VendorUser = {
    id: data.userId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    role: data.role,
  };

  // Prefer the server's own expiry timestamp; fall back to decoding the JWT
  // if that's ever missing, and to a 12h guess only as a last resort.
  const expiresAt =
    Date.parse(data.accessTokenExpiresAt) ||
    decodeJwtExpiry(data.accessToken) ||
    Date.now() + 12 * 60 * 60 * 1000;

  return {
    user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt,
  };
}

interface MeResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: VendorUser['gender'];
  role: string;
  emailConfirmed: boolean;
  createdAt: string;
}

/** GET /auth/me — fills in phoneNumber/gender/etc. that /auth/login leaves
 * out. Fails soft (returns null) so a /me hiccup never blocks a successful
 * login. */
export async function getCurrentUser(accessToken: string): Promise<Partial<VendorUser> | null> {
  try {
    const data = await apiClient.get<MeResponse>('/auth/me', accessToken);
    return {
      id: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      gender: data.gender,
      role: data.role,
      emailConfirmed: data.emailConfirmed,
      createdAt: data.createdAt,
    };
  } catch {
    return null;
  }
}

/** POST /auth/forgot-password — sends a reset email. Same shape as register:
 * just a confirmation message, no session. */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const data = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  return { message: data.message };
}

/** POST /auth/change-password — for a signed-in user changing their own
 * password. Requires the current access token. */
export async function changePassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  const data = await apiClient.post<{ message: string }>(
    '/auth/change-password',
    { currentPassword, newPassword },
    accessToken
  );
  return { message: data.message };
}
