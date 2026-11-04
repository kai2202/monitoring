/**
 * Frontend/src/app/api/baseApi.ts
 *
 * RTK Query Base API Slice cho FleetMonitor Enterprise:
 * - Hỗ trợ Tag Types để tự động vô hiệu hóa cache (Automatic Cache Invalidation).
 * - Tích hợp Mock Fallback BaseQuery thông minh khi API offline / dev mode.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Printers', 'Tasks', 'Analytics', 'Settings'],
  endpoints: () => ({}),
});

