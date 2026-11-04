/**
 * Frontend/src/routes/AppRoutes.tsx
 *
 * Định tuyến toàn ứng dụng với React Router v6 & Feature Route Manifest:
 * - Tích hợp Trang Đăng nhập & Route Guard kiểm tra quyền hạn 4 vai trò (RBAC).
 * - Suspense Skeleton Fallback chống Layout Shift.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { Suspense, useMemo } from 'react';
import { useRoutes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { AppShell } from '../components/layout/AppShell';
import { LoginPage } from '../features/auth';
import { ProtectedRoute } from './ProtectedRoute';
import { getDashboardRoutes } from '../features/dashboard';
import { getPrintersRoutes } from '../features/printers';
import { getAnalyticsRoutes } from '../features/analytics';
import { getSettingsRoutes } from '../features/settings';

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
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const role = user?.role;
  const isLoginPage = location.pathname === '/login';

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

  // Trang đích mặc định tùy vai trò người dùng
  const defaultHomePath = role === 'FIELD_TECHNICIAN' ? '/printers/timeline' : '/dashboard';

  const routes = useMemo(
    () => [
      {
        path: '/login',
        element: isAuthenticated ? <Navigate to={defaultHomePath} replace /> : <LoginPage />,
      },
      {
        path: '/',
        element: <Navigate to={defaultHomePath} replace />,
      },
      ...getDashboardRoutes({
        onNavigateModule: (tab) => handleSelectTab(tab),
        onCreateTaskForPrinter: () => navigate('/printers/list'),
      }).map((r) => ({
        ...r,
        element: <ProtectedRoute>{r.element as React.ReactElement}</ProtectedRoute>,
      })),
      ...getPrintersRoutes({
        onSubTabChange: (sub) => navigate(`/printers/${sub}`),
        onNavigateModule: (tab) => handleSelectTab(tab),
        onCreateTaskForPrinter: () => navigate('/printers/list'),
      }).map((r) => ({
        ...r,
        element: <ProtectedRoute>{r.element as React.ReactElement}</ProtectedRoute>,
      })),
      ...getAnalyticsRoutes({
        onSubTabChange: (sub) => navigate(`/analytics/${sub}`),
        onNavigateModule: (tab) => handleSelectTab(tab),
        onCreateTaskForPrinter: () => navigate('/printers/list'),
      }).map((r) => {
        const isSlaCostRoute = r.path?.includes('sla-cost');
        const allowedRoles = isSlaCostRoute
          ? (['ADMIN', 'ASSET_HR', 'FLEET_MANAGER', 'NOC_ENGINEER', 'DEPARTMENT_HEAD'] as any[])
          : undefined;
        return {
          ...r,
          element: (
            <ProtectedRoute allowedRoles={allowedRoles}>
              {r.element as React.ReactElement}
            </ProtectedRoute>
          ),
        };
      }),
      ...getSettingsRoutes().map((r) => ({
        ...r,
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'FLEET_MANAGER', 'NOC_ENGINEER']}>
            {r.element as React.ReactElement}
          </ProtectedRoute>
        ),
      })),
      {
        path: '*',
        element: <Navigate to={defaultHomePath} replace />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, role, defaultHomePath]
  );

  const routeElements = useRoutes(routes);

  // Nếu đang ở màn hình Đăng nhập -> không bọc AppShell
  if (isLoginPage) {
    return <Suspense fallback={<RouteLoadingFallback />}>{routeElements}</Suspense>;
  }

  return (
    <AppShell activeTab={getActiveTab() as any} onSelectTab={handleSelectTab as any}>
      <Suspense fallback={<RouteLoadingFallback />}>
        {routeElements}
      </Suspense>
    </AppShell>
  );
};

export default AppRoutes;
