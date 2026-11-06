/**
 * Frontend/src/routes/ProtectedRoute.tsx
 *
 * Route Guard kiểm tra trạng thái đăng nhập và quyền hạn vai trò (RBAC Guard).
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { UserRole } from '../types/auth';
import { FontAwesomeIcon, faShieldCheck } from '../shared/icons';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();
  const { user, isAuthenticated, isBootstrapping } = useSelector((state: RootState) => state.auth);

  if (isBootstrapping) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full animate-pulse">
        <div className="h-14 rounded-2xl bg-secondary/60 w-full" />
        <div className="h-72 rounded-2xl bg-secondary/40 w-full" />
      </div>
    );
  }

  // 1. Chưa đăng nhập -> Chuyển hướng sang trang Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Kiểm tra vai trò được phép truy cập
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: '16px',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}
        >
          <FontAwesomeIcon icon={faShieldCheck} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
          Truy Cập Bị Giới Hạn (403 Forbidden)
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)', maxWidth: '420px', lineHeight: 1.5, margin: 0 }}>
          Tài khoản của bạn đang có vai trò <strong>{user.roleNameVi}</strong> và không có quyền truy cập vào phân hệ này.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

