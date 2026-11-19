/**
 * Frontend/src/features/settings/components/dictionary/CsvDatasetStatusBanner.tsx
 *
 * Khung Trạng Thái Bộ Từ Điển CSV Hiện Hành:
 * - Hiển thị tên bộ CSV đang nạp, mốc thời gian nạp chính xác (để đối chiếu & cập nhật), người nạp và tổng số mã.
 * - Hỗ trợ gỡ hoàn toàn bộ CSV khỏi cơ sở dữ liệu (có bước xác nhận an toàn 2 lớp).
 * - Khi CSDL đã gỡ bộ CSV, hiển thị rõ mốc thời gian gỡ gần nhất và nút nạp bộ CSV mới.
 * - Tuân thủ AGENTS.md Rule 7 & Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useState } from 'react';
import {
  FontAwesomeIcon,
  faFileCsv,
  faClock,
  faTrashCan,
  faCircleCheck,
  faCircleInfo,
  faUpload,
  faXmark,
} from '@/shared/icons';
import { ActiveCsvDatasetInfo } from '@/services/interfaces/ISettingsService';

interface CsvDatasetStatusBannerProps {
  dataset: ActiveCsvDatasetInfo | null;
  isUnloading: boolean;
  onUnloadConfirm: () => Promise<void>;
  onOpenImportModal: () => void;
}

function formatDateTimeVi(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const CsvDatasetStatusBanner: React.FC<CsvDatasetStatusBannerProps> = ({
  dataset,
  isUnloading,
  onUnloadConfirm,
  onOpenImportModal,
}) => {
  const [confirmingUnload, setConfirmingUnload] = useState(false);

  if (!dataset) return null;

  const handleConfirm = async () => {
    await onUnloadConfirm();
    setConfirmingUnload(false);
  };

  if (!dataset.isLoaded || dataset.activeCodesCount === 0) {
    return (
      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <FontAwesomeIcon icon={faCircleInfo} className="text-xs" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Chưa có bộ từ điển CSV nào trong cơ sở dữ liệu (0 mã lỗi)
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>
                Toàn bộ mã lỗi cũ đã được tháo khỏi CSDL. Vui lòng nạp tệp CSV mới để kích hoạt lại bộ tra cứu.
              </span>
              {dataset.lastUnloadedAt && (
                <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-amber-700 dark:text-amber-300">
                  Đã gỡ lúc: {formatDateTimeVi(dataset.lastUnloadedAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenImportModal}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faUpload} className="text-[11px]" />
          <span>Nạp bộ CSV mới</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 flex flex-col gap-2.5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Bộ CSV đang áp dụng:
              </span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1.5">
                <FontAwesomeIcon icon={faFileCsv} className="text-[11px]" />
                {dataset.fileName || 'error_dictionary.csv'}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono">
                {dataset.activeCodesCount} mã lỗi
              </span>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1 font-medium">
                <FontAwesomeIcon icon={faClock} className="text-[10px] text-emerald-600" />
                <span>Thời điểm nạp:</span>
                <strong className="font-mono text-slate-800 dark:text-slate-200">
                  {formatDateTimeVi(dataset.importedAt)}
                </strong>
              </span>
              {dataset.importedBy && (
                <span>
                  • Người nạp: <strong className="text-slate-700 dark:text-slate-200">{dataset.importedBy}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {!confirmingUnload && (
          <button
            type="button"
            onClick={() => setConfirmingUnload(true)}
            disabled={isUnloading}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200/80 dark:border-rose-900/50 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Tháo hoàn toàn bộ mã lỗi CSV hiện tại ra khỏi cơ sở dữ liệu"
          >
            <FontAwesomeIcon icon={faTrashCan} className="text-[11px]" />
            <span>Gỡ bộ CSV hiện tại</span>
          </button>
        )}
      </div>

      {confirmingUnload && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-rose-800 dark:text-rose-200 font-medium">
            Xác nhận gỡ toàn bộ <strong className="font-mono">{dataset.activeCodesCount}</strong> mã lỗi khỏi cơ sở dữ liệu?
            Các mã lỗi sẽ được tháo sạch khỏi CSDL và chỉ khôi phục khi nạp tệp CSV mới.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmingUnload(false)}
              disabled={isUnloading}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
              <span>Hủy</span>
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isUnloading}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
              <span>{isUnloading ? 'Đang gỡ khỏi CSDL...' : 'Xác nhận gỡ khỏi CSDL'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvDatasetStatusBanner;

