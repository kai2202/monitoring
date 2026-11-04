/**
 * Frontend/src/features/analytics/components/supplies/SuppliesSegmentedPillCell.tsx
 *
 * Chỉ Số Mức Vật Tư Cốt Lõi (Segmented Pill Indicators):
 * - Hiển thị các thanh nhộng mini inline trong cùng 1 ô (K, C, M, Y, Drum, Fuser, Waste Toner).
 * - Cảnh báo nổi bật Rose nếu có thành phần < 15% hoặc Hộp mực thải Đầy/Sắp đầy.
 * - Đối với máy đơn sắc (Monochrome) hoặc vật tư không hỗ trợ, hiển thị '—' thay vì '0%' (Chuẩn AGENTS.md Rule 5).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';

export interface SuppliesSegmentedPillCellProps {
  tonerK: number | null;
  tonerC: number | null;
  tonerM: number | null;
  tonerY: number | null;
  drumLife: number | null;
  fuserLife: number | null;
  wasteToner?: 'OK' | 'Sắp đầy' | 'Đầy';
  colorCapability?: 'Monochrome' | 'Color';
}

interface PillItem {
  key: string;
  label: string;
  name: string;
  value: number | null;
  color: string;
  textColor: string;
}

export const SuppliesSegmentedPillCell: React.FC<SuppliesSegmentedPillCellProps> = ({
  tonerK,
  tonerC,
  tonerM,
  tonerY,
  drumLife,
  fuserLife,
  wasteToner,
  colorCapability,
}) => {
  const isMono = colorCapability === 'Monochrome';

  const pills: PillItem[] = [
    { key: 'K', label: 'K', name: 'Mực Đen (K)', value: tonerK, color: '#0f172a', textColor: '#ffffff' },
    { key: 'C', label: 'C', name: 'Mực Xanh (C)', value: isMono || tonerC === 0 ? null : tonerC, color: '#06b6d4', textColor: '#ffffff' },
    { key: 'M', label: 'M', name: 'Mực Đỏ (M)', value: isMono || tonerM === 0 ? null : tonerM, color: '#ec4899', textColor: '#ffffff' },
    { key: 'Y', label: 'Y', name: 'Mực Vàng (Y)', value: isMono || tonerY === 0 ? null : tonerY, color: '#eab308', textColor: '#ffffff' },
    { key: 'D', label: 'D', name: 'Trống (Drum)', value: drumLife, color: '#8b5cf6', textColor: '#ffffff' },
    { key: 'F', label: 'F', name: 'Cụm sấy (Fuser)', value: fuserLife, color: '#f97316', textColor: '#ffffff' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'nowrap',
      }}
    >
      {pills.map((p) => {
        const val = p.value;
        const isUnsupported = val === null || val === undefined;
        const isCritical = !isUnsupported && val < 15;
        const isWarning = !isUnsupported && val >= 15 && val < 25;

        return (
          <div
            key={p.key}
            title={`${p.name}: ${isUnsupported ? 'Chưa có dữ liệu / Không hỗ trợ' : `${val}%`}`}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '52px',
              height: '24px',
              borderRadius: '9999px',
              backgroundColor: isCritical
                ? 'rgba(244, 63, 94, 0.12)'
                : isUnsupported
                ? 'rgba(0, 0, 0, 0.03)'
                : 'var(--bg-subtle, #f1f5f9)',
              border: isCritical
                ? '1.5px solid #f43f5e'
                : isWarning
                ? '1px solid rgba(234, 179, 8, 0.8)'
                : '1px solid var(--border-color, #e2e8f0)',
              overflow: 'hidden',
              userSelect: 'none',
              boxShadow: isCritical ? '0 0 6px rgba(244, 63, 94, 0.35)' : 'none',
              transition: 'all 0.18s ease',
              opacity: isUnsupported ? 0.6 : 1,
            }}
          >
            {/* Thanh tiến độ nền con bên trong Pill */}
            {!isUnsupported && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${Math.max(8, val)}%`,
                  backgroundColor: isCritical ? '#f43f5e' : p.color,
                  opacity: isCritical ? 0.28 : 0.18,
                  transition: 'width 0.3s ease',
                }}
              />
            )}

            {/* Chấm tròn chỉ thị màu + Nhãn chữ viết tắt */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0 5px',
                zIndex: 1,
              }}
            >
              <span
                style={{
                  width: '13px',
                  height: '13px',
                  borderRadius: '50%',
                  backgroundColor: isUnsupported ? '#94a3b8' : isCritical ? '#f43f5e' : p.color,
                  color: '#ffffff',
                  fontSize: '8.5px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {p.label}
              </span>

              <span
                style={{
                  fontSize: isUnsupported ? '11px' : '9.5px',
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: isUnsupported
                    ? 'var(--text-muted, #94a3b8)'
                    : isCritical
                    ? '#e11d48'
                    : isWarning
                    ? '#b45309'
                    : 'var(--text-secondary, #475569)',
                }}
              >
                {isUnsupported ? '—' : `${val}%`}
              </span>
            </div>
          </div>
        );
      })}

      {/* 7th Pill: Hộp mực thải (Waste Toner) */}
      {wasteToner && (
        <div
          title={`Hộp mực thải (Waste Toner): ${wasteToner}`}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '56px',
            height: '24px',
            borderRadius: '9999px',
            backgroundColor:
              wasteToner === 'Đầy'
                ? '#ffe4e6'
                : wasteToner === 'Sắp đầy'
                ? '#fef3c7'
                : 'var(--bg-subtle, #f1f5f9)',
            border:
              wasteToner === 'Đầy'
                ? '1.5px solid #f43f5e'
                : wasteToner === 'Sắp đầy'
                ? '1px solid #fde68a'
                : '1px solid var(--border-color, #e2e8f0)',
            overflow: 'hidden',
            userSelect: 'none',
            padding: '0 5px',
            justifyContent: 'space-between',
            boxShadow: wasteToner === 'Đầy' ? '0 0 6px rgba(244, 63, 94, 0.35)' : 'none',
          }}
        >
          <span
            style={{
              width: '13px',
              height: '13px',
              borderRadius: '50%',
              backgroundColor: wasteToner === 'Đầy' ? '#e11d48' : wasteToner === 'Sắp đầy' ? '#d97706' : '#64748b',
              color: '#ffffff',
              fontSize: '8px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            W
          </span>
          <span
            style={{
              fontSize: '8px',
              fontWeight: 700,
              color: wasteToner === 'Đầy' ? '#e11d48' : wasteToner === 'Sắp đầy' ? '#b45309' : '#16a34a',
              whiteSpace: 'nowrap',
            }}
          >
            {wasteToner === 'Đầy' ? 'Đầy 🛑' : wasteToner === 'Sắp đầy' ? 'Cảnh báo' : 'OK'}
          </span>
        </div>
      )}
    </div>
  );
};

export default SuppliesSegmentedPillCell;
