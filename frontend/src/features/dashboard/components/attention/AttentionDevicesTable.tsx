/**
 * Frontend/src/features/dashboard/components/attention/AttentionDevicesTable.tsx
 *
 * Bảng Thiết Bị Cần Xử Lý (Attention Devices Table 7 Cột):
 * - Phân tách rõ ràng Mất kết nối mạng (Offline) vs Lỗi phần cứng (Hardware) vs Vật tư (AGENTS.md Rule 5 & 6).
 * - Tích hợp phân trang thu gọn (5 dòng/trang) chống vỡ bố cục trang Dashboard.
 * - Nút thao tác kép: [Chẩn đoán] (mở Drawer OID) và [+ Lập lệnh] (tạo lệnh bảo trì).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  FontAwesomeIcon,
  faTriangleExclamation,
  faCircleCheck,
  faChevronLeft,
  faChevronRight,
} from '../../../../shared/icons';
import { Printer } from '../../../../types/printer';
import { AttentionDeviceTableRow } from './AttentionDeviceTableRow';

export interface AttentionDevicesTableProps {
  printers: Printer[];
  onSelectPrinter: (printer: Printer) => void;
  onCreateTask?: (printer: Printer) => void;
  activeFilterTitle?: string | null;
  onClearFilter?: () => void;
}

export const AttentionDevicesTable: React.FC<AttentionDevicesTableProps> = ({
  printers,
  onSelectPrinter,
  onCreateTask,
  activeFilterTitle,
  onClearFilter,
}) => {
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'critical' | 'warning'>('all');
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    setPage(1);
  }, [filterTab, activeFilterTitle]);

  const handleCopyIp = (e: React.MouseEvent, ip: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 1500);
  };

  const displayedPrinters = useMemo(() => {
    if (filterTab === 'critical') {
      return printers.filter((p) => p.health === 'Critical' || p.alertSeverity === 'critical' || p.connectionStatus === 'Offline');
    }
    if (filterTab === 'warning') {
      return printers.filter((p) => p.health === 'Warning' || p.alertSeverity === 'warning');
    }
    return printers;
  }, [printers, filterTab]);

  const totalPages = Math.max(1, Math.ceil(displayedPrinters.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedPrinters = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return displayedPrinters.slice(start, start + PAGE_SIZE);
  }, [displayedPrinters, safePage]);

  return (
    <div
      style={{
        borderRadius: '20px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Header Bar */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: '16px', color: '#ef4444' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            Thiết bị cần xử lý ({displayedPrinters.length})
          </h3>
          {activeFilterTitle && (
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>Lọc: {activeFilterTitle}</span>
              {onClearFilter && (
                <button type="button" onClick={onClearFilter} style={{ background: 'none', border: 'none', padding: 0, color: '#2563eb', cursor: 'pointer', fontWeight: 800, fontSize: '12px' }}>×</button>
              )}
            </span>
          )}
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'critical', label: 'Khẩn cấp / Offline' },
            { id: 'warning', label: 'Cảnh báo vật tư' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id as any)}
              style={{
                padding: '4px 10px',
                borderRadius: '7px',
                border: 'none',
                backgroundColor: filterTab === tab.id ? 'var(--bg-card, #ffffff)' : 'transparent',
                color: filterTab === tab.id ? 'var(--text-primary, #0f172a)' : 'var(--text-muted, #64748b)',
                fontSize: '11px',
                fontWeight: filterTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                boxShadow: filterTab === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '940px', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
              <th style={{ padding: '10px 16px', width: '130px' }}>MÃ / IP</th>
              <th style={{ padding: '10px 16px', width: '210px' }}>THIẾT BỊ</th>
              <th style={{ padding: '10px 16px', width: '140px' }}>VỊ TRÍ</th>
              <th style={{ padding: '10px 16px', width: '110px' }}>MỰC CMYK</th>
              <th style={{ padding: '10px 16px', width: '230px' }}>SỰ CỐ HIỆN TẠI</th>
              <th style={{ padding: '10px 16px', width: '110px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '10px 16px', textAlign: 'right', width: '180px' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPrinters.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '38px 24px', textAlign: 'center' }}>
                  {printers.length === 0 ? (
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', marginBottom: '8px' }}>
                        <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '20px' }} />
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                        Hạm đội vận hành ổn định — 100% an toàn
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', marginTop: '4px' }}>
                        Không phát hiện sự cố phần cứng, ngoại tuyến hay cạn kiệt vật tư nào cần can thiệp.
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '12.5px' }}>
                      Không có máy in nào khớp với bộ lọc sự cố đã chọn.
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              paginatedPrinters.map((printer) => (
                <AttentionDeviceTableRow
                  key={printer.id}
                  printer={printer}
                  copiedIp={copiedIp}
                  onCopyIp={handleCopyIp}
                  onSelectPrinter={onSelectPrinter}
                  onCreateTask={onCreateTask}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {displayedPrinters.length > PAGE_SIZE && (
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-subtle, #f8fafc)', fontSize: '11.5px', color: 'var(--text-muted, #64748b)' }}>
          <span>
            Hiển thị <strong>{(safePage - 1) * PAGE_SIZE + 1}</strong> – <strong>{Math.min(safePage * PAGE_SIZE, displayedPrinters.length)}</strong> trong số <strong>{displayedPrinters.length}</strong> thiết bị
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
              Trang {safePage} / {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: safePage <= 1 ? 'transparent' : 'var(--bg-card, #ffffff)',
                  color: safePage <= 1 ? 'var(--text-muted, #cbd5e1)' : 'var(--text-primary, #0f172a)',
                  cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '10px' }} />
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: safePage >= totalPages ? 'transparent' : 'var(--bg-card, #ffffff)',
                  color: safePage >= totalPages ? 'var(--text-muted, #cbd5e1)' : 'var(--text-primary, #0f172a)',
                  cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '10px' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
