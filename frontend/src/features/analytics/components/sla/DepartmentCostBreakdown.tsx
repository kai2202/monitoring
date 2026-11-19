/**
 * Frontend/src/features/analytics/components/sla/DepartmentCostBreakdown.tsx
 *
 * Phân Bổ Chi Phí Theo Tầng & Người Quản Lý Đại Diện:
 * - Bố cục 8 cột (Bảng phân trang tròn 5 dòng/trang, không cắt nửa dòng) : 4 cột (2 card nhỏ xếp chồng).
 * - Tính năng quản trị: Tìm kiếm tầng/quản lý, Sắp xếp nhanh, Highlight tầng vượt BQ/máy toàn đội,
 *   thanh tỷ trọng mini, bấm dòng mở CostBreakdownDetailModal, và Xuất CSV.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  FontAwesomeIcon,
  faMagnifyingGlass,
  faChevronRight,
  faChevronLeft,
  faDownload,
} from '@/shared/icons';
import { DepartmentCostAllocationItem } from '../../../../types/analyticsUI';
import { exportCostAllocationToCsv } from '../../utils/costCsvExport';
import { CostBreakdownDetailModal } from './CostBreakdownDetailModal';
import { CostAllocationDonutCard, formatCompactMoney } from './CostAllocationDonutCard';
import { CostHealthFilterMode } from './CostHealthBar';

type CostSortKey = 'total' | 'repair' | 'supplies' | 'perDevice';

const PAGE_SIZE = 5;

interface DepartmentCostBreakdownProps {
  departments: DepartmentCostAllocationItem[];
  costFilter?: CostHealthFilterMode;
}

export const DepartmentCostBreakdown: React.FC<DepartmentCostBreakdownProps> = ({
  departments,
  costFilter = 'all',
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<CostSortKey>('total');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState<DepartmentCostAllocationItem | null>(null);

  useEffect(() => {
    if (costFilter === 'repair') setSortBy('repair');
    else if (costFilter === 'supplies') setSortBy('supplies');
    else if (costFilter === 'over_avg') setSortBy('perDevice');
    else setSortBy('total');
  }, [costFilter]);

  const totalCost = useMemo(
    () => departments.reduce((sum, d) => sum + (d.totalCost || 0), 0),
    [departments]
  );
  const totalDevices = useMemo(
    () => departments.reduce((sum, d) => sum + (d.deviceCount || 0), 0),
    [departments]
  );
  const avgFleetCostPerDevice = totalDevices > 0 ? Math.round(totalCost / totalDevices) : 0;

  const baseSorted = useMemo(
    () => [...departments].sort((a, b) => b.totalCost - a.totalCost),
    [departments]
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = q
      ? baseSorted.filter(
          (d) =>
            d.departmentName.toLowerCase().includes(q) ||
            (d.floorName && d.floorName.toLowerCase().includes(q)) ||
            (d.managerName && d.managerName.toLowerCase().includes(q))
        )
      : [...baseSorted];

    if (costFilter === 'over_avg' && avgFleetCostPerDevice > 0) {
      list = list.filter(
        (d) => d.deviceCount > 0 && d.totalCost / d.deviceCount > avgFleetCostPerDevice
      );
    }

    return list.sort((a, b) => {
      if (sortBy === 'repair') return (b.repairCost ?? 0) - (a.repairCost ?? 0);
      if (sortBy === 'supplies') {
        const aSup = (a.suppliesCost ?? 0) + (a.otherCost ?? 0);
        const bSup = (b.suppliesCost ?? 0) + (b.otherCost ?? 0);
        return bSup - aSup;
      }
      if (sortBy === 'perDevice') {
        const aAvg = a.deviceCount > 0 ? a.totalCost / a.deviceCount : 0;
        const bAvg = b.deviceCount > 0 ? b.totalCost / b.deviceCount : 0;
        return bAvg - aAvg;
      }
      return b.totalCost - a.totalCost;
    });
  }, [baseSorted, searchQuery, sortBy, costFilter, avgFleetCostPerDevice]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, departments.length]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  if (baseSorted.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs flex flex-col gap-4 w-full">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 shrink-0" />
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 m-0">
            Phân Bổ Chi Phí Theo Tầng &amp; Quản Lý
          </h2>
        </div>
        <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          Chưa có dữ liệu phân bổ chi phí theo tầng và quản lý.
        </div>
      </div>
    );
  }

  const sortOptions: { id: CostSortKey; label: string }[] = [
    { id: 'total', label: 'Tổng chi' },
    { id: 'repair', label: 'Sửa chữa' },
    { id: 'supplies', label: 'Vật tư' },
    { id: 'perDevice', label: 'BQ/máy' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch w-full">
      {/* Card Trái (8 cột): Cố định chiều cao 504px vừa đủ 5 dòng không cần scroll dọc */}
      <div className="xl:col-span-8 xl:h-[504px] rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between overflow-hidden min-w-0">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-4 sm:p-5 pb-3 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 shrink-0" />
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 m-0">
                    Phân Bổ Chi Phí Theo Tầng &amp; Quản Lý
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
                  Bấm vào từng tầng để xem chi tiết hóa đơn sửa chữa, vật tư &amp; các khoản chi khác
                </p>
              </div>

              <button
                type="button"
                onClick={() => exportCostAllocationToCsv(filteredItems)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold border-none inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
                <span>Xuất CSV</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="relative w-full sm:w-56">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Tìm tầng, người quản lý..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 gap-0.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border-none cursor-pointer transition-all ${
                      sortBy === opt.id
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'bg-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-2 pl-4 sm:pl-5 pr-2">Tầng &amp; Đại diện</th>
                  <th className="py-2 px-2 text-right">Sửa chữa</th>
                  <th className="py-2 px-2 text-right">Vật tư &amp; khác</th>
                  <th className="py-2 px-2 text-right">BQ / máy</th>
                  <th className="py-2 px-2 text-right">Tổng chi (%)</th>
                  <th className="py-2 pl-2 pr-4 sm:pr-5 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {pagedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-slate-400">
                      Không tìm thấy tầng hoặc người quản lý phù hợp.
                    </td>
                  </tr>
                ) : (
                  pagedItems.map((dept) => {
                    const shareNum = totalCost > 0 ? (dept.totalCost / totalCost) * 100 : 0;
                    const repairVal = dept.repairCost;
                    const suppliesOtherVal =
                      dept.suppliesCost !== undefined || dept.otherCost !== undefined
                        ? (dept.suppliesCost ?? 0) + (dept.otherCost ?? 0)
                        : undefined;
                    const avgPerDevice =
                      dept.deviceCount > 0 ? Math.round(dept.totalCost / dept.deviceCount) : null;
                    const isOverAvg =
                      avgPerDevice !== null &&
                      avgFleetCostPerDevice > 0 &&
                      avgPerDevice > avgFleetCostPerDevice;
                    const isHovered = hoveredId === dept.departmentId;

                    return (
                      <tr
                        key={dept.departmentId}
                        onMouseEnter={() => setHoveredId(dept.departmentId)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setDetailTarget(dept)}
                        className={`transition-colors cursor-pointer group ${
                          isHovered
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-2.5 pl-4 sm:pl-5 pr-2 min-w-[175px]">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-xs shrink-0"
                              style={{ backgroundColor: dept.color }}
                            />
                            <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                              {dept.departmentName}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-slate-500 dark:text-slate-400 pl-4 mt-0.5 truncate">
                            {dept.managerName ? `QL: ${dept.managerName} · ` : ''}
                            {dept.deviceCount} máy
                          </div>
                        </td>

                        <td className="py-2.5 px-2 text-right font-mono font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          {repairVal !== undefined ? `${repairVal.toLocaleString('vi-VN')} đ` : '—'}
                        </td>

                        <td className="py-2.5 px-2 text-right font-mono font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {suppliesOtherVal !== undefined
                            ? `${suppliesOtherVal.toLocaleString('vi-VN')} đ`
                            : '—'}
                        </td>

                        <td className="py-2.5 px-2 text-right font-mono whitespace-nowrap">
                          {avgPerDevice !== null ? (
                            <span
                              className={
                                isOverAvg
                                  ? 'font-bold text-amber-600 dark:text-amber-400'
                                  : 'text-slate-600 dark:text-slate-300'
                              }
                              title={
                                isOverAvg
                                  ? `Cao hơn BQ toàn đội (${formatCompactMoney(avgFleetCostPerDevice)}/máy)`
                                  : undefined
                              }
                            >
                              {isOverAvg ? '↑ ' : ''}
                              {formatCompactMoney(avgPerDevice)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        <td className="py-2.5 px-2 text-right whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {dept.totalCost.toLocaleString('vi-VN')} đ
                          </div>
                          <div className="flex items-center justify-end gap-1.5 mt-0.5">
                            <div className="w-12 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(100, shareNum)}%`,
                                  backgroundColor: dept.color,
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              {shareNum.toFixed(1)}%
                            </span>
                          </div>
                        </td>

                        <td
                          className="py-2.5 pl-2 pr-4 sm:pr-5 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            aria-label={`Xem khoản chi ${dept.departmentName}`}
                            onClick={() => setDetailTarget(dept)}
                            className="w-6 h-6 rounded-md bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-300 group-hover:text-indigo-500 border-none inline-flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer phân trang cố định chiều cao — luôn render để không bị nhảy height */}
        <div className="px-4 sm:px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 min-h-[42px]">
          <span>
            {filteredItems.length === 0
              ? '0 khu vực'
              : `Hiển thị ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                  currentPage * PAGE_SIZE,
                  filteredItems.length
                )} / ${filteredItems.length} khu vực`}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1 || totalPages <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 border-none flex items-center justify-center cursor-pointer text-slate-600 dark:text-slate-300"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
            </button>
            <span className="px-2 font-mono font-semibold text-slate-700 dark:text-slate-200">
              {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || totalPages <= 1}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 border-none flex items-center justify-center cursor-pointer text-slate-600 dark:text-slate-300"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Phải (4 cột): 2 card nhỏ xếp chồng cân đối & cố định chiều cao khớp cột trái */}
      <div className="xl:col-span-4 xl:h-[504px] min-w-0">
        <CostAllocationDonutCard
          items={baseSorted}
          totalCost={totalCost}
          avgFleetCostPerDevice={avgFleetCostPerDevice}
          hoveredId={hoveredId}
          onHoverChange={setHoveredId}
          onSelectFloorFilter={(label) =>
            setSearchQuery((prev) => (prev === label ? '' : label))
          }
          onOpenDepartmentDetail={setDetailTarget}
        />
      </div>

      {/* Modal Chi Tiết Khoản Chi */}
      <CostBreakdownDetailModal
        item={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
    </div>
  );
};

export default DepartmentCostBreakdown;
