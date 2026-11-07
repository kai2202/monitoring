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

export const App: React.FC = () => {
  const basename = import.meta.env.BASE_URL || '/';
  return (
    <Provider store={store}>
      <BrowserRouter basename={basename}>
        <ErrorBoundary fallbackTitle="Lỗi Hệ Thống FleetMonitor">
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
