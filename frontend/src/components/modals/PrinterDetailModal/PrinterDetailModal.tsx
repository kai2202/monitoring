import React, { useEffect } from 'react';
import { Printer } from '../../../types/printer';
import { PrinterModalHeader } from './PrinterModalHeader';
import { PrinterDiagnosticBanner } from './PrinterDiagnosticBanner';
import { PrinterGeneralInfoSection } from './PrinterGeneralInfoSection';
import { PrinterHealthSection } from './PrinterHealthSection';
import { PrinterSuppliesSection } from './PrinterSuppliesSection';
import { PrinterCountersSection } from './PrinterCountersSection';
import { PrinterIncidentsSection } from './PrinterIncidentsSection';

export interface PrinterDetailModalProps {
  printer: Printer | null;
  onClose: () => void;
  onUpdateLocation?: (printerId: string, location: string) => void;
}

export const PrinterDetailModal: React.FC<PrinterDetailModalProps> = ({
  printer,
  onClose,
  onUpdateLocation
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!printer) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Sticky Header */}
        <PrinterModalHeader printer={printer} onClose={onClose} />

        {/* Modal Scrollable Body: 5 sections in sequence */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          {/* Stale & Active Diagnostic Banners */}
          <PrinterDiagnosticBanner printer={printer} />

          {/* Section 1: General Info */}
          <PrinterGeneralInfoSection printer={printer} onUpdateLocation={onUpdateLocation} />

          {/* Section 2: Health & Subsystems */}
          <PrinterHealthSection printer={printer} />

          {/* Section 3: Supplies */}
          <PrinterSuppliesSection printer={printer} />

          {/* Section 4: Lifetime Counters */}
          <PrinterCountersSection printer={printer} />

          {/* Section 5: Recent Incidents */}
          <PrinterIncidentsSection printer={printer} />
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-card)'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            Mã thiết bị: {printer.id} • Lần quét thành công gần nhất: {printer.lastSuccessfulScrape}
          </div>
          <button onClick={onClose} className="btn btn-secondary">
            Đóng cửa sổ (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
