import React from 'react';
import { Printer, MetricValue } from '../../types/printer';

interface SuppliesTableProps {
  printers: Printer[];
  filteredPrinters: Printer[];
  onOpenPrinterModal: (printer: Printer) => void;
  onResetFilters: () => void;
}

const SupplyCell: React.FC<{
  val: MetricValue;
  baseColor: string;
  isWaste?: boolean;
}> = ({ val, baseColor, isWaste = false }) => {
  if (val === null) {
    return (
      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }} title="Không có dữ liệu OID hoặc máy ngoại tuyến">
        Không có dữ liệu
      </span>
    );
  }

  const num = val;

  if (isWaste) {
    const isWasteCritical = num >= 85 || num === 100;
    const isWasteWarning = num >= 70 && num < 85;
    const barFill = isWasteCritical ? '#ef4444' : (isWasteWarning ? '#f59e0b' : baseColor);

    return (
      <div style={{ width: '90px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontFamily: 'JetBrains Mono', marginBottom: '0.2rem' }}>
          <span style={{ fontWeight: 700, color: isWasteCritical ? 'var(--status-offline)' : 'var(--text-primary)' }}>
            {num}%
          </span>
          {isWasteCritical && (
            <span style={{ fontSize: '0.62rem', color: 'var(--status-offline)', fontWeight: 700 }}>
              Đầy
            </span>
          )}
        </div>
        <div className="progress-track" style={{ height: '0.45rem' }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(100, num)}%`,
              backgroundColor: barFill
            }}
          />
        </div>
      </div>
    );
  }

  const isCritical = num < 15;
  const isWarning = num >= 15 && num < 25;
  const barFill = isCritical ? '#ef4444' : (isWarning ? '#f59e0b' : baseColor);

  return (
    <div style={{ width: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontFamily: 'JetBrains Mono', marginBottom: '0.2rem' }}>
        <span style={{ fontWeight: 700, color: isCritical ? 'var(--status-offline)' : 'var(--text-primary)' }}>
          {num}%
        </span>
        {isCritical && (
          <span style={{ fontSize: '0.62rem', color: 'var(--status-offline)', fontWeight: 700 }}>
            Gần hết
          </span>
        )}
      </div>
      <div className="progress-track" style={{ height: '0.45rem' }}>
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(100, num)}%`,
            backgroundColor: barFill
          }}
        />
      </div>
    </div>
  );
};

export const SuppliesTable: React.FC<SuppliesTableProps> = ({
  printers,
  filteredPrinters,
  onOpenPrinterModal,
  onResetFilters
}) => {
  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Máy In & Chủng Loại</th>
            <th>Hãng & Model</th>
            <th>Mực Đen (K)</th>
            <th>Mực Xanh (C)</th>
            <th>Mực Đỏ (M)</th>
            <th>Mực Vàng (Y)</th>
            <th>Hộp Mực Thải</th>
            <th>Cập nhật gần nhất</th>
            <th style={{ textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredPrinters.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                {printers.length === 0 ? (
                  <>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Chưa có dữ liệu vật tư máy in từ hệ thống giám sát
                    </p>
                    <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
                      Dữ liệu mức mực và hộp thải sẽ hiển thị sau khi kết nối Backend API & Zabbix Server.
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Không có bản ghi vật tư phù hợp
                    </p>
                    <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
                      Hãy kiểm tra lại từ khóa tìm kiếm hoặc bộ lọc trạng thái / loại thiết bị.
                    </p>
                    <button
                      onClick={onResetFilters}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '0.75rem' }}
                    >
                      Xem lại toàn bộ vật tư
                    </button>
                  </>
                )}
              </td>
            </tr>
          ) : (
            filteredPrinters.map(printer => (
              <tr
                key={printer.id}
                onClick={() => onOpenPrinterModal(printer)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                      {printer.name}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                      {printer.id}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginTop: '0.1rem' }}>
                    <span style={{ color: 'var(--brand-600)', fontWeight: 600 }}>{printer.deviceType}</span> • {printer.ip}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{printer.mfr}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {printer.model}
                  </div>
                </td>
                <td><SupplyCell val={printer.supplies.black} baseColor="#334155" /></td>
                <td><SupplyCell val={printer.supplies.cyan} baseColor="#0ea5e9" /></td>
                <td><SupplyCell val={printer.supplies.magenta} baseColor="#ec4899" /></td>
                <td><SupplyCell val={printer.supplies.yellow} baseColor="#eab308" /></td>
                <td><SupplyCell val={printer.supplies.waste} baseColor="#8b5cf6" isWaste /></td>
                <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: printer.isStale ? 'var(--status-warning)' : 'var(--text-muted)' }}>
                  {printer.suppliesUpdated}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPrinterModal(printer);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem' }}
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
