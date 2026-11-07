/**
 * Frontend/src/features/dashboard/components/workorder/ReworkReasonModal.tsx
 *
 * Hộp Thoại Nhập Lý Do Yêu Cầu Kỹ Thuật Viên Làm Lại (Admin Rework Reason Modal):
 * - Bắt buộc Admin ghi chú rõ nguyên nhân trả về (bản in mờ, sọc mực, linh kiện chưa khít...).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faRotate, faXmark, faTriangleExclamation } from '@/shared/icons';

interface ReworkReasonModalProps {
  isOpen: boolean;
  taskId: string;
  taskTitle: string;
  assigneeName?: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export const ReworkReasonModal: React.FC<ReworkReasonModalProps> = ({
  isOpen,
  taskId,
  taskTitle,
  assigneeName = 'Kỹ thuật viên phụ trách',
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do cụ thể để Kỹ thuật viên biết điểm cần khắc phục.');
      return;
    }
    onSubmit(reason.trim());
    setReason('');
    setError('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
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
          maxWidth: '480px',
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: '20px',
          padding: '22px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
                Yêu Cầu Làm Lại Nhiệm Vụ
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                Phiếu: <strong>{taskId}</strong> — Người nhận: <strong>{assigneeName}</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'var(--bg-subtle, #f1f5f9)',
              color: 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary, #475569)', margin: 0, lineHeight: 1.5 }}>
          Nhiệm vụ <em>&ldquo;{taskTitle}&rdquo;</em> sẽ được chuyển về trạng thái <strong>Đang xử lý</strong>. Thông báo kèm lý do bên dưới sẽ gửi trực tiếp đến chuông thông báo của Kỹ thuật viên.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', display: 'block', marginBottom: '5px' }}>
              Chi tiết yêu cầu &amp; điểm chưa đạt chuẩn:
            </label>
            <textarea
              rows={3}
              placeholder="Ví dụ: Bản in test còn sọc đen mép phải, cần vệ sinh lại cụm gương sấy và in kiểm tra lại..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              autoFocus
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '12px',
                borderRadius: '10px',
                border: error ? '1px solid #ef4444' : '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                color: 'var(--text-primary, #0f172a)',
                outline: 'none',
                resize: 'none',
              }}
            />
            {error && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '3px', display: 'block' }}>{error}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary, #475569)',
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#d97706',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)',
              }}
            >
              <FontAwesomeIcon icon={faRotate} />
              <span>Gửi Yêu Cầu Cho KTV</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

