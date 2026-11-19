/**
 * Frontend/src/features/analytics/components/distribution/ProductionHorizontalBarChart.tsx
 *
 * Bảng Phân Bố Sản Lượng Thiết Bị (Enterprise Table + Integrated Pinned Bar):
 * - Dữ liệu thiết bị nhận trực tiếp từ Service/API thông qua props devices.
 * - Tích hợp thanh Ghim Đối Chiếu ngay bên trong card (khi pinnedPrinterIds.length > 0).
 * - Đồng bộ bộ lọc Tầng (FloorTabId) liên thông với biểu đồ phía trên.
 * - Hỗ trợ lọc theo tầng, tìm kiếm, sắp xếp (Cao nhất / Thấp nhất / % In màu).
 * - Chuẩn hóa container rounded-xl đồng bộ tab /printers.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import {
  FontAwesomeIcon,
  faScaleBalanced,
  faMagnifyingGlass,
  faXmark,
} from '../../../../shared/icons';
import { AnalyticsTimeframe, FloorTabId } from '../../../../types/analyticsUI';
import { DeviceProductionItem } from '../../../../types/api';
import { DeviceHorizontalBarRow, ProcessedPrinterItem } from './DeviceHorizontalBarRow';

export type ProductionSortMode = 'volume_desc' | 'volume_asc' | 'color_desc';

export interface ProductionHorizontalBarChartProps {
  timeframe: AnalyticsTimeframe;
  activeFloorTab: FloorTabId;
  onSelectFloorTab: (floor: FloorTabId) => void;
  pinnedPrinterIds: string[];
  onTogglePinPrinter: (printerId: string) => void;
  onClearAllPinned?: () => void;
  onOpenComparisonModal?: () => void;
  devices?: DeviceProductionItem[];
}

export const ProductionHorizontalBarChart: React.FC<ProductionHorizontalBarChartProps> = ({
  timeframe: _timeframe,
  activeFloorTab,
  onSelectFloorTab,
  pinnedPrinterIds,
  onTogglePinPrinter,
  onClearAllPinned,
  onOpenComparisonModal,
  devices = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<ProductionSortMode>('volume_desc');
  const [showAll, setShowAll] = useState(false);

  const floorTabs = useMemo(() => {
    const map = new Map<string, string>();
    devices.forEach((p) => {
      if (p.floorId && !map.has(p.floorId)) {
        map.set(
          p.floorId,
          p.floorName || (p.floorId.startsWith('floor-') ? `Tầng ${p.floorId.replace('floor-', '')}` : p.floorId)
        );
      }
    });
    const entries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return [
      { id: 'all' as FloorTabId, label: 'Tất cả' },
      ...entries.map(([id, label]) => ({
        id: id as FloorTabId,
        label,
      })),
    ];
  }, [devices]);

  const pinnedDevices = useMemo(() => {
    const map = new Map(devices.map((d) => [d.id, d]));
    return pinnedPrinterIds
      .map((id) => ({ id, device: map.get(id) }))
      .filter((item) => item.device !== undefined);
  }, [pinnedPrinterIds, devices]);

  const processedPrinters = useMemo<ProcessedPrinterItem[]>(() => {
    let list = [...devices];
    if (activeFloorTab !== 'all') {
      list = list.filter((p) => p.floorId === activeFloorTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
      );
    }

    const mapped: ProcessedPrinterItem[] = list.map((p) => ({
      id: p.id,
      name: p.name,
      model: p.model,
      floorName: p.floorName,
      department: p.department,
      totalVol: p.totalVol,
      monoVol: p.monoVol,
      colorVol: p.colorVol,
      monoPercent: p.monoPercent,
      colorPercent: p.colorPercent,
    }));

    mapped.sort((a, b) => {
      if (sortMode === 'color_desc') {
        return b.colorPercent !== a.colorPercent ? b.colorPercent - a.colorPercent : b.totalVol - a.totalVol;
      }
      return sortMode === 'volume_desc' ? b.totalVol - a.totalVol : a.totalVol - b.totalVol;
    });

    return mapped;
  }, [devices, activeFloorTab, searchQuery, sortMode]);

  const maxVolume = useMemo(() => {
    if (processedPrinters.length === 0) return 100;
    return Math.max(...processedPrinters.map((p) => p.totalVol), 100);
  }, [processedPrinters]);

  const displayedPrinters = showAll ? processedPrinters : processedPrinters.slice(0, 8);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col w-full">
      {/* 1. Header & Controls */}
      <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 m-0">
            Sản Lượng Chi Tiết Theo Thiết Bị
          </h3>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 tabular-nums">
            {processedPrinters.length} máy
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Tìm máy in, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 w-48 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Xóa tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-[11px]" />
              </button>
            )}
          </div>

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as ProductionSortMode)}
            aria-label="Sắp xếp thiết bị"
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="volume_desc">Sản lượng: Cao nhất</option>
            <option value="volume_asc">Sản lượng: Thấp nhất</option>
            <option value="color_desc">Tỷ lệ Màu cao nhất</option>
          </select>

          {onOpenComparisonModal && (
            <button
              type="button"
              onClick={onOpenComparisonModal}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                pinnedDevices.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <FontAwesomeIcon icon={faScaleBalanced} className="text-[11px]" />
              <span>So sánh</span>
              {pinnedDevices.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono tabular-nums">
                  {pinnedDevices.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-bar: Đồng bộ Bộ Lọc Tầng + Chips Thiết bị Đã Ghim */}
      <div className="px-5 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2.5">
        <div className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto">
          {floorTabs.map((tab) => {
            const isActive = activeFloorTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectFloorTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {pinnedDevices.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              Đã ghim ({pinnedDevices.length}):
            </span>
            {pinnedDevices.map(({ id, device }) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-[11px] font-medium text-indigo-700 dark:text-indigo-300"
              >
                <span className="truncate max-w-[140px]">{device?.name}</span>
                <button
                  type="button"
                  onClick={() => onTogglePinPrinter(id)}
                  aria-label={`Bỏ ghim ${device?.name}`}
                  className="text-indigo-400 hover:text-rose-500 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-[9px]" />
                </button>
              </span>
            ))}
            {onClearAllPinned && (
              <button
                type="button"
                onClick={onClearAllPinned}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-1.5 cursor-pointer"
              >
                Bỏ hết
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Bảng dữ liệu chuẩn */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-2.5 px-4 w-12">#</th>
              <th className="py-2.5 px-4">Thiết bị &amp; Vị trí</th>
              <th className="py-2.5 px-4 text-right">Tổng sản lượng</th>
              <th className="py-2.5 px-4 text-right">Đen trắng</th>
              <th className="py-2.5 px-4 text-right">In màu</th>
              <th className="py-2.5 px-4">Tỷ trọng Mono / Color</th>
              <th className="py-2.5 px-4 text-right w-16">Ghim</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {displayedPrinters.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                  Không tìm thấy máy in nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              displayedPrinters.map((p, idx) => (
                <DeviceHorizontalBarRow
                  key={p.id}
                  printer={p}
                  idx={idx}
                  maxVolume={maxVolume}
                  isPinned={pinnedPrinterIds.includes(p.id)}
                  onTogglePinPrinter={onTogglePinPrinter}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Footer Legend & Expand */}
      <div className="px-5 py-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 dark:bg-slate-200" />
            Đen trắng (Mono)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-pink-500" />
            In màu (Color)
          </span>
        </div>

        {processedPrinters.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            {showAll ? 'Thu gọn danh sách' : `Xem tất cả (${processedPrinters.length} máy)`}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductionHorizontalBarChart;
