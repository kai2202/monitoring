/**
 * Frontend/src/features/operations/components/OperationsCreateTaskModal.tsx
 *
 * Modal Tạo Công Việc Vận Hành:
 * - Chọn máy in, loại việc, mức ưu tiên, mô tả.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { X, Wrench } from 'lucide-react';
import { Printer } from '../../../../types/printer';
import { TaskPriority, TaskType } from '../../../../types/task';

interface OperationsCreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  printers: Printer[];
  selectedPrinterId?: string;
  onConfirm: (payload: {
    printerId: string;
    title: string;
    type: TaskType;
    priority: TaskPriority;
    assignee: string;
    description: string;
  }) => void;
}

export const OperationsCreateTaskModal: React.FC<OperationsCreateTaskModalProps> = ({
  isOpen,
  onClose,
  printers,
  selectedPrinterId: initialPrinterId = '',
  onConfirm,
}) => {
  const [printerId, setPrinterId] = useState(initialPrinterId || printers[0]?.id || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('CORRECTIVE_REPAIR');
  const [priority, setPriority] = useState<TaskPriority>('P2_High');
  const [assignee, setAssignee] = useState('Kỹ thuật viên Trực ban');
  const [desc, setDesc] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onConfirm({
      printerId: printerId || printers[0]?.id || 'PRN-001',
      title: title.trim(),
      type,
      priority,
      assignee,
      description: desc.trim(),
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 10000,
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
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color, #e2e8f0)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-subtle, #f8fafc)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={16} color="#2563eb" />
            <strong style={{ fontSize: '14px', color: 'var(--text-primary, #0f172a)' }}>
              Tạo Công Việc Bảo Trì / Sửa Chữa Mới
            </strong>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Thiết bị mục tiêu:</label>
            <select
              value={printerId}
              onChange={(e) => setPrinterId(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)' }}
            >
              {printers.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.model} - {p.location})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Tiêu đề công việc:</label>
            <input
              type="text"
              placeholder="Ví dụ: Khắc phục lỗi kẹt giấy & vệ sinh khay cuốn"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Mức ưu tiên:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)' }}
              >
                <option value="P1_Critical">P1 - Nguy cấp</option>
                <option value="P2_High">P2 - Cao</option>
                <option value="P3_Medium">P3 - Trung bình</option>
                <option value="P4_Low">P4 - Thấp</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Người phụ trách:</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Mô tả chi tiết:</label>
            <textarea
              rows={3}
              placeholder="Mô tả hiện tượng và ghi chú xử lý..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', background: 'none', fontSize: '12px', cursor: 'pointer' }}>Hủy</button>
            <button type="submit" style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Tạo công việc</button>
          </div>
        </form>
      </div>
    </div>
  );
};

