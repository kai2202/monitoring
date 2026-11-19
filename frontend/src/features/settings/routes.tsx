import React from 'react';
import { RouteObject, Navigate } from 'react-router-dom';

const SettingsPage = React.lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

export interface SettingsRouteOptions {
  onSubTabChange?: (tab: string) => void;
  onNavigateModule?: (tab: any) => void;
}

export function getSettingsRoutes(options?: SettingsRouteOptions): RouteObject[] {
  return [
    {
      path: '/settings',
      element: <Navigate to="/settings/rbac" replace />,
    },
    {
      path: '/settings/:subTab',
      element: (
        <SettingsPage
          onSubTabChange={options?.onSubTabChange as any}
          onNavigateModule={options?.onNavigateModule}
        />
      ),
    },
  ];
}
