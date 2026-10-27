import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Printer, DeviceType } from '../../types/printer';

interface AnalyticsTableProps {
  printers: Printer[];
  onOpenPrinterModal?: (printer: Printer) => void;
  isLight: boolean;
}

const AVAILABLE_DEVICE_TYPES: DeviceType[] = [
  'Color MFP',
  'Mono MFP',
  'Mono Laser',
  'Industrial Thermal',
  'Large Format Plotter'
];

export const AnalyticsTable: React.FC<AnalyticsTableProps> = ({
  printers,
  onOpenPrinterModal,
  isLight,
}) => {
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [tableDeviceTypeFilter, setTableDeviceTypeFilter] = useState<string>('all');
  const [tableSortField, setTableSortField] = useState<'rank' | 'name' | 'lifetime' | 'volume'>('volume');
  const [tableSortAsc, setTableSortAsc] = useState<boolean>(false);

  const handleSortToggle = (field: 'rank' | 'name' | 'lifetime' | 'volume') => {
    if (tableSortField === field) {
      setTableSortAsc(prev => !prev);
    } else {
      setTableSortField(field);
      setTableSortAsc(false);
    }
  };

  const filteredTablePrinters = useMemo(() => {
    const result = printers.filter(p => {
      const q = tableSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.ip.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.mfr.toLowerCase().includes(q);

      const matchType = tableDeviceTypeFilter === 'all' || p.deviceType === tableDeviceTypeFilter;

      return matchSearch && matchType;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (tableSortField === 'volume') {
        const volA = typeof a.thirtyDayVolume === 'number' ? a.thirtyDayVolume : -1;
        const volB = typeof b.thirtyDayVolume === 'number' ? b.thirtyDayVolume : -1;
        comparison = volB - volA;
      } else if (tableSortField === 'lifetime') {
        const lifeA = typeof a.counters.total === 'number' ? a.counters.total : -1;
        const lifeB = typeof b.counters.total === 'number' ? b.counters.total : -1;
        comparison = lifeB - lifeA;
      } else if (tableSortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (tableSortField === 'rank') {
        comparison = a.id.localeCompare(b.id);
      }

      if (comparison === 0) {
        comparison = a.id.localeCompare(b.id);
      }

      return tableSortAsc ? -comparison : comparison;
    });

    return result;
  }, [printers, tableSearchQuery, tableDeviceTypeFilter, tableSortField, tableSortAsc]);

  return (
    <div className="card" style={{ padding: '1.35rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Bảng Báo Cáo & Xếp Hạng Sản Lượng Chi Tiết
            </h3>
            <span className="badge badge-subtle" style={{ fontSize: '0.68rem' }}>
              {filteredTablePrinters.length} / {printers.length} máy in
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Kiểm toán sản lượng thiết bị: Bộ đếm vòng đời, sản lượng 30 ngày, phân rã MFP (In/Copy/Scan/Fax) và độ tin cậy telemetry.
          </p>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Tìm tên, ID, IP, model..."
              value={tableSearchQuery}
              onChange={e => setTableSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '2rem',
                paddingRight: '0.65rem',
                paddingTop: '0.35rem',
                paddingBottom: '0.35rem',
                fontSize: '0.75rem',
                height: '32px'
              }}
            />
          </div>

          <select
            value={tableDeviceTypeFilter}
            onChange={e => setTableDeviceTypeFilter(e.target.value)}
            className="form-select"
            style={{
              fontSize: '0.75rem',
              height: '32px',
              paddingTop: '0.2rem',
              paddingBottom: '0.2rem'
            }}
          >
            <option value="all">Tất cả loại thiết bị ({printers.length})</option>
            {AVAILABLE_DEVICE_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {(tableSearchQuery || tableDeviceTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setTableSearchQuery('');
                setTableDeviceTypeFilter('all');
              }}
              className="btn btn-secondary btn-sm"
              style={{ height: '32px', padding: '0 0.5rem', fontSize: '0.72rem', gap: '0.3rem' }}
              title="Xóa bộ lọc bảng"
            >
              <RotateCcw size={12} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="data-table-container" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <th
                onClick={() => handleSortToggle('rank')}
                style={{ width: '65px', padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span># STT</span>
                  <ArrowUpDown size={11} style={{ opacity: tableSortField === 'rank' ? 1 : 0.4 }} />
                </div>
              </th>
              <th
                onClick={() => handleSortToggle('name')}
                style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>Máy In / Địa Chỉ IP</span>
                  <ArrowUpDown size={11} style={{ opacity: tableSortField === 'name' ? 1 : 0.4 }} />
                </div>
              </th>
              <th style={{ padding: '0.85rem 1rem', borderBottom: '2px solid var(--border-color)' }}>Phân Loại Thiết Bị</th>
              <th
                onClick={() => handleSortToggle('lifetime')}
                style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none', textAlign: 'right', borderBottom: '2px solid var(--border-color)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                  <span>Bộ Đếm Vòng Đời</span>
                  <ArrowUpDown size={11} style={{ opacity: tableSortField === 'lifetime' ? 1 : 0.4 }} />
                </div>
              </th>
              <th
                onClick={() => handleSortToggle('volume')}
                style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none', textAlign: 'right', borderBottom: '2px solid var(--border-color)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                  <span>Sản Lượng 30 Ngày</span>
                  <ArrowUpDown size={11} style={{ opacity: tableSortField === 'volume' ? 1 : 0.4 }} />
                </div>
              </th>
              <th style={{ padding: '0.85rem 1rem', borderBottom: '2px solid var(--border-color)' }}>Phân Rã MFP (Copy / Scan / Fax)</th>
              <th style={{ padding: '0.85rem 1rem', borderBottom: '2px solid var(--border-color)' }}>Độ Tin Cậy Telemetry</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '100px', borderBottom: '2px solid var(--border-color)' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTablePrinters.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertCircle size={32} style={{ color: 'var(--text-muted)' }} />
                    {printers.length === 0 ? (
                      <>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Chưa có dữ liệu kiểm toán sản lượng máy in từ Zabbix API
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Dữ liệu bộ đếm phần cứng và sản lượng sẽ được đối soát tự động khi kết nối backend.
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Không tìm thấy máy in nào khớp với bộ lọc
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc loại thiết bị.
                        </div>
                        <button
                          onClick={() => {
                            setTableSearchQuery('');
                            setTableDeviceTypeFilter('all');
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.35rem', marginTop: '0.5rem' }}
                        >
                          <RotateCcw size={12} />
                          <span>Đặt lại bộ lọc</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTablePrinters.map((p, idx) => {
                const hasSubsystems =
                  typeof p.counters.copier === 'number' ||
                  typeof p.counters.scanner === 'number' ||
                  typeof p.counters.fax === 'number';

                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={p.id}
                    style={{
                      backgroundColor: isEven ? 'transparent' : (isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.02)'),
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* STT Column */}
                    <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '28px',
                          height: '24px',
                          padding: '0 0.35rem',
                          borderRadius: '6px',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: idx < 3 ? 'var(--brand-600)' : 'var(--bg-subtle)',
                          color: idx < 3 ? '#ffffff' : 'var(--text-secondary)',
                          border: idx < 3 ? 'none' : '1px solid var(--border-color)',
                          boxShadow: idx < 3 ? '0 2px 5px rgba(79, 70, 229, 0.25)' : 'none'
                        }}
                      >
                        #{idx + 1}
                      </span>
                    </td>

                    {/* Printer Identity */}
                    <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="badge badge-subtle" style={{ fontSize: '0.65rem' }}>{p.id}</span>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.82rem' }}>{p.name}</strong>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                          {p.ip} • {p.mfr} {p.model}
                        </div>
                      </div>
                    </td>

                    {/* Device Type */}
                    <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
                        <span className="badge badge-subtle" style={{ fontSize: '0.68rem' }}>
                          {p.deviceType}
                        </span>
                        {p.colorCapability === 'Color' ? (
                          <span className="badge badge-online" style={{ fontSize: '0.62rem' }}>Màu</span>
                        ) : (
                          <span className="badge badge-subtle" style={{ fontSize: '0.62rem' }}>Đơn sắc</span>
                        )}
                      </div>
                    </td>

                    {/* Lifetime Counter */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle' }}>
                      {typeof p.counters.total === 'number' ? (
                        <span style={{ fontWeight: 600 }}>{p.counters.total.toLocaleString()}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Không có dữ liệu</span>
                      )}
                    </td>

                    {/* 30-Day Volume */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontFamily: 'JetBrains Mono', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle' }}>
                      {typeof p.thirtyDayVolume === 'number' ? (
                        <strong style={{ color: 'var(--brand-600)', fontSize: '0.85rem' }}>
                          {p.thirtyDayVolume.toLocaleString()}
                        </strong>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }} title="Chưa có đủ chu kỳ đo đạc từ Zabbix">Đang tích lũy</span>
                      )}
                    </td>

                    {/* MFP Subsystem Breakdown */}
                    <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle' }}>
                      {hasSubsystems ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.7rem', fontFamily: 'JetBrains Mono' }}>
                          {typeof p.counters.copier === 'number' && (
                            <div>Copy: <strong>{p.counters.copier.toLocaleString()}</strong></div>
                          )}
                          {typeof p.counters.scanner === 'number' && (
                            <div>Scan: <strong>{p.counters.scanner.toLocaleString()}</strong></div>
                          )}
                          {typeof p.counters.fax === 'number' && (
                            <div>Fax: <strong>{p.counters.fax.toLocaleString()}</strong></div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>— (Đơn năng)</span>
                      )}
                    </td>

                    {/* Telemetry Status */}
                    <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle' }}>
                      {p.anomalyNote ? (
                        <span
                          className="badge badge-warning"
                          title={p.anomalyNote}
                          style={{ fontSize: '0.68rem', cursor: 'help' }}
                        >
                          Cảnh báo bộ đếm
                        </span>
                      ) : p.thirtyDayVolume === null ? (
                        <span
                          className="badge badge-unknown"
                          title="OID bộ đếm không được thiết bị báo cáo"
                          style={{ fontSize: '0.68rem', cursor: 'help' }}
                        >
                          Không hỗ trợ OID
                        </span>
                      ) : p.connectionStatus === 'Online' ? (
                        <span className="badge badge-online" style={{ fontSize: '0.68rem' }}>
                          <CheckCircle2 size={11} style={{ marginRight: '3px' }} />
                          Xác thực MIB
                        </span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                          Chưa có telemetry
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle' }}>
                      {onOpenPrinterModal && (
                        <button
                          onClick={() => onOpenPrinterModal(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', gap: '0.25rem' }}
                          title={`Xem chi tiết telemetry và cấu hình của ${p.name}`}
                        >
                          <span>Chi tiết</span>
                          <ExternalLink size={11} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
