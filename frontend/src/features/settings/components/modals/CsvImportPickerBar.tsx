/**
 * Frontend/src/features/settings/components/modals/CsvImportPickerBar.tsx
 *
 * Thanh công cụ chọn file CSV và tải file mẫu UTF-8 BOM.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faUpload, faDownload } from '@/shared/icons';

interface CsvImportPickerBarProps {
  fileName: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadSample: () => void;
}

export const CsvImportPickerBar: React.FC<CsvImportPickerBarProps> = ({
  fileName,
  onFileUpload,
  onDownloadSample,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-subtle, #f8fafc)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, overflow: 'hidden' }}>
        <label
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faUpload} style={{ fontSize: '12px' }} />
          <span>Chọn tệp CSV</span>
          <input type="file" accept=".csv" onChange={onFileUpload} style={{ display: 'none' }} />
        </label>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace",
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {fileName || 'Chưa chọn tệp'}
        </span>
      </div>

      <button
        type="button"
        onClick={onDownloadSample}
        style={{
          background: 'none',
          border: 'none',
          color: '#2563eb',
          fontSize: '11.5px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <FontAwesomeIcon icon={faDownload} style={{ fontSize: '11px' }} />
        <span>Tải file mẫu UTF-8 BOM</span>
      </button>
    </div>
  );
};

export default CsvImportPickerBar;
