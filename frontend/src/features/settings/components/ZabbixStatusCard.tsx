/**
 * Frontend/src/features/settings/components/ZabbixStatusCard.tsx
 *
 * Thẻ Giám Sát Trạng Thái Zabbix Gateway (Chỉ Đọc - Read-only):
 * - Hiển thị trạng thái kết nối máy chủ Zabbix 7.0 LTS và chu kỳ Polling cố định.
 * - Cấu hình được cố định qua Backend Environment, Admin không có quyền sửa trên UI.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faBolt,
  faLock,
  faCircleCheck,
  faTriangleExclamation,
  faClock,
  faWifi,
  faShieldCheck,
} from '../../../shared/icons';

export interface ZabbixStatusCardProps {
  apiUrl?: string;
  fastPollInterval?: number;
  slowPollInterval?: number;
  isConnected?: boolean;
}

export const ZabbixStatusCard: React.FC<ZabbixStatusCardProps> = ({
  apiUrl = 'Chưa cấu hình ZABBIX_URL (Masked)',
  fastPollInterval = 60,
  slowPollInterval = 3600,
  isConnected = false,
}) => {
  return (
    <div
      style={{
        padding: '22px 24px',
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* 1. Header with Lock Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}
          >
            <FontAwesomeIcon icon={faBolt} style={{ fontSize: '18px' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Zabbix 7.0 LTS Monitoring Gateway
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: isConnected ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.12)',
                  color: isConnected ? '#16a34a' : '#d97706',
                }}
              >
                <FontAwesomeIcon icon={isConnected ? faCircleCheck : faTriangleExclamation} style={{ fontSize: '11px' }} />
                <span>{isConnected ? 'Đang kết nối' : 'Chưa xác nhận kết nối'}</span>
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Cổng thu thập dữ liệu SNMP Poller và giám sát trạng thái hạm đội máy in
            </p>
          </div>
        </div>

        {/* Hardened Environment Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
            fontWeight: 600,
          }}
          title="Cấu hình hệ thống được bảo vệ ở tầng máy chủ, không cho phép chỉnh sửa qua giao diện Web"
        >
          <FontAwesomeIcon icon={faLock} style={{ fontSize: '11px', color: '#f59e0b' }} />
          <span>Khóa bởi Backend Environment</span>
        </div>
      </div>

      {/* 2. Parameters Grid (Read-only) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          backgroundColor: 'var(--bg-subtle)',
          padding: '14px 16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Endpoint */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FontAwesomeIcon icon={faWifi} style={{ fontSize: '10.5px' }} />
            <span>Zabbix JSON-RPC Endpoint:</span>
          </div>
          <div
            style={{
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-primary)',
              fontWeight: 600,
              marginTop: '4px',
              wordBreak: 'break-all',
            }}
          >
            {apiUrl}
          </div>
        </div>

        {/* Fast Polling */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FontAwesomeIcon icon={faClock} style={{ fontSize: '10.5px', color: '#2563eb' }} />
            <span>Fast Polling (Ping &amp; Triggers):</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
            {fastPollInterval}s <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>(Cố định)</span>
          </div>
        </div>

        {/* Slow Polling */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FontAwesomeIcon icon={faClock} style={{ fontSize: '10.5px', color: '#8b5cf6' }} />
            <span>Slow Polling (Counters &amp; Mực):</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
            {Math.round(slowPollInterval / 60)} phút <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>(1 giờ/lần)</span>
          </div>
        </div>

        {/* Security Rule */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FontAwesomeIcon icon={faShieldCheck} style={{ fontSize: '10.5px', color: '#16a34a' }} />
            <span>Kênh truyền thông tin:</span>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>
            LAN &amp; Site-to-Site VPN
          </div>
        </div>
      </div>

      {/* 3. Security Notice Footer */}
      <div
        style={{
          fontSize: '11.5px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <FontAwesomeIcon icon={faLock} style={{ fontSize: '10.5px', color: 'var(--text-muted)' }} />
        <span>
          Chu kỳ scrape và địa chỉ máy chủ Zabbix được thiết lập cố định trong tệp cấu hình Backend để đảm bảo an toàn tải mạng.
          Mọi thay đổi cần được thực hiện trực tiếp từ máy chủ quản trị.
        </span>
      </div>
    </div>
  );
};

