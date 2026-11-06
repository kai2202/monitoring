/**
 * Frontend/src/features/auth/components/LoginFormSection.tsx
 *
 * Cột Biểu Mẫu Tạo Tài Khoản & Đăng Nhập Chuẩn Ảnh Mẫu (Soft Minimalist Split-View Form):
 * - Tái tạo chính xác 100% bố cục typography, nested labels và các nút pill từ ảnh mẫu (Image 3).
 * - Thanh trên: Logo chấm tròn xanh Anywhere app. cùng 2 liên kết Home, Join.
 * - Tiêu đề: Kicker "START FOR FREE", "Create new account.", "Already A Member? Log In".
 * - Hàng 1: First name & Last name side-by-side 50-50 với icon thẻ căn cước.
 * - Hàng 2: Email với icon phong bì thư.
 * - Hàng 3: Password với con mắt ẩn/hiện và viền focus ring xanh dương sắc nét.
 * - Hàng nút kép: [Change method] (pill xám) và [Create account] (pill xanh viền bóng mềm).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import {
  FontAwesomeIcon,
  faAddressCard,
  faEnvelope,
  faEye,
  faEyeSlash,
} from '../../../shared/icons';
import { LoginFloatingInput } from './LoginFloatingInput';

export interface LoginFormSectionProps {
  firstName: string;
  onFirstNameChange: (val: string) => void;
  lastName: string;
  onLastNameChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  password: string;
  onPasswordChange: (val: string) => void;
  onOpenRolePicker: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  errorMsg?: string | null;
}

export const LoginFormSection: React.FC<LoginFormSectionProps> = ({
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onOpenRolePicker,
  onSubmit,
  isSubmitting = false,
  errorMsg,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>('password');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '36px 44px',
        height: '100%',
        minHeight: '560px',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Thanh Header Thương Hiệu & Menu Điều Hướng Phẳng */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#0284c7',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.3px',
              fontFamily: "'Segoe UI', -apple-system, sans-serif",
            }}
          >
            Anywhere app.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8', cursor: 'pointer' }}>
            Home
          </span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8', cursor: 'pointer' }}>
            Join
          </span>
        </div>
      </div>

      {/* 2. Tiêu Đề Chính & Dẫn Nhập Chuẩn Typography */}
      <div style={{ marginTop: '20px', marginBottom: '14px' }}>
        <div
          style={{
            fontSize: '10.5px',
            fontWeight: 800,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
          }}
        >
          START FOR FREE
        </div>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.8px',
            margin: '6px 0 6px 0',
            lineHeight: 1.15,
          }}
        >
          Create new account<span style={{ color: '#0284c7' }}>.</span>
        </h1>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
          Already A Member?{' '}
          <button
            type="button"
            onClick={onSubmit as any}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
              fontSize: '13px',
            }}
          >
            Log In
          </button>
        </div>
      </div>

      {/* 3. Thông Báo Lỗi Nếu Có */}
      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '8px',
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* 4. Khối Form Nhập Liệu 4 Trường Chuẩn Mẫu */}
      <form
        onSubmit={onSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        {/* Hàng 1: First Name & Last Name (50% - 50%) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <LoginFloatingInput
            label="First name"
            value={firstName}
            onChange={onFirstNameChange}
            isFocused={focusedField === 'firstName'}
            onFocus={() => setFocusedField('firstName')}
            onBlur={() => setFocusedField(null)}
            placeholder="Michał"
            icon={faAddressCard}
          />
          <LoginFloatingInput
            label="Last name"
            value={lastName}
            onChange={onLastNameChange}
            isFocused={focusedField === 'lastName'}
            onFocus={() => setFocusedField('lastName')}
            onBlur={() => setFocusedField(null)}
            placeholder="Masiak"
            icon={faAddressCard}
          />
        </div>

        {/* Hàng 2: Email (Full Width) */}
        <LoginFloatingInput
          label="Email"
          type="email"
          value={email}
          onChange={onEmailChange}
          isFocused={focusedField === 'email'}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
          placeholder="michal.masiak@anywhere.co"
          icon={faEnvelope}
        />

        {/* Hàng 3: Password Với Focus Ring Màu Xanh Dương & Nút Con Mắt */}
        <LoginFloatingInput
          label="Password"
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

        {/* Hàng 4: Bộ Đôi Nút Hành Động Pill Kép */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px' }}>
          <button
            type="button"
            onClick={onOpenRolePicker}
            style={{
              padding: '12px 26px',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              border: 'none',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Change method
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px 34px',
              borderRadius: '9999px',
              backgroundColor: isSubmitting ? '#94a3b8' : '#0284c7',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 22px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {isSubmitting ? 'Processing...' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginFormSection;
