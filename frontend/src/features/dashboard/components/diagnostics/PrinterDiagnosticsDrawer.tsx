/**
 * Frontend/src/features/dashboard/components/diagnostics/PrinterDiagnosticsDrawer.tsx
 *
 * Slide-over Diagnostics Drawer 640px:
 * - Clean architecture, tách nhỏ các sub-component (< 300 LOC/file).
 * - Kết nối DiagnosticsDrawerHeader, DiagnosticsCmykTab, DiagnosticsTasksTab, DiagnosticsCreateTaskForm.
 * - Tuân thủ AGENTS.md Rule 7.1.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../../../../app/store';
import { Printer } from '../../../../types/printer';
import { Task } from '../../../../types/task';
import { taskService } from '../../../../services';
import { DiagnosticsDrawerHeader } from './DiagnosticsDrawerHeader';
import { DiagnosticsCmykTab } from './DiagnosticsCmykTab';
import { DiagnosticsTasksTab } from './DiagnosticsTasksTab';
import { DiagnosticsCreateTaskForm } from './DiagnosticsCreateTaskForm';

export interface PrinterDiagnosticsDrawerProps {
  printer: Printer | null;
  isOpen: boolean;
  onClose: () => void;
  onNextPrinter?: () => void;
  onPrevPrinter?: () => void;
  initialTab?: 'diag' | 'tasks' | 'counters';
  initialTaskId?: string;
  onCreateMaintenanceTask?: (printer: Printer) => void;
  onTaskCompleted?: (task: Task) => void;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onPrinterUpdated?: (printer: Printer) => void;
}

export const PrinterDiagnosticsDrawer: React.FC<PrinterDiagnosticsDrawerProps> = ({
  printer,
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
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'diag' | 'tasks'>(
    initialTab === 'counters' ? 'diag' : initialTab
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTaskId || null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'counters' ? 'diag' : initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadTasks = useCallback(async () => {
    if (!printer) return;
    try {
      const allTasks = await taskService.getTasks();
      const matched = allTasks.filter((t) => t.printerId === printer.id);
      setTasks(matched);
      if (!selectedTaskId && matched.length > 0) {
        setSelectedTaskId(matched[0].id);
      }
    } catch (err) {
      console.error('Lỗi khi nạp tasks cho drawer:', err);
    }
  }, [printer, selectedTaskId]);

  useEffect(() => {
    if (isOpen && printer) {
      loadTasks();
    }
  }, [isOpen, printer, loadTasks]);

  if (!isOpen || !printer) return null;

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    taskService.updateTask(updated.id, updated).catch(console.error);
    if (onTaskUpdated) onTaskUpdated(updated);
    if (updated.status === 'Completed' && onTaskCompleted) {
      onTaskCompleted(updated);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updated: Task = {
      ...task,
      status: 'Completed',
      progressPercent: 100,
      completedDate: new Date().toISOString(),
    };
    handleUpdateTask(updated);
  };

  const handleReopenTask = (taskId: string) => {
    if (user?.role !== 'ADMIN') {
      toast.error('Chỉ Quản trị viên mới có quyền mở lại nhiệm vụ đã đóng');
      return;
    }
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updated: Task = { ...task, status: 'In_Progress', progressPercent: 80 };
    handleUpdateTask(updated);
    toast.success(`Đã mở lại nhiệm vụ ${task.id}`);
  };

  const handleReactivatePrinter = async () => {
    if (!printer) return;
    try {
      const updated = await printerService.updatePrinter(printer.id, { monitoringStatus: 'Active' });
      toast.success(`Đã khôi phục giám sát máy in ${printer.name} (${printer.id}) thành công.`);
      if (onPrinterUpdated) onPrinterUpdated(updated);
    } catch (err) {
      toast.error('Lỗi khi khôi phục giám sát thiết bị.');
      console.error(err);
    }
  };

  const handleCreateTaskSuccess = async (newTask: Partial<Task>) => {
    try {
      const created = await taskService.createTask(
        newTask as any,
        user?.fullName || (user as any)?.name || 'Quản trị viên'
      );
      setTasks((prev) => [created, ...prev]);
      setSelectedTaskId(created.id);
      setActiveTab('tasks');
      toast.success(`Đã lập phiếu bảo trì ${created.id} thành công`);
      if (onTaskCreated) onTaskCreated(created);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu phiếu bảo trì mới lên máy chủ');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 9000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="custom-scrollbar"
        style={{
          width: '100%',
          maxWidth: '960px',
          height: '100%',
          backgroundColor: 'var(--bg-card, #ffffff)',
          boxShadow: '-8px 0 25px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <DiagnosticsDrawerHeader
          printer={printer}
          onClose={onClose}
          onNextPrinter={onNextPrinter}
          onPrevPrinter={onPrevPrinter}
          onReactivatePrinter={handleReactivatePrinter}
          isAdmin={user?.role === 'ADMIN'}
        />

        {/* 2. Tabs Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color, #e2e8f0)', padding: '0 24px', backgroundColor: 'var(--bg-subtle, #f8fafc)' }}>
          {[
            { id: 'diag', label: 'Chẩn đoán & Vật tư CMYK' },
            { id: 'tasks', label: `Lệnh Bảo Trì & Tiến Độ (${tasks.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'diag' | 'tasks')}
              className={`subtab-pill-btn ${activeTab === tab.id ? 'active' : ''}`}
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
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3. Tab Content */}
        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'diag' ? (
            <DiagnosticsCmykTab printer={printer} />
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
                const updatedSteps = [...(t.dynamicSteps || []), { id: `s-${Date.now()}`, title, status: 'Pending' as const }];
                const completedCount = updatedSteps.filter((s) => s.status === 'Completed').length;
                handleUpdateTask({ ...t, dynamicSteps: updatedSteps, progressPercent: Math.round((completedCount / updatedSteps.length) * 100), status: t.status === 'Completed' ? 'In_Progress' : t.status });
              }}
              onToggleStep={(tId, sId) => {
                const t = tasks.find((x) => x.id === tId);
                if (!t) return;
                const updatedSteps = (t.dynamicSteps || []).map((s) => s.id === sId ? { ...s, status: s.status === 'Completed' ? ('Pending' as const) : ('Completed' as const) } : s);
                const completedCount = updatedSteps.filter((s) => s.status === 'Completed').length;
                const isAllDone = completedCount === updatedSteps.length && updatedSteps.length > 0;
                handleUpdateTask({
                  ...t, dynamicSteps: updatedSteps,
                  progressPercent: updatedSteps.length > 0 ? Math.round((completedCount / updatedSteps.length) * 100) : 0,
                  status: isAllDone ? 'Pending_Verification' : (t.status === 'Completed' || t.status === 'Pending_Verification' ? 'In_Progress' : t.status),
                  completedDate: isAllDone ? (t.completedDate || new Date().toISOString()) : undefined,
                });
              }}
              onAddActivityNote={(tId, note) => {
                const t = tasks.find((x) => x.id === tId);
                if (!t) return;
                const authorName = user?.fullName || (user as any)?.name || user?.username || 'Kỹ thuật viên';
                const words = authorName.trim().split(' ').filter(Boolean);
                const avatar = words.length > 1 ? (words[0][0] + words[words.length - 1][0]).toUpperCase() : authorName.slice(0, 2).toUpperCase();
                handleUpdateTask({ ...t, activityFeed: [...(t.activityFeed || []), { id: `act-${Date.now()}`, author: authorName, avatarText: avatar || (user?.role === 'ADMIN' ? 'AD' : 'KT'), timestamp: 'Vừa xong', type: 'comment', content: note }] });
              }}
            />
          )}
        </div>

        {/* 4. Create Task Modal */}
        <DiagnosticsCreateTaskForm
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          printer={printer}
          onCreateTask={handleCreateTaskSuccess}
        />
      </div>
    </div>
  );
};

export default PrinterDiagnosticsDrawer;

