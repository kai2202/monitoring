/**
 * Frontend/src/features/auth/components/QuickRolePicker.tsx
 *
 * Khối chọn nhanh 3 vai trò demo cho FleetMonitor (Bento Cards 1-Click Login):
 * 1) ADMIN: Quản trị viên Hệ thống (IT & NOC)
 * 2) FIELD_TECH: Kỹ thuật viên Bảo trì Hiện trường
 * 3) ASSET_HR: HR / Quản lý Tài sản & Kiểm kê Hành chính
 *
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 * FontAwesome icons duy nhất.
 */

import React from 'react';
import { FontAwesomeIcon, faUserShield, faWrench, faFileLines } from '../../../shared/icons';
import { UserRole } from '../../../types/auth';

interface RoleOption {
  role: UserRole;
  title: string;
  name: string;
  desc: string;
  badge: string;
  color: string;
  icon: any;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'ADMIN',
    title: 'Quản trị viên Hệ thống (IT & NOC)',
    name: 'Nguyễn Văn An',
    desc: 'Toàn quyền 5 tầng, phê duyệt thiết bị, quản lý SLA, Zabbix & CSV mã lỗi',
    badge: 'Toàn quyền IT & NOC',
    color: '#2563eb',
    icon: faUserShield,
  },
  {
    role: 'FIELD_TECH',
    title: 'Kỹ thuật viên Hiện trường',
    name: 'Lê Hoàng Nam',
    desc: 'Lịch trình bảo trì Gantt, thực thi Dynamic Stepper %, ghi Work Log & ảnh',
    badge: 'Lệnh bảo trì & Stepper',
    color: '#f59e0b',
    icon: faWrench,
  },
  {
    role: 'ASSET_HR',
    title: 'HR / Kiểm kê Tài sản & Hành chính',
    name: 'Phạm Thu Hà',
    desc: 'Kiểm kê Serial, Model, điều chuyển vị trí máy, đối soát chi phí thuê máy',
    badge: 'Kiểm kê tài sản & CP',
    color: '#ec4899',
    icon: faFileLines,
  },
];

interface QuickRolePickerProps {
  onSelectRole: (role: UserRole) => void;
  activeRole?: UserRole;
  disabled?: boolean;
}

export const QuickRolePicker: React.FC<QuickRolePickerProps> = ({
  onSelectRole,
  activeRole,
  disabled = false,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Đăng nhập nhanh theo vai trò (1-Click Switch)
        </span>
        <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
          3 vai trò chuẩn hoá
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '10px',
        }}
      >
        {ROLE_OPTIONS.map((opt) => {
          const isSelected = activeRole === opt.role;
          return (
            <button
              key={opt.role}
              type="button"
              disabled={disabled}
              onClick={() => onSelectRole(opt.role)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-card, #ffffff)',
                border: isSelected ? '1.5px solid #2563eb' : '1px solid var(--border-color, #e2e8f0)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease-in-out',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: `${opt.color}15`,
                  color: opt.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '15px',
                }}
              >
                <FontAwesomeIcon icon={opt.icon} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                    {opt.name}
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: `${opt.color}15`,
                      color: opt.color,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {opt.badge}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
                  {opt.title}
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)', lineHeight: 1.35, marginTop: '2px' }}>
                  {opt.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
