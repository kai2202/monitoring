/**
 * Frontend/src/features/dashboard/components/diagnostics/DiagnosticsDrawerHeader.tsx
 *
 * Header cho PrinterDiagnosticsDrawer:
 * - Điều hướng lướt nhanh thiết bị (< >), IP copy, Model, Vị trí và Trạng thái.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import {
  FontAwesomeIcon,
  faPrint,
  faChevronLeft,
  faChevronRight,
  faCopy,
  faCheck,
  faXmark,
} from '../../../../shared/icons';
import { Printer } from '../../../../types/printer';

interface DiagnosticsDrawerHeaderProps {
  printer: Printer;
  onClose: () => void;
  onNextPrinter?: () => void;
  onPrevPrinter?: () => void;
}

export const DiagnosticsDrawerHeader: React.FC<DiagnosticsDrawerHeaderProps> = ({
  printer,
  onClose,
  onNextPrinter,
  onPrevPrinter,
}) => {
  const [copiedIp, setCopiedIp] = useState(false);

  const handleCopyIp = () => {
    navigator.clipboard?.writeText(printer.ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 1500);
  };

  const isOnline = printer.connectionStatus === 'Online';
  const isCritical = printer.alertSeverity === 'critical' || printer.health === 'Critical';

  return (
    <div
      style={{
        padding: '18px 24px',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        backgroundColor: 'var(--bg-card, #ffffff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Device Icon Avatar */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: isCritical
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(37, 99, 235, 0.1)',
            color: isCritical ? '#ef4444' : '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesomeIcon icon={faPrint} style={{ fontSize: '18px' }} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
              {printer.name}
            </h3>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isOnline ? '#16a34a' : '#ef4444',
              }}
              title={isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
            <span>{printer.model}</span>
            <span>•</span>
            <button
              type="button"
              onClick={handleCopyIp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--text-secondary, #475569)',
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
              }}
              title="Sao chép IP"
            >
              <span>{printer.ip}</span>
              {copiedIp ? (
                <FontAwesomeIcon icon={faCheck} style={{ fontSize: '11px', color: '#16a34a' }} />
              ) : (
                <FontAwesomeIcon icon={faCopy} style={{ fontSize: '11px' }} />
              )}
            </button>
            <span>•</span>
            <span>{printer.location}</span>
          </div>
        </div>
      </div>

      {/* Navigators & Close */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onPrevPrinter && (
          <button
            type="button"
            onClick={onPrevPrinter}
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-secondary, #475569)',
            }}
            title="Máy in trước"
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '12px' }} />
          </button>
        )}

        {onNextPrinter && (
          <button
            type="button"
            onClick={onNextPrinter}
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-secondary, #475569)',
            }}
            title="Máy in kế tiếp"
          >
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '12px' }} />
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '6px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text-muted, #64748b)',
          }}
          title="Đóng (Esc)"
        >
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: '16px' }} />
        </button>
      </div>
    </div>
  );
};

