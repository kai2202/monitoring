/**
 * Frontend/src/features/analytics/components/supplies/HighLoadFleetSuppliesTable.tsx
 *
 * Bảng Mức Vật Tư Hạm Đội Máy Tải Cao (High-Load Fleet Supply Levels Table):
 * - Gom các dòng máy in công nghiệp tải cao thành bảng so sánh chuyên nghiệp.
 * - Tích hợp Segmented Pill Indicators cho 6 thành phần (CMYK, Drum, Fuser) trong cùng 1 hàng.
 * - Hỗ trợ tìm kiếm, phân trang linh hoạt (6/12/24 máy) và click mở Diagnostics Drawer.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import {
  FontAwesomeIcon,
  faChevronLeft,
  faChevronRight,
  faMagnifyingGlass,
} from '../../../../shared/icons';
import { PrinterConsumablesOverview } from '../../../../types/analyticsUI';
import { HighLoadFleetTableRow } from './HighLoadFleetTableRow';

export interface HighLoadFleetSuppliesTableProps {
  printers?: PrinterConsumablesOverview[];
  devices?: PrinterConsumablesOverview[];
  onSelectPrinter?: (printer: PrinterConsumablesOverview) => void;
  onSelectDevice?: (device: PrinterConsumablesOverview) => void;
}

export const HighLoadFleetSuppliesTable: React.FC<HighLoadFleetSuppliesTableProps> = ({
  printers,
  devices,
  onSelectPrinter,
  onSelectDevice,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(6);
  const [searchQuery, setSearchQuery] = useState('');

  const rawList = devices || printers || [];
  const handleSelect = onSelectDevice || onSelectPrinter;

  const filteredPrinters = useMemo(() => {
    let list = rawList;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.printerName.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.floor.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rawList, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPrinters.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const displayedPrinters = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredPrinters.slice(start, start + pageSize);
  }, [filteredPrinters, safePage, pageSize]);

  return (
    <div
      style={{
        borderRadius: '24px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Header Bảng & Chú giải */}
      <div
        style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              boxShadow: '0 0 10px rgba(37, 99, 235, 0.6)',
              flexShrink: 0,
            }}
          />
          <div>
            <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              Vật tư máy tải cao
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0' }}>
              Mức tiêu hao mực in (CMYK), Trống từ &amp; Sấy theo từng thiết bị
            </p>
          </div>
        </div>

        {/* Chú giải & Tìm kiếm */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Chú giải nhanh 6 thành phần */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '11px' }}>
            {[
              { label: 'K', color: '#0f172a' },
              { label: 'C', color: '#06b6d4' },
              { label: 'M', color: '#ec4899' },
              { label: 'Y', color: '#eab308' },
              { label: 'Drum', color: '#8b5cf6' },
              { label: 'Fuser', color: '#f97316' },
            ].map((c) => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '2px', backgroundColor: c.color }} />
                <span style={{ color: 'var(--text-secondary, #475569)', fontWeight: 600 }}>{c.label}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ color: '#ef4444', fontWeight: 700 }}>&lt; 15%</span>
            </div>
          </div>

          {/* Quick Search Input */}
          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }} />
            <input
              type="text"
              placeholder="Tìm máy tải cao..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '28px', paddingRight: '10px', paddingTop: '4px', paddingBottom: '4px', fontSize: '11.5px', borderRadius: '9999px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', width: '135px', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* 2. Nội dung Bảng Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '880px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)', letterSpacing: '0.02em' }}>
              <th style={{ padding: '12px 20px', width: '260px' }}>THIẾT BỊ MÁY IN</th>
              <th style={{ padding: '12px 16px', width: '200px' }}>VỊ TRÍ &amp; PHÒNG BAN</th>
              <th style={{ padding: '12px 16px', width: '150px' }}>SẢN LƯỢNG THÁNG</th>
              <th style={{ padding: '12px 20px', width: '380px' }}>MỨC VẬT TƯ &amp; MỰC THẢI (CMYK + DRUM + FUSER + W)</th>
              <th style={{ padding: '12px 16px', width: '50px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {displayedPrinters.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
                  Không tìm thấy thiết bị nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              displayedPrinters.map((p) => (
                <HighLoadFleetTableRow key={p.printerId} printer={p} onSelectPrinter={handleSelect} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Footer Phân Trang */}
      {totalPages > 1 && (
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted, #64748b)', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>
              Trang <strong>{safePage}</strong> / <strong>{totalPages}</strong> ({filteredPrinters.length} thiết bị tải cao)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>Hiển thị:</span>
              {[6, 12, 24].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => { setPageSize(sz); setCurrentPage(1); }}
                  style={{ padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: pageSize === sz ? '#2563eb' : 'var(--bg-subtle, #f8fafc)', color: pageSize === sz ? '#ffffff' : 'var(--text-secondary, #475569)', fontSize: '11px', fontWeight: pageSize === sz ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', color: safePage <= 1 ? 'var(--text-muted, #94a3b8)' : 'var(--text-primary, #0f172a)', cursor: safePage <= 1 ? 'not-allowed' : 'pointer' }}
            >
              <FontAwesomeIcon icon={faChevronLeft} size="xs" />
            </button>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', color: safePage >= totalPages ? 'var(--text-muted, #94a3b8)' : 'var(--text-primary, #0f172a)', cursor: safePage >= totalPages ? 'not-allowed' : 'pointer' }}
            >
              <FontAwesomeIcon icon={faChevronRight} size="xs" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HighLoadFleetSuppliesTable;
