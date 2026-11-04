/**
 * Frontend/src/features/dashboard/components/timeline/TimelineCreateTaskModal.tsx
 *
 * Modal Tạo Công Việc Mới trên Timeline:
 * - Chọn máy in đích, loại việc, hạn hoàn thành SLA.
 * - Sử dụng formatLocalDate chuẩn giờ địa phương, không bị lỗi lệch múi giờ UTC.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faXmark, faWrench } from '../../../../shared/icons';
import { Printer } from '../../../../types/printer';
import { Task, TaskPriority, TaskType } from '../../../../types/task';
import { formatLocalDate } from './timelineLanesHelper';

interface TimelineCreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  printers: Printer[];
  onCreateTask: (task: Partial<Task>) => void;
}

export const TimelineCreateTaskModal: React.FC<TimelineCreateTaskModalProps> = ({
  isOpen,
  onClose,
  printers,
  onCreateTask,
}) => {
  const [printerId, setPrinterId] = useState(printers[0]?.id || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('CORRECTIVE_REPAIR');
  const [priority, setPriority] = useState<TaskPriority>('P2_High');
  const [assignee, setAssignee] = useState('Kỹ sư NOC');
  const [dueDate, setDueDate] = useState(() => formatLocalDate(new Date()));
  const [desc, setDesc] = useState('');

  if (!isOpen) return null;

  const targetPrinter = printers.find((p) => p.id === printerId) || printers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetPrinter) return;

    const todayStr = formatLocalDate(new Date());

    onCreateTask({
      id: `task-${Date.now()}`,
      printerId: targetPrinter.id,
      printerName: targetPrinter.name,
      printerModel: targetPrinter.model,
      printerLocation: targetPrinter.location,
      title: title.trim(),
      taskType: type,
      type,
      priority,
      status: 'Planned',
      assignee,
      startDate: todayStr,
      dueDate: dueDate || todayStr,
      description: desc.trim(),
      progressPercent: 0,
      dynamicSteps: [
        { id: `s-${Date.now()}-1`, stepNumber: 1, title: 'Tiếp nhận & kiểm tra mã lỗi', status: 'Pending' },
        { id: `s-${Date.now()}-2`, stepNumber: 2, title: 'Khắc phục & thay thế phụ tùng', status: 'Pending' },
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
              Lập Kế Hoạch / Task Mới Trên Lịch Trình
            </strong>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '15px' }} />
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
              placeholder="Ví dụ: Thay trống từ Drum & bảo dưỡng định kỳ"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Phân loại việc:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                style={{ width: '100%', padding: '7px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)' }}
              >
                <option value="CORRECTIVE_REPAIR">Sửa chữa P1</option>
                <option value="PREVENTIVE_MAINTENANCE">Bảo trì phòng ngừa</option>
                <option value="SUPPLIES_REPLACEMENT">Cấp phát vật tư</option>
                <option value="ROUTINE_INSPECTION">Kiểm tra định kỳ</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Hạn SLA hoàn thành:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', background: 'none', fontSize: '12px', cursor: 'pointer' }}>Hủy</button>
            <button type="submit" style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Tạo task</button>
          </div>
        </form>
      </div>
    </div>
  );
};
