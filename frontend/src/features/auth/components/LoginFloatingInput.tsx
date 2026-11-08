/**
 * Frontend/src/features/auth/components/LoginFloatingInput.tsx
 *
 * Ô Nhập Liệu Chuẩn Mẫu (Nested Floating Label Input):
 * - Hỗ trợ label nhỏ lồng phía trên, input đậm phía dưới.
 * - Icon định danh bên phải (FontAwesome).
 * - Trạng thái focus viền xanh dương #0284c7 và hiệu ứng ring mềm mại.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon } from '../../../shared/icons';

interface LoginFloatingInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  icon?: any;
  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  rightAction?: React.ReactNode;
  letterSpacing?: string;
}

export const LoginFloatingInput: React.FC<LoginFloatingInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon,
  isFocused = false,
  onFocus,
  onBlur,
  rightAction,
  letterSpacing,
}) => {
  return (
    <div
      style={{
        padding: '13px 20px',
        borderRadius: '16px',
        backgroundColor: isFocused ? '#ffffff' : '#f8fafc',
        border: isFocused ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
        boxShadow: isFocused ? '0 0 0 4px rgba(2, 132, 199, 0.12)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.18s ease',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '11.5px',
            color: isFocused ? '#0284c7' : '#94a3b8',
            fontWeight: isFocused ? 700 : 600,
            transition: 'color 0.18s ease',
            textTransform: 'none',
          }}
        >
          {label}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          style={{
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: '#0f172a',
            fontSize: '15.5px',
            fontWeight: 700,
            width: '100%',
            padding: 0,
            marginTop: '4px',
            letterSpacing: letterSpacing || 'normal',
          }}
        />
      </div>

      {rightAction ? (
        rightAction
      ) : icon ? (
        <span style={{ color: '#94a3b8', fontSize: '15px', marginLeft: '8px' }}>
          <FontAwesomeIcon icon={icon} />
        </span>
      ) : null}
    </div>
  );
};

export default LoginFloatingInput;
