/**
 * Frontend/src/features/analytics/components/linechart/PrintVolumeCanvasChart.tsx
 *
 * Biểu đồ Đường Cong Spline Canvas Động (HTML5 Canvas qua Chart.js):
 * - Thay thế hoàn toàn các đường SVG cubic Bezier tĩnh nhân tạo.
 * - Nhận mảng dữ liệu thực [currentSeries, previousSeries, labels].
 * - Tự động tính toán scale trục X/Y, đường lưới nét đứt và hiệu ứng gradient chuyển màu.
 * - Tuân thủ AGENTS.md Rule 5 (Data Integrity) & Rule 7.1 (< 300 LOC).
 */

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export interface PrintVolumeCanvasChartProps {
  labels: string[];
  currentSeries: number[];
  previousSeries: number[];
  height?: number;
}

export const PrintVolumeCanvasChart: React.FC<PrintVolumeCanvasChartProps> = ({
  labels,
  currentSeries,
  previousSeries,
  height = 280,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Tạo gradient fill mềm mại cho đường kỳ này
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.16)');
    gradient.addColorStop(0.65, 'rgba(37, 99, 235, 0.04)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

    // Hủy instance cũ nếu có trước khi tạo mới (tránh rò rỉ bộ nhớ)
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Kỳ này',
            data: currentSeries,
            borderColor: '#2563eb',
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#2563eb',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2,
            order: 1,
          },
          {
            label: 'Kỳ trước',
            data: previousSeries,
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            borderDash: [5, 4],
            fill: false,
            tension: 0.35,
            borderWidth: 1.8,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: '#f59e0b',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2,
            order: 2,
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
          legend: {
            display: false, // Dùng legend đồng bộ ở header
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#94a3b8',
            bodyColor: '#f8fafc',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 10,
            titleFont: { size: 11, family: "'JetBrains Mono', sans-serif" },
            bodyFont: { size: 12, family: "'JetBrains Mono', sans-serif", weight: 'bold' },
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = (context.parsed.y ?? 0).toLocaleString('vi-VN');
                return ` ${label}: ${val} trang`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: "'JetBrains Mono', sans-serif",
                size: 11,
              },
              maxTicksLimit: 8,
              maxRotation: 0,
            },
            border: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(226, 232, 240, 0.65)',
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: "'JetBrains Mono', sans-serif",
                size: 10.5,
              },
              maxTicksLimit: 5,
              callback: (value) => {
                const num = Number(value);
                if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
                return num.toString();
              },
            },
            border: {
              display: false,
              dash: [4, 4],
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [labels, currentSeries, previousSeries, height]);

  return (
    <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
