import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon, faArrowTrendUp } from '../../../../shared/icons';

interface TopDeviceItem {
  id: string;
  name: string;
  brand: string;
  floorName: string;
  department: string;
  timeframeVolume: number;
}

interface AnalyticsBannerPerformanceTableProps {
  topDevices: TopDeviceItem[];
}

export const AnalyticsBannerPerformanceTable: React.FC<AnalyticsBannerPerformanceTableProps> = ({
  topDevices,
}) => {
  const [tableTab, setTableTab] = useState<'kpi' | 'top_devices'>('kpi');

  const topDevice = topDevices[0];
  const totalTopVol = useMemo(() => topDevices.reduce((sum, d) => sum + d.timeframeVolume, 0), [topDevices]);

  const kpiRows = useMemo(() => {
    if (topDevices.length === 0) return [];
    return [
      {
        id: 'kpi-floor',
        initials: 'FL',
        avatarBg: 'rgba(6, 182, 212, 0.12)',
        avatarColor: '#0891b2',
        title: 'Tầng in nhiều nhất',
        subtitle: topDevice ? `${topDevice.floorName} (${topDevice.department})` : '—',
        value: topDevice && totalTopVol > 0 ? `${Math.round((topDevice.timeframeVolume / totalTopVol) * 100)}% top tải` : '—',
        subValue: topDevice ? `${topDevice.timeframeVolume.toLocaleString('vi-VN')} tr` : '—',
      },
      {
        id: 'kpi-device',
        initials: 'PR',
        avatarBg: 'rgba(245, 158, 11, 0.12)',
        avatarColor: '#d97706',
        title: 'Máy tải cao nhất',
        subtitle: topDevice ? `${topDevice.name} (${topDevice.brand})` : '—',
        value: topDevice ? `${topDevice.timeframeVolume.toLocaleString('vi-VN')} tr` : '—',
        subValue: 'Top 1 hạm đội',
      },
      {
        id: 'kpi-color',
        initials: 'CL',
        avatarBg: 'rgba(139, 92, 246, 0.12)',
        avatarColor: '#7c3aed',
        title: 'Cơ cấu phân bổ',
        subtitle: 'Cân bằng tải giữa các thiết bị',
        value: `${topDevices.length} thiết bị`,
        subValue: 'Đang theo dõi',
      },
      {
        id: 'kpi-sla',
        initials: 'SL',
        avatarBg: 'rgba(16, 185, 129, 0.12)',
        avatarColor: '#059669',
        title: 'Độ sẵn sàng',
        subtitle: 'Trạng thái kết nối hạm đội',
        value: '100% Sẵn sàng',
        subValue: 'Khả dụng vận hành',
      },
    ];
  }, [topDevices, topDevice, totalTopVol]);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minHeight: '260px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header Bảng */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border-color)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FontAwesomeIcon icon={faArrowTrendUp} style={{ fontSize: '13px', color: '#2563eb' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Hiệu Suất Vận Hành
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            backgroundColor: 'var(--bg-card)',
            padding: '3px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => setTableTab('kpi')}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: tableTab === 'kpi' ? 700 : 500,
              backgroundColor: tableTab === 'kpi' ? 'var(--bg-nav-active)' : 'transparent',
              color: tableTab === 'kpi' ? 'var(--text-nav-active)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Chỉ số trọng yếu
          </button>
          <button
            type="button"
            onClick={() => setTableTab('top_devices')}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: tableTab === 'top_devices' ? 700 : 500,
              backgroundColor: tableTab === 'top_devices' ? 'var(--bg-nav-active)' : 'transparent',
              color: tableTab === 'top_devices' ? 'var(--text-nav-active)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Top thiết bị ({topDevices.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Chỉ số trọng yếu */}
      {tableTab === 'kpi' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          {kpiRows.length === 0 ? (
            <div style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              Chưa có dữ liệu hiệu suất vận hành hạm đội.
            </div>
          ) : (
            kpiRows.map((row, idx, arr) => (
              <div
                key={row.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '8px 6px',
                  borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: row.avatarBg,
                      color: row.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      fontFamily: "'JetBrains Mono', monospace",
                      flexShrink: 0,
                    }}
                  >
                    {row.initials}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.title}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.subtitle}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {row.value}
                  </span>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    {row.subValue}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Top thiết bị */}
      {tableTab === 'top_devices' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          {topDevices.length === 0 ? (
            <div style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              Chưa có thiết bị nào trong danh mục.
            </div>
          ) : (
            topDevices.map((d, idx) => {
              const brandInitials = d.brand ? d.brand.slice(0, 2).toUpperCase() : 'PR';
              const brandColor =
                d.brand === 'Ricoh'
                  ? { bg: 'rgba(220, 38, 38, 0.12)', color: '#dc2626' }
                  : d.brand === 'Canon'
                  ? { bg: 'rgba(234, 88, 12, 0.12)', color: '#ea580c' }
                  : d.brand === 'HP'
                  ? { bg: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }
                  : d.brand === 'Epson'
                  ? { bg: 'rgba(5, 150, 105, 0.12)', color: '#059669' }
                  : { bg: 'rgba(79, 70, 229, 0.12)', color: '#4f46e5' };

              return (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '7px 6px',
                    borderBottom: idx === topDevices.length - 1 ? 'none' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: brandColor.bg,
                        color: brandColor.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        fontFamily: "'JetBrains Mono', monospace",
                        flexShrink: 0,
                      }}
                    >
                      {brandInitials}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {d.name}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {d.floorName} • {d.department}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {d.timeframeVolume.toLocaleString('vi-VN')} tr
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: idx === 0 ? '#d97706' : 'var(--text-muted)' }}>
                      Top #{idx + 1}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
