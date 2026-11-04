/**
 * Frontend/src/pages/PrintersPage.tsx
 *
 * Phân hệ Danh mục & Chẩn đoán Máy in (Printers):
 * - Tách nhỏ thành PrinterFilterToolbar, PrinterTableView (<300 dòng/file).
 * - Tích hợp TaskTimelineCalendar, WorkOrdersTable và PrinterDiagnosticsDrawer.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FontAwesomeIcon,
  faPrint,
  faCalendarDays,
  faWrench,
  faRotate,
} from '../shared/icons';
import { Printer } from '../types/printer';
import { Task } from '../types/task';
import { printerService, taskService } from '../services';
import { PrinterDiagnosticsDrawer } from '../features/dashboard/components/diagnostics/PrinterDiagnosticsDrawer';
import { TaskTimelineCalendar } from '../features/dashboard/components/timeline/TaskTimelineCalendar';
import { WorkOrdersTable } from '../features/printers/components/workorders/WorkOrdersTable';
import { NavTabId } from '../components/layout/Sidebar';
import { PrinterFilterToolbar } from '../features/printers/components/PrinterFilterToolbar';
import { PrinterTableView } from '../features/printers/components/PrinterTableView';

export interface PrintersPageProps {
  onNavigateModule?: (tab: NavTabId) => void;
  onCreateTaskForPrinter?: (printer: Printer) => void;
  initialFilter?: string;
  preselectedPrinterForTask?: Printer | null;
  onClearPreselectedPrinter?: () => void;
  activeSubTab?: 'printers' | 'timeline' | 'history';
  onSubTabChange?: (subTab: 'printers' | 'timeline' | 'history') => void;
}

export const PrintersPage: React.FC<PrintersPageProps> = ({
  onNavigateModule,
  onCreateTaskForPrinter,
  initialFilter,
  preselectedPrinterForTask,
  onClearPreselectedPrinter,
  activeSubTab,
  onSubTabChange,
}) => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [internalTab, setInternalTab] = useState<'printers' | 'timeline' | 'history'>(
    activeSubTab || 'printers'
  );

  useEffect(() => {
    if (activeSubTab) setInternalTab(activeSubTab);
  }, [activeSubTab]);

  const mainTab = activeSubTab || internalTab;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter || 'all');
  const [mfrFilter, setMfrFilter] = useState('all');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerInitialTab, setDrawerInitialTab] = useState<'diag' | 'tasks' | 'counters'>('diag');
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (preselectedPrinterForTask) {
      setSelectedPrinter(preselectedPrinterForTask);
      setDrawerInitialTab('tasks');
      setIsDrawerOpen(true);
      if (onClearPreselectedPrinter) onClearPreselectedPrinter();
    }
  }, [preselectedPrinterForTask, onClearPreselectedPrinter]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pData, tData] = await Promise.all([printerService.getPrinters(), taskService.getTasks()]);
      setPrinters(pData);
      setAllTasks(tData);
    } catch (err) {
      console.error('Lỗi khi nạp danh sách:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const printerTaskMap = useMemo(() => {
    const map = new Map<string, { active: number; total: number; latestTask?: Task }>();
    allTasks.forEach((t) => {
      const cur = map.get(t.printerId) || { active: 0, total: 0 };
      const isActive = t.status !== 'Completed' && t.status !== 'Cancelled';
      map.set(t.printerId, {
        active: cur.active + (isActive ? 1 : 0),
        total: cur.total + 1,
        latestTask: cur.latestTask || t,
      });
    });
    return map;
  }, [allTasks]);

  const manufacturers = useMemo(() => {
    return Array.from(new Set(printers.map((p) => p.mfr).filter(Boolean))).sort();
  }, [printers]);

  const filteredPrinters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return printers.filter((p) => {
      const matchSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.ip.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q);
      if (!matchSearch) return false;
      if (mfrFilter !== 'all' && p.mfr !== mfrFilter) return false;
      if (statusFilter === 'online') return p.connectionStatus === 'Online';
      if (statusFilter === 'offline') return p.connectionStatus === 'Offline';
      if (statusFilter === 'critical') return p.health === 'Critical' || p.alertSeverity === 'critical';
      if (statusFilter === 'warning') return p.health === 'Warning' || p.alertSeverity === 'warning';
      return true;
    });
  }, [printers, searchQuery, mfrFilter, statusFilter]);

  const handleCopyIp = (e: React.MouseEvent, ip: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleOpenDrawer = (
    printer: Printer,
    tab: 'diag' | 'tasks' | 'counters',
    taskId?: string
  ) => {
    setSelectedPrinter(printer);
    setDrawerInitialTab(tab);
    setSelectedTaskId(taskId);
    setIsDrawerOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header Card */}
      <div style={{ padding: '20px 24px', borderRadius: 'var(--radius-card)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            {mainTab === 'printers' ? (
              <FontAwesomeIcon icon={faPrint} style={{ fontSize: '18px' }} />
            ) : mainTab === 'timeline' ? (
              <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: '18px' }} />
            ) : (
              <FontAwesomeIcon icon={faWrench} style={{ fontSize: '18px' }} />
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {mainTab === 'printers' ? 'Danh Sách Máy In' : mainTab === 'timeline' ? 'Lịch Trình Bảo Trì' : 'Lệnh Bảo Trì (Work Orders)'}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              {mainTab === 'printers' ? `Quản lý toàn diện ${printers.length} thiết bị và chẩn đoán kỹ thuật` : mainTab === 'timeline' ? 'Quan sát hạn hoàn thành và tiến độ công việc' : `Theo dõi ${allTasks.length} lệnh bảo trì`}
            </p>
          </div>
        </div>

        <button onClick={loadData} disabled={isLoading} style={{ padding: '7px 14px', borderRadius: '9999px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <FontAwesomeIcon icon={faRotate} spin={isLoading} style={{ fontSize: '13px' }} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* 2. Sub-views */}
      {mainTab === 'printers' && (
        <>
          <PrinterFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            mfrFilter={mfrFilter}
            onMfrFilterChange={setMfrFilter}
            manufacturers={manufacturers}
            totalPrinters={printers.length}
          />
          <PrinterTableView
            printers={filteredPrinters}
            printerTaskMap={printerTaskMap}
            copiedIp={copiedIp}
            onCopyIp={handleCopyIp}
            onOpenDrawer={handleOpenDrawer}
          />
        </>
      )}

      {mainTab === 'timeline' && (
        <TaskTimelineCalendar
          tasks={allTasks}
          printers={printers}
          onOpenDrawer={handleOpenDrawer}
          onRefreshTasks={loadData}
        />
      )}

      {mainTab === 'history' && (
        <WorkOrdersTable
          tasks={allTasks}
          printers={printers}
          onOpenTaskDetail={(printer, taskId) => handleOpenDrawer(printer, 'tasks', taskId)}
          onSwitchToTimelineView={() => {
            setInternalTab('timeline');
            if (onSubTabChange) onSubTabChange('timeline');
          }}
        />
      )}

      {/* Slide-over Diagnostics Drawer */}
      <PrinterDiagnosticsDrawer
        printer={selectedPrinter}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTaskId(undefined);
          loadData();
        }}
        initialTab={drawerInitialTab}
        initialTaskId={selectedTaskId}
        onTaskCreated={loadData}
        onTaskCompleted={loadData}
        onTaskUpdated={loadData}
      />
    </div>
  );
};

export default PrintersPage;
