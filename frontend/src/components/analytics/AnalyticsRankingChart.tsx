import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';
import { BarChart2 } from 'lucide-react';
import { Printer, ThemeMode } from '../../types/printer';
import { PRINTER_PALETTE } from './AnalyticsLoadCurves';

interface AnalyticsRankingChartProps {
  printers: Printer[];
  rankedPrinters: Printer[];
  rankingMetric: '30day' | 'lifetime';
  setRankingMetric: (metric: '30day' | 'lifetime') => void;
  rankingLimit: 5 | 10;
  setRankingLimit: (limit: 5 | 10) => void;
  theme: ThemeMode;
  isLight: boolean;
}

export const AnalyticsRankingChart: React.FC<AnalyticsRankingChartProps> = ({
  printers,
  rankedPrinters,
  rankingMetric,
  setRankingMetric,
  rankingLimit,
  setRankingLimit,
  theme,
  isLight,
}) => {
  const rankingBarChartRef = useRef<HTMLCanvasElement | null>(null);
  const rankingBarChartInstance = useRef<Chart | null>(null);

  const gridColor = isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.035)';
  const tickColor = isLight ? '#64748b' : '#64748b';

  useEffect(() => {
    if (!rankingBarChartRef.current || rankedPrinters.length === 0) return;

    const labels = rankedPrinters.map(p => `${p.name} (${p.id})`);
    const values = rankedPrinters.map(p => {
      if (rankingMetric === '30day') {
        return typeof p.thirtyDayVolume === 'number' ? p.thirtyDayVolume : 0;
      }
      return typeof p.counters.total === 'number' ? p.counters.total : 0;
    });

    const bgColors = rankedPrinters.map((p, idx) => {
      const originalIdx = printers.findIndex(orig => orig.id === p.id);
      return originalIdx !== -1 ? PRINTER_PALETTE[originalIdx % PRINTER_PALETTE.length] : PRINTER_PALETTE[idx % PRINTER_PALETTE.length];
    });

    if (rankingBarChartInstance.current) {
      const chart = rankingBarChartInstance.current;
      chart.data.labels = labels;
      if (chart.data.datasets[0]) {
        chart.data.datasets[0].label = rankingMetric === '30day' ? 'Sản lượng 30 ngày (Trang)' : 'Bộ đếm vòng đời (Trang)';
        chart.data.datasets[0].data = values;
        chart.data.datasets[0].backgroundColor = bgColors;
      }
      if (chart.options.plugins?.tooltip) {
        chart.options.plugins.tooltip.backgroundColor = isLight ? '#ffffff' : '#1e293b';
        chart.options.plugins.tooltip.titleColor = isLight ? '#0f172a' : '#f8fafc';
        chart.options.plugins.tooltip.bodyColor = isLight ? '#334155' : '#cbd5e1';
        chart.options.plugins.tooltip.borderColor = isLight ? '#e2e8f0' : '#334155';
      }
      const scales = chart.options.scales as any;
      if (scales?.x?.grid) scales.x.grid.color = gridColor;
      if (scales?.x?.ticks) scales.x.ticks.color = tickColor;
      if (scales?.x?.title) scales.x.title.color = tickColor;
      if (scales?.y?.ticks) scales.y.ticks.color = tickColor;
      chart.update('none');
      return;
    }

    rankingBarChartInstance.current = new Chart(rankingBarChartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: rankingMetric === '30day' ? 'Sản lượng 30 ngày (Trang)' : 'Bộ đếm vòng đời (Trang)',
            data: values,
            backgroundColor: bgColors,
            borderRadius: 5,
            borderSkipped: false
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isLight ? '#ffffff' : '#1e293b',
            titleColor: isLight ? '#0f172a' : '#f8fafc',
            bodyColor: isLight ? '#334155' : '#cbd5e1',
            borderColor: isLight ? '#e2e8f0' : '#334155',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (context) => {
                const p = rankedPrinters[context.dataIndex];
                if (rankingMetric === '30day' && p.thirtyDayVolume === null) {
                  return ` Sản lượng 30 ngày: Đang tích lũy (${p.deviceType})`;
                }
                const val = (context.parsed.x ?? 0).toLocaleString();
                const metricLabel = rankingMetric === '30day' ? 'Sản lượng 30 ngày' : 'Tổng bộ đếm vòng đời';
                return ` ${metricLabel}: ${val} trang (${p.deviceType})`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { family: 'JetBrains Mono', size: 11 },
              callback: (value) => {
                if (typeof value === 'number') {
                  return value >= 1000 ? `${(value / 1000).toLocaleString()}k` : value;
                }
                return value;
              }
            },
            title: {
              display: true,
              text: rankingMetric === '30day' ? 'Sản lượng trang in thực tế (Trang / 30 ngày)' : 'Chỉ số bộ đếm phần cứng tích lũy (Trang)',
              color: tickColor,
              font: { size: 11, family: 'Inter', weight: 500 }
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: tickColor,
              font: { family: 'Inter', size: 11, weight: 600 }
            }
          }
        }
      }
    });

    return () => {
      if (rankingBarChartInstance.current) {
        rankingBarChartInstance.current.destroy();
        rankingBarChartInstance.current = null;
      }
    };
  }, [theme, rankedPrinters, rankingMetric, printers, gridColor, tickColor, isLight]);

  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
            <BarChart2 size={16} style={{ color: 'var(--brand-600)' }} />
            Bảng Xếp Hạng Sản Lượng Máy In Hàng Đầu
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Biểu đồ cột ngang trực quan hóa các máy in có mức độ khai thác cao nhất trong văn phòng.
          </p>
        </div>

        {/* Chart View Switches */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          {/* Metric Switch */}
          <div className="segmented-control">
            <button
              onClick={() => setRankingMetric('30day')}
              className={`segmented-control-btn ${rankingMetric === '30day' ? 'active' : ''}`}
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
            >
              Sản Lượng 30 Ngày
            </button>
            <button
              onClick={() => setRankingMetric('lifetime')}
              className={`segmented-control-btn ${rankingMetric === 'lifetime' ? 'active' : ''}`}
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
            >
              Tổng Bộ Đếm Vòng Đời
            </button>
          </div>

          {/* Top 5 / Top 10 Switch */}
          <div className="segmented-control">
            <button
              onClick={() => setRankingLimit(5)}
              className={`segmented-control-btn ${rankingLimit === 5 ? 'active' : ''}`}
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
            >
              Top 5
            </button>
            <button
              onClick={() => setRankingLimit(10)}
              className={`segmented-control-btn ${rankingLimit === 10 ? 'active' : ''}`}
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
            >
              Top 10
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: `${Math.max(240, rankedPrinters.length * 36)}px`, width: '100%', position: 'relative' }}>
        {rankedPrinters.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Chưa có dữ liệu xếp hạng máy in
          </div>
        ) : (
          <canvas ref={rankingBarChartRef} />
        )}
      </div>
    </div>
  );
};
