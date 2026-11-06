/**
 * Frontend/src/features/analytics/components/supplies/SuppliesForecastingSection.tsx
 *
 * Tab 2: Dự báo vật tư & Linh kiện (Supplies Forecasting Bento Grid):
 * - Tinh gọn toàn bộ dữ liệu thành 2 Bảng Dữ Liệu dạng Table rõ ràng:
 *   1. UrgentConsumablesAlertsTable (Bảng Cảnh báo cạn kiệt chủ động <15% & <25%)
 *   2. HighLoadFleetSuppliesTable (Bảng Mức vật tư hạm đội tải cao với Segmented Pills CMYK + Waste Toner)
 * - Tích hợp SuppliesSummaryBentoCards, SuppliesFilterToolbar, SuppliesDispatchModal và Diagnostics Drawer.
 * - Dữ liệu vật tư nạp từ props suppliesData (Single Source of Truth), loại bỏ mock imports.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { FloorTabId, ConsumableAlertItem, PrinterConsumablesOverview } from '../../../../types/analyticsUI';
import { Printer } from '../../../../types/printer';
import { SuppliesAnalyticsResponse } from '../../../../types/api';
import { SuppliesFilterToolbar, SuppliesFilterMode } from './SuppliesFilterToolbar';
import { SuppliesSummaryBentoCards } from './SuppliesSummaryBentoCards';
import { UrgentConsumablesAlertsTable } from './UrgentConsumablesAlertsTable';
import { HighLoadFleetSuppliesTable } from './HighLoadFleetSuppliesTable';
import { SuppliesDispatchModal } from './SuppliesDispatchModal';
import { PrinterDiagnosticsDrawer } from '../../../dashboard/components/diagnostics/PrinterDiagnosticsDrawer';
import { taskService, locationService } from '../../../../services';

export interface SuppliesForecastingSectionProps {
  onCreateTaskForPrinter?: (printer: any) => void;
  selectedBranch?: string;
  suppliesData?: SuppliesAnalyticsResponse | null;
}

export const SuppliesForecastingSection: React.FC<SuppliesForecastingSectionProps> = ({
  onCreateTaskForPrinter,
  selectedBranch: _selectedBranch,
  suppliesData,
}) => {
  const [statusFilter, setStatusFilter] = useState<SuppliesFilterMode>('all');
  const [activeFloor, setActiveFloor] = useState<FloorTabId>('all');
  const [selectedAlert, setSelectedAlert] = useState<ConsumableAlertItem | null>(null);
  const [drawerPrinter, setDrawerPrinter] = useState<Printer | null>(null);

  const allAlerts = useMemo(() => suppliesData?.alerts || [], [suppliesData]);
  const allDevicesOverview = useMemo(() => suppliesData?.devicesOverview || [], [suppliesData]);
  const availableFloors = useMemo(() => {
    return locationService.getFloorsByBranch(_selectedBranch);
  }, [_selectedBranch]);

  // Lọc Bảng 1: Cảnh báo cạn kiệt chủ động
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((item) => {
      if (statusFilter === 'critical' && item.currentPercent >= 15) return false;
      if (statusFilter === 'warning' && (item.currentPercent < 15 || item.currentPercent >= 25)) return false;
      if (statusFilter === 'normal' && item.currentPercent < 25) return false;
      if (statusFilter === 'waste_warning') return false;

      if (activeFloor !== 'all') {
        const floorIdx = parseInt(activeFloor.replace('floor-', ''), 10) - 1;
        const targetFloorName = availableFloors[floorIdx];
        if (targetFloorName && !item.floor.includes(targetFloorName)) {
          return false;
        }
      }
      return true;
    });
  }, [allAlerts, activeFloor, statusFilter, availableFloors]);

  // Lọc Bảng 2: Thiết bị tải cao
  const filteredDevices = useMemo(() => {
    let list = allDevicesOverview;
    if (activeFloor !== 'all') {
      const floorIdx = parseInt(activeFloor.replace('floor-', ''), 10) - 1;
      const targetFloorName = availableFloors[floorIdx];
      if (targetFloorName) {
        list = list.filter((p) => p.floor.includes(targetFloorName));
      }
    }

    if (statusFilter === 'critical') {
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

  const criticalCount = suppliesData?.summary?.criticalCount ?? allAlerts.filter((a) => a.currentPercent < 15).length;
  const warningCount = suppliesData?.summary?.warningCount ?? allAlerts.filter((a) => a.currentPercent >= 15 && a.currentPercent < 25).length;
  const wasteWarningCount = suppliesData?.summary?.wasteWarningCount ?? allDevicesOverview.filter(
    (p) => p.wasteToner === 'Sắp đầy' || p.wasteToner === 'Đầy'
  ).length;
  const soonestEmptyDays = allAlerts.length > 0 ? Math.min(...allAlerts.map((a) => a.daysRemaining)) : 0;

  // Thao tác tạo Task cấp phát qua modal & kết nối CMMS TaskService
  const handleConfirmDispatch = (payload: {
    alertItem: ConsumableAlertItem;
    priority: 'urgent' | 'normal';
    quantity: number;
    technician: string;
    notes: string;
  }) => {
    taskService.createTask({
      title: `Cấp phát & Thay thế: ${payload.alertItem.itemName} (${payload.alertItem.printerName})`,
      description: `Yêu cầu cấp phát ${payload.quantity} ${payload.alertItem.itemName} cho thiết bị ${payload.alertItem.printerName} tại ${payload.alertItem.floor}. ${payload.notes ? `Ghi chú: ${payload.notes}` : ''}`,
      taskType: 'Supplies',
      priority: payload.priority === 'urgent' ? 'P1_Urgent' : 'P2_High',
      assignee: payload.technician || 'Kỹ thuật viên NOC',
      dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      printerId: payload.alertItem.printerId,
      printerName: payload.alertItem.printerName,
      location: payload.alertItem.floor,
      status: 'Open',
    });

    toast.success(`Đã lập lệnh cấp phát: ${payload.alertItem.itemName} cho ${payload.alertItem.printerName}`);

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
      wasteTonerStatus: p.wasteToner === 'Đầy' ? 'Full' : p.wasteToner === 'Sắp đầy' ? 'Warning' : 'Normal',
      serial: 'SN-AUTO',
      macAddress: '00:1B:44:11:3A:B7',
      firmwareVersion: 'v4.12.0',
      mfr: 'Ricoh',
      department: p.department,
      deviceType: 'Multifunction Color Printer',
      colorCapability: 'Color',
      ppm: 35,
      alerts: [],
    };
    setDrawerPrinter(printerObj);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* 1. Hàng 1: 4 Thẻ KPI Bento */}
      <SuppliesSummaryBentoCards
        criticalCount={criticalCount}
        warningCount={warningCount}
        wasteWarningCount={wasteWarningCount}
        soonestEmptyDays={soonestEmptyDays}
      />

      {/* 2. Thanh Công Cụ Lọc Nhanh Tầng & Trạng Thái Cạn Kiệt */}
      <SuppliesFilterToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        activeFloor={activeFloor}
        onFloorChange={setActiveFloor}
        criticalCount={criticalCount}
        warningCount={warningCount}
        wasteWarningCount={wasteWarningCount}
        availableFloors={availableFloors}
      />

      {/* 3. Danh sách 2 Bảng Dữ Liệu Chi Tiết (Full Width 100%) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', minWidth: 0 }}>
        {/* Bảng 1: Cảnh báo cạn kiệt chủ động */}
        <div style={{ width: '100%', minWidth: 0 }}>
          <UrgentConsumablesAlertsTable
            alerts={filteredAlerts}
            onOpenDispatchModal={(alertItem) => setSelectedAlert(alertItem)}
          />
        </div>

        {/* Bảng 2: Mức vật tư hạm đội tải cao */}
        <div style={{ width: '100%', minWidth: 0 }}>
          <HighLoadFleetSuppliesTable
            devices={filteredDevices}
            onSelectDevice={(device) => handleOpenDiagnostics(device)}
          />
        </div>
      </div>

      {/* Modal Lập Lệnh Cấp Phát Vật Tư */}
      {selectedAlert && (
        <SuppliesDispatchModal
          isOpen={Boolean(selectedAlert)}
          alertItem={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onConfirmDispatch={handleConfirmDispatch}
        />
      )}

      {/* Diagnostics Drawer (Tab 1: CMYK Counters & Gauges) */}
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
