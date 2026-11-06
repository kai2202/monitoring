/**
 * Frontend/src/features/printers/components/workorders/WorkOrderReassignModal.tsx
 *
 * Modal Điều Phối & Đổi Kỹ Thuật Viên Phụ Trách Lệnh Bảo Trì (Admin Only):
 * - Chọn kỹ thuật viên mới từ danh sách KTV hiện trường.
 * - Nhập lý do chuyển giao ca / điều phối khẩn cấp (lưu Audit Trail).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import { FontAwesomeIcon, faUserGear, faXmark, faCheck } from '../../../../shared/icons';
import { useAvailableTechnicians } from '../../../../shared/hooks/useAvailableTechnicians';
import { Task } from '../../../../types/task';
import { taskService } from '../../../../services';

export interface WorkOrderReassignModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onReassignSuccess?: (updatedTask: Task) => void;
}

export const WorkOrderReassignModal: React.FC<WorkOrderReassignModalProps> = ({
  task,
  isOpen,
  onClose,
  onReassignSuccess,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    technicians,
    assigneeId: selectedTechId,
    assignee: newAssignee,
    setAssignee: setNewAssignee,
    selectTechnicianById,
  } = useAvailableTechnicians({ enabled: isOpen, excludeName: task?.assignee });
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignee.trim()) {
      setErrorMsg('Vui lòng chọn hoặc nhập tên kỹ thuật viên phụ trách.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Vui lòng nhập lý do điều phối kỹ thuật viên.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const updated = await taskService.reassignTask(task.id, {
        newAssignee: newAssignee.trim(),
        assigneeId: selectedTechId || undefined,
        reason: reason.trim(),
        author: user?.fullName || (user as any)?.name || 'Quản trị viên (Admin)',
      });
      if (onReassignSuccess) onReassignSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi khi điều phối công việc.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: 'var(--bg-card, #ffffff)', borderRadius: '24px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '500px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faUserGear} style={{ fontSize: '15px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #0f172a)' }}>Điều Phối Kỹ Thuật Viên</h2>
                <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", backgroundColor: 'var(--bg-subtle, #f1f5f9)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted, #64748b)' }}>{task.id}</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', margin: 0 }}>Gán lại người phụ trách lệnh bảo dưỡng / sửa chữa</p>
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

          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
            <div><strong style={{ color: 'var(--text-primary, #0f172a)' }}>Lệnh bảo trì:</strong> {task.title}</div>
            <div style={{ color: 'var(--text-muted, #64748b)' }}><strong>Thiết bị:</strong> {task.printerName} • <strong>Hiện tại gán cho:</strong> <span style={{ color: '#d97706', fontWeight: 600 }}>{task.assignee}</span></div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Chọn Kỹ thuật viên mới *</label>
            {technicians.length > 0 ? (
              <select
                value={selectedTechId}
                onChange={(e) => selectTechnicianById(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-card, #ffffff)' }}
              >
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id} disabled={tech.name === task.assignee}>
                    {tech.name} ({tech.branchScope.join(', ')}) {tech.name === task.assignee ? '- (Hiện tại)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Nhập họ tên kỹ thuật viên tiếp nhận..."
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-card, #ffffff)' }}
              />
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Lý do điều phối / chuyển ca *</label>
            <textarea
              rows={3}
              placeholder="vd: KTV bận xử lý ca khẩn cấp ở tầng 2, chuyển giao cho KTV phụ trách khu vực..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', paddingTop: '12px', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', backgroundColor: 'transparent', color: 'var(--text-secondary, #475569)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '12.5px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FontAwesomeIcon icon={faCheck} />
              <span>{isSubmitting ? 'Đang điều phối...' : 'Xác nhận điều phối'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkOrderReassignModal;

