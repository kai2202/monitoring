/**
 * Frontend/src/components/analytics/PrinterInventoryTable.tsx
 *
 * Thành phần 3: Data Table – Printer Inventory Analytics
 * - Bảng danh mục sản lượng thiết bị kèm tỷ lệ tăng trưởng giữa các tháng.
 * - Các trường: Thứ hạng, Thiết bị, Model, Hãng, Phòng ban, Kỳ này, Kỳ trước, Tăng trưởng (Growth Rate %), Thao tác.
 * - Hỗ trợ phân trang (10, 25, 50 dòng), tìm kiếm, lọc theo hãng/phòng ban, và sắp xếp theo cột.
 * - Tối ưu cho quy mô 1.000 máy in mà không gây nặng trình duyệt.
 *
 * Tuân thủ AGENTS.md: MetricValue = number | null, không bịa đặt số 0.
 */

import React, { useState } from 'react';
import {
  Table as TableIcon,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronLeft,
  ChevronRight,
  Layers,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  InventoryTableResponse,
  PrinterInventoryItem,
} from '../../types/analytics';

export interface PrinterInventoryTableProps {
  data: InventoryTableResponse | null;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  brandFilter: string;
  onBrandFilterChange: (b: string) => void;
  sortBy: 'rank' | 'currentPeriodPages' | 'growthRatePercent' | 'printerName';
  onSortByChange: (sortBy: 'rank' | 'currentPeriodPages' | 'growthRatePercent' | 'printerName') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderToggle: () => void;
  selectedPrinterIds: string[];
  onToggleSelectPrinter: (printerId: string) => void;
  onOpenPrinterDetail?: (printerId: string) => void;
}

export const PrinterInventoryTable: React.FC<PrinterInventoryTableProps> = ({
  data,
  isLoading,
  page,
  onPageChange,
  pageSize,
  onPageSizeChange,
  searchQuery,
  onSearchQueryChange,
  brandFilter,
  onBrandFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  selectedPrinterIds,
  onToggleSelectPrinter,
  onOpenPrinterDetail,
}) => {
  const brands = ['all', 'Ricoh', 'Canon', 'HP', 'Brother', 'Epson'];
  const items = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const handleSort = (field: 'rank' | 'currentPeriodPages' | 'growthRatePercent' | 'printerName') => {
    if (sortBy === field) {
      onSortOrderToggle();
    } else {
      onSortByChange(field);
    }
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* 1. Header & Điều khiển Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <TableIcon size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              3. Bảng Dữ Liệu Sản Lượng Chi Tiết (Inventory Analytics)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Tra cứu {totalCount} thiết bị — Đối chiếu sản lượng tháng hiện tại, tháng trước và tốc độ tăng trưởng
            </p>
          </div>
        </div>

        {/* Số bản ghi trên trang */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Hiển thị mỗi trang:</span>
          <select
            value={pageSize}
            onChange={e => {
              onPageSizeChange(parseInt(e.target.value, 10));
              onPageChange(1);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value={10}>10 dòng</option>
            <option value={25}>25 dòng</option>
            <option value={50}>50 dòng</option>
          </select>
        </div>
      </div>

      {/* 2. Thanh tìm kiếm và lọc */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: '1 1 300px' }}>
          {/* Ô tìm kiếm */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: '9999px',
              padding: '6px 12px',
              minWidth: '220px',
              flex: '1 1 240px',
            }}
          >
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm theo tên máy, mã, model, vị trí..."
              value={searchQuery}
              onChange={e => {
                onSearchQueryChange(e.target.value);
                onPageChange(1);
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '11.5px',
                width: '100%',
              }}
            />
          </div>

          {/* Lọc hãng */}
          <select
            value={brandFilter}
            onChange={e => {
              onBrandFilterChange(e.target.value);
              onPageChange(1);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả hãng sản xuất</option>
            {brands.filter(b => b !== 'all').map(b => (
              <option key={b} value={b}>
                Hãng {b}
              </option>
            ))}
          </select>
        </div>

        {selectedPrinterIds.length > 0 && (
          <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 600 }}>
            ✓ Đã chọn {selectedPrinterIds.length} máy in để so sánh
          </div>
        )}
      </div>

      {/* 3. Bảng Dữ Liệu */}
      {isLoading ? (
        <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
          Đang nạp dữ liệu thống kê sản lượng...
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
          Không có bản ghi máy in nào phù hợp.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                {/* Checkbox */}
                <th style={{ padding: '10px 14px', width: '40px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CHỌN</span>
                </th>

                {/* Thứ hạng */}
                <th
                  onClick={() => handleSort('rank')}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    width: '60px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <span>HẠNG</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>

                {/* Tên máy & Model */}
                <th
                  onClick={() => handleSort('printerName')}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: '220px',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <span>THIẾT BỊ &amp; MODEL</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>

                {/* Hãng */}
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, width: '90px' }}>
                  HÃNG
                </th>

                {/* Vị trí */}
                <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, minWidth: '180px' }}>
                  PHÒNG BAN
                </th>

                {/* Sản lượng tháng này */}
                <th
                  onClick={() => handleSort('currentPeriodPages')}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'right',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: '110px',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end', width: '100%' }}>
                    <span>THÁNG NÀY</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>

                {/* Sản lượng tháng trước */}
                <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700, minWidth: '110px' }}>
                  THÁNG TRƯỚC
                </th>

                {/* Tốc độ tăng trưởng */}
                <th
                  onClick={() => handleSort('growthRatePercent')}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'right',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: '110px',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end', width: '100%' }}>
                    <span>TĂNG TRƯỞNG</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const isSelected = selectedPrinterIds.includes(item.printerId);
                const growth = item.growthRatePercent;
                const isPositive = growth !== null && growth > 0;
                const isNegative = growth !== null && growth < 0;

                return (
                  <tr
                    key={item.printerId}
                    style={{
                      borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectPrinter(item.printerId)}
                        style={{ cursor: 'pointer', accentColor: '#2563eb' }}
                      />
                    </td>

                    {/* Hạng */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          fontSize: '11px',
                          color: item.rank <= 3 ? '#d97706' : 'var(--text-secondary)',
                        }}
                      >
                        #{item.rank}
                      </span>
                    </td>

                    {/* Thiết bị */}
                    <td
                      style={{ padding: '10px 16px', cursor: 'pointer' }}
                      onClick={() => onOpenPrinterDetail?.(item.printerId)}
                      title="Click để mở chi tiết chẩn đoán thiết bị"
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12px' }}>
                        {item.printerName}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        {item.printerId} • {item.model}
                      </div>
                    </td>

                    {/* Hãng */}
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {item.brand}
                    </td>

                    {/* Phòng ban */}
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {item.department}
                    </td>

                    {/* Tháng này */}
                    <td
                      style={{
                        padding: '10px 14px',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--text-primary)',
                      }}
                    >
                      {item.currentPeriodPages !== null ? item.currentPeriodPages.toLocaleString('vi-VN') : '—'}
                    </td>

                    {/* Tháng trước */}
                    <td
                      style={{
                        padding: '10px 14px',
                        textAlign: 'right',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--text-muted)',
                      }}
                    >
                      {item.previousPeriodPages !== null ? item.previousPeriodPages.toLocaleString('vi-VN') : '—'}
                    </td>

                    {/* Tăng trưởng */}
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      {growth === null ? (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            fontFamily: "'JetBrains Mono', monospace",
                            backgroundColor: isPositive ? '#ecfdf5' : isNegative ? '#fee2e2' : 'var(--bg-subtle)',
                            color: isPositive ? '#16a34a' : isNegative ? '#dc2626' : 'var(--text-muted)',
                            border: isPositive ? '1px solid #bbf7d0' : isNegative ? '1px solid #fecaca' : '1px solid var(--border-color)',
                          }}
                        >
                          {isPositive ? <ArrowUpRight size={11} /> : isNegative ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                          <span>{growth > 0 ? `+${growth}%` : `${growth}%`}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Điều hướng Phân trang */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
          Hiển thị trang <strong>{page}</strong> / <strong>{totalPages}</strong> (Tổng số {totalCount} máy in)
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={13} style={{ verticalAlign: 'middle', marginRight: '2px' }} />
            <span>Trước</span>
          </button>
          <span style={{ fontSize: '11.5px', color: 'var(--text-primary)', fontWeight: 600, padding: '0 8px' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              opacity: page === totalPages ? 0.5 : 1,
            }}
          >
            <span>Sau</span>
            <ChevronRight size={13} style={{ verticalAlign: 'middle', marginLeft: '2px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

