import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon, faXmark, faPlus, faScaleBalanced } from '../../../../shared/icons';
import { ComparisonDeviceKPIs } from '../../../../types/analyticsUI';
import { MOCK_PRINTER_DEFINITIONS } from '../../../../mocks/mockAnalyticsUIData';

export interface ComparisonDevicePickerProps {
  devicesKPIs: ComparisonDeviceKPIs[];
  selectedPrinterIds: string[];
  onAddPrinter: (id: string) => void;
  onRemovePrinter: (id: string) => void;
  onClose: () => void;
}

export const ComparisonDevicePicker: React.FC<ComparisonDevicePickerProps> = ({
  devicesKPIs,
  selectedPrinterIds,
  onAddPrinter,
  onRemovePrinter,
  onClose,
}) => {
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const availablePrinters = useMemo(() => {
    return MOCK_PRINTER_DEFINITIONS.filter(
      (p) =>
        !selectedPrinterIds.includes(p.id) &&
        (p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          p.model.toLowerCase().includes(searchFilter.toLowerCase()) ||
          p.floorName.toLowerCase().includes(searchFilter.toLowerCase()))
    );
  }, [selectedPrinterIds, searchFilter]);

  return (
    <div
      style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              padding: '8px',
              borderRadius: '10px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FontAwesomeIcon icon={faScaleBalanced} style={{ fontSize: '18px' }} />
          </span>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              So sánh chi tiết thiết bị
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Đối chiếu chi tiết giữa {devicesKPIs.length} thiết bị được chọn
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '8px',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
          title="Đóng bảng so sánh"
        >
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: '18px' }} />
        </button>
      </div>

      {/* Dải Badges máy in đang chọn & Ô thêm máy in */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
        {devicesKPIs.map((d) => (
          <span
            key={d.printerId}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: 600,
              backgroundColor: `${d.color}15`,
              border: `1px solid ${d.color}40`,
              color: d.color,
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: d.color,
              }}
            />
            <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {d.printerName}
            </span>
            <span style={{ fontSize: '10px', opacity: 0.8 }}>({d.floor})</span>
            <button
              type="button"
              onClick={() => onRemovePrinter(d.printerId)}
              style={{
                padding: '2px',
                color: d.color,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                background: 'none',
                border: 'none',
              }}
              title="Xóa máy khỏi so sánh"
            >
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: '11px' }} />
            </button>
          </span>
        ))}

        {/* Nút thêm máy in vào modal */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsAddPickerOpen(!isAddPickerOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px dashed var(--border-color)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: '12px' }} />
            <span>Thêm thiết bị đối chiếu</span>
          </button>

          {isAddPickerOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 70 }}
                onClick={() => setIsAddPickerOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  marginTop: '8px',
                  width: '300px',
                  maxHeight: '280px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  boxShadow: 'var(--shadow-xl)',
                  padding: '8px',
                  zIndex: 75,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ padding: '6px', borderBottom: '1px solid var(--border-color)' }}>
                  <input
                    type="text"
                    placeholder="Tìm máy in theo tên, model..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      fontSize: '11.5px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 0', flex: 1 }}>
                  {availablePrinters.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      Không có thiết bị khả dụng
                    </div>
                  ) : (
                    availablePrinters.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onAddPrinter(p.id);
                          setIsAddPickerOpen(false);
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ overflow: 'hidden', paddingRight: '8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            {p.floorName} • {p.ppmNominal} PPM
                          </div>
                        </div>
                        <FontAwesomeIcon icon={faPlus} style={{ fontSize: '12px', color: '#0284c7' }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonDevicePicker;
