/**
 * Frontend/src/features/dashboard/components/timeline/TimelineCreateTaskModal.tsx
 *
 * Modal Giao Việc Mới trên Lịch Trình (Timeline):
 * - Thiết kế form phẳng hiện đại (rounded-xl modal, rounded-lg inputs, footer cố định).
 * - Dùng custom chevron cho select (appearance-none pr-8) để mũi tên luôn căn chuẩn.
 * - Hỗ trợ đóng bằng phím Esc hoặc click ra ngoài backdrop.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import {
  FontAwesomeIcon,
  faXmark,
  faCalendarDays,
  faCheck,
  faPrint,
  faUser,
  faChevronDown,
} from '../../../../shared/icons';
import { Printer } from '../../../../types/printer';
import { Task, TaskPriority, TaskType } from '../../../../types/task';
import { useAvailableTechnicians } from '../../../../shared/hooks/useAvailableTechnicians';
import { DiagnosticsSopChecklistBuilder } from '../diagnostics/DiagnosticsSopChecklistBuilder';
import { formatLocalDate } from './timelineLanesHelper';

interface TimelineCreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  printers: Printer[];
  onCreateTask: (task: Partial<Task>) => void | Promise<void>;
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500';
const selectCls = `${inputCls} appearance-none pr-8 cursor-pointer`;
const labelCls = 'block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

const SelectChevron: React.FC = () => (
  <FontAwesomeIcon
    icon={faChevronDown}
    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"
  />
);

export const TimelineCreateTaskModal: React.FC<TimelineCreateTaskModalProps> = ({
  isOpen,
  onClose,
  printers,
  onCreateTask,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const selectablePrinters = useMemo(
    () => printers.filter((p) => p.monitoringStatus !== 'Decommissioned'),
    [printers]
  );

  const [printerId, setPrinterId] = useState(selectablePrinters[0]?.id || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('CORRECTIVE_REPAIR');
  const [priority, setPriority] = useState<TaskPriority>('P2_High');
  const { technicians, assigneeId, assignee, setAssignee, selectTechnicianById } =
    useAvailableTechnicians({ enabled: isOpen, fallbackName: user?.fullName || '' });
  const [startDate, setStartDate] = useState(() => formatLocalDate(new Date()));
  const [dueDate, setDueDate] = useState(() => formatLocalDate(new Date()));
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sopSteps, setSopSteps] = useState<string[]>([
    'Tiếp nhận & đối chiếu mã lỗi thiết bị',
    'Khắc phục sự cố & thay thế linh kiện',
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const todayStr = formatLocalDate(new Date());
    setPrinterId(selectablePrinters[0]?.id || '');
    setTitle('');
    setType('CORRECTIVE_REPAIR');
    setPriority('P2_High');
    setStartDate(todayStr);
    setDueDate(todayStr);
    setDesc('');
    setErrorMsg('');
    setIsSubmitting(false);
    setSopSteps(['Tiếp nhận & đối chiếu mã lỗi thiết bị', 'Khắc phục sự cố & thay thế linh kiện']);
  }, [isOpen, selectablePrinters]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const targetPrinter = selectablePrinters.find((p) => p.id === printerId) || selectablePrinters[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetPrinter) {
      setErrorMsg('Vui lòng chọn thiết bị và nhập tiêu đề công việc.');
      return;
    }
    const effectiveStart = startDate || formatLocalDate(new Date());
    const effectiveDue = dueDate || effectiveStart;
    if (effectiveDue < effectiveStart) {
      setErrorMsg('Hạn hoàn thành phải lớn hơn hoặc bằng ngày bắt đầu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onCreateTask({
        printerId: targetPrinter.id,
        printerName: targetPrinter.name,
        location: targetPrinter.location,
        title: title.trim(),
        taskType: type,
        priority,
        status: 'Planned',
        assigneeId: assigneeId || undefined,
        assignee: assignee.trim() || user?.fullName || 'Kỹ thuật viên NOC',
        startDate: effectiveStart,
        dueDate: effectiveDue,
        description: desc.trim(),
        progressPercent: 0,
        dynamicSteps: sopSteps.map((step, idx) => ({
          id: `s-${Date.now()}-${idx + 1}`,
          stepNumber: idx + 1,
          title: step,
          status: 'Pending',
        })),
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể tạo công việc mới.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      onClick={() => !isSubmitting && onClose()}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[99999] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faCalendarDays} className="text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">Giao Việc Mới</h3>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 m-0 mt-0.5">
                Lên lịch bảo trì hoặc sửa chữa cho thiết bị
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center bg-transparent border-none cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
          </button>
        </div>

        {/* Form Body + Sticky Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-5 overflow-y-auto flex flex-col gap-3.5 flex-1">
            {errorMsg && (
              <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className={labelCls}>
                <FontAwesomeIcon icon={faPrint} className="text-blue-600 mr-1.5 text-[11px]" />
                Thiết bị mục tiêu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select value={printerId} onChange={(e) => setPrinterId(e.target.value)} className={selectCls} style={{ borderRadius: '8px' }}>
                  {selectablePrinters.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.model} — {p.location})
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Tiêu đề công việc <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Thay trống từ Drum & bảo dưỡng định kỳ"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={inputCls}
                style={{ borderRadius: '8px' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Phân loại công việc</label>
                <div className="relative">
                  <select value={type} onChange={(e) => setType(e.target.value as TaskType)} className={selectCls} style={{ borderRadius: '8px' }}>
                    <option value="CORRECTIVE_REPAIR">Sửa chữa đột xuất</option>
                    <option value="PREVENTIVE_MAINTENANCE">Bảo trì phòng ngừa</option>
                    <option value="SUPPLY_REPLENISHMENT">Cấp phát vật tư</option>
                    <option value="HARDWARE_INSPECTION">Kiểm tra định kỳ</option>
                  </select>
                  <SelectChevron />
                </div>
              </div>

              <div>
                <label className={labelCls}>Mức ưu tiên (SLA)</label>
                <div className="relative">
                  <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={selectCls} style={{ borderRadius: '8px' }}>
                    <option value="P1_Urgent">P1 - Khẩn cấp</option>
                    <option value="P2_High">P2 - Cao</option>
                    <option value="P3_Medium">P3 - Trung bình</option>
                    <option value="P4_Low">P4 - Thấp</option>
                  </select>
                  <SelectChevron />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>
                  <FontAwesomeIcon icon={faUser} className="text-slate-400 mr-1.5 text-[11px]" />
                  Kỹ thuật viên
                </label>
                {technicians.length > 0 ? (
                  <div className="relative">
                    <select value={assigneeId} onChange={(e) => selectTechnicianById(e.target.value)} className={selectCls} style={{ borderRadius: '8px' }}>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                ) : (
                  <input type="text" value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inputCls} style={{ borderRadius: '8px' }} />
                )}
              </div>

              <div>
                <label className={labelCls}>Bắt đầu</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} style={{ borderRadius: '8px' }} />
              </div>

              <div>
                <label className={labelCls}>Hạn xong</label>
                <input type="date" value={dueDate} min={startDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} style={{ borderRadius: '8px' }} />
              </div>
            </div>

            <DiagnosticsSopChecklistBuilder
              sopSteps={sopSteps}
              onAddStep={(s) => setSopSteps((prev) => [...prev, s])}
              onRemoveStep={(idx) => setSopSteps((prev) => prev.filter((_, i) => i !== idx))}
            />

            <div>
              <label className={labelCls}>Ghi chú kế hoạch</label>
              <textarea
                rows={2}
                placeholder="Chi tiết công việc dự kiến..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className={`${inputCls} resize-none`}
                style={{ borderRadius: '8px' }}
              />
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !targetPrinter}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 border-none cursor-pointer"
            >
              <FontAwesomeIcon icon={faCheck} className="text-[11px]" />
              <span>{isSubmitting ? 'Đang tạo...' : 'Tạo công việc'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default TimelineCreateTaskModal;
