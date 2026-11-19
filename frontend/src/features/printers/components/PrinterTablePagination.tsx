/**
 * Frontend/src/features/printers/components/PrinterTablePagination.tsx
 *
 * Thanh Phân Trang Bảng Máy In (Client-side Pagination Footer):
 * - Hỗ trợ các mốc 15, 25, 50, Tất cả dòng/trang.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faChevronLeft, faChevronRight } from '../../../shared/icons';

export interface PrinterTablePaginationProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  totalPages: number;
}

export const PrinterTablePagination: React.FC<PrinterTablePaginationProps> = ({
  pageSize,
  onPageSizeChange,
  currentPage,
  onPageChange,
  totalItems,
  startIndex,
  endIndex,
  totalPages,
}) => {
  return (
    <div
      style={{
        padding: '12px 18px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: 'var(--bg-subtle, #f8fafc)',
        fontSize: '12px',
      }}
    >
      <div style={{ color: 'var(--text-muted, #64748b)' }}>
        Hiển thị <strong>{totalItems === 0 ? 0 : startIndex + 1}–{endIndex}</strong> trên tổng số <strong>{totalItems}</strong> máy in
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '11.5px' }}>Dòng/trang:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-card, #ffffff)',
              fontSize: '11.5px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={-1}>Tất cả</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-card, #ffffff)',
              color: currentPage <= 1 ? '#cbd5e1' : '#475569',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '11px',
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary, #475569)', fontWeight: 600 }}>
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-card, #ffffff)',
              color: currentPage >= totalPages ? '#cbd5e1' : '#475569',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              fontSize: '11px',
            }}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrinterTablePagination;

