/**
 * Frontend/src/components/dashboard/AvailabilitySplineChart.tsx
 *
 * Biểu Đồ Khả Dụng Hạm Đội Máy In (Pure React SVG Spline):
 * - Thay thế hoàn toàn Chart.js canvas bằng Pure SVG sắc nét tuyệt đối trên Retina/HiDPI.
 * - Đường cong Cubic Bézier Spline mượt mà (stroke 2.25px, gradient glow bán trong suốt).
 * - Trục thời gian 24h với vạch lưới ngang và các nhãn mốc thời gian rõ ràng.
 * - Tương tác hover thời gian thực với đường gióng dọc và tooltip tức thì.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useRef, useState, useMemo } from 'react';
import { FontAwesomeIcon, faChartLine } from '../../shared/icons';
import { MockAvailabilityPoint } from '../../mocks/mockTelemetry';

export interface AvailabilitySplineChartProps {
  timeline: MockAvailabilityPoint[];
  isLoading?: boolean;
}

export const AvailabilitySplineChart: React.FC<AvailabilitySplineChartProps> = ({
  timeline,
  isLoading = false,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const svgWidth = 600;
  const svgHeight = 190;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 32;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const yMin = 85;
  const yMax = 100;

  const getX = (index: number) => {
    if (timeline.length <= 1) return paddingLeft;
    return paddingLeft + (index / (timeline.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    const ratio = (clamped - yMin) / (yMax - yMin);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const splinePath = useMemo(() => {
    if (!timeline || timeline.length === 0) return '';
    const pts = timeline.map((pt, i) => ({ x: getX(i), y: getY(pt.onlineRate) }));
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [timeline]);

  const areaPath = useMemo(() => {
    if (!splinePath || timeline.length < 2) return '';
    const bottomY = paddingTop + chartHeight;
    const lastX = getX(timeline.length - 1);
    const firstX = getX(0);
    return `${splinePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [splinePath, timeline.length, chartHeight, paddingTop]);

  const avgRate = useMemo(() => {
    if (!timeline || timeline.length === 0) return 97.4;
    const sum = timeline.reduce((acc, p) => acc + (p.onlineRate || 0), 0);
    return (sum / timeline.length).toFixed(1);
  }, [timeline]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || timeline.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaleX = svgWidth / rect.width;
    const adjustedX = mouseX * scaleX;

    let nearestIdx = 0;
    let minDist = Infinity;
    timeline.forEach((_, i) => {
      const dist = Math.abs(getX(i) - adjustedX);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    });
    setHoverIndex(nearestIdx);
  };

  const handleMouseLeave = () => setHoverIndex(null);
  const activePoint = hoverIndex !== null && timeline[hoverIndex] ? timeline[hoverIndex] : null;

  const xTicks = useMemo(() => {
    if (timeline.length === 0) return [];
    const step = Math.max(1, Math.floor(timeline.length / 6));
    const ticks = [];
    for (let i = 0; i < timeline.length; i += step) {
      ticks.push({ index: i, label: timeline[i].timeLabel });
    }
    const lastIdx = timeline.length - 1;
    if (ticks[ticks.length - 1].index !== lastIdx) {
      ticks.push({ index: lastIdx, label: timeline[lastIdx].timeLabel });
    }
    return ticks;
  }, [timeline]);

  const yTicks = [100, 95, 90, 85];

  return (
    <div
      style={{
        padding: '22px 24px',
        borderRadius: '20px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        minHeight: '280px',
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
            Tỷ lệ khả dụng theo thời gian
          </h3>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)' }}>
            Biến động tỷ lệ trực tuyến 24 giờ qua
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', fontFamily: "'JetBrains Mono', monospace" }}>
              {avgRate}%
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>(avg)</span>
            <FontAwesomeIcon icon={faChartLine} style={{ fontSize: '13px', color: '#2563eb' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', padding: '2px', borderRadius: '8px' }}>
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: timeRange === range ? 700 : 500,
                  backgroundColor: timeRange === range ? 'var(--bg-card, #ffffff)' : 'transparent',
                  color: timeRange === range ? '#2563eb' : 'var(--text-muted, #64748b)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: timeRange === range ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Spline Chart */}
      <div style={{ flex: 1, minHeight: '180px', position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: '100%', overflow: 'visible', display: 'block' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="availSplineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
              <stop offset="70%" stopColor="#2563eb" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Vạch lưới ngang trục tung Y-axis */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="var(--border-color, #e2e8f0)" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.8" />
                <text x={paddingLeft - 8} y={y + 3} textAnchor="end" fill="var(--text-muted, #64748b)" fontSize="9.5" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Nhãn trục hoành X-axis */}
          {xTicks.map((tick) => (
            <text key={tick.index} x={getX(tick.index)} y={svgHeight - 10} textAnchor="middle" fill="var(--text-muted, #64748b)" fontSize="9.5" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
              {tick.label}
            </text>
          ))}

          {/* Vùng diện tích Gradient dưới đường cong */}
          {areaPath && <path d={areaPath} fill="url(#availSplineGradient)" />}

          {/* Đường cong Bézier Spline chính */}
          {splinePath && (
            <path d={splinePath} fill="none" stroke="#2563eb" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Điểm tương tác khi Hover */}
          {hoverIndex !== null && activePoint && (
            <g>
              <line x1={getX(hoverIndex)} y1={paddingTop} x2={getX(hoverIndex)} y2={paddingTop + chartHeight} stroke="#2563eb" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.75" />
              <circle cx={getX(hoverIndex)} cy={getY(activePoint.onlineRate)} r="6" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 2px 4px rgba(37,99,235,0.4))' }} />
            </g>
          )}
        </svg>

        {/* Floating Tooltip Hover */}
        {hoverIndex !== null && activePoint && (
          <div
            style={{
              position: 'absolute',
              left: `${(getX(hoverIndex) / svgWidth) * 100}%`,
              top: `${(getY(activePoint.onlineRate) / svgHeight) * 100 - 20}%`,
              transform: 'translate(-50%, -100%)',
              padding: '8px 12px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
              Thời điểm: {activePoint.timeLabel}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#2563eb' }}>
                {activePoint.onlineRate.toFixed(1)}%
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>khả dụng</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary, #475569)', marginTop: '2px' }}>
              {activePoint.onlineCount} máy online • {activePoint.offlineCount} máy offline
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilitySplineChart;
