/**
 * Frontend/src/features/analytics/components/sla/CostAllocationArcChart.tsx
 *
 * Biểu đồ Vòng Cung Bán Nguyệt 180° Bố Cục Side-by-Side (Bento Layout):
 * - Cột Trái (~42%): Vòng cung Donut nét mỏng 11px, tâm hiển thị tổng chi phí động theo hover/chọn.
 * - Cột Phải (~58%): 5 Thẻ Micro-Cards phòng ban kèm hiệu ứng Dimming khi chọn.
 * - Nút hủy chọn tại chỗ [↺ Đang xem: ...] giúp reset trạng thái nhanh chóng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon, faRotate } from '../../../../shared/icons';
import { DepartmentCostAllocationItem } from '../../../../types/analyticsUI';
import { DepartmentCostMicroCard, DrawnSegmentItem } from './DepartmentCostMicroCard';

interface CostAllocationArcChartProps {
  departments?: DepartmentCostAllocationItem[];
}

export const CostAllocationArcChart: React.FC<CostAllocationArcChartProps> = ({
  departments = [],
}) => {
  const [hoveredDeptId, setHoveredDeptId] = useState<string | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  const safeList = useMemo(() => departments || [], [departments]);

  const totalCost = useMemo(() => safeList.reduce((sum, d) => sum + (d?.totalCost || 0), 0), [safeList]);

  // Geometry cho Vòng cung bán nguyệt 180°
  const cx = 140, cy = 125, radius = 86, strokeWidth = 11;
  const arcLength = Math.PI * radius; // ~270.17px

  const drawnSegments = useMemo<DrawnSegmentItem[]>(() => {
    let acc = 0;
    return safeList.map((dept) => {
      const pct = dept?.percentageShare || 0;
      const len = (pct / 100) * arcLength;
      const gap = 3.5;
      const dashLen = Math.max(1, len - gap);
      const slice: DrawnSegmentItem = {
        ...dept,
        dashArray: `${dashLen} 1000`,
        dashOffset: -acc,
        totalPages: (dept?.monoPages || 0) + (dept?.colorPages || 0),
      };
      acc += len;
      return slice;
    });
  }, [safeList, arcLength]);

  const activeDeptId = hoveredDeptId || selectedDeptId;
  const activeDept = useMemo(() => {
    return drawnSegments.find((d) => d.departmentId === activeDeptId) || null;
  }, [drawnSegments, activeDeptId]);

  const totalDeviceCount = useMemo(() => safeList.reduce((sum, d) => sum + (d?.deviceCount || 0), 0), [safeList]);
  const totalColorCost = useMemo(() => safeList.reduce((sum, d) => sum + (d?.colorCost || 0), 0), [safeList]);
  const colorShare = totalCost > 0 ? ((totalColorCost / totalCost) * 100).toFixed(0) : '0';
  const avgCostPerDevice = totalDeviceCount > 0 ? (totalCost / totalDeviceCount / 1000000).toFixed(1) : '0';

  const handleToggleSelect = (deptId: string) => {
    setSelectedDeptId((prev) => (prev === deptId ? null : deptId));
  };

  return (
    <div
      style={{
        padding: '22px 24px',
        borderRadius: '24px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header Khối */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              boxShadow: '0 0 8px rgba(37, 99, 235, 0.5)',
            }}
          />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
            Chi phí theo phòng ban
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedDeptId && (
            <button
              type="button"
              onClick={() => setSelectedDeptId(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                color: '#2563eb',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <FontAwesomeIcon icon={faRotate} style={{ fontSize: '10px' }} />
              <span>Xem tất cả</span>
            </button>
          )}
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
            Kỳ 30 ngày • {safeList.length} phòng ban
          </span>
        </div>
      </div>

      {/* 2. Bố cục Side-by-Side hoặc Trạng Thái Rỗng (Clean Slate) */}
      {safeList.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-muted, #64748b)',
            fontSize: '13px',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
            borderRadius: '16px',
            border: '1px dashed var(--border-color, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            Chưa có dữ liệu hạch toán chi phí phòng ban
          </span>
          <span style={{ fontSize: '12px' }}>
            Dữ liệu phân bổ ngân sách sẽ tự động tổng hợp khi hạm đội phát sinh bản in tại các phòng ban.
          </span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start', flex: 1 }}>
          {/* CỘT TRÁI: SVG Semi-Donut Arc 180° Nét Mảnh & Micro KPIs */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', width: '100%' }}>
            <div style={{ position: 'relative', width: '280px', height: '155px', marginTop: '6px' }}>
              {/* Top Pill động */}
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: activeDept ? activeDept.color : '#0f172a',
                  color: '#ffffff',
                  padding: '2.5px 11px',
                  borderRadius: '9999px',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)',
                  zIndex: 3,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {activeDept
                  ? `${activeDept.departmentName}: ${activeDept.percentageShare}%`
                  : `Top 1: ${safeList[0]?.departmentName || 'Chưa có'} (${safeList[0]?.percentageShare || 0}%)`}
              </div>

              <svg width="280" height="150" viewBox="0 0 280 150" style={{ overflow: 'visible' }}>
                <path
                  d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
                  fill="none"
                  stroke="var(--border-color, #f1f5f9)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
                {drawnSegments.map((seg) => {
                  const isCurrentActive = activeDeptId === seg.departmentId;
                  const isDimmed = activeDeptId !== null && !isCurrentActive;
                  return (
                    <path
                      key={seg.departmentId}
                      d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={isCurrentActive ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                      strokeLinecap="round"
                      onMouseEnter={() => setHoveredDeptId(seg.departmentId)}
                      onMouseLeave={() => setHoveredDeptId(null)}
                      onClick={() => handleToggleSelect(seg.departmentId)}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        filter: isCurrentActive ? `drop-shadow(0 0 6px ${seg.color}88)` : 'none',
                        opacity: isDimmed ? 0.22 : 1,
                      }}
                    />
                  );
                })}
              </svg>

              {/* Tâm Vòng Cung */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  pointerEvents: 'none',
                  maxWidth: '170px',
                }}
              >
                <span style={{ fontSize: '10.5px', color: activeDept ? activeDept.color : 'var(--text-muted, #64748b)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                  {activeDept ? activeDept.departmentName : 'Tổng chi phí in kỳ'}
                </span>
                <span style={{ fontSize: activeDept ? '18px' : '20px', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.5px', marginTop: '1px' }}>
                  {activeDept ? `${(activeDept.totalCost || 0).toLocaleString('vi-VN')} đ` : `${totalCost.toLocaleString('vi-VN')} đ`}
                </span>
              </div>
            </div>

            {/* Phân rã Mono / Color */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
                Đơn sắc: {((totalCost - totalColorCost) / 1000000).toFixed(1)} tr ({100 - Number(colorShare)}%)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#ec4899' }} />
                Màu: {(totalColorCost / 1000000).toFixed(1)} tr ({colorShare}%)
              </span>
            </div>

            {/* 2 Micro-Cards Bổ Trợ Dưới Vòng Cung để Cân Bằng Chiều Cao */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '300px' }}>
              <div style={{ padding: '8px 10px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Chi Phí TB / Máy</div>
                <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#2563eb', marginTop: '2px' }}>
                  {avgCostPerDevice} tr đ
                </div>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Tỷ Trọng In Màu</div>
                <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#ec4899', marginTop: '2px' }}>
                  {colorShare}%
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: 5 Micro-Cards Phòng Ban Kèm Hiệu Ứng Dimming */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {drawnSegments.map((seg) => {
              const isCurrentActive = activeDeptId === seg.departmentId;
              const isDimmed = activeDeptId !== null && !isCurrentActive;

              return (
                <DepartmentCostMicroCard
                  key={seg.departmentId}
                  segment={seg}
                  isActive={isCurrentActive}
                  isDimmed={isDimmed}
                  onHover={setHoveredDeptId}
                  onSelect={handleToggleSelect}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CostAllocationArcChart;
