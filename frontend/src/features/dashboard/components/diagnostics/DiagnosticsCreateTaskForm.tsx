/**
 * Frontend/src/features/dashboard/components/diagnostics/DiagnosticsCreateTaskForm.tsx
 *
 * Form Modal Tạo Nhiệm Vụ Mới cho Thiết Bị:
 * - Áp dụng thiết kế Dynamic SOP Builder (Image 1) và Nested Labels (Image 4).
 * - Tích hợp Động cơ Tái sử dụng Tri thức Lịch sử (Knowledge Reuse Engine).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../../../../app/store';
import { FontAwesomeIcon, faXmark, faWrench, faCheck, faFlag, faCalendar, faUser, faBox, faPlus, faMinus, faMagnifyingGlass, faChevronDown } from '../../../../shared/icons';
import { useAvailableTechnicians } from '../../../../shared/hooks/useAvailableTechnicians';
import { useGetInventoryItemsQuery } from '../../../inventory/slices/inventoryApiSlice';
import { Task, TaskPriority, TaskType, TaskMaterialUsage } from '../../../../types/task';
import { Printer } from '../../../../types/printer';
import { formatLocalDate } from '../timeline/timelineLanesHelper';
import { incidentService } from '../../../../services/incidentService';
import { TASK_TYPE_CONFIGS, getTaskTypeMeta, formatSupplyShortLabel } from '../../utils/taskTypeConfig';
import { DiagnosticsSopChecklistBuilder } from './DiagnosticsSopChecklistBuilder';

interface DiagnosticsCreateTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  printer?: Printer;
  printers?: Printer[];
  onCreateTask: (task: Partial<Task>) => void | Promise<void>;
}

export const DiagnosticsCreateTaskForm: React.FC<DiagnosticsCreateTaskFormProps> = ({
  isOpen,
  onClose,
  printer,
  printers,
  onCreateTask,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>(() => printer?.id || printers?.[0]?.id || '');
  const activePrinter = printer || printers?.find((p) => p.id === selectedPrinterId) || printers?.[0];
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('P2_High');
  const [type, setType] = useState<TaskType>('CORRECTIVE_REPAIR');
  const { technicians, assigneeId, assignee, setAssignee, selectTechnicianById } =
    useAvailableTechnicians({ enabled: isOpen, fallbackName: user?.fullName || '' });
  const [desc, setDesc] = useState('');
  const [startDate, setStartDate] = useState(() => formatLocalDate(new Date()));
  const [dueDate, setDueDate] = useState(() => formatLocalDate(new Date()));
  const [sopSteps, setSopSteps] = useState<string[]>([
    'Kiểm tra hiện trường & đọc mã lỗi SNMP',
    'Thực hiện bảo trì / thay thế linh kiện',
    'In bản test kiểm tra chất lượng & bàn giao',
  ]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const { data: invResponse } = useGetInventoryItemsQuery(undefined, { skip: !isOpen });
  const inventoryItems = invResponse?.data || [];
  const [partSearch, setPartSearch] = useState('');
  const [plannedMaterials, setPlannedMaterials] = useState<TaskMaterialUsage[]>([]);

  if (!isOpen) return null;

  const activeMeta = getTaskTypeMeta(type);

  const handleSelectTaskType = (nextType: TaskType) => {
    setType(nextType);
    const meta = getTaskTypeMeta(nextType);
    setSopSteps(meta.defaultSopSteps);
  };

  const setItemPlannedQty = (item: (typeof inventoryItems)[number], nextQty: number) => {
    const qty = Math.max(0, nextQty);
    setPlannedMaterials((prev) => {
      if (qty === 0) return prev.filter((m) => m.inventoryItemId !== item.id);
      const exists = prev.some((m) => m.inventoryItemId === item.id);
      if (exists) {
        return prev.map((m) =>
          m.inventoryItemId === item.id ? { ...m, plannedQty: qty, actualUsedQty: qty } : m
        );
      }
      return [
        ...prev,
        {
          id: `mat-${Date.now()}-${item.id}`,
          inventoryItemId: item.id,
          itemName: item.name,
          sku: item.sku,
          unit: item.unit,
          plannedQty: qty,
          actualUsedQty: qty,
          defectiveQty: 0,
        },
      ];
    });
  };

  // Xử lý nạp tri thức từ lịch sử sửa chữa
  const handleLoadKnowledge = async () => {
    if (!activePrinter) return;
    setIsLoadingKnowledge(true);
    try {
      const code = activePrinter.alertText?.split(' ')[0] || 'SC542';
      const rec = await incidentService.getKnowledgeReuse?.(code, activePrinter.model);
      if (rec && rec.recommendedSopSteps?.length > 0) {
        setSopSteps(rec.recommendedSopSteps);
        if (rec.suggestedParts?.length > 0) {
          const partsNote = rec.suggestedParts
            .map((p) => `${p.partName} (${p.partCode})`)
            .join(', ');
          setDesc((prev) => (prev ? `${prev}\n• Phụ tùng đề xuất: ${partsNote}` : `• Phụ tùng đề xuất: ${partsNote}`));
        }
        if (!title.trim()) {
          setTitle(`Bảo dưỡng & khắc phục lỗi ${rec.errorCode} - ${activePrinter.name}`);
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
    if (!title.trim() || !activePrinter) return;

    await onCreateTask({
      printerId: activePrinter.id,
      printerName: activePrinter.name,
      location: activePrinter.location,
      title: title.trim(),
      priority,
      taskType: type,
      status: 'Planned',
      assigneeId: assigneeId || undefined,
      assignee: assignee.trim() || user?.fullName || 'Kỹ thuật viên NOC',
      description: desc.trim(),
      dueDate,
      startDate,
      progressPercent: 0,
      dynamicSteps: activeMeta.showSopOnCreate
        ? sopSteps.map((step, idx) => ({
            id: `s-${Date.now()}-${idx + 1}`,
            stepNumber: idx + 1,
            title: step,
            status: 'Pending' as const,
          }))
        : [],
      ...(activeMeta.showMaterialsOnCreate && plannedMaterials.length > 0 ? { plannedMaterials } : {}),
    });
    onClose();
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-slate-900/55 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl h-[680px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faWrench} className="text-sm" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Tạo Phiếu Bảo Trì Mới
                </h3>
                {printer && (
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {printer.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {printer ? (
                  <>
                    Thiết bị: <strong className="font-medium text-slate-700 dark:text-slate-200">{printer.name}</strong> • {printer.location}
                  </>
                ) : (
                  'Lên lịch bảo trì hoặc sửa chữa cho thiết bị'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Form Body & Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {!printer && printers && printers.length > 0 && (
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Thiết bị mục tiêu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={activePrinter?.id || ''}
                    onChange={(e) => setSelectedPrinterId(e.target.value)}
                    className="w-full appearance-none rounded-xl bg-slate-100/75 dark:bg-slate-800/60 pl-3 pr-8 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors cursor-pointer"
                  >
                    {printers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.model} — {p.location})
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* 1. Chọn Danh Mục Công Việc */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                Danh mục công việc <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TASK_TYPE_CONFIGS.map((cfg) => {
                  const isSel = type === cfg.type;
                  return (
                    <button
                      key={cfg.type}
                      type="button"
                      onClick={() => handleSelectTaskType(cfg.type)}
                      className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        isSel
                          ? cfg.activeCls
                          : 'bg-slate-100/75 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={cfg.icon}
                        style={{ color: isSel ? cfg.accentColor : '#64748b' }}
                        className="text-xs"
                      />
                      <span className="text-[11.5px] font-bold leading-tight">{cfg.label}</span>
                      <span className="text-[10px] opacity-75 leading-tight">{cfg.shortDesc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tiêu đề */}
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Tiêu đề công việc <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={activeMeta.titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-100/75 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              />
            </div>

            {/* Priority, Assignee, Start Date & Due Date (2x2 grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faFlag} className="text-amber-500 text-[11px]" />
                  <span>Ưu tiên (SLA)</span>
                </label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full appearance-none rounded-xl bg-slate-100/75 dark:bg-slate-800/60 pl-3 pr-8 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors cursor-pointer"
                  >
                    <option value="P1_Urgent">P1 - Nguy cấp (&lt; 2h)</option>
                    <option value="P2_High">P2 - Cao (&lt; 8h)</option>
                    <option value="P3_Medium">P3 - Trung bình (&lt; 24h)</option>
                    <option value="P4_Low">P4 - Thấp (&lt; 48h)</option>
                  </select>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faUser} className="text-slate-400 text-[11px]" />
                  <span>Kỹ thuật viên</span>
                </label>
                {technicians.length > 0 ? (
                  <div className="relative">
                    <select
                      value={assigneeId}
                      onChange={(e) => selectTechnicianById(e.target.value)}
                      className="w-full appearance-none rounded-xl bg-slate-100/75 dark:bg-slate-800/60 pl-3 pr-8 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors cursor-pointer"
                    >
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name}
                        </option>
                      ))}
                    </select>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/75 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCalendar} className="text-indigo-500 dark:text-indigo-400 text-[11px]" />
                  <span>Bắt đầu</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/75 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCalendar} className="text-indigo-500 dark:text-indigo-400 text-[11px]" />
                  <span>Hạn hoàn thành</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/75 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                />
              </div>
            </div>

            {/* SOP Checklist Builder (Ẩn khi Thay thế vật tư / Kiểm tra hiện trường) */}
            {activeMeta.showSopOnCreate && (
              <DiagnosticsSopChecklistBuilder
                sopSteps={sopSteps}
                onAddStep={(step) => setSopSteps((prev) => [...prev, step])}
                onRemoveStep={(index) => setSopSteps((prev) => prev.filter((_, i) => i !== index))}
                onLoadKnowledgeReuse={handleLoadKnowledge}
                isLoadingKnowledge={isLoadingKnowledge}
              />
            )}

            {/* Vật tư dự kiến xuất kho (Danh sách trực tiếp kèm stepper - / + chuẩn Dribbble) */}
            {activeMeta.showMaterialsOnCreate && (
              <div className="rounded-xl bg-slate-100/70 dark:bg-slate-800/40 p-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faBox} className="text-[11px] text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Vật tư dự kiến xuất kho
                    </span>
                    {plannedMaterials.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                        {plannedMaterials.reduce((sum, m) => sum + m.plannedQty, 0)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">Chỉ trừ kho khi đóng lệnh</span>
                </div>

                {inventoryItems.length > 4 && (
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[10px] text-slate-400" />
                    <input
                      type="text"
                      value={partSearch}
                      onChange={(e) => setPartSearch(e.target.value)}
                      placeholder="Tìm nhanh vật tư..."
                      className="w-full border-none bg-transparent outline-none text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                )}

                <div className="max-h-[185px] overflow-y-auto flex flex-col gap-1.5 pr-0.5">
                  {inventoryItems.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">Đang tải danh mục kho...</div>
                  ) : (
                    inventoryItems
                      .filter((it) => {
                        const q = partSearch.trim().toLowerCase();
                        if (!q) return true;
                        const short = formatSupplyShortLabel(it.name).label.toLowerCase();
                        return it.name.toLowerCase().includes(q) || short.includes(q);
                      })
                      .map((it) => {
                        const qty = plannedMaterials.find((m) => m.inventoryItemId === it.id)?.plannedQty || 0;
                        const isSelected = qty > 0;
                        const supplyMeta = formatSupplyShortLabel(it.name);
                        return (
                          <div
                            key={it.id}
                            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-all ${
                              isSelected
                                ? 'bg-blue-50/90 dark:bg-blue-950/40 ring-1 ring-blue-500/20'
                                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <div className="min-w-0 flex items-center gap-2.5">
                              {supplyMeta.dotColor && (
                                <span
                                  style={{ backgroundColor: supplyMeta.dotColor }}
                                  className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-slate-200/70"
                                />
                              )}
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {supplyMeta.label}
                                </div>
                                <div className="text-[10.5px] text-slate-400">
                                  Tồn: <strong className="text-slate-600 dark:text-slate-300">{it.currentStock}</strong> {it.unit}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setItemPlannedQty(it, qty - 1)}
                                disabled={qty === 0}
                                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer disabled:opacity-35"
                              >
                                <FontAwesomeIcon icon={faMinus} className="text-[9px]" />
                              </button>
                              <span className={`text-xs font-mono font-extrabold w-6 text-center ${isSelected ? 'text-blue-700' : 'text-slate-400'}`}>
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setItemPlannedQty(it, qty + 1)}
                                className="w-6 h-6 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center cursor-pointer"
                              >
                                <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}

            {/* Detailed Description */}
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Ghi chú triệu chứng &amp; phương án khắc phục
              </label>
              <textarea
                rows={2}
                placeholder="Ghi chú thêm thông tin hiện trường hoặc linh kiện cần mang theo..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full rounded-xl bg-slate-100/75 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faCheck} className="text-[11px]" />
              <span>Xác nhận tạo việc</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default DiagnosticsCreateTaskForm;
