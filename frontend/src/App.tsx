/**
 * Frontend/src/App.tsx
 *
 * Cấu hình Khung Lõi của FleetMonitor Enterprise:
 * - Redux Toolkit Provider (State Management & RTK Query Cache)
 * - React Router (BrowserRouter & Nested Lazy Routes)
 * - Error Boundary
 */

import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './shared/feedback/ErrorBoundary';

export function getRouterBasename(): string {
  const baseUrl = (import.meta as any).env?.BASE_URL || '/';
  if (baseUrl && baseUrl !== '/' && baseUrl !== './' && baseUrl.startsWith('/')) {
    return baseUrl.replace(/\/+$/, '') || '/';
  }
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    const firstSegment = window.location.pathname.split('/').filter(Boolean)[0];
    if (firstSegment) return `/${firstSegment}`;
  }
  return '/';
}

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter basename={getRouterBasename()}>
        <ErrorBoundary fallbackTitle="Lỗi Hệ Thống FleetMonitor">
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
