import React, { useState } from 'react';
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            {
              id: 'kpi-floor',
              initials: 'FL',
              avatarBg: 'rgba(6, 182, 212, 0.12)',
              avatarColor: '#0891b2',
              title: 'Tầng in nhiều nhất',
              subtitle: 'Tầng 2 (Khối Kỹ thuật & Thiết kế Dự án)',
              value: '32% tổng tải',
              subValue: '42.300 tr',
            },
            {
              id: 'kpi-device',
              initials: 'PR',
              avatarBg: 'rgba(245, 158, 11, 0.12)',
              avatarColor: '#d97706',
              title: 'Máy tải cao nhất',
              subtitle: 'Ricoh Pro C7200s (Tầng 2)',
              value: '42.300 tr',
              subValue: 'Top 1 máy in',
            },
            {
              id: 'kpi-color',
              initials: 'CL',
              avatarBg: 'rgba(139, 92, 246, 0.12)',
              avatarColor: '#7c3aed',
              title: 'Cơ cấu Màu / B&W',
              subtitle: 'Tối ưu cân bằng định mức mực in',
              value: '38% Màu / 62% Mono',
              subValue: 'Đạt chuẩn ngân sách',
            },
            {
              id: 'kpi-sla',
              initials: 'SL',
              avatarBg: 'rgba(16, 185, 129, 0.12)',
              avatarColor: '#059669',
              title: 'Độ sẵn sàng SLA',
              subtitle: '118 / 120 thiết bị sẵn sàng in',
              value: '98.9% SLA',
              subValue: 'Khả dụng tối ưu',
            },
          ].map((row, idx, arr) => (
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
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
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
          ))}
        </div>
      )}

      {/* Tab 2: Top thiết bị */}
      {tableTab === 'top_devices' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {topDevices.map((d, idx) => {
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
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
          })}
        </div>
      )}
    </div>
  );
};

