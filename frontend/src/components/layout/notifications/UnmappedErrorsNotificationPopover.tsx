/**
 * Frontend/src/components/layout/notifications/UnmappedErrorsNotificationPopover.tsx
 *
 * Popover Cảnh Báo Mã Lỗi Chưa Gán Từ Điển:
 * - Thiết kế phẳng Tailwind + Dark Mode chuẩn hệ thống (rounded-2xl, divide-y, segmented control).
 * - Thay avatar tròn gradient lớn bằng badge hãng/mã lỗi gọn đầu dòng, rút gọn footer chỉ giữ link điều hướng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/app/store';
import {
  FontAwesomeIcon,
  faCircleCheck,
  faChevronRight,
  faMicrochip,
} from '@/shared/icons';

interface UnmappedErrorsNotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnmappedErrorsNotificationPopover: React.FC<UnmappedErrorsNotificationPopoverProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { unmappedErrors } = useSelector((state: RootState) => state.notification);
  const [filterTab, setFilterTab] = useState<'all' | 'critical'>('all');

  if (!isOpen) return null;

  const filteredItems = unmappedErrors.filter((err) => {
    if (filterTab === 'critical') return err.severity === 'Critical';
    return true;
  });

  return (
    <div className="absolute top-[46px] right-0 w-[370px] max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl z-[1000] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 m-0">
            Mã Lỗi Chưa Gán
          </h3>
          {unmappedErrors.length > 0 && (
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
              {unmappedErrors.length}
            </span>
          )}
        </div>

        <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 gap-0.5">
          {[
            { id: 'all' as const, label: 'Tất cả' },
            { id: 'critical' as const, label: 'Nghiêm trọng' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold border-none cursor-pointer transition-all ${
                filterTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="py-9 px-5 text-center flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faCircleCheck} className="text-sm" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Toàn bộ mã lỗi đã được định danh
            </div>
            <div className="text-[11px] text-slate-400">
              Không có mã lỗi mới cần bổ sung vào từ điển CSV
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredItems.map((err) => {
              const isCritical = err.severity === 'Critical';
              return (
                <div
                  key={`${err.vendor}-${err.errorCode}`}
                  className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold ${
                          isCritical
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {err.vendor} · {err.errorCode}
                      </span>
                      <span className="text-[10.5px] text-slate-400">{err.lastDetectedAt}</span>
                    </div>

                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 leading-snug">
                      {err.sampleTitle}
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {err.affectedPrinters.length} máy ảnh hưởng
                      </span>
                      <span>·</span>
                      <span>
                        Phân hệ: <strong className="text-slate-700 dark:text-slate-300">{err.suggestedSubsystem}</strong>
                      </span>
                    </div>
                  </div>

                  <span
                    className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                      isCritical ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-center">
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/settings');
          }}
          className="bg-transparent border-none text-blue-600 dark:text-blue-400 hover:underline text-[11.5px] font-bold cursor-pointer inline-flex items-center gap-1.5"
        >
          <FontAwesomeIcon icon={faMicrochip} className="text-[11px]" />
          <span>Mở Quản Trị Từ Điển Mã Lỗi</span>
          <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
        </button>
      </div>
    </div>
  );
};

export default UnmappedErrorsNotificationPopover;
