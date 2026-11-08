import React from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { AnalyticsSubTab } from '../../types/analyticsUI';

const AnalyticsPage = React.lazy(() =>
  import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);

export interface AnalyticsRoutesOptions {
  onSubTabChange: (sub: AnalyticsSubTab) => void;
  onNavigateModule?: (tab: any) => void;
  onCreateTaskForPrinter?: (printer: any) => void;
}

export function getAnalyticsRoutes(options: AnalyticsRoutesOptions): RouteObject[] {
  return [
    {
      path: '/analytics',
      element: <Navigate to="/analytics/overview" replace />,
    },
    {
      path: '/analytics/analytics',
      element: <Navigate to="/analytics/overview" replace />,
    },
    {
      path: '/analytics/overview',
      element: (
        <AnalyticsPage
          activeSubTab="overview"
          onSubTabChange={options.onSubTabChange}
          onNavigateModule={options.onNavigateModule}
          onCreateTaskForPrinter={options.onCreateTaskForPrinter}
        />
      ),
    },
    {
      path: '/analytics/supplies',
      element: (
        <AnalyticsPage
          activeSubTab="supplies"
          onSubTabChange={options.onSubTabChange}
          onNavigateModule={options.onNavigateModule}
          onCreateTaskForPrinter={options.onCreateTaskForPrinter}
        />
      ),
    },
    {
      path: '/analytics/sla-cost',
      element: (
        <AnalyticsPage
          activeSubTab="sla-cost"
          onSubTabChange={options.onSubTabChange}
          onNavigateModule={options.onNavigateModule}
          onCreateTaskForPrinter={options.onCreateTaskForPrinter}
        />
      ),
    },
  ];
}
