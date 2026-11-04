/**
 * Frontend/src/features/dashboard/components/diagnostics/DiagnosticsCreateTaskForm.tsx
 *
 * Form Modal Tạo Nhiệm Vụ Mới cho Thiết Bị:
 * - Điền tiêu đề, mức ưu tiên (P1..P4), người phụ trách, hạn hoàn thành.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faXmark, faWrench } from '../../../../shared/icons';
import { Task, TaskPriority, TaskType } from '../../../../types/task';
import { Printer } from '../../../../types/printer';
import { formatLocalDate } from '../timeline/timelineLanesHelper';

interface DiagnosticsCreateTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  printer: Printer;
  onCreateTask: (task: Partial<Task>) => void;
}

export const DiagnosticsCreateTaskForm: React.FC<DiagnosticsCreateTaskFormProps> = ({
  isOpen,
  onClose,
  printer,
  onCreateTask,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('P2_High');
  const [type, setType] = useState<TaskType>('CORRECTIVE_REPAIR');
  const [assignee, setAssignee] = useState('Kỹ sư NOC');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    return formatLocalDate(new Date());
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateTask({
      id: `task-${Date.now()}`,
      printerId: printer.id,
      printerName: printer.name,
      printerModel: printer.model,
      printerLocation: printer.location,
      title: title.trim(),
      priority,
      type,
      status: 'Open',
      assignee,
      description: desc.trim(),
      dueDate,
      startDate: formatLocalDate(new Date()),
      progressPercent: 0,
      dynamicSteps: [
        { id: `s-${Date.now()}-1`, title: 'Kiểm tra ban đầu & đọc mã lỗi SNMP', status: 'Pending' },
        { id: `s-${Date.now()}-2`, title: 'Thực hiện bảo trì / thay thế linh kiện', status: 'Pending' },
        { id: `s-${Date.now()}-3`, title: 'In bản test kiểm tra chất lượng', status: 'Pending' },
      ],
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          author: assignee,
          avatarText: 'OP',
          timestamp: 'Vừa xong',
          type: 'creation',
          content: `Đã tạo công việc bảo trì cho máy ${printer.name}.`,
        },
      ],
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
            <FontAwesomeIcon icon={faWrench} style={{ fontSize: '14px', color: '#2563eb' }} />
            <strong style={{ fontSize: '14px', color: 'var(--text-primary, #0f172a)' }}>
              Tạo Lệnh Bảo Trì Mới ({printer.name})
            </strong>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '15px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Tiêu đề công việc:</label>
            <input
              type="text"
              placeholder="Ví dụ: Thay thế Toner Yellow & kiểm tra cụm sấy"
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
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Hạn hoàn thành (SLA):</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', boxSizing: 'border-box' }}
              />
            </div>
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

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Mô tả chi tiết:</label>
            <textarea
              rows={3}
              placeholder="Chi tiết hiện tượng và hướng xử lý..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', background: 'none', fontSize: '12px', cursor: 'pointer' }}>
              Hủy
            </button>
            <button type="submit" style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Xác nhận tạo việc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

