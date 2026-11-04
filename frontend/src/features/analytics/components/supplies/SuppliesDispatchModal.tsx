/**
 * Frontend/src/features/analytics/components/supplies/SuppliesDispatchModal.tsx
 *
 * Modal Shell Lập Phiếu Cấp Phát & Thay Thế Vật Tư:
 * - Backdrop, phím tắt Escape, Header, Success screen.
 * - Tích hợp SuppliesDispatchForm.
 * - Tuân thủ AGENTS.md Rule 7.1: FontAwesome duy nhất, < 300 LOC.
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon, faXmark, faWrench, faCircleCheck } from '../../../../shared/icons';
import { ConsumableAlertItem } from '../../../../types/analyticsUI';
import { SuppliesDispatchForm } from './SuppliesDispatchForm';

interface SuppliesDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertItem: ConsumableAlertItem | null;
  onConfirmDispatch: (payload: {
    alertItem: ConsumableAlertItem;
    priority: 'urgent' | 'normal';
    quantity: number;
    technician: string;
    notes: string;
  }) => void;
}

export const SuppliesDispatchModal: React.FC<SuppliesDispatchModalProps> = ({
  isOpen,
  onClose,
  alertItem,
  onConfirmDispatch,
}) => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (alertItem) {
      setIsSuccess(false);
    }
  }, [alertItem]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !alertItem) return null;

  const handleFormSubmit = (payload: {
    alertItem: ConsumableAlertItem;
    priority: 'urgent' | 'normal';
    quantity: number;
    technician: string;
    notes: string;
  }) => {
    onConfirmDispatch(payload);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color, #e2e8f0)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <FontAwesomeIcon icon={faWrench} style={{ fontSize: '16px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
                Lập Lệnh Cấp Phát &amp; Xuất Kho Vật Tư
              </h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0' }}>
                Phiếu điều phối vật tư thay thế chủ động
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #64748b)',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '16px' }} />
          </button>
        </div>

        {/* Content Form or Success */}
        {isSuccess ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '28px' }} />
            </div>
            <strong style={{ fontSize: '16px', color: 'var(--text-primary, #0f172a)' }}>
              Đã lập lệnh cấp phát thành công!
            </strong>
            <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: 0 }}>
              Thông tin đã được đồng bộ sang hệ thống Quản lý vật tư &amp; Lệnh bảo trì.
            </p>
          </div>
        ) : (
          <SuppliesDispatchForm
            alertItem={alertItem}
            onSubmit={handleFormSubmit}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  );
};
