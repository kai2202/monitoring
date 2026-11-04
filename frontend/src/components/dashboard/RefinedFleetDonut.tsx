/**
 * Frontend/src/components/dashboard/RefinedFleetDonut.tsx
 *
 * Biểu đồ Cung Tròn Đồng Tâm Đa Tầng (Concentric Radial Rings)
 * Thiết kế theo chuẩn Soft Modern SaaS: Thẻ trắng #ffffff, bo góc 18px, bóng mờ êm dịu.
 */

import React, { useState } from 'react';
import { Printer } from '../../types/printer';

export interface RefinedFleetDonutProps {
  printers: Printer[];
  onSelectHealthGroup?: (health: string) => void;
  selectedHealth?: string | null;
  isLoading?: boolean;
}

export const RefinedFleetDonut: React.FC<RefinedFleetDonutProps> = ({
  printers,
  onSelectHealthGroup,
  selectedHealth,
  isLoading = false,
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const total = printers.length;
  const criticalCount = printers.filter(
    p => p.health === 'Critical' || p.alertSeverity === 'critical' || p.connectionStatus === 'Offline'
  ).length;
  const warningCount = printers.filter(
    p =>
      (p.health === 'Warning' || p.alertSeverity === 'warning') &&
      p.health !== 'Critical' &&
      p.alertSeverity !== 'critical' &&
      p.connectionStatus !== 'Offline'
  ).length;
  const healthyCount = total - criticalCount - warningCount;

  const onlinePct = total > 0 ? Number(((healthyCount / total) * 100).toFixed(1)) : null;

  const rings = [
    {
      key: 'Healthy',
      label: 'Hoạt động tốt',
      count: healthyCount,
      pct: total > 0 ? Math.round((healthyCount / total) * 100) : 0,
      color: '#16a34a',
      radius: 70,
      circumference: 2 * Math.PI * 70,
      strokeWidth: 9,
    },
    {
      key: 'Warning',
      label: 'Cảnh báo vật tư',
      count: warningCount,
      pct: total > 0 ? Math.round((warningCount / total) * 100) : 0,
      color: '#f59e0b',
      radius: 54,
      circumference: 2 * Math.PI * 54,
      strokeWidth: 9,
    },
    {
      key: 'Critical',
      label: 'Sự cố & Ngoại tuyến',
      count: criticalCount,
      pct: total > 0 ? Math.round((criticalCount / total) * 100) : 0,
      color: '#ef4444',
      radius: 38,
      circumference: 2 * Math.PI * 38,
      strokeWidth: 9,
    },
  ];

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>
          Trạng thái thiết bị
        </h3>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {total} Thiết Bị
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* SVG Concentric Rings */}
        <div style={{ position: 'relative', width: '170px', height: '170px', flexShrink: 0, margin: '0 auto' }}>
          <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: 'rotate(-90deg)' }}>
            {rings.map(ring => {
              const dashOffset = ring.circumference - (ring.circumference * ring.pct) / 100;
              return (
                <g key={ring.key}>
                  {/* Track mờ */}
                  <circle
                    cx="85"
                    cy="85"
                    r={ring.radius}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth={ring.strokeWidth}
                    opacity={0.15}
                  />
                  {/* Active arc */}
                  {ring.pct > 0 && (
                    <circle
                      cx="85"
                      cy="85"
                      r={ring.radius}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth={ring.strokeWidth}
                      strokeDasharray={ring.circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Central Metric */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
              {onlinePct !== null ? `${onlinePct}%` : '—'}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.6px' }}>
              KHẢ DỤNG
            </span>
          </div>
        </div>

        {/* Compact Legend */}
        <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rings.map(ring => {
            const isSelected = selectedHealth === ring.key;
            return (
              <div
                key={ring.key}
                onClick={() => onSelectHealthGroup?.(ring.key)}
                onMouseEnter={() => setHoveredKey(ring.key)}
                onMouseLeave={() => setHoveredKey(null)}
                style={{
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent',
                  border: isSelected ? `1px solid ${ring.color}40` : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ring.color }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {ring.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: ring.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {ring.count} máy
                  </span>
                </div>
                {/* Mini track */}
                <div style={{ width: '100%', height: '4px', borderRadius: '2px', backgroundColor: 'var(--bg-subtle)', overflow: 'hidden' }}>
                  <div style={{ width: `${ring.pct}%`, height: '100%', backgroundColor: ring.color, borderRadius: '2px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
