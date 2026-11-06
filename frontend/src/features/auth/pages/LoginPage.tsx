/**
 * Frontend/src/features/auth/pages/LoginPage.tsx
 *
 * Màn hình Đăng Nhập & Tạo Tài Khoản Split-View Chuẩn Mẫu (Image 3 UI):
 * - Bố cục Split-View 2 nửa: Cột trái form mềm mại, Cột phải phong cảnh Moraine Lake cắt lượn sóng hữu cơ.
 * - Hỗ trợ đầy đủ tương tác: Điền First/Last Name, Email, Password, chuyển vai trò qua [Change method].
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

  const [firstName, setFirstName] = useState('Michał');
  const [lastName, setLastName] = useState('Masiak');
  const [email, setEmail] = useState('michal.masiak@anywhere.co');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const handleSelectProfile = (profile: PredefinedRoleProfile) => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setEmail(profile.email);
    setPassword('admin123');
    setIsRoleModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim() || 'admin@fleetmonitor.vn';
    const cleanPass = password.trim() || 'admin123';

    setIsSubmitting(true);
    setErrorMsg(null);
    dispatch(loginStart());

    try {
      const loggedUser = await authService.login({
        username: cleanEmail,
        email: cleanEmail,
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
        {/* Cột Trái (~52%): Biểu mẫu nhập liệu Soft Minimalist Form */}
        <div style={{ flex: '1 1 52%', minWidth: 0 }}>
          <LoginFormSection
            firstName={firstName}
            onFirstNameChange={setFirstName}
            lastName={lastName}
            onLastNameChange={setLastName}
            email={email}
            onEmailChange={setEmail}
            password={password}
            onPasswordChange={setPassword}
            onOpenRolePicker={() => setIsRoleModalOpen(true)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errorMsg={errorMsg}
          />
        </div>

        {/* Cột Phải (~48%): Banner Ảnh Núi Hồ Uốn Lượn Sóng Hữu Cơ */}
        <div style={{ flex: '1 1 48%', minWidth: 0, display: 'block' }}>
          <LoginLandscapeBanner />
        </div>
      </div>

      {/* Modal Chuyển Đổi Phương Thức / Vai Trò Vận Hành */}
      <LoginRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSelectProfile={handleSelectProfile}
      />
    </div>
  );
};

export default LoginPage;
