/**
 * Frontend/src/features/analytics/components/supplies/ReplenishmentHistoryDrawer.tsx
 *
 * Ngăn Kéo Nhật Ký Cấp Phát & Thay Mực Gần Đây:
 * - Lưu vết các lần KTV xác nhận cấp phát vật tư để đối soát cuối tháng.
 * - Trình bày dạng timeline gọn gàng: Thời gian, KTV, máy in, loại vật tư, ghi chú.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faXmark,
  faClockRotateLeft,
  faCircleCheck,
  faInbox,
} from '../../../../shared/icons';
import { ReplenishmentLogRecord } from './BulkSuppliesConfirmModal';

export interface ReplenishmentHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ReplenishmentLogRecord[];
}

export const ReplenishmentHistoryDrawer: React.FC<ReplenishmentHistoryDrawerProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm shadow-xs">
                <FontAwesomeIcon icon={faClockRotateLeft} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
                  Nhật Ký Cấp Phát Vật Tư
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
                  Lịch sử thay thế &amp; đối soát kiểm kê kho
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>
          </div>

          {/* Drawer Body (Timeline Records) */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg mb-2">
                  <FontAwesomeIcon icon={faInbox} />
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Chưa có nhật ký cấp phát nào
                </div>
                <div className="text-[11px] text-slate-500 max-w-xs mt-1">
                  Khi kỹ thuật viên bấm "Xác nhận đã cấp phát" cho các máy in, lịch sử sẽ tự động được lưu trữ tại đây.
                </div>
              </div>
            ) : (
              logs.map((record) => (
                <div
                  key={record.id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col gap-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-[11px]" />
                      <span>{record.technician}</span>
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-mono">
                      {record.timestamp}
                    </span>
                  </div>

                  <div className="text-[11.5px] text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{record.notes}"
                  </div>

                  {/* List of machines refilled */}
                  <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Đã thay mực cho {record.printers.length} máy:
                    </span>
                    {record.printers.map((p, idx) => (
                      <div
                        key={`${p.printerId}-${idx}`}
                        className="flex items-center justify-between text-[11px] py-0.5"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate pr-2">
                          • {p.printerName} ({p.floor})
                        </span>
                        <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {p.itemsReplaced.join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Tổng số lần ghi nhận: <strong className="text-slate-800 dark:text-slate-100">{logs.length}</strong> đợt cấp phát
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplenishmentHistoryDrawer;
