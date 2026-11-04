/**
 * Frontend/src/features/analytics/components/supplies/SuppliesAlertCardItem.tsx
 *
 * Thẻ Card Cảnh Báo Khẩn Cấp (<15%) phong cách Bento Grid:
 * - Viền đỏ nhẹ, nền nhạt, hiển thị rõ tốc độ hao hụt (burn rate) và countdown cạn kiệt.
 * - Nút [Tạo lệnh cấp phát] kích hoạt Dispatch Modal.
 * - Tuân thủ AGENTS.md Rule 7.1: FontAwesome duy nhất, < 300 LOC.
 */

import React from 'react';
import { FontAwesomeIcon, faWrench } from '../../../../shared/icons';
import { ConsumableAlertItem } from '../../../../types/analyticsUI';

interface SuppliesAlertCardItemProps {
  item: ConsumableAlertItem;
  onDispatch: (item: ConsumableAlertItem) => void;
}

const ITEM_COLOR_MAP: Record<string, string> = {
  black: '#0f172a',
  cyan: '#06b6d4',
  magenta: '#ec4899',
  yellow: '#eab308',
  drum: '#8b5cf6',
  fuser: '#f97316',
};

export const SuppliesAlertCardItem: React.FC<SuppliesAlertCardItemProps> = ({ item, onDispatch }) => {
  const isCritical = item.currentPercent < 15;
  const itemColor = ITEM_COLOR_MAP[item.itemType] || '#64748b';

  return (
    <div
      style={{
        padding: '18px 20px',
        borderRadius: '20px',
        backgroundColor: isCritical ? 'rgba(254, 242, 242, 0.45)' : 'var(--bg-card, #ffffff)',
        border: isCritical ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid var(--border-color, #e2e8f0)',
        boxShadow: isCritical ? '0 4px 14px -3px rgba(244, 63, 94, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div>
          <strong style={{ fontSize: '13.5px', color: 'var(--text-primary, #0f172a)' }}>
            {item.printerName}
          </strong>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
            {item.model} • {item.floor} ({item.department})
          </div>
        </div>
        <span
          style={{
            padding: '3px 8px',
            borderRadius: '9999px',
            fontSize: '10.5px',
            fontWeight: 700,
            backgroundColor: isCritical ? '#fee2e2' : '#fef3c7',
            color: isCritical ? '#dc2626' : '#d97706',
          }}
        >
          {isCritical ? 'Khẩn cấp' : 'Lưu ý'}
        </span>
      </div>

      {/* Consumable Info & Metric */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card, #ffffff)',
          padding: '10px 14px',
          borderRadius: '14px',
          border: '1px solid var(--border-color, #e2e8f0)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '4px',
              backgroundColor: itemColor,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            {item.itemName}
          </span>
        </div>

        <span
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: isCritical ? '#ef4444' : '#f59e0b',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {item.currentPercent}%
        </span>
      </div>

      {/* Burn rate & Days to empty */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted, #64748b)' }}>
        <div>
          Tốc độ hao hụt:{' '}
          <strong style={{ color: 'var(--text-primary, #0f172a)', fontFamily: "'JetBrains Mono', monospace" }}>
            ~{item.dailyBurnRate}%/ngày
          </strong>
        </div>
        <div>
          Cạn kiệt:{' '}
          <strong style={{ color: isCritical ? '#ef4444' : 'var(--text-primary, #0f172a)' }}>
            {item.daysRemaining} ngày nữa
          </strong>
        </div>
      </div>

      {/* Quick Action Button */}
      <button
        type="button"
        onClick={() => onDispatch(item)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '12px',
          backgroundColor: isCritical ? '#ef4444' : '#2563eb',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          boxShadow: isCritical ? '0 2px 6px rgba(239, 68, 68, 0.25)' : '0 2px 6px rgba(37, 99, 235, 0.25)',
          transition: 'opacity 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <FontAwesomeIcon icon={faWrench} style={{ fontSize: '13px' }} />
        <span>Tạo lệnh cấp phát</span>
      </button>
    </div>
  );
};
