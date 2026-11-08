/**
 * Frontend/src/features/analytics/components/distribution/DeviceHorizontalBarRow.tsx
 *
 * Dòng Thiết Bị Thanh Ngang Phân Bổ Sản Lượng (Horizontal Stacked Bar Row):
 * - Hiển thị tỷ trọng Mono (#2563eb) và Color (#ec4899).
 * - Nút ghim nhanh 📌 (Pin Icon) đưa máy vào sàn đối chiếu.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faThumbtack } from '../../../../shared/icons';

export interface ProcessedPrinterItem {
  id: string;
  name: string;
  model: string;
  floorName: string;
  department: string;
  totalVol: number;
  monoVol: number;
  colorVol: number;
  monoPercent: number;
  colorPercent: number;
}

interface DeviceHorizontalBarRowProps {
  printer: ProcessedPrinterItem;
  idx: number;
  maxVolume: number;
  isPinned: boolean;
  onTogglePinPrinter: (id: string) => void;
}

export const DeviceHorizontalBarRow: React.FC<DeviceHorizontalBarRowProps> = ({
  printer: p,
  idx,
  maxVolume,
  isPinned,
  onTogglePinPrinter,
}) => {
  const barWidthPercent = maxVolume > 0 ? (p.totalVol / maxVolume) * 100 : 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '4px 8px',
        borderRadius: '10px',
        backgroundColor: isPinned ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
        border: isPinned ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid transparent',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Trục Tung Y-Axis: Thứ hạng & Tên máy */}
      <div style={{ width: '150px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: idx < 3 ? '#2563eb' : 'var(--text-muted, #94a3b8)',
              fontFamily: "'JetBrains Mono', monospace",
              width: '16px',
            }}
          >
            #{idx + 1}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-primary, #0f172a)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={p.name}
          >
            {p.name}
          </span>
        </div>
        <div style={{ fontSize: '9.5px', color: 'var(--text-muted, #64748b)', paddingLeft: '22px' }}>
          {p.floorName} • {p.department.split('&')[0]}
        </div>
      </div>

      {/* Thanh Ngang (Horizontal Bar): Stacked Mono & Color */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          height: '14px',
          backgroundColor: 'var(--bg-subtle, #f1f5f9)',
          borderRadius: '9999px',
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        <div
          style={{
            width: `${(barWidthPercent * p.monoPercent) / 100}%`,
            height: '100%',
            backgroundColor: '#2563eb',
            transition: 'width 0.3s ease',
          }}
          title={`Mono: ${p.monoVol.toLocaleString('vi-VN')} trang (${p.monoPercent}%)`}
        />
        <div
          style={{
            width: `${(barWidthPercent * p.colorPercent) / 100}%`,
            height: '100%',
            backgroundColor: '#ec4899',
            transition: 'width 0.3s ease',
          }}
          title={`Color: ${p.colorVol.toLocaleString('vi-VN')} trang (${p.colorPercent}%)`}
        />
      </div>

      {/* Số Liệu Sản Lượng */}
      <div style={{ width: '90px', textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#0f172a' }}>
          {p.totalVol.toLocaleString('vi-VN')}
        </div>
        <div style={{ fontSize: '9.5px', color: 'var(--text-muted, #64748b)' }}>
          trang ({p.colorPercent}% M)
        </div>
      </div>

      {/* Nút Ghim Nhanh 📌 */}
      <button
        type="button"
        onClick={() => onTogglePinPrinter(p.id)}
        title={isPinned ? 'Bỏ ghim khỏi khung đối chiếu' : 'Ghim vào khung đối chiếu'}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          border: isPinned ? '1px solid #2563eb' : '1px solid var(--border-color, #e2e8f0)',
          backgroundColor: isPinned ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-subtle, #f8fafc)',
          color: isPinned ? '#2563eb' : 'var(--text-muted, #94a3b8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
      >
        <FontAwesomeIcon icon={faThumbtack} />
      </button>
    </div>
  );
};

export default DeviceHorizontalBarRow;

