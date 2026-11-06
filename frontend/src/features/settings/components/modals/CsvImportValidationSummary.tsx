/**
 * Frontend/src/features/settings/components/modals/CsvImportValidationSummary.tsx
 *
 * Bảng Tổng Kết & Thanh Tiến Trình Kiểm Tra Tính Hợp Lệ Dữ Liệu CSV:
 * - Hiển thị Progress Bar sinh động khi phân tích dữ liệu.
 * - 4 Thẻ KPI: Tổng số, Hợp lệ, Lỗi từ chối, Cập nhật ghi đè.
 * - Bảng chi tiết từng dòng dữ liệu và nguyên nhân lỗi cụ thể.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import {
  FontAwesomeIcon,
  faCircleCheck,
  faCircleExclamation,
  faTriangleExclamation,
  faFilter,
  faPenToSquare,
  faPlus,
} from '@/shared/icons';
import { CsvValidationResult } from '../../utils/errorDictionaryCsvHelper';

interface CsvImportValidationSummaryProps {
  progress: number;
  isProcessing: boolean;
  validationResult: CsvValidationResult | null;
}

export const CsvImportValidationSummary: React.FC<CsvImportValidationSummaryProps> = ({
  progress,
  isProcessing,
  validationResult,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'valid' | 'invalid'>('all');

  if (!validationResult && !isProcessing) return null;

  const items = validationResult?.items || [];
  const filteredItems = items.filter((item) => {
    if (filterMode === 'valid') return item.isValid;
    if (filterMode === 'invalid') return !item.isValid;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* 1. Thanh Tiến Trình (Progress Bar) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            {isProcessing ? 'Đang kiểm tra tính hợp lệ dữ liệu...' : 'Hoàn tất kiểm duyệt cấu trúc CSV'}
          </span>
          <span style={{ fontWeight: 800, color: progress === 100 ? '#16a34a' : '#2563eb', fontFamily: "'JetBrains Mono', monospace" }}>
            {progress}%
          </span>
        </div>
        <div style={{ width: '100%', height: '7px', borderRadius: '9999px', backgroundColor: 'var(--bg-subtle, #f1f5f9)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: progress === 100 ? '#16a34a' : '#2563eb',
              transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease',
              boxShadow: progress === 100 ? '0 0 8px rgba(22, 163, 74, 0.5)' : '0 0 8px rgba(37, 99, 235, 0.5)',
            }}
          />
        </div>
      </div>

      {validationResult && !isProcessing && (
        <>
          {/* 2. 4 Thẻ KPI Tóm Tắt */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Tổng bản ghi</span>
              <strong style={{ fontSize: '16px', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                {validationResult.totalRows}
              </strong>
            </div>

            <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.25)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '10px', color: '#16a34a' }} />
                <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 700 }}>Hợp lệ</span>
              </div>
              <strong style={{ fontSize: '16px', color: '#16a34a', fontFamily: "'JetBrains Mono', monospace" }}>
                {validationResult.validCount}
              </strong>
            </div>

            <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: validationResult.invalidCount > 0 ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-subtle)', border: validationResult.invalidCount > 0 ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FontAwesomeIcon icon={faCircleExclamation} style={{ fontSize: '10px', color: validationResult.invalidCount > 0 ? '#ef4444' : '#64748b' }} />
                <span style={{ fontSize: '10.5px', color: validationResult.invalidCount > 0 ? '#ef4444' : 'var(--text-muted)', fontWeight: 700 }}>Lỗi từ chối</span>
              </div>
              <strong style={{ fontSize: '16px', color: validationResult.invalidCount > 0 ? '#ef4444' : 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                {validationResult.invalidCount}
              </strong>
            </div>

            <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.25)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: '10px', color: '#2563eb' }} />
                <span style={{ fontSize: '10.5px', color: '#2563eb', fontWeight: 700 }}>Cập nhật</span>
              </div>
              <strong style={{ fontSize: '16px', color: '#2563eb', fontFamily: "'JetBrains Mono', monospace" }}>
                {validationResult.updateCount}
              </strong>
            </div>
          </div>

          {/* 3. Toolbar Lọc Trạng Thái */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FontAwesomeIcon icon={faFilter} style={{ fontSize: '11px', color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Hiển thị:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: filterMode === 'all' ? 700 : 500,
                    backgroundColor: filterMode === 'all' ? 'var(--bg-active, #0f172a)' : 'var(--bg-subtle)',
                    color: filterMode === 'all' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Tất cả ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('valid')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: filterMode === 'valid' ? 700 : 500,
                    backgroundColor: filterMode === 'valid' ? '#16a34a' : 'var(--bg-subtle)',
                    color: filterMode === 'valid' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Hợp lệ ({validationResult.validCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('invalid')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: filterMode === 'invalid' ? 700 : 500,
                    backgroundColor: filterMode === 'invalid' ? '#ef4444' : 'var(--bg-subtle)',
                    color: filterMode === 'invalid' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Lỗi ({validationResult.invalidCount})
                </button>
              </div>
            </div>

            {validationResult.invalidCount > 0 && (
              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
                ⚠️ Các dòng lỗi sẽ tự động bị loại bỏ khi nạp
              </span>
            )}
          </div>

          {/* 4. Bảng Chi Tiết Kiểm Tra */}
          <div className="custom-scrollbar" style={{ borderRadius: '10px', border: '1px solid var(--border-color)', maxHeight: '230px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', zIndex: 2 }}>
                <tr style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>
                  <th style={{ padding: '7px 10px', width: '50px' }}>DÒNG</th>
                  <th style={{ padding: '7px 10px', width: '90px' }}>HÃNG</th>
                  <th style={{ padding: '7px 10px', width: '90px' }}>MÃ LỖI</th>
                  <th style={{ padding: '7px 10px', width: '85px' }}>MỨC ĐỘ</th>
                  <th style={{ padding: '7px 10px' }}>CHI TIẾT &amp; NGUYÊN NHÂN LỖI</th>
                  <th style={{ padding: '7px 10px', width: '90px', textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.rowNumber}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: !item.isValid ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '6px 10px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--text-muted)' }}>
                      #{item.rowNumber}
                    </td>
                    <td style={{ padding: '6px 10px', fontWeight: 600 }}>{item.data.vendor || '—'}</td>
                    <td style={{ padding: '6px 10px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: item.isValid ? '#2563eb' : '#ef4444' }}>
                      {item.data.errorCode || '—'}
                    </td>
                    <td style={{ padding: '6px 10px' }}>
                      <span
                        style={{
                          padding: '1.5px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: item.data.severity === 'Critical' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          color: item.data.severity === 'Critical' ? '#ef4444' : '#d97706',
                        }}
                      >
                        {item.data.severity}
                      </span>
                    </td>
                    <td style={{ padding: '6px 10px' }}>
                      {item.isValid ? (
                        <span style={{ color: 'var(--text-secondary)' }}>{item.data.description}</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {item.errors.map((err, eIdx) => (
                            <span key={eIdx} style={{ color: '#ef4444', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: '9px' }} />
                              <span>{err}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                      {item.action === 'NEW' && (
                        <span style={{ padding: '1.5px 6px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 700, backgroundColor: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <FontAwesomeIcon icon={faPlus} style={{ fontSize: '8px' }} />
                          <span>Mới</span>
                        </span>
                      )}
                      {item.action === 'UPDATE' && (
                        <span style={{ padding: '1.5px 6px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 700, backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: '8px' }} />
                          <span>Ghi đè</span>
                        </span>
                      )}
                      {item.action === 'REJECT' && (
                        <span style={{ padding: '1.5px 6px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 700, backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
                          Từ chối
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default CsvImportValidationSummary;

