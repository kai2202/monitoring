/**
 * Frontend/src/components/dashboard/RefinedFleetDonut.tsx
 *
 * Biểu Đồ Vành Khăn Phân Đoạn Trạng Thái Hạm Đội (Segmented Donut Chart):
 * - Tách bạch 4 nhóm chuẩn hóa: Hoạt động tốt (🟢), Cảnh báo vật tư (🟡), Sự cố phần cứng (🔴), Ngoại tuyến / Lưu kho (⚪).
 * - Tâm biểu đồ hiển thị Tỷ lệ Khả dụng + Tỷ số trực tuyến thực tế (91/100 máy).
 * - Hiệu ứng Dimming làm mờ phân đoạn không chọn & Nút [✕ Hủy lọc] tại chỗ.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { Printer } from '../../types/printer';
import { FleetHealthDistribution } from '../../types/dashboardTelemetry';
import { FontAwesomeIcon, faRotate } from '../../shared/icons';

export interface RefinedFleetDonutProps {
  printers: Printer[];
  distribution?: FleetHealthDistribution | null;
  onSelectHealthGroup?: (health: string) => void;
  selectedHealth?: string | null;
  isLoading?: boolean;
}

export const RefinedFleetDonut: React.FC<RefinedFleetDonutProps> = ({
  printers,
  distribution,
  onSelectHealthGroup,
  selectedHealth,
  isLoading = false,
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Thống kê chuẩn 4 nhóm độc lập (Rule 5 & 6)
  const stats = useMemo(() => {
    const total = distribution ? distribution.totalCount : printers.length;
    let healthy = 0;
    let warning = 0;
    let critical = 0;
    let offline = 0;

    if (distribution) {
      healthy = distribution.healthyCount;
      warning = distribution.warningCount;
      critical = distribution.criticalCount;
      offline = distribution.offlineCount;
    } else {
      printers.forEach((p) => {
        const isOff = p.connectionStatus === 'Offline' || p.monitoringStatus === 'Storage' || p.monitoringStatus === 'Decommissioned';
        if (isOff) {
          offline++;
        } else if (p.health === 'Critical' || p.alertSeverity === 'critical') {
          critical++;
        } else if (p.health === 'Warning' || p.alertSeverity === 'warning') {
          warning++;
        } else {
          healthy++;
        }
      });
    }

    const onlineCount = healthy + warning;
    const onlinePct = total > 0 ? Number(((onlineCount / total) * 100).toFixed(1)) : null;

    const calcPct = (count: number) => (total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0);

    const segments = [
      { key: 'Healthy', label: 'Hoạt động tốt', count: healthy, pct: calcPct(healthy), color: '#16a34a' },
      { key: 'Warning', label: 'Cảnh báo vật tư', count: warning, pct: calcPct(warning), color: '#f59e0b' },
      { key: 'Critical', label: 'Sự cố phần cứng', count: critical, pct: calcPct(critical), color: '#ef4444' },
      { key: 'Offline', label: 'Ngoại tuyến / Lưu kho', count: offline, pct: calcPct(offline), color: '#64748b' },
    ];

    return { total, onlineCount, onlinePct, segments };
  }, [printers, distribution]);

  // Tính toán độ dài cung tròn và khoảng lệch trên vòng tròn đơn (R=64, C=402.12)
  const R = 64;
  const C = 2 * Math.PI * R;

  const segmentsWithOffset = useMemo(() => {
    let accumulatedOffset = 0;
    const nonZeroSegments = stats.segments.filter((s) => s.pct > 0);
    const gap = nonZeroSegments.length > 1 ? 2 : 0;

    return stats.segments.map((seg) => {
      const arcLength = seg.pct > 0 ? Math.max(1, (seg.pct / 100) * C - gap) : 0;
      const offset = accumulatedOffset;
      accumulatedOffset += (seg.pct / 100) * C;
      return {
        ...seg,
        arcLength,
        offset,
      };
    });
  }, [stats.segments, C]);

  const activeSegment = stats.segments.find((s) => s.key === selectedHealth);

  return (
    <div
      style={{
        padding: '22px 24px',
        borderRadius: '20px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Header Bar kèm Nút Hủy Lọc */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', margin: 0, letterSpacing: '-0.2px' }}>
          Trạng thái thiết bị
        </h3>

        {activeSegment ? (
          <button
            type="button"
            onClick={() => onSelectHealthGroup?.(activeSegment.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: `${activeSegment.color}15`,
              border: `1px solid ${activeSegment.color}40`,
              color: activeSegment.color,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Bấm để hủy lọc nhóm này"
          >
            <span>Đang lọc: {activeSegment.label} ({activeSegment.count})</span>
            <FontAwesomeIcon icon={faRotate} style={{ fontSize: '9px', marginLeft: '2px' }} />
          </button>
        ) : (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: 'var(--bg-subtle, #f8fafc)',
              color: 'var(--text-secondary, #475569)',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              border: '1px solid var(--border-color, #e2e8f0)',
            }}
          >
            {isLoading ? '...' : stats.total > 0 ? `${stats.total} Thiết Bị` : 'Chưa có thiết bị'}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        {/* SVG Segmented Donut Chart */}
        <div style={{ position: 'relative', width: '170px', height: '170px', flexShrink: 0, margin: '0 auto' }}>
          <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: 'rotate(-90deg)' }}>
            {/* Vòng nền mờ */}
            <circle
              cx="85"
              cy="85"
              r={R}
              fill="none"
              stroke="var(--border-color, #e2e8f0)"
              strokeWidth={11}
              opacity={0.5}
            />

            {/* Các phân đoạn trạng thái */}
            {stats.total > 0 &&
              segmentsWithOffset.map((seg) => {
                if (seg.pct <= 0) return null;
                const isSelected = selectedHealth === seg.key;
                const isHovered = hoveredKey === seg.key;
                const isDimmed = (selectedHealth && !isSelected) || (hoveredKey && !isHovered && !selectedHealth);

                return (
                  <circle
                    key={seg.key}
                    cx="85"
                    cy="85"
                    r={R}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isSelected || isHovered ? 13 : 11}
                    strokeDasharray={`${seg.arcLength} ${C}`}
                    strokeDashoffset={-seg.offset}
                    opacity={isDimmed ? 0.22 : 1}
                    style={{
                      transition: 'all 0.25s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelectHealthGroup?.(seg.key)}
                    onMouseEnter={() => setHoveredKey(seg.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                  />
                );
              })}
          </svg>

          {/* Central Metrics Hub */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: '21px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1 }}>
              {isLoading ? '...' : stats.onlinePct !== null ? `${stats.onlinePct}%` : '—'}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted, #64748b)', letterSpacing: '0.5px', marginTop: '3px' }}>
              KHẢ DỤNG
            </span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#16a34a', fontFamily: "'JetBrains Mono', monospace", marginTop: '2px' }}>
              {stats.onlineCount}/{stats.total} online
            </span>
          </div>
        </div>

        {/* 4 Nhóm Chú giải Tương Tác */}
        <div style={{ flex: 1, minWidth: '190px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {stats.segments.map((seg) => {
            const isSelected = selectedHealth === seg.key;
            const isHovered = hoveredKey === seg.key;

            return (
              <div
                key={seg.key}
                onClick={() => onSelectHealthGroup?.(seg.key)}
                onMouseEnter={() => setHoveredKey(seg.key)}
                onMouseLeave={() => setHoveredKey(null)}
                style={{
                  cursor: 'pointer',
                  padding: '7px 10px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? `${seg.color}12` : isHovered ? 'var(--bg-subtle, #f8fafc)' : 'transparent',
                  border: isSelected ? `1.5px solid ${seg.color}` : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: seg.color }} />
                  <span style={{ fontSize: '11.5px', fontWeight: isSelected ? 700 : 500, color: 'var(--text-primary, #0f172a)' }}>
                    {seg.label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: seg.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {isLoading ? '...' : `${seg.count} máy`}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)', minWidth: '38px', textAlign: 'right' }}>
                    ({seg.pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RefinedFleetDonut;
