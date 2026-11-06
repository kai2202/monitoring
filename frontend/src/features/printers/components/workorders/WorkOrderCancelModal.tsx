/**
 * Frontend/src/features/printers/components/workorders/WorkOrderCancelModal.tsx
 *
 * Modal Hủy Lệnh Bảo Trì & Đóng Cưỡng Bức (Admin Only):
 * - Hủy lệnh sai, trùng lặp hoặc khi sự cố tự khắc phục.
 * - Yêu cầu nhập lý do hủy bắt buộc để lưu vết Audit Trail.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import { FontAwesomeIcon, faBan, faXmark, faCheck } from '../../../../shared/icons';
import { Task } from '../../../../types/task';
import { taskService } from '../../../../services';

export interface WorkOrderCancelModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelSuccess?: (cancelledTask: Task) => void;
}

export const WorkOrderCancelModal: React.FC<WorkOrderCancelModalProps> = ({
  task,
  isOpen,
  onClose,
  onCancelSuccess,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Vui lòng nhập lý do hủy / đóng lệnh bảo trì.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const updated = await taskService.updateTaskStatus(task.id, {
        status: 'Cancelled',
        comment: `[ADMIN HỦY LỆNH]: ${reason.trim()}`,
        author: user?.name || 'Quản trị viên (Admin)',
      });
      if (onCancelSuccess) onCancelSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi xảy ra khi hủy lệnh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: 'var(--bg-card, #ffffff)', borderRadius: '24px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '480px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faBan} style={{ fontSize: '15px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #0f172a)' }}>Hủy Lệnh Bảo Trì</h2>
                <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", backgroundColor: 'var(--bg-subtle, #f1f5f9)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted, #64748b)' }}>{task.id}</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', margin: 0 }}>Đóng cưỡng bức và lưu vào kho lưu trữ kiểm toán</p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer', fontSize: '16px' }}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorMsg && (
            <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', fontSize: '12px' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
            <div><strong style={{ color: 'var(--text-primary, #0f172a)' }}>Nhiệm vụ:</strong> {task.title}</div>
            <div style={{ color: 'var(--text-muted, #64748b)' }}><strong>Thiết bị:</strong> {task.printerName} • <strong>Mã lỗi:</strong> {task.errorCode || 'Bảo dưỡng định kỳ'}</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Lý do hủy / đóng lệnh *</label>
            <textarea
              rows={3}
              placeholder="vd: Thiết bị tự khôi phục sau khi khởi động lại, lệnh bảo trì tạo nhầm..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', paddingTop: '12px', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', backgroundColor: 'transparent', color: 'var(--text-secondary, #475569)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
              Quay lại
            </button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '12.5px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FontAwesomeIcon icon={faBan} />
              <span>{isSubmitting ? 'Đang hủy...' : 'Xác nhận hủy lệnh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkOrderCancelModal;

