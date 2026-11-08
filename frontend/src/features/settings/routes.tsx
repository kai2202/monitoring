import React from 'react';
import { RouteObject } from 'react-router-dom';

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
      element: (
        <SettingsPage
          onSubTabChange={options?.onSubTabChange as any}
          onNavigateModule={options?.onNavigateModule}
        />
      ),
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
