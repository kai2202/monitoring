/**
 * Frontend/src/features/dashboard/components/overview/AvailabilitySplineChart.tsx
 *
 * Biểu Đồ Khả Dụng Hệ Thống Máy In Enterprise (Chart.js Canvas):
 * - Sử dụng chart.js v4 <canvas> để sẵn sàng nối dữ liệu Zabbix/API real-time.
 * - Hỗ trợ spanGaps: false (trung thực với điểm null khi mất scraping, AGENTS.md Rule 5.1).
 * - Đường ngưỡng SLA 99% vẽ bằng plugin nhẹ + Tooltip chi tiết (tỷ lệ %, đạt/dưới SLA).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Plugin,
} from 'chart.js';
import { AvailabilityTimelinePoint } from '@/types/dashboardTelemetry';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
);

export type AvailabilityRange = '24h' | '7d' | '30d';

export interface AvailabilitySplineChartProps {
  timeline?: AvailabilityTimelinePoint[] | null;
  isLoading?: boolean;
  timeRange?: AvailabilityRange;
  onTimeRangeChange?: (range: AvailabilityRange) => void;
}

const slaThresholdPlugin: Plugin<'line'> = {
  id: 'slaThresholdLine',
  afterDatasetsDraw(chart) {
    const yScale = chart.scales.y;
    const xScale = chart.scales.x;
    if (!yScale || !xScale) return;

    const yPos = yScale.getPixelForValue(99);
    if (yPos < chart.chartArea.top || yPos > chart.chartArea.bottom) return;

    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
    ctx.moveTo(chart.chartArea.left, yPos);
    ctx.lineTo(chart.chartArea.right, yPos);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.font = '700 10px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = '#f43f5e';
    ctx.textAlign = 'right';
    ctx.fillText('SLA 99.0%', chart.chartArea.right - 2, yPos - 5);
    ctx.restore();
  },
};

export const AvailabilitySplineChart: React.FC<AvailabilitySplineChartProps> = ({
  timeline = [],
  isLoading = false,
  timeRange: controlledRange,
  onTimeRangeChange,
}) => {
  const [internalRange, setInternalRange] = useState<AvailabilityRange>('24h');
  const timeRange = controlledRange ?? internalRange;
  const handleRangeChange = (next: AvailabilityRange) => {
    setInternalRange(next);
    onTimeRangeChange?.(next);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<'line'> | null>(null);

  const safeTimeline = useMemo(() => timeline || [], [timeline]);
  const hasData = safeTimeline.length > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasData || isLoading) return;

    const ctx = canvas.getContext?.('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 220);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
    gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.08)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    const labels = safeTimeline.map((pt) => pt.timeLabel);
    const values = safeTimeline.map((pt) => pt.onlineRate);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Khả dụng (%)',
            data: values,
            borderColor: '#0891b2',
            backgroundColor: gradient,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            spanGaps: false,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: '#0891b2',
            pointHoverBorderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 550,
          easing: 'easeOutQuart',
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            titleColor: '#94a3b8',
            bodyColor: '#f8fafc',
            borderColor: 'rgba(51, 65, 85, 0.8)',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const raw = context.parsed.y;
                if (raw === null || raw === undefined) return 'Khả dụng: — (Chưa có dữ liệu)';
                const slaStatus =
                  raw >= 99 ? 'Đạt chuẩn SLA (≥ 99%)' : `Dưới SLA (${(raw - 99).toFixed(1)}%)`;
                return [`Khả dụng: ${raw.toFixed(1)}%`, slaStatus];
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              maxTicksLimit: 7,
              color: '#94a3b8',
              font: { size: 10, family: '"JetBrains Mono", ui-monospace, monospace' },
            },
          },
          y: {
            suggestedMin: 85,
            max: 100,
            border: { display: false },
            grid: { color: 'rgba(148, 163, 184, 0.14)' },
            ticks: {
              stepSize: 5,
              color: '#94a3b8',
              font: { size: 10, family: '"JetBrains Mono", ui-monospace, monospace' },
              callback: (value) => `${value}%`,
            },
          },
        },
      },
      plugins: [slaThresholdPlugin],
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [safeTimeline, hasData, isLoading]);

  return (
    <div className="flex flex-col h-full xl:h-[320px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
      {/* Header Bar */}
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 m-0">
              Xu Hướng Khả Dụng Hệ Thống
            </h3>
            <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300">
              ICMP Ping
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
            Tỷ lệ trực tuyến đo bằng Zabbix ICMP theo chuỗi thời gian
          </p>
        </div>

        {/* Time range selector */}
        <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-[11px] gap-0.5">
          {(['24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRangeChange(r)}
              className={`px-2.5 py-1 rounded-md border-none transition-all font-semibold cursor-pointer ${
                timeRange === r
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                  : 'bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {r === '24h' ? '24 Giờ' : r === '7d' ? '7 Ngày' : '30 Ngày'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative flex-1 min-h-[180px] w-full">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 animate-pulse">
            <div className="w-3/4 h-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="w-1/2 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ) : !hasData ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 py-8">
            <span className="text-xs font-semibold">Chưa có dữ liệu chuỗi thời gian</span>
            <span className="text-[11px] text-slate-400">
              Zabbix Poller đang chờ chu kỳ scraping tiếp theo
            </span>
          </div>
        ) : (
          <canvas ref={canvasRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );
};

export default AvailabilitySplineChart;
