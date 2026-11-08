/**
 * Frontend/src/features/auth/pages/LoginPage.tsx
 *
 * Màn hình Đăng Nhập Doanh Nghiệp Split-View Chuẩn Mẫu (Enterprise Portal UI):
 * - Bố cục Full-Bleed Split-View (100vw x 100vh): Tràn viền toàn diện, loại bỏ hoàn toàn khoảng trống thừa.
 * - Cột trái: Form Enterprise chuẩn bảo mật 2 trường, căn giữa cân đối, header & footer doanh nghiệp.
 * - Cột phải: Banner phong cảnh lượn sóng hữu cơ (Organic S-Curve) trải dài toàn bộ chiều cao màn hình.
 * - Tự động nhận diện chế độ MOCK (có nút chọn vai trò demo) hoặc REAL (doanh nghiệp thuần khiết).
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
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Cột Trái (~48% - 50%): Biểu mẫu nhập liệu Enterprise Form chiếm toàn bộ chiều cao */}
      <div
        style={{
          flex: '1 1 48%',
          maxWidth: '52%',
          minWidth: '380px',
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
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

      {/* Cột Phải (~50% - 52%): Banner Phong Cảnh Lượn Sóng Hữu Cơ Tràn Viền Toàn Diện */}
      <div
        style={{
          flex: '1 1 52%',
          minWidth: 0,
          height: '100%',
          display: 'block',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        <LoginLandscapeBanner />
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
