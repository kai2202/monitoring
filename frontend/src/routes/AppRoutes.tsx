/**
 * Frontend/src/routes/AppRoutes.tsx
 *
 * Định tuyến toàn ứng dụng với React Router v6 & Feature Route Manifest:
 * - Tích hợp Trang Đăng nhập & Route Guard kiểm tra quyền hạn 4 vai trò (RBAC).
 * - Suspense Skeleton Fallback chống Layout Shift.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { Suspense, useMemo, useEffect } from 'react';
import { useRoutes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { DATA_SOURCE } from '../config/dataSource';
import { logout, updateAccessToken, loginSuccess, finishBootstrap } from '../app/slices/authSlice';
import { registerAuthSessionHandlers } from '../services/providers/api/apiClient';
import { locationService } from '../services/locationService';
import { authService } from '../features/auth/services/authService';
import { AppShell } from '../components/layout/AppShell';
import { LoginPage } from '../features/auth';
import { ProtectedRoute } from './ProtectedRoute';
import { getDashboardRoutes } from '../features/dashboard';
import { getPrintersRoutes } from '../features/printers';
import { getAnalyticsRoutes } from '../features/analytics';
import { getSettingsRoutes } from '../features/settings';

const InventoryPage = React.lazy(() => import('../features/inventory').then((m) => ({ default: m.InventoryPage })));
const ProcurementPage = React.lazy(() => import('../features/procurement').then((m) => ({ default: m.ProcurementPage })));

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
  const dispatch = useDispatch();
  const { user, isAuthenticated, isBootstrapping } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    registerAuthSessionHandlers({
      onTokenRefreshed: (newToken) => dispatch(updateAccessToken(newToken)),
      onSessionExpired: () => {
        dispatch(logout());
        navigate('/login', { replace: true });
      },
    });
  }, [dispatch, navigate]);

  useEffect(() => {
    if (DATA_SOURCE !== 'api') {
      dispatch(finishBootstrap());
      return;
    }

    let cancelled = false;
    authService
      .getCurrentSession(user?.token)
      .then((freshUser) => {
        if (cancelled) return;
        if (freshUser) {
          dispatch(loginSuccess(freshUser));
          locationService.fetchBranches();
        } else {
          dispatch(logout());
        }
      })
      .catch(() => {
        if (!cancelled) dispatch(logout());
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (path.startsWith('/inventory')) return 'inventory';
    if (path.startsWith('/procurement')) return 'procurement';
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
      case 'inventory':
        navigate('/inventory');
        break;
      case 'procurement':
        navigate('/procurement');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        navigate('/dashboard');
    }
  };

  // Trang đích mặc định tùy vai trò người dùng (KTV vào thẳng Lịch trình Gantt)
  const isFieldTech = role === 'FIELD_TECH' || role === 'FIELD_TECHNICIAN';
  const defaultHomePath = isFieldTech ? '/printers/timeline' : '/dashboard';

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
        onSubTabChange: (sub) => {
          if (sub === 'printers' || (sub as string) === 'list') {
            navigate('/printers/list');
          } else {
            navigate(`/printers/${sub}`);
          }
        },
        onNavigateModule: (tab) => handleSelectTab(tab),
        onCreateTaskForPrinter: () => navigate('/printers/list'),
      }).map((r) => ({
        ...r,
        element: <ProtectedRoute>{r.element as React.ReactElement}</ProtectedRoute>,
      })),
      ...getAnalyticsRoutes({
        onSubTabChange: (sub) => {
          if (sub === 'overview' || (sub as string) === 'analytics') {
            navigate('/analytics/overview');
          } else {
            navigate(`/analytics/${sub}`);
          }
        },
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
      ...getSettingsRoutes({
        onSubTabChange: (sub) => {
          navigate(`/settings/${sub}`);
        },
        onNavigateModule: (tab) => handleSelectTab(tab),
      }).map((r) => ({
        ...r,
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'FLEET_MANAGER']}>
            {r.element as React.ReactElement}
          </ProtectedRoute>
        ),
      })),
      {
        path: '/inventory',
        element: (
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/procurement',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'ASSET_HR', 'FLEET_MANAGER', 'DEPARTMENT_HEAD']}>
            <ProcurementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to={defaultHomePath} replace />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, role, defaultHomePath, navigate]
  );

  const routeElements = useRoutes(routes);

  // Nếu đang ở màn hình Đăng nhập hoặc chưa xác thực xong -> không hiển thị Sidebar AppShell
  if (isLoginPage || (!isAuthenticated && !isBootstrapping)) {
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
