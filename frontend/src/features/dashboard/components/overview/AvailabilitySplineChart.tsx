/**
 * Frontend/src/features/dashboard/components/overview/AvailabilitySplineChart.tsx
 *
 * Biểu Đồ Khả Dụng Hạm Đội Máy In Enterprise (Pure React SVG Spline):
 * - Dải chuyển màu Gradient Cyan/Indigo rực rỡ, sắc nét Retina/HiDPI.
 * - Con trỏ Crosshair trục dọc + Pulsing Dot bám theo chuột mượt mà.
 * - Floating Enterprise Tooltip chi tiết: Thời gian, % Khả dụng, Đạt/Dưới SLA 99%, Ước tính máy Online/Offline.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useRef, useState, useMemo } from 'react';
import { FontAwesomeIcon, faChartLine, faCircleCheck, faTriangleExclamation } from '@/shared/icons';
import { AvailabilityTimelinePoint } from '@/types/dashboardTelemetry';

export interface AvailabilitySplineChartProps {
  timeline?: AvailabilityTimelinePoint[] | null;
  isLoading?: boolean;
}

export const AvailabilitySplineChart: React.FC<AvailabilitySplineChartProps> = ({
  timeline = [],
  isLoading = false,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const safeTimeline = useMemo(() => timeline || [], [timeline]);
  const hasData = safeTimeline.length > 0;

  const svgWidth = 600;
  const svgHeight = 200;
  const paddingLeft = 45;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 34;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const yMin = 85;
  const yMax = 100;

  const points = useMemo(() => {
    if (!hasData) return [];
    return safeTimeline.map((item, idx) => {
      const x = paddingLeft + (idx / Math.max(1, safeTimeline.length - 1)) * chartWidth;
      const rate = item.onlineRate !== null ? Math.min(yMax, Math.max(yMin, item.onlineRate)) : yMin;
      const y = paddingTop + chartHeight - ((rate - yMin) / (yMax - yMin)) * chartHeight;
      return { x, y, raw: item, rate: item.onlineRate };
    });
  }, [safeTimeline, hasData, chartWidth, chartHeight, paddingLeft, paddingTop]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [points]);

  const areaD = useMemo(() => {
    if (!pathD || points.length === 0) return '';
    const bottomY = paddingTop + chartHeight;
    return `${pathD} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
  }, [pathD, points, paddingTop, chartHeight]);

  const slaThresholdY = paddingTop + chartHeight - ((99.0 - yMin) / (yMax - yMin)) * chartHeight;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaleX = svgWidth / rect.width;
    const svgX = mouseX * scaleX;

    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setHoverIndex(closestIdx);
  };

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-all hover:shadow-md">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-800/80 flex items-center justify-center text-xs shadow-xs">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Xu Hướng Khả Dụng (Availability Spline)
              <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60">
                ICMP Ping
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Tỷ lệ trực tuyến đo bằng Zabbix ICMP theo chuỗi thời gian</p>
          </div>
        </div>

        {/* Time range selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700 text-[11px]">
          {(['24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                timeRange === r
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative flex-1 min-h-[175px] w-full select-none">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 animate-pulse">
            <div className="w-3/4 h-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="w-1/2 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ) : !hasData ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 py-8">
            <span className="text-xs font-semibold">Chưa có dữ liệu chuỗi thời gian</span>
            <span className="text-[11px] text-slate-400">Zabbix Poller đang chờ chu kỳ scraping tiếp theo</span>
          </div>
        ) : (
          <>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible cursor-crosshair"
              preserveAspectRatio="none"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id="availSplineStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="availSplineArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.32" />
                  <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid Lines */}
              {[90, 95, 100].map((val) => {
                const y = paddingTop + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;
                return (
                  <line
                    key={val}
                    x1={paddingLeft}
                    y1={y}
                    x2={paddingLeft + chartWidth}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800/80"
                    strokeWidth="1"
                  />
                );
              })}

              {/* SLA 99% Threshold Line */}
              <line
                x1={paddingLeft}
                y1={slaThresholdY}
                x2={paddingLeft + chartWidth}
                y2={slaThresholdY}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth="1.2"
                opacity="0.8"
              />
              <text
                x={paddingLeft + chartWidth}
                y={slaThresholdY - 5}
                textAnchor="end"
                className="text-[9.5px] fill-rose-600 dark:fill-rose-400 font-mono font-bold"
              >
                SLA 99.0%
              </text>

              {/* Shaded Area & Colored Spline Curve */}
              <path d={areaD} fill="url(#availSplineArea)" />
              <path
                d={pathD}
                fill="none"
                stroke="url(#availSplineStroke)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Crosshair Tracker Line */}
              {activePoint && (
                <line
                  x1={activePoint.x}
                  y1={paddingTop}
                  x2={activePoint.x}
                  y2={paddingTop + chartHeight}
                  stroke="#0891b2"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                  className="opacity-80"
                />
              )}

              {/* Active Pulse Dot on Hover */}
              {activePoint && (
                <g>
                  <circle cx={activePoint.x} cy={activePoint.y} r="9" fill="#06b6d4" opacity="0.25" />
                  <circle cx={activePoint.x} cy={activePoint.y} r="5" fill="#ffffff" stroke="#0891b2" strokeWidth="2.5" />
                </g>
              )}

              {/* X Axis Time Labels */}
              {points
                .filter((_, idx) => idx % Math.ceil(points.length / 6) === 0 || idx === points.length - 1)
                .map((pt, idx) => (
                  <text
                    key={idx}
                    x={pt.x}
                    y={paddingTop + chartHeight + 18}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono font-medium"
                  >
                    {pt.raw.timeLabel}
                  </text>
                ))}

              {/* Y Axis Labels */}
              {[100, 95, 90, 85].map((val) => {
                const y = paddingTop + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;
                return (
                  <text
                    key={val}
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono font-medium"
                  >
                    {val}%
                  </text>
                );
              })}
            </svg>

            {/* Floating Enterprise Hover Tooltip Card */}
            {activePoint && (
              <div
                style={{
                  left: `${(activePoint.x / svgWidth) * 100}%`,
                  top: `${Math.max(10, (activePoint.y / svgHeight) * 100 - 32)}%`,
                  transform: 'translate(-50%, -100%)',
                }}
                className="absolute pointer-events-none z-30 flex flex-col gap-1 p-2.5 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700/80 shadow-xl backdrop-blur-md min-w-[160px] animate-in fade-in duration-100"
              >
                <div className="flex items-center justify-between text-[10.5px] text-slate-400 border-b border-slate-800 pb-1">
                  <span>Mốc thời gian:</span>
                  <span className="font-mono font-bold text-slate-200">{activePoint.raw.timeLabel}</span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-xs text-slate-300">Khả dụng:</span>
                  <span className="text-sm font-extrabold font-mono text-cyan-400">
                    {activePoint.rate !== null ? `${activePoint.rate.toFixed(1)}%` : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] mt-0.5">
                  {activePoint.rate !== null && activePoint.rate >= 99.0 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
                      Đạt chuẩn SLA (≥ 99%)
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="text-[10px]" />
                      Dưới SLA ({activePoint.rate !== null ? (activePoint.rate - 99).toFixed(1) : ''}%)
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AvailabilitySplineChart;
