import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import { clearSession, loadSession, saveSession } from '../lib/storage';
import type { AuthSession, LoginPayload, RegisterPayload } from '../types';

const MIN_SPLASH_MS = 1100;

interface AuthContextValue {
  session: AuthSession | null;
  /** still checking AsyncStorage for a persisted session on cold start */
  isRestoring: boolean;
  isSubmitting: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const start = Date.now();
    loadSession()
      .then(setSession)
      .finally(() => {
        // Keep the splash screen visible for a minimum stretch so the brand
        // mark doesn't just flash — even though the AsyncStorage read itself
        // is near-instant.
        const elapsed = Date.now() - start;
        const remaining = Math.max(MIN_SPLASH_MS - elapsed, 0);
        setTimeout(() => setIsRestoring(false), remaining);
      });
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const next = await authApi.login(payload);
      await saveSession(next);
      setSession(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const next = await authApi.register(payload);
      await saveSession(next);
      setSession(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({ session, isRestoring, isSubmitting, error, login, register, logout, clearError }),
    [session, isRestoring, isSubmitting, error, login, register, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
