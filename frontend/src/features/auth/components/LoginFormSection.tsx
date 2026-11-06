/**
 * Frontend/src/features/auth/components/LoginFormSection.tsx
 *
 * Biểu Mẫu Đăng Nhập Hệ Thống Doanh Nghiệp (Enterprise NOC Login Form):
 * - Chuẩn hóa cho hệ thống nội bộ FleetMonitor: Chỉ gồm Tên đăng nhập/Email và Mật khẩu.
 * - Loại bỏ hoàn toàn trường tự đăng ký tài khoản (First/Last name) và chọn vai trò giả lập.
 * - Tuân thủ AGENTS.md Rule 7 & Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import {
  FontAwesomeIcon,
  faEnvelope,
  faEye,
  faEyeSlash,
  faRightToBracket,
  faShieldCheck,
  faLock,
} from '../../../shared/icons';
import { LoginFloatingInput } from './LoginFloatingInput';

interface LoginFormSectionProps {
  identifier: string;
  onIdentifierChange: (val: string) => void;
  password: string;
  onPasswordChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  errorMsg?: string | null;
}

export const LoginFormSection: React.FC<LoginFormSectionProps> = ({
  identifier,
  onIdentifierChange,
  password,
  onPasswordChange,
  onSubmit,
  isSubmitting = false,
  errorMsg,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>('identifier');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '38px 44px',
        height: '100%',
        minHeight: '560px',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header Thương Hiệu Doanh Nghiệp */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              backgroundColor: '#2563eb',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '15.5px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.3px',
            }}
          >
            FleetMonitor Enterprise
          </span>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          <FontAwesomeIcon icon={faShieldCheck} style={{ fontSize: '11px' }} />
          <span>Xác thực nội bộ</span>
        </span>
      </div>

      {/* 2. Tiêu Đề Đăng Nhập */}
      <div style={{ marginTop: '28px', marginBottom: '12px' }}>
        <div
          style={{
            fontSize: '10.5px',
            fontWeight: 800,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          TRUNG TÂM GIÁM SÁT &amp; ĐIỀU PHỐI HẠM ĐỘI MÁY IN
        </div>
        <h1
          style={{
            fontSize: '30px',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.7px',
            margin: '6px 0 0 0',
            lineHeight: 1.2,
          }}
        >
          Đăng nhập hệ thống<span style={{ color: '#2563eb' }}>.</span>
        </h1>
        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '8px 0 0 0', lineHeight: 1.5 }}>
          Nhập tài khoản vận hành (IT NOC, Kỹ thuật viên hiện trường hoặc Quản trị tài sản) để tiếp tục.
        </p>
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

      {/* 4. Biểu Mẫu Đăng Nhập */}
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
        <LoginFloatingInput
          label="Tên đăng nhập hoặc Email"
          type="text"
          value={identifier}
          onChange={onIdentifierChange}
          isFocused={focusedField === 'identifier'}
          onFocus={() => setFocusedField('identifier')}
          onBlur={() => setFocusedField(null)}
          placeholder="admin hoặc email@fleetmonitor.vn"
          icon={faEnvelope}
        />

        <LoginFloatingInput
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={onPasswordChange}
          isFocused={focusedField === 'password'}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
          placeholder="Nhập mật khẩu bảo mật"
          letterSpacing={showPassword ? 'normal' : '2px'}
          rightAction={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'none',
                border: 'none',
                color: showPassword ? '#2563eb' : '#94a3b8',
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

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '13px 24px',
            borderRadius: '14px',
            backgroundColor: isSubmitting ? '#94a3b8' : '#2563eb',
            border: 'none',
            color: '#ffffff',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 18px rgba(37, 99, 235, 0.28)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          {isSubmitting ? (
            <span>Đang xác thực phiên đăng nhập...</span>
          ) : (
            <>
              <span>Đăng nhập hệ thống</span>
              <FontAwesomeIcon icon={faRightToBracket} style={{ fontSize: '12px' }} />
            </>
          )}
        </button>
      </form>

      {/* 5. Chân Trang Bảo Mật */}
      <div
        style={{
          marginTop: '20px',
          paddingTop: '14px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11.5px',
          color: '#64748b',
        }}
      >
        <FontAwesomeIcon icon={faLock} style={{ fontSize: '11px', color: '#94a3b8' }} />
        <span>
          Tài khoản được cấp phát và quản lý tập trung bởi Quản trị viên IT tại phân hệ Cấu hình RBAC.
        </span>
      </div>
    </div>
  );
};

export default LoginFormSection;
