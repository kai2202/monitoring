/**
 * Frontend/src/features/analytics/components/supplies/HighLoadFleetTableRow.tsx
 *
 * Dòng Thiết Bị Bảng Mức Vật Tư Hạm Đội Máy Tải Cao:
 * - Hiển thị tên máy, model, vị trí tầng & phòng ban, sản lượng tháng.
 * - Nhúng SuppliesSegmentedPillCell hiển thị 6 thành phần vật tư trực quan.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faArrowUpRightFromSquare } from '../../../../shared/icons';
import { PrinterConsumablesOverview } from '../../../../types/analyticsUI';
import { SuppliesSegmentedPillCell } from './SuppliesSegmentedPillCell';

export interface HighLoadFleetTableRowProps {
  printer: PrinterConsumablesOverview;
  onSelectPrinter?: (printer: PrinterConsumablesOverview) => void;
}

export const HighLoadFleetTableRow: React.FC<HighLoadFleetTableRowProps> = ({
  printer: p,
  onSelectPrinter,
}) => {
  const hasCritical =
    (p.tonerK ?? 100) < 15 ||
    (p.tonerC ?? 100) < 15 ||
    (p.tonerM ?? 100) < 15 ||
    (p.tonerY ?? 100) < 15 ||
    (p.drumLife ?? 100) < 15 ||
    (p.fuserLife ?? 100) < 15 ||
    p.wasteToner === 'Đầy';

  return (
    <tr
      key={p.printerId}
      onClick={() => onSelectPrinter && onSelectPrinter(p)}
      style={{
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        cursor: onSelectPrinter ? 'pointer' : 'default',
        backgroundColor: hasCritical ? 'rgba(255, 241, 242, 0.35)' : 'transparent',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hasCritical
          ? 'rgba(255, 228, 230, 0.6)'
          : 'var(--bg-subtle, rgba(0, 0, 0, 0.02))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = hasCritical
          ? 'rgba(255, 241, 242, 0.35)'
          : 'transparent';
      }}
    >
      {/* Cột 1: Thiết bị máy in */}
      <td style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}>
              {p.printerName}
            </strong>
            {hasCritical && (
              <span
                style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }}
                title="Có thành phần vật tư chạm ngưỡng khẩn cấp <15%"
              />
            )}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
            {p.model}
          </span>
        </div>
      </td>

      {/* Cột 2: Vị trí & Phòng ban */}
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
            {p.floor}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
            {p.department}
          </span>
        </div>
      </td>

      {/* Cột 3: Sản lượng tháng */}
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <strong
            style={{
              fontSize: '13.5px',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#2563eb',
            }}
          >
            {(p.totalMonthlyVolume || 0).toLocaleString('vi-VN')}
          </strong>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)' }}>trang</span>
        </div>
      </td>

      {/* Cột 4: Segmented Pill Indicators */}
      <td style={{ padding: '14px 20px' }}>
        <SuppliesSegmentedPillCell
          tonerK={p.tonerK}
          tonerC={p.tonerC}
          tonerM={p.tonerM}
          tonerY={p.tonerY}
          drumLife={p.drumLife}
          fuserLife={p.fuserLife}
          wasteToner={p.wasteToner}
        />
      </td>

      {/* Cột 5: Icon mở Drawer */}
      <td style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
        <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: '11px' }} />
      </td>
    </tr>
  );
};

export default HighLoadFleetTableRow;

