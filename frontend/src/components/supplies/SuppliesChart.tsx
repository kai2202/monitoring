import React, { useEffect, useRef } from 'react';
import { BarChart3, Droplets } from 'lucide-react';
import { Chart } from 'chart.js';
import { Printer } from '../../types/printer';

export type ConsumableKey = 'black' | 'cyan' | 'magenta' | 'yellow' | 'waste';

interface SuppliesChartProps {
  printers: Printer[];
  chartConsumable: ConsumableKey;
  onSelectConsumable: (key: ConsumableKey) => void;
}

export const SuppliesChart: React.FC<SuppliesChartProps> = ({
  printers,
  chartConsumable,
  onSelectConsumable
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const validPrinters = printers
      .filter(p => typeof p.supplies[chartConsumable] === 'number')
      .map(p => ({
        name: p.name,
        value: chartConsumable === 'waste'
          ? Math.min(100, Math.max(0, 100 - (p.supplies.waste as number)))
          : (p.supplies[chartConsumable] as number)
      }))
      .sort((a, b) => {
        return chartConsumable === 'waste' ? b.value - a.value : a.value - b.value;
      })
      .slice(0, 10);

    const labels = validPrinters.map(p => p.name);
    const dataValues = validPrinters.map(p => p.value);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    const backgroundColors = dataValues.map(v => {
      if (chartConsumable === 'waste') {
        return v >= 85
          ? (isLight ? '#dc2626' : '#ef4444')
          : (v >= 65 ? (isLight ? '#d97706' : '#f59e0b') : (isLight ? '#7c3aed' : '#8b5cf6'));
      }
      return v < 15
        ? (isLight ? '#dc2626' : '#ef4444')
        : (v < 25 ? (isLight ? '#d97706' : '#f59e0b') : (isLight ? '#0284c7' : '#3b82f6'));
    });

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: chartConsumable === 'waste' ? 'Mức Đầy Mực Thải (%)' : `Mức ${chartConsumable.toUpperCase()} Còn Lại (%)`,
            data: dataValues,
            backgroundColor: backgroundColors,
            borderRadius: 4,
            barThickness: 14
          }
        ]
      },
      options: {
        indexAxis: 'y',
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
              label: (context) => {
                const val = Number(context.parsed.x ?? 0);
                if (chartConsumable === 'waste') {
                  const remainingSpace = Math.max(0, 100 - val);
                  let statusText = '(Bình thường)';
                  if (val >= 85) statusText = '(Gần đầy / Cần thay thế)';
                  else if (val >= 65) statusText = '(Sắp đầy)';
                  return ` Hộp mực thải: ${val}% đầy (Còn trống ${remainingSpace}%) ${statusText}`;
                }
                return ` Mức mực còn lại: ${val}% ${val < 15 ? '(Sắp hết - Cần bổ sung)' : ''}`;
              }
            }
          }
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            ticks: {
              callback: (val) => `${val}%`,
              color: '#64748b',
              font: { family: 'JetBrains Mono', size: 10 }
            },
            grid: { color: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.035)' }
          },
          y: {
            ticks: {
              color: isLight ? '#334155' : '#94a3b8',
              font: { family: 'JetBrains Mono', size: 10 }
            },
            grid: { display: false }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [printers, chartConsumable]);

  const consumableLabels: Record<ConsumableKey, string> = {
    black: 'Mực Đen (K)',
    cyan: 'Mực Xanh (C)',
    magenta: 'Mực Đỏ (M)',
    yellow: 'Mực Vàng (Y)',
    waste: 'Mực Thải (Waste)'
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1rem',
          paddingBottom: '0.65rem',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <BarChart3 size={16} style={{ color: 'var(--brand-600)' }} />
            So Sánh Mức Tiêu Hao Giữa Các Máy In
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            Biểu đồ thanh ngang so sánh các thiết bị có mức mực thấp nhất hoặc mực thải cao nhất cần ưu tiên thay thế
          </p>
        </div>

        {/* Consumable Selector */}
        <div className="segmented-control">
          {(['black', 'cyan', 'magenta', 'yellow', 'waste'] as ConsumableKey[]).map(key => {
            const isSelected = chartConsumable === key;
            return (
              <button
                key={key}
                onClick={() => onSelectConsumable(key)}
                className={`segmented-control-btn ${isSelected ? 'active' : ''}`}
              >
                {consumableLabels[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ height: '220px', width: '100%', position: 'relative' }}>
        {printers.length === 0 ? (
          <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
            <Droplets size={28} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>Chưa có dữ liệu so sánh vật tư</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', margin: 0 }}>Mức vật tư tiêu hao sẽ được tổng hợp từ Zabbix SNMP OID Supply / MarkerSupplies</p>
          </div>
        ) : (
          <canvas ref={chartRef} />
        )}
      </div>
    </div>
  );
};
