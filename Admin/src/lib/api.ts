// Thin fetch-based client for the Ngila API. Centralizes the base URL, auth header injection,
// automatic refresh-token retry on 401, and typed request/response shapes for every endpoint
// the admin console calls.

export const API_BASE_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "") ??
  "https://ngila-api.azurewebsites.net";

// ---------- Token storage ----------

const STORAGE_KEY = "ngila_admin_auth";

export type StoredAuth = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

function readStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

function writeStoredAuth(auth: StoredAuth | null) {
  if (typeof window === "undefined") return;
  try {
    if (auth) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures (private browsing, blocked site data, etc.) - the session just
    // won't persist across reloads.
  }
}

export const tokenStore = {
  get: readStoredAuth,
  set: writeStoredAuth,
  clear: () => writeStoredAuth(null),
};

// ---------- Error type ----------

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// ---------- Core request ----------

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean; // defaults to true - set false for login/register/refresh
  signal?: AbortSignal;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const stored = tokenStore.get();
  if (!stored?.refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: stored.refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          tokenStore.clear();
          return null;
        }
        const data = (await res.json()) as {
          accessToken: string;
          accessTokenExpiresAt: string;
          refreshToken: string;
          refreshTokenExpiresAt: string;
        };
        tokenStore.set({
          accessToken: data.accessToken,
          accessTokenExpiresAt: data.accessTokenExpiresAt,
          refreshToken: data.refreshToken,
          refreshTokenExpiresAt: data.refreshTokenExpiresAt,
        });
        return data.accessToken;
      })
      .catch(() => {
        tokenStore.clear();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.clone().json();
    if (typeof data?.title === "string") return data.title;
    if (typeof data?.error === "string") return data.error;
  } catch {
    // Body wasn't JSON - fall through to a generic message.
  }
  return res.status === 401
    ? "Your session has expired. Please log in again."
    : `Request failed (${res.status}).`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let accessToken = auth ? tokenStore.get()?.accessToken : undefined;
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const doFetch = () => {
    const init: RequestInit = { method, headers };
    if (body !== undefined) init.body = JSON.stringify(body);
    if (signal !== undefined) init.signal = signal;
    return fetch(`${API_BASE_URL}${path}`, init);
  };

  let res = await doFetch();

  if (res.status === 401 && auth && tokenStore.get()?.refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await doFetch();
    }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) tokenStore.clear();
    throw new ApiError(res.status, await extractErrorMessage(res));
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
