/**
 * Frontend/src/features/analytics/components/sla/DepartmentCostBreakdown.tsx
 *
 * Khối Phân bổ Chi phí In Ấn theo Trung tâm Chi phí / Phòng ban (Cost Center Breakdown):
 * - Biểu đồ Donut Chart (SVG) vành khăn nét mỏng hiện đại (stroke width 20px).
 * - Căn giữa tuyệt đối text tổng chi phí ở tâm Donut với font-bold đậm nét.
 * - Danh sách phòng ban bên phải dạng micro-card hover mượt mà.
 * - Tương tác hai chiều: Hover micro-card highlight lát cắt Donut tương ứng và ngược lại.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { DepartmentCostAllocationItem } from '../../../../types/analyticsUI';

interface DepartmentCostBreakdownProps {
  departments: DepartmentCostAllocationItem[];
}

export const DepartmentCostBreakdown: React.FC<DepartmentCostBreakdownProps> = ({ departments }) => {
  const [hoveredDeptId, setHoveredDeptId] = useState<string | null>(null);

  const totalCost = useMemo(() => {
    return departments.reduce((sum, d) => sum + d.totalCost, 0);
  }, [departments]);

  // Donut geometry
  const donutRadius = 78;
  const donutCircumference = 2 * Math.PI * donutRadius;

  const donutSlices = useMemo(() => {
    let accumulatedOffset = 0;
    return departments.map((dept) => {
      const strokeLength = (dept.percentageShare / 100) * donutCircumference;
      const slice = {
        ...dept,
        strokeDasharray: `${strokeLength} ${donutCircumference - strokeLength}`,
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
      }}
    >
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
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
            Phân Bổ Chi Phí In Ấn Theo Phòng Ban (Cost Per Page Model)
          </h2>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0' }}>
          Định mức chuẩn: Trang đơn sắc (Mono) 150đ/trang • Trang màu (Color) 650đ/trang
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* CỘT TRÁI: DONUT CHART SVG */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px 20px',
            borderRadius: '20px',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
            border: '1px solid var(--border-color, #e2e8f0)',
          }}
        >
          <div style={{ position: 'relative', width: '220px', height: '220px' }}>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
              {donutSlices.map((slice) => {
                const isHovered = hoveredDeptId === slice.departmentId;

                return (
                  <circle
                    key={slice.departmentId}
                    cx="110"
                    cy="110"
                    r={donutRadius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? '24' : '18'}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    style={{
                      cursor: 'pointer',
                      transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                      opacity: hoveredDeptId === null ? 1 : isHovered ? 1 : 0.35,
                    }}
                    onMouseEnter={() => setHoveredDeptId(slice.departmentId)}
                    onMouseLeave={() => setHoveredDeptId(null)}
                  />
                );
              })}
            </svg>

            {/* Tâm Donut hiển thị tổng chi phí hoặc chi phí phòng ban được hover */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                {activeDept ? activeDept.departmentName : 'Tổng chi phí'}
              </span>
              <span
                style={{
                  fontSize: activeDept ? '19px' : '20px',
                  fontWeight: 900,
                  color: activeDept ? activeDept.color : 'var(--text-primary, #0f172a)',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '-0.5px',
                  marginTop: '2px',
                }}
              >
                {(activeDept ? activeDept.totalCost : totalCost).toLocaleString('vi-VN')}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                {activeDept ? `${activeDept.percentageShare}% ngân sách` : 'VNĐ'}
              </span>
            </div>
          </div>

          <span style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', marginTop: '14px' }}>
            Rê chuột vào lát cắt để xem chi tiết từng phòng ban
          </span>
        </div>

        {/* CỘT PHẢI: BẢNG MICRO-CARDS PHÒNG BAN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {departments.map((dept) => {
            const isHovered = hoveredDeptId === dept.departmentId;

            return (
              <div
                key={dept.departmentId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: isHovered ? 'rgba(241, 245, 249, 0.9)' : 'var(--bg-card, #ffffff)',
                  border: isHovered ? `1px solid ${dept.color}` : '1px solid var(--border-color, #e2e8f0)',
                  boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.06)' : '0 1px 2px rgba(0,0,0,0.02)',
                  transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredDeptId(dept.departmentId)}
                onMouseLeave={() => setHoveredDeptId(null)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '4px',
                      backgroundColor: dept.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}>
                      {dept.departmentName}
                    </strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
                      {dept.deviceCount} máy • Mono: {dept.monoPages.toLocaleString('vi-VN')} • Màu: {dept.colorPages.toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <strong
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-primary, #0f172a)',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {dept.totalCost.toLocaleString('vi-VN')} đ
                  </strong>
                  <div
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: dept.color,
                      backgroundColor: `${dept.color}15`,
                      padding: '1px 7px',
                      borderRadius: '9999px',
                      display: 'inline-block',
                      marginTop: '2px',
                    }}
                  >
                    {dept.percentageShare}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

