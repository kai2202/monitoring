/**
 * Frontend/src/features/analytics/components/supplies/SuppliesForecastingSection.tsx
 *
 * Tab 2: Dự báo vật tư & Linh kiện (Supplies Forecasting Bento Grid):
 * - Tinh gọn toàn bộ dữ liệu thành 2 Bảng Dữ Liệu dạng Table rõ ràng:
 *   1. UrgentConsumablesAlertsTable (Bảng Cảnh báo cạn kiệt chủ động <15% & <25%)
 *   2. HighLoadFleetSuppliesTable (Bảng Mức vật tư hạm đội tải cao với Segmented Pills CMYK + Waste Toner)
 * - Tích hợp SuppliesSummaryBentoCards, SuppliesFilterToolbar, SuppliesDispatchModal và Diagnostics Drawer.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { FloorTabId, ConsumableAlertItem, PrinterConsumablesOverview } from '../../../../types/analyticsUI';
import { Printer } from '../../../../types/printer';
import { MOCK_CONSUMABLE_ALERTS, getMockPrinterConsumablesOverview } from '../../../../mocks/mockAnalyticsUIData';
import { SuppliesFilterToolbar, SuppliesFilterMode } from './SuppliesFilterToolbar';
import { SuppliesSummaryBentoCards } from './SuppliesSummaryBentoCards';
import { UrgentConsumablesAlertsTable } from './UrgentConsumablesAlertsTable';
import { HighLoadFleetSuppliesTable } from './HighLoadFleetSuppliesTable';
import { SuppliesDispatchModal } from './SuppliesDispatchModal';
import { PrinterDiagnosticsDrawer } from '../../../dashboard/components/diagnostics/PrinterDiagnosticsDrawer';

export interface SuppliesForecastingSectionProps {
  onCreateTaskForPrinter?: (printer: any) => void;
}

export const SuppliesForecastingSection: React.FC<SuppliesForecastingSectionProps> = ({
  onCreateTaskForPrinter,
}) => {
  const [statusFilter, setStatusFilter] = useState<SuppliesFilterMode>('all');
  const [activeFloor, setActiveFloor] = useState<FloorTabId>('all');
  const [selectedAlert, setSelectedAlert] = useState<ConsumableAlertItem | null>(null);
  const [drawerPrinter, setDrawerPrinter] = useState<Printer | null>(null);

  const allAlerts = MOCK_CONSUMABLE_ALERTS;
  const allDevicesOverview = useMemo(() => getMockPrinterConsumablesOverview(), []);

  // Lọc Bảng 1: Cảnh báo cạn kiệt chủ động
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((item) => {
      if (statusFilter === 'critical' && item.currentPercent >= 15) return false;
      if (statusFilter === 'warning' && (item.currentPercent < 15 || item.currentPercent >= 25)) return false;
      if (statusFilter === 'normal' && item.currentPercent < 25) return false;
      if (statusFilter === 'waste_warning') return false; // Bảng 1 theo dõi linh kiện cạn kiệt

      if (activeFloor !== 'all') {
        const floorMap: Record<FloorTabId, string> = {
          all: '',
          'floor-1': 'Tầng 1',
          'floor-2': 'Tầng 2',
          'floor-3': 'Tầng 3',
          'floor-4': 'Tầng 4',
          'floor-5': 'Tầng 5',
          'floor-compare': '',
        };
        if (floorMap[activeFloor] && !item.floor.includes(floorMap[activeFloor])) {
          return false;
        }
      }

      return true;
    });
  }, [allAlerts, statusFilter, activeFloor]);

  // Lọc Bảng 2: Hạm đội máy tải cao đồng bộ theo tầng và trạng thái
  const filteredHeavyLoadPrinters = useMemo(() => {
    let list = allDevicesOverview;
    if (activeFloor !== 'all') {
      list = list.filter((p) => p.floorId === activeFloor);
    }
    if (statusFilter === 'waste_warning') {
      list = list.filter((p) => p.wasteToner === 'Sắp đầy' || p.wasteToner === 'Đầy');
    } else if (statusFilter === 'critical') {
      list = list.filter(
        (p) =>
          (p.tonerK ?? 100) < 15 ||
          (p.tonerC ?? 100) < 15 ||
          (p.tonerM ?? 100) < 15 ||
          (p.tonerY ?? 100) < 15 ||
          (p.drumLife ?? 100) < 15 ||
          (p.fuserLife ?? 100) < 15 ||
          p.wasteToner === 'Đầy'
      );
    } else if (statusFilter === 'warning') {
      list = list.filter(
        (p) =>
          ((p.tonerK ?? 100) >= 15 && (p.tonerK ?? 100) < 25) ||
          ((p.tonerC ?? 100) >= 15 && (p.tonerC ?? 100) < 25) ||
          ((p.tonerM ?? 100) >= 15 && (p.tonerM ?? 100) < 25) ||
          ((p.tonerY ?? 100) >= 15 && (p.tonerY ?? 100) < 25) ||
          p.wasteToner === 'Sắp đầy'
      );
    }
    return list;
  }, [allDevicesOverview, activeFloor, statusFilter]);

  const criticalCount = allAlerts.filter((a) => a.currentPercent < 15).length;
  const warningCount = allAlerts.filter((a) => a.currentPercent >= 15 && a.currentPercent < 25).length;
  const wasteWarningCount = allDevicesOverview.filter(
    (p) => p.wasteToner === 'Sắp đầy' || p.wasteToner === 'Đầy'
  ).length;
  const soonestEmptyDays = Math.min(...allAlerts.map((a) => a.daysRemaining));

  // Thao tác tạo Task cấp phát qua modal
  const handleConfirmDispatch = (payload: { alertItem: ConsumableAlertItem }) => {
    if (onCreateTaskForPrinter) {
      onCreateTaskForPrinter({
        id: payload.alertItem.printerId,
        name: payload.alertItem.printerName,
        model: payload.alertItem.model,
        location: payload.alertItem.floor,
        status: 'Online',
        customField: `Lệnh cấp phát vật tư: ${payload.alertItem.itemName}`,
      });
    }
  };

  // Mở Slide-over Diagnostics Drawer khi click dòng trên Bảng 2
  const handleOpenDiagnostics = (p: PrinterConsumablesOverview) => {
    const printerObj: Printer = {
      id: p.printerId,
      name: p.printerName,
      model: p.model,
      location: `${p.floor} - ${p.department}`,
      connectionStatus: 'Online',
      health:
        p.tonerK < 15 || p.tonerC < 15 || p.tonerM < 15 || p.tonerY < 15 || p.drumLife < 15 || p.fuserLife < 15 || p.wasteToner === 'Đầy'
          ? 'Warning'
          : 'Healthy',
      ip: '192.168.1.100',
      totalPageCount: p.totalMonthlyVolume * 12,
      blackTonerLevel: p.tonerK,
      cyanTonerLevel: p.tonerC,
      magentaTonerLevel: p.tonerM,
      yellowTonerLevel: p.tonerY,
      drumLevel: p.drumLife,
      fuserLevel: p.fuserLife,
      wasteTonerBoxFull: p.wasteToner === 'Đầy',
    };
    setDrawerPrinter(printerObj);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
      {/* 1. Bộ Lọc Trạng Thái & Vị Trí Tầng */}
      <SuppliesFilterToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        activeFloor={activeFloor}
        onFloorChange={setActiveFloor}
        criticalCount={criticalCount}
        warningCount={warningCount}
        wasteWarningCount={wasteWarningCount}
      />

      {/* 2. Top Summary Metric Cards (Interactive Quick-Filter) */}
      <SuppliesSummaryBentoCards
        criticalCount={criticalCount}
        warningCount={warningCount}
        soonestEmptyDays={soonestEmptyDays}
        activeFilter={statusFilter === 'waste_warning' ? 'warning' : statusFilter}
        onSelectFilter={(mode) => setStatusFilter(mode)}
      />

      {/* 3. BẢNG 1: Bảng Cảnh Báo Cạn Kiệt Chủ Động (Urgent Consumables Alerts Table) */}
      <UrgentConsumablesAlertsTable
        alerts={filteredAlerts}
        onSelectAlertToDispatch={(item) => setSelectedAlert(item)}
      />

      {/* 4. BẢNG 2: Bảng Mức Vật Tư Hạm Đội Máy Tải Cao (High-Load Fleet Supply Levels Table) */}
      <HighLoadFleetSuppliesTable
        printers={filteredHeavyLoadPrinters}
        onSelectPrinter={handleOpenDiagnostics}
      />

      {/* 5. Modal Lập Lệnh Cấp Phát & Xuất Kho */}
      <SuppliesDispatchModal
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        alertItem={selectedAlert}
        onConfirmDispatch={handleConfirmDispatch}
      />

      {/* 6. Slide-over Diagnostics Drawer */}
      <PrinterDiagnosticsDrawer
        printer={drawerPrinter}
        isOpen={Boolean(drawerPrinter)}
        onClose={() => setDrawerPrinter(null)}
        initialTab="diag"
      />
    </div>
  );
};

export default SuppliesForecastingSection;
