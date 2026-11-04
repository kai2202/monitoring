/**
 * Frontend/src/routes/AppRoutes.tsx
 *
 * Định tuyến toàn ứng dụng với React Router v6 & Feature Route Manifest:
 * - Áp dụng Rule 7.1: Phân tán định tuyến cho từng feature module (dashboard, printers, analytics, settings).
 * - Suspense Skeleton Fallback chống Layout Shift.
 * - Hạn chế tối đa Git merge conflicts khi thêm nhiều phân hệ mới trong tương lai.
 */

import React, { Suspense, useMemo } from 'react';
import { useRoutes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { getDashboardRoutes } from '../features/dashboard';
import { getPrintersRoutes } from '../features/printers';
import { getAnalyticsRoutes } from '../features/analytics';
import { getSettingsRoutes } from '../features/settings';

// Fallback Loading Skeleton mượt mà
const RouteLoadingFallback: React.FC = () => (
  <div className="flex flex-col gap-6 p-6 w-full animate-pulse">
    <div className="h-14 rounded-2xl bg-secondary/60 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
      <div className="h-28 rounded-2xl bg-secondary/50" />
      <div className="h-28 rounded-2xl bg-secondary/50" />
      <div className="h-28 rounded-2xl bg-secondary/50" />
      <div className="h-28 rounded-2xl bg-secondary/50" />
    </div>
    <div className="h-96 rounded-2xl bg-secondary/40 w-full" />
  </div>
);

export const AppRoutes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map path hiện tại về activeTab cho Sidebar
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/printers/timeline')) return 'printers-timeline';
    if (path.startsWith('/printers/history')) return 'printers-history';
    if (path.startsWith('/printers')) return 'printers';
    if (path.startsWith('/analytics/supplies')) return 'analytics-supplies';
    if (path.startsWith('/analytics/sla-cost')) return 'analytics-sla-cost';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  // Handler khi click chọn tab trên Sidebar
  const handleSelectTab = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'printers':
        navigate('/printers/list');
        break;
      case 'printers-timeline':
        navigate('/printers/timeline');
        break;
      case 'printers-history':
        navigate('/printers/history');
        break;
      case 'analytics':
        navigate('/analytics/overview');
        break;
      case 'analytics-supplies':
        navigate('/analytics/supplies');
        break;
      case 'analytics-sla-cost':
        navigate('/analytics/sla-cost');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const routes = useMemo(
    () => [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      ...getDashboardRoutes({
        onNavigateModule: (tab) => handleSelectTab(tab),
        onCreateTaskForPrinter: () => navigate('/printers/list'),
      }),
      ...getPrintersRoutes({
        onSubTabChange: (sub) => navigate(`/printers/${sub}`),
        onNavigateModule: (tab) => handleSelectTab(tab),
        onCreateTaskForPrinter: () => navigate('/printers/list'),
      }),
      ...getAnalyticsRoutes({
        onSubTabChange: (sub) => navigate(`/analytics/${sub}`),
        onNavigateModule: (tab) => handleSelectTab(tab),
        onCreateTaskForPrinter: () => navigate('/printers/list'),
      }),
      ...getSettingsRoutes(),
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const routeElements = useRoutes(routes);

  return (
    <AppShell activeTab={getActiveTab() as any} onSelectTab={handleSelectTab as any}>
      <Suspense fallback={<RouteLoadingFallback />}>
        {routeElements}
      </Suspense>
    </AppShell>
  );
};

export default AppRoutes;
