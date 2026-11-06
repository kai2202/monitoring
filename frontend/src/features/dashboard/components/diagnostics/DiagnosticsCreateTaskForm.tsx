/**
 * Frontend/src/features/dashboard/components/diagnostics/DiagnosticsCreateTaskForm.tsx
 *
 * Form Modal Tạo Nhiệm Vụ Mới cho Thiết Bị:
 * - Áp dụng thiết kế Dynamic SOP Builder (Image 1) và Nested Labels (Image 4).
 * - Tích hợp Động cơ Tái sử dụng Tri thức Lịch sử (Knowledge Reuse Engine).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../../../../app/store';
import { FontAwesomeIcon, faXmark, faWrench, faCheck, faFlag, faCalendar, faUser } from '../../../../shared/icons';
import { useAvailableTechnicians } from '../../../../shared/hooks/useAvailableTechnicians';
import { Task, TaskPriority, TaskType } from '../../../../types/task';
import { Printer } from '../../../../types/printer';
import { formatLocalDate } from '../timeline/timelineLanesHelper';
import { incidentService } from '../../../../services/incidentService';
import { DiagnosticsSopChecklistBuilder } from './DiagnosticsSopChecklistBuilder';

interface DiagnosticsCreateTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  printer: Printer;
  onCreateTask: (task: Partial<Task>) => void | Promise<void>;
}

export const DiagnosticsCreateTaskForm: React.FC<DiagnosticsCreateTaskFormProps> = ({
  isOpen,
  onClose,
  printer,
  onCreateTask,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('P2_High');
  const [type, setType] = useState<TaskType>('CORRECTIVE_REPAIR');
  const { technicians, assigneeId, assignee, setAssignee, selectTechnicianById } =
    useAvailableTechnicians({ enabled: isOpen, fallbackName: user?.fullName || '' });
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState(() => formatLocalDate(new Date()));
  const [sopSteps, setSopSteps] = useState<string[]>([
    'Kiểm tra hiện trường & đọc mã lỗi SNMP',
    'Thực hiện bảo trì / thay thế linh kiện',
    'In bản test kiểm tra chất lượng & bàn giao',
  ]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);

  if (!isOpen) return null;

  // Xử lý nạp tri thức từ lịch sử sửa chữa
  const handleLoadKnowledge = async () => {
    setIsLoadingKnowledge(true);
    try {
      const code = printer.alertMessage?.split(' ')[0] || 'SC542';
      const rec = await incidentService.getKnowledgeReuse?.(code, printer.model);
      if (rec && rec.recommendedSopSteps?.length > 0) {
        setSopSteps(rec.recommendedSopSteps);
        if (rec.suggestedParts?.length > 0) {
          const partsNote = rec.suggestedParts
            .map((p) => `${p.partName} (${p.partCode})`)
            .join(', ');
          setDesc((prev) => (prev ? `${prev}\n• Phụ tùng đề xuất: ${partsNote}` : `• Phụ tùng đề xuất: ${partsNote}`));
        }
        if (!title.trim()) {
          setTitle(`Bảo dưỡng & khắc phục lỗi ${rec.errorCode} - ${printer.name}`);
        }
        toast.success(`Đã nạp ${rec.recommendedSopSteps.length} bước quy chuẩn từ tri thức lịch sử thành công`);
      } else {
        toast.info('Chưa có dữ liệu tri thức lịch sử cụ thể cho mã lỗi này');
      }
    } catch {
      toast.error('Không thể tra cứu tri thức lịch sử lúc này');
    } finally {
      setIsLoadingKnowledge(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onCreateTask({
      printerId: printer.id,
      printerName: printer.name,
      location: printer.location,
      title: title.trim(),
      priority,
      taskType: type,
      status: 'Planned',
      assigneeId: assigneeId || undefined,
      assignee: assignee.trim() || user?.fullName || 'Kỹ thuật viên NOC',
      description: desc.trim(),
      dueDate,
      startDate: formatLocalDate(new Date()),
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
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Tạo Phiếu Bảo Trì Mới
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {printer.id}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                Thiết bị: <strong className="text-slate-700 dark:text-slate-200">{printer.name}</strong> • {printer.location}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4">
          {/* Tiêu đề */}
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
              Tiêu Đề Công Việc Bảo Trì *
            </label>
            <input
              type="text"
              placeholder="VD: Thay thế cụm sấy nhiệt & kiểm tra sensor nhiệt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none mt-0.5 placeholder:text-slate-400"
            />
          </div>

          {/* Priority & Due Date (2-col grid) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
                <FontAwesomeIcon icon={faFlag} className="text-amber-500 text-[10px]" />
                Mức Độ Ưu Tiên (SLA)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none mt-0.5 cursor-pointer"
              >
                <option value="P1_Urgent" className="bg-white dark:bg-slate-900">🚩 P1 - Nguy cấp (&lt; 2h)</option>
                <option value="P2_High" className="bg-white dark:bg-slate-900">🚩 P2 - Cao (&lt; 8h)</option>
                <option value="P3_Medium" className="bg-white dark:bg-slate-900">🚩 P3 - Trung bình (&lt; 24h)</option>
                <option value="P4_Low" className="bg-white dark:bg-slate-900">🚩 P4 - Thấp (&lt; 48h)</option>
              </select>
            </div>

            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
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

          {/* Type & Assignee (2-col grid) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Phân Loại Công Việc
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none mt-0.5 cursor-pointer"
              >
                <option value="CORRECTIVE_REPAIR" className="bg-white dark:bg-slate-900">Sửa chữa đột xuất (P1/P2)</option>
                <option value="PREVENTIVE_MAINTENANCE" className="bg-white dark:bg-slate-900">Bảo trì phòng ngừa định kỳ</option>
                <option value="SUPPLY_REPLENISHMENT" className="bg-white dark:bg-slate-900">Thay thế vật tư &amp; Mực in</option>
                <option value="HARDWARE_INSPECTION" className="bg-white dark:bg-slate-900">Kiểm tra thông số kỹ thuật</option>
              </select>
            </div>

            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
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
          </div>

          {/* SOP Checklist Builder */}
          <DiagnosticsSopChecklistBuilder
            sopSteps={sopSteps}
            onAddStep={(step) => setSopSteps((prev) => [...prev, step])}
            onRemoveStep={(index) => setSopSteps((prev) => prev.filter((_, i) => i !== index))}
            onLoadKnowledgeReuse={handleLoadKnowledge}
            isLoadingKnowledge={isLoadingKnowledge}
          />

          {/* Detailed Description */}
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
              Ghi Chú Triệu Chứng &amp; Phương Án Khắc Phục
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú thêm thông tin hiện trường hoặc linh kiện cần mang theo..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none mt-1 resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>Xác nhận tạo việc</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiagnosticsCreateTaskForm;
