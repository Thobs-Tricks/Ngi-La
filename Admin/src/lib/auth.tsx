import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ApiError, tokenStore } from "./api";
import { fetchMe, login as loginRequest, revokeSession } from "./endpoints";
import type { CurrentUser } from "./types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: CurrentUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<CurrentUser | null>(null);

  const loadUser = useCallback(async () => {
    if (!tokenStore.get()?.accessToken) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }
    try {
      const me = await fetchMe();
      setUser(me);
      setStatus("authenticated");
    } catch {
      tokenStore.clear();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const auth = await loginRequest(email, password);
    if (auth.role !== "Admin") {
      throw new ApiError(403, "This account doesn't have console access.");
    }
    tokenStore.set({
      accessToken: auth.accessToken,
      accessTokenExpiresAt: auth.accessTokenExpiresAt,
      refreshToken: auth.refreshToken,
      refreshTokenExpiresAt: auth.refreshTokenExpiresAt,
    });
    await loadUser();
  }, [loadUser]);

  const logout = useCallback(async () => {
    const stored = tokenStore.get();
    tokenStore.clear();
    setUser(null);
    setStatus("unauthenticated");
    if (stored?.refreshToken) {
      try {
        await revokeSession(stored.refreshToken);
      } catch {
        // Best-effort - the local session is already cleared either way.
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, login, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
