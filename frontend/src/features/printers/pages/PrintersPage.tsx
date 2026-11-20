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
  PrinterEditModal,
  PrinterInitializeDrawer,
  PrintersPageHeader,
  FleetHealthBar,
  GeneralAffairsInventoryHub,
} from '../components';
import { exportPrintersToCsv } from '../utils/printerCsvExport';
import { getPrinterSizeCategory } from '../utils/deviceSize';
import { usePrinterModals } from '../hooks/usePrinterModals';

export interface PrintersPageProps {
  onNavigateModule?: (tab: NavTabId) => void;
  onCreateTaskForPrinter?: (printer: Printer) => void;
  initialFilter?: string;
  preselectedPrinterForTask?: Printer | null;
  onClearPreselectedPrinter?: () => void;
  activeSubTab?: 'printers' | 'inventory' | 'timeline' | 'history';
  onSubTabChange?: (subTab: 'printers' | 'inventory' | 'timeline' | 'history') => void;
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
  const [internalTab, setInternalTab] = useState<'printers' | 'inventory' | 'timeline' | 'history'>(activeSubTab);
  const mainTab = activeSubTab || internalTab;

  useEffect(() => {
    if (activeSubTab) setInternalTab(activeSubTab);
  }, [activeSubTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter || searchParams.get('filter') || 'all');
  const [mfrFilter, setMfrFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [initializingPrinter, setInitializingPrinter] = useState<Printer | null>(null);
  const [subnetFilter, setSubnetFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [functionFilter, setFunctionFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState<'all' | 'desktop' | 'large'>(() => {
    const s = searchParams.get('size');
    return s === 'desktop' || s === 'large' ? s : 'all';
  });
  const [managingTeamFilter, setManagingTeamFilter] = useState('all');

  useEffect(() => {
    const paramFilter = searchParams.get('filter');
    if (paramFilter) setStatusFilter(paramFilter);
    else if (initialFilter) setStatusFilter(initialFilter);
    const paramSize = searchParams.get('size');
    if (paramSize === 'desktop' || paramSize === 'large') setSizeFilter(paramSize);
  }, [searchParams, initialFilter]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [printerList, taskList] = await Promise.all([printerService.getPrinters(), taskService.getTasks()]);
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
    const intervalId = setInterval(loadData, 30_000);
    return () => clearInterval(intervalId);
  }, [loadData]);

  const modals = usePrinterModals(loadData, printers);

  const [locationBranches, setLocationBranches] = useState(() => locationService.getBranches());
  useEffect(() => locationService.subscribe(() => setLocationBranches(locationService.getBranches())), []);

  const branches = useMemo(() => {
    const set = new Set<string>(locationBranches.map((b) => b.name).filter(Boolean));
    printers.forEach((p) => {
      const site = (p.branch || p.building || '').trim();
      if (site) set.add(site);
    });
    return Array.from(set);
  }, [locationBranches, printers]);

  const floors = useMemo(() => {
    if (branchFilter === 'all') return [];
    const set = new Set<string>(locationService.getFloorsByBranch(branchFilter));
    printers.forEach((p) => {
      const site = (p.branch || p.building || '').trim();
      if (site.toLowerCase() === branchFilter.toLowerCase() && p.floor) {
        set.add(p.floor);
      }
    });
    return Array.from(set);
  }, [branchFilter, locationBranches, printers]);
  const branchSubnets = useMemo(() => {
    const map: Record<string, string | null | undefined> = {};
    locationBranches.forEach((b) => {
      if (b.name && b.subnetCidr) map[b.name] = b.subnetCidr;
    });
    return map;
  }, [locationBranches]);

  const subnets = useMemo(() => {
    const set = new Set<string>();
    locationBranches.forEach((b) => {
      if (b.subnetCidr) {
        b.subnetCidr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => set.add(s));
      }
    });
    printers.forEach((p) => {
      const parts = (p.ip || '').trim().split('.');
      if (parts.length === 4 && parts.every((seg) => /^\d+$/.test(seg))) {
        set.add(`${parts[0]}.${parts[1]}.${parts[2]}.0/24`);
      }
    });
    return Array.from(set).sort();
  }, [locationBranches, printers]);

  const manufacturers = useMemo(() => Array.from(new Set(printers.map((p) => p.mfr))).filter(Boolean), [printers]);
  const managingTeams = useMemo(() => Array.from(new Set(printers.map((p) => p.managingTeam).filter(Boolean))) as string[], [printers]);

  const printersInScope = useMemo(() => {
    if (isAdmin || !user?.dataScope?.branchNames?.length) return printers;
    return printers.filter((p) => {
      const b = p.branch || (p.location ? p.location.split(' - ')[0] : '');
      return user.dataScope?.branchNames?.includes(b);
    });
  }, [printers, isAdmin, user]);

  const tasksInScope = useMemo(() => {
    if (isAdmin || !user?.dataScope?.branchNames?.length) return allTasks;
    const allowedIds = new Set(printersInScope.map((p) => p.id));
    return allTasks.filter((t) => allowedIds.has(t.printerId));
  }, [allTasks, printersInScope, isAdmin, user]);

  const filteredPrinters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return printersInScope.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.ip.includes(q) ||
        p.model.toLowerCase().includes(q) ||
        (p.serial && p.serial.toLowerCase().includes(q)) ||
        (p.custodianName && p.custodianName.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q));

      const isOff = p.connectionStatus === 'Offline' || p.status === 'Offline' || p.monitoringStatus === 'Storage' || p.monitoringStatus === 'Decommissioned';
      const isCritical = p.health === 'Critical' || p.alertSeverity === 'critical' || (p.incidents && p.incidents.some((i) => i.status === 'Active' && i.severity === 'Critical'));
      const isWarning = p.health === 'Warning' || p.alertSeverity === 'warning';

      const matchStatus =
        statusFilter === 'all' ||
        ((statusFilter === 'healthy' || statusFilter === 'online') && !isOff && !isCritical && !isWarning) ||
        (statusFilter === 'warning' && !isOff && isWarning && !isCritical) ||
        ((statusFilter === 'critical' || statusFilter === 'error') && !isOff && isCritical) ||
        ((statusFilter === 'offline' || statusFilter === 'storage') && isOff);

      const matchMfr = mfrFilter === 'all' || p.mfr === mfrFilter;
      const matchBranch = branchFilter === 'all' || p.branch === branchFilter || (p.location && p.location.includes(branchFilter));
      const matchSubnet = (() => {
        if (subnetFilter === 'all') return true;
        const prefix = subnetFilter.replace(/\.0\/24$/, '.');
        return (p.ip || '').startsWith(prefix);
      })();
      const matchFloor = floorFilter === 'all' || p.floor === floorFilter || (p.location && p.location.includes(floorFilter));
      const isColor = p.colorCapability === 'Color' || p.deviceType.toLowerCase().includes('color');
      const matchColor = colorFilter === 'all' || (colorFilter === 'color' ? isColor : !isColor);
      const isMfp = p.deviceType.includes('MFP');
      const matchFn = functionFilter === 'all' || (functionFilter === 'mfp' ? isMfp : !isMfp);
      const matchSize = sizeFilter === 'all' || getPrinterSizeCategory(p.deviceType) === sizeFilter;
      const matchTeam = managingTeamFilter === 'all' || p.managingTeam === managingTeamFilter;

      return matchSearch && matchStatus && matchMfr && matchBranch && matchSubnet && matchFloor && matchColor && matchFn && matchSize && matchTeam;
    });
  }, [printersInScope, searchQuery, statusFilter, mfrFilter, branchFilter, subnetFilter, floorFilter, colorFilter, functionFilter, sizeFilter, managingTeamFilter]);

  const printerTaskMap = useMemo(() => {
    const map = new Map<string, { active: number; total: number; latestTask?: Task }>();
    tasksInScope.forEach((t) => {
      const existing = map.get(t.printerId) || { active: 0, total: 0 };
      const isActive = t.status !== 'Completed' && t.status !== 'Cancelled';
      const nextLatest = !existing.latestTask || isActive ? t : existing.latestTask;
      map.set(t.printerId, {
        active: existing.active + (isActive ? 1 : 0),
        total: existing.total + 1,
        latestTask: nextLatest,
      });
    });
    return map;
  }, [tasksInScope]);

  const handleCopyIp = (e: React.MouseEvent, ip: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMfrFilter('all');
    setBranchFilter('all');
    setSubnetFilter('all');
    setFloorFilter('all');
    setColorFilter('all');
    setFunctionFilter('all');
    setSizeFilter('all');
    setManagingTeamFilter('all');
  };

  const handleStepDrawerPrinter = useCallback((delta: 1 | -1) => {
    if (!modals.selectedPrinter || filteredPrinters.length === 0) return;
    const idx = filteredPrinters.findIndex((p) => p.id === modals.selectedPrinter?.id);
    if (idx === -1) return;
    const nextIdx = (idx + delta + filteredPrinters.length) % filteredPrinters.length;
    modals.handleOpenDrawer(filteredPrinters[nextIdx], modals.drawerInitialTab);
  }, [filteredPrinters, modals]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1440px', margin: '0 auto' }}>
      <PrintersPageHeader
        activeTab={mainTab}
        onTabChange={(tab) => {
          setInternalTab(tab);
          navigate(tab === 'printers' ? '/printers/list' : `/printers/${tab}`);
          if (onSubTabChange) onSubTabChange(tab);
        }}
        isAdmin={isAdmin} totalPrinters={printersInScope.length} totalTasks={tasksInScope.length}
        isLoading={isLoading} onRefresh={loadData}
        onOpenCreatePrinter={() => modals.setIsCreatePrinterOpen(true)}
        onExportCsv={() => exportPrintersToCsv(filteredPrinters)}
      />

      {/* Nội dung Sub-tab với Page Transition mượt mà */}
      <div key={mainTab} className="page-transition flex flex-col gap-4">
        {mainTab === 'printers' && (
          <>
            <FleetHealthBar printers={printersInScope} selectedFilter={statusFilter} onSelectFilter={setStatusFilter} />
            <PrinterFilterToolbar
              searchQuery={searchQuery} onSearchChange={setSearchQuery}
              statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
              mfrFilter={mfrFilter} onMfrFilterChange={setMfrFilter} manufacturers={manufacturers}
              branchFilter={branchFilter} onBranchFilterChange={(b) => { setBranchFilter(b); setFloorFilter('all'); if (b !== 'all') dispatch(setSelectedBranch(b)); }}
              branches={branches} branchSubnets={branchSubnets}
              subnetFilter={subnetFilter} onSubnetFilterChange={setSubnetFilter} subnets={subnets}
              floorFilter={floorFilter} onFloorFilterChange={setFloorFilter} floors={floors}
              colorFilter={colorFilter} onColorFilterChange={setColorFilter}
              functionFilter={functionFilter} onFunctionFilterChange={setFunctionFilter}
              sizeFilter={sizeFilter} onSizeFilterChange={setSizeFilter}
              managingTeamFilter={managingTeamFilter} onManagingTeamFilterChange={setManagingTeamFilter}
              managingTeams={managingTeams} totalPrinters={printersInScope.length} onResetAllFilters={handleResetAllFilters}
            />
            <PrinterTableView
              printers={filteredPrinters} printerTaskMap={printerTaskMap} copiedIp={copiedIp}
              onCopyIp={handleCopyIp} onOpenDrawer={modals.handleOpenDrawer}
              onEditPrinter={(p) => setInitializingPrinter(p)}
              isAdmin={isAdmin}
            />
          </>
        )}

        {mainTab === 'inventory' && (
          <GeneralAffairsInventoryHub
            printers={printersInScope} onRefresh={loadData}
            onEditPrinter={(p) => { modals.setEditingPrinter(p); modals.setIsEditModalOpen(true); }}
            onOpenDrawer={modals.handleOpenDrawer} onOpenBranchManager={() => modals.setIsBranchManagerOpen(true)}
          />
        )}

        {mainTab === 'timeline' && (
          <TaskTimelineCalendar tasks={tasksInScope} printers={printersInScope} onOpenDrawer={modals.handleOpenDrawer} onRefreshTasks={loadData} />
        )}

        {mainTab === 'history' && (
          <WorkOrdersTable
            tasks={tasksInScope} printers={printersInScope}
            onOpenTaskDetail={(p, tId) => modals.handleOpenDrawer(p, 'tasks', tId)}
            onSwitchToTimelineView={() => { setInternalTab('timeline'); navigate('/printers/timeline'); if (onSubTabChange) onSubTabChange('timeline'); }}
            onRefreshTasks={loadData}
          />
        )}
      </div>

      <PrinterDiagnosticsDrawer
        printer={modals.selectedPrinter} allPrinters={printers} isOpen={modals.isDrawerOpen} onClose={modals.handleCloseDrawer}
        initialTab={modals.drawerInitialTab} initialTaskId={modals.selectedTaskId}
        onNextPrinter={filteredPrinters.length > 1 ? () => handleStepDrawerPrinter(1) : undefined}
        onPrevPrinter={filteredPrinters.length > 1 ? () => handleStepDrawerPrinter(-1) : undefined}
        onTaskCreated={loadData} onTaskCompleted={loadData} onTaskUpdated={loadData} onPrinterUpdated={loadData}
        onOpenEdit={modals.handleOpenEdit} onOpenRelocate={modals.handleOpenRelocate}
        onDecommissionPrinter={modals.handleDecommissionPrinter} onReactivatePrinter={modals.handleReactivatePrinter}
      />
      <PrinterInitializeDrawer
        printer={initializingPrinter}
        isOpen={Boolean(initializingPrinter)}
        onClose={() => setInitializingPrinter(null)}
        onInitialized={loadData}
      />
      <PrinterEditModal
        printer={modals.editingPrinter} isOpen={modals.isEditModalOpen}
        onClose={() => { modals.setIsEditModalOpen(false); modals.setEditingPrinter(null); }}
        onPrinterUpdated={loadData} onOpenDrawer={modals.handleOpenDrawer}
      />
      <PrinterRelocateModal
        printer={modals.relocatePrinter} isOpen={modals.isRelocateModalOpen} onClose={() => modals.setIsRelocateModalOpen(false)}
        onRelocateSuccess={async (printerId, loc) => {
          try {
            await printerService.updatePrinter(printerId, { branch: loc.branch, floor: loc.floor, department: loc.department, location: loc.fullLocation, handoverReason: loc.reason, gridX: null, gridY: null });
            await loadData();
          } catch (err) { console.error('Lỗi khi lưu điều chuyển:', err); }
        }}
      />
      <BranchFloorManagerModal isOpen={modals.isBranchManagerOpen} onClose={() => { modals.setIsBranchManagerOpen(false); loadData(); }} printers={printers} />
    </div>);
};

export default PrintersPage;

