import React from 'react';
import { FontAwesomeIcon, faXmark } from '../../../../shared/icons';
import { ProductionDistributionBucket } from '../../../../types/analyticsUI';

interface DeviceExplorerHeaderProps {
  bucket: ProductionDistributionBucket;
  dynamicKPIs: {
    count: number;
    totalVol: number;
    avgVol: number;
    pctOfBucket: number;
  };
  onClose: () => void;
}

export const DeviceExplorerHeader: React.FC<DeviceExplorerHeaderProps> = ({
  bucket,
  dynamicKPIs,
  onClose,
}) => {
  return (
    <div
      style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: 'var(--bg-card)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              color: '#2563eb',
              fontSize: '13px',
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              border: '1px solid rgba(37, 99, 235, 0.3)',
            }}
          >
            Dải {bucket.rangeLabel} trang
          </span>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Device Explorer — Danh Sách Thiết Bị Trong Dải
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Khám phá, tra cứu và lọc toàn diện các máy in thuộc dải sản lượng {bucket.rangeLabel} trang
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Đóng (Esc)"
        >
          <FontAwesomeIcon icon={faXmark} className="text-sm" />
        </button>
      </div>

      {/* 4 Thẻ KPI Phản hồi động */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            Số máy khớp lọc
          </span>
          <strong style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
            {dynamicKPIs.count.toLocaleString('vi-VN')}
          </strong>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
            / {bucket.deviceCount} máy ({dynamicKPIs.pctOfBucket}%)
          </span>
        </div>

        <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            Tổng sản lượng lọc
          </span>
          <strong style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb', fontFamily: "'JetBrains Mono', monospace" }}>
            {dynamicKPIs.totalVol.toLocaleString('vi-VN')}
          </strong>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>trang in</span>
        </div>

        <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            Trung bình/máy
          </span>
          <strong style={{ fontSize: '18px', fontWeight: 800, color: '#0891b2', fontFamily: "'JetBrains Mono', monospace" }}>
            {dynamicKPIs.avgVol.toLocaleString('vi-VN')}
          </strong>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>trang/kỳ</span>
        </div>

        <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            Tỷ trọng hạm đội
          </span>
          <strong style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a', fontFamily: "'JetBrains Mono', monospace" }}>
            {bucket.percentageShare}%
          </strong>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>toàn hệ thống</span>
        </div>
      </div>
    </div>
  );
};
