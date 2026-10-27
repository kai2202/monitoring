import React, { useEffect, useRef, useState, useMemo } from 'react';
import { PieChart as PieChartIcon, Database, Activity, Printer as PrinterIcon, Building2 } from 'lucide-react';
import { Chart } from 'chart.js';
import { Printer } from '../../types/printer';
import {
  FleetStats,
  DistributionItem,
  getDeviceTypeDistribution,
  getManufacturerDistribution,
} from '../../services/fleetService';

interface FleetCompositionDonutProps {
  printers: Printer[];
  stats: FleetStats;
  theme: string;
  isLight: boolean;
  palette: {
    purple: string;
    cyan?: string;
  };
  donutColors: string[];
}

export const FleetCompositionDonut: React.FC<FleetCompositionDonutProps> = ({
  printers,
  stats,
  isLight,
  palette,
  donutColors,
}) => {
  const [donutTab, setDonutTab] = useState<'status' | 'type' | 'mfr'>('status');
  const [hoveredItem, setHoveredItem] = useState<DistributionItem | null>(null);
  const donutRef = useRef<HTMLCanvasElement | null>(null);
  const donutInstance = useRef<Chart | null>(null);

  const tickColor = isLight ? '#64748b' : '#64748b';
  const tooltipBg = isLight ? '#ffffff' : 'rgba(8, 16, 36, 0.95)';
  const tooltipText = isLight ? '#0f172a' : '#f1f5f9';
  const tooltipBorder = isLight ? '#cbd5e1' : 'rgba(56, 189, 248, 0.25)';

  // 1. Phân bổ dữ liệu theo Tab CHỈ từ danh sách máy in thực tế
  const donutDistribution: DistributionItem[] = useMemo(() => {
    if (!printers || printers.length === 0) return [];
    const total = printers.length;

    if (donutTab === 'status') {
      const healthyCount = printers.filter(p => p.connectionStatus === 'Online' && (p.health === 'Healthy' || p.alertSeverity === 'clear')).length;
      const warningCount = printers.filter(p => p.connectionStatus === 'Online' && (p.health === 'Warning' || p.alertSeverity === 'warning')).length;
      const criticalCount = printers.filter(p => p.connectionStatus === 'Online' && (p.health === 'Critical' || p.alertSeverity === 'critical')).length;
      const offlineCount = printers.filter(p => p.connectionStatus === 'Offline' || p.health === 'Offline').length;

      const items: DistributionItem[] = [
        {
          label: 'Hoạt động tốt (Healthy)',
          count: healthyCount,
          percentage: Number(((healthyCount / total) * 100).toFixed(1)),
          color: isLight ? '#059669' : '#10b981'
        },
        {
          label: 'Cảnh báo vật tư (Warning)',
          count: warningCount,
          percentage: Number(((warningCount / total) * 100).toFixed(1)),
          color: isLight ? '#d97706' : '#f59e0b'
        },
        {
          label: 'Sự cố phần cứng (Critical)',
          count: criticalCount,
          percentage: Number(((criticalCount / total) * 100).toFixed(1)),
          color: isLight ? '#dc2626' : '#ef4444'
        },
        {
          label: 'Mất kết nối (Offline)',
          count: offlineCount,
          percentage: Number(((offlineCount / total) * 100).toFixed(1)),
          color: isLight ? '#7c3aed' : '#8b5cf6'
        }
      ];

      return items.filter(i => i.count > 0);
    }

    if (donutTab === 'type') {
      return getDeviceTypeDistribution(printers);
    }

    return getManufacturerDistribution(printers);
  }, [donutTab, printers]);

  // 2. Render & cập nhật biểu đồ Doughnut
  useEffect(() => {
    if (!donutRef.current || !printers || printers.length === 0 || donutDistribution.length === 0) {
      if (donutInstance.current) {
        donutInstance.current.destroy();
        donutInstance.current = null;
      }
      return;
    }

    const labels = donutDistribution.map(d => d.label);
    const data = donutDistribution.map(d => d.count);
    const bgColors = donutDistribution.map((d, i) => d.color || donutColors[i % donutColors.length]);

    if (donutInstance.current) {
      const chart = donutInstance.current;
      chart.data.labels = labels;
      if (chart.data.datasets[0]) {
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].backgroundColor = bgColors;
      }
      chart.update('none');
      return;
    }

    donutInstance.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: bgColors,
            borderColor: isLight ? '#ffffff' : '#081024',
            borderWidth: 2.5,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%',
        plugins: {
          legend: { display: false },
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
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = printers.length || 1;
                const pct = ((value / total) * 100).toFixed(1);
                return ` ${label}: ${value} máy (${pct}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (donutInstance.current) {
        donutInstance.current.destroy();
        donutInstance.current = null;
      }
    };
  }, [donutDistribution, isLight, tickColor, printers.length, donutColors, tooltipBg, tooltipText, tooltipBorder]);

  // Câu nhận xét tóm tắt thông minh từ dữ liệu thực
  const insightMessage = useMemo(() => {
    if (!printers || printers.length === 0) return '';
    const total = printers.length;

    if (donutTab === 'status') {
      const healthy = printers.filter(p => p.connectionStatus === 'Online' && (p.health === 'Healthy' || p.alertSeverity === 'clear')).length;
      const pct = Math.round((healthy / total) * 100);
      return `🟢 ${pct}% Máy in hoạt động ổn định • Đảm bảo công suất in ấn toàn cơ quan`;
    }
    if (donutTab === 'type') {
      const mfpCount = printers.filter(p => p.deviceType?.includes('MFP')).length;
      const pct = Math.round((mfpCount / total) * 100);
      return `🖨️ ${pct}% Là dòng máy đa chức năng (MFP) • Phục vụ In, Photocopy và Scan`;
    }
    const mfrDist = getManufacturerDistribution(printers);
    if (mfrDist.length > 0) {
      const topMfr = mfrDist[0];
      return `🏢 ${topMfr.label} là dòng máy chủ lực (${topMfr.percentage}%) • Phục vụ khối văn phòng`;
    }
    return '';
  }, [donutTab, printers]);

  // Khi chưa có dữ liệu từ Zabbix (Pending State)
  if (!printers || printers.length === 0) {
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
            <PieChartIcon size={15} style={{ color: palette.purple }} />
            CƠ CẤU TRẠNG THÁI & CHỦNG LOẠI
          </h3>

          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            Chờ kết nối Zabbix
          </span>
        </div>

        <div
          style={{
            height: '240px',
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
          <Database size={28} style={{ opacity: 0.35, marginBottom: '0.5rem', color: palette.purple }} />
          <strong style={{ fontSize: '0.85rem' }}>Chưa có dữ liệu cơ cấu từ Zabbix</strong>
          <p style={{ fontSize: '0.72rem', marginTop: '0.25rem', maxWidth: '280px', lineHeight: 1.5, margin: '0.25rem 0 0 0' }}>
            Phân bổ trạng thái và chủng loại thiết bị sẽ tự động tổng hợp ngay khi kết nối máy chủ Zabbix qua SNMP.
          </p>
        </div>
      </div>
    );
  }

  // Khi ĐÃ CÓ dữ liệu thực từ Zabbix
  return (
    <div className="card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0, width: '100%' }}>
      {/* 1. Header Bar: Tiêu đề + Tabs chuyển đổi */}
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
          <PieChartIcon size={15} style={{ color: palette.purple }} />
          CƠ CẤU TRẠNG THÁI & CHỦNG LOẠI
        </h3>

        {/* Toggle Tabs */}
        <div className="segmented-control" style={{ backgroundColor: 'var(--bg-card-subtle)' }}>
          <button
            onClick={() => { setDonutTab('status'); setHoveredItem(null); }}
            className={`segmented-control-btn ${donutTab === 'status' ? 'active' : ''}`}
            style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Activity size={11} /> Sức khỏe
          </button>
          <button
            onClick={() => { setDonutTab('type'); setHoveredItem(null); }}
            className={`segmented-control-btn ${donutTab === 'type' ? 'active' : ''}`}
            style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <PrinterIcon size={11} /> Chủng loại
          </button>
          <button
            onClick={() => { setDonutTab('mfr'); setHoveredItem(null); }}
            className={`segmented-control-btn ${donutTab === 'mfr' ? 'active' : ''}`}
            style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Building2 size={11} /> Hãng
          </button>
        </div>
      </div>

      {/* 2. Donut Canvas với Tâm Vòng Tròn Tương Tác (Center Stat Hub) */}
      <div className="chart-canvas-container" style={{ height: '170px' }}>
        <canvas ref={donutRef} />

        {/* Chỉ số trung tâm vòng tròn Donut */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            maxWidth: '120px'
          }}
        >
          <span
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1,
              fontFamily: 'JetBrains Mono'
            }}
          >
            {hoveredItem ? hoveredItem.count : printers.length}
          </span>
          <span
            style={{
              fontSize: '0.6rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginTop: '0.2rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '110px'
            }}
          >
            {hoveredItem ? hoveredItem.label.split(' ')[0] : 'TỔNG MÁY IN'}
          </span>
          {hoveredItem && (
            <span
              style={{
                fontSize: '0.65rem',
                color: hoveredItem.color || palette.purple,
                fontWeight: 700,
                marginTop: '0.1rem'
              }}
            >
              {hoveredItem.percentage}%
            </span>
          )}
        </div>
      </div>

      {/* 3. Dải Phân Bổ Chi Tiết Kèm Mini Progress Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.65rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.1rem' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            PHÂN BỔ CHI TIẾT ({donutDistribution.length} NHÓM)
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            Di chuột để xem điểm tâm
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {donutDistribution.map((item, idx) => {
            const itemColor = item.color || donutColors[idx % donutColors.length];
            const isHovered = hoveredItem?.label === item.label;

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  padding: '0.3rem 0.5rem',
                  borderRadius: '6px',
                  backgroundColor: isHovered ? (isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(129, 140, 248, 0.1)') : 'var(--bg-card-subtle)',
                  border: isHovered ? `1px solid ${itemColor}` : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: itemColor,
                        flexShrink: 0
                      }}
                    />
                    <span
                      style={{
                        color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isHovered ? 700 : 500
                      }}
                    >
                      {item.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <strong style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
                      {item.count}
                    </strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    height: '3px',
                    width: '100%',
                    backgroundColor: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${item.percentage}%`,
                      backgroundColor: itemColor,
                      borderRadius: '2px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Executive Insight Banner */}
      {insightMessage && (
        <div
          style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-card-subtle)',
            padding: '0.35rem 0.65rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <span>{insightMessage}</span>
        </div>
      )}
    </div>
  );
};
