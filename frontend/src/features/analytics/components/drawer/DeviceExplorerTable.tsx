import React from 'react';
import { FontAwesomeIcon, faSort, faChevronLeft, faChevronRight } from '../../../../shared/icons';
import { DeviceFloorContributionItem } from '../../../../types/analyticsUI';

interface DeviceExplorerTableProps {
  paginatedDevices: DeviceFloorContributionItem[];
  processedDevicesCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  sortField: 'volume' | 'name' | 'floor' | 'brand' | 'status';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'volume' | 'name' | 'floor' | 'brand' | 'status') => void;
  pinnedPrinterIds: string[];
  onTogglePinPrinter: (id: string) => void;
  onInspectDevice: (device: DeviceFloorContributionItem) => void;
}

export const DeviceExplorerTable: React.FC<DeviceExplorerTableProps> = ({
  paginatedDevices,
  processedDevicesCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  sortField,
  sortOrder,
  onSort,
  pinnedPrinterIds,
  onTogglePinPrinter,
  onInspectDevice,
}) => {
  const getBrandBadgeStyle = (brand: string) => {
    const b = brand.toLowerCase();
    if (b.includes('canon')) return { bg: 'rgba(234, 88, 12, 0.12)', color: '#ea580c', border: 'rgba(234, 88, 12, 0.25)' };
    if (b.includes('hp')) return { bg: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', border: 'rgba(2, 132, 199, 0.25)' };
    if (b.includes('ricoh')) return { bg: 'rgba(220, 38, 38, 0.12)', color: '#dc2626', border: 'rgba(220, 38, 38, 0.25)' };
    if (b.includes('brother')) return { bg: 'rgba(79, 70, 229, 0.12)', color: '#4f46e5', border: 'rgba(79, 70, 229, 0.25)' };
    if (b.includes('xerox')) return { bg: 'rgba(147, 51, 234, 0.12)', color: '#9333ea', border: 'rgba(147, 51, 234, 0.25)' };
    return { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: 'rgba(16, 185, 129, 0.25)' };
  };

  return (
    <>
      <div
        style={{
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          overflowX: 'auto',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11.5px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
              <th
                onClick={() => onSort('brand')}
                style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                title="Bấm để sắp xếp theo Hãng"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Hãng &amp; Thiết bị (Model)</span>
                  <FontAwesomeIcon icon={faSort} style={{ fontSize: '10px' }} />
                </div>
              </th>

              <th
                onClick={() => onSort('floor')}
                style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                title="Bấm để sắp xếp theo Tầng"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Vị trí &amp; Phòng ban</span>
                  <FontAwesomeIcon icon={faSort} style={{ fontSize: '10px' }} />
                </div>
              </th>

              <th
                onClick={() => onSort('status')}
                style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                title="Bấm để sắp xếp theo Trạng thái"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Trạng thái &amp; Mực in</span>
                  <FontAwesomeIcon icon={faSort} style={{ fontSize: '10px' }} />
                </div>
              </th>

              <th
                onClick={() => onSort('volume')}
                style={{ padding: '10px 12px', color: '#2563eb', fontWeight: 800, textAlign: 'right', cursor: 'pointer' }}
                title="Bấm để đảo chiều sắp xếp theo Sản lượng"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Sản lượng in</span>
                  <FontAwesomeIcon icon={faSort} style={{ fontSize: '10px' }} />
                </div>
              </th>

              <th style={{ padding: '10px 12px', textAlign: 'center', width: '80px', color: 'var(--text-muted)', fontWeight: 700 }}>
                Ghim
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedDevices.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Không tìm thấy thiết bị nào khớp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              paginatedDevices.map((d) => {
                const isPinned = pinnedPrinterIds.includes(d.printerId);
                const brandStyle = getBrandBadgeStyle(d.brand);
                const tonerLevel = d.tonerK ?? 70;

                return (
                  <tr
                    key={d.printerId}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isPinned ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isPinned) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isPinned) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Hãng & Model */}
                    <td style={{ padding: '10px 12px' }}>
                      <div
                        onClick={() => onInspectDevice(d)}
                        style={{ display: 'flex', flexDirection: 'column', gap: '3px', cursor: 'pointer' }}
                        title="Bấm để xem chi tiết thông số kỹ thuật"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 800,
                              backgroundColor: brandStyle.bg,
                              color: brandStyle.color,
                              border: `1px solid ${brandStyle.border}`,
                            }}
                          >
                            {d.brand}
                          </span>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '12px' }}>
                            {d.printerName}
                          </strong>
                        </div>

                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                          {d.printerId} • {d.model}
                        </span>
                      </div>
                    </td>

                    {/* Vị trí & Phòng ban */}
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.floor}</span>
                      <div style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>{d.department}</div>
                    </td>

                    {/* Trạng thái & Mực in */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 7px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 700,
                            width: 'fit-content',
                            backgroundColor: d.status === 'Online' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: d.status === 'Online' ? '#16a34a' : '#ef4444',
                          }}
                        >
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: d.status === 'Online' ? '#16a34a' : '#ef4444' }} />
                          {d.status === 'Online' ? 'Hoạt động' : 'Mất kết nối'}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Mực K:</span>
                          <div style={{ width: '45px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--border-subtle)', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${tonerLevel}%`,
                                height: '100%',
                                backgroundColor: tonerLevel <= 15 ? '#ef4444' : tonerLevel <= 30 ? '#f59e0b' : '#16a34a',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '9.5px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
                            {tonerLevel}%
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Sản lượng */}
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <strong style={{ fontSize: '13px', color: '#2563eb', fontFamily: "'JetBrains Mono', monospace" }}>
                        {d.totalVolume.toLocaleString('vi-VN')}
                      </strong>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>trang</span>
                    </td>

                    {/* Ghim */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => onTogglePinPrinter(d.printerId)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: isPinned ? '#2563eb' : 'var(--bg-subtle)',
                          color: isPinned ? '#ffffff' : 'var(--text-secondary)',
                          border: isPinned ? 'none' : '1px solid var(--border-color)',
                          fontSize: '11px',
                          fontWeight: isPinned ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                          whiteSpace: 'nowrap',
                        }}
                        title={isPinned ? 'Bỏ ghim' : 'Ghim so sánh'}
                      >
                        {isPinned ? 'Đã ghim' : 'Ghim'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 4px 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
        <span>
          Hiển thị {processedDevicesCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, processedDevicesCount)} trong <strong>{processedDevicesCount}</strong> thiết bị
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '11px',
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '11px' }} />
          </button>

          <span style={{ padding: '0 8px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '11px',
            }}
          >
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '11px' }} />
          </button>
        </div>
      </div>
    </>
  );
};
