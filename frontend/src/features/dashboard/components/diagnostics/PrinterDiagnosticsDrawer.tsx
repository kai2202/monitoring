/**
 * Frontend/src/features/dashboard/components/diagnostics/PrinterDiagnosticsDrawer.tsx
 *
 * Slide-over Diagnostics Drawer 960px:
 * - 3 Tabs: Chẩn đoán & Vật tư CMYK, Lệnh bảo trì & Tiến độ, Lịch sử biến động tài sản.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../../../../app/store';
import { Printer } from '../../../../types/printer';
import { Task } from '../../../../types/task';
import { taskService, printerService } from '../../../../services';
import { useCreateStockTransactionMutation } from '../../../inventory/slices/inventoryApiSlice';
import { DiagnosticsDrawerHeader } from './DiagnosticsDrawerHeader';
import { DiagnosticsCmykTab } from './DiagnosticsCmykTab';
import { DiagnosticsLocationTab } from './DiagnosticsLocationTab';
import { DiagnosticsTasksTab } from './DiagnosticsTasksTab';
import { DiagnosticsHistoryTab } from './DiagnosticsHistoryTab';
import { DiagnosticsCreateTaskForm } from './DiagnosticsCreateTaskForm';

export interface PrinterDiagnosticsDrawerProps {
  printer: Printer | null;
  allPrinters?: Printer[];
  isOpen: boolean;
  onClose: () => void;
  onNextPrinter?: () => void;
  onPrevPrinter?: () => void;
  initialTab?: 'diag' | 'location' | 'tasks' | 'counters' | 'history';
  initialTaskId?: string;
  onCreateMaintenanceTask?: (printer: Printer) => void;
  onTaskCompleted?: (task: Task) => void;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onPrinterUpdated?: (printer: Printer) => void;
  onOpenEdit?: (printer: Printer) => void;
  onOpenRelocate?: (printer: Printer) => void;
  onDecommissionPrinter?: (printer: Printer) => void;
  onReactivatePrinter?: (printer: Printer) => void;
}

export const PrinterDiagnosticsDrawer: React.FC<PrinterDiagnosticsDrawerProps> = ({
  printer,
  allPrinters,
  isOpen,
  onClose,
  onNextPrinter,
  onPrevPrinter,
  initialTab = 'diag',
  initialTaskId,
  onCreateMaintenanceTask,
  onTaskCompleted,
  onTaskCreated,
  onTaskUpdated,
  onPrinterUpdated,
  onOpenEdit,
  onOpenRelocate,
  onDecommissionPrinter,
  onReactivatePrinter,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'diag' | 'location' | 'tasks' | 'history'>(
    initialTab === 'counters' ? 'diag' : (initialTab as any) || 'diag'
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTaskId || null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createStockTransaction] = useCreateStockTransactionMutation();

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'counters' ? 'diag' : (initialTab as any) || 'diag');
    }
  }, [initialTab]);

  useEffect(() => {
    if (isOpen) {
      setSelectedTaskId(initialTaskId || null);
    }
  }, [isOpen, printer?.id, initialTaskId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (e.key === 'Escape') onClose();
      else if (!isInput) {
        if ((e.key === 'j' || e.key === 'ArrowRight') && onNextPrinter) onNextPrinter();
        if ((e.key === 'k' || e.key === 'ArrowLeft') && onPrevPrinter) onPrevPrinter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNextPrinter, onPrevPrinter]);

  const loadTasks = useCallback(async () => {
    if (!printer) return;
    try {
      const allTasks = await taskService.getTasks();
      const matched = allTasks.filter((t) => t.printerId === printer.id);
      setTasks(matched);
      if (!selectedTaskId && matched.length > 0) setSelectedTaskId(matched[0].id);
    } catch (err) {
      console.error('Lỗi khi nạp tasks cho drawer:', err);
    }
  }, [printer, selectedTaskId]);

  useEffect(() => {
    if (isOpen && printer) loadTasks();
  }, [isOpen, printer, loadTasks]);

  if (!isOpen || !printer) return null;

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    taskService.updateTask(updated.id, updated).catch(console.error);
    if (onTaskUpdated) onTaskUpdated(updated);
    if (updated.status === 'Completed' && onTaskCompleted) onTaskCompleted(updated);
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const materials = task.plannedMaterials || [];
    const lockedMaterials = materials.map((m) => ({ ...m, locked: true }));
    handleUpdateTask({
      ...task,
      status: 'Completed',
      progressPercent: 100,
      completedDate: new Date().toISOString(),
      ...(materials.length > 0 ? { plannedMaterials: lockedMaterials } : {}),
    });

    // Chỉ trừ kho thực tế khi KTV/Admin xác nhận hoàn thành đóng Task
    for (const m of materials) {
      if (m.locked) continue;
      const totalExport = m.actualUsedQty + m.defectiveQty;
      if (totalExport <= 0) continue;
      const note = [
        `Xuất cho lệnh ${task.id}: ${m.actualUsedQty} dùng tốt`,
        m.defectiveQty > 0 ? `${m.defectiveQty} hư/lỗi` : '',
        m.adjustmentReason ? `(${m.adjustmentReason})` : '',
      ].filter(Boolean).join(', ');
      try {
        await createStockTransaction({
          itemId: m.inventoryItemId,
          type: 'EXPORT',
          quantity: totalExport,
          taskId: task.id,
          note,
        }).unwrap();
      } catch {
        // Giữ luồng đóng task mượt khi chạy mock/offline
      }
    }
  };

  const handleReopenTask = (taskId: string) => {
    if (user?.role !== 'ADMIN') {
      toast.error('Chỉ Quản trị viên mới có quyền mở lại nhiệm vụ đã đóng');
      return;
    }
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    handleUpdateTask({ ...task, status: 'In_Progress', progressPercent: 80 });
    toast.success(`Đã mở lại nhiệm vụ ${task.id}`);
  };

  const handleReactivatePrinter = async () => {
    if (!printer) return;
    try {
      const updated = await printerService.updatePrinter(printer.id, { monitoringStatus: 'Active' });
      toast.success(`Đã khôi phục giám sát máy in ${printer.name} thành công.`);
      if (onPrinterUpdated) onPrinterUpdated(updated);
    } catch (err) {
      toast.error('Lỗi khi khôi phục giám sát thiết bị.');
    }
  };

  const handleCreateTaskSuccess = async (newTask: Partial<Task>) => {
    try {
      const created = await taskService.createTask(newTask as any, user?.fullName || 'Quản trị viên');
      setTasks((prev) => [created, ...prev]);
      setSelectedTaskId(created.id);
      setActiveTab('tasks');
      toast.success(`Đã lập phiếu bảo trì ${created.id} thành công`);
      if (onTaskCreated) onTaskCreated(created);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo phiếu bảo trì mới');
    }
  };

  const assetHistoryCount = (printer.historyLogs || []).filter(
    (log) => log.actionType !== 'TASK_DOSSIER_ARCHIVED'
  ).length;

  return createPortal(
    <div
      className="animate-fadeIn"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="animate-slideLeft"
        style={{
          width: '100%',
          maxWidth: '960px',
          height: '100vh',
          backgroundColor: 'var(--bg-card, #ffffff)',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header cố định ở đỉnh Drawer */}
        <div style={{ flexShrink: 0 }}>
          <DiagnosticsDrawerHeader
            printer={printer}
            onClose={onClose}
            onNextPrinter={onNextPrinter}
            onPrevPrinter={onPrevPrinter}
            onReactivatePrinter={onReactivatePrinter || handleReactivatePrinter}
            isAdmin={user?.role === 'ADMIN'}
          />
        </div>

        {/* Tabs Switcher: Cố định bên dưới Header */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            padding: '0 24px',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'diag', label: 'Chẩn đoán & Vật tư' },
            { id: 'location', label: 'Vị Trí & Sơ Đồ' },
            { id: 'tasks', label: `Lệnh Bảo Trì (${tasks.length})` },
            { id: 'history', label: `Nhật Ký Tài Sản (${assetHistoryCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'diag' | 'location' | 'tasks' | 'history')}
              style={{
                padding: '12px 18px',
                fontSize: '12.5px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#2563eb' : 'var(--text-muted, #64748b)',
                borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content - Chỉ cuộn nội dung bên trong */}
        <div key={activeTab} className="custom-scrollbar page-transition" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {activeTab === 'diag' ? (
            <DiagnosticsCmykTab printer={printer} />
          ) : activeTab === 'location' ? (
            <DiagnosticsLocationTab
              printer={printer}
              allPrinters={allPrinters}
              onOpenEdit={onOpenEdit}
              isAdmin={user?.role === 'ADMIN'}
            />
          ) : activeTab === 'history' ? (
            <DiagnosticsHistoryTab printer={printer} />
          ) : (
            <DiagnosticsTasksTab
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
              onOpenCreateTask={() => setIsCreateTaskOpen(true)}
              onUpdateTask={handleUpdateTask}
              onCompleteTask={handleCompleteTask}
              onReopenTask={handleReopenTask}
              onAddNewStep={(tId, title) => {
                const t = tasks.find((x) => x.id === tId);
                if (!t) return;
                const prevSteps = t.dynamicSteps || [];
                const updated = [...prevSteps, { id: `s-${Date.now()}`, stepNumber: prevSteps.length + 1, title, status: 'Pending' as const }];
                const completed = updated.filter((s) => s.status === 'Completed').length;
                handleUpdateTask({ ...t, dynamicSteps: updated, progressPercent: Math.round((completed / updated.length) * 100) });
              }}
              onToggleStep={(tId, sId) => {
                const t = tasks.find((x) => x.id === tId);
                if (!t) return;
                const updated = (t.dynamicSteps || []).map((s) => s.id === sId ? { ...s, status: s.status === 'Completed' ? ('Pending' as const) : ('Completed' as const) } : s);
                const completed = updated.filter((s) => s.status === 'Completed').length;
                handleUpdateTask({ ...t, dynamicSteps: updated, progressPercent: Math.round((completed / updated.length) * 100) });
              }}
              onAddActivityNote={(tId, note) => {
                const t = tasks.find((x) => x.id === tId);
                if (!t) return;
                const author = user?.fullName || 'Kỹ thuật viên';
                handleUpdateTask({ ...t, activityFeed: [...(t.activityFeed || []), { id: `act-${Date.now()}`, author, timestamp: 'Vừa xong', type: 'note_added', content: note }] });
              }}
            />
          )}
        </div>

        <DiagnosticsCreateTaskForm
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          printer={printer}
          onCreateTask={handleCreateTaskSuccess}
        />
      </div>
    </div>,
    document.body
  );
};

export default PrinterDiagnosticsDrawer;
