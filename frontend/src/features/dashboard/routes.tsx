import React from 'react';
import { RouteObject } from 'react-router-dom';

const DashboardPage = React.lazy(() =>
  import('../../pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);

export interface DashboardRoutesOptions {
  onNavigateModule: (tab: any) => void;
  onCreateTaskForPrinter?: (printer: any) => void;
}

export function getDashboardRoutes(options: DashboardRoutesOptions): RouteObject[] {
  return [
    {
      path: '/dashboard',
      element: (
        <DashboardPage
          onNavigateModule={options.onNavigateModule}
          onCreateTaskForPrinter={options.onCreateTaskForPrinter}
        />
      ),
    },
  ];
}

