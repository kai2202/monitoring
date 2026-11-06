/**
 * Frontend/src/features/auth/pages/LoginPage.tsx
 *
 * Màn hình Đăng Nhập Hệ Thống Vận Hành FleetMonitor:
 * - Đấu nối trực tiếp xác thực JWT + HTTP-Only Refresh Cookie (`POST /api/auth/login`).
 * - Hoàn toàn không chứa dữ liệu điền sẵn giả lập hay popup chọn vai trò demo.
 * - Tuân thủ AGENTS.md Rule 4, Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { DATA_SOURCE } from '../../../config/dataSource';
import { loginStart, loginSuccess, loginFailure } from '../../../app/slices/authSlice';
import { locationService } from '../../../services/locationService';
import { authService } from '../services/authService';
import { LoginFormSection } from '../components/LoginFormSection';
import { LoginLandscapeBanner } from '../components/LoginLandscapeBanner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = identifier.trim();

    if (!trimmedId || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập / Email và Mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    dispatch(loginStart());

    try {
      const loggedUser = await authService.login({
        username: trimmedId,
        email: trimmedId,
        password,
      });

      dispatch(loginSuccess(loggedUser));

      if (DATA_SOURCE === 'api') {
        await locationService.fetchBranches();
      }

      if (loggedUser.role === 'FIELD_TECHNICIAN' || loggedUser.role === 'FIELD_TECH') {
        navigate('/printers/timeline', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      const msg = err?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      setErrorMsg(msg);
      dispatch(loginFailure(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eef2f6',
        padding: '32px 20px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1040px',
          minHeight: '580px',
          backgroundColor: '#ffffff',
          borderRadius: '32px',
          border: '1px solid rgba(226, 232, 240, 0.85)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div style={{ flex: '1 1 52%', minWidth: 0 }}>
          <LoginFormSection
            identifier={identifier}
            onIdentifierChange={setIdentifier}
            password={password}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errorMsg={errorMsg}
          />
        </div>

        <div style={{ flex: '1 1 48%', minWidth: 0, display: 'block' }}>
          <LoginLandscapeBanner />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
