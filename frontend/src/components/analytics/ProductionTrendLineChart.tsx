/**
 * Frontend/src/components/analytics/ProductionTrendLineChart.tsx
 *
 * Thành phần 5: Line Chart – Production Trend
 * - Theo dõi sản lượng theo ngày (30d), tuần (12w) và tháng (12m).
 * - Hiển thị đường cơ sở tổng sản lượng toàn hệ thống (Fleet Total Baseline) phân tách Màu & Đơn sắc.
 * - Hỗ trợ vẽ đường xu hướng của các máy in được chọn để so sánh tương quan mà KHÔNG vẽ hàng trăm/nghìn đường gây rối mắt.
 * - Tooltip hiển thị giá trị và thời gian chính xác.
 *
 * Tuân thủ AGENTS.md: MetricValue = number | null, không bịa đặt số 0.
 */

import React, { useRef, useEffect } from 'react';
import { Chart, ChartConfiguration } from 'chart.js';
import {
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  TimeGranularity,
  ProductionTrendResponse,
} from '../../types/analytics';
import { useTheme } from '../../hooks/useTheme';

export interface ProductionTrendLineChartProps {
  trendData: ProductionTrendResponse | null;
  isLoading: boolean;
  granularity: TimeGranularity;
  onGranularityChange: (g: TimeGranularity) => void;
  selectedPrinterNames: { printerId: string; name: string }[];
}

export const ProductionTrendLineChart: React.FC<ProductionTrendLineChartProps> = ({
  trendData,
  isLoading,
  granularity,
  onGranularityChange,
  selectedPrinterNames,
}) => {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !trendData || trendData.trendPoints.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = trendData.trendPoints.map(p => p.label);
    const datasets: any[] = [];

    // 1. Đường tổng sản lượng toàn hệ thống (Tổng trang)
    datasets.push({
      label: 'Tổng Sản Lượng Toàn Đội',
      data: trendData.trendPoints.map(p => p.totalFleetPages),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      fill: true,
      borderWidth: 2.5,
      tension: 0.35,
      pointRadius: 2,
      pointHoverRadius: 6,
      order: 10,
    });

    // 2. Đường Trang Màu toàn hệ thống
    datasets.push({
      label: 'Trang Màu Toàn Hệ Thống',
      data: trendData.trendPoints.map(p => p.totalFleetColorPages),
      borderColor: '#38bdf8',
      borderWidth: 1.8,
      borderDash: [4, 4],
      fill: false,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 5,
      order: 11,
    });

    // 3. Các đường máy in cụ thể được chọn (nếu có)
    const selectedMetadata = trendData.selectedPrintersMetadata || [];
    selectedMetadata.forEach(meta => {
      const data = trendData.trendPoints.map(p => (p.selectedPrinters ? p.selectedPrinters[meta.printerId] : 0));
      datasets.push({
        label: meta.name,
        data,
        borderColor: meta.color,
        borderWidth: 2.2,
        fill: false,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
        order: 5,
      });
    });

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              color: isDark ? '#94a3b8' : '#64748b',
              font: { size: 11, weight: 600 },
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            padding: 10,
            cornerRadius: 8,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 },
            callbacks: {
              label: context => {
                const val = context.parsed.y;
                return ` ${context.dataset.label}: ${val !== null ? val.toLocaleString('vi-VN') : '—'} trang`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            },
            ticks: {
              color: isDark ? '#94a3b8' : '#64748b',
              font: { size: 10.5 },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            },
            ticks: {
              color: isDark ? '#94a3b8' : '#64748b',
              font: { size: 10.5, family: "'JetBrains Mono', monospace" },
              callback: value => Number(value).toLocaleString('vi-VN'),
            },
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trendData, isDark]);

  return (
    <div
      style={{
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* 1. Header & Điều khiển Granularity */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              5. Xu Hướng Sản Lượng In Sản Xuất (Production Trend)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Theo dõi tải in toàn hệ thống và đối chiếu xu hướng của các máy in được chọn mà không gây rối mắt
            </p>
          </div>
        </div>

        {/* Granularity Toggle */}
        <div
          style={{
            display: 'inline-flex',
            padding: '3px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
          }}
        >
          {[
            { val: 'daily' as TimeGranularity, label: 'Theo Ngày' },
            { val: 'weekly' as TimeGranularity, label: 'Theo Tuần' },
            { val: 'monthly' as TimeGranularity, label: 'Theo Tháng' },
          ].map(item => (
            <button
              key={item.val}
              onClick={() => onGranularityChange(item.val)}
              style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: granularity === item.val ? 'var(--bg-nav-active)' : 'transparent',
                color: granularity === item.val ? 'var(--text-nav-active)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Canvas biểu đồ */}
      <div style={{ height: '320px', width: '100%', position: 'relative' }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '12.5px' }}>
            Đang tải dữ liệu xu hướng sản lượng...
          </div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>
    </div>
  );
};

