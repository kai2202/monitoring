/**
 * Frontend/src/pages/DashboardPage.tsx
 *
 * Trang Dashboard trung tâm của FleetMonitor theo chuẩn Matte Onyx Dark:
 * - 4 Thẻ KPI với In-place Filter & nút chuyển module ↗
 * - Biểu đồ Bezier mượt mà (AvailabilitySplineChart) & Biểu đồ tròn đa tầng (RefinedFleetDonut)
 * - Bảng Thiết Bị Cần Xử Lý chi tiết với nút [Tạo Phiếu] mở modal tạo phiếu bảo trì mới trực tiếp tại Dashboard
 * - Slide-over Diagnostics Drawer 4 Tab hỗ trợ phím Esc và j/k
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../app/store';
import {
  FleetKpiCards,
  KpiFilterType,
  FleetKpiData,
  AvailabilitySplineChart,
  RefinedFleetDonut,
  AttentionDevicesTable,
  PrinterDiagnosticsDrawer,
  DiagnosticsCreateTaskForm,
} from '../components/dashboard';
import { NavTabId } from '../components/layout/Sidebar';
import { Printer, Incident } from '../types/printer';
import { Task } from '../types/task';
import { AvailabilityTimelinePoint } from '../types/dashboardTelemetry';
import { dashboardService, telemetryService, printerService, taskService } from '../services';

export interface DashboardPageProps {
  onNavigateModule: (tab: NavTabId) => void;
  onCreateTaskForPrinter?: (printer: Printer) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateModule,
  onCreateTaskForPrinter,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

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
  const [, setRecentIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State bộ lọc In-place Filter
  const [activeKpiFilter, setActiveKpiFilter] = useState<KpiFilterType>(null);
  const [selectedHealth, setSelectedHealth] = useState<string | null>(null);

  // State Drawer 640px
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerInitialTab, setDrawerInitialTab] = useState<'diag' | 'tasks' | 'counters'>('diag');

  // State Modal Tạo Phiếu Bảo Trì Mới ngay tại Dashboard
  const [createTaskPrinter, setCreateTaskPrinter] = useState<Printer | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);

  // Nạp dữ liệu qua Service Layer
  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [dashSummary, availTimeline, printers] = await Promise.all([
          dashboardService.getDashboardSummary(),
          telemetryService.getAvailabilityTimeline(24),
          printerService.getPrinters(),
        ]);
        if (!isMounted) return;
        setKpiData(dashSummary.kpis);
        setAttentionPrinters(dashSummary.devicesNeedingAttention);
        setTimeline(availTimeline);
        setAllPrinters(printers);
        setRecentIncidents(dashSummary.recentIncidents);
      } catch (err) {
        console.error('Lỗi khi nạp dữ liệu Dashboard Service:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Tính toán danh sách thiết bị hiển thị theo In-place Filter
  const filteredPrinters = useMemo(() => {
    let result = activeKpiFilter === 'all' ? [...allPrinters] : [...attentionPrinters];

    if (activeKpiFilter === 'offline') {
      result = allPrinters.filter((p) => p.connectionStatus === 'Offline');
    } else if (activeKpiFilter === 'critical') {
      result = allPrinters.filter((p) => p.alertSeverity === 'critical' || p.health === 'Critical');
    } else if (activeKpiFilter === 'low_supplies') {
      result = allPrinters.filter((p) => {
        const s = p.supplies;
        if (!s) return false;
        return (
          (s.black !== null && s.black !== undefined && s.black <= 10) ||
          (s.cyan !== null && s.cyan !== undefined && s.cyan <= 10) ||
          (s.magenta !== null && s.magenta !== undefined && s.magenta <= 10) ||
          (s.yellow !== null && s.yellow !== undefined && s.yellow <= 10) ||
          (s.waste !== null && s.waste !== undefined && s.waste >= 90)
        );
      });
    }

    if (selectedHealth) {
      if (selectedHealth === 'Critical') {
        result = result.filter(
          (p) => (p.health === 'Critical' || p.alertSeverity === 'critical') && p.connectionStatus !== 'Offline' && p.monitoringStatus !== 'Storage' && p.monitoringStatus !== 'Decommissioned'
        );
      } else if (selectedHealth === 'Warning') {
        result = result.filter(
          (p) => (p.health === 'Warning' || p.alertSeverity === 'warning') && p.health !== 'Critical' && p.alertSeverity !== 'critical' && p.connectionStatus !== 'Offline'
        );
      } else if (selectedHealth === 'Offline') {
        result = result.filter(
          (p) => p.connectionStatus === 'Offline' || p.monitoringStatus === 'Storage' || p.monitoringStatus === 'Decommissioned'
        );
      } else if (selectedHealth === 'Healthy') {
        result = result.filter(
          (p) => p.health !== 'Critical' && p.health !== 'Warning' && p.alertSeverity !== 'critical' && p.alertSeverity !== 'warning' && p.connectionStatus === 'Online'
        );
      }
    }

    return result;
  }, [allPrinters, attentionPrinters, activeKpiFilter, selectedHealth]);

  const activeFilterTitle = useMemo(() => {
    if (activeKpiFilter === 'all') return `Tất cả ${allPrinters.length} thiết bị`;
    if (activeKpiFilter === 'offline') return 'Máy in mất kết nối (Offline)';
    if (activeKpiFilter === 'critical') return 'Sự cố nguy cấp (Critical)';
    if (activeKpiFilter === 'low_supplies') return 'Vật tư thấp (≤ 10%)';
    if (selectedHealth === 'Healthy') return 'Nhóm máy in: Trực tuyến / Ổn định';
    if (selectedHealth === 'Warning') return 'Nhóm máy in: Cảnh báo vật tư';
    if (selectedHealth === 'Critical') return 'Nhóm máy in: Sự cố phần cứng';
    if (selectedHealth === 'Offline') return 'Nhóm máy in: Ngoại tuyến / Lưu kho';
    if (selectedHealth) return `Nhóm sức khỏe: ${selectedHealth}`;
    return null;
  }, [activeKpiFilter, selectedHealth, allPrinters.length]);

  const handleClearFilters = useCallback(() => {
    setActiveKpiFilter(null);
    setSelectedHealth(null);
  }, []);

  const handleOpenDrawer = useCallback((printer: Printer, tab: 'diag' | 'tasks' | 'counters' = 'diag') => {
    setSelectedPrinter(printer);
    setDrawerInitialTab(tab);
    setIsDrawerOpen(true);
  }, []);

  const handleNextPrinter = useCallback(() => {
    if (!selectedPrinter || filteredPrinters.length === 0) return;
    const currentIndex = filteredPrinters.findIndex((p) => p.id === selectedPrinter.id);
    setSelectedPrinter(filteredPrinters[(currentIndex + 1) % filteredPrinters.length]);
  }, [selectedPrinter, filteredPrinters]);

  const handlePrevPrinter = useCallback(() => {
    if (!selectedPrinter || filteredPrinters.length === 0) return;
    const currentIndex = filteredPrinters.findIndex((p) => p.id === selectedPrinter.id);
    setSelectedPrinter(filteredPrinters[(currentIndex - 1 + filteredPrinters.length) % filteredPrinters.length]);
  }, [selectedPrinter, filteredPrinters]);

  // Mở modal Tạo Phiếu Bảo Trì Mới trực tiếp tại Dashboard
  const handleOpenCreateTaskModal = useCallback((printer: Printer) => {
    setCreateTaskPrinter(printer);
    setIsCreateTaskModalOpen(true);
  }, []);

  const handleCreateTaskSuccess = useCallback(async (newTask: Partial<Task>) => {
    try {
      const created = await taskService.createTask(
        newTask as any,
        user?.fullName || (user as any)?.name || 'Quản trị viên'
      );
      toast.success(`Đã tạo phiếu bảo trì ${created.id} cho thiết bị ${createTaskPrinter?.name || ''} thành công!`);
      setIsCreateTaskModalOpen(false);
      setCreateTaskPrinter(null);
      if (onCreateTaskForPrinter && createTaskPrinter) {
        onCreateTaskForPrinter(createTaskPrinter);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo phiếu bảo trì mới');
    }
  }, [user, createTaskPrinter, onCreateTaskForPrinter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto', width: '100%', minWidth: 0 }}>
      {/* 1. Fleet KPI Cards (In-place Filter & ↗ Navigate) */}
      <FleetKpiCards
        data={kpiData}
        activeFilter={activeKpiFilter}
        onSelectFilter={(filter) => {
          setActiveKpiFilter(filter);
          setSelectedHealth(null);
        }}
        onNavigateModule={onNavigateModule}
        isLoading={isLoading}
      />

      {/* 2. Charts Grid: Line Chart + Donut Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: '16px', width: '100%', minWidth: 0 }}>
        <AvailabilitySplineChart timeline={timeline} isLoading={isLoading} />
        <RefinedFleetDonut
          printers={allPrinters}
          selectedHealth={selectedHealth}
          onSelectHealthGroup={(health) => {
            setSelectedHealth((prev) => (prev === health ? null : health));
            setActiveKpiFilter(null);
          }}
          isLoading={isLoading}
        />
      </div>

      {/* 3. Detailed Attention Devices Table với nút [Tạo Phiếu] mở modal tại Dashboard */}
      <AttentionDevicesTable
        printers={filteredPrinters}
        onSelectPrinter={(printer) => handleOpenDrawer(printer, 'diag')}
        onCreateTask={handleOpenCreateTaskModal}
        activeFilterTitle={activeFilterTitle}
        onClearFilter={handleClearFilters}
      />

      {/* 4. Slide-over Diagnostics Drawer 640px */}
      <PrinterDiagnosticsDrawer
        printer={selectedPrinter}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        initialTab={drawerInitialTab}
        onNextPrinter={filteredPrinters.length > 1 ? handleNextPrinter : undefined}
        onPrevPrinter={filteredPrinters.length > 1 ? handlePrevPrinter : undefined}
        onCreateMaintenanceTask={(printer) => {
          setIsDrawerOpen(false);
          handleOpenCreateTaskModal(printer);
        }}
      />

      {/* 5. Modal Tạo Phiếu Bảo Trì Mới ngay tại Dashboard */}
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
