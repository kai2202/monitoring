import React, { useEffect, useRef, useMemo, useState } from 'react';
import { BarChart3, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';
import { Chart } from 'chart.js';
import { Printer, Incident } from '../../types/printer';
import { getManufacturerDistribution } from '../../services/fleetService';

interface VendorBarChartProps {
  printers: Printer[];
  incidents: Incident[];
  theme: string;
  isLight: boolean;
  palette: {
    cyan: string;
    rose: string;
  };
}

interface VendorStatItem {
  vendor: string;
  totalPrinters: number;
  onlineCount: number;
  offlineCount: number;
  activeIncidentsCount: number;
  healthRate: number; // percentage
}

export const VendorBarChart: React.FC<VendorBarChartProps> = ({
  printers,
  incidents,
  isLight,
  palette,
}) => {
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const barChartInstance = useRef<Chart | null>(null);
  const [hoveredVendor, setHoveredVendor] = useState<string | null>(null);

  const gridColor = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.04)';
  const tickColor = isLight ? '#64748b' : '#64748b';
  const tooltipBg = isLight ? '#ffffff' : 'rgba(8, 16, 36, 0.95)';
  const tooltipText = isLight ? '#0f172a' : '#f1f5f9';
  const tooltipBorder = isLight ? '#cbd5e1' : 'rgba(56, 189, 248, 0.25)';

  // 1. Tính toán thống kê máy in và sự cố CHỈ từ danh sách máy in thực tế
  const vendorStats: VendorStatItem[] = useMemo(() => {
    if (!printers || printers.length === 0) return [];

    const mfrDist = getManufacturerDistribution(printers);
    const labels = mfrDist.map(d => d.label);

    return labels.map(label => {
      // Danh sách máy in thực tế thuộc hãng này
      const brandPrinters = printers.filter(p =>
        p.mfr?.toLowerCase().includes(label.toLowerCase())
      );
      const totalPrinters = brandPrinters.length;
      const onlineCount = brandPrinters.filter(p => p.connectionStatus === 'Online').length;
      const offlineCount = brandPrinters.filter(p => p.connectionStatus === 'Offline').length;

      // Tập hợp các định danh của máy in thuộc hãng (ID, IP, Tên)
      const brandIdentifiers = new Set(
        brandPrinters.flatMap(p => [
          p.id.toLowerCase(),
          p.ip.toLowerCase(),
          p.name.toLowerCase(),
          (p.serial || '').toLowerCase(),
        ]).filter(Boolean)
      );

      // Đếm các sự cố Đang Mở (Active) thuộc về các máy in thực tế của hãng này
      const activeIncidentsCount = incidents.filter(i => {
        if (i.status !== 'Active') return false;

        if (i.diagnostic?.vendor && i.diagnostic.vendor.toLowerCase().includes(label.toLowerCase())) {
          return true;
        }

        if (brandIdentifiers.has(i.printer.toLowerCase())) {
          return true;
        }

        return brandPrinters.some(p =>
          p.ip === i.printer || p.id === i.printer || p.name === i.printer
        );
      }).length;

      const healthRate = totalPrinters > 0
        ? Number(((onlineCount / totalPrinters) * 100).toFixed(1))
        : 100;

      return {
        vendor: label,
        totalPrinters,
        onlineCount,
        offlineCount,
        activeIncidentsCount,
        healthRate,
      };
    });
  }, [printers, incidents]);

  // 2. Render & cập nhật Chart.js Bar Chart
  useEffect(() => {
    if (!barChartRef.current || vendorStats.length === 0) {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
        barChartInstance.current = null;
      }
      return;
    }

    const vendorLabels = vendorStats.map(v => v.vendor);
    const activeData = vendorStats.map(v => v.onlineCount);
    const incidentData = vendorStats.map(v => v.activeIncidentsCount);

    if (barChartInstance.current) {
      const chart = barChartInstance.current;
      chart.data.labels = vendorLabels;
      if (chart.data.datasets[0]) chart.data.datasets[0].data = activeData;
      if (chart.data.datasets[1]) chart.data.datasets[1].data = incidentData;
      if (chart.options.plugins?.legend?.labels) chart.options.plugins.legend.labels.color = tickColor;
      if (chart.options.plugins?.tooltip) {
        chart.options.plugins.tooltip.backgroundColor = tooltipBg;
        chart.options.plugins.tooltip.titleColor = tooltipText;
        chart.options.plugins.tooltip.bodyColor = tickColor;
        chart.options.plugins.tooltip.borderColor = tooltipBorder;
      }
      if (chart.options.scales?.x?.ticks) chart.options.scales.x.ticks.color = tickColor;
      if (chart.options.scales?.y?.grid) chart.options.scales.y.grid.color = gridColor;
      if (chart.options.scales?.y?.ticks) chart.options.scales.y.ticks.color = tickColor;
      chart.update('none');
      return;
    }

    const canvas = barChartRef.current;
    const ctx = canvas.getContext('2d');

    let gradientCyan: CanvasGradient | string = palette.cyan;
    let gradientRose: CanvasGradient | string = palette.rose;

    if (ctx) {
      gradientCyan = ctx.createLinearGradient(0, 0, 0, 180);
      if (isLight) {
        gradientCyan.addColorStop(0, '#0284c7');
        gradientCyan.addColorStop(1, '#075985');
      } else {
        gradientCyan.addColorStop(0, '#38bdf8');
        gradientCyan.addColorStop(1, '#0284c7');
      }

      gradientRose = ctx.createLinearGradient(0, 0, 0, 180);
      if (isLight) {
        gradientRose.addColorStop(0, '#dc2626');
        gradientRose.addColorStop(1, '#991b1b');
      } else {
        gradientRose.addColorStop(0, '#f43f5e');
        gradientRose.addColorStop(1, '#be123c');
      }
    }

    barChartInstance.current = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: vendorLabels,
        datasets: [
          {
            label: 'Trực tuyến (Online)',
            data: activeData,
            backgroundColor: gradientCyan,
            borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
            barPercentage: 0.65,
            categoryPercentage: 0.8,
          },
          {
            label: 'Sự cố đang mở',
            data: incidentData,
            backgroundColor: gradientRose,
            borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
            barPercentage: 0.65,
            categoryPercentage: 0.8,
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
            position: 'top',
            align: 'end',
            labels: {
              color: tickColor,
              font: { family: 'Inter', size: 10, weight: 600 },
              usePointStyle: true,
              boxWidth: 8,
              padding: 10
            }
          },
          tooltip: {
            backgroundColor: tooltipBg,
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
                if (context.datasetIndex === 0) {
                  return ` Trực tuyến: ${val} máy`;
                }
                return ` Sự cố đang mở: ${val} sự cố`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: tickColor,
              font: { family: 'Inter', size: 10, weight: 600 }
            }
          },
          y: {
            min: 0,
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { family: 'JetBrains Mono', size: 10 },
              stepSize: 2
            }
          }
        }
      }
    });

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
        barChartInstance.current = null;
      }
    };
  }, [vendorStats, isLight, gridColor, tickColor, tooltipBg, tooltipText, tooltipBorder, palette]);

  // Khi chưa có dữ liệu máy in thực tế từ Zabbix (Backend chưa chạy hoặc chưa scrape được)
  if (!printers || printers.length === 0 || vendorStats.length === 0) {
    return (
      <div className="card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0, width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.65rem',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
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
            <BarChart3 size={15} style={{ color: palette.cyan }} />
            THỐNG KÊ MÁY IN THEO HÃNG
          </h3>

          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            Chờ kết nối Zabbix
          </span>
        </div>

        <div
          style={{
            height: '240px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-card-subtle)',
            textAlign: 'center',
            padding: '1.5rem'
          }}
        >
          <Building2 size={28} style={{ opacity: 0.35, marginBottom: '0.5rem', color: palette.cyan }} />
          <strong style={{ fontSize: '0.85rem' }}>Chưa có dữ liệu hãng từ Zabbix</strong>
          <p style={{ fontSize: '0.72rem', marginTop: '0.25rem', maxWidth: '280px', lineHeight: 1.5, margin: '0.25rem 0 0 0' }}>
            Biểu đồ đối chiếu số lượng thiết bị theo hãng sẽ tự động hiển thị ngay khi hệ thống kết nối máy chủ Zabbix và thu thập thông tin qua SNMP.
          </p>
        </div>
      </div>
    );
  }

  // Khi ĐÃ CÓ dữ liệu thực từ Zabbix
  return (
    <div className="card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0, width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          paddingBottom: '0.65rem',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
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
          <BarChart3 size={15} style={{ color: palette.cyan }} />
          THỐNG KÊ MÁY IN THEO HÃNG
        </h3>

        <span
          style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            fontFamily: 'JetBrains Mono',
            backgroundColor: 'var(--bg-card-subtle)',
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            fontWeight: 600
          }}
        >
          {vendorStats.length} Hãng • {printers.length} Thiết bị
        </span>
      </div>

      {/* Bar Chart Canvas */}
      <div className="chart-canvas-container" style={{ height: '175px' }}>
        <canvas ref={barChartRef} />
      </div>

      {/* Thẻ Thống Kê Chi Tiết Từng Hãng (Vendor Breakdown Cards) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            CHI TIẾT SỰ CỐ & SỐ MÁY HOẠT ĐỘNG
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            Theo dõi tự động từ Zabbix
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {vendorStats.map(item => {
            const hasIncidents = item.activeIncidentsCount > 0;
            const isHovered = hoveredVendor === item.vendor;

            return (
              <div
                key={item.vendor}
                onMouseEnter={() => setHoveredVendor(item.vendor)}
                onMouseLeave={() => setHoveredVendor(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.35rem 0.55rem',
                  borderRadius: '6px',
                  backgroundColor: isHovered ? (isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.08)') : 'var(--bg-card-subtle)',
                  border: isHovered ? (isLight ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)') : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Tên hãng & Tổng số máy */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: '95px' }}>
                  <Building2 size={13} style={{ color: palette.cyan, opacity: 0.85 }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.vendor}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                      {item.totalPrinters} máy ({Math.round((item.totalPrinters / (printers.length || 1)) * 100)}%)
                    </div>
                  </div>
                </div>

                {/* Thanh tiến trình tỉ lệ hoạt động (Mini Health Progress Bar) */}
                <div style={{ flex: 1, margin: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem' }}>
                    <span style={{ color: palette.cyan, fontWeight: 600 }}>
                      {item.onlineCount}/{item.totalPrinters} Online
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                      {item.healthRate}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      width: '100%',
                      backgroundColor: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      display: 'flex'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.healthRate}%`,
                        backgroundColor: palette.cyan,
                        borderRadius: '2px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Badge Sự cố đang mở */}
                <div>
                  {hasIncidents ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: isLight ? '#dc2626' : '#f43f5e',
                        backgroundColor: isLight ? 'rgba(220, 38, 38, 0.1)' : 'rgba(244, 63, 94, 0.12)',
                        border: isLight ? '1px solid rgba(220, 38, 38, 0.25)' : '1px solid rgba(244, 63, 94, 0.25)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px'
                      }}
                    >
                      <AlertCircle size={10} />
                      {item.activeIncidentsCount} sự cố
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        color: isLight ? '#059669' : '#10b981',
                        backgroundColor: isLight ? 'rgba(5, 150, 105, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px'
                      }}
                    >
                      <CheckCircle2 size={10} />
                      0 sự cố
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
