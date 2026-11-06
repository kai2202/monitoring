/**
 * Frontend/src/features/analytics/components/supplies/UrgentConsumablesAlertsTable.tsx
 *
 * Bảng Cảnh Báo Cạn Kiệt Chủ Động (Urgent Consumables Alerts Table):
 * - Gom thiết bị chạm ngưỡng khẩn cấp (<15%) và lưu ý (<25%) thành bảng table đậm đặc thông tin.
 * - Hỗ trợ phân trang 6 dòng/trang và nút [Tạo lệnh cấp phát] mở modal.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon, faChevronLeft, faChevronRight, faMagnifyingGlass } from '../../../../shared/icons';
import { ConsumableAlertItem } from '../../../../types/analyticsUI';
import { UrgentConsumablesTableRow } from './UrgentConsumablesTableRow';

export interface UrgentConsumablesAlertsTableProps {
  alerts?: ConsumableAlertItem[];
  onSelectAlertToDispatch?: (alert: ConsumableAlertItem) => void;
  onOpenDispatchModal?: (alert: ConsumableAlertItem) => void;
}

export const UrgentConsumablesAlertsTable: React.FC<UrgentConsumablesAlertsTableProps> = ({
  alerts = [],
  onSelectAlertToDispatch,
  onOpenDispatchModal,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'toner' | 'hardware'>('all');
  const PAGE_SIZE = 6;

  const handleDispatch = (alert: ConsumableAlertItem) => {
    if (onSelectAlertToDispatch) onSelectAlertToDispatch(alert);
    else if (onOpenDispatchModal) onOpenDispatchModal(alert);
  };

  const filteredAlerts = useMemo(() => {
    let list = alerts || [];
    if (categoryFilter === 'toner') {
      list = list.filter((a) => ['black', 'cyan', 'magenta', 'yellow'].includes(a.itemType));
    } else if (categoryFilter === 'hardware') {
      list = list.filter((a) => ['drum', 'fuser'].includes(a.itemType));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.printerName.toLowerCase().includes(q) ||
          a.itemName.toLowerCase().includes(q) ||
          a.floor.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q)
      );
    }
    return list;
  }, [alerts, categoryFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const displayedAlerts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredAlerts.slice(start, start + PAGE_SIZE);
  }, [filteredAlerts, safePage]);

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
      {/* 1. Header Bảng */}
      <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              Cảnh báo cạn kiệt vật tư
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0' }}>
              Thiết bị chạm ngưỡng khẩn cấp (&lt;15%) và cần lưu ý (&lt;25%)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px', borderRadius: '9999px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)' }}>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'toner', label: 'Mực in CMYK' },
              { id: 'hardware', label: 'Trống & Sấy' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setCategoryFilter(cat.id as any); setCurrentPage(1); }}
                style={{
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: categoryFilter === cat.id ? '#ffffff' : 'transparent',
                  color: categoryFilter === cat.id ? '#0f172a' : 'var(--text-muted, #64748b)',
                  fontSize: '11px',
                  fontWeight: categoryFilter === cat.id ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: categoryFilter === cat.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }} />
            <input
              type="text"
              placeholder="Tìm máy, linh kiện..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '28px', paddingRight: '10px', paddingTop: '4px', paddingBottom: '4px', fontSize: '11.5px', borderRadius: '9999px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', width: '135px', outline: 'none' }}
            />
          </div>

          <span style={{ padding: '3px 10px', borderRadius: '9999px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontSize: '11.5px', fontWeight: 700 }}>
            {filteredAlerts.length} cảnh báo
          </span>
        </div>
      </div>

      {/* 2. Nội dung Bảng Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '860px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)', letterSpacing: '0.02em' }}>
              <th style={{ padding: '12px 20px', width: '250px' }}>THIẾT BỊ &amp; VỊ TRÍ</th>
              <th style={{ padding: '12px 16px', width: '210px' }}>LINH KIỆN CẦN CHÚ Ý</th>
              <th style={{ padding: '12px 16px', width: '160px' }}>MỨC % HIỆN TẠI</th>
              <th style={{ padding: '12px 14px', width: '130px' }}>TỐC ĐỘ TIÊU HAO</th>
              <th style={{ padding: '12px 14px', width: '150px' }}>DỰ KIẾN CẠN KIỆT</th>
              <th style={{ padding: '12px 20px', width: '140px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {displayedAlerts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
                  Không có cảnh báo vật tư nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              displayedAlerts.map((alt) => (
                <UrgentConsumablesTableRow key={alt.id} alt={alt} onSelectAlertToDispatch={handleDispatch} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Footer Phân Trang */}
      {totalPages > 1 && (
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>
          <span>
            Trang <strong>{safePage}</strong> / <strong>{totalPages}</strong> ({filteredAlerts.length} cảnh báo)
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

export default UrgentConsumablesAlertsTable;
