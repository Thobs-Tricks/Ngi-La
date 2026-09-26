import { jwtDecode } from 'jwt-decode';

/**
 * Reads the `exp` claim off a JWT access token and returns it as epoch ms.
 * Returns null if the token isn't a decodable JWT or has no `exp` claim —
 * callers should fall back to a fixed session length in that case.
 */
export function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = jwtDecode<{ exp?: number }>(token);
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}
