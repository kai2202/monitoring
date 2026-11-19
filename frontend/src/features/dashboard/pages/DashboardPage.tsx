/**
 * Frontend/src/features/dashboard/pages/DashboardPage.tsx
 *
 * Trung Tâm Điều Hành NOC (/dashboard):
 * - Header: Bộ lọc Chi nhánh (Redux ui.selectedBranch) + Trạng thái độ tươi dữ liệu + Làm mới.
 * - Tầng 1: Strip KPI phẳng 4 ô với vạch sức khỏe đội máy & lọc in-place.
 * - Tầng 2: Xu Hướng Khả Dụng (7 cột, hỗ trợ thật 24h / 7d / 30d) + Vận Hành & Sự Cố Hiện Tại (5 cột).
 * - Tầng 3: Bảng Thiết Bị Cần Xử Lý (Tailwind Dark Mode, tìm kiếm + phân trang 5 dòng cố định).
 * - Slide-over Diagnostics Drawer 4 Tab & Modal tạo phiếu bảo trì tại chỗ.
 * - Tuân thủ AGENTS.md Rule 5, Rule 6 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '@/app/store';
import { setSelectedBranch } from '@/app/slices/uiSlice';
import { FontAwesomeIcon, faTriangleExclamation, faRotate } from '@/shared/icons';
import {
  DashboardHeader,
  FleetKpiCards,
  KpiFilterType,
  FleetKpiData,
  AvailabilitySplineChart,
  AvailabilityRange,
  ActiveOperationsCard,
  AttentionDevicesTable,
  PrinterDiagnosticsDrawer,
  DiagnosticsCreateTaskForm,
} from '../components';
import { SiteSummaryPanel } from '../components/SiteSummaryPanel';
import { NavTabId } from '@/components/layout/Sidebar';
import { Printer } from '@/types/printer';
import { Task } from '@/types/task';
import { AvailabilityTimelinePoint } from '@/types/dashboardTelemetry';
import {
  dashboardService,
  telemetryService,
  printerService,
  taskService,
  locationService,
} from '@/services';

export interface DashboardPageProps {
  onNavigateModule: (tab: NavTabId) => void;
  onCreateTaskForPrinter?: (printer: Printer) => void;
}

const RANGE_TO_HOURS: Record<AvailabilityRange, number> = {
  '24h': 24,
  '7d': 168,
  '30d': 720,
};

function hasLowSupply(p: Printer): boolean {
  const s = p.supplies;
  if (!s) return false;
  return (
    (s.black !== null && s.black !== undefined && s.black <= 15) ||
    (s.cyan !== null && s.cyan !== undefined && s.cyan <= 15) ||
    (s.magenta !== null && s.magenta !== undefined && s.magenta <= 15) ||
    (s.yellow !== null && s.yellow !== undefined && s.yellow <= 15) ||
    (s.waste !== null && s.waste !== undefined && s.waste >= 90)
  );
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateModule,
  onCreateTaskForPrinter,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const globalBranch = useSelector((state: RootState) => state.ui.selectedBranch);
  const baseBranches = locationService.getBranchNames();

  const [kpiData, setKpiData] = useState<FleetKpiData>({
    totalPrinters: 0,
    onlineCount: null,
    offlineCount: null,
    unknownCount: null,
    onlineRate: null,
    activeAlertsCount: null,
    criticalAlertsCount: null,
    warningAlertsCount: null,
    lowSuppliesCount: null,
  });

  const [allPrinters, setAllPrinters] = useState<Printer[]>([]);
  const [attentionPrinters, setAttentionPrinters] = useState<Printer[]>([]);
  const [timeline, setTimeline] = useState<AvailabilityTimelinePoint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const branches = useMemo(() => {
    const set = new Set<string>(baseBranches);
    allPrinters.forEach((p) => {
      const site = (p.branch || p.building || '').trim();
      if (site) set.add(site);
    });
    return Array.from(set);
  }, [baseBranches, allPrinters]);

  const selectedBranch = globalBranch && branches.includes(globalBranch) ? globalBranch : 'all';
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [timeRange, setTimeRange] = useState<AvailabilityRange>('24h');
  const [activeKpiFilter, setActiveKpiFilter] = useState<KpiFilterType>(null);

  // State Drawer 960px
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerInitialTab, setDrawerInitialTab] = useState<
    'diag' | 'tasks' | 'counters' | 'history'
  >('diag');
  const [drawerInitialTaskId, setDrawerInitialTaskId] = useState<string | undefined>(undefined);

  // State Modal Tạo Phiếu Bảo Trì Mới ngay tại Dashboard
  const [createTaskPrinter, setCreateTaskPrinter] = useState<Printer | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);

  const loadDashboardData = useCallback(
    async (manual = false) => {
      if (manual) setIsRefreshing(true);
      try {
        const hours = RANGE_TO_HOURS[timeRange];
        const [summaryRes, timelineRes, printersRes, tasksRes] = await Promise.allSettled([
          dashboardService.getDashboardSummary(),
          telemetryService.getAvailabilityTimeline(hours),
          printerService.getPrinters(),
          taskService.getTasks(),
        ]);

        const failedParts: string[] = [];

        if (summaryRes.status === 'fulfilled') {
          const dashSummary = summaryRes.value;
          setKpiData(dashSummary.kpis);
          setAttentionPrinters(dashSummary.devicesNeedingAttention);
          setLastSyncTime(dashSummary.lastSyncTime || new Date().toISOString());
          setIsStale(Boolean(dashSummary.isStale));
        } else {
          console.error('Lỗi tải tổng quan Dashboard:', summaryRes.reason);
          failedParts.push('Tổng quan KPI');
          setIsStale(true);
        }

        if (timelineRes.status === 'fulfilled') {
          setTimeline(timelineRes.value);
        } else {
          console.error('Lỗi tải biểu đồ khả dụng:', timelineRes.reason);
          failedParts.push('Biểu đồ khả dụng');
        }

        if (printersRes.status === 'fulfilled') {
          setAllPrinters(printersRes.value);
        } else {
          console.error('Lỗi tải danh sách máy in:', printersRes.reason);
          failedParts.push('Danh sách máy in');
        }

        if (tasksRes.status === 'fulfilled') {
          setTasks(tasksRes.value);
        } else {
          console.error('Lỗi tải danh sách phiếu bảo trì:', tasksRes.reason);
          failedParts.push('Phiếu bảo trì');
        }

        if (failedParts.length > 0) {
          setLoadError(`Không thể tải một phần dữ liệu (${failedParts.join(', ')}).`);
        } else {
          setLoadError(null);
        }
      } catch (err: any) {
        console.error('Lỗi khi nạp dữ liệu Dashboard Service:', err);
        setLoadError(
          err?.message || 'Không thể kết nối dịch vụ giám sát Zabbix / API Backend.'
        );
        setIsStale(true);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [timeRange]
  );

  useEffect(() => {
    loadDashboardData();
    const intervalId = setInterval(() => loadDashboardData(), 30_000);
    return () => clearInterval(intervalId);
  }, [loadDashboardData]);

  const branchPrinters = useMemo(
    () =>
      selectedBranch === 'all'
        ? allPrinters
        : allPrinters.filter((p) => p.branch === selectedBranch),
    [allPrinters, selectedBranch]
  );

  const branchAttentionPrinters = useMemo(
    () =>
      selectedBranch === 'all'
        ? attentionPrinters
        : attentionPrinters.filter((p) => p.branch === selectedBranch),
    [attentionPrinters, selectedBranch]
  );

  const effectiveKpiData = useMemo<FleetKpiData>(() => {
    if (selectedBranch === 'all') return kpiData;
    const total = branchPrinters.length;
    const offline = branchPrinters.filter((p) => p.connectionStatus === 'Offline').length;
    const online = Math.max(0, total - offline);
    const critical = branchPrinters.filter(
      (p) => p.alertSeverity === 'critical' || p.health === 'Critical'
    ).length;
    const warning = branchPrinters.filter(
      (p) =>
        (p.alertSeverity === 'warning' || p.health === 'Warning') &&
        p.alertSeverity !== 'critical' &&
        p.health !== 'Critical'
    ).length;
    const lowSup = branchPrinters.filter(hasLowSupply).length;

    return {
      totalPrinters: total,
      onlineCount: total > 0 ? online : kpiData.onlineCount !== null ? 0 : null,
      offlineCount: total > 0 ? offline : kpiData.offlineCount !== null ? 0 : null,
      unknownCount: 0,
      onlineRate: total > 0 ? (online / total) * 100 : null,
      activeAlertsCount: critical + warning,
      criticalAlertsCount: critical,
      warningAlertsCount: warning,
      lowSuppliesCount: lowSup,
    };
  }, [selectedBranch, branchPrinters, kpiData]);

  const branchPrinterIds = useMemo(
    () => new Set(branchPrinters.map((p) => p.id)),
    [branchPrinters]
  );

  const branchTasks = useMemo(
    () =>
      selectedBranch === 'all'
        ? tasks
        : tasks.filter((t) => branchPrinterIds.has(t.printerId)),
    [tasks, selectedBranch, branchPrinterIds]
  );

  const filteredPrinters = useMemo(() => {
    if (activeKpiFilter === 'all') return branchPrinters;
    if (activeKpiFilter === 'offline') {
      return branchPrinters.filter((p) => p.connectionStatus === 'Offline');
    }
    if (activeKpiFilter === 'critical') {
      return branchPrinters.filter(
        (p) => p.alertSeverity === 'critical' || p.health === 'Critical'
      );
    }
    if (activeKpiFilter === 'low_supplies') {
      return branchPrinters.filter(hasLowSupply);
    }
    return branchAttentionPrinters;
  }, [branchPrinters, branchAttentionPrinters, activeKpiFilter]);

  const activeFilterTitle = useMemo(() => {
    if (activeKpiFilter === 'all') return `Tất cả ${branchPrinters.length} thiết bị`;
    if (activeKpiFilter === 'offline') return 'Máy in mất kết nối (Offline)';
    if (activeKpiFilter === 'critical') return 'Sự cố nguy cấp (Critical)';
    if (activeKpiFilter === 'low_supplies') return 'Vật tư thấp (≤ 15%)';
    return null;
  }, [activeKpiFilter, branchPrinters.length]);

  const handleOpenDrawer = useCallback(
    (
      printer: Printer,
      tab: 'diag' | 'tasks' | 'counters' | 'history' = 'diag',
      taskId?: string
    ) => {
      setSelectedPrinter(printer);
      setDrawerInitialTab(tab);
      setDrawerInitialTaskId(taskId);
      setIsDrawerOpen(true);
    },
    []
  );

  const handleNextPrinter = useCallback(() => {
    if (!selectedPrinter || filteredPrinters.length === 0) return;
    const idx = filteredPrinters.findIndex((p) => p.id === selectedPrinter.id);
    setSelectedPrinter(filteredPrinters[(idx + 1) % filteredPrinters.length]);
  }, [selectedPrinter, filteredPrinters]);

  const handlePrevPrinter = useCallback(() => {
    if (!selectedPrinter || filteredPrinters.length === 0) return;
    const idx = filteredPrinters.findIndex((p) => p.id === selectedPrinter.id);
    setSelectedPrinter(
      filteredPrinters[(idx - 1 + filteredPrinters.length) % filteredPrinters.length]
    );
  }, [selectedPrinter, filteredPrinters]);

  const handleOpenCreateTaskModal = useCallback((printer: Printer) => {
    setCreateTaskPrinter(printer);
    setIsCreateTaskModalOpen(true);
  }, []);

  const handleCreateTaskSuccess = useCallback(
    async (newTask: Partial<Task>) => {
      try {
        const created = await taskService.createTask(
          newTask as any,
          user?.fullName || (user as any)?.name || 'Quản trị viên'
        );
        toast.success(
          `Đã tạo phiếu bảo trì ${created.id} cho thiết bị ${createTaskPrinter?.name || ''} thành công!`
        );
        setIsCreateTaskModalOpen(false);
        setCreateTaskPrinter(null);
        await loadDashboardData();
        if (onCreateTaskForPrinter && createTaskPrinter) {
          onCreateTaskForPrinter(createTaskPrinter);
        }
      } catch (err: any) {
        toast.error(err?.message || 'Không thể tạo phiếu bảo trì mới');
      }
    },
    [user, createTaskPrinter, onCreateTaskForPrinter, loadDashboardData]
  );

  return (
    <div className="flex flex-col gap-5 max-w-[1440px] mx-auto w-full min-w-0">
      {/* Header NOC + Bộ lọc Chi nhánh + Độ tươi dữ liệu */}
      <DashboardHeader
        branches={branches}
        selectedBranch={selectedBranch}
        onBranchChange={(b) => {
          dispatch(setSelectedBranch(b === 'all' ? '' : b));
          setActiveKpiFilter(null);
        }}
        lastSyncTime={lastSyncTime}
        isStale={isStale}
        isRefreshing={isRefreshing}
        onRefresh={() => loadDashboardData(true)}
      />

      {/* Cảnh báo lỗi kết nối dịch vụ giám sát (tách biệt với Offline thiết bị — AGENTS Rule 5.2) */}
      {loadError && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/30 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 font-medium">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-sm text-amber-600 shrink-0" />
            <span>
              Lỗi thu thập dữ liệu giám sát: {loadError} (Không đồng nghĩa máy in đang Offline)
            </span>
          </div>
          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold cursor-pointer hover:bg-amber-100/50 transition-colors"
          >
            <FontAwesomeIcon icon={faRotate} className="text-[11px]" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Tầng 1: Strip KPI Phẳng 4 Ô */}
      <div className="animate-card-in">
        <FleetKpiCards
          data={effectiveKpiData}
          activeFilter={activeKpiFilter}
          onSelectFilter={setActiveKpiFilter}
          onNavigateModule={onNavigateModule}
        />
      </div>

      {/* Tổng hợp gom nhóm theo Site / Chi nhánh */}
      {!isLoading && allPrinters.length > 0 && (
        <div className="animate-card-in">
          <SiteSummaryPanel
            printers={allPrinters}
            selectedBranch={selectedBranch}
            onSelectBranch={(b) => {
              dispatch(setSelectedBranch(b === 'all' ? '' : b));
              setActiveKpiFilter(null);
            }}
          />
        </div>
      )}

      {/* Tầng 2: Xu hướng khả dụng (7 cột) + Vận hành & Sự cố (5 cột) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch w-full min-w-0 animate-card-in animate-card-delay-1">
        <div className="xl:col-span-7 min-w-0">
          <AvailabilitySplineChart
            timeline={timeline}
            isLoading={isLoading}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>
        <div className="xl:col-span-5 min-w-0">
          <ActiveOperationsCard
            tasks={branchTasks}
            printers={branchPrinters}
            isLoading={isLoading}
            onSelectTask={(printer, taskId) => {
              if (printer) handleOpenDrawer(printer, 'tasks', taskId);
              else onNavigateModule('printers-history');
            }}
            onNavigateWorkOrders={() => onNavigateModule('printers-history')}
          />
        </div>
      </div>

      {/* Tầng 3: Bảng Thiết Bị Cần Xử Lý */}
      <div className="animate-card-in animate-card-delay-2">
        <AttentionDevicesTable
          printers={filteredPrinters}
          onSelectPrinter={(printer) => handleOpenDrawer(printer, 'diag')}
          onCreateTask={handleOpenCreateTaskModal}
          activeFilterTitle={activeFilterTitle}
          onClearFilter={() => setActiveKpiFilter(null)}
        />
      </div>

      {/* Slide-over Diagnostics Drawer */}
      <PrinterDiagnosticsDrawer
        printer={selectedPrinter}
        allPrinters={allPrinters}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        initialTab={drawerInitialTab}
        initialTaskId={drawerInitialTaskId}
        onNextPrinter={filteredPrinters.length > 1 ? handleNextPrinter : undefined}
        onPrevPrinter={filteredPrinters.length > 1 ? handlePrevPrinter : undefined}
        onCreateMaintenanceTask={(printer) => {
          setIsDrawerOpen(false);
          handleOpenCreateTaskModal(printer);
        }}
        onPrinterUpdated={(updated) => {
          setSelectedPrinter(updated);
          setAllPrinters((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          setAttentionPrinters((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }}
        onTaskCreated={() => loadDashboardData()}
        onTaskCompleted={() => loadDashboardData()}
      />

      {/* Modal Tạo Phiếu Bảo Trì Mới */}
      {createTaskPrinter && (
        <DiagnosticsCreateTaskForm
          isOpen={isCreateTaskModalOpen}
          onClose={() => {
            setIsCreateTaskModalOpen(false);
            setCreateTaskPrinter(null);
          }}
          printer={createTaskPrinter}
          onCreateTask={handleCreateTaskSuccess}
        />
      )}
    </div>
  );
};

export default DashboardPage;
