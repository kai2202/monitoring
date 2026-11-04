import React, { useState } from 'react';
import {
  FontAwesomeIcon,
  faMagnifyingGlass,
  faPlus,
  faXmark,
  faScaleBalanced,
} from '../../../../shared/icons';
import { AnalyticsTimeframe } from '../../../../types/analyticsUI';
import { MOCK_PRINTER_DEFINITIONS, MockFleetDeviceDefinition, findAnyFleetDevice } from '../../../../mocks/mockAnalyticsUIData';

interface AnalyticsBannerSearchPinsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pinnedPrinterIds: string[];
  onRemovePinnedPrinter: (id: string) => void;
  onAddPinnedPrinter: (id: string) => void;
  onOpenComparisonModal: () => void;
  timeframe: AnalyticsTimeframe;
  onTimeframeChange: (tf: AnalyticsTimeframe) => void;
}

export const AnalyticsBannerSearchPins: React.FC<AnalyticsBannerSearchPinsProps> = ({
  searchQuery,
  onSearchChange,
  pinnedPrinterIds,
  onRemovePinnedPrinter,
  onAddPinnedPrinter,
  onOpenComparisonModal,
  timeframe,
  onTimeframeChange,
}) => {
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);

  const pinnedPrinters = pinnedPrinterIds
    .map((id) => findAnyFleetDevice(id) || MOCK_PRINTER_DEFINITIONS.find((p) => p.id === id))
    .filter((p): p is MockFleetDeviceDefinition => Boolean(p));

  const availablePrinters = MOCK_PRINTER_DEFINITIONS.filter(
    (p) => !pinnedPrinterIds.includes(p.id)
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '14px 18px',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Ô Tìm Kiếm Nhanh */}
      <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        />
        <input
          type="text"
          placeholder="Tìm kiếm máy in, model, tầng, phòng ban..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '34px',
            paddingRight: '14px',
            paddingTop: '8px',
            paddingBottom: '8px',
            fontSize: '12.5px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Ghim so sánh pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Ghim so sánh:
        </span>

        {pinnedPrinters.length === 0 ? (
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Chưa ghim máy nào
          </span>
        ) : (
          pinnedPrinters.map((printer) => (
            <span
              key={printer.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                color: 'var(--brand-500, #0284c7)',
                fontSize: '11.5px',
                fontWeight: 600,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
              <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {printer.name}
              </span>
              <button
                type="button"
                onClick={() => onRemovePinnedPrinter(printer.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px',
                  borderRadius: '50%',
                  color: '#0284c7',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="Gỡ máy này"
              >
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: '10px' }} />
              </button>
            </span>
          ))
        )}

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsAddPickerOpen(!isAddPickerOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px dashed var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Thêm máy vào đối chiếu"
          >
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: '11px' }} />
            <span>Ghim máy</span>
          </button>

          {isAddPickerOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 30 }}
                onClick={() => setIsAddPickerOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '8px',
                  width: '280px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg, 0 10px 25px -5px rgba(0,0,0,0.1))',
                  padding: '6px 0',
                  zIndex: 40,
                }}
              >
                <div
                  style={{
                    padding: '6px 12px',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  Chọn máy in để ghim
                </div>
                {availablePrinters.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Đã ghim toàn bộ máy
                  </div>
                ) : (
                  availablePrinters.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onAddPinnedPrinter(p.id);
                        setIsAddPickerOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border-subtle)',
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
                          {p.floorName} • {p.model}
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faPlus} style={{ fontSize: '12px', color: '#0284c7' }} />
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {pinnedPrinterIds.length >= 2 && (
          <button
            type="button"
            onClick={onOpenComparisonModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '20px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            }}
          >
            <FontAwesomeIcon icon={faScaleBalanced} style={{ fontSize: '12px' }} />
            <span>So sánh ({pinnedPrinterIds.length})</span>
          </button>
        )}
      </div>

      {/* Chu kỳ pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '3px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
        {(['hourly', '7days', '30days'] as AnalyticsTimeframe[]).map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => onTimeframeChange(tf)}
            style={{
              padding: '5px 12px',
              fontSize: '11.5px',
              fontWeight: timeframe === tf ? 700 : 500,
              borderRadius: '8px',
              backgroundColor: timeframe === tf ? 'var(--bg-card)' : 'transparent',
              color: timeframe === tf ? 'var(--brand-500, #0284c7)' : 'var(--text-secondary)',
              border: 'none',
              boxShadow: timeframe === tf ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tf === 'hourly' ? 'Theo Giờ' : tf === '7days' ? '7 Ngày' : '30 Ngày'}
          </button>
        ))}
      </div>
    </div>
  );
};
