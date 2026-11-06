import React, { useState, useMemo, useEffect } from 'react';
import {
  FontAwesomeIcon,
  faSliders,
  faMagnifyingGlass,
  faCheck,
  faXmark,
  faScaleBalanced,
} from '../../../../shared/icons';
export interface LineChartPrinterItem {
  id: string;
  name: string;
  model: string;
  floorId?: string;
  floorName?: string;
  department?: string;
}

interface LineChartFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  floorLabel: string;
  floorPrintersPool: LineChartPrinterItem[];
  selectedPrinterIds: string[];
  onTogglePrinter: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onPinPrinter?: (id: string) => void;
}

export const LineChartFilterModal: React.FC<LineChartFilterModalProps> = ({
  isOpen,
  onClose,
  floorLabel,
  floorPrintersPool,
  selectedPrinterIds,
  onTogglePrinter,
  onSelectAll,
  onDeselectAll,
  onPinPrinter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredPrinters = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return floorPrintersPool;
    return floorPrintersPool.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.floorName.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q)
    );
  }, [searchTerm, floorPrintersPool]);

  if (!isOpen) return null;

  const activeCount = floorPrintersPool.filter((p) => selectedPrinterIds.includes(p.id)).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faSliders} style={{ fontSize: '16px', color: '#6366f1' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Lọc Thiết Bị — {floorLabel}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Phạm vi: {floorPrintersPool.length} thiết bị
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '16px' }} />
          </button>
        </div>

        {/* Modal Controls: Search & Batch Select */}
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}>
          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '12px' }}
            />
            <input
              type="text"
              placeholder="Tìm theo tên máy, model, vị trí tầng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '12.5px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onSelectAll}
              style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              Chọn tất cả ({floorPrintersPool.length})
            </button>
            <button
              type="button"
              onClick={onDeselectAll}
              style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              Bỏ chọn
            </button>
          </div>
        </div>

        {/* Danh Sách Máy In */}
        <div style={{ padding: '12px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {filteredPrinters.map((p) => {
            const isChecked = selectedPrinterIds.includes(p.id);

            return (
              <div
                key={p.id}
                onClick={() => onTogglePrinter(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-subtle)',
                  border: isChecked ? '1px solid #6366f1' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      backgroundColor: isChecked ? '#6366f1' : 'var(--bg-card)',
                      border: isChecked ? '1px solid #6366f1' : '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    {isChecked && <FontAwesomeIcon icon={faCheck} style={{ fontSize: '10px' }} />}
                  </div>

                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {p.floorName} • {p.department} • {p.model}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)' }}>
                    {p.ppmNominal} PPM
                  </span>
                  {onPinPrinter && (
                    <button
                      type="button"
                      title="Ghim thiết bị này vào đối chiếu so sánh"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPinPrinter(p.id);
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        color: '#2563eb',
                        border: '1px solid rgba(37, 99, 235, 0.25)',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <FontAwesomeIcon icon={faScaleBalanced} style={{ fontSize: '10px' }} />
                      <span>Ghim</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Đang hiển thị: <strong>{activeCount}</strong> / {floorPrintersPool.length} máy ({floorLabel})
          </span>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
            }}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};
