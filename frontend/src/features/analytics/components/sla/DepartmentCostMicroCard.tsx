/**
 * Frontend/src/features/analytics/components/sla/DepartmentCostMicroCard.tsx
 *
 * Thẻ Micro-Card Chi Tiết Phòng Ban:
 * - Hiển thị tên phòng ban, số máy, kinh phí (triệu VNĐ), tỷ trọng (%).
 * - Mini Progress Bar & phân rã sản lượng Mono/Màu.
 * - Hỗ trợ tương tác hover & click chọn để làm mờ (dimming) biểu đồ.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { DepartmentCostAllocationItem } from '../../../../types/analyticsUI';

export interface DrawnSegmentItem extends DepartmentCostAllocationItem {
  dashArray: string;
  dashOffset: number;
  totalPages: number;
}

interface DepartmentCostMicroCardProps {
  segment: DrawnSegmentItem;
  isActive: boolean;
  isDimmed: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

export const DepartmentCostMicroCard: React.FC<DepartmentCostMicroCardProps> = ({
  segment: seg,
  isActive,
  isDimmed,
  onHover,
  onSelect,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => onHover(seg.departmentId)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(seg.departmentId)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(seg.departmentId)}
      style={{
        padding: '9px 12px',
        borderRadius: '12px',
        backgroundColor: isActive ? `${seg.color}18` : 'var(--bg-subtle, #f8fafc)',
        border: isActive ? `1.5px solid ${seg.color}` : '1px solid var(--border-color, #e2e8f0)',
        cursor: 'pointer',
        transition: 'all 0.16s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        opacity: isDimmed ? 0.28 : 1,
        transform: isActive ? 'translateX(3px)' : 'none',
      }}
    >
      {/* Hàng 1: Tên phòng ban, badge máy, chi phí và % */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: seg.color, flexShrink: 0 }} />
          <span
            style={{
              fontSize: '11px',
              fontWeight: isActive ? 800 : 700,
              color: isActive ? seg.color : 'var(--text-primary, #0f172a)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={seg.departmentName}
          >
            {seg.departmentName}
          </span>
          <span style={{ fontSize: '9.5px', color: 'var(--text-muted, #64748b)', fontWeight: 500, flexShrink: 0 }}>
            ({seg.deviceCount} máy)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexShrink: 0 }}>
          <span
            style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: isActive ? seg.color : 'var(--text-primary, #0f172a)' }}
            title={`${(seg.totalCost || 0).toLocaleString('vi-VN')} VNĐ`}
          >
            {((seg.totalCost || 0) / 1000000).toFixed(1)} tr đ
          </span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
            {seg.percentageShare}%
          </span>
        </div>
      </div>

      {/* Hàng 2: Mini Progress Bar + Phân rã Mono / Color */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, height: '4px', borderRadius: '9999px', backgroundColor: 'var(--border-color, #e2e8f0)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.max(4, seg.percentageShare)}%`,
              height: '100%',
              borderRadius: '9999px',
              backgroundColor: seg.color,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <span style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
          {((seg.monoPages || 0) / 1000).toFixed(0)}k M • {((seg.colorPages || 0) / 1000).toFixed(0)}k C
        </span>
      </div>
    </div>
  );
};

export default DepartmentCostMicroCard;

