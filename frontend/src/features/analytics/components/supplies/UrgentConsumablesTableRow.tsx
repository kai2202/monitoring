/**
 * Frontend/src/features/analytics/components/supplies/UrgentConsumablesTableRow.tsx
 *
 * Dòng dữ liệu Bảng Cảnh Báo Cạn Kiệt Chủ Động:
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import { FontAwesomeIcon, faPlus, faFire, faWrench } from '../../../../shared/icons';
import { ConsumableAlertItem } from '../../../../types/analyticsUI';

interface UrgentConsumablesTableRowProps {
  alt: ConsumableAlertItem;
  onSelectAlertToDispatch: (alert: ConsumableAlertItem) => void;
}

export const UrgentConsumablesTableRow: React.FC<UrgentConsumablesTableRowProps> = ({
  alt,
  onSelectAlertToDispatch,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const isCritical = alt.currentPercent < 15;
  const isToner = ['black', 'cyan', 'magenta', 'yellow'].includes(alt.itemType);

  const getItemBadgeColor = (itemType: string) => {
    switch (itemType) {
      case 'black':
        return { bg: '#0f172a', text: '#ffffff', label: 'Toner K' };
      case 'cyan':
        return { bg: '#06b6d4', text: '#ffffff', label: 'Toner C' };
      case 'magenta':
        return { bg: '#ec4899', text: '#ffffff', label: 'Toner M' };
      case 'yellow':
        return { bg: '#eab308', text: '#ffffff', label: 'Toner Y' };
      case 'drum':
        return { bg: '#8b5cf6', text: '#ffffff', label: 'Drum' };
      case 'fuser':
        return { bg: '#f97316', text: '#ffffff', label: 'Fuser' };
      default:
        return { bg: '#64748b', text: '#ffffff', label: 'Vật tư' };
    }
  };

  const badgeInfo = getItemBadgeColor(alt.itemType);

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        backgroundColor: isCritical ? 'rgba(255, 241, 242, 0.45)' : 'transparent',
        transition: 'background-color 0.15s ease',
      }}
    >
      {/* Cột 1: Thiết bị & Vị trí */}
      <td style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}>
            {alt.printerName}
          </strong>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)' }}>
            {alt.floor} • {alt.department}
          </div>
        </div>
      </td>

      {/* Cột 2: Linh kiện cần chú ý */}
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '6px',
              backgroundColor: badgeInfo.bg,
              color: badgeInfo.text,
              fontSize: '9.5px',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {badgeInfo.label}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
              {alt.itemName}
            </span>
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: isToner ? '#2563eb' : '#ea580c',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              {isToner ? 'Mực in CMYK' : 'Cụm sấy / Trống'}
            </span>
          </div>
        </div>
      </td>

      {/* Cột 3: Mức % hiện tại kèm Progress Bar */}
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '130px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                backgroundColor: isCritical ? '#ffe4e6' : '#fef3c7',
                color: isCritical ? '#e11d48' : '#b45309',
                border: isCritical ? '1px solid #fda4af' : '1px solid #fde68a',
              }}
            >
              {alt.currentPercent}%
            </span>
            {isCritical && (
              <span style={{ fontSize: '10px', color: '#e11d48', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <FontAwesomeIcon icon={faFire} size="xs" />
                <span>Khẩn cấp</span>
              </span>
            )}
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '9999px',
              backgroundColor: 'var(--border-color, #e2e8f0)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.max(6, alt.currentPercent)}%`,
                height: '100%',
                borderRadius: '9999px',
                backgroundColor: isCritical ? '#f43f5e' : '#eab308',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </td>

      {/* Cột 4: Tốc độ tiêu hao (Burn Rate) */}
      <td style={{ padding: '14px 14px' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-secondary, #475569)',
          }}
        >
          ~{alt.dailyBurnRate}% / ngày
        </span>
      </td>

      {/* Cột 5: Thời gian dự kiến cạn kiệt */}
      <td style={{ padding: '14px 14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                padding: '2px 7px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                backgroundColor:
                  alt.daysRemaining <= 5
                    ? '#ffe4e6'
                    : alt.daysRemaining <= 14
                    ? '#fef3c7'
                    : '#ecfdf5',
                color:
                  alt.daysRemaining <= 5
                    ? '#e11d48'
                    : alt.daysRemaining <= 14
                    ? '#b45309'
                    : '#059669',
                border: `1px solid ${
                  alt.daysRemaining <= 5
                    ? '#fda4af'
                    : alt.daysRemaining <= 14
                    ? '#fde68a'
                    : '#a7f3d0'
                }`,
              }}
            >
              D-{alt.daysRemaining}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #475569)' }}>
              Còn {alt.daysRemaining} ngày
            </span>
          </div>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)' }}>
            Hết: {alt.estimatedEmptyDate}
          </span>
        </div>
      </td>

      {/* Cột 6: Nút Tạo lệnh cấp phát / Chi tiết vật tư */}
      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
        <button
          type="button"
          onClick={() => onSelectAlertToDispatch(alt)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '10px',
            backgroundColor: isAdmin ? (isCritical ? '#e11d48' : '#2563eb') : 'rgba(37, 99, 235, 0.08)',
            color: isAdmin ? '#ffffff' : '#2563eb',
            border: isAdmin ? 'none' : '1px solid rgba(37, 99, 235, 0.25)',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: isAdmin ? (isCritical ? '0 2px 6px rgba(225, 29, 72, 0.3)' : '0 2px 6px rgba(37, 99, 235, 0.25)') : 'none',
            transition: 'all 0.16s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <FontAwesomeIcon icon={isAdmin ? faPlus : faWrench} style={{ fontSize: '10.5px' }} />
          <span>{isAdmin ? 'Tạo task vật tư' : 'Chi tiết vật tư'}</span>
        </button>
      </td>
    </tr>
  );
};

