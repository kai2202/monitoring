/**
 * Frontend/src/app/store.ts
 *
 * Trung tâm cấu hình Redux Toolkit Store:
 * - Tích hợp RTK Query Middleware cho tự động cache & polling.
 * - Quản lý UI state, Comparison state và các feature slices.
 */

import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import uiReducer from './slices/uiSlice';
import comparisonReducer from './slices/comparisonSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    ui: uiReducer,
    comparison: comparisonReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

