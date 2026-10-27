import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Chart } from 'chart.js';
import {
  TrendingUp,
  Clock,
  Eye,
  EyeOff,
  MousePointer,
  Sparkles,
} from 'lucide-react';
import { Printer, PrinterTelemetryResponse, ThemeMode } from '../../types/printer';

export const PRINTER_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
  '#06b6d4', '#ec4899', '#f97316', '#6366f1', '#14b8a6',
  '#84cc16', '#d97706', '#a855f7', '#0284c7', '#2563eb',
  '#059669', '#e11d48', '#64748b', '#dc2626', '#0d9488'
];

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface AnalyticsLoadCurvesProps {
  printers: Printer[];
  theme: ThemeMode;
  timeframe: '24h' | '7d' | '30d';
  setTimeframe: (tf: '24h' | '7d' | '30d') => void;
  telemetryData: PrinterTelemetryResponse[];
  isLoadingTelemetry: boolean;
  hasTelemetryData: boolean;
  generateTelemetryPoints: (printer: Printer, tf: '24h' | '7d' | '30d') => (number | null)[];
  isLight: boolean;
}

export const AnalyticsLoadCurves: React.FC<AnalyticsLoadCurvesProps> = ({
  printers,
  theme,
  timeframe,
  setTimeframe,
  telemetryData,
  isLoadingTelemetry,
  hasTelemetryData,
  generateTelemetryPoints,
  isLight,
}) => {
  const comparisonChartRef = useRef<HTMLCanvasElement | null>(null);
  const comparisonChartInstance = useRef<Chart | null>(null);
  const [hoveredPrinterIndex, setHoveredPrinterIndex] = useState<number | null>(null);
  const hoveredPrinterIndexRef = useRef<number | null>(null);

  const gridColor = isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.035)';
  const tickColor = isLight ? '#64748b' : '#64748b';

  const highlightPrinterIndex = useCallback((targetIndex: number) => {
    const chart = comparisonChartInstance.current;
    if (!chart) return;
    if (hoveredPrinterIndexRef.current === targetIndex) return;
    hoveredPrinterIndexRef.current = targetIndex;
    setHoveredPrinterIndex(targetIndex);

    chart.data.datasets.forEach((ds: any, idx: number) => {
      const baseColor = PRINTER_PALETTE[idx % PRINTER_PALETTE.length];
      if (idx === targetIndex) {
        ds.borderColor = baseColor;
        ds.borderWidth = 3.5;
        ds.pointRadius = 0;
        ds.pointHoverRadius = 7;
        ds.order = -1;
      } else {
        ds.borderColor = hexToRgba(baseColor, 0.18);
        ds.borderWidth = 1.2;
        ds.pointRadius = 0;
        ds.order = 10;
      }
    });

    chart.update('none');
  }, []);

  const resetPrinterHighlight = useCallback(() => {
    const chart = comparisonChartInstance.current;
    if (!chart) return;
    if (hoveredPrinterIndexRef.current === null) return;
    hoveredPrinterIndexRef.current = null;
    setHoveredPrinterIndex(null);

    chart.data.datasets.forEach((ds: any, idx: number) => {
      const baseColor = PRINTER_PALETTE[idx % PRINTER_PALETTE.length];
      ds.borderColor = baseColor;
      ds.borderWidth = 2;
      ds.pointRadius = 0;
      ds.pointHoverRadius = 6;
      ds.order = 0;
    });

    chart.update('none');
  }, []);

  const toggleAllLines = (show: boolean) => {
    if (!comparisonChartInstance.current) return;
    comparisonChartInstance.current.data.datasets.forEach(ds => {
      ds.hidden = !show;
    });
    comparisonChartInstance.current.update();
  };

  const toggleSinglePrinter = (index: number) => {
    if (!comparisonChartInstance.current) return;
    const isVisible = comparisonChartInstance.current.isDatasetVisible(index);
    comparisonChartInstance.current.setDatasetVisibility(index, !isVisible);
    comparisonChartInstance.current.update();
  };

  useEffect(() => {
    if (!comparisonChartRef.current || !hasTelemetryData) {
      if (comparisonChartInstance.current) {
        comparisonChartInstance.current.destroy();
        comparisonChartInstance.current = null;
      }
      return;
    }

    let xLabels: string[] = [];
    if (telemetryData.length > 0 && telemetryData[0]?.buckets?.length > 0) {
      xLabels = telemetryData[0].buckets.map(b => b.timeLabel);
    } else if (timeframe === '24h') {
      xLabels = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    } else if (timeframe === '7d') {
      xLabels = ['16/10', '17/10', '18/10', '19/10', '20/10', '21/10', '22/10'];
    } else {
      xLabels = ['Tuần 39', 'Tuần 40', 'Tuần 41', 'Tuần 42', 'Tuần 43 (Hiện tại)'];
    }

    const datasets = printers.map((printer, index) => {
      const color = PRINTER_PALETTE[index % PRINTER_PALETTE.length];
      const data = generateTelemetryPoints(printer, timeframe);

      return {
        label: `${printer.name} (${printer.id})`,
        data,
        borderColor: color,
        backgroundColor: 'transparent',
        fill: false,
        borderWidth: 2,
        tension: 0,
        spanGaps: false,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: '#ffffff',
        pointHoverBackgroundColor: color,
        hidden: false
      };
    });

    if (comparisonChartInstance.current) {
      const chart = comparisonChartInstance.current;
      const scales = chart.options.scales as any;
      if (scales?.x?.grid) scales.x.grid.color = gridColor;
      if (scales?.x?.ticks) scales.x.ticks.color = tickColor;
      if (scales?.x?.title) scales.x.title.color = tickColor;
      if (scales?.y?.grid) scales.y.grid.color = gridColor;
      if (scales?.y?.ticks) scales.y.ticks.color = tickColor;
      if (scales?.y?.title) scales.y.title.color = tickColor;
      if (chart.options.plugins?.legend?.labels) chart.options.plugins.legend.labels.color = tickColor;
      if (chart.options.plugins?.tooltip) {
        chart.options.plugins.tooltip.backgroundColor = isLight ? '#ffffff' : 'rgba(8, 16, 36, 0.95)';
        chart.options.plugins.tooltip.titleColor = isLight ? '#0f172a' : '#f8fafc';
        chart.options.plugins.tooltip.bodyColor = isLight ? '#334155' : '#cbd5e1';
        chart.options.plugins.tooltip.borderColor = isLight ? '#cbd5e1' : 'rgba(56, 189, 248, 0.35)';
      }
      chart.data.labels = xLabels;
      chart.data.datasets = datasets;
      chart.update('none');
      return;
    }

    const canvas = comparisonChartRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    comparisonChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: xLabels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isLight ? '#ffffff' : 'rgba(8, 16, 36, 0.95)',
            titleColor: isLight ? '#0f172a' : '#f8fafc',
            titleFont: { family: 'Inter', size: 12, weight: 'bold' },
            bodyColor: isLight ? '#334155' : '#cbd5e1',
            bodyFont: { family: 'Inter', size: 11, weight: 'normal' },
            borderColor: isLight ? '#cbd5e1' : 'rgba(56, 189, 248, 0.35)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: { top: 8, right: 12, bottom: 8, left: 12 },
            boxPadding: 4,
            caretPadding: 8,
            usePointStyle: true,
            itemSort: (a, b) => (b.parsed.y ?? 0) - (a.parsed.y ?? 0),
            callbacks: {
              labelPointStyle: () => ({
                pointStyle: 'circle',
                rotation: 0
              }),
              label: (context) => {
                const rawVal = context.raw;
                if (rawVal === null || rawVal === undefined) {
                  return ` ${context.dataset.label}: Chưa có dữ liệu`;
                }
                const val = (Number(rawVal) || 0).toLocaleString();
                return ` ${context.dataset.label}: ${val} trang`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { family: 'JetBrains Mono', size: 11 } },
            title: {
              display: true,
              text: timeframe === '24h' ? 'Khung giờ trong ngày (UTC+7)' : (timeframe === '7d' ? 'Dòng thời gian 7 ngày qua' : 'Chu kỳ quan sát 30 ngày'),
              color: tickColor,
              font: { size: 11, family: 'Inter', weight: 500 }
            }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { family: 'JetBrains Mono', size: 11 } },
            title: {
              display: true,
              text: 'Sản lượng in (Số trang)',
              color: tickColor,
              font: { size: 11, family: 'Inter', weight: 500 }
            }
          }
        }
      }
    });

    return () => {
      if (comparisonChartInstance.current) {
        comparisonChartInstance.current.destroy();
        comparisonChartInstance.current = null;
      }
    };
  }, [theme, timeframe, printers, highlightPrinterIndex, resetPrinterHighlight, hasTelemetryData, telemetryData, generateTelemetryPoints, gridColor, tickColor, isLight]);

  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
            <TrendingUp size={16} style={{ color: 'var(--brand-600)' }} />
            Biểu Đồ Sản Lượng In Theo Thời Gian {printers.length > 0 ? `(${printers.length} máy in)` : ''}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Dữ liệu sản lượng in theo chuỗi thời gian thực từ Zabbix. Di chuột qua tên máy in để làm nổi bật biểu đồ tương ứng.
          </p>
        </div>

        {/* Controls: Timeframe & Toggles */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem' }}>
          {/* Timeframe selector */}
          <div className="segmented-control">
            {(['24h', '7d', '30d'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`segmented-control-btn ${timeframe === tf ? 'active' : ''}`}
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
              >
                {tf === '24h' ? '24 Giờ' : (tf === '7d' ? '7 Ngày' : '30 Ngày')}
              </button>
            ))}
          </div>

          {/* Global Show/Hide Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => toggleAllLines(true)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', gap: '0.25rem' }}
              title="Hiện tất cả máy in trên biểu đồ"
            >
              <Eye size={12} /> Hiện tất cả
            </button>
            <button
              onClick={() => toggleAllLines(false)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', gap: '0.25rem' }}
              title="Ẩn tất cả máy in trên biểu đồ"
            >
              <EyeOff size={12} /> Ẩn tất cả
            </button>
          </div>

          {isLoadingTelemetry && (
            <span style={{ fontSize: '0.68rem', color: 'var(--brand-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} className="animate-spin" /> Đang tải...
            </span>
          )}
        </div>
      </div>

      {/* Chart Plotting Area */}
      <div style={{ height: '360px', width: '100%', position: 'relative' }}>
        {!hasTelemetryData ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: '8px',
              padding: '2rem'
            }}
          >
            <Sparkles size={28} style={{ opacity: 0.35, marginBottom: '0.5rem', color: 'var(--brand-600)' }} />
            <strong>Đang chờ dữ liệu đo đạc thời gian thực từ Zabbix</strong>
            <p style={{ fontSize: '0.75rem', marginTop: '0.35rem', textAlign: 'center', maxWidth: '420px', lineHeight: 1.5 }}>
              Hệ thống sẽ tự động tổng hợp và hiển thị biểu đồ xu hướng ngay khi máy chủ Zabbix ghi nhận đủ dữ liệu lịch sử đo đạc theo giờ/ngày.
            </p>
          </div>
        ) : (
          <canvas ref={comparisonChartRef} />
        )}
      </div>

      {/* Interactive Legend Grid */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            DANH SÁCH MÁY IN (NHẤP ĐỂ ẨN/HIỆN, DI CHUỘT ĐỂ LÀM NỔI BẬT)
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MousePointer size={11} /> Tương tác trực tiếp
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.35rem' }}>
          {printers.map((p, idx) => {
            const color = PRINTER_PALETTE[idx % PRINTER_PALETTE.length];
            const isHovered = hoveredPrinterIndex === idx;
            const isDimmed = hoveredPrinterIndex !== null && hoveredPrinterIndex !== idx;

            return (
              <div
                key={p.id}
                onClick={() => toggleSinglePrinter(idx)}
                onMouseEnter={() => highlightPrinterIndex(idx)}
                onMouseLeave={resetPrinterHighlight}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card-subtle)',
                  border: isHovered ? `1px solid ${color}` : '1px solid transparent',
                  cursor: 'pointer',
                  opacity: isDimmed ? 0.35 : 1,
                  transition: 'all 0.15s ease'
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    flexShrink: 0
                  }}
                />
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isHovered ? 700 : 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={`${p.name} (${p.id})`}
                >
                  {p.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
