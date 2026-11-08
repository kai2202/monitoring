/**
 * Frontend/src/features/printers/pages/PrintersPage.tsx
 *
 * Phân hệ Danh mục & Chẩn đoán Máy in (Printers):
 * - Tích hợp FleetHealthBar: Thanh phân bổ trạng thái trực quan & Quick Filter.
 * - Quản lý cấu hình, điều chuyển vị trí, chi nhánh, phân tầng (Admin Only).
 * - Sử dụng usePrinterModals hook điều phối modals, giữ component tinh gọn.
 * - Tuân thủ nghiêm ngặt AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store';
import { setSelectedBranch } from '@/app/slices/uiSlice';
import { Printer } from '@/types/printer';
import { Task } from '@/types/task';
import { printerService, taskService, locationService } from '@/services';
import { PrinterDiagnosticsDrawer } from '@/features/dashboard/components/diagnostics/PrinterDiagnosticsDrawer';
import { TaskTimelineCalendar } from '@/features/dashboard/components/timeline/TaskTimelineCalendar';
import { WorkOrdersTable } from '../components/workorders/WorkOrdersTable';
import { NavTabId } from '@/components/layout/Sidebar';
import {
  PrinterFilterToolbar,
  PrinterTableView,
  PrinterRelocateModal,
  BranchFloorManagerModal,
  PrinterCreateModal,
  PrinterEditModal,
  PrintersPageHeader,
  FleetHealthBar,
} from '../components';
import { exportPrintersToCsv } from '../utils/printerCsvExport';
import { usePrinterModals } from '../hooks/usePrinterModals';

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
  activeSubTab = 'printers',
  onSubTabChange,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const [printers, setPrinters] = useState<Printer[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Tab & Filters
  const [internalTab, setInternalTab] = useState<'printers' | 'timeline' | 'history'>(activeSubTab);
  const mainTab = activeSubTab || internalTab;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter || searchParams.get('filter') || 'all');
  const [mfrFilter, setMfrFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [functionFilter, setFunctionFilter] = useState('all');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [printerList, taskList] = await Promise.all([
        printerService.getPrinters(),
        taskService.getTasks(),
      ]);
      setPrinters(printerList);
      setAllTasks(taskList);
    } catch (err) {
      console.error('Lỗi tải dữ liệu máy in:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Modals & Drawer Hook
  const modals = usePrinterModals(loadData);

  const branches = useMemo(() => locationService.getBranchNames(), []);
  const floors = useMemo(() => {
    return branchFilter !== 'all' ? locationService.getFloorsByBranch(branchFilter) : [];
  }, [branchFilter]);

  const manufacturers = useMemo(() => {
    return Array.from(new Set(printers.map((p) => p.manufacturer))).filter(Boolean);
  }, [printers]);

  const printersInScope = useMemo(() => {
    if (isAdmin || !user?.dataScope?.branchNames?.length) return printers;
    return printers.filter((p) => user.dataScope?.branchNames?.includes(p.location.branch));
  }, [printers, isAdmin, user]);

  const filteredPrinters = useMemo(() => {
    return printersInScope.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ipAddress.includes(searchQuery) ||
        p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'online' && p.connectionStatus === 'Online' && p.healthStatus === 'Healthy') ||
        (statusFilter === 'warning' && p.healthStatus === 'Warning') ||
        (statusFilter === 'error' && (p.healthStatus === 'Error' || p.activeIncidentCount > 0)) ||
        (statusFilter === 'offline' && p.connectionStatus === 'Offline') ||
        (statusFilter === 'storage' && p.monitoringStatus === 'Storage');

      const matchMfr = mfrFilter === 'all' || p.manufacturer === mfrFilter;
      const matchBranch = branchFilter === 'all' || p.location.branch === branchFilter;
      const matchFloor = floorFilter === 'all' || p.location.floor === floorFilter;
      const matchColor = colorFilter === 'all' || (colorFilter === 'color' ? p.colorCapability : !p.colorCapability);
      const matchFn =
        functionFilter === 'all' ||
        (functionFilter === 'mfp' ? p.functionType === 'MFP' : p.functionType === 'SFP');

      return matchSearch && matchStatus && matchMfr && matchBranch && matchFloor && matchColor && matchFn;
    });
  }, [printersInScope, searchQuery, statusFilter, mfrFilter, branchFilter, floorFilter, colorFilter, functionFilter]);

  const printerTaskMap = useMemo(() => {
    const map = new Map<string, number>();
    allTasks.forEach((t) => {
      if (t.status !== 'Completed' && t.status !== 'Cancelled') {
        map.set(t.printerId, (map.get(t.printerId) || 0) + 1);
      }
    });
    return map;
  }, [allTasks]);

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMfrFilter('all');
    setBranchFilter('all');
    setFloorFilter('all');
    setColorFilter('all');
    setFunctionFilter('all');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1440px', margin: '0 auto' }}>
      <PrintersPageHeader
        activeTab={mainTab}
        onTabChange={(tab) => {
          setInternalTab(tab);
          navigate(tab === 'printers' ? '/printers/list' : `/printers/${tab}`);
          if (onSubTabChange) onSubTabChange(tab);
        }}
        isAdmin={isAdmin}
        totalPrinters={printers.length}
        totalTasks={allTasks.length}
        isLoading={isLoading}
        onRefresh={loadData}
        onOpenCreatePrinter={() => modals.setIsCreatePrinterOpen(true)}
        onOpenBranchManager={() => modals.setIsBranchManagerOpen(true)}
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
            onOpenDrawer={modals.handleOpenDrawer}
            onOpenRelocate={modals.handleOpenRelocate}
            onOpenEdit={modals.handleOpenEdit}
            onDecommissionPrinter={modals.handleDecommissionPrinter}
            onReactivatePrinter={modals.handleReactivatePrinter}
            isAdmin={isAdmin}
          />
        </>
      )}

      {mainTab === 'timeline' && (
        <TaskTimelineCalendar tasks={allTasks} printers={printers} onOpenDrawer={modals.handleOpenDrawer} onRefreshTasks={loadData} />
      )}

      {mainTab === 'history' && (
        <WorkOrdersTable
          tasks={allTasks}
          printers={printers}
          onOpenTaskDetail={(p, tId) => modals.handleOpenDrawer(p, 'tasks', tId)}
          onSwitchToTimelineView={() => { setInternalTab('timeline'); navigate('/printers/timeline'); if (onSubTabChange) onSubTabChange('timeline'); }}
          onRefreshTasks={loadData}
        />
      )}

      <PrinterDiagnosticsDrawer
        printer={modals.selectedPrinter}
        isOpen={modals.isDrawerOpen}
        onClose={modals.handleCloseDrawer}
        initialTab={modals.drawerInitialTab}
        initialTaskId={modals.selectedTaskId}
        onTaskCreated={loadData}
        onTaskCompleted={loadData}
        onTaskUpdated={loadData}
      />
      <PrinterCreateModal isOpen={modals.isCreatePrinterOpen} onClose={() => modals.setIsCreatePrinterOpen(false)} onPrinterCreated={loadData} />
      <PrinterEditModal printer={modals.editingPrinter} isOpen={modals.isEditModalOpen} onClose={() => { modals.setIsEditModalOpen(false); modals.setEditingPrinter(null); }} onPrinterUpdated={loadData} />
      <PrinterRelocateModal printer={modals.relocatePrinter} isOpen={modals.isRelocateModalOpen} onClose={() => modals.setIsRelocateModalOpen(false)} onRelocateSuccess={loadData} />
      <BranchFloorManagerModal isOpen={modals.isBranchManagerOpen} onClose={() => { modals.setIsBranchManagerOpen(false); loadData(); }} printers={printers} />
    </div>
  );
};

export default PrintersPage;

