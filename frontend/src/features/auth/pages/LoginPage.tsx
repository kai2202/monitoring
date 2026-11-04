/**
 * Frontend/src/features/auth/pages/LoginPage.tsx
 *
 * Trang Đăng Nhập & Phân Quyền Vai Trò (Bento Minimalist Login):
 * - Hỗ trợ đăng nhập thông thường & Đăng nhập 1-Click theo vai trò demo.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  FontAwesomeIcon,
  faPrint,
  faLock,
  faUser,
  faRightToBracket,
} from '../../../shared/icons';
import { loginStart, loginSuccess, loginFailure } from '../../../app/slices/authSlice';
import { authService } from '../services/authService';
import { QuickRolePicker } from '../components/QuickRolePicker';
import { UserRole } from '../../../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('••••••••');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExecuteLogin = async (targetUsername: string, targetRole?: UserRole) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    dispatch(loginStart());

    try {
      let loggedUser;
      if (targetRole) {
        loggedUser = authService.getUserByRole(targetRole);
      } else {
        loggedUser = await authService.login({ username: targetUsername, password });
      }

      dispatch(loginSuccess(loggedUser));

      // Kỹ thuật viên hiện trường điều hướng thẳng tới Lịch trình bảo trì Gantt
      if (loggedUser.role === 'FIELD_TECHNICIAN' || loggedUser.role === 'FIELD_TECH') {
        navigate('/printers/timeline');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác';
      setErrorMsg(msg);
      dispatch(loginFailure(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập');
      return;
    }
    handleExecuteLogin(username);
  };

  const handleQuickRoleSelect = (role: UserRole) => {
    const user = authService.getUserByRole(role);
    setUsername(user.username);
    handleExecuteLogin(user.username, role);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-canvas, #f8fafc)',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: '24px',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '26px',
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              fontSize: '20px',
              flexShrink: 0,
            }}
          >
            <FontAwesomeIcon icon={faPrint} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.4px' }}>
              FleetMonitor
            </h1>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>
              Hệ thống Giám sát &amp; Quản trị Máy in Tập trung
            </span>
          </div>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary, #334155)' }}>
              Tên tài khoản (Username)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted, #94a3b8)', fontSize: '14px' }}>
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập admin, noc, tech, hoặc ketoan"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  color: 'var(--text-primary, #0f172a)',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary, #334155)' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted, #94a3b8)', fontSize: '14px' }}>
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  color: 'var(--text-primary, #0f172a)',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '4px',
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            <FontAwesomeIcon icon={faRightToBracket} />
            <span>{isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
          </button>
        </form>

        {/* Khối Đăng Nhập Nhanh Theo Vai Trò Demo */}
        <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '20px' }}>
          <QuickRolePicker onSelectRole={handleQuickRoleSelect} disabled={isSubmitting} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

