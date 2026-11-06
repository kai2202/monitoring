import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../App';

describe('App All Routes Mount Test', () => {
  const routes = [
    '/',
    '/dashboard',
    '/printers',
    '/printers/list',
    '/printers/timeline',
    '/printers/history',
    '/analytics',
    '/analytics/overview',
    '/analytics/supplies',
    '/analytics/sla-cost',
    '/settings',
    '/settings/gateway',
    '/settings/rbac',
    '/settings/rules',
    '/settings/dictionary',
    '/login',
  ];

  for (const path of routes) {
    it(`renders path ${path} without white screen or ErrorBoundary`, async () => {
      window.history.pushState({}, 'Test', path);
      const { container } = render(<App />);
      expect(container).toBeDefined();

      await waitFor(() => {
        const errorTitle = screen.queryByText(/Lỗi Hệ Thống FleetMonitor/i);
        expect(errorTitle).toBeNull();
      });
    });
  }
});
