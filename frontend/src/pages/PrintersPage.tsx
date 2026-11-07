/**
 * Frontend/src/pages/PrintersPage.tsx
 *
 * Phân hệ Danh mục & Chẩn đoán Máy in (Printers):
 * - Tích hợp FleetHealthBar: Thanh phân bổ trạng thái trực quan & Quick Filter.
 * - Quản lý cấu hình, điều chuyển vị trí, chi nhánh, phân tầng (Admin Only).
 * - Tuân thủ nghiêm ngặt AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../app/store';
import { setSelectedBranch } from '../app/slices/uiSlice';
import { Printer } from '../types/printer';
import { Task } from '../types/task';
import { printerService, taskService, locationService } from '../services';
import { PrinterDiagnosticsDrawer } from '../features/dashboard/components/diagnostics/PrinterDiagnosticsDrawer';
import { TaskTimelineCalendar } from '../features/dashboard/components/timeline/TaskTimelineCalendar';
import { WorkOrdersTable } from '../features/printers/components/workorders/WorkOrdersTable';
import { NavTabId } from '../components/layout/Sidebar';
import {
  PrinterFilterToolbar,
  PrinterTableView,
  PrinterRelocateModal,
  BranchFloorManagerModal,
  PrinterCreateModal,
  PrinterEditModal,
  PrintersPageHeader,
  FleetHealthBar,
} from '../features/printers/components';
import { exportPrintersToCsv } from '../features/printers/utils/printerCsvExport';

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
  initialFilter,
  preselectedPrinterForTask,
  onClearPreselectedPrinter,
  activeSubTab,
  onSubTabChange,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const [printers, setPrinters] = useState<Printer[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const urlDerivedTab = location.pathname.includes('/printers/timeline') ? 'timeline' : location.pathname.includes('/printers/history') ? 'history' : location.pathname.includes('/printers') ? 'printers' : undefined;
  const [internalTab, setInternalTab] = useState<'printers' | 'timeline' | 'history'>(
    urlDerivedTab || activeSubTab || (user?.role === 'FIELD_TECH' || user?.role === 'FIELD_TECHNICIAN' ? 'timeline' : 'printers')
  );

  useEffect(() => {
    if (urlDerivedTab) setInternalTab(urlDerivedTab);
    else if (activeSubTab) setInternalTab(activeSubTab);
  }, [urlDerivedTab, activeSubTab]);

  const mainTab = urlDerivedTab || activeSubTab || internalTab;

  // Filters
  const urlQueryParam = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQueryParam);
  useEffect(() => { if (urlQueryParam) setSearchQuery(urlQueryParam); }, [urlQueryParam]);
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'all');
  const [mfrFilter, setMfrFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [functionFilter, setFunctionFilter] = useState<string>('all');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Drawers & Modals
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerInitialTab, setDrawerInitialTab] = useState<'diag' | 'tasks' | 'counters'>('diag');
  const [relocatePrinter, setRelocatePrinter] = useState<Printer | null>(null);
  const [isRelocateModalOpen, setIsRelocateModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatePrinterOpen, setIsCreatePrinterOpen] = useState(false);
  const [isBranchManagerOpen, setIsBranchManagerOpen] = useState(false);
  const [locationVer, setLocationVer] = useState(0);

  useEffect(() => locationService.subscribe(() => setLocationVer((v) => v + 1)), []);

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

  useEffect(() => { loadData(); }, [loadData]);

  const printerTaskMap = useMemo(() => {
    const map = new Map<string, { active: number; total: number; latestTask?: Task }>();
    allTasks.forEach((t) => {
      const cur = map.get(t.printerId) || { active: 0, total: 0 };
      const isActive = t.status !== 'Completed' && t.status !== 'Cancelled';
      map.set(t.printerId, { active: cur.active + (isActive ? 1 : 0), total: cur.total + 1, latestTask: cur.latestTask || t });
    });
    return map;
  }, [allTasks]);

  const manufacturers = useMemo(() => Array.from(new Set(printers.map((p) => p.mfr).filter(Boolean))).sort(), [printers]);
  const branches = useMemo(() => {
    const dynamic = [...locationService.getBranchNames()];
    printers.forEach((p) => { if (p.branch && !dynamic.includes(p.branch)) dynamic.push(p.branch); });
    return dynamic;
  }, [locationVer, printers]);
  const floors = useMemo(() => locationService.getFloorsByBranch(branchFilter), [locationVer, branchFilter]);

  // Phân bổ sức khỏe theo phạm vi Chi nhánh & Tầng đang chọn
  const printersInScope = useMemo(() => {
    return printers.filter((p) => {
      if (branchFilter !== 'all' && !((p.branch && p.branch === branchFilter) || (p.location && p.location.includes(branchFilter)))) return false;
      if (floorFilter !== 'all' && !((p.floor && p.floor === floorFilter) || (p.location && p.location.includes(floorFilter)))) return false;
      return true;
    });
  }, [printers, branchFilter, floorFilter]);

  const handleResetAllFilters = useCallback(() => {
    setSearchQuery(''); setStatusFilter('all'); setMfrFilter('all'); setBranchFilter('all'); setFloorFilter('all'); setColorFilter('all'); setFunctionFilter('all');
  }, []);

  const filteredPrinters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return printersInScope.filter((p) => {
      const matchSearch = !q || p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.ip.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) || (p.serial && p.serial.toLowerCase().includes(q)) || (p.location && p.location.toLowerCase().includes(q)) || (p.branch && p.branch.toLowerCase().includes(q)) || (p.department && p.department.toLowerCase().includes(q));
      if (!matchSearch) return false;
      if (mfrFilter !== 'all' && p.mfr !== mfrFilter) return false;
      const s = statusFilter.toLowerCase();
      if (s === 'healthy') {
        const isOff = p.connectionStatus === 'Offline' || p.monitoringStatus === 'Storage' || p.monitoringStatus === 'Decommissioned';
        return !(isOff || p.health === 'Critical' || p.alertSeverity === 'critical' || p.health === 'Warning' || p.alertSeverity === 'warning');
      }
      if (s === 'online' && p.connectionStatus !== 'Online') return false;
      if (s === 'offline' && !(p.connectionStatus === 'Offline' || p.monitoringStatus === 'Storage' || p.monitoringStatus === 'Decommissioned')) return false;
      if (s === 'critical' && !(p.health === 'Critical' || p.alertSeverity === 'critical')) return false;
      if (s === 'warning' && !(p.health === 'Warning' || p.alertSeverity === 'warning')) return false;
      const deviceTypeLower = (p.deviceType || '').toLowerCase();
      if (colorFilter === 'mono' && !(p.colorCapability === 'Monochrome' || (!p.colorCapability && deviceTypeLower.includes('mono')))) return false;
      if (colorFilter === 'color' && !(p.colorCapability === 'Color' || (!p.colorCapability && deviceTypeLower.includes('color')))) return false;
      if (functionFilter === 'mfp' && !deviceTypeLower.includes('mfp')) return false;
      if (functionFilter === 'sfp' && deviceTypeLower.includes('mfp')) return false;
      return true;
    });
  }, [printersInScope, searchQuery, mfrFilter, statusFilter, colorFilter, functionFilter]);

  const handleCopyIp = (e: React.MouseEvent, ip: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleOpenDrawer = (printer: Printer, tab: 'diag' | 'tasks' | 'counters' = 'diag', taskId?: string) => {
    setSelectedPrinter(printer);
    setDrawerInitialTab(tab);
    setSelectedTaskId(taskId);
    setIsDrawerOpen(true);
  };

  const handleDecommissionPrinter = async (printer: Printer) => {
    const taskInfo = printerTaskMap.get(printer.id);
    if (taskInfo && taskInfo.active > 0) {
      toast.error(`Không thể ngưng giám sát ${printer.name} (${printer.id}) vì đang có ${taskInfo.active} lệnh bảo trì chưa đóng.`);
      return;
    }
    try {
      await printerService.updatePrinter(printer.id, { monitoringStatus: 'Storage' });
      toast.success(`Đã chuyển máy in ${printer.name} (${printer.id}) sang trạng thái Lưu kho.`);
      loadData();
    } catch (err) {
      toast.error('Lỗi khi ngưng giám sát thiết bị.');
      console.error(err);
    }
  };

  const handleReactivatePrinter = async (printer: Printer) => {
    try {
      await printerService.updatePrinter(printer.id, { monitoringStatus: 'Active' });
      toast.success(`Đã khôi phục giám sát máy in ${printer.name} (${printer.id}) thành công.`);
      loadData();
    } catch (err) {
      toast.error('Lỗi khi khôi phục giám sát thiết bị.');
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1440px', margin: '0 auto' }}>
      <PrintersPageHeader
        activeTab={mainTab}
        onTabChange={(tab) => { setInternalTab(tab); navigate(tab === 'printers' ? '/printers/list' : `/printers/${tab}`); if (onSubTabChange) onSubTabChange(tab); }}
        isAdmin={isAdmin}
        totalPrinters={printers.length}
        totalTasks={allTasks.length}
        isLoading={isLoading}
        onRefresh={loadData}
        onOpenCreatePrinter={() => setIsCreatePrinterOpen(true)}
        onOpenBranchManager={() => setIsBranchManagerOpen(true)}
        onExportCsv={() => exportPrintersToCsv(printers)}
      />

      {mainTab === 'printers' && (
        <>
          <FleetHealthBar printers={printersInScope} selectedFilter={statusFilter} onSelectFilter={setStatusFilter} />
          <PrinterFilterToolbar
            searchQuery={searchQuery} onSearchChange={setSearchQuery}
            statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
            mfrFilter={mfrFilter} onMfrFilterChange={setMfrFilter} manufacturers={manufacturers}
            branchFilter={branchFilter} onBranchFilterChange={(b) => { setBranchFilter(b); if (b !== 'all') dispatch(setSelectedBranch(b)); }}
            branches={branches} floorFilter={floorFilter} onFloorFilterChange={setFloorFilter} floors={floors}
            colorFilter={colorFilter} onColorFilterChange={setColorFilter}
            functionFilter={functionFilter} onFunctionFilterChange={setFunctionFilter}
            totalPrinters={printersInScope.length} onResetAllFilters={handleResetAllFilters}
          />
          <PrinterTableView
            printers={filteredPrinters}
            printerTaskMap={printerTaskMap}
            copiedIp={copiedIp}
            onCopyIp={handleCopyIp}
            onOpenDrawer={handleOpenDrawer}
            onOpenRelocate={(p) => { setRelocatePrinter(p); setIsRelocateModalOpen(true); }}
            onOpenEdit={(p) => { setEditingPrinter(p); setIsEditModalOpen(true); }}
            onDecommissionPrinter={handleDecommissionPrinter}
            onReactivatePrinter={handleReactivatePrinter}
            isAdmin={isAdmin}
          />
        </>
      )}

      {mainTab === 'timeline' && (
        <TaskTimelineCalendar tasks={allTasks} printers={printers} onOpenDrawer={handleOpenDrawer} onRefreshTasks={loadData} />
      )}

      {mainTab === 'history' && (
        <WorkOrdersTable
          tasks={allTasks}
          printers={printers}
          onOpenTaskDetail={(p, tId) => handleOpenDrawer(p, 'tasks', tId)}
          onSwitchToTimelineView={() => { setInternalTab('timeline'); navigate('/printers/timeline'); if (onSubTabChange) onSubTabChange('timeline'); }}
          onRefreshTasks={loadData}
        />
      )}

      <PrinterDiagnosticsDrawer printer={selectedPrinter} isOpen={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); setSelectedTaskId(undefined); loadData(); }} initialTab={drawerInitialTab} initialTaskId={selectedTaskId} onTaskCreated={loadData} onTaskCompleted={loadData} onTaskUpdated={loadData} />
      <PrinterCreateModal isOpen={isCreatePrinterOpen} onClose={() => setIsCreatePrinterOpen(false)} onPrinterCreated={loadData} />
      <PrinterEditModal printer={editingPrinter} isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingPrinter(null); }} onPrinterUpdated={loadData} />
      <PrinterRelocateModal printer={relocatePrinter} isOpen={isRelocateModalOpen} onClose={() => setIsRelocateModalOpen(false)} onRelocateSuccess={loadData} />
      <BranchFloorManagerModal isOpen={isBranchManagerOpen} onClose={() => { setIsBranchManagerOpen(false); loadData(); }} printers={printers} />
    </div>
  );
};

export default PrintersPage;
