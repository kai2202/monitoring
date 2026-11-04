/**
 * Frontend/src/features/analytics/components/sla/SLADualAxisChartSvg.tsx
 *
 * SVG Renderer cho Dual-Axis Stacked Combo Chart (Growth Accounting Style):
 * - Cột chồng 2 tầng: Thời gian chạy ổn định MTBF (Xanh) + Thời gian bảo trì MTTR (Tím).
 * - Đường xu hướng Spline Line: Tỷ lệ lỗi vặt / kẹt giấy (%) màu Hổ phách kèm chấm tròn nổi bật.
 * - Trục kép (Dual-Axis) & Tooltip tương tác nổi.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { SLAComboDataPoint } from '../../../../types/analyticsUI';

interface SLADualAxisChartSvgProps {
  series: SLAComboDataPoint[];
}

export const SLADualAxisChartSvg: React.FC<SLADualAxisChartSvgProps> = ({ series }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const svgWidth = 620;
  const svgHeight = 290;
  const paddingLeft = 48;
  const paddingRight = 48;
  const paddingTop = 32;
  const paddingBottom = 42;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Trục trái: Tổng thời gian (MTBF + MTTR quy đổi giờ)
  const leftMax = useMemo(() => {
    const maxVal = Math.max(...series.map((d) => d.mtbfHours + d.mttrMinutes / 2));
    return Math.ceil((maxVal * 1.15) / 50) * 50;
  }, [series]);

  // Trục phải: Tỷ lệ lỗi vặt (%)
  const rightMax = useMemo(() => {
    const maxVal = Math.max(...series.map((d) => d.jamRatePercent));
    return Math.ceil(maxVal * 1.3 * 10) / 10;
  }, [series]);

  const getX = (index: number) => {
    const step = chartWidth / series.length;
    return paddingLeft + index * step + step / 2;
  };

  const getLeftY = (val: number) => {
    const ratio = Math.max(0, Math.min(1, val / leftMax));
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const getRightY = (val: number) => {
    const ratio = Math.max(0, Math.min(1, val / rightMax));
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  // Đường cong Spline cho Tỷ lệ lỗi vặt
  const jamLinePath = useMemo(() => {
    if (series.length === 0) return '';
    const points = series.map((d, i) => ({
      x: getX(i),
      y: getRightY(d.jamRatePercent),
    }));

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [series, chartWidth, chartHeight, rightMax]);

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          <linearGradient id="mtbfBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="mttrBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* 1. Lưới ngang Grid lines & Trục Y */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + chartHeight * (1 - ratio);
          const leftVal = Math.round(leftMax * ratio);
          const rightVal = (rightMax * ratio).toFixed(1);

          return (
            <g key={ratio}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                stroke="var(--border-color, #e2e8f0)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                fill="var(--text-muted, #94a3b8)"
              >
                {leftVal}h
              </text>
              <text
                x={svgWidth - paddingRight + 8}
                y={y + 4}
                textAnchor="start"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                fill="#f59e0b"
              >
                {rightVal}%
              </text>
            </g>
          );
        })}

        {/* 2. Cột Chồng Stacked Bar (Tầng dưới: MTBF, Tầng trên: MTTR) */}
        {series.map((d, i) => {
          const centerX = getX(i);
          const barWidth = 38;
          const barX = centerX - barWidth / 2;

          // Chiều cao tầng dưới (MTBF)
          const mtbfHeight = (d.mtbfHours / leftMax) * chartHeight;
          const mtbfY = paddingTop + chartHeight - mtbfHeight;

          // Chiều cao tầng trên (MTTR - quy đổi trực quan theo giờ)
          const mttrSimulatedHours = d.mttrMinutes * 0.8;
          const mttrHeight = (mttrSimulatedHours / leftMax) * chartHeight;
          const mttrY = mtbfY - mttrHeight;

          const isHovered = hoverIndex === i;

          return (
            <g
              key={d.timeLabel}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Vùng cảm ứng hover rộng */}
              <rect
                x={centerX - chartWidth / series.length / 2}
                y={paddingTop}
                width={chartWidth / series.length}
                height={chartHeight}
                fill="transparent"
              />

              {/* Tầng dưới: MTBF Hours */}
              <rect
                x={barX}
                y={mtbfY}
                width={barWidth}
                height={mtbfHeight}
                fill="url(#mtbfBarGrad)"
                opacity={isHovered ? 1 : 0.9}
                style={{ transition: 'all 0.18s ease' }}
              />

              {/* Tầng trên: MTTR Maintenance */}
              <rect
                x={barX}
                y={mttrY}
                width={barWidth}
                height={mttrHeight}
                rx="6"
                ry="6"
                fill="url(#mttrBarGrad)"
                opacity={isHovered ? 1 : 0.85}
                style={{ transition: 'all 0.18s ease' }}
              />

              {/* Nhãn trục X */}
              <text
                x={centerX}
                y={paddingTop + chartHeight + 22}
                textAnchor="middle"
                fontSize="11.5"
                fontWeight={isHovered ? 700 : 500}
                fill={isHovered ? 'var(--text-primary, #0f172a)' : 'var(--text-muted, #64748b)'}
              >
                {d.timeLabel}
              </text>
            </g>
          );
        })}

        {/* 3. Đường xu hướng Tỷ lệ lỗi vặt (Line Chart Spline) */}
        <path
          d={jamLinePath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.35))' }}
        />

        {/* 4. Các điểm nút (Data Dots) hình tròn viền trắng */}
        {series.map((d, i) => {
          const x = getX(i);
          const y = getRightY(d.jamRatePercent);
          const isHovered = hoverIndex === i;

          return (
            <circle
              key={d.timeLabel}
              cx={x}
              cy={y}
              r={isHovered ? 7 : 5}
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth={isHovered ? 3 : 2.5}
              style={{ transition: 'all 0.18s ease', pointerEvents: 'none' }}
            />
          );
        })}
      </svg>

      {/* 5. Floating Tooltip */}
      {hoverIndex !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${((getX(hoverIndex) + 12) / svgWidth) * 100}%`,
            top: '20%',
            transform: 'translate(-50%, -100%)',
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            fontSize: '11.5px',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <strong style={{ display: 'block', color: 'var(--text-primary, #0f172a)', marginBottom: '4px' }}>
            {series[hoverIndex].timeLabel}
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ color: '#2563eb', fontWeight: 600 }}>
              MTBF chạy ổn định: <strong>{series[hoverIndex].mtbfHours} giờ</strong>
            </span>
            <span style={{ color: '#8b5cf6', fontWeight: 600 }}>
              MTTR khắc phục: <strong>{series[hoverIndex].mttrMinutes} phút</strong>
            </span>
            <span style={{ color: '#d97706', fontWeight: 700 }}>
              Tỷ lệ lỗi vặt / kẹt giấy: <strong>{series[hoverIndex].jamRatePercent}%</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SLADualAxisChartSvg;
