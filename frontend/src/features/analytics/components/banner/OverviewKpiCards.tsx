/**
 * Frontend/src/features/analytics/components/banner/OverviewKpiCards.tsx
 *
 * Dải KPI Tổng Quan Sản Lượng Chuẩn Dạng Strip (Đồng bộ ngôn ngữ /printers):
 * - Thiết kế 1 thanh hợp nhất (Consolidated Health Strip): Thanh màu mảnh mép trên + 3 ô chia cột hairline.
 * - Phẳng, tinh gọn, loại bỏ thẻ rời rạc chiếm nhiều diện tích.
 * - 100% dữ liệu thực từ AnalyticsSummaryData & ProductionTrendResponse.
 * - Tuân thủ AGENTS.md Rule 5 (Data Integrity) & Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faPrint,
  faBolt,
  faWifi,
  faArrowTrendUp,
  faArrowTrendDown,
} from '@/shared/icons';
import { AnalyticsSummaryData, ProductionTrendResponse, DeviceProductionItem } from '@/types/api';
import { AnalyticsTimeframe } from '@/types/analyticsUI';

export interface OverviewKpiCardsProps {
  timeframe: AnalyticsTimeframe;
  summary: AnalyticsSummaryData | null;
  trend: ProductionTrendResponse | null;
  devices?: DeviceProductionItem[];
}

export const OverviewKpiCards: React.FC<OverviewKpiCardsProps> = ({
  timeframe,
  summary,
  trend,
  devices = [],
}) => {
  const activeCount = summary?.activePrintersCount ?? 0;
  const totalCount = summary?.totalPrintersCount ?? 0;
  const hasDevices = totalCount > 0;

  const totalVol = hasDevices ? (summary?.totalFleetVolume ?? trend?.currentTotalVolume ?? null) : null;
  const prevVol = hasDevices ? (trend?.previousTotalVolume ?? null) : null;
  const growth = hasDevices && totalVol !== null && totalVol > 0
    ? (summary?.growthRatePercent ?? trend?.growthPercent ?? null)
    : null;

  const avgDaily = hasDevices ? (summary?.avgDailyVolume ?? null) : null;
  const peakVol = hasDevices && trend?.peakVolume && trend.peakVolume > 0 ? trend.peakVolume : null;
  const peakLabel = peakVol !== null ? trend?.peakLabel ?? null : null;

  const onlinePct = hasDevices ? Math.round((activeCount / totalCount) * 100) : null;
  const isPositiveGrowth = growth !== null && growth >= 0;

  const timeframeText =
    timeframe === 'hourly' ? '24 giờ qua' : timeframe === '7days' ? '7 ngày qua' : '30 ngày qua';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* 1. Thanh Tỷ Lệ Đa Sắc Mảnh Mép Trên (Đồng bộ kiểu /printers FleetHealthBar) */}
      <div className="flex w-full h-1.5 bg-slate-100 dark:bg-slate-800">
        <div
          className="bg-blue-600 transition-all duration-300"
          style={{ width: '50%' }}
          title="Tổng sản lượng"
        />
        <div
          className="bg-amber-500 transition-all duration-300"
          style={{ width: '25%' }}
          title="Trung bình & Đỉnh tải"
        />
        <div
          className="bg-emerald-500 transition-all duration-300"
          style={{ width: `${onlinePct ? Math.min(25, (onlinePct / 100) * 25) : 25}%` }}
          title="Độ sẵn sàng thiết bị"
        />
      </div>

      {/* 2. Dải 3 Ngăn Thống Kê Chia Cột Đường Kẻ Mảnh (divide-x) */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
        {/* Ngăn 1: Tổng sản lượng */}
        <div className="p-4 sm:px-5 sm:py-3.5 flex flex-col justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[11px] shrink-0">
                <FontAwesomeIcon icon={faPrint} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Tổng sản lượng ({timeframeText})
              </span>
            </div>
            {growth !== null && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold shrink-0 ${
                  isPositiveGrowth
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                }`}
              >
                <FontAwesomeIcon icon={isPositiveGrowth ? faArrowTrendUp : faArrowTrendDown} className="text-[9.5px]" />
                <span>{isPositiveGrowth ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`}</span>
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-2 mt-0.5">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {totalVol !== null ? totalVol.toLocaleString('vi-VN') : '—'}
              <span className="text-xs font-normal text-slate-400 font-sans ml-1">trang</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Kỳ trước:{' '}
            <strong className="font-mono text-slate-700 dark:text-slate-300">
              {prevVol !== null ? `${prevVol.toLocaleString('vi-VN')} trang` : 'Chưa có dữ liệu'}
            </strong>
          </div>
        </div>

        {/* Ngăn 2: Trung bình ngày & Đỉnh tải */}
        <div className="p-4 sm:px-5 sm:py-3.5 flex flex-col justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[11px] shrink-0">
                <FontAwesomeIcon icon={faBolt} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {timeframe === 'hourly' ? 'Sản lượng / Ngày' : 'Trung bình / Ngày'}
              </span>
            </div>
            <span className="text-[10.5px] font-semibold text-amber-600 dark:text-amber-400 shrink-0">
              • Vận hành ổn định
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2 mt-0.5">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {avgDaily !== null ? avgDaily.toLocaleString('vi-VN') : '—'}
              <span className="text-xs font-normal text-slate-400 font-sans ml-1">trang/ngày</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Đỉnh tải:{' '}
            <strong className="font-mono text-slate-700 dark:text-slate-300">
              {peakVol !== null && peakLabel
                ? `${peakLabel} (${peakVol.toLocaleString('vi-VN')} tr)`
                : 'Chưa có dữ liệu'}
            </strong>
          </div>
        </div>

        {/* Ngăn 3: Độ sẵn sàng thiết bị */}
        <div className="p-4 sm:px-5 sm:py-3.5 flex flex-col justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[11px] shrink-0">
                <FontAwesomeIcon icon={faWifi} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Độ sẵn sàng thiết bị
              </span>
            </div>
            {onlinePct !== null && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold shrink-0 ${
                  onlinePct >= 90
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                }`}
              >
                {onlinePct}% Online
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-2 mt-0.5">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {hasDevices ? `${activeCount} / ${totalCount}` : '—'}
              <span className="text-xs font-normal text-slate-400 font-sans ml-1">máy trực tuyến</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {hasDevices
              ? totalCount - activeCount > 0
                ? `${totalCount - activeCount} máy đang mất kết nối`
                : '100% thiết bị trong phạm vi đang trực tuyến'
              : 'Chưa có thiết bị trong phạm vi'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewKpiCards;
