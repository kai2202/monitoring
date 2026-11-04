import React from 'react';
import { ComparisonDeviceKPIs, ComparisonMetricKey, ComparisonMetricTab } from '../../../../types/analyticsUI';

export const COMPARISON_TABS: ComparisonMetricTab[] = [
  { key: 'totalPages', label: 'Sản lượng in', unit: 'trang', description: 'Tổng số trang in tích lũy' },
  { key: 'ppmActual', label: 'Tốc độ thực tế', unit: 'PPM', description: 'Số trang in thực tế mỗi phút' },
  { key: 'uptimePercent', label: 'Độ khả dụng', unit: '%', description: 'Tỷ lệ thời gian máy sẵn sàng phục vụ' },
  { key: 'mtbfHours', label: 'Độ ổn định (MTBF)', unit: 'giờ', description: 'Thời gian trung bình giữa 2 lần lỗi' },
  { key: 'downtimeHours', label: 'Thời gian dừng', unit: 'giờ', description: 'Tổng thời gian ngưng máy sự cố' },
  { key: 'failureCount', label: 'Số lần lỗi', unit: 'lần', description: 'Tổng số sự cố phần cứng ghi nhận' },
];

interface ComparisonBarSectionProps {
  devicesKPIs: ComparisonDeviceKPIs[];
  activeMetricKey: ComparisonMetricKey;
  onSelectMetric: (key: ComparisonMetricKey) => void;
  maxMetricValue: number;
  currentTab: ComparisonMetricTab;
}

export const ComparisonBarSection: React.FC<ComparisonBarSectionProps> = ({
  devicesKPIs,
  activeMetricKey,
  onSelectMetric,
  maxMetricValue,
  currentTab,
}) => {
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Trực Quan Hóa Đối Chiếu (Visual Comparison)
          </h3>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Chỉ số đang đối chiếu: <strong style={{ color: 'var(--text-secondary)' }}>{currentTab.label} ({currentTab.unit})</strong>
          </p>
        </div>

        {/* Metric Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--bg-card)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            overflowX: 'auto',
          }}
        >
          {COMPARISON_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectMetric(tab.key)}
              style={{
                padding: '5px 12px',
                fontSize: '11.5px',
                fontWeight: activeMetricKey === tab.key ? 700 : 500,
                borderRadius: '8px',
                backgroundColor: activeMetricKey === tab.key ? '#2563eb' : 'transparent',
                color: activeMetricKey === tab.key ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Bar Chart mô phỏng đối chiếu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {devicesKPIs.map((d) => {
          const rawVal = d[activeMetricKey];
          const numVal = typeof rawVal === 'number' ? rawVal : 0;
          const widthPercent = maxMetricValue > 0 ? (numVal / maxMetricValue) * 100 : 0;

          return (
            <div key={d.printerId} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: d.color,
                    }}
                  />
                  <strong style={{ color: 'var(--text-primary)' }}>{d.printerName}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    ({d.model} • {d.floor})
                  </span>
                </div>
                <strong style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                  {rawVal !== null ? `${rawVal.toLocaleString('vi-VN')} ${currentTab.unit}` : '—'}
                </strong>
              </div>

              <div
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-card)',
                  height: '24px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  padding: '2px',
                  boxSizing: 'border-box',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div
                  style={{
                    width: `${Math.max(3, widthPercent)}%`,
                    height: '100%',
                    borderRadius: '6px',
                    backgroundColor: d.color,
                    transition: 'width 0.4s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '6px',
                    boxSizing: 'border-box',
                  }}
                >
                  {widthPercent > 15 && (
                    <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>
                      {(typeof widthPercent === 'number' && !isNaN(widthPercent) ? widthPercent : 0).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

