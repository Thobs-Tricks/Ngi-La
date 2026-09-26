// Thin fetch wrapper for the NGiLA API. Base URL comes from the EXPO_PUBLIC_
// env var (see .env / .env.example) so it's easy to point at a different
// backend (local, staging) without touching code.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://ngila-api.azurewebsites.net/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ASP.NET's default error shapes: ProblemDetails ({ title, detail }) and
// ValidationProblemDetails ({ errors: { field: [messages] } }). We try both,
// plus a couple of common fallbacks, before giving up on a specific message.
function extractErrorMessage(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === 'string') return data || null;
  if (typeof data !== 'object') return null;

  const obj = data as Record<string, unknown>;
  if (typeof obj.detail === 'string') return obj.detail;
  if (typeof obj.title === 'string') return obj.title;
  if (typeof obj.message === 'string') return obj.message;

  if (obj.errors && typeof obj.errors === 'object') {
    const firstList = Object.values(obj.errors as Record<string, unknown>)[0];
    if (Array.isArray(firstList) && typeof firstList[0] === 'string') {
      return firstList[0];
    }
  }

  return null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    throw new ApiError(extractErrorMessage(data) ?? `Request failed (${res.status})`, res.status);
  }

  return data as T;
}

function jsonHeaders(token?: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const apiClient = {
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), headers: jsonHeaders(token) }),
  put: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), headers: jsonHeaders(token) }),
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'GET', headers: jsonHeaders(token) }),
  // No Content-Type here deliberately - fetch sets the multipart boundary itself when the body
  // is a FormData instance. Setting it manually strips the boundary and the server can't parse
  // the upload at all.
  upload: <T>(path: string, form: FormData, token?: string) =>
    request<T>(path, {
      method: 'POST',
      body: form,
      headers: token ? { Accept: 'application/json', Authorization: `Bearer ${token}` } : { Accept: 'application/json' },
    }),
};
