/**
 * Frontend/src/features/dashboard/components/overview/FleetKpiCards.tsx
 *
 * Strip KPI Phẳng 4 Ô (/dashboard - Tầng 1):
 * - Đồng bộ phong cách FleetHealthBar (/printers) & CostHealthBar (/analytics/sla-cost):
 *   Thanh tiến độ sức khỏe hệ thống ở mép trên + 4 ô chia cột divide-x bấm lọc in-place.
 * - Tuân thủ AGENTS.md Rule 5: MetricValue = number | null, hiển thị '—' khi null.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React from 'react';
import { NavTabId } from '@/components/layout/Sidebar';
import { MetricValue } from '@/types/dashboardTelemetry';
import { ScrambleNumber } from '@/shared/components/ScrambleNumber';

export type KpiFilterType = 'all' | 'offline' | 'critical' | 'low_supplies' | null;

export interface FleetKpiData {
  totalPrinters: number;
  onlineCount: MetricValue;
  offlineCount: MetricValue;
  unknownCount: MetricValue;
  onlineRate: MetricValue;
  activeAlertsCount: MetricValue;
  criticalAlertsCount: MetricValue;
  warningAlertsCount: MetricValue;
  lowSuppliesCount: MetricValue;
}

export interface FleetKpiCardsProps {
  data: FleetKpiData;
  activeFilter: KpiFilterType;
  onSelectFilter: (filter: KpiFilterType) => void;
  onNavigateModule: (tab: NavTabId) => void;
}

export const FleetKpiCards: React.FC<FleetKpiCardsProps> = ({
  data,
  activeFilter,
  onSelectFilter,
}) => {
  const total = data.totalPrinters || 0;
  const offlineNum = data.offlineCount ?? 0;
  const criticalNum = data.criticalAlertsCount ?? 0;
  const warningNum = data.warningAlertsCount ?? 0;
  const onlineNum = data.onlineCount ?? Math.max(0, total - offlineNum);
  const healthyNum = Math.max(0, onlineNum - criticalNum - warningNum);

  const pct = (val: number) => (total > 0 ? Math.min(100, (val / total) * 100) : 0);

  const cards = [
    {
      id: 'all' as KpiFilterType,
      title: 'TỔNG QUY MÔ HỆ THỐNG',
      value: data.totalPrinters,
      unit: 'máy',
      subtext: data.onlineRate !== null ? `${data.onlineRate.toFixed(1)}% trực tuyến` : '—',
      dotCls: 'bg-blue-600',
      activeBg: 'bg-blue-50/60 dark:bg-blue-950/20',
      isAlert: false,
    },
    {
      id: 'offline' as KpiFilterType,
      title: 'MẤT KẾT NỐI (ICMP/SNMP)',
      value: data.offlineCount !== null ? data.offlineCount : '—',
      unit: 'máy',
      subtext: data.offlineCount === 0 ? 'Toàn bộ trực tuyến' : 'Cần kiểm tra mạng',
      dotCls: data.offlineCount && data.offlineCount > 0 ? 'bg-slate-500' : 'bg-emerald-500',
      activeBg: 'bg-slate-100/80 dark:bg-slate-800/60',
      isAlert: Boolean(data.offlineCount && data.offlineCount > 0),
    },
    {
      id: 'critical' as KpiFilterType,
      title: 'SỰ CỐ CẤP THIẾT',
      value: data.criticalAlertsCount !== null ? data.criticalAlertsCount : '—',
      unit: 'sự cố',
      subtext: data.activeAlertsCount !== null ? `${data.activeAlertsCount} cảnh báo tổng thể` : '—',
      dotCls: data.criticalAlertsCount && data.criticalAlertsCount > 0 ? 'bg-rose-500' : 'bg-emerald-500',
      activeBg: 'bg-rose-50/60 dark:bg-rose-950/20',
      isAlert: Boolean(data.criticalAlertsCount && data.criticalAlertsCount > 0),
    },
    {
      id: 'low_supplies' as KpiFilterType,
      title: 'VẬT TƯ MỰC DƯỚI 15%',
      value: data.lowSuppliesCount !== null ? data.lowSuppliesCount : '—',
      unit: 'bình/hộp',
      subtext: 'Cần lập phiếu cấp phát',
      dotCls: data.lowSuppliesCount && data.lowSuppliesCount > 0 ? 'bg-amber-500' : 'bg-emerald-500',
      activeBg: 'bg-amber-50/60 dark:bg-amber-950/20',
      isAlert: false,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden w-full">
      {/* Vạch sức khỏe đội máy mảnh ở mép trên */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 flex">
        {total > 0 && (
          <>
            {healthyNum > 0 && (
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${pct(healthyNum)}%` }}
                title={`Ổn định: ${healthyNum} máy`}
              />
            )}
            {warningNum > 0 && (
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${pct(warningNum)}%` }}
                title={`Cảnh báo: ${warningNum} máy`}
              />
            )}
            {criticalNum > 0 && (
              <div
                className="h-full bg-rose-500 transition-all"
                style={{ width: `${pct(criticalNum)}%` }}
                title={`Khẩn cấp: ${criticalNum} máy`}
              />
            )}
            {offlineNum > 0 && (
              <div
                className="h-full bg-slate-400 transition-all"
                style={{ width: `${pct(offlineNum)}%` }}
                title={`Ngoại tuyến: ${offlineNum} máy`}
              />
            )}
          </>
        )}
      </div>

      {/* 4 Ô chia cột divide-x bấm lọc in-place */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
        {cards.map((c) => {
          const isSelected = activeFilter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectFilter(isSelected ? null : c.id)}
              className={`min-w-0 px-5 py-4 text-left border-none cursor-pointer transition-colors flex flex-col justify-between select-none ${
                isSelected
                  ? c.activeBg
                  : 'bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.dotCls}`} />
                <span className="truncate">{c.title}</span>
              </div>

              <div
                className={`text-2xl font-black mt-1.5 font-mono flex items-baseline gap-1.5 ${
                  c.isAlert
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {typeof c.value === 'number' ? (
                  <ScrambleNumber value={c.value} durationMs={500} />
                ) : (
                  <span>{c.value}</span>
                )}
                <span className="text-xs font-semibold text-slate-400 font-sans">{c.unit}</span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                {c.subtext}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FleetKpiCards;
