/**
 * Frontend/src/features/settings/components/SettingsPageHeader.tsx
 *
 * Header Phân Hệ Cấu Hình & Quản Trị (Settings Page Header Card):
 * - Hàng 1: Tiêu đề + Phụ đề động (bên trái) và Thanh điều hướng Sub-tab (góc phải trên cùng).
 * - Hàng 2: Toolbar tác vụ ngữ cảnh và nút làm mới dữ liệu.
 * - Đảm bảo cấu trúc 2 hàng đồng bộ 100% với PrintersPageHeader và AnalyticsPageHeader.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faGear,
  faBolt,
  faUserShield,
  faShieldCheck,
  faMicrochip,
  faRotate,
} from '../../../shared/icons';
import { SettingsSubTab } from '../../../types/settings';

export interface SettingsPageHeaderProps {
  activeTab: SettingsSubTab;
  onTabChange: (tab: SettingsSubTab) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const SettingsPageHeader: React.FC<SettingsPageHeaderProps> = ({
  activeTab,
  onTabChange,
  isLoading,
  onRefresh,
}) => {
  const subTabs = [
    { id: 'gateway' as const, label: 'Gateway & Kết nối', icon: faBolt },
    { id: 'rbac' as const, label: 'Người dùng & Phân quyền', icon: faUserShield },
    { id: 'rules' as const, label: 'Quy tắc & Ngưỡng', icon: faShieldCheck },
    { id: 'dictionary' as const, label: 'Từ điển mã lỗi', icon: faMicrochip },
  ];

  const getSubTitle = () => {
    switch (activeTab) {
      case 'gateway':
        return 'Giám sát cổng Zabbix 7.0 LTS Gateway, độ trễ phản hồi JSON-RPC và chu kỳ quét SNMP Poller';
      case 'rbac':
        return 'Quản trị danh sách người dùng đa vai trò và phân bổ phạm vi chi nhánh / tầng giám sát';
      case 'rules':
        return 'Thiết lập quy tắc Safe Window tự động đóng sự cố và ngưỡng cảnh báo mực in/an toàn nhiệt độ';
      case 'dictionary':
        return 'Bảng tra cứu mã lỗi phần cứng chuẩn hóa đa thương hiệu phục vụ công tác chẩn đoán hiện trường';
      default:
        return 'Quản lý toàn diện cấu hình hệ thống, bảo vệ an toàn vận hành hạm đội máy in';
    }
  };

  const getActiveIcon = () => {
    switch (activeTab) {
      case 'gateway':
        return faBolt;
      case 'rbac':
        return faUserShield;
      case 'rules':
        return faShieldCheck;
      case 'dictionary':
        return faMicrochip;
      default:
        return faGear;
    }
  };

  return (
    <div
      style={{
        padding: '18px 22px',
        borderRadius: 'var(--radius-card, 20px)',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      }}
    >
      {/* HÀNG 1: Tiêu Đề Thông Tin (Bên Trái) & Điều Hướng Sub-tab (Góc Phải Trên Cùng) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Khối Thông Tin Tiêu Đề */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-subtle, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}
          >
            <FontAwesomeIcon icon={getActiveIcon()} style={{ fontSize: '18px' }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-primary, #0f172a)',
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              Cài Đặt Hệ Thống &amp; Quy Tắc Vận Hành
            </h1>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-muted, #64748b)',
                margin: '3px 0 0 0',
                maxWidth: '650px',
              }}
            >
              {getSubTitle()}
            </p>
          </div>
        </div>

        {/* Thanh Điều Hướng Sub-tab (Góc Phải Trên Cùng Chuẩn Ảnh 1) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-subtle, #f1f5f9)',
            padding: '3px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color, #e2e8f0)',
            gap: '2px',
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          {subTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`subtab-pill-btn ${isActive ? 'active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: isActive ? '1px solid rgba(37, 99, 235, 0.4)' : '1px solid transparent',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary, #475569)',
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.35)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transform: isActive ? 'scale(1.02)' : 'none',
                }}
              >
                <FontAwesomeIcon
                  icon={tab.icon}
                  style={{
                    fontSize: '11.5px',
                    color: isActive ? '#ffffff' : 'var(--text-muted, #64748b)',
                  }}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* HÀNG 2: Toolbar Tác Vụ Ngữ Cảnh */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-color, #f1f5f9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
          <span>Hệ thống bảo vệ máy chủ &amp; Gateway: <strong>Hoạt động bình thường</strong></span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color, #e2e8f0)',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
            color: 'var(--text-secondary, #475569)',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: isLoading ? 'wait' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <FontAwesomeIcon
            icon={faRotate}
            style={{
              fontSize: '11px',
              animation: isLoading ? 'spin 1s linear infinite' : 'none',
            }}
          />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPageHeader;

