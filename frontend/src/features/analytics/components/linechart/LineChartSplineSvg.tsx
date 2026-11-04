/**
 * Frontend/src/features/analytics/components/linechart/LineChartSplineSvg.tsx
 *
 * Biểu đồ SVG Spline Đường Cong Mềm Mại (Soft Spline Bézier Area Chart):
 * - Trục tung (Y-axis) chuẩn hóa: Thang đo sản lượng, đơn vị (trang), vạch lưới ngang.
 * - Nét vẽ thanh mảnh 2px chuẩn SaaS (màu #2563eb), đổ bóng gradient mềm mịn xuống đáy.
 * - Viên nang đỉnh tải (Peak Load Capsule) tự động đánh dấu điểm sản lượng cao nhất kỳ.
 * - Đường nét đứt xám mảnh 1.75px đối chiếu kỳ trước đó.
 * - Tương tác hover mượt mà với đường gióng dọc và Floating Tooltip đa tầng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useRef, useState, useMemo } from 'react';
import { AnalyticsTimeframe } from '../../../../types/analyticsUI';
import { MockPrinterDef } from '../../../../mocks/mockAnalyticsUIData';
import { LineChartTooltip, TopPrinterContribution } from './LineChartTooltip';

interface LineChartSplineSvgProps {
  currentSeries: number[];
  previousSeries: number[];
  dataPointCount: number;
  timeframe: AnalyticsTimeframe;
  maxValue: number;
  activePrinters?: MockPrinterDef[];
}

export const LineChartSplineSvg: React.FC<LineChartSplineSvgProps> = ({
  currentSeries,
  previousSeries,
  dataPointCount,
  timeframe,
  maxValue,
  activePrinters = [],
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const svgWidth = 1000;
  const svgHeight = 280;
  const paddingLeft = 62;
  const paddingRight = 35;
  const paddingTop = 32;
  const paddingBottom = 40;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (i: number) =>
    dataPointCount <= 1 ? paddingLeft : paddingLeft + (i / (dataPointCount - 1)) * chartWidth;

  const getY = (val: number) => {
    if (maxValue === 0) return paddingTop + chartHeight;
    const ratio = Math.max(0, Math.min(1, val / maxValue));
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  // Tạo đường cong Cubic Bézier mượt mà
  const createSmoothPath = (values: number[]) => {
    if (values.length === 0) return '';
    const pts = values.map((val, i) => ({ x: getX(i), y: getY(val) }));
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
      d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const currentPathD = useMemo(() => createSmoothPath(currentSeries), [currentSeries, maxValue]);
  const previousPathD = useMemo(() => createSmoothPath(previousSeries), [previousSeries, maxValue]);

  // Vùng đổ bóng Gradient khép kín dưới đường cong kỳ hiện tại
  const areaPathD = useMemo(() => {
    if (!currentPathD || currentSeries.length < 2) return '';
    const bottomY = paddingTop + chartHeight;
    return `${currentPathD} L ${getX(currentSeries.length - 1)} ${bottomY} L ${getX(0)} ${bottomY} Z`;
  }, [currentPathD, currentSeries.length, chartHeight, paddingTop]);

  // Xác định điểm đỉnh tải (Peak Point)
  const peakData = useMemo(() => {
    if (currentSeries.length === 0) return null;
    let maxVal = -1;
    let maxIdx = 0;
    currentSeries.forEach((val, idx) => {
      if (val > maxVal) { maxVal = val; maxIdx = idx; }
    });
    if (maxVal <= 0) return null;
    return { value: maxVal, x: getX(maxIdx), y: getY(maxVal) };
  }, [currentSeries, maxValue]);

  // Nhãn trục X tối giản
  const xTicks = useMemo(() => {
    if (timeframe === '30days') {
      return [1, 5, 10, 15, 20, 25, 30].map((idx) => ({ index: idx - 1, label: `Ngày ${idx}` }));
    } else if (timeframe === '7days') {
      return ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map((lbl, idx) => ({ index: idx, label: lbl }));
    }
    return [0, 3, 6, 9, 12, 15, 18, 21].map((hour) => ({ index: hour, label: `${hour}h00` }));
  }, [timeframe]);

  // Thiết bị đóng góp nhiều nhất tại hoverIndex
  const topPrinterAtHover = useMemo<TopPrinterContribution | null>(() => {
    if (hoverIndex === null || activePrinters.length === 0) return null;
    let topP = activePrinters[0];
    let maxVal = 0;

    activePrinters.forEach((p) => {
      const arr = timeframe === 'hourly' ? p.baseHourly : timeframe === '7days' ? p.base7Days : p.base30Days;
      const val = arr[hoverIndex] || 0;
      if (val > maxVal) { maxVal = val; topP = p; }
    });

    const totalAtPoint = currentSeries[hoverIndex] || 1;
    return { name: topP.name, percent: Math.round((maxVal / totalAtPoint) * 100) };
  }, [hoverIndex, activePrinters, timeframe, currentSeries]);

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) * (svgWidth / rect.width) - paddingLeft;
    if (relX < 0 || relX > chartWidth) { setHoverIndex(null); return; }
    setHoverIndex(Math.max(0, Math.min(dataPointCount - 1, Math.round((relX / chartWidth) * (dataPointCount - 1)))));
  };

  return (
    <div style={{ position: 'relative', width: '100%', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '20px', padding: '24px 20px 16px 20px', boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="areaGlowBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.16" />
              <stop offset="80%" stopColor="#2563eb" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 1. Lưới ngang & Nhãn Trục Y (Y-Axis Ticks & Labels) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + chartHeight * (1 - pct);
            const val = Math.round(maxValue * pct);
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="var(--border-color, #e2e8f0)" strokeDasharray="3 3" strokeWidth="1" opacity="0.55" />
                <text x={paddingLeft - 10} y={y + 3.5} textAnchor="end" fontSize="10" fill="var(--text-muted, #94a3b8)" fontFamily="'JetBrains Mono', monospace" fontWeight="500">
                  {val.toLocaleString('vi-VN')}
                </text>
              </g>
            );
          })}

          {/* Đơn vị Trục Y */}
          <text x={paddingLeft - 10} y={paddingTop - 12} textAnchor="end" fontSize="9.5" fill="var(--text-muted, #64748b)" fontWeight="600">
            (trang)
          </text>

          {/* Đường Trục Y Dọc */}
          <line x1={paddingLeft} y1={paddingTop - 6} x2={paddingLeft} y2={paddingTop + chartHeight} stroke="var(--border-color, #e2e8f0)" strokeWidth="1" />

          {/* 2. Vùng đổ bóng Gradient */}
          {areaPathD && <path d={areaPathD} fill="url(#areaGlowBlue)" />}

          {/* 3. Đường cong kỳ trước (Nét đứt xám 1.75px) */}
          <path d={previousPathD} fill="none" stroke="#94a3b8" strokeWidth="1.75" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />

          {/* 4. Đường cong kỳ hiện tại (Nét liền xanh 2.25px) */}
          <path d={currentPathD} fill="none" stroke="#2563eb" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />

          {/* 5. Viên nang Đỉnh tải (Peak Load Capsule) */}
          {peakData && (
            <g>
              <circle cx={peakData.x} cy={peakData.y} r="8" fill="#2563eb" fillOpacity="0.2" />
              <circle cx={peakData.x} cy={peakData.y} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              <rect
                x={Math.max(paddingLeft, Math.min(svgWidth - paddingRight - 126, peakData.x - 63))}
                y={peakData.y < 46 ? peakData.y + 12 : peakData.y - 28}
                width="126"
                height="22"
                rx="11"
                ry="11"
                fill="#0f172a"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
              />
              <text
                x={Math.max(paddingLeft, Math.min(svgWidth - paddingRight - 126, peakData.x - 63)) + 63}
                y={(peakData.y < 46 ? peakData.y + 12 : peakData.y - 28) + 14.5}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#f8fafc"
                fontFamily="'JetBrains Mono', monospace"
              >
                Đỉnh: {peakData.value.toLocaleString('vi-VN')} tr
              </text>
            </g>
          )}

          {/* 6. Nhãn trục X & Đường đáy ngang */}
          <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight} stroke="var(--border-color, #e2e8f0)" strokeWidth="1" />
          {xTicks.map((tick, idx) => (
            <text key={idx} x={getX(tick.index)} y={svgHeight - 14} textAnchor="middle" fontSize="11" fill="var(--text-muted, #64748b)" fontFamily="'JetBrains Mono', monospace" fontWeight="500">
              {tick.label}
            </text>
          ))}

          {/* 7. Đường gióng hover & Chấm điểm */}
          {hoverIndex !== null && (
            <g>
              <line x1={getX(hoverIndex)} y1={paddingTop} x2={getX(hoverIndex)} y2={paddingTop + chartHeight} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx={getX(hoverIndex)} cy={getY(currentSeries[hoverIndex] || 0)} r="5.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
              <circle cx={getX(hoverIndex)} cy={getY(previousSeries[hoverIndex] || 0)} r="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* 8. Floating Detail Tooltip */}
        {hoverIndex !== null && (
          <LineChartTooltip
            hoverIndex={hoverIndex}
            timeframe={timeframe}
            currentVal={currentSeries[hoverIndex] || 0}
            prevVal={previousSeries[hoverIndex] || 0}
            dataPointCount={dataPointCount}
            svgWidth={svgWidth}
            xPos={getX(hoverIndex)}
            topPrinter={topPrinterAtHover}
          />
        )}
      </div>
    </div>
  );
};

export default LineChartSplineSvg;
