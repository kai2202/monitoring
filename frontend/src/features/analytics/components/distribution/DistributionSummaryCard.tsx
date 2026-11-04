import React from 'react';
import { FontAwesomeIcon, faArrowTrendUp, faChevronRight } from '../../../../shared/icons';
import { ProductionDistributionBucket } from '../../../../types/analyticsUI';

interface DistributionSummaryCardProps {
  avgVolumePerDevice: number;
  totalDevices: number;
  totalVolume: number;
  dominantBucket: ProductionDistributionBucket | null;
  onOpenExplorer: () => void;
}

export const DistributionSummaryCard: React.FC<DistributionSummaryCardProps> = ({
  avgVolumePerDevice,
  totalDevices,
  totalVolume,
  dominantBucket,
  onOpenExplorer,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px',
        borderRadius: '20px',
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-color)',
        gap: '20px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Sản lượng trung bình / máy
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#16a34a',
              backgroundColor: 'rgba(22, 163, 74, 0.1)',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}
          >
            <FontAwesomeIcon icon={faArrowTrendUp} style={{ fontSize: '11px' }} />
            +12.4%
          </span>
        </div>

        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <strong
              style={{
                fontSize: '32px',
                fontWeight: 900,
                color: 'var(--text-primary)',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '-0.5px',
              }}
            >
              {avgVolumePerDevice.toLocaleString('vi-VN')}
            </strong>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
              trang / kỳ
            </span>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Mức vận hành tối ưu hạm đội trong chu kỳ được chọn
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tổng thiết bị:</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <strong style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
              {totalDevices.toLocaleString('vi-VN')}
            </strong>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>máy</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Dải tập trung cao nhất:</span>
          <strong style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb', fontFamily: "'JetBrains Mono', monospace" }}>
            {dominantBucket ? dominantBucket.rangeLabel : '—'}
          </strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tổng sản lượng:</span>
          <strong style={{ fontSize: '13px', fontWeight: 800, color: '#0891b2', fontFamily: "'JetBrains Mono', monospace" }}>
            {totalVolume.toLocaleString('vi-VN')} trang
          </strong>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenExplorer}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          transition: 'all 0.15s ease',
        }}
      >
        <span>Mở Device Explorer</span>
        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '12px' }} />
      </button>
    </div>
  );
};

