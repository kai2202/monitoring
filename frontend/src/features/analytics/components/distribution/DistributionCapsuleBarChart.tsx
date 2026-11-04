import React, { useState } from 'react';
import { ProductionDistributionBucket } from '../../../../types/analyticsUI';

interface DistributionCapsuleBarChartProps {
  buckets: ProductionDistributionBucket[];
  maxDeviceCount: number;
  dominantBucket: ProductionDistributionBucket | null;
  onSelectBucket: (bucket: ProductionDistributionBucket) => void;
}

export const DistributionCapsuleBarChart: React.FC<DistributionCapsuleBarChartProps> = ({
  buckets,
  maxDeviceCount,
  dominantBucket,
  onSelectBucket,
}) => {
  const [hoveredBucketId, setHoveredBucketId] = useState<string | null>(null);

  const activeBucketId = hoveredBucketId || dominantBucket?.id || (buckets[0]?.id ?? null);
  const chartHeightPx = 280;

  const yTicks = [
    maxDeviceCount,
    Math.round(maxDeviceCount * 0.75),
    Math.round(maxDeviceCount * 0.5),
    Math.round(maxDeviceCount * 0.25),
    0,
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px 16px 20px',
        borderRadius: '20px',
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-color)',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Phân bổ số lượng thiết bị theo từng dải
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Click cột để xem danh sách máy in chi tiết
        </span>
      </div>

      <div
        style={{
          position: 'relative',
          height: `${chartHeightPx}px`,
          display: 'flex',
          alignItems: 'flex-end',
          paddingLeft: '45px',
          paddingRight: '12px',
        }}
      >
        {/* Y-AXIS GRID LINES */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {yTicks.map((val, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <span
                style={{
                  width: '40px',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: 'right',
                  paddingRight: '6px',
                }}
              >
                {val}
              </span>
              <div
                style={{
                  flex: 1,
                  borderTop: '1px dashed var(--border-color)',
                  opacity: 0.7,
                }}
              />
            </div>
          ))}
        </div>

        {/* CAPSULE BARS */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${buckets.length}, 1fr)`,
            alignItems: 'end',
            gap: '8px',
          }}
        >
          {buckets.map((bucket) => {
            const isHovered = hoveredBucketId === bucket.id;
            const isSelected = activeBucketId === bucket.id;
            const barHeightPercent = maxDeviceCount > 0 ? (bucket.deviceCount / maxDeviceCount) * 100 : 0;
            const clampedHeightPercent = Math.max(8, Math.min(92, barHeightPercent));

            return (
              <div
                key={bucket.id}
                onClick={() => onSelectBucket(bucket)}
                onMouseEnter={() => setHoveredBucketId(bucket.id)}
                onMouseLeave={() => setHoveredBucketId(null)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                  cursor: 'pointer',
                }}
              >
                {/* TOOLTIP & GOLD PIN */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: `${clampedHeightPercent}%`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      zIndex: 50,
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                        fontSize: '11px',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        marginBottom: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
                        Dải: {bucket.rangeLabel}
                      </span>
                      <strong style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>
                        {bucket.deviceCount} máy ({bucket.percentageShare}%)
                      </strong>
                      <span style={{ fontSize: '9.5px', color: '#38bdf8' }}>
                        Tổng: {bucket.totalVolume.toLocaleString('vi-VN')} trang
                      </span>
                    </div>

                    <div
                      style={{
                        width: '2px',
                        height: '18px',
                        borderLeft: '2px dotted #64748b',
                        marginBottom: '2px',
                      }}
                    />
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#facc15',
                        border: '2px solid #ffffff',
                        boxShadow: '0 0 6px rgba(250, 204, 21, 0.8)',
                      }}
                    />
                  </div>
                )}

                {/* THÂN CỘT CON NHỘNG */}
                <div
                  style={{
                    width: '70%',
                    maxWidth: '42px',
                    minWidth: '18px',
                    height: `${clampedHeightPercent}%`,
                    borderRadius: '9999px',
                    background: isSelected
                      ? 'repeating-linear-gradient(45deg, #2563eb, #2563eb 6px, #60a5fa 6px, #60a5fa 12px)'
                      : '#93c5fd',
                    boxShadow: isSelected ? '0 0 16px rgba(37, 99, 235, 0.45)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isHovered ? 'scaleY(1.02)' : 'none',
                    transformOrigin: 'bottom',
                  }}
                />

                {/* TRỤC HOÀNH RANGE LABEL */}
                <div
                  style={{
                    marginTop: '10px',
                    textAlign: 'center',
                    fontSize: '10px',
                    fontWeight: isSelected ? 800 : 500,
                    color: isSelected ? '#2563eb' : 'var(--text-secondary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                  title={bucket.rangeLabel}
                >
                  {bucket.rangeLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

