/**
 * Frontend/src/features/printers/components/FleetHealthBar.tsx
 *
 * Thanh Phân Bổ Trạng Thái Hạm Đội (Fleet Health Bar) & Quick Filter:
 * - Trực quan hoá tỷ lệ 4 nhóm: Tốt (🟢), Cảnh báo (🟡), Sự cố (🔴), Ngoại tuyến (⚪).
 * - Click vào từng phân đoạn để lọc nhanh danh sách bảng máy in bên dưới.
 * - Tuân thủ AGENTS.md Rule 5 (không số giả) & Rule 7.1 (< 300 LOC).
 */

import React, { useMemo } from 'react';
import { FontAwesomeIcon, faCircleCheck, faTriangleExclamation, faCircleExclamation, faBan } from '@/shared/icons';
import { Printer } from '@/types/printer';

export interface FleetHealthBarProps {
  printers: Printer[];
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
  selectedFilter?: string;
  onSelectFilter?: (status: string) => void;
}

export const FleetHealthBar: React.FC<FleetHealthBarProps> = ({
  printers,
  selectedStatus,
  onSelectStatus,
  selectedFilter,
  onSelectFilter,
}) => {
  const activeStatus = (selectedFilter || selectedStatus || 'all').toLowerCase();
  const handleSelect = onSelectFilter || onSelectStatus || (() => {});
  const stats = useMemo(() => {
    const total = printers.length;
    let healthy = 0;
    let warning = 0;
    let critical = 0;
    let offline = 0;

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

    const calcPct = (count: number) => (total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0);

    return {
      total,
      segments: [
        { key: 'healthy', label: 'Hoạt động tốt', count: healthy, pct: calcPct(healthy), color: '#16a34a', bg: '#ecfdf5', border: '#bbf7d0', icon: faCircleCheck },
        { key: 'warning', label: 'Cảnh báo vật tư', count: warning, pct: calcPct(warning), color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: faTriangleExclamation },
        { key: 'critical', label: 'Sự cố phần cứng', count: critical, pct: calcPct(critical), color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: faCircleExclamation },
        { key: 'offline', label: 'Ngoại tuyến / Lưu kho', count: offline, pct: calcPct(offline), color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: faBan },
      ],
    };
  }, [printers]);

  if (stats.total === 0) {
    return (
      <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
        Chưa có thiết bị nào trong phạm vi bộ lọc đã chọn.
      </div>
    );
  }

  return (
    <div style={{ padding: '14px 18px', borderRadius: '14px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: 'var(--shadow-sm)' }}>
      {/* Segmented Progress Bar */}
      <div style={{ display: 'flex', width: '100%', height: '8px', borderRadius: '9999px', overflow: 'hidden', backgroundColor: 'var(--bg-subtle)' }}>
        {stats.segments.map((seg) => (
          <div
            key={seg.key}
            style={{
              width: `${seg.pct}%`,
              backgroundColor: seg.color,
              transition: 'width 0.4s ease',
            }}
            title={`${seg.label}: ${seg.count} máy (${seg.pct}%)`}
          />
        ))}
      </div>

      {/* 4 Interactive Quick Filter Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
        {stats.segments.map((seg) => {
          const isSelected = activeStatus === seg.key;
          return (
            <button
              key={seg.key}
              type="button"
              onClick={() => handleSelect(isSelected ? 'all' : seg.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                borderRadius: '8px',
                border: isSelected ? `1.5px solid ${seg.color}` : '1px solid var(--border-color)',
                backgroundColor: isSelected ? seg.bg : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? `0 0 0 2px ${seg.color}25` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FontAwesomeIcon icon={seg.icon} style={{ fontSize: '11px', color: seg.color }} />
                <span style={{ fontSize: '11.5px', fontWeight: isSelected ? 700 : 500, color: 'var(--text-primary)' }}>
                  {seg.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: seg.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {seg.count}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  ({seg.pct}%)
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FleetHealthBar;
