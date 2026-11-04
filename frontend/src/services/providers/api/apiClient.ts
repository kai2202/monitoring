/**
 * Frontend/src/services/providers/api/apiClient.ts
 *
 * HTTP Client tiện ích cho Service Layer gọi Backend REST API.
 * Tuân thủ AGENTS.md: Báo lỗi minh bạch, không nuốt lỗi, xử lý timeout.
 */

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api';

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

export async function requestApi<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 10000
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }

      throw new ApiError(
        response.status,
        response.statusText,
        `Yêu cầu API thất bại [${response.status} ${response.statusText}]: ${url}`,
        errorBody
      );
    }

    // Nếu mã phản hồi là 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Yêu cầu API quá thời gian chờ (Timeout sau ${timeoutMs}ms): ${url}`);
    }
    throw new Error(`Không thể kết nối đến máy chủ API (${url}): ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timer);
  }
}

