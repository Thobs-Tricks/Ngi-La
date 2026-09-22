import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession } from '../types';

const SESSION_KEY = 'vandor.session';
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export async function saveSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session: AuthSession = JSON.parse(raw);
    if (!session.expiresAt || session.expiresAt < Date.now()) {
      await clearSession();
      return null;
    }
    return session;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
