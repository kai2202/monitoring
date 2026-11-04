/**
 * Frontend/src/features/analytics/components/supplies/HighLoadFleetSuppliesTable.tsx
 *
 * Bảng Mức Vật Tư Hạm Đội Máy Tải Cao (High-Load Fleet Supply Levels Table):
 * - Gom các dòng máy in công nghiệp tải cao thành bảng so sánh chuyên nghiệp.
 * - Tích hợp Segmented Pill Indicators cho 6 thành phần (CMYK, Drum, Fuser) trong cùng 1 hàng.
 * - Hỗ trợ bấm vào hàng để mở Slide-over Diagnostics Drawer.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import {
  FontAwesomeIcon,
  faChevronLeft,
  faChevronRight,
  faArrowUpRightFromSquare,
} from '../../../../shared/icons';
import { PrinterConsumablesOverview } from '../../../../types/analyticsUI';
import { SuppliesSegmentedPillCell } from './SuppliesSegmentedPillCell';

export interface HighLoadFleetSuppliesTableProps {
  printers?: PrinterConsumablesOverview[];
  onSelectPrinter?: (printer: PrinterConsumablesOverview) => void;
}

export const HighLoadFleetSuppliesTable: React.FC<HighLoadFleetSuppliesTableProps> = ({
  printers = [],
  onSelectPrinter,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const safePrinters = useMemo(() => printers || [], [printers]);
  const totalPages = Math.max(1, Math.ceil(safePrinters.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const displayedPrinters = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return safePrinters.slice(start, start + PAGE_SIZE);
  }, [safePrinters, safePage]);

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
          padding: '18px 24px',
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
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              Vật tư máy tải cao
            </h3>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0' }}>
              Mức tiêu hao mực in (CMYK), Trống từ &amp; Sấy theo từng thiết bị
            </p>
          </div>
        </div>

        {/* Chú giải nhanh 6 thành phần */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '11px' }}>
          {[
            { label: 'K', color: '#0f172a' },
            { label: 'C', color: '#06b6d4' },
            { label: 'M', color: '#ec4899' },
            { label: 'Y', color: '#eab308' },
            { label: 'Drum', color: '#8b5cf6' },
            { label: 'Fuser', color: '#f97316' },
          ].map((c) => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: c.color }} />
              <span style={{ color: 'var(--text-secondary, #475569)', fontWeight: 600 }}>{c.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span style={{ color: '#ef4444', fontWeight: 700 }}>&lt; 15%</span>
          </div>
        </div>
      </div>

      {/* 2. Nội dung Bảng Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '880px' }}>
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: 'var(--bg-subtle, #f8fafc)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted, #64748b)',
                letterSpacing: '0.02em',
              }}
            >
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
                  Không tìm thấy thiết bị nào thuộc tầng đã chọn.
                </td>
              </tr>
            ) : (
              displayedPrinters.map((p) => {
                const hasCritical =
                  (p.tonerK ?? 100) < 15 ||
                  (p.tonerC ?? 100) < 15 ||
                  (p.tonerM ?? 100) < 15 ||
                  (p.tonerY ?? 100) < 15 ||
                  (p.drumLife ?? 100) < 15 ||
                  (p.fuserLife ?? 100) < 15 ||
                  p.wasteToner === 'Đầy';

                return (
                  <tr
                    key={p.printerId}
                    onClick={() => onSelectPrinter && onSelectPrinter(p)}
                    style={{
                      borderBottom: '1px solid var(--border-color, #e2e8f0)',
                      cursor: onSelectPrinter ? 'pointer' : 'default',
                      backgroundColor: hasCritical ? 'rgba(255, 241, 242, 0.35)' : 'transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = hasCritical
                        ? 'rgba(255, 228, 230, 0.6)'
                        : 'var(--bg-subtle, rgba(0, 0, 0, 0.02))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = hasCritical
                        ? 'rgba(255, 241, 242, 0.35)'
                        : 'transparent';
                    }}
                  >
                    {/* Cột 1: Thiết bị máy in */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}>
                            {p.printerName}
                          </strong>
                          {hasCritical && (
                            <span
                              style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }}
                              title="Có thành phần vật tư chạm ngưỡng khẩn cấp <15%"
                            />
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                          {p.model}
                        </span>
                      </div>
                    </td>

                    {/* Cột 2: Vị trí & Phòng ban */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                          {p.floor}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                          {p.department}
                        </span>
                      </div>
                    </td>

                    {/* Cột 3: Sản lượng tháng */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <strong
                          style={{
                            fontSize: '13.5px',
                            fontFamily: "'JetBrains Mono', monospace",
                            color: '#2563eb',
                          }}
                        >
                          {(p.totalMonthlyVolume || 0).toLocaleString('vi-VN')}
                        </strong>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)' }}>trang</span>
                      </div>
                    </td>

                    {/* Cột 4: Segmented Pill Indicators */}
                    <td style={{ padding: '14px 20px' }}>
                      <SuppliesSegmentedPillCell
                        tonerK={p.tonerK}
                        tonerC={p.tonerC}
                        tonerM={p.tonerM}
                        tonerY={p.tonerY}
                        drumLife={p.drumLife}
                        fuserLife={p.fuserLife}
                        wasteToner={p.wasteToner}
                      />
                    </td>

                    {/* Cột 5: Icon mở Drawer */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: '11px' }} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Footer Phân Trang */}
      {totalPages > 1 && (
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-muted, #64748b)',
          }}
        >
          <span>
            Trang <strong>{safePage}</strong> / <strong>{totalPages}</strong> ({safePrinters.length} thiết bị tải cao)
          </span>

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
