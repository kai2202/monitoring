/**
 * Frontend/src/pages/DashboardPage.tsx
 *
 * Trang Dashboard trung tâm của FleetMonitor theo chuẩn Matte Onyx Dark:
 * - 4 Thẻ KPI với In-place Filter & nút chuyển module ↗
 * - Biểu đồ đường cong Bezier mượt mà (AvailabilitySplineChart với Chart.js)
 * - Biểu đồ tròn đa tầng tinh xảo với nhãn trung tâm (RefinedFleetDonut với Chart.js)
 * - Bảng Thiết Bị Cần Xử Lý chi tiết 7 cột (AttentionDevicesTable)
 * - Slide-over Diagnostics Drawer 4 Tab hỗ trợ phím Esc và j/k
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FleetKpiCards,
  KpiFilterType,
  FleetKpiData,
  AvailabilitySplineChart,
  RefinedFleetDonut,
  AttentionDevicesTable,
  PrinterDiagnosticsDrawer,
} from '../components/dashboard';
import { NavTabId } from '../components/layout/Sidebar';
import { Printer, Incident } from '../types/printer';
import { MockAvailabilityPoint } from '../mocks/mockTelemetry';
import { dashboardService, telemetryService, printerService } from '../services';

export interface DashboardPageProps {
  onNavigateModule: (tab: NavTabId) => void;
  onCreateTaskForPrinter?: (printer: Printer) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateModule,
  onCreateTaskForPrinter,
}) => {
  // State dữ liệu
  const [kpiData, setKpiData] = useState<FleetKpiData>({
    totalPrinters: 35,
    onlineCount: 34,
    offlineCount: 1,
    unknownCount: 0,
    onlineRate: 97.1,
    activeAlertsCount: 4,
    criticalAlertsCount: 2,
    warningAlertsCount: 2,
    lowSuppliesCount: 3,
  });

  const [allPrinters, setAllPrinters] = useState<Printer[]>([]);
  const [attentionPrinters, setAttentionPrinters] = useState<Printer[]>([]);
  const [timeline, setTimeline] = useState<MockAvailabilityPoint[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State bộ lọc In-place Filter
  const [activeKpiFilter, setActiveKpiFilter] = useState<KpiFilterType>(null);
  const [selectedHealth, setSelectedHealth] = useState<string | null>(null);

  // State Drawer 640px
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerInitialTab, setDrawerInitialTab] = useState<'diag' | 'tasks' | 'counters'>('diag');

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
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Tính toán danh sách thiết bị hiển thị theo In-place Filter (< 50ms)
  const filteredPrinters = useMemo(() => {
    let result = activeKpiFilter === 'all' ? [...allPrinters] : [...attentionPrinters];

    if (activeKpiFilter === 'offline') {
      result = allPrinters.filter(p => p.connectionStatus === 'Offline');
    } else if (activeKpiFilter === 'critical') {
      result = allPrinters.filter(
        p => p.alertSeverity === 'critical' || p.health === 'Critical'
      );
    } else if (activeKpiFilter === 'low_supplies') {
      result = allPrinters.filter(p => {
        const s = p.supplies;
        return (
          (s.black !== null && s.black <= 10) ||
          (s.cyan !== null && s.cyan <= 10) ||
          (s.magenta !== null && s.magenta <= 10) ||
          (s.yellow !== null && s.yellow <= 10) ||
          (s.waste !== null && s.waste >= 90)
        );
      });
    }

    if (selectedHealth) {
      if (selectedHealth === 'Critical') {
        result = result.filter(
          p => p.health === 'Critical' || p.alertSeverity === 'critical' || p.connectionStatus === 'Offline'
        );
      } else if (selectedHealth === 'Warning') {
        result = result.filter(
          p => (p.health === 'Warning' || p.alertSeverity === 'warning') && p.connectionStatus !== 'Offline'
        );
      } else if (selectedHealth === 'Offline') {
        result = result.filter(p => p.connectionStatus === 'Offline');
      } else if (selectedHealth === 'Healthy') {
        result = result.filter(
          p => p.health !== 'Critical' && p.health !== 'Warning' && p.connectionStatus === 'Online'
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
    if (selectedHealth === 'Critical') return 'Nhóm máy in: Sự cố nguy cấp & Ngoại tuyến';
    if (selectedHealth) return `Nhóm sức khỏe: ${selectedHealth}`;
    return null;
  }, [activeKpiFilter, selectedHealth, allPrinters.length]);

  const handleClearFilters = useCallback(() => {
    setActiveKpiFilter(null);
    setSelectedHealth(null);
  }, []);

  // Mở Drawer chi tiết
  const handleOpenDrawer = useCallback((printer: Printer, tab: 'diag' | 'tasks' | 'counters' = 'diag') => {
    setSelectedPrinter(printer);
    setDrawerInitialTab(tab);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleNextPrinter = useCallback(() => {
    if (!selectedPrinter || filteredPrinters.length === 0) return;
    const currentIndex = filteredPrinters.findIndex(p => p.id === selectedPrinter.id);
    const nextIndex = (currentIndex + 1) % filteredPrinters.length;
    setSelectedPrinter(filteredPrinters[nextIndex]);
  }, [selectedPrinter, filteredPrinters]);

  const handlePrevPrinter = useCallback(() => {
    if (!selectedPrinter || filteredPrinters.length === 0) return;
    const currentIndex = filteredPrinters.findIndex(p => p.id === selectedPrinter.id);
    const prevIndex = (currentIndex - 1 + filteredPrinters.length) % filteredPrinters.length;
    setSelectedPrinter(filteredPrinters[prevIndex]);
  }, [selectedPrinter, filteredPrinters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Fleet KPI Cards (In-place Filter & ↗ Navigate) */}
      <FleetKpiCards
        data={kpiData}
        activeFilter={activeKpiFilter}
        onSelectFilter={filter => {
          setActiveKpiFilter(filter);
          setSelectedHealth(null);
        }}
        onNavigateModule={onNavigateModule}
        isLoading={isLoading}
      />

      {/* 2. Charts Grid: Line Chart (60%) + Refined Donut Chart (40%) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '16px',
        }}
      >
        <AvailabilitySplineChart
          timeline={timeline}
          isLoading={isLoading}
        />

        <RefinedFleetDonut
          printers={allPrinters}
          selectedHealth={selectedHealth}
          onSelectHealthGroup={health => {
            setSelectedHealth(prev => (prev === health ? null : health));
            setActiveKpiFilter(null);
          }}
          isLoading={isLoading}
        />
      </div>

      {/* 3. Detailed Attention Devices Table (7 Columns) */}
      <AttentionDevicesTable
        printers={filteredPrinters}
        onSelectPrinter={printer => handleOpenDrawer(printer, 'diag')}
        onCreateTask={printer => {
          if (onCreateTaskForPrinter) {
            onCreateTaskForPrinter(printer);
          } else {
            handleOpenDrawer(printer, 'tasks');
          }
        }}
        activeFilterTitle={activeFilterTitle}
        onClearFilter={handleClearFilters}
      />

      {/* 4. Slide-over Diagnostics Drawer 640px */}
      <PrinterDiagnosticsDrawer
        printer={selectedPrinter}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        initialTab={drawerInitialTab}
        onNextPrinter={filteredPrinters.length > 1 ? handleNextPrinter : undefined}
        onPrevPrinter={filteredPrinters.length > 1 ? handlePrevPrinter : undefined}
        onCreateMaintenanceTask={printer => {
          if (onCreateTaskForPrinter) {
            setIsDrawerOpen(false);
            onCreateTaskForPrinter(printer);
          } else {
            setDrawerInitialTab('tasks');
          }
        }}
      />
    </div>
  );
};
