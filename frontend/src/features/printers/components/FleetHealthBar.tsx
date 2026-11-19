/**
 * Frontend/src/features/printers/components/FleetHealthBar.tsx
 *
 * Thanh Phân Bổ Trạng Thái Hệ Thống Máy In (Fleet Health Strip):
 * - Thiết kế phẳng 1 hàng: Thanh tiến độ mảnh ở mép trên + 4 ô trạng thái chia cột bằng đường kẻ mảnh.
 * - Click vào từng ô để lọc nhanh danh sách máy in bên dưới.
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
        { key: 'healthy', label: 'Hoạt động tốt', count: healthy, pct: calcPct(healthy), barColor: '#16a34a', textCls: 'text-emerald-600', activeBg: 'bg-emerald-50/70', icon: faCircleCheck },
        { key: 'warning', label: 'Cảnh báo vật tư', count: warning, pct: calcPct(warning), barColor: '#d97706', textCls: 'text-amber-600', activeBg: 'bg-amber-50/70', icon: faTriangleExclamation },
        { key: 'critical', label: 'Sự cố phần cứng', count: critical, pct: calcPct(critical), barColor: '#ef4444', textCls: 'text-rose-600', activeBg: 'bg-rose-50/70', icon: faCircleExclamation },
        { key: 'offline', label: 'Ngoại tuyến / Lưu kho', count: offline, pct: calcPct(offline), barColor: '#64748b', textCls: 'text-slate-600', activeBg: 'bg-slate-100/80', icon: faBan },
      ],
    };
  }, [printers]);

  if (stats.total === 0) {
    return (
      <div className="px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
        Chưa có thiết bị nào trong phạm vi bộ lọc đã chọn.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Thanh tỷ lệ mảnh ở mép trên */}
      <div className="flex w-full h-1.5 bg-slate-100 dark:bg-slate-800">
        {stats.segments.map((seg) => (
          <div
            key={seg.key}
            style={{ width: `${seg.pct}%`, backgroundColor: seg.barColor }}
            className="transition-all duration-300"
            title={`${seg.label}: ${seg.count} máy (${seg.pct}%)`}
          />
        ))}
      </div>

      {/* 4 ô trạng thái ngang hàng */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
        {stats.segments.map((seg) => {
          const isSelected = activeStatus === seg.key;
          return (
            <button
              key={seg.key}
              type="button"
              onClick={() => handleSelect(isSelected ? 'all' : seg.key)}
              className={`px-4 py-2.5 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer border-none ${
                isSelected ? seg.activeBg : 'bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FontAwesomeIcon icon={seg.icon} className={`text-xs shrink-0 ${seg.textCls}`} />
                <span className={`text-xs truncate ${isSelected ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                  {seg.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1 shrink-0">
                <span className={`text-sm font-extrabold font-mono ${seg.textCls}`}>{seg.count}</span>
                <span className="text-[10.5px] text-slate-400">({seg.pct}%)</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FleetHealthBar;
