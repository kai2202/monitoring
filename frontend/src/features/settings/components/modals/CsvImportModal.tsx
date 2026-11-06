/**
 * Frontend/src/features/settings/components/modals/CsvImportModal.tsx
 *
 * Modal Nạp Từ Điển Mã Lỗi Từ File CSV (Admin Only):
 * - Hỗ trợ phân tích cú pháp RFC 4180 và chuẩn hóa UTF-8 BOM (\uFEFF).
 * - Kiểm tra tính hợp lệ (Validation Engine) chi tiết từng dòng.
 * - Tái sử dụng `CsvImportPickerBar` và `CsvImportValidationSummary` (< 300 LOC).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  FontAwesomeIcon,
  faFileCsv,
  faCheck,
  faXmark,
  faCircleCheck,
} from '@/shared/icons';
import { PrinterErrorCode } from '@/types/api';
import { settingsService } from '@/services';
import { CsvImportApiResult } from '@/services/interfaces/ISettingsService';
import {
  parseCsvText,
  validateErrorDictionaryCsv,
  SAMPLE_CSV_CONTENT,
  CsvValidationResult,
} from '../../utils/errorDictionaryCsvHelper';
import { CsvImportPickerBar } from './CsvImportPickerBar';
import { CsvImportValidationSummary } from './CsvImportValidationSummary';

export interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedRows: PrinterErrorCode[], apiResult?: CsvImportApiResult) => void;
  existingCodes?: PrinterErrorCode[];
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingCodes = [],
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [rawCsvText, setRawCsvText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setFileName('');
      setRawCsvText('');
      setValidationResult(null);
      setProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'error_dictionary_template_utf8.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Đã tải file mẫu CSV chuẩn UTF-8 BOM thành công');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setProgress(25);
    setValidationResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setIsProcessing(false);
        toast.error('File CSV trống, vui lòng kiểm tra lại');
        return;
      }

      try {
        setRawCsvText(text);
        const matrix = parseCsvText(text);
        const result = validateErrorDictionaryCsv(matrix, existingCodes);
        setValidationResult(result);
        setProgress(100);
        setIsProcessing(false);

        if (result.invalidCount > 0) {
          toast.warning(`Phát hiện ${result.invalidCount} dòng lỗi không hợp lệ cần lưu ý`);
        } else {
          toast.success(`Đã kiểm tra thành công ${result.validCount} bản ghi hợp lệ`);
        }
      } catch (err) {
        setIsProcessing(false);
        toast.error('Không thể phân tích định dạng file CSV');
        console.error(err);
      }
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmImport = async () => {
    if (!validationResult || validationResult.validCount === 0 || !rawCsvText) {
      toast.error('Không có bản ghi hợp lệ nào để nạp vào hệ thống');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiRes = await settingsService.importErrorDictionaryCsv(
        fileName || 'error_dictionary.csv',
        rawCsvText
      );
      onImportSuccess(validationResult.validRows, apiRes);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu từ điển mã lỗi CSV vào cơ sở dữ liệu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: '20px',
          border: '1px solid var(--border-color, #e2e8f0)',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '18px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Nạp &amp; Kiểm Duyệt Từ Điển Mã Lỗi CSV
              </h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Hỗ trợ Ricoh, Canon, HP, Epson, Brother, Toshiba, Xerox (Chuẩn hóa UTF-8 BOM &amp; tự động đối chiếu mã thiếu)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '16px' }} />
          </button>
        </div>

        <div style={{ padding: '18px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CsvImportPickerBar
            fileName={fileName}
            onFileUpload={handleFileUpload}
            onDownloadSample={handleDownloadSample}
          />
          <CsvImportValidationSummary
            progress={progress}
            isProcessing={isProcessing}
            validationResult={validationResult}
          />
        </div>

        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
          }}
        >
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Mã lỗi khớp sẽ tự động gỡ khỏi danh sách thông báo chưa tích hợp
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isSubmitting || isProcessing || !validationResult || validationResult.validCount === 0}
              style={{
                padding: '7px 18px',
                borderRadius: '8px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
              }}
            >
              <FontAwesomeIcon icon={validationResult?.validCount ? faCircleCheck : faCheck} style={{ fontSize: '12px' }} />
              <span>
                {isSubmitting
                  ? 'Đang nạp dữ liệu...'
                  : `Xác nhận nạp (${validationResult?.validCount || 0} bản ghi)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvImportModal;
