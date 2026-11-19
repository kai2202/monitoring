/**
 * Frontend/src/features/settings/components/dictionary/UnmappedErrorCodesPanel.tsx
 *
 * Khung Thông Báo Các Mã Lỗi Phát Sinh Chưa Tích Hợp Vào CSV (Unmapped Hardware Error Codes):
 * - Liệt kê rõ ràng Hãng + Mã lỗi phát sinh từ thiết bị thực tế nhưng chưa có trong bảng `ErrorDictionary`.
 * - Hỗ trợ xuất nhanh tệp CSV mẫu chứa sẵn các mã chưa tích hợp để Admin điền bổ sung và nạp lại.
 * - Cơ chế tương thích tự động: Ngay khi nạp CSV có chứa `(vendor, errorCode)` khớp, thông báo sẽ tự biến mất.
 * - Tuân thủ AGENTS.md Rule 6, Rule 7 & Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React from 'react';
import { toast } from 'sonner';
import {
  FontAwesomeIcon,
  faTriangleExclamation,
  faCircleCheck,
  faDownload,
  faClock,
} from '@/shared/icons';
import { UnmappedHardwareErrorItem } from '@/services/interfaces/ISettingsService';

interface UnmappedErrorCodesPanelProps {
  unmappedCodes: UnmappedHardwareErrorItem[];
}

function escapeCsvCell(val: string): string {
  const clean = (val || '').replace(/\r?\n/g, ' ').trim();
  if (clean.includes(',') || clean.includes('"')) {
    return `"${clean.replace(/"/g, '""')}"`;
  }
  return clean;
}

export const UnmappedErrorCodesPanel: React.FC<UnmappedErrorCodesPanelProps> = ({
  unmappedCodes,
}) => {
  const handleDownloadUnmappedTemplate = () => {
    if (unmappedCodes.length === 0) return;

    const header = 'vendor,errorCode,errorName,affectedSubsystem,severity,description';
    const rows = unmappedCodes.map((item) =>
      [
        escapeCsvCell(item.vendor),
        escapeCsvCell(item.errorCode),
        escapeCsvCell(`Sự cố ${item.errorCode} (${item.vendor})`),
        escapeCsvCell(item.suggestedSubsystem || 'General'),
        escapeCsvCell(item.severity),
        escapeCsvCell(item.sampleTitle || `Mô tả chuẩn hóa cho mã lỗi ${item.errorCode}`),
      ].join(',')
    );

    const csvContent = `\uFEFF${[header, ...rows].join('\r\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `unmapped_error_codes_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${unmappedCodes.length} mã lỗi chưa tích hợp ra tệp CSV mẫu để bổ sung!`);
  };

  if (unmappedCodes.length === 0) {
    return (
      <div className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600 text-xs shrink-0" />
        <span>
          <strong>Đồng bộ 100%:</strong> Tất cả mã lỗi phần cứng ghi nhận trên hệ thống hiện đã được tích hợp tương thích trong bộ CSV (không còn mã lỗi tồn đọng chờ xử lý).
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-rose-50/55 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 flex flex-col gap-3">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-xs" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Thông Báo Mã Lỗi Chưa Tích Hợp Vào CSV
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10.5px] font-bold font-mono">
                {unmappedCodes.length} mã chờ tích hợp
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Các mã dưới đây đã phát sinh trên máy in nhưng chưa có trong bộ CSV hiện tại. Chỉ cần nạp CSV có chứa tương ứng{' '}
              <code className="font-mono font-semibold text-rose-700 dark:text-rose-300">vendor + errorCode</code>,
              thông báo sẽ tự động biến mất.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadUnmappedTemplate}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100/60 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faDownload} className="text-[11px]" />
          <span>Tải CSV các mã thiếu ({unmappedCodes.length})</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-white dark:bg-slate-900">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-rose-50/70 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 border-b border-rose-100 dark:border-slate-800">
              <th className="py-2 px-3 font-bold">Hãng &amp; Mã Lỗi</th>
              <th className="py-2 px-3 font-bold">Tín Hiệu Ghi Nhận Thực Tế</th>
              <th className="py-2 px-3 font-bold">Thiết Bị Ảnh Hưởng</th>
              <th className="py-2 px-3 font-bold whitespace-nowrap">Phát Hiện Gần Nhất</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {unmappedCodes.map((item) => (
              <tr key={`${item.vendor}_${item.errorCode}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="py-2 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px]">
                      {item.vendor}
                    </span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200/70 dark:border-rose-800/60">
                      {item.errorCode}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-3 text-slate-700 dark:text-slate-300 max-w-[320px] truncate" title={item.sampleTitle}>
                  {item.sampleTitle}
                </td>
                <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {item.affectedPrinters.slice(0, 2).join(', ')}
                  </span>
                  {item.affectedPrinters.length > 2 && (
                    <span className="ml-1 text-[11px]">(+{item.affectedPrinters.length - 2})</span>
                  )}
                  <span className="ml-1.5 font-mono text-[10.5px] text-slate-500">
                    • {item.occurrencesCount} lần
                  </span>
                </td>
                <td className="py-2 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  <FontAwesomeIcon icon={faClock} className="mr-1 text-[10px]" />
                  {new Date(item.lastDetectedAt).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnmappedErrorCodesPanel;

