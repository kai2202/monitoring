/**
 * Frontend/src/features/auth/components/LoginFormSection.tsx
 *
 * Cột Biểu Mẫu Đăng Nhập Doanh Nghiệp (Enterprise Sign In Form):
 * - Nhận diện thương hiệu FleetMonitor — Hệ Thống Giám Sát & Vận Hành Máy In.
 * - Form 2 trường chuẩn: Tên đăng nhập/Email và Mật khẩu.
 * - Chế độ Mock: Hiển thị thêm nút [Chọn vai trò Demo] chuyển đổi nhanh.
 * - Chế độ Real: Tinh gọn thuần khiết chuẩn Enterprise, không có badge thừa.
 * - Bố cục căn giữa trang nhã, co giãn linh hoạt theo tỷ lệ màn hình (Responsive Full-Bleed).
 * - Tuân thủ AGENTS.md Rule 7 & Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import {
  FontAwesomeIcon,
  faUser,
  faEye,
  faEyeSlash,
  faUserGear,
  faRightToBracket,
  faLock,
} from '../../../shared/icons';
import { LoginFloatingInput } from './LoginFloatingInput';

export interface LoginFormSectionProps {
  usernameOrEmail: string;
  onUsernameOrEmailChange: (val: string) => void;
  password: string;
  onPasswordChange: (val: string) => void;
  isMockMode?: boolean;
  onOpenRolePicker: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  errorMsg?: string | null;
}

export const LoginFormSection: React.FC<LoginFormSectionProps> = ({
  usernameOrEmail,
  onUsernameOrEmailChange,
  password,
  onPasswordChange,
  isMockMode = false,
  onOpenRolePicker,
  onSubmit,
  isSubmitting = false,
  errorMsg,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>('usernameOrEmail');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(28px, 4.5vh, 52px) clamp(32px, 5vw, 68px)',
        height: '100%',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '580px',
        margin: '0 auto',
      }}
    >
      {/* 1. Header Thương Hiệu FleetMonitor */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.45)',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.7px',
                fontFamily: "'Segoe UI', -apple-system, sans-serif",
              }}
            >
              FleetMonitor
            </span>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.4px',
              }}
            >
              Enterprise Portal
            </span>
          </div>
        </div>
      </div>

      {/* 2. Phần Thân: Tiêu Đề Chính & Biểu Mẫu Nhập Liệu (Tự động căn giữa trục dọc) */}
      <div style={{ margin: 'auto 0', padding: '16px 0', width: '100%' }}>
        {/* Tiêu đề & Dẫn nhập chuẩn Typography Doanh Nghiệp */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#0284c7',
              textTransform: 'uppercase',
              letterSpacing: '1.8px',
            }}
          >
            HỆ THỐNG GIÁM SÁT &amp; VẬN HÀNH MÁY IN
          </div>
          <h1
            style={{
              fontSize: 'clamp(30px, 3.2vw, 38px)',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.9px',
              margin: '10px 0 12px 0',
              lineHeight: 1.22,
            }}
          >
            Cổng Đăng Nhập Vận Hành<span style={{ color: '#0284c7' }}>.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
            Vui lòng nhập thông tin tài khoản được cấp phát nội bộ để truy cập hệ thống.
          </p>
        </div>

        {/* Thông Báo Lỗi Nếu Có */}
        {errorMsg && (
          <div
            role="alert"
            style={{
              padding: '13px 18px',
              borderRadius: '14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
              lineHeight: 1.45,
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Khối Form Nhập Liệu 2 Trường Chuẩn Enterprise */}
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
          <LoginFloatingInput
            label="Tên đăng nhập hoặc Email"
            type="text"
            value={usernameOrEmail}
            onChange={onUsernameOrEmailChange}
            isFocused={focusedField === 'usernameOrEmail'}
            onFocus={() => setFocusedField('usernameOrEmail')}
            onBlur={() => setFocusedField(null)}
            placeholder="admin hoặc admin@fleetmonitor.vn"
            icon={faUser}
          />

          <LoginFloatingInput
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={onPasswordChange}
            isFocused={focusedField === 'password'}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            placeholder="••••••••"
            letterSpacing={showPassword ? 'normal' : '2.5px'}
            rightAction={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: showPassword ? '#0284c7' : '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            }
          />

          {/* Hàng nút hành động theo ngữ cảnh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px' }}>
            {isMockMode && (
              <button
                type="button"
                onClick={onOpenRolePicker}
                style={{
                  padding: '14px 24px',
                  borderRadius: '9999px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                title="Chọn nhanh vai trò thử nghiệm"
              >
                <FontAwesomeIcon icon={faUserGear} style={{ fontSize: '14.5px', color: '#0284c7' }} />
                <span>Chọn vai trò Demo</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '14px 36px',
                borderRadius: '9999px',
                backgroundColor: isSubmitting ? '#94a3b8' : '#0284c7',
                border: 'none',
                color: '#ffffff',
                fontSize: '14.5px',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: isSubmitting ? 'none' : '0 10px 25px rgba(2, 132, 199, 0.38)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '9px',
                flex: isMockMode ? 1 : 'none',
                minWidth: isMockMode ? 'auto' : '240px',
              }}
            >
              <FontAwesomeIcon icon={faRightToBracket} style={{ fontSize: '14px' }} />
              <span>{isSubmitting ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Footer Doanh Nghiệp (Enterprise Security & Compliance) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '20px',
          borderTop: '1px solid #f1f5f9',
          color: '#94a3b8',
          fontSize: '12px',
          fontWeight: 600,
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FontAwesomeIcon icon={faLock} style={{ fontSize: '12px', color: '#0284c7' }} />
          <span>Bảo mật cấp Doanh Nghiệp • Dual-Token JWT &amp; RBAC</span>
        </div>
        <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>v2.4 LTS</span>
      </div>
    </div>
  );
};

export default LoginFormSection;
