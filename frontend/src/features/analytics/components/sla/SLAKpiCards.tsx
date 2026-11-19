/**
 * Frontend/src/features/analytics/components/sla/SLAKpiCards.tsx
 *
 * Strip KPI Phẳng 3 Ô (/analytics/sla-cost - Tầng 1):
 * 1. Độ sẵn sàng (Uptime SLA)
 * 2. Tổng chi phí sửa chữa & vật tư
 * 3. Máy cảnh báo lỗi lặp lại
 * - Đã lược bỏ MTBF và MTTR theo yêu cầu nghiệp vụ.
 * - Tuân thủ AGENTS.md Rule 5.1 (null -> '—') & Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faShieldCheck,
  faDollarSign,
  faTriangleExclamation,
} from '../../../../shared/icons';
import { DepartmentCostAllocationItem, SLAOverviewKPIs } from '../../../../types/analyticsUI';
import { LemonPrinterItem } from '../../../../types/api';

interface SLAKpiCardsProps {
  kpis?: SLAOverviewKPIs;
  departments?: DepartmentCostAllocationItem[];
  lemonPrinters?: LemonPrinterItem[];
}

export const SLAKpiCards: React.FC<SLAKpiCardsProps> = ({
  kpis,
  departments = [],
  lemonPrinters = [],
}) => {
  const hasDeptCosts = departments.length > 0;
  const totalDeptCost = hasDeptCosts
    ? departments.reduce((sum, d) => sum + (d.totalCost || 0), 0)
    : kpis?.totalPrintCost ?? null;
  const totalDevices = departments.reduce((sum, d) => sum + (d.deviceCount || 0), 0);
  const avgPerDevice =
    totalDeptCost != null && totalDevices > 0 ? Math.round(totalDeptCost / totalDevices) : null;

  const warningPrintersCount = lemonPrinters.filter(
    (p) => p.isLemonWarning || p.incidentCount >= 5
  ).length;
  const totalIncidents = lemonPrinters.reduce((sum, p) => sum + (p.incidentCount || 0), 0);

  const cards = [
    {
      id: 'uptime',
      label: 'Độ sẵn sàng (Uptime SLA)',
      value: kpis?.fleetUptime != null ? `${kpis.fleetUptime}%` : '—',
      unit: '',
      sub: kpis?.targetUptime != null ? `Mục tiêu ≥ ${kpis.targetUptime}%` : 'Chưa có mục tiêu SLA',
      valueClass:
        kpis?.fleetUptime != null && kpis?.targetUptime != null && kpis.fleetUptime >= kpis.targetUptime
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-slate-900 dark:text-slate-100',
      icon: faShieldCheck,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'cost',
      label: 'Chi phí TB / trang in',
      value: kpis?.avgCostPerPage != null ? kpis.avgCostPerPage.toLocaleString('vi-VN') : '—',
      unit: kpis?.avgCostPerPage != null ? 'đ / trang' : '',
      sub:
        avgPerDevice != null
          ? `BQ ${avgPerDevice.toLocaleString('vi-VN')} đ/máy · ${departments.length} khu vực`
          : totalDeptCost != null
          ? `Tổng chi kỳ này: ${totalDeptCost.toLocaleString('vi-VN')} đ`
          : 'Chưa có dữ liệu định mức chi phí',
      valueClass: 'text-slate-900 dark:text-slate-100',
      icon: faDollarSign,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'lemon-alerts',
      label: 'Máy cảnh báo lỗi lặp lại',
      value: lemonPrinters.length > 0 ? `${warningPrintersCount}` : '—',
      unit: lemonPrinters.length > 0 ? `/ ${lemonPrinters.length} máy` : '',
      sub:
        lemonPrinters.length > 0
          ? `Tổng ${totalIncidents} sự cố phát sinh từ nhóm máy theo dõi`
          : 'Chưa ghi nhận máy cảnh báo',
      valueClass:
        warningPrintersCount > 0
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-slate-900 dark:text-slate-100',
      icon: faTriangleExclamation,
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
      {cards.map((item) => (
        <div key={item.id} className="px-5 py-4 flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {item.label}
            </div>
            <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
              <span className={`text-2xl font-black font-mono tracking-tight ${item.valueClass}`}>
                {item.value}
              </span>
              {item.unit && (
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {item.unit}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
              {item.sub}
            </div>
          </div>

          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${item.iconBg}`}>
            <FontAwesomeIcon icon={item.icon} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SLAKpiCards;
