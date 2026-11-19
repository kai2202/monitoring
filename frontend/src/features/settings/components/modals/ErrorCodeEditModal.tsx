/**
 * Frontend/src/features/settings/components/modals/ErrorCodeEditModal.tsx
 *
 * Modal Thêm Mới / Chỉnh Sửa Mã Lỗi Phần Cứng Đa Thương Hiệu:
 * - Hỗ trợ cả hai chế độ: Thêm mã lẻ mới hoặc Chỉnh sửa mã lỗi hiện có.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState, useEffect } from 'react';
import { ModalPortal } from '@/shared/modals';
import {
  FontAwesomeIcon,
  faXmark,
  faMicrochip,
  faPenToSquare,
  faCheck,
} from '@/shared/icons';
import { PrinterErrorCode } from '@/types/api';
import { settingsService } from '@/services';

export interface ErrorCodeEditModalProps {
  isOpen: boolean;
  errorCodeItem: PrinterErrorCode | null; // null = chế độ Thêm Mới
  onClose: () => void;
  onSuccess: (savedItem: PrinterErrorCode) => void;
}

const VENDOR_OPTIONS = ['Ricoh', 'Canon', 'HP', 'Epson', 'General'];
const SUBSYSTEM_OPTIONS = [
  { value: 'Fuser', label: 'Cụm sấy (Fuser)' },
  { value: 'Paper_Feed', label: 'Đường dẫn giấy (Paper Feed)' },
  { value: 'Scanner_ADF', label: 'Khay quét tự động (Scanner/ADF)' },
  { value: 'Laser_Optics', label: 'Hộp quang & Laser (Laser Optics)' },
  { value: 'Controller_Board', label: 'Bo mạch điều khiển (Main Controller)' },
  { value: 'General', label: 'Hệ thống chung (General)' },
];

export const ErrorCodeEditModal: React.FC<ErrorCodeEditModalProps> = ({
  isOpen,
  errorCodeItem,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!errorCodeItem;

  const [vendor, setVendor] = useState<'Ricoh' | 'Canon' | 'HP' | 'Epson' | 'General'>('HP');
  const [errorCode, setErrorCode] = useState('');
  const [errorName, setErrorName] = useState('');
  const [affectedSubsystem, setAffectedSubsystem] = useState<any>('Paper_Feed');
  const [severity, setSeverity] = useState<'Critical' | 'Warning' | 'Info'>('Warning');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (errorCodeItem) {
      setVendor(errorCodeItem.vendor as any || 'HP');
      setErrorCode(errorCodeItem.errorCode || '');
      setErrorName(errorCodeItem.errorName || '');
      setAffectedSubsystem(errorCodeItem.affectedSubsystem || 'Paper_Feed');
      setSeverity(errorCodeItem.severity || 'Warning');
      setDescription(errorCodeItem.description || '');
    } else {
      setVendor('HP');
      setErrorCode('');
      setErrorName('');
      setAffectedSubsystem('Paper_Feed');
      setSeverity('Warning');
      setDescription('');
    }
    setFormError(null);
  }, [errorCodeItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorCode.trim()) {
      setFormError('Mã lỗi không được để trống.');
      return;
    }
    if (!description.trim()) {
      setFormError('Mô tả và quy trình xử lý không được để trống.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      const itemToSave: PrinterErrorCode = {
        id: errorCodeItem?.id || `err-${Date.now()}`,
        vendor,
        errorCode: errorCode.trim().toUpperCase(),
        errorName: errorName.trim() || `Lỗi ${errorCode.trim()}`,
        affectedSubsystem,
        severity,
        description: description.trim(),
      };

      const saved = await settingsService.saveErrorCode(itemToSave);
      onSuccess(saved);
      onClose();
    } catch (err: any) {
      setFormError(err?.message || 'Không thể lưu mã lỗi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <FontAwesomeIcon icon={isEditing ? faPenToSquare : faMicrochip} className="text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {isEditing ? 'Chỉnh Sửa Mã Lỗi Phần Cứng' : 'Thêm Mã Lỗi Mới Vào Từ Điển'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isEditing ? `Cập nhật thông tin cho mã ${errorCodeItem?.errorCode}` : 'Định nghĩa triệu chứng & quy trình khắc phục'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {formError && (
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50">
              {formError}
            </div>
          )}

          {/* Row 1: Vendor & Severity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hãng sản xuất
              </label>
              <select
                value={vendor}
                onChange={(e) => setVendor(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
              >
                {VENDOR_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mức độ nghiêm trọng
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="Critical">Nghiêm trọng (Critical)</option>
                <option value="Warning">Cảnh báo (Warning)</option>
                <option value="Info">Thông tin (Info)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Mã lỗi & Tên lỗi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mã lỗi kỹ thuật <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: 50.2, SC-542..."
                value={errorCode}
                onChange={(e) => setErrorCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phân hệ linh kiện
              </label>
              <select
                value={affectedSubsystem}
                onChange={(e) => setAffectedSubsystem(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
              >
                {SUBSYSTEM_OPTIONS.map((sub) => (
                  <option key={sub.value} value={sub.value}>
                    {sub.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Tên lỗi vắn tắt */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tiêu đề lỗi vắn tắt
            </label>
            <input
              type="text"
              placeholder="VD: Quá nhiệt cụm sấy (Fuser Overheating)"
              value={errorName}
              onChange={(e) => setErrorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Row 4: Mô tả & Khắc phục */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mô tả chi tiết &amp; Quy trình xử lý <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ghi rõ hiện tượng và các bước kỹ thuật viên cần kiểm tra tại hiện trường..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>{isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật mã lỗi' : 'Lưu vào từ điển'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
};

export default ErrorCodeEditModal;
