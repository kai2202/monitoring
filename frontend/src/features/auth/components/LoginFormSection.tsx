/**
 * Frontend/src/features/auth/components/LoginFormSection.tsx
 *
 * Cột Biểu Mẫu Đăng Nhập Doanh Nghiệp (Enterprise Sign In Form):
 * - Nhận diện thương hiệu FleetMonitor — Hệ Thống Giám Sát & Vận Hành Máy In.
 * - Form 2 trường chuẩn: Tên đăng nhập/Email và Mật khẩu.
 * - Chế độ Mock: Hiển thị thêm nút [Chọn vai trò Demo] chuyển đổi nhanh.
 * - Chế độ Real: Tinh gọn thuần khiết chuẩn Enterprise, không có badge.
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
        padding: '40px 48px',
        height: '100%',
        minHeight: '560px',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header Thương Hiệu FleetMonitor */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              boxShadow: '0 2px 10px rgba(2, 132, 199, 0.45)',
              display: 'inline-block',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span
              style={{
                fontSize: '17px',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.4px',
                fontFamily: "'Segoe UI', -apple-system, sans-serif",
              }}
            >
              FleetMonitor
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#94a3b8',
                letterSpacing: '0.2px',
              }}
            >
              Enterprise Portal
            </span>
          </div>
        </div>
      </div>

      {/* 2. Tiêu Đề Chính & Dẫn Nhập Chuẩn Typography Doanh Nghiệp */}
      <div style={{ marginTop: '24px', marginBottom: '18px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
          }}
        >
          HỆ THỐNG GIÁM SÁT &amp; VẬN HÀNH MÁY IN
        </div>
        <h1
          style={{
            fontSize: '30px',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.8px',
            margin: '8px 0 8px 0',
            lineHeight: 1.2,
          }}
        >
          Cổng Đăng Nhập Vận Hành<span style={{ color: '#0284c7' }}>.</span>
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#64748b',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Vui lòng nhập thông tin tài khoản được cấp phát nội bộ để truy cập hệ thống.
        </p>
      </div>

      {/* 3. Thông Báo Lỗi Nếu Có */}
      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            borderRadius: '14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '12px',
            lineHeight: 1.4,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* 4. Khối Form Nhập Liệu 2 Trường Chuẩn Enterprise */}
      <form
        onSubmit={onSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        {/* Trường 1: Tên đăng nhập hoặc Email */}
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

        {/* Trường 2: Mật khẩu với focus ring xanh và nút con mắt */}
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
                padding: '4px',
                fontSize: '13px',
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '18px',
          }}
        >
          {/* Nút Chọn vai trò Demo (Chỉ hiển thị khi chạy MOCK) */}
          {isMockMode && (
            <button
              type="button"
              onClick={onOpenRolePicker}
              style={{
                padding: '12px 22px',
                borderRadius: '9999px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '13px',
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
              <FontAwesomeIcon icon={faUserGear} style={{ fontSize: '13px', color: '#0284c7' }} />
              <span>Chọn vai trò Demo</span>
            </button>
          )}

          {/* Nút Đăng nhập hệ thống chính */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px 32px',
              borderRadius: '9999px',
              backgroundColor: isSubmitting ? '#94a3b8' : '#0284c7',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: isSubmitting ? 'none' : '0 8px 22px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flex: isMockMode ? 1 : 'none',
              minWidth: isMockMode ? 'auto' : '220px',
            }}
          >
            <FontAwesomeIcon icon={faRightToBracket} style={{ fontSize: '12px' }} />
            <span>{isSubmitting ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginFormSection;
