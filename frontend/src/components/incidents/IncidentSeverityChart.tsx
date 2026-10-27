import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';
import { BarChart3 } from 'lucide-react';

interface IncidentSeverityChartProps {
  totalIncidents: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
}

export const IncidentSeverityChart: React.FC<IncidentSeverityChartProps> = ({
  totalIncidents,
  criticalCount,
  warningCount,
  infoCount,
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['Khẩn cấp (Critical)', 'Cảnh báo (Warning)', 'Thông tin (Info)'],
        datasets: [
          {
            label: 'Số lượng sự cố',
            data: [criticalCount, warningCount, infoCount],
            backgroundColor: isLight ? ['#dc2626', '#d97706', '#0284c7'] : ['#f87171', '#fbbf24', '#38bdf8'],
            borderRadius: 6,
            barThickness: 28
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isLight ? '#0f172a' : '#0d111d',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: isLight ? 'rgba(2, 132, 199, 0.35)' : 'rgba(56, 189, 248, 0.20)',
            borderWidth: 1,
            padding: 8,
            callbacks: {
              label: (context) => ` ${context.dataset.label}: ${context.parsed.y} sự cố`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11, weight: 600 }, color: '#94a3b8' }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { family: 'JetBrains Mono', size: 10 }, color: '#64748b' },
            grid: { color: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.035)' }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [criticalCount, warningCount, infoCount]);

  return (
    <div className="card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
          <BarChart3 size={15} style={{ color: 'var(--brand-600)' }} />
          Phân Bố Mức Độ Nghiêm Trọng
        </h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          {totalIncidents} phiếu
        </span>
      </div>

      <div style={{ flex: 1, minHeight: '135px', position: 'relative' }}>
        {totalIncidents === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            Chưa có sự cố nào phát sinh
          </div>
        ) : (
          <canvas ref={chartRef} />
        )}
      </div>
    </div>
  );
};
