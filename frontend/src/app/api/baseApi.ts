/**
 * Frontend/src/app/api/baseApi.ts
 *
 * RTK Query Base API Slice cho FleetMonitor Enterprise:
 * - Tự động đính kèm Bearer Token từ Redux / LocalStorage (`prepareHeaders`).
 * - Cơ chế `baseQueryWithReauth`: Bắt lỗi 401, tự động refresh token qua cookie HttpOnly.
 * - Hỗ trợ Tag Types để tự động vô hiệu hóa cache (Automatic Cache Invalidation).
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { getStoredAccessToken } from '../../services/providers/api/apiClient';
import { updateAccessToken, logout } from '../slices/authSlice';
import type { RootState } from '../store';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    headers.set('Content-Type', 'application/json');
    const state = getState() as RootState;
    const token = state?.auth?.user?.token || getStoredAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

let refreshPromise: Promise<string | null> | null = null;

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const refreshRes = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!refreshRes.ok) return null;
          const data = await refreshRes.json();
          const newToken = data?.data?.accessToken || data?.accessToken;
          return typeof newToken === 'string' ? newToken : null;
        } catch {
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const newToken = await refreshPromise;

    if (newToken) {
      api.dispatch(updateAccessToken(newToken));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Printers',
    'Tasks',
    'Analytics',
    'Settings',
    'Inventory',
    'Procurement',
    'Vendors',
  ],
  endpoints: () => ({}),
});
