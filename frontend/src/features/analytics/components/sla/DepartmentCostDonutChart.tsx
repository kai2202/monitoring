/**
 * Frontend/src/features/analytics/components/sla/DepartmentCostDonutChart.tsx
 *
 * Biểu đồ Donut Phân Bổ Chi Phí Hiện Đại (SaaS Donut Chart Style):
 * - Vòng Donut vành khăn dày bo góc mịn, hỗ trợ Dynamic Center Hover.
 * - Mặc định tâm hiển thị Tổng chi phí; hover phòng ban sẽ cập nhật chi phí & % tương ứng.
 * - Danh sách chú thích phòng ban dạng thẻ micro-pills gọn gàng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { DepartmentCostAllocationItem } from '../../../../types/analyticsUI';

interface DepartmentCostDonutChartProps {
  departments: DepartmentCostAllocationItem[];
}

export const DepartmentCostDonutChart: React.FC<DepartmentCostDonutChartProps> = ({ departments }) => {
  const [hoveredDeptId, setHoveredDeptId] = useState<string | null>(null);

  const totalCost = useMemo(() => {
    return departments.reduce((sum, d) => sum + d.totalCost, 0);
  }, [departments]);

  // Donut geometry
  const donutRadius = 68;
  const strokeWidth = 20;
  const donutCircumference = 2 * Math.PI * donutRadius;

  const donutSlices = useMemo(() => {
    let accumulatedOffset = 0;
    return departments.map((dept) => {
      const strokeLength = (dept.percentageShare / 100) * donutCircumference;
      // Trừ đi một khoảng nhỏ để tạo khoảng trống gap giữa các lát cắt
      const gap = 3;
      const adjustedLength = Math.max(1, strokeLength - gap);
      const slice = {
        ...dept,
        strokeDasharray: `${adjustedLength} ${donutCircumference - adjustedLength}`,
        strokeDashoffset: -accumulatedOffset,
      };
      accumulatedOffset += strokeLength;
      return slice;
    });
  }, [departments, donutCircumference]);

  const activeDept = useMemo(() => {
    return departments.find((d) => d.departmentId === hoveredDeptId) || null;
  }, [departments, hoveredDeptId]);

  return (
    <div
      style={{
        padding: '24px 26px',
        borderRadius: '24px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: '100%',
      }}
    >
      {/* 1. Header Khối */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#0891b2',
              boxShadow: '0 0 8px rgba(8, 145, 178, 0.5)',
            }}
          />
          <h2 style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
            Phân Bổ Chi Phí Theo Phòng Ban
          </h2>
        </div>
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0' }}>
          Tỷ trọng ngân sách theo trung tâm chi phí (Cost Per Page Model)
        </p>
      </div>

      {/* 2. Donut Chart + Dynamic Center */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
          >
            {/* Vòng nền xám nhẹ */}
            <circle
              cx="90"
              cy="90"
              r={donutRadius}
              stroke="var(--border-color, #f1f5f9)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Các lát cắt Donut tương ứng từng phòng ban */}
            {donutSlices.map((slice) => {
              const isHovered = hoveredDeptId === slice.departmentId;

              return (
                <circle
                  key={slice.departmentId}
                  cx="90"
                  cy="90"
                  r={donutRadius}
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  onMouseEnter={() => setHoveredDeptId(slice.departmentId)}
                  onMouseLeave={() => setHoveredDeptId(null)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    filter: isHovered ? `drop-shadow(0 0 6px ${slice.color}66)` : 'none',
                  }}
                />
              );
            })}
          </svg>

          {/* Dynamic Center Callout */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              textAlign: 'center',
              padding: '0 16px',
            }}
          >
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: 'var(--text-muted, #64748b)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '120px',
              }}
            >
              {activeDept ? activeDept.departmentName : 'Tổng chi phí'}
            </span>

            <span
              style={{
                fontSize: activeDept ? '16px' : '17.5px',
                fontWeight: 900,
                fontFamily: "'JetBrains Mono', monospace",
                color: activeDept ? activeDept.color : 'var(--text-primary, #0f172a)',
                letterSpacing: '-0.5px',
                marginTop: '2px',
              }}
            >
              {activeDept
                ? activeDept.totalCost.toLocaleString('vi-VN') + 'đ'
                : (totalCost / 1000000).toFixed(1) + 'M đ'}
            </span>

            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: activeDept ? activeDept.color : '#0891b2',
                backgroundColor: activeDept ? `${activeDept.color}18` : 'rgba(8, 145, 178, 0.1)',
                padding: '1px 6px',
                borderRadius: '9999px',
                marginTop: '3px',
              }}
            >
              {activeDept ? `${activeDept.percentageShare}%` : '100%'}
            </span>
          </div>
        </div>

        {/* 3. Danh Sách Phòng Ban (Compact Micro-Cards Legend) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          {departments.map((dept) => {
            const isHovered = hoveredDeptId === dept.departmentId;

            return (
              <div
                key={dept.departmentId}
                onMouseEnter={() => setHoveredDeptId(dept.departmentId)}
                onMouseLeave={() => setHoveredDeptId(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  backgroundColor: isHovered
                    ? `${dept.color}12`
                    : 'var(--bg-subtle, #f8fafc)',
                  border: isHovered
                    ? `1px solid ${dept.color}40`
                    : '1px solid var(--border-color, #e2e8f0)',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '3px',
                      backgroundColor: dept.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: isHovered ? 700 : 500,
                      color: isHovered ? dept.color : 'var(--text-primary, #0f172a)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {dept.departmentName}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      color: 'var(--text-secondary, #475569)',
                    }}
                  >
                    {dept.totalCost.toLocaleString('vi-VN')}đ
                  </span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: dept.color,
                      width: '38px',
                      textAlign: 'right',
                    }}
                  >
                    {dept.percentageShare}%
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

export default DepartmentCostDonutChart;

