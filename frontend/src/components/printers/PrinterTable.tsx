import React from 'react';
import {
  Wifi,
  WifiOff,
  HelpCircle,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  SearchX,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Printer } from '../../types/printer';
import { formatDateTime } from '../../utils/formatDate';

interface PrinterTableProps {
  printers: Printer[];
  filteredPrinters: Printer[];
  paginatedPrinters: Printer[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  pageSize: number;
  quickFilter: string;
  setQuickFilter: (s: string) => void;
  mfrFilter: string;
  setMfrFilter: (s: string) => void;
  deviceTypeFilter: string;
  setDeviceTypeFilter: (s: string) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  onResetFilters: () => void;
  onOpenPrinterModal: (printer: Printer) => void;
}

export const PrinterTable: React.FC<PrinterTableProps> = ({
  printers,
  filteredPrinters,
  paginatedPrinters,
  currentPage,
  setCurrentPage,
  totalPages,
  pageSize,
  quickFilter,
  setQuickFilter,
  mfrFilter,
  setMfrFilter,
  deviceTypeFilter,
  setDeviceTypeFilter,
  searchQuery,
  setSearchQuery,
  onResetFilters,
  onOpenPrinterModal,
}) => {
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Active Filter Indicators */}
      {(quickFilter !== 'all' || mfrFilter !== 'all' || deviceTypeFilter !== 'all' || searchQuery.trim() !== '') && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.45rem', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Đang lọc theo:</span>
          {quickFilter !== 'all' && (
            <span className="badge badge-neutral" style={{ textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Trạng thái: <strong>{quickFilter}</strong>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setQuickFilter('all')} />
            </span>
          )}
          {deviceTypeFilter !== 'all' && (
            <span className="badge badge-neutral" style={{ textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Chủng loại: <strong>{deviceTypeFilter}</strong>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setDeviceTypeFilter('all')} />
            </span>
          )}
          {mfrFilter !== 'all' && (
            <span className="badge badge-neutral" style={{ textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Hãng: <strong>{mfrFilter}</strong>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setMfrFilter('all')} />
            </span>
          )}
          {searchQuery.trim() !== '' && (
            <span className="badge badge-neutral" style={{ textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Từ khóa: "{searchQuery}"
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
            </span>
          )}
          <button
            onClick={onResetFilters}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.15rem 0.45rem', fontSize: '0.72rem', color: 'var(--brand-600)' }}
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      {/* Printers Data Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Thiết bị &amp; Chủng loại</th>
              <th>Địa chỉ IP</th>
              <th>Trạng thái kết nối</th>
              <th>Giám sát SNMP</th>
              <th>Cảnh báo chẩn đoán</th>
              <th>Lần quét gần nhất</th>
              <th>Lần quét thành công</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPrinters.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <SearchX size={36} style={{ margin: '0 auto 0.75rem auto', color: 'var(--text-light)' }} />
                  {printers.length === 0 ? (
                    <>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                        Chưa có dữ liệu máy in từ hệ thống giám sát
                      </p>
                      <p style={{ fontSize: '0.78rem', margin: 0 }}>
                        Dữ liệu danh mục máy in sẽ hiển thị sau khi kết nối Backend API &amp; Zabbix Server.
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                        Không tìm thấy máy in phù hợp
                      </p>
                      <p style={{ fontSize: '0.78rem', margin: 0 }}>
                        Không có thiết bị nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại.
                      </p>
                      <button
                        onClick={onResetFilters}
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '0.75rem' }}
                      >
                        Xóa bộ lọc để xem toàn bộ {printers.length} máy in
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              paginatedPrinters.map(printer => {
                const isConnOnline = printer.connectionStatus === 'Online';
                const isConnOffline = printer.connectionStatus === 'Offline';
                const isConnUnknown = printer.connectionStatus === 'Unknown';

                return (
                  <tr
                    key={printer.id}
                    onClick={() => onOpenPrinterModal(printer)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Printer Name, ID, Device Type & Location */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {printer.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-muted)',
                            fontFamily: 'JetBrains Mono',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {printer.id}
                        </span>
                        {printer.isStale && (
                          <span className="badge badge-warning" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }} title="Hiển thị dữ liệu lưu tạm từ lần quét trước">
                            Dữ liệu tạm
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--brand-600)', fontWeight: 600 }}>{printer.deviceType}</span>
                        <span>•</span>
                        <span>{printer.mfr} {printer.model}</span>
                        <span>•</span>
                        <span>{printer.location}</span>
                      </div>
                    </td>

                    {/* IP */}
                    <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {printer.ip}
                    </td>

                    {/* Connection Status */}
                    <td>
                      {isConnOnline && (
                        <span className="badge badge-online">
                          <Wifi size={12} /> TRỰC TUYẾN
                        </span>
                      )}
                      {isConnOffline && (
                        <div>
                          <span className="badge badge-offline">
                            <WifiOff size={12} /> NGOẠI TUYẾN
                          </span>
                          {printer.downtimeDuration && printer.downtimeDuration !== '0m' && (
                            <div style={{ fontSize: '0.68rem', color: 'var(--status-offline)', fontFamily: 'JetBrains Mono', marginTop: '0.15rem' }}>
                              Gián đoạn: {printer.downtimeDuration}
                            </div>
                          )}
                        </div>
                      )}
                      {isConnUnknown && (
                        <span className="badge badge-neutral">
                          <HelpCircle size={12} /> CHƯA RÕ
                        </span>
                      )}
                    </td>

                    {/* Monitoring / Scrape Status */}
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'JetBrains Mono',
                          color: isConnOffline ? 'var(--status-offline)' : (isConnUnknown ? 'var(--text-muted)' : 'var(--text-secondary)')
                        }}
                      >
                        {printer.monitoringStatus}
                      </span>
                    </td>

                    {/* Diagnostic Alert */}
                    <td>
                      {isConnOffline ? (
                        <span className="badge badge-offline" style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
                          <AlertOctagon size={12} />
                          {printer.alertText || 'Mất kết nối máy chủ'}
                        </span>
                      ) : isConnUnknown ? (
                        <span className="badge badge-neutral" style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
                          <HelpCircle size={12} />
                          Không có dữ liệu
                        </span>
                      ) : printer.alertSeverity === 'critical' ? (
                        <span className="badge badge-offline" style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }} title={printer.alertText}>
                          <AlertOctagon size={12} />
                          {printer.diagnostic?.errorName || printer.alertText}
                        </span>
                      ) : printer.alertSeverity === 'warning' ? (
                        <span className="badge badge-warning" style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }} title={printer.alertText}>
                          <AlertTriangle size={12} />
                          {printer.diagnostic?.errorName || printer.alertText}
                        </span>
                      ) : (
                        <span className="badge badge-online" style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
                          <CheckCircle2 size={12} />
                          Bình thường
                        </span>
                      )}
                    </td>

                    {/* Last Scrape Attempt */}
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: isConnOffline ? 'var(--status-offline)' : 'var(--text-muted)' }}>
                      {formatDateTime(printer.lastScrape)}
                    </td>

                    {/* Last Successful Scrape */}
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                      {formatDateTime(printer.lastSuccessfulScrape)}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPrinterModal(printer);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{
                          backgroundColor: 'var(--brand-50)',
                          borderColor: 'var(--brand-100)',
                          color: 'var(--brand-600)',
                          fontWeight: 600
                        }}
                        title={`Xem chi tiết chẩn đoán cho ${printer.name}`}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.5rem 0.25rem'
        }}
      >
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{filteredPrinters.length > 0 ? startIndex + 1 : 0}</strong> - <strong style={{ color: 'var(--text-primary)' }}>{Math.min(startIndex + pageSize, filteredPrinters.length)}</strong> trên tổng số <strong style={{ color: 'var(--brand-600)' }}>{filteredPrinters.length}</strong> máy in
        </span>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.6rem' }}
            >
              <ChevronLeft size={14} /> Trước
            </button>
            <span style={{ fontSize: '0.75rem', padding: '0 0.5rem', fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
              Trang {safeCurrentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.6rem' }}
            >
              Sau <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
