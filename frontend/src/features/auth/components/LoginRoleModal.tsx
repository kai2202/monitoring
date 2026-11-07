/**
 * Frontend/src/features/auth/components/LoginRoleModal.tsx
 *
 * Modal Chọn Nhanh Vai Trò Vận Hành (Demo Role Profiles Modal):
 * - Hỗ trợ chọn nhanh 3 vai trò mẫu (Admin IT, Kỹ thuật viên hiện trường, HR Tài sản).
 * - Tự động điền tài khoản & mật khẩu phục vụ kiểm thử và trải nghiệm nhanh.
 * - Tuân thủ AGENTS.md Rule 7 & Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faXmark, faUserShield, faWrench, faFileLines, faCheck } from '../../../shared/icons';
import { UserRole } from '../../../types/auth';

export interface PredefinedRoleProfile {
  role: UserRole;
  username: string;
  fullName: string;
  email: string;
  title: string;
  badge: string;
  color: string;
  icon: any;
}

export const DEMO_PROFILES: PredefinedRoleProfile[] = [
  {
    role: 'ADMIN',
    username: 'admin',
    fullName: 'Nguyễn Văn An',
    email: 'admin@fleetmonitor.vn',
    title: 'Quản trị viên Hệ thống (IT & NOC 24/7)',
    badge: 'Toàn quyền Quản trị',
    color: '#0284c7',
    icon: faUserShield,
  },
  {
    role: 'FIELD_TECH',
    username: 'tech_nam',
    fullName: 'Lê Hoàng Nam',
    email: 'nam.le@fleetmonitor.vn',
    title: 'Kỹ thuật viên Hiện trường (Field Tech)',
    badge: 'Thực thi SOP & Bảo trì',
    color: '#f59e0b',
    icon: faWrench,
  },
  {
    role: 'ASSET_HR',
    username: 'hr_kiemke',
    fullName: 'Phạm Thu Hà',
    email: 'ha.pham@fleetmonitor.vn',
    title: 'HR / Kiểm kê Tài sản & Chi phí',
    badge: 'Kiểm kê & Hợp đồng SLA',
    color: '#ec4899',
    icon: faFileLines,
  },
];

interface LoginRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProfile: (profile: PredefinedRoleProfile) => void;
  selectedRole?: UserRole;
}

export const LoginRoleModal: React.FC<LoginRoleModalProps> = ({
  isOpen,
  onClose,
  onSelectProfile,
  selectedRole,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Chọn Nhanh Vai Trò Vận Hành
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Hồ sơ tài khoản mô phỏng (Dành cho kiểm thử &amp; Trải nghiệm nhanh)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '13px' }} />
          </button>
        </div>

        {/* Danh sách 3 Vai trò */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {DEMO_PROFILES.map((prof) => {
            const isSelected = selectedRole === prof.role;
            return (
              <div
                key={prof.role}
                onClick={() => {
                  onSelectProfile(prof);
                  onClose();
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '16px',
                  border: isSelected ? `1.5px solid ${prof.color}` : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.04)' : '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: `${prof.color}15`,
                      color: prof.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0,
                    }}
                  >
                    <FontAwesomeIcon icon={prof.icon} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                      {prof.fullName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {prof.title}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '1px' }}>
                      {prof.username} • {prof.email}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: prof.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoginRoleModal;
