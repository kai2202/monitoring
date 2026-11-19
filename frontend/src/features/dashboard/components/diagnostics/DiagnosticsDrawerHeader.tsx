/**
 * Frontend/src/features/dashboard/components/diagnostics/DiagnosticsDrawerHeader.tsx
 *
 * Header cho PrinterDiagnosticsDrawer:
 * - Điều hướng lướt nhanh thiết bị (< >), IP copy, Model, Vị trí và Trạng thái.
 * - Menu Quản trị thiết bị tích hợp (DiagnosticsDrawerAdminMenu).
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
  faRotate,
  faUserCheck,
} from '../../../../shared/icons';
import { Printer } from '../../../../types/printer';

interface DiagnosticsDrawerHeaderProps {
  printer: Printer;
  onClose: () => void;
  onNextPrinter?: () => void;
  onPrevPrinter?: () => void;
  onReactivatePrinter?: (printer: Printer) => void;
  isAdmin?: boolean;
}

export const DiagnosticsDrawerHeader: React.FC<DiagnosticsDrawerHeaderProps> = ({
  printer,
  onClose,
  onNextPrinter,
  onPrevPrinter,
  onReactivatePrinter,
  isAdmin = false,
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
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        backgroundColor: 'var(--bg-card, #ffffff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
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
            {printer.custodianName && (
              <>
                <span>•</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '1px 8px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563eb',
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                  }}
                  title={printer.managingTeam ? `Đại diện phụ trách tài sản: ${printer.custodianName} (${printer.managingTeam})` : `Đại diện phụ trách tài sản: ${printer.custodianName}`}
                >
                  <FontAwesomeIcon icon={faUserCheck} style={{ fontSize: '10px' }} />
                  <span>{printer.custodianName}</span>
                  {printer.managingTeam && <span style={{ opacity: 0.75, fontWeight: 500 }}>• {printer.managingTeam}</span>}
                </span>
              </>
            )}
            {printer.monitoringStatus === 'Storage' && (
              <>
                <span>•</span>
                <span style={{ padding: '1px 6px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, backgroundColor: 'rgba(100, 116, 139, 0.15)', color: '#475569' }}>
                  Lưu kho
                </span>
                {isAdmin && onReactivatePrinter && (
                  <button
                    type="button"
                    onClick={() => onReactivatePrinter(printer)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(22, 163, 74, 0.1)',
                      color: '#16a34a',
                      border: '1px solid rgba(22, 163, 74, 0.3)',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Khôi phục giám sát thiết bị"
                  >
                    <FontAwesomeIcon icon={faRotate} style={{ fontSize: '9px' }} />
                    <span>Giám sát lại</span>
                  </button>
                )}
              </>
            )}
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
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
          }}
          title="Đóng (Esc)"
        >
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: '15px' }} />
        </button>
      </div>
    </div>
  );
};
