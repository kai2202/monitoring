/**
 * Frontend/src/pages/OperationsPage.tsx
 *
 * Phân hệ Vận hành & Sự cố (Operations):
 * - Clean architecture, tách nhỏ các sub-component (< 300 LOC/file).
 * - Kết nối OperationsIncidentQueue, OperationsTaskBoard, OperationsCreateTaskModal.
 * - Tuân thủ AGENTS.md Rule 7.1.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FontAwesomeIcon, faFileLines, faPlus, faRotate } from '../shared/icons';
import { incidentService, taskService, printerService } from '../services';
import { Incident, Printer } from '../types/printer';
import { Task, TaskPriority, TaskType } from '../types/task';
import { NavTabId } from '../components/layout/Sidebar';
import { OperationsIncidentQueue } from '../features/operations/components/OperationsIncidentQueue';
import { OperationsTaskBoard } from '../features/operations/components/OperationsTaskBoard';
import { OperationsCreateTaskModal } from '../features/operations/components/OperationsCreateTaskModal';

export interface OperationsPageProps {
  onNavigateModule?: (tab: NavTabId) => void;
  preselectedPrinter?: Printer | null;
}

export const OperationsPage: React.FC<OperationsPageProps> = ({
  onNavigateModule,
  preselectedPrinter,
}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [incidentTab, setIncidentTab] = useState<'all' | 'critical' | 'warning'>('all');
  const [taskTab, setTaskTab] = useState<'all' | 'in_progress' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [incData, taskData, printData] = await Promise.all([
        incidentService.getIncidents(),
        taskService.getTasks(),
        printerService.getPrinters(),
      ]);
      setIncidents(incData);
      setTasks(taskData);
      setPrinters(printData);
    } catch (err) {
      console.error('Lỗi khi nạp dữ liệu Vận hành:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (preselectedPrinter) {
      setSelectedPrinterId(preselectedPrinter.id);
      setIsModalOpen(true);
    }
  }, [preselectedPrinter]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (incidentTab === 'critical') return inc.severity === 'Critical';
      if (incidentTab === 'warning') return inc.severity === 'Warning';
      return true;
    });
  }, [incidents, incidentTab]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (taskTab === 'in_progress') return t.status === 'In_Progress';
      if (taskTab === 'pending') return t.status === 'Waiting' || t.status === 'Planned';
      if (taskTab === 'completed') return t.status === 'Completed' || t.status === 'Pending_Verification';
      return true;
    });
  }, [tasks, taskTab]);

  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'In_Progress' : 'Completed';
      await taskService.updateTaskStatus(task.id, {
        status: newStatus as any,
        author: 'Admin',
        comment: `Chuyển trạng thái sang ${newStatus}`,
      });
      loadData();
    } catch (err) {
      console.error('Lỗi cập nhật task status:', err);
    }
  };

  const handleCreateTaskConfirm = async (payload: {
    printerId: string;
    title: string;
    type: TaskType;
    priority: TaskPriority;
    assignee: string;
    description: string;
  }) => {
    const pr = printers.find((p) => p.id === payload.printerId);
    try {
      await taskService.createTask({
        title: payload.title,
        description: payload.description,
        type: payload.type,
        priority: payload.priority,
        assignee: payload.assignee,
        dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
        printerId: payload.printerId,
        printerName: pr ? pr.name : 'Thiết bị chỉ định',
        location: pr ? pr.location : 'Toàn khu vực',
      } as any);
      loadData();
    } catch (err) {
      console.error('Lỗi tạo task mới:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '18px 24px', borderRadius: '20px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FontAwesomeIcon icon={faFileLines} style={{ fontSize: '20px', color: '#2563eb' }} />
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
              Trung Tâm Điều Hành &amp; Vận Hành Kỹ Thuật (NOC Operations)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0' }}>
              Điều phối sự cố Zabbix và lệnh bảo trì phần cứng thiết bị
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 16px',
            borderRadius: '10px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <FontAwesomeIcon icon={faPlus} style={{ fontSize: '13px' }} />
          <span>Tạo task bảo trì</span>
        </button>
      </div>

      {/* Grid: Incident Queue & Tasks Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px', alignItems: 'start' }}>
        <OperationsIncidentQueue
          incidents={filteredIncidents}
          activeTab={incidentTab}
          onTabChange={setIncidentTab}
        />
        <OperationsTaskBoard
          tasks={filteredTasks}
          activeTab={taskTab}
          onTabChange={setTaskTab}
          onToggleStatus={handleToggleTaskStatus}
        />
      </div>

      <OperationsCreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        printers={printers}
        selectedPrinterId={selectedPrinterId}
        onConfirm={handleCreateTaskConfirm}
      />
    </div>
  );
};

export default OperationsPage;
