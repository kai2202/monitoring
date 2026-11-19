/**
 * Frontend/src/features/analytics/components/sla/LemonDeviceRankingCard.tsx
 *
 * Bảng Máy In Lỗi Nhiều & Chi Phí Sửa Chữa (/analytics/sla-cost):
 * - Đồng bộ phong cách /printers: Bảng liền mạch không viền lồng, thanh tìm kiếm & lọc trạng thái,
 *   sắp xếp nhanh và phân trang tròn 5 dòng/trang.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  FontAwesomeIcon,
  faMagnifyingGlass,
  faFileCircleCheck,
  faChevronLeft,
  faChevronRight,
} from '@/shared/icons';
import { LemonPrinterItem } from '@/types/api';

export interface LemonDeviceRankingCardProps {
  printers?: LemonPrinterItem[];
  onSelectPrinter?: (printerId: string) => void;
  onRequestReplacement?: (printer: LemonPrinterItem) => void;
}

type LemonStatusFilter = 'all' | 'candidate' | 'monitor';
type LemonSortKey = 'incidents' | 'cost';

const PAGE_SIZE = 5;

export const LemonDeviceRankingCard: React.FC<LemonDeviceRankingCardProps> = ({
  printers = [],
  onSelectPrinter,
  onRequestReplacement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LemonStatusFilter>('all');
  const [sortBy, setSortBy] = useState<LemonSortKey>('incidents');
  const [currentPage, setCurrentPage] = useState(1);

  const totalRepairCost = useMemo(
    () => printers.reduce((sum, p) => sum + (p.totalRepairCostVnd || 0), 0),
    [printers]
  );

  const maxCost = useMemo(() => {
    const max = printers.reduce(
      (acc, p) => (p.totalRepairCostVnd > acc ? p.totalRepairCostVnd : acc),
      0
    );
    return max > 0 ? max : 1;
  }, [printers]);

  const filteredPrinters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = printers.filter((p) => {
      const isCandidate = p.isLemonWarning || p.incidentCount >= 5;
      if (statusFilter === 'candidate' && !isCandidate) return false;
      if (statusFilter === 'monitor' && isCandidate) return false;
      if (q) {
        const match =
          p.name.toLowerCase().includes(q) ||
          p.floor.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'cost') return b.totalRepairCostVnd - a.totalRepairCostVnd;
      if (b.incidentCount !== a.incidentCount) return b.incidentCount - a.incidentCount;
      return b.totalRepairCostVnd - a.totalRepairCostVnd;
    });
  }, [printers, searchQuery, statusFilter, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy, printers.length]);

  const totalPages = Math.max(1, Math.ceil(filteredPrinters.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedPrinters = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredPrinters.slice(start, start + PAGE_SIZE);
  }, [filteredPrinters, safePage]);

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden w-full">
      {/* Header + Toolbar chuẩn /printers */}
      <div className="p-4 sm:p-5 pb-3 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 m-0">
                Máy In Lỗi Nhiều &amp; Chi Phí Sửa Chữa
              </h3>
              <span className="text-[10.5px] font-semibold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {filteredPrinters.length} máy
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
              Theo dõi các thiết bị phát sinh sự cố lặp lại và tổng chi phí sửa chữa
            </p>
          </div>

          {printers.length > 0 && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 shrink-0">
              Tổng sửa chữa: {totalRepairCost.toLocaleString('vi-VN')} đ
            </span>
          )}
        </div>

        {printers.length > 0 && (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-52">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm máy in, tầng, phòng..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 gap-0.5">
                {[
                  { id: 'all' as const, label: 'Tất cả' },
                  { id: 'candidate' as const, label: 'Cần thay thế' },
                  { id: 'monitor' as const, label: 'Theo dõi' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border-none cursor-pointer transition-all ${
                      statusFilter === tab.id
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'bg-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 gap-0.5">
              {[
                { id: 'incidents' as const, label: 'Số lần lỗi' },
                { id: 'cost' as const, label: 'Chi phí' },
              ].map((opt) => (
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
        )}
      </div>

      {/* Table liền mạch không viền lồng */}
      {printers.length === 0 ? (
        <div className="mx-5 mb-5 py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          Chưa ghi nhận máy in phát sinh sự cố và chi phí sửa chữa.
        </div>
      ) : pagedPrinters.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
          Không tìm thấy thiết bị phù hợp bộ lọc hiện tại.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="py-2 pl-4 sm:pl-5 pr-3">Thiết bị &amp; Phòng ban</th>
                <th className="py-2 px-3 text-center">Số lần lỗi</th>
                <th className="py-2 px-3 text-right">TB / lần</th>
                <th className="py-2 px-3">Chi phí sửa chữa</th>
                <th className="py-2 pl-3 pr-4 sm:pr-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {pagedPrinters.map((p) => {
                const costPct = Math.max(6, Math.round((p.totalRepairCostVnd / maxCost) * 100));
                const isCandidate = p.isLemonWarning || p.incidentCount >= 5;
                const barColor = isCandidate ? 'bg-rose-500' : 'bg-amber-500';
                const avgPerIncident =
                  p.incidentCount > 0 ? Math.round(p.totalRepairCostVnd / p.incidentCount) : null;

                return (
                  <tr
                    key={p.printerId}
                    onClick={() => onSelectPrinter?.(p.printerId)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 pl-4 sm:pl-5 pr-3 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {p.name}
                        </span>
                        {isCandidate && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                            Cần thay
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {p.floor} · {p.department}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                          isCandidate
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {p.incidentCount} lần
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {avgPerIncident !== null ? `${avgPerIncident.toLocaleString('vi-VN')} đ` : '—'}
                    </td>

                    <td className="py-2.5 px-3 min-w-[190px]">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 w-24 shrink-0">
                          {p.totalRepairCostVnd.toLocaleString('vi-VN')} đ
                        </span>
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${barColor}`}
                            style={{ width: `${costPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td
                      className="py-2.5 pl-3 pr-4 sm:pr-5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {onRequestReplacement ? (
                        <button
                          type="button"
                          onClick={() => onRequestReplacement(p)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border-none inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isCandidate
                              ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <FontAwesomeIcon icon={faFileCircleCheck} className="text-[10px]" />
                          <span>Đề xuất thay thế</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectPrinter?.(p.printerId)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold border-none cursor-pointer"
                        >
                          Chi tiết
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Phân trang tròn 5 dòng/trang */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filteredPrinters.length)} / {filteredPrinters.length} máy
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 border-none flex items-center justify-center cursor-pointer text-slate-600"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
            </button>
            <span className="px-2 font-mono font-semibold text-slate-700 dark:text-slate-200">
              {safePage}/{totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 border-none flex items-center justify-center cursor-pointer text-slate-600"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LemonDeviceRankingCard;
