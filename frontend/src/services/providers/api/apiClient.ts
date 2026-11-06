/**
 * Frontend/src/services/providers/api/apiClient.ts
 *
 * HTTP Client trung tâm cho Service Layer gọi Backend REST API:
 * - Tự động đính kèm JWT Bearer Token và Cookie (`credentials: 'include'`).
 * - Hỗ trợ cơ chế Single-Flight Refresh Token Rotation tự động khi gặp 401 Unauthorized.
 * - Tự động bóc tách response envelope chuẩn `{ success: true, data: ... }` từ Backend.
 * - Hỗ trợ `FormData` upload (MinIO attachments) không ghi đè Content-Type boundary.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';
export const AUTH_STORAGE_KEY = 'fleetmonitor_auth_user';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface AuthSessionCallbacks {
  onTokenRefreshed?: (newToken: string) => void;
  onSessionExpired?: () => void;
}

let sessionCallbacks: AuthSessionCallbacks = {};
let refreshInFlight: Promise<string | null> | null = null;
let inMemoryAccessToken: string | null = null;

export function registerAuthSessionHandlers(callbacks: AuthSessionCallbacks): void {
  sessionCallbacks = callbacks;
}

export function setInMemoryAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getStoredAccessToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.token;
      if (typeof token === 'string' && token.length > 0 && !token.startsWith('mock-jwt-token-')) {
        inMemoryAccessToken = token;
        return token;
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return inMemoryAccessToken;
}

function persistRefreshedToken(newToken: string): void {
  inMemoryAccessToken = newToken;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.token = newToken;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {
    // Ignore storage write errors
  }
  sessionCallbacks.onTokenRefreshed?.(newToken);
}

function clearExpiredSession(): void {
  inMemoryAccessToken = null;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
  sessionCallbacks.onSessionExpired?.();
}

async function refreshAccessTokenOnce(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      const body = await res.json();
      const payload = body?.success === true && body?.data ? body.data : body;
      const newToken = payload?.accessToken;
      if (typeof newToken === 'string' && newToken.length > 0) {
        persistRefreshedToken(newToken);
        return newToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function extractBackendErrorMessage(errorBody: any, status: number, statusText: string, url: string): string {
  if (errorBody && typeof errorBody === 'object') {
    if (typeof errorBody.error?.message === 'string') return errorBody.error.message;
    if (typeof errorBody.message === 'string') return errorBody.message;
    if (typeof errorBody.error === 'string') return errorBody.error;
  }
  return `Yêu cầu API thất bại [${status} ${statusText}]: ${url}`;
}

function unwrapEnvelope<T>(payload: any): T {
  if (
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    payload.success === true &&
    'data' in payload &&
    payload.data !== undefined
  ) {
    return payload.data as T;
  }
  return payload as T;
}

export async function requestApi<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 10000,
  _isRetry = false
): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const isAuthEndpoint =
    normalizedEndpoint.startsWith('/auth/login') ||
    normalizedEndpoint.startsWith('/auth/refresh') ||
    normalizedEndpoint.startsWith('/auth/logout');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const token = getStoredAccessToken();
  const mergedHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      credentials: options.credentials ?? 'include',
      signal: controller.signal,
      headers: mergedHeaders,
    });

    if (response.status === 401 && !isAuthEndpoint && !_isRetry) {
      const refreshed = await refreshAccessTokenOnce();
      if (refreshed) {
        clearTimeout(timer);
        return requestApi<T>(endpoint, options, timeoutMs, true);
      }
      clearExpiredSession();
    }

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      const message = extractBackendErrorMessage(errorBody, response.status, response.statusText, url);
      throw new ApiError(response.status, response.statusText, message, errorBody);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const parsed = await response.json();
    return unwrapEnvelope<T>(parsed);
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Yêu cầu API quá thời gian chờ (Timeout sau ${timeoutMs}ms): ${url}`);
    }
    throw new Error(`Không thể kết nối đến máy chủ API (${url}): ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timer);
  }
}
