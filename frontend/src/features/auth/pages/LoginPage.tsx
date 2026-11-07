/**
 * Frontend/src/features/auth/pages/LoginPage.tsx
 *
 * Màn hình Đăng Nhập Doanh Nghiệp Split-View Chuẩn Mẫu (Enterprise Portal UI):
 * - Bố cục Split-View: Cột trái form Enterprise 2 trường, Cột phải banner phong cảnh lượn sóng hữu cơ.
 * - Tự động nhận diện chế độ MOCK (có nút chọn vai trò demo) hoặc REAL (chuẩn hóa doanh nghiệp thuần khiết).
 * - Đấu nối trực tiếp xác thực JWT (`POST /api/auth/login`) qua authService.
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
import { LoginRoleModal, PredefinedRoleProfile } from '../components/LoginRoleModal';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isMockMode = DATA_SOURCE === 'mock';
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const handleSelectProfile = (profile: PredefinedRoleProfile) => {
    setUsernameOrEmail(profile.username || profile.email);
    setPassword('admin123');
    setIsRoleModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIdentifier = usernameOrEmail.trim() || 'admin';
    const cleanPass = password.trim() || 'admin123';

    setIsSubmitting(true);
    setErrorMsg(null);
    dispatch(loginStart());

    try {
      const isEmail = cleanIdentifier.includes('@');
      const loggedUser = await authService.login({
        username: isEmail ? undefined : cleanIdentifier,
        email: isEmail ? cleanIdentifier : undefined,
        password: cleanPass,
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
      const msg = err?.message || 'Thông tin xác thực không chính xác.';
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
      {/* Khung Card Master Split-View Viền Cong Lớn 32px */}
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
        {/* Cột Trái (~52%): Biểu mẫu nhập liệu Enterprise Form */}
        <div style={{ flex: '1 1 52%', minWidth: 0 }}>
          <LoginFormSection
            usernameOrEmail={usernameOrEmail}
            onUsernameOrEmailChange={setUsernameOrEmail}
            password={password}
            onPasswordChange={setPassword}
            isMockMode={isMockMode}
            onOpenRolePicker={() => setIsRoleModalOpen(true)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errorMsg={errorMsg}
          />
        </div>

        {/* Cột Phải (~48%): Banner Phong Cảnh Lượn Sóng Hữu Cơ */}
        <div style={{ flex: '1 1 48%', minWidth: 0, display: 'block' }}>
          <LoginLandscapeBanner />
        </div>
      </div>

      {/* Modal Chọn Nhanh Vai Trò Vận Hành (Chỉ mở khi click ở Mock) */}
      {isMockMode && (
        <LoginRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          onSelectProfile={handleSelectProfile}
        />
      )}
    </div>
  );
};

export default LoginPage;
