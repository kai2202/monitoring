import React from 'react';
import { RouteObject, Navigate } from 'react-router-dom';

const PrintersPage = React.lazy(() =>
  import('./pages/PrintersPage').then((m) => ({ default: m.PrintersPage }))
);

export interface PrintersRoutesOptions {
  onSubTabChange: (sub: 'printers' | 'timeline' | 'history') => void;
  onNavigateModule?: (tab: any) => void;
  onCreateTaskForPrinter?: (printer: any) => void;
}

export function getPrintersRoutes(options: PrintersRoutesOptions): RouteObject[] {
  return [
    {
      path: '/printers',
      element: <Navigate to="/printers/list" replace />,
    },
    {
      path: '/printers/printers',
      element: <Navigate to="/printers/list" replace />,
    },
    {
      path: '/printers/list',
      element: (
        <PrintersPage
          activeSubTab="printers"
          onSubTabChange={options.onSubTabChange}
          onNavigateModule={options.onNavigateModule}
          onCreateTaskForPrinter={options.onCreateTaskForPrinter}
        />
      ),
    },
    {
      path: '/printers/timeline',
      element: (
        <PrintersPage
          activeSubTab="timeline"
          onSubTabChange={options.onSubTabChange}
          onNavigateModule={options.onNavigateModule}
          onCreateTaskForPrinter={options.onCreateTaskForPrinter}
        />
      ),
    },
    {
      path: '/printers/history',
      element: (
        <PrintersPage
          activeSubTab="history"
          onSubTabChange={options.onSubTabChange}
          onNavigateModule={options.onNavigateModule}
          onCreateTaskForPrinter={options.onCreateTaskForPrinter}
        />
      ),
    },
  ];
}
