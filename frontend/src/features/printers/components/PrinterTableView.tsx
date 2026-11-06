/**
 * Frontend/src/features/printers/components/PrinterTableView.tsx
 *
 * Bảng Danh Mục Máy In Doanh Nghiệp (Enterprise Printer Table View):
 * - Hỗ trợ sắp xếp cột linh hoạt (Sorting theo Tên, IP, Hãng, Bộ đếm, Sức khỏe).
 * - Cột Bộ Đếm Trang hiển thị OID total counter (chuẩn Rule 5 MetricValue = number | null, hiển thị '—').
 * - Tách dòng sang PrinterTableRow và phân trang sang PrinterTablePagination.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon, faSort } from '../../../shared/icons';
import { Printer } from '../../../types/printer';
import { Task } from '../../../types/task';
import { PrinterTableRow } from './PrinterTableRow';
import { PrinterTablePagination } from './PrinterTablePagination';

export type SortColumn = 'id' | 'name' | 'mfr' | 'counter' | 'status' | 'health' | null;

interface PrinterTableViewProps {
  printers: Printer[];
  printerTaskMap: Map<string, { active: number; total: number; latestTask?: Task }>;
  copiedIp: string | null;
  onCopyIp: (e: React.MouseEvent, ip: string) => void;
  onOpenDrawer: (printer: Printer, tab: 'diag' | 'tasks' | 'counters', taskId?: string) => void;
  onOpenRelocate?: (printer: Printer) => void;
  onOpenEdit?: (printer: Printer) => void;
  onDecommissionPrinter?: (printer: Printer) => void;
  isAdmin?: boolean;
}

export const PrinterTableView: React.FC<PrinterTableViewProps> = ({
  printers,
  printerTaskMap,
  copiedIp,
  onCopyIp,
  onOpenDrawer,
  onOpenRelocate,
  onOpenEdit,
  onDecommissionPrinter,
  isAdmin = false,
}) => {
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setCurrentPage(1);
  }, [printers.length]);

  const handleToggleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedPrinters = useMemo(() => {
    if (!sortColumn) return printers;
    return [...printers].sort((a, b) => {
      let valA: string | number | null = '';
      let valB: string | number | null = '';

      switch (sortColumn) {
        case 'id':
          valA = a.id;
          valB = b.id;
          break;
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'mfr':
          valA = a.mfr.toLowerCase();
          valB = b.mfr.toLowerCase();
          break;
        case 'counter':
          valA = a.counters?.total ?? -1;
          valB = b.counters?.total ?? -1;
          break;
        case 'status':
          valA = a.connectionStatus;
          valB = b.connectionStatus;
          break;
        case 'health': {
          const rank = { Critical: 3, Warning: 2, Healthy: 1, Offline: 0 };
          valA = rank[a.health as keyof typeof rank] ?? 0;
          valB = rank[b.health as keyof typeof rank] ?? 0;
          break;
        }
      }

      if (valA === valB) return 0;
      if (valA === null || valA === -1) return 1;
      if (valB === null || valB === -1) return -1;
      const res = valA > valB ? 1 : -1;
      return sortDirection === 'asc' ? res : -res;
    });
  }, [printers, sortColumn, sortDirection]);

  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(sortedPrinters.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = pageSize === -1 ? 0 : (safeCurrentPage - 1) * pageSize;
  const endIndex = pageSize === -1 ? sortedPrinters.length : Math.min(startIndex + pageSize, sortedPrinters.length);
  const displayedPrinters = sortedPrinters.slice(startIndex, endIndex);

  const thSortStyle: React.CSSProperties = {
    padding: '12px 14px',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    userSelect: 'none',
  };

  return (
    <div style={{ borderRadius: 'var(--radius-card)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1180px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}>
              <th onClick={() => handleToggleSort('id')} style={{ ...thSortStyle, width: '120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>MÃ / IP</span>
                  <FontAwesomeIcon icon={faSort} style={{ fontSize: '9px', opacity: sortColumn === 'id' ? 1 : 0.4 }} />
                </div>
              </th>
              <th onClick={() => handleToggleSort('name')} style={{ ...thSortStyle, width: '230px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>THIẾT BỊ &amp; MODEL</span>
                  <FontAwesomeIcon icon={faSort} style={{ fontSize: '9px', opacity: sortColumn === 'name' ? 1 : 0.4 }} />
                </div>
              </th>
              <th onClick={() => handleToggleSort('mfr')} style={{ ...thSortStyle, width: '120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>HÃNG &amp; LOẠI</span>
                  <FontAwesomeIcon icon={faSort} style={{ fontSize: '9px', opacity: sortColumn === 'mfr' ? 1 : 0.4 }} />
                </div>
              </th>
              <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '170px' }}>VỊ TRÍ</th>
              <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '130px' }}>MỰC IN</th>
              <th onClick={() => handleToggleSort('counter')} style={{ ...thSortStyle, width: '120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>BỘ ĐẾM TRANG</span>
                  <FontAwesomeIcon icon={faSort} style={{ fontSize: '9px', opacity: sortColumn === 'counter' ? 1 : 0.4 }} />
                </div>
              </th>
              <th onClick={() => handleToggleSort('status')} style={{ ...thSortStyle, width: '110px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>KẾT NỐI</span>
                  <FontAwesomeIcon icon={faSort} style={{ fontSize: '9px', opacity: sortColumn === 'status' ? 1 : 0.4 }} />
                </div>
              </th>
              <th onClick={() => handleToggleSort('health')} style={{ ...thSortStyle, width: '115px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>SỨC KHỎE</span>
                  <FontAwesomeIcon icon={faSort} style={{ fontSize: '9px', opacity: sortColumn === 'health' ? 1 : 0.4 }} />
                </div>
              </th>
              <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '135px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {displayedPrinters.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Không tìm thấy máy in nào khớp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              displayedPrinters.map((p) => (
                <PrinterTableRow
                  key={p.id}
                  printer={p}
                  taskInfo={printerTaskMap.get(p.id)}
                  copiedIp={copiedIp}
                  isAdmin={isAdmin}
                  onCopyIp={onCopyIp}
                  onOpenDrawer={onOpenDrawer}
                  onOpenRelocate={onOpenRelocate}
                  onOpenEdit={onOpenEdit}
                  onDecommissionPrinter={onDecommissionPrinter}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <PrinterTablePagination
        pageSize={pageSize}
        onPageSizeChange={(sz) => { setPageSize(sz); setCurrentPage(1); }}
        currentPage={safeCurrentPage}
        onPageChange={setCurrentPage}
        totalItems={sortedPrinters.length}
        startIndex={startIndex}
        endIndex={endIndex}
        totalPages={totalPages}
      />
    </div>
  );
};

export default PrinterTableView;
