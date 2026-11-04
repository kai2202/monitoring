/**
 * Frontend/src/features/analytics/components/sla/CostAllocationArcChart.tsx
 *
 * Biểu đồ Vòng Cung Bán Nguyệt 180° Bố Cục Side-by-Side (Bento Layout):
 * - Cột Trái (~42%): Vòng cung Donut nét mỏng 11px, tâm hiển thị tổng chi phí động theo hover.
 * - Cột Phải (~58%): 5 Thẻ Micro-Cards phòng ban (Mini Progress Bar, Chi phí VND, Số trang Mono/Màu).
 * - Tương tác 2 chiều: Hover thẻ phòng ban -> Phát sáng lát cắt tương ứng trên vòng cung.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { DepartmentCostAllocationItem } from '../../../../types/analyticsUI';

interface CostAllocationArcChartProps {
  departments?: DepartmentCostAllocationItem[];
}

export const CostAllocationArcChart: React.FC<CostAllocationArcChartProps> = ({
  departments = [],
}) => {
  const [hoveredDeptId, setHoveredDeptId] = useState<string | null>(null);

  const safeList = useMemo(() => departments || [], [departments]);

  const totalCost = useMemo(() => {
    return safeList.reduce((sum, d) => sum + (d?.totalCost || 0), 0);
  }, [safeList]);

  // Geometry cho Vòng cung bán nguyệt 180°
  const cx = 140;
  const cy = 125;
  const radius = 86;
  const strokeWidth = 11;
  const arcLength = Math.PI * radius; // ~270.17px

  const drawnSegments = useMemo(() => {
    let acc = 0;
    return safeList.map((dept) => {
      const pct = dept?.percentageShare || 0;
      const len = (pct / 100) * arcLength;
      const gap = 3.5;
      const dashLen = Math.max(1, len - gap);
      const slice = {
        ...dept,
        dashArray: `${dashLen} 1000`,
        dashOffset: -acc,
        totalPages: (dept?.monoPages || 0) + (dept?.colorPages || 0),
      };
      acc += len;
      return slice;
    });
  }, [safeList, arcLength]);

  const activeDept = useMemo(() => {
    return drawnSegments.find((d) => d.departmentId === hoveredDeptId) || null;
  }, [drawnSegments, hoveredDeptId]);

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
        gap: '16px',
        height: '100%',
      }}
    >
      {/* 1. Header Khối */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
          Kỳ 30 ngày • {safeList.length} phòng ban
        </span>
      </div>

      {/* 2. Bố cục Side-by-Side: Trái (Vòng cung) + Phải (5 Micro-Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          alignItems: 'center',
          flex: 1,
        }}
      >
        {/* CỘT TRÁI: SVG Semi-Donut Arc 180° Nét Mảnh */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '280px', height: '155px' }}>
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
                : `Top 1: ${safeList[0]?.departmentName || 'Kế toán'} (${safeList[0]?.percentageShare || 0}%)`}
            </div>

            <svg width="280" height="150" viewBox="0 0 280 150" style={{ overflow: 'visible' }}>
              {/* Vòng nền xám mờ bán nguyệt */}
              <path
                d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
                fill="none"
                stroke="var(--border-color, #f1f5f9)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />

              {/* 5 Phân đoạn màu bán nguyệt */}
              {drawnSegments.map((seg) => {
                const isHovered = hoveredDeptId === seg.departmentId;

                return (
                  <path
                    key={seg.departmentId}
                    d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredDeptId(seg.departmentId)}
                    onMouseLeave={() => setHoveredDeptId(null)}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      filter: isHovered ? `drop-shadow(0 0 6px ${seg.color}88)` : 'none',
                      opacity: hoveredDeptId && !isHovered ? 0.4 : 1,
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
              <span
                style={{
                  fontSize: '10.5px',
                  color: activeDept ? activeDept.color : 'var(--text-muted, #64748b)',
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '150px',
                }}
              >
                {activeDept ? activeDept.departmentName : 'Tổng chi phí in kỳ'}
              </span>
              <span
                style={{
                  fontSize: activeDept ? '18px' : '20px',
                  fontWeight: 900,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-primary, #0f172a)',
                  letterSpacing: '-0.5px',
                  marginTop: '1px',
                }}
              >
                {activeDept
                  ? `${(activeDept.totalCost || 0).toLocaleString('vi-VN')} đ`
                  : `${totalCost.toLocaleString('vi-VN')} đ`}
              </span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: 5 Micro-Cards Phòng Ban Kèm Mini Progress Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {drawnSegments.map((seg) => {
            const isHovered = hoveredDeptId === seg.departmentId;

            return (
              <div
                key={seg.departmentId}
                onMouseEnter={() => setHoveredDeptId(seg.departmentId)}
                onMouseLeave={() => setHoveredDeptId(null)}
                style={{
                  padding: '7px 11px',
                  borderRadius: '12px',
                  backgroundColor: isHovered ? `${seg.color}15` : 'var(--bg-subtle, #f8fafc)',
                  border: isHovered ? `1px solid ${seg.color}60` : '1px solid var(--border-color, #e2e8f0)',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {/* Hàng 1: Tên phòng ban, badge máy, chi phí và % */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: seg.color, flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: isHovered ? 800 : 700,
                        color: isHovered ? seg.color : 'var(--text-primary, #0f172a)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {seg.departmentName}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)', fontWeight: 500, flexShrink: 0 }}>
                      ({seg.deviceCount} máy)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11.5px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: isHovered ? seg.color : 'var(--text-primary, #0f172a)' }}>
                      {((seg.totalCost || 0) / 1000000).toFixed(1)}M
                    </span>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
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
          })}
        </div>
      </div>
    </div>
  );
};

export default CostAllocationArcChart;
