/**
 * Frontend/src/features/dashboard/components/timeline/TimelineCreateTaskModal.tsx
 *
 * Modal Tạo Công Việc Mới trên Timeline:
 * - Tái sử dụng DiagnosticsSopChecklistBuilder để giữ file gọn nhẹ (< 250 LOC).
 * - Nạp danh sách Kỹ thuật viên thực tế từ CSDL qua settingsService.getTechnicians().
 * - Sử dụng formatLocalDate chuẩn giờ địa phương, không bị lỗi lệch múi giờ UTC.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import { FontAwesomeIcon, faXmark, faWrench, faCheck, faFlag, faCalendar, faPrint, faUser } from '../../../../shared/icons';
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

export const TimelineCreateTaskModal: React.FC<TimelineCreateTaskModalProps> = ({
  isOpen,
  onClose,
  printers,
  onCreateTask,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [printerId, setPrinterId] = useState(printers[0]?.id || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('CORRECTIVE_REPAIR');
  const [priority, setPriority] = useState<TaskPriority>('P2_High');
  const { technicians, assigneeId, assignee, setAssignee, selectTechnicianById } =
    useAvailableTechnicians({ enabled: isOpen, fallbackName: user?.fullName || '' });
  const [dueDate, setDueDate] = useState(() => formatLocalDate(new Date()));
  const [desc, setDesc] = useState('');
  const [sopSteps, setSopSteps] = useState<string[]>([
    'Tiếp nhận & đối chiếu mã lỗi thiết bị',
    'Khắc phục sự cố & thay thế linh kiện',
  ]);

  useEffect(() => {
    if (isOpen && !printerId && printers[0]?.id) setPrinterId(printers[0].id);
  }, [isOpen, printerId, printers]);

  if (!isOpen) return null;

  const targetPrinter = printers.find((p) => p.id === printerId) || printers[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetPrinter) return;

    const todayStr = formatLocalDate(new Date());

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
      startDate: todayStr,
      dueDate: dueDate || todayStr,
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
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <FontAwesomeIcon icon={faWrench} className="text-base" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Lập Kế Hoạch / Task Mới Trên Lịch Trình
              </h3>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                Khởi tạo công việc điều độ kỹ thuật và phân bổ thời gian SLA
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4">
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
              <FontAwesomeIcon icon={faPrint} className="text-indigo-600 dark:text-indigo-400 text-[10px]" />
              Thiết Bị Mục Tiêu *
            </label>
            <select
              value={printerId}
              onChange={(e) => setPrinterId(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none mt-0.5 cursor-pointer"
            >
              {printers.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900">
                  {p.name} ({p.model} - {p.location})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
              Tiêu Đề Công Việc *
            </label>
            <input
              type="text"
              placeholder="VD: Thay trống từ Drum & bảo dưỡng định kỳ"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none mt-0.5 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Phân Loại Công Việc
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none mt-0.5 cursor-pointer"
              >
                <option value="CORRECTIVE_REPAIR" className="bg-white dark:bg-slate-900">Sửa chữa đột xuất</option>
                <option value="PREVENTIVE_MAINTENANCE" className="bg-white dark:bg-slate-900">Bảo trì phòng ngừa</option>
                <option value="SUPPLY_REPLENISHMENT" className="bg-white dark:bg-slate-900">Cấp phát vật tư</option>
                <option value="HARDWARE_INSPECTION" className="bg-white dark:bg-slate-900">Kiểm tra định kỳ</option>
              </select>
            </div>

            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
                <FontAwesomeIcon icon={faFlag} className="text-amber-500 text-[10px]" />
                Mức Ưu Tiên (SLA)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none mt-0.5 cursor-pointer"
              >
                <option value="P1_Urgent" className="bg-white dark:bg-slate-900">🚩 P1 - Nguy cấp</option>
                <option value="P2_High" className="bg-white dark:bg-slate-900">🚩 P2 - Cao</option>
                <option value="P3_Medium" className="bg-white dark:bg-slate-900">🚩 P3 - Trung bình</option>
                <option value="P4_Low" className="bg-white dark:bg-slate-900">🚩 P4 - Thấp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
                <FontAwesomeIcon icon={faUser} className="text-slate-400 text-[10px]" />
                Kỹ Thuật Viên Phụ Trách
              </label>
              {technicians.length > 0 ? (
                <select
                  value={assigneeId}
                  onChange={(e) => selectTechnicianById(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none mt-0.5 cursor-pointer"
                >
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id} className="bg-white dark:bg-slate-900">
                      {tech.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none mt-0.5"
                />
              )}
            </div>

            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCalendar} className="text-indigo-600 dark:text-indigo-400 text-[10px]" />
                Hạn Hoàn Thành
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none mt-0.5"
              />
            </div>
          </div>

          <DiagnosticsSopChecklistBuilder
            sopSteps={sopSteps}
            onAddStep={(s) => setSopSteps((prev) => [...prev, s])}
            onRemoveStep={(idx) => setSopSteps((prev) => prev.filter((_, i) => i !== idx))}
          />

          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
              Ghi Chú Kế Hoạch
            </label>
            <textarea
              rows={2}
              placeholder="Chi tiết công việc dự kiến..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none mt-1 resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>Xác nhận tạo task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimelineCreateTaskModal;
