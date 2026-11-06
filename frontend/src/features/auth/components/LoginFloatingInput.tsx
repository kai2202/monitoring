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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface LoginFloatingInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  icon?: IconDefinition;
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
        padding: '6px 14px',
        borderRadius: '14px',
        backgroundColor: isFocused ? '#ffffff' : '#f8fafc',
        border: isFocused ? '1.5px solid #0284c7' : '1px solid #f1f5f9',
        boxShadow: isFocused ? '0 0 0 3px rgba(2, 132, 199, 0.12)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '9.5px',
            color: isFocused ? '#0284c7' : '#94a3b8',
            fontWeight: isFocused ? 700 : 600,
            transition: 'color 0.15s ease',
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
            fontSize: '13px',
            fontWeight: 700,
            width: '100%',
            padding: 0,
            marginTop: '1px',
            letterSpacing: letterSpacing || 'normal',
          }}
        />
      </div>

      {rightAction ? (
        rightAction
      ) : icon ? (
        <span style={{ color: '#cbd5e1', fontSize: '13px', marginLeft: '6px' }}>
          <FontAwesomeIcon icon={icon} />
        </span>
      ) : null}
    </div>
  );
};

export default LoginFloatingInput;
