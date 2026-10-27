import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  TrendingUp,
  Server,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { Chart } from 'chart.js';
import { TimeframeType } from '../../types/printer';
import { AvailabilityDataPoint, FleetStats } from '../../services/fleetService';

interface AvailabilityTimelineChartProps {
  timeframe: TimeframeType;
  setTimeframe: (tf: TimeframeType) => void;
  timelineData: AvailabilityDataPoint[];
  stats: FleetStats;
  theme: string;
  isLight: boolean;
  palette: {
    cyan: string;
  };
}

export const AvailabilityTimelineChart: React.FC<AvailabilityTimelineChartProps> = ({
  timeframe,
  setTimeframe,
  timelineData,
  stats,
  isLight,
  palette,
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [chartType, setChartType] = useState<'area' | 'stacked'>('area');
  const [hoveredSlice, setHoveredSlice] = useState<AvailabilityDataPoint | null>(null);
  const isLightRef = useRef(isLight);
  isLightRef.current = isLight;

  const gridColor = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.04)';
  const tickColor = isLight ? '#64748b' : '#64748b';
  const tooltipText = isLight ? '#0f172a' : '#f1f5f9';
  const tooltipBorder = isLight ? '#cbd5e1' : 'rgba(56, 189, 248, 0.25)';

  // SLA trung bình
  const averageSLA = useMemo(() => {
    if (timelineData.length === 0) return stats.onlinePct || 0;
    const sum = timelineData.reduce((acc, d) => acc + (d.onlineRate || 0), 0);
    return Number((sum / timelineData.length).toFixed(1));
  }, [timelineData, stats.onlinePct]);

  // Điểm dữ liệu mới nhất
  const latestPoint = useMemo(() => {
    if (timelineData.length === 0) return null;
    return timelineData[timelineData.length - 1];
  }, [timelineData]);

  useEffect(() => {
    if (!chartRef.current || stats.totalPrinters === 0 || timelineData.length === 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      return;
    }

    const labels = timelineData.map(d => d.timeLabel);
    const onlineData = timelineData.map(d => d.onlineCount);
    const offlineData = timelineData.map(d => d.offlineCount);
    const warningData = timelineData.map(d => d.warningCount ?? 0);

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');

    let gradientCyan: CanvasGradient | string = isLight ? 'rgba(2, 132, 199, 0.15)' : 'rgba(56, 189, 248, 0.15)';
    if (ctx) {
      gradientCyan = ctx.createLinearGradient(0, 0, 0, 240);
      if (isLight) {
        gradientCyan.addColorStop(0, 'rgba(2, 132, 199, 0.28)');
        gradientCyan.addColorStop(0.7, 'rgba(2, 132, 199, 0.05)');
        gradientCyan.addColorStop(1, 'rgba(2, 132, 199, 0.0)');
      } else {
        gradientCyan.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        gradientCyan.addColorStop(0.7, 'rgba(56, 189, 248, 0.08)');
        gradientCyan.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      }
    }

    const verticalCrosshairPlugin = {
      id: 'verticalCrosshair',
      afterDraw: (chart: any) => {
        const activeElements = chart.tooltip?.getActiveElements();
        if (activeElements && activeElements.length > 0) {
          const activePoint = activeElements[0];
          const canvasCtx = chart.ctx;
          const x = activePoint.element.x;
          const topY = chart.scales.y.top;
          const bottomY = chart.scales.y.bottom;

          canvasCtx.save();
          canvasCtx.beginPath();
          canvasCtx.setLineDash([3, 3]);
          canvasCtx.strokeStyle = isLightRef.current ? 'rgba(15, 23, 42, 0.35)' : 'rgba(56, 189, 248, 0.45)';
          canvasCtx.lineWidth = 1;
          canvasCtx.moveTo(x, topY);
          canvasCtx.lineTo(x, bottomY);
          canvasCtx.stroke();
          canvasCtx.restore();
        }
      }
    };

    if (chartType === 'area') {
      chartInstance.current = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Trực tuyến (Online)',
              data: onlineData,
              borderColor: isLight ? '#0284c7' : '#38bdf8',
              backgroundColor: gradientCyan,
              borderWidth: 2.4,
              tension: 0.38,
              fill: true,
              pointBackgroundColor: isLight ? '#0284c7' : '#38bdf8',
              pointBorderColor: isLight ? '#ffffff' : '#081024',
              pointBorderWidth: 2,
              pointRadius: timelineData.length > 15 ? 2.5 : 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Cảnh báo (Warning)',
              data: warningData,
              borderColor: isLight ? '#d97706' : '#f59e0b',
              backgroundColor: 'transparent',
              borderWidth: 1.8,
              borderDash: [4, 4],
              tension: 0.38,
              fill: false,
              pointBackgroundColor: isLight ? '#d97706' : '#f59e0b',
              pointBorderColor: isLight ? '#ffffff' : '#081024',
              pointBorderWidth: 1.5,
              pointRadius: timelineData.length > 15 ? 2 : 3,
              pointHoverRadius: 5,
            },
            {
              label: 'Ngoại tuyến (Offline)',
              data: offlineData,
              borderColor: isLight ? '#dc2626' : '#ef4444',
              backgroundColor: 'transparent',
              borderWidth: 1.8,
              borderDash: [3, 3],
              tension: 0.38,
              fill: false,
              pointBackgroundColor: isLight ? '#dc2626' : '#ef4444',
              pointBorderColor: isLight ? '#ffffff' : '#081024',
              pointBorderWidth: 1.5,
              pointRadius: timelineData.length > 15 ? 2 : 3,
              pointHoverRadius: 5,
            }
          ]
        },
        plugins: [verticalCrosshairPlugin],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                color: tickColor,
                font: { family: 'Inter', size: 10, weight: 600 },
                usePointStyle: true,
                boxWidth: 8,
                padding: 12
              }
            },
            tooltip: {
              backgroundColor: isLight ? '#ffffff' : 'rgba(8, 16, 36, 0.95)',
              titleColor: tooltipText,
              bodyColor: tickColor,
              borderColor: tooltipBorder,
              borderWidth: 1,
              padding: 10,
              boxPadding: 4,
              usePointStyle: true,
              titleFont: { family: 'Inter', size: 11, weight: 700 },
              bodyFont: { family: 'JetBrains Mono', size: 10 },
              callbacks: {
                label: (context) => {
                  const val = context.raw ?? 0;
                  return ` ${context.dataset.label}: ${val} thiết bị`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: tickColor, font: { family: 'JetBrains Mono', size: 10 } }
            },
            y: {
              min: 0,
              max: stats.totalPrinters,
              grid: { color: gridColor },
              ticks: {
                color: tickColor,
                font: { family: 'JetBrains Mono', size: 10 },
                stepSize: stats.totalPrinters > 20 ? 5 : 1
              }
            }
          }
        }
      });
    } else {
      chartInstance.current = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Trực tuyến (Online)',
              data: onlineData,
              backgroundColor: isLight ? '#0284c7' : '#38bdf8',
              borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 3, bottomRight: 3 },
              barPercentage: 0.65,
              categoryPercentage: 0.85,
            },
            {
              label: 'Cảnh báo (Warning)',
              data: warningData,
              backgroundColor: isLight ? '#d97706' : '#f59e0b',
              borderRadius: 0,
              barPercentage: 0.65,
              categoryPercentage: 0.85,
            },
            {
              label: 'Ngoại tuyến (Offline)',
              data: offlineData,
              backgroundColor: isLight ? '#dc2626' : '#ef4444',
              borderRadius: { topLeft: 3, topRight: 3, bottomLeft: 0, bottomRight: 0 },
              barPercentage: 0.65,
              categoryPercentage: 0.85,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                color: tickColor,
                font: { family: 'Inter', size: 10, weight: 600 },
                usePointStyle: true,
                boxWidth: 8,
                padding: 12
              }
            },
            tooltip: {
              backgroundColor: isLight ? '#ffffff' : 'rgba(8, 16, 36, 0.95)',
              titleColor: tooltipText,
              bodyColor: tickColor,
              borderColor: tooltipBorder,
              borderWidth: 1,
              padding: 10,
              boxPadding: 4,
              usePointStyle: true,
              titleFont: { family: 'Inter', size: 11, weight: 700 },
              bodyFont: { family: 'JetBrains Mono', size: 10 },
              callbacks: {
                label: (context) => {
                  const val = context.raw ?? 0;
                  return ` ${context.dataset.label}: ${val} thiết bị`;
                }
              }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { color: gridColor },
              ticks: { color: tickColor, font: { family: 'JetBrains Mono', size: 10 } }
            },
            y: {
              stacked: true,
              min: 0,
              max: stats.totalPrinters,
              grid: { color: gridColor },
              ticks: {
                color: tickColor,
                font: { family: 'JetBrains Mono', size: 10 },
                stepSize: stats.totalPrinters > 20 ? 5 : 1
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [timelineData, chartType, stats.totalPrinters, isLight, gridColor, tickColor, tooltipText, tooltipBorder]);

  // Khi chưa có máy in thực tế từ Zabbix (Pending State)
  if (!stats || stats.totalPrinters === 0) {
    return (
      <div className="card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: 0, width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.65rem',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <TrendingUp size={15} style={{ color: palette.cyan }} />
              XU HƯỚNG TÍNH SẴN SÀNG TOÀN HỆ THỐNG
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem', margin: 0 }}>
              Chuỗi thời gian kết nối ổn định và phản hồi SNMP từ Zabbix
            </p>
          </div>

          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            Chờ kết nối Zabbix
          </span>
        </div>

        <div
          style={{
            height: '280px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-card-subtle)',
            padding: '1.5rem',
            textAlign: 'center'
          }}
        >
          <Server size={32} style={{ opacity: 0.35, marginBottom: '0.5rem', color: palette.cyan }} />
          <strong style={{ fontSize: '0.88rem' }}>Đang chờ dữ liệu đo đạc thời gian thực từ Zabbix</strong>
          <p style={{ fontSize: '0.75rem', marginTop: '0.35rem', maxWidth: '380px', lineHeight: 1.5, margin: '0.35rem 0 0 0' }}>
            Hệ thống sẽ tự động tổng hợp và hiển thị biểu đồ xu hướng khả dụng ngay khi máy chủ Zabbix kết nối và ghi nhận thiết bị qua SNMP.
          </p>
        </div>
      </div>
    );
  }

  // Khi ĐÃ CÓ dữ liệu thực từ Zabbix
  return (
    <div className="card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: 0, width: '100%' }}>
      {/* 1. Header Bar: Tiêu đề + Chuyển đổi dạng biểu đồ + Khung thời gian */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          paddingBottom: '0.65rem',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <TrendingUp size={15} style={{ color: palette.cyan }} />
            XU HƯỚNG TÍNH SẴN SÀNG TOÀN HỆ THỐNG
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            Biểu đồ chuỗi thời gian kết nối ổn định và phản hồi SNMP trên toàn bộ {stats.totalPrinters} máy in
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="segmented-control" style={{ backgroundColor: 'var(--bg-card-subtle)' }}>
            <button
              onClick={() => setChartType('area')}
              className={`segmented-control-btn ${chartType === 'area' ? 'active' : ''}`}
              title="Biểu đồ sóng diện tích mượt mà"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}
            >
              <Activity size={12} /> Sóng diện tích
            </button>
            <button
              onClick={() => setChartType('stacked')}
              className={`segmented-control-btn ${chartType === 'stacked' ? 'active' : ''}`}
              title="Biểu đồ cột phân tầng toàn hệ thống"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}
            >
              <Layers size={12} /> Cột phân tầng
            </button>
          </div>

          <div className="segmented-control">
            {(['1h', '6h', '24h', '7d'] as TimeframeType[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`segmented-control-btn ${timeframe === tf ? 'active' : ''}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Dải KPI Thống Kê Nhanh từ Dữ Liệu Thực */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.65rem',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: isLight ? 'rgba(5, 150, 105, 0.1)' : 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLight ? '#059669' : '#10b981'
            }}
          >
            <ShieldCheck size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              SLA Khả Dụng
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isLight ? '#059669' : '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {averageSLA}%
              {averageSLA >= 95 && (
                <span style={{ fontSize: '0.62rem', fontWeight: 600, color: isLight ? '#059669' : '#10b981', backgroundColor: isLight ? 'rgba(5, 150, 105, 0.12)' : 'rgba(16, 185, 129, 0.15)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                  Đạt SLA
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: isLight ? 'rgba(2, 132, 199, 0.1)' : 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: palette.cyan
            }}
          >
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Trực Tuyến
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {latestPoint ? latestPoint.onlineCount : stats.onlineCount} <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {stats.totalPrinters}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: isLight ? 'rgba(217, 119, 6, 0.1)' : 'rgba(245, 158, 11, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLight ? '#d97706' : '#f59e0b'
            }}
          >
            <AlertTriangle size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Sự Cố Đang Mở
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isLight ? '#d97706' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              {stats.activeIncidentsCount}
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                ({stats.warningIncidentsCount} cảnh báo • {stats.criticalIncidentsCount} khẩn cấp)
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: isLight ? 'rgba(220, 38, 38, 0.1)' : 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLight ? '#dc2626' : '#ef4444'
            }}
          >
            <XCircle size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Ngoại Tuyến
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isLight ? '#dc2626' : '#ef4444' }}>
              {latestPoint ? latestPoint.offlineCount : stats.offlineCount} <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>thiết bị</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Canvas Plotting Area */}
      <div className="chart-canvas-container" style={{ height: '230px' }}>
        <canvas ref={chartRef} />
      </div>

      {/* 4. Thanh Xung Nhịp Uptime SLA (Chỉ hiển thị khi có chuỗi thời gian đa điểm > 1) */}
      {timelineData.length > 1 && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              XUNG NHỊP KHẢ DỤNG THEO TỪNG CHU KỲ KIỂM TRA ({timelineData.length} MỐC)
            </span>
            <span style={{ fontSize: '0.65rem', color: hoveredSlice ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: hoveredSlice ? 600 : 400 }}>
              {hoveredSlice ? (
                <>
                  <strong style={{ color: palette.cyan }}>{hoveredSlice.timeLabel}</strong>: {hoveredSlice.onlineCount} Trực tuyến • {hoveredSlice.warningCount ?? 0} Cảnh báo • {hoveredSlice.offlineCount} Ngoại tuyến ({hoveredSlice.onlineRate}%)
                </>
              ) : (
                'Di chuột qua từng ô để xem chi tiết mốc thời gian'
              )}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${timelineData.length}, 1fr)`,
              gap: '3px',
              height: '14px',
              alignItems: 'center'
            }}
          >
            {timelineData.map((d, idx) => {
              const isWarning = (d.warningCount ?? 0) > 0;
              const isOffline = d.offlineCount > 0;

              let barColor = isLight ? '#059669' : '#10b981';
              if (d.offlineCount >= 3) {
                barColor = isLight ? '#dc2626' : '#ef4444';
              } else if (isOffline) {
                barColor = isLight ? '#ef4444' : '#f87171';
              } else if (isWarning) {
                barColor = isLight ? '#d97706' : '#f59e0b';
              }

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredSlice(d)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  style={{
                    height: '100%',
                    backgroundColor: barColor,
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'transform 0.12s ease, filter 0.12s ease',
                    transform: hoveredSlice === d ? 'scaleY(1.35)' : 'scaleY(1)',
                    filter: hoveredSlice === d ? 'brightness(1.25)' : 'none',
                    opacity: hoveredSlice && hoveredSlice !== d ? 0.45 : 1
                  }}
                  title={`${d.timeLabel}: ${d.onlineCount} Online, ${d.offlineCount} Offline (${d.onlineRate}%)`}
                />
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <span>{timelineData[0]?.timeLabel}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} /> 100% Khả dụng
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', marginLeft: '0.35rem' }} /> Cảnh báo
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', marginLeft: '0.35rem' }} /> Ngoại tuyến
            </span>
            <span>{timelineData[timelineData.length - 1]?.timeLabel} (Hiện tại)</span>
          </div>
        </div>
      )}
    </div>
  );
};
