/**
 * Frontend/src/features/analytics/components/supplies/SharedSuppliesProcurementTable.tsx
 *
 * Bảng Tổng Hợp Dự Trù Mua Sắm / Xuất Kho Dùng Chung Hộp Mực:
 * - Gom 40+ máy in theo 6 loại vật tư tiêu chuẩn dùng chung.
 * - Cột đối chiếu Tồn kho sẵn có vs Nhu cầu xuất ngay (báo Thiếu / Đủ).
 * - Accordion mở rộng dòng xem danh sách chi tiết các máy in cần thay.
 * - Nút Xuất Báo Cáo Dự Trù ra file CSV cho phòng Mua sắm.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  FontAwesomeIcon,
  faChevronDown,
  faChevronRight,
  faDownload,
  faBoxesStacked,
  faCircleCheck,
  faTriangleExclamation,
} from '../../../../shared/icons';
import { PrinterConsumablesOverview } from '../../../../types/analyticsUI';

export interface InventoryStockMap {
  black: number;
  cyan: number;
  magenta: number;
  yellow: number;
  waste_toner: number;
  drum: number;
}

export interface SharedSuppliesProcurementTableProps {
  devices?: PrinterConsumablesOverview[];
  onSelectPrinter?: (printer: PrinterConsumablesOverview) => void;
  stock?: InventoryStockMap;
  isInventoryHighlighted?: boolean;
}

interface SharedSupplyCategory {
  id: string;
  name: string;
  badgeColor: string;
  dotColor: string;
  criticalPrinters: PrinterConsumablesOverview[];
  warningPrinters: PrinterConsumablesOverview[];
  currentStock: number;
}

export const SharedSuppliesProcurementTable: React.FC<SharedSuppliesProcurementTableProps> = ({
  devices = [],
  onSelectPrinter,
  stock,
  isInventoryHighlighted = false,
}) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Phân bổ các máy in vào 6 danh mục vật tư dùng chung
  const categories: SharedSupplyCategory[] = useMemo(() => {
    // 1. Mực Đen K
    const kCrit = devices.filter((d) => d.tonerK < 15);
    const kWarn = devices.filter((d) => d.tonerK >= 15 && d.tonerK < 25);

    // 2. Mực Xanh C
    const cCrit = devices.filter((d) => d.tonerC < 15);
    const cWarn = devices.filter((d) => d.tonerC >= 15 && d.tonerC < 25);

    // 3. Mực Đỏ M
    const mCrit = devices.filter((d) => d.tonerM < 15);
    const mWarn = devices.filter((d) => d.tonerM >= 15 && d.tonerM < 25);

    // 4. Mực Vàng Y
    const yCrit = devices.filter((d) => d.tonerY < 15);
    const yWarn = devices.filter((d) => d.tonerY >= 15 && d.tonerY < 25);

    // 5. Hộp Mực Thải (Waste Toner Box)
    const wasteCrit = devices.filter((d) => d.wasteToner === 'Đầy');
    const wasteWarn = devices.filter((d) => d.wasteToner === 'Sắp đầy');

    // 6. Cụm Trống Từ (Drum Unit)
    const drumCrit = devices.filter((d) => d.drumLife < 15);
    const drumWarn = devices.filter((d) => d.drumLife >= 15 && d.drumLife < 25);

    return [
      { id: 'toner-k', name: 'Mực Đen (Toner K - Black)', badgeColor: 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900', dotColor: 'bg-slate-800', criticalPrinters: kCrit, warningPrinters: kWarn, currentStock: stock?.black ?? 3 },
      { id: 'toner-c', name: 'Mực Xanh (Toner Cyan - C)', badgeColor: 'bg-cyan-500 text-white', dotColor: 'bg-cyan-500', criticalPrinters: cCrit, warningPrinters: cWarn, currentStock: stock?.cyan ?? 4 },
      { id: 'toner-m', name: 'Mực Đỏ (Toner Magenta - M)', badgeColor: 'bg-pink-500 text-white', dotColor: 'bg-pink-500', criticalPrinters: mCrit, warningPrinters: mWarn, currentStock: stock?.magenta ?? 2 },
      { id: 'toner-y', name: 'Mực Vàng (Toner Yellow - Y)', badgeColor: 'bg-amber-400 text-slate-900', dotColor: 'bg-amber-400', criticalPrinters: yCrit, warningPrinters: yWarn, currentStock: stock?.yellow ?? 3 },
      { id: 'waste-box', name: 'Hộp Mực Thải (Waste Box)', badgeColor: 'bg-orange-600 text-white', dotColor: 'bg-orange-600', criticalPrinters: wasteCrit, warningPrinters: wasteWarn, currentStock: stock?.waste_toner ?? 2 },
      { id: 'drum-unit', name: 'Cụm Trống Từ (Drum Unit)', badgeColor: 'bg-purple-600 text-white', dotColor: 'bg-purple-600', criticalPrinters: drumCrit, warningPrinters: drumWarn, currentStock: stock?.drum ?? 1 },
    ];
  }, [devices, stock]);

  const toggleExpand = (id: string) => {
    setExpandedItemId((cur) => (cur === id ? null : id));
  };

  const handleExportCsv = () => {
    const headers = [
      'Loại vật tư dùng chung',
      'Số máy cạn (<15%)',
      'Số máy sắp cạn (15-25%)',
      'Nhu cầu xuất ngay (hộp)',
      'Tồn kho sẵn có (hộp)',
      'Chênh lệch / Cần mua thêm',
      'Tình trạng kho',
    ];
    const rows = categories.map((c) => {
      const urgent = c.criticalPrinters.length;
      const soon = c.warningPrinters.length;
      const deficit = urgent > c.currentStock ? urgent - c.currentStock : 0;
      const statusText = deficit > 0 ? `Thiếu ${deficit} hộp` : 'Đủ cấp phát';
      return [c.name, String(urgent), String(soon), String(urgent), String(c.currentStock), String(deficit), statusText];
    });

    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `du-tru-vat-tu-dung-chung-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất Báo cáo dự trù mua sắm vật tư ra file CSV thành công!');
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col">
      {/* Header Bảng */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faBoxesStacked} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
              Bảng Dự Trù Mua Sắm &amp; Xuất Kho Dùng Chung
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
              Đối chiếu số lượng máy cần thay với tồn kho dự phòng IT để chủ động đặt mua bù kho
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faDownload} className="text-xs text-emerald-600" />
          <span>Xuất Báo Cáo Dự Trù (CSV)</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3 px-5">VẬT TƯ TIÊU CHUẨN</th>
              <th className="py-3 px-4">MÁY CẠN (&lt;15%)</th>
              <th className="py-3 px-4">SẮP HẾT (15-25%)</th>
              <th className="py-3 px-4 font-black">XUẤT NGAY</th>
              <th
                className="py-3 px-4"
                style={
                  isInventoryHighlighted
                    ? { backgroundColor: 'rgba(219, 234, 254, 0.85)', color: '#1d4ed8' }
                    : undefined
                }
              >
                TỒN KHO
              </th>
              <th className="py-3 px-4">TÌNH TRẠNG KHO</th>
              <th className="py-3 px-4 text-right">CHI TIẾT MÁY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {categories.map((c) => {
              const urgent = c.criticalPrinters.length;
              const soon = c.warningPrinters.length;
              const isExpanded = expandedItemId === c.id;
              const deficit = urgent > c.currentStock ? urgent - c.currentStock : 0;
              const isDeficit = deficit > 0;

              return (
                <React.Fragment key={c.id}>
                  <tr
                    onClick={() => toggleExpand(c.id)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${c.dotColor}`} />
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {urgent > 0 ? `${urgent} máy` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-600 dark:text-amber-400">
                      {soon > 0 ? `${soon} máy` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-slate-50 text-sm">
                      {urgent > 0 ? `${urgent} hộp` : '0'}
                    </td>
                    <td
                      className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300"
                      style={
                        isInventoryHighlighted
                          ? { backgroundColor: 'rgba(239, 246, 255, 0.9)', color: '#1d4ed8', fontWeight: 700 }
                          : undefined
                      }
                    >
                      {c.currentStock} hộp
                    </td>
                    <td className="py-3.5 px-4">
                      {isDeficit ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          <FontAwesomeIcon icon={faTriangleExclamation} className="text-[10px]" />
                          <span>Thiếu {deficit} hộp</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
                          <span>Đủ cấp phát</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors inline-flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Thu gọn' : 'Xem máy'}</span>
                        <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} className="text-[10px]" />
                      </button>
                    </td>
                  </tr>

                  {/* Accordion Row Panel */}
                  {isExpanded && (
                    <tr className="bg-slate-50/90 dark:bg-slate-800/40 border-y border-slate-200/60 dark:border-slate-700/60">
                      <td colSpan={7} className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Danh sách {urgent + soon} máy in cần thay {c.name}:
                          </div>
                          {urgent + soon === 0 ? (
                            <div className="text-xs text-slate-400 italic">
                              Tất cả máy in đều đang ở mức an toàn cho loại vật tư này.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {[...c.criticalPrinters, ...c.warningPrinters].map((p) => {
                                const isCrit = c.criticalPrinters.some((cp) => cp.printerId === p.printerId);
                                return (
                                  <div
                                    key={p.printerId}
                                    onClick={() => onSelectPrinter && onSelectPrinter(p)}
                                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                      isCrit
                                        ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 hover:border-rose-300'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-800 dark:text-slate-100 truncate text-[11.5px]">
                                        {p.printerName}
                                      </div>
                                      <div className="text-[10.5px] text-slate-500 dark:text-slate-400">
                                        {p.floor} • {p.department}
                                      </div>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                        isCrit
                                          ? 'bg-rose-100 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300'
                                          : 'bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300'
                                      }`}
                                    >
                                      {isCrit ? 'Cực cạn' : 'Sắp cạn'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SharedSuppliesProcurementTable;
