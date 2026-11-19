/**
 * Frontend/src/features/analytics/components/banner/FloorVolumeBreakdownCard.tsx
 *
 * Thẻ Cơ Cấu Mono/Color & Phân Bổ Theo Tầng (Cột 4 - /analytics/overview):
 * - Phần 1: Tỷ trọng Đen trắng (Mono) vs In màu (Color) từ dữ liệu thực (không fallback số giả).
 * - Phần 2: Phân bổ sản lượng động theo Tầng / Khu vực, hỗ trợ click để lọc chéo biểu đồ & bảng thiết bị.
 * - Tuân thủ AGENTS.md Rule 5 (Data Integrity) & Rule 7.1 (< 300 LOC).
 */

import React, { useMemo } from 'react';
import { FloorSummaryItem, FloorTabId } from '@/types/analyticsUI';
import { AnalyticsSummaryData, DeviceProductionItem } from '@/types/api';

export interface FloorVolumeBreakdownCardProps {
  summary?: AnalyticsSummaryData | null;
  floorSummaries?: FloorSummaryItem[];
  devices: DeviceProductionItem[];
  activeFloorTab?: FloorTabId;
  onSelectFloorTab?: (floor: FloorTabId) => void;
}

interface ComputedFloorRow {
  floorId: FloorTabId;
  floorName: string;
  departmentText: string;
  deviceCount: number;
  totalVolume: number;
  sharePercentage: number;
}

export const FloorVolumeBreakdownCard: React.FC<FloorVolumeBreakdownCardProps> = ({
  summary,
  floorSummaries = [],
  devices,
  activeFloorTab = 'all',
  onSelectFloorTab,
}) => {
  const { totalMono, totalColor, totalPages, monoPct, colorPct } = useMemo(() => {
    const devMono = devices.reduce((sum, d) => sum + (d.monoVol || 0), 0);
    const devColor = devices.reduce((sum, d) => sum + (d.colorVol || 0), 0);
    const devTotal = devMono + devColor;

    const mono = devTotal > 0 ? devMono : summary?.monoVolume ?? 0;
    const color = devTotal > 0 ? devColor : summary?.colorVolume ?? 0;
    const total = mono + color;

    if (total <= 0) {
      return { totalMono: 0, totalColor: 0, totalPages: 0, monoPct: null, colorPct: null };
    }

    const mPct = Math.round((mono / total) * 100);
    return {
      totalMono: mono,
      totalColor: color,
      totalPages: total,
      monoPct: mPct,
      colorPct: 100 - mPct,
    };
  }, [devices, summary]);

  const totalFleetVol = useMemo(() => {
    const devSum = devices.reduce((sum, d) => sum + (d.totalVol || 0), 0);
    return devSum > 0 ? devSum : totalPages;
  }, [devices, totalPages]);

  const floorRows = useMemo<ComputedFloorRow[]>(() => {
    if (devices.length > 0) {
      const grouped = new Map<
        string,
        { floorName: string; departments: Set<string>; deviceCount: number; totalVolume: number }
      >();

      devices.forEach((d) => {
        const key = d.floorId || d.floorName || 'unknown';
        const existing = grouped.get(key);
        if (existing) {
          existing.deviceCount += 1;
          existing.totalVolume += d.totalVol || 0;
          if (d.department) existing.departments.add(d.department.split('&')[0].trim());
        } else {
          const depts = new Set<string>();
          if (d.department) depts.add(d.department.split('&')[0].trim());
          grouped.set(key, {
            floorName: d.floorName || 'Khu vực chung',
            departments: depts,
            deviceCount: 1,
            totalVolume: d.totalVol || 0,
          });
        }
      });

      const fleetVol = Math.max(1, totalFleetVol);
      return Array.from(grouped.entries())
        .map(([floorId, item]) => ({
          floorId: floorId as FloorTabId,
          floorName: item.floorName,
          departmentText: Array.from(item.departments).slice(0, 2).join(', '),
          deviceCount: item.deviceCount,
          totalVolume: item.totalVolume,
          sharePercentage: totalFleetVol > 0 ? Math.round((item.totalVolume / fleetVol) * 100) : 0,
        }))
        .sort((a, b) => b.totalVolume - a.totalVolume);
    }

    return floorSummaries.map((f) => ({
      floorId: f.floorId as FloorTabId,
      floorName: f.floorName,
      departmentText: '',
      deviceCount: f.deviceCount,
      totalVolume: f.totalVolume,
      sharePercentage: f.sharePercentage,
    }));
  }, [devices, floorSummaries, totalFleetVol]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between gap-4 h-full">
      {/* 1. Tỷ trọng Đen trắng / In màu */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tỷ trọng Mono / Color
          </span>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {totalPages > 0 ? `${totalPages.toLocaleString('vi-VN')} trang` : 'Chưa có dữ liệu'}
          </span>
        </div>

        {monoPct !== null && colorPct !== null ? (
          <>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${monoPct}%` }}
                className="bg-slate-800 dark:bg-slate-200 transition-all duration-300"
                title={`Đen trắng: ${monoPct}% (${totalMono.toLocaleString('vi-VN')} trang)`}
              />
              <div
                style={{ width: `${colorPct}%` }}
                className="bg-pink-500 transition-all duration-300"
                title={`In màu: ${colorPct}% (${totalColor.toLocaleString('vi-VN')} trang)`}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2.5">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-slate-800 dark:bg-slate-200 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                    Đen trắng
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {monoPct}%
                </span>
              </div>

              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-pink-50/70 dark:bg-pink-950/30">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                    In màu
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold tabular-nums text-pink-600 dark:text-pink-400">
                  {colorPct}%
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-3 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-800/40 rounded-lg">
            Chưa có dữ liệu phân loại Mono / Color
          </div>
        )}
      </div>

      {/* 2. Phân bổ sản lượng theo Tầng / Khu vực */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Phân bổ theo tầng
          </span>
          {activeFloorTab !== 'all' && onSelectFloorTab && (
            <button
              type="button"
              onClick={() => onSelectFloorTab('all')}
              className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Xem tất cả
            </button>
          )}
        </div>

        {floorRows.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8 text-xs text-slate-400 dark:text-slate-500">
            Chưa có dữ liệu theo tầng trong kỳ.
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-start gap-2 overflow-y-auto">
            {floorRows.map((floor) => {
              const isSelected = activeFloorTab === floor.floorId;
              const barWidth = Math.max(4, Math.min(100, floor.sharePercentage));

              return (
                <button
                  key={floor.floorId}
                  type="button"
                  onClick={() =>
                    onSelectFloorTab && onSelectFloorTab(isSelected ? 'all' : floor.floorId)
                  }
                  className={`w-full text-left p-2 rounded-lg border transition-colors ${
                    onSelectFloorTab ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-1.5">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isSelected
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {floor.floorName}
                      </span>
                      <span className="text-[10.5px] text-slate-400 shrink-0">
                        ({floor.deviceCount} máy)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {floor.totalVolume.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-[10.5px] text-slate-400 w-8 text-right">
                        {floor.sharePercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSelected ? 'bg-blue-600' : 'bg-blue-500/80 dark:bg-blue-400/80'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
        <span>
          Toàn đội:{' '}
          <strong className="font-mono text-slate-600 dark:text-slate-300 font-semibold">
            {devices.length}
          </strong>{' '}
          máy
        </span>
        <span>
          Tổng:{' '}
          <strong className="font-mono text-slate-600 dark:text-slate-300 font-semibold">
            {totalFleetVol.toLocaleString('vi-VN')}
          </strong>{' '}
          trang
        </span>
      </div>
    </div>
  );
};

export default FloorVolumeBreakdownCard;
