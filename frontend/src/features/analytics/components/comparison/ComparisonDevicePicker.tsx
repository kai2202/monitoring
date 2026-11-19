/**
 * Frontend/src/features/analytics/components/comparison/ComparisonDevicePicker.tsx
 *
 * Header Thẻ Máy Đối Chiếu & Bộ Chọn Thiết Bị:
 * - Hiển thị thẻ thiết bị gọn (màu đại diện, tên, model, tầng/phòng ban, nút gỡ).
 * - Popover tìm kiếm và thêm thiết bị từ danh mục máy in thực tế (printerService).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon, faXmark, faPlus, faScaleBalanced, faMagnifyingGlass } from '../../../../shared/icons';
import { ComparisonDeviceKPIs } from '../../../../types/analyticsUI';
import { printerService } from '../../../../services';
import { Printer } from '../../../../types/printer';

export interface ComparisonDevicePickerProps {
  devicesKPIs: ComparisonDeviceKPIs[];
  selectedPrinterIds: string[];
  onAddPrinter: (id: string) => void;
  onRemovePrinter: (id: string) => void;
  onClose: () => void;
}

export const ComparisonDevicePicker: React.FC<ComparisonDevicePickerProps> = ({
  devicesKPIs,
  selectedPrinterIds,
  onAddPrinter,
  onRemovePrinter,
  onClose,
}) => {
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [fleetPrinters, setFleetPrinters] = useState<Printer[]>([]);

  useEffect(() => {
    let isMounted = true;
    printerService.getPrinters().then((res) => {
      if (isMounted) setFleetPrinters(res);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const availablePrinters = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    return fleetPrinters.filter(
      (p) =>
        !selectedPrinterIds.includes(p.id) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          (p.floor && p.floor.toLowerCase().includes(q)) ||
          (p.location && p.location.toLowerCase().includes(q)))
    );
  }, [fleetPrinters, selectedPrinterIds, searchFilter]);

  return (
    <div className="p-5 pb-4 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3.5 shrink-0">
      {/* Title Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs shrink-0">
            <FontAwesomeIcon icon={faScaleBalanced} className="text-base" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 m-0">
              So sánh chi tiết thiết bị
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
              Đang đối chiếu {devicesKPIs.length} thiết bị được chọn
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Đóng bảng so sánh"
          aria-label="Đóng bảng so sánh"
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xs" />
        </button>
      </div>

      {/* Selected Device Cards + Add Picker */}
      <div className="flex items-stretch gap-2.5 flex-wrap">
        {devicesKPIs.map((d) => (
          <div
            key={d.printerId}
            className="flex items-center gap-2.5 px-3 py-2 rounded-2xl border bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/70 min-w-[180px] max-w-[240px]"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" title={d.printerName}>
                {d.printerName}
              </div>
              <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                {d.model} · {d.floor}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemovePrinter(d.printerId)}
              title="Xóa máy khỏi so sánh"
              aria-label={`Xóa ${d.printerName}`}
              className="w-6 h-6 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
            </button>
          </div>
        ))}

        {/* Add Device Popover Trigger */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setIsAddPickerOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 hover:bg-indigo-50/60 dark:bg-slate-800/30 dark:hover:bg-indigo-950/30 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-400 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
            <span>Thêm máy đối chiếu</span>
          </button>

          {isAddPickerOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsAddPickerOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-80 max-h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-20 flex flex-col">
                <div className="relative p-1.5 border-b border-slate-100 dark:border-slate-800">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Tìm máy in theo tên, model..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="overflow-y-auto flex flex-col gap-1 py-1.5 flex-1">
                  {availablePrinters.length === 0 ? (
                    <div className="py-5 text-center text-xs text-slate-400">
                      Không có thiết bị khả dụng
                    </div>
                  ) : (
                    availablePrinters.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onAddPrinter(p.id);
                          setIsAddPickerOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {p.name}
                          </div>
                          <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                            {p.floor || p.location || 'Tầng 1'} · {p.model || p.deviceType || 'Laser'}
                          </div>
                        </div>
                        <FontAwesomeIcon icon={faPlus} className="text-[11px] text-indigo-600 shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonDevicePicker;
