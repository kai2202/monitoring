import React from 'react';
import { FontAwesomeIcon, faArrowTrendUp } from '../../../../shared/icons';
import { AnalyticsTimeframe, FloorSummaryItem } from '../../../../types/analyticsUI';

interface AnalyticsBannerVolumeCardProps {
  timeframe: AnalyticsTimeframe;
  totalFleetVolume: number;
  floorSummaries: FloorSummaryItem[];
}

export const AnalyticsBannerVolumeCard: React.FC<AnalyticsBannerVolumeCardProps> = ({
  timeframe,
  totalFleetVolume,
  floorSummaries,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          Tổng sản lượng in ({timeframe === 'hourly' ? '24 Giờ Qua' : timeframe === '7days' ? '7 Ngày Gần Nhất' : '30 Ngày'})
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
          <span style={{ fontSize: '36px', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            {totalFleetVolume.toLocaleString('vi-VN')}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: 'rgba(22, 163, 74, 0.12)',
              color: '#16a34a',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <FontAwesomeIcon icon={faArrowTrendUp} style={{ fontSize: '11px' }} />
            +7.9%
          </span>
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Kỳ trước: <strong style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(totalFleetVolume * 0.925).toLocaleString('vi-VN')} trang</strong>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <span>Phân bổ theo tầng</span>
          <span>Toàn hạm đội</span>
        </div>

        <div
          style={{
            width: '100%',
            height: '12px',
            borderRadius: '999px',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            overflow: 'hidden',
            padding: '2px',
            gap: '2px',
            boxSizing: 'border-box',
          }}
        >
          {floorSummaries.map((fl) => {
            const shareStr = typeof fl.sharePercentage === 'number' && !isNaN(fl.sharePercentage) ? fl.sharePercentage.toFixed(1) : '0.0';
            const volStr = typeof fl.totalVolume === 'number' && !isNaN(fl.totalVolume) ? fl.totalVolume.toLocaleString('vi-VN') : '0';
            return (
              <div
                key={fl.floorId}
                style={{
                  width: `${fl.sharePercentage ?? 0}%`,
                  backgroundColor: fl.color,
                  height: '100%',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease',
                }}
                title={`${fl.floorName}: ${volStr} trang (${shareStr}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', paddingTop: '2px' }}>
          {floorSummaries.map((fl) => {
            const shareInt = typeof fl.sharePercentage === 'number' && !isNaN(fl.sharePercentage) ? fl.sharePercentage.toFixed(0) : '0';
            const volStr = typeof fl.totalVolume === 'number' && !isNaN(fl.totalVolume) ? fl.totalVolume.toLocaleString('vi-VN') : '0';
            return (
              <div key={fl.floorId} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: fl.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fl.floorName}:</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {volStr} ({shareInt}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

