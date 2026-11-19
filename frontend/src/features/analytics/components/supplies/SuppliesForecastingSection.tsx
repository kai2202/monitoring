/**
 * Frontend/src/features/analytics/components/supplies/SuppliesForecastingSection.tsx
 *
 * Tab 2: Dự Báo Vật Tư & Linh Kiện (/analytics/supplies):
 * - Luồng chuẩn 100% NOC/CMMS: 4 KPI Cards → 4 Thẻ Tuần Dự Trù → Bảng Dự Trù Mua Sắm Dùng Chung → Toolbar Lọc Tầng → Bảng 40+ Máy In.
 * - Loại bỏ biểu đồ cột chồng 2 tầng và timeline cũ trùng lặp.
 * - Hỗ trợ thao tác Xác Nhận Đã Cấp Phát Hàng Loạt & Ngăn kéo Nhật Ký Cấp Phát Gần Đây.
 * - Tuân thủ AGENTS.md Rule 7.1.
 */

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { FloorTabId, ConsumableAlertItem, PrinterConsumablesOverview } from '../../../../types/analyticsUI';
import { Printer } from '../../../../types/printer';
import { SuppliesAnalyticsResponse } from '../../../../types/api';
import { SuppliesFilterToolbar, SuppliesFilterMode } from './SuppliesFilterToolbar';
import { SuppliesSummaryBentoCards, DEFAULT_SUPPLIES_KPI_CARDS } from './SuppliesSummaryBentoCards';
import { SharedSuppliesProcurementTable, InventoryStockMap } from './SharedSuppliesProcurementTable';
import { HighLoadFleetSuppliesTable } from './HighLoadFleetSuppliesTable';
import { SuppliesDispatchModal } from './SuppliesDispatchModal';
import { BulkSuppliesConfirmModal, ReplenishmentLogRecord, ConsumedSuppliesMap } from './BulkSuppliesConfirmModal';
import { ReplenishmentHistoryDrawer } from './ReplenishmentHistoryDrawer';
import { PrinterDiagnosticsDrawer } from '../../../dashboard/components/diagnostics/PrinterDiagnosticsDrawer';
import { taskService, locationService } from '../../../../services';
import { DATA_SOURCE } from '../../../../config/dataSource';
import { MockDataProvider } from '../../../../mocks/MockDataProvider';
import { InventoryItem, CreateStockTransactionDto } from '../../../inventory/types';

export interface SuppliesForecastingSectionProps {
  onCreateTaskForPrinter?: (printer: any) => void;
  selectedBranch?: string;
  suppliesData?: SuppliesAnalyticsResponse | null;
  inventoryItems?: InventoryItem[];
  onDispatchTransaction?: (dto: CreateStockTransactionDto) => Promise<void>;
}

function matchCategoryKey(item: InventoryItem): keyof InventoryStockMap | null {
  const text = `${item.sku} ${item.name}`.toLowerCase();
  if (item.category === 'WASTE_BOX' || text.includes('waste') || text.includes('thải')) return 'waste_toner';
  if (item.category === 'DRUM' || text.includes('drum') || text.includes('trống')) return 'drum';
  if (item.category === 'TONER') {
    if (text.includes('cyan') || text.includes('xanh') || /\bc\b/.test(text)) return 'cyan';
    if (text.includes('magenta') || text.includes('đỏ') || text.includes('hồng') || /\bm\b/.test(text)) return 'magenta';
    if (text.includes('yellow') || text.includes('vàng') || /\by\b/.test(text)) return 'yellow';
    return 'black';
  }
  return null;
}

export const SuppliesForecastingSection: React.FC<SuppliesForecastingSectionProps> = ({
  onCreateTaskForPrinter,
  selectedBranch: _selectedBranch,
  suppliesData,
  inventoryItems = [],
  onDispatchTransaction,
}) => {
  const [statusFilter, setStatusFilter] = useState<SuppliesFilterMode>('all');
  const [activeFloor, setActiveFloor] = useState<FloorTabId>('all');
  const [selectedAlert, setSelectedAlert] = useState<ConsumableAlertItem | null>(null);
  const [drawerPrinter, setDrawerPrinter] = useState<Printer | null>(null);
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState<string | null>(null);
  const [isInventoryHighlighted, setIsInventoryHighlighted] = useState(false);

  // Đồng bộ tồn kho thực tế từ Inventory RTK Query
  const inventoryStock = useMemo<InventoryStockMap>(() => {
    const map: InventoryStockMap = {
      black: 0,
      cyan: 0,
      magenta: 0,
      yellow: 0,
      waste_toner: 0,
      drum: 0,
    };
    inventoryItems.forEach((item) => {
      const key = matchCategoryKey(item);
      if (key) {
        map[key] += Math.max(0, item.currentStock || 0);
      }
    });
    return map;
  }, [inventoryItems]);

  // Thao tác hàng loạt & Nhật ký
  const [bulkSelectedPrinters, setBulkSelectedPrinters] = useState<PrinterConsumablesOverview[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<ReplenishmentLogRecord[]>(() =>
    DATA_SOURCE === 'mock' ? MockDataProvider.getSuppliesReplenishmentLogs() : []
  );

  const effectiveData = suppliesData;
  const allAlerts = useMemo(
    () =>
      (effectiveData?.alerts || []).filter((a) =>
        ['black', 'cyan', 'magenta', 'yellow', 'drum', 'fuser', 'waste', 'waste_toner'].includes(a.itemType as string)
      ),
    [effectiveData]
  );
  const allDevicesOverview = useMemo(() => effectiveData?.devicesOverview || [], [effectiveData]);
  const availableFloors = useMemo(() => locationService.getFloorsByBranch(_selectedBranch), [_selectedBranch]);

  const targetFloorName = useMemo(() => {
    if (activeFloor === 'all') return null;
    const floorIdx = parseInt(activeFloor.replace('floor-', ''), 10) - 1;
    return availableFloors[floorIdx] || null;
  }, [activeFloor, availableFloors]);

  const floorDevices = useMemo(() => {
    if (!targetFloorName) return allDevicesOverview;
    return allDevicesOverview.filter((p) => p.floor.includes(targetFloorName));
  }, [allDevicesOverview, targetFloorName]);

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((item) => {
      if (statusFilter === 'critical' && item.currentPercent >= 15) return false;
      if (statusFilter === 'warning' && (item.currentPercent < 15 || item.currentPercent >= 25)) return false;
      if (statusFilter === 'normal' && item.currentPercent < 25) return false;
      if (statusFilter === 'waste_warning' && (item.itemType as string) !== 'waste' && (item.itemType as string) !== 'waste_toner') return false;
      if (targetFloorName && !item.floor.includes(targetFloorName)) return false;
      return true;
    });
  }, [allAlerts, statusFilter, targetFloorName]);

  const filteredDevices = useMemo(() => {
    let list = floorDevices;
    if (statusFilter === 'critical') {
      list = list.filter(
        (p) =>
          p.tonerK < 15 || p.tonerC < 15 || p.tonerM < 15 || p.tonerY < 15 ||
          p.drumLife < 15 || p.fuserLife < 15 || p.wasteToner === 'Đầy'
      );
    } else if (statusFilter === 'warning') {
      list = list.filter(
        (p) =>
          (p.tonerK >= 15 && p.tonerK < 25) || (p.tonerC >= 15 && p.tonerC < 25) ||
          (p.tonerM >= 15 && p.tonerM < 25) || (p.tonerY >= 15 && p.tonerY < 25) ||
          p.wasteToner === 'Sắp đầy'
      );
    } else if (statusFilter === 'waste_warning') {
      list = list.filter((p) => p.wasteToner === 'Sắp đầy' || p.wasteToner === 'Đầy');
    } else if (statusFilter === 'normal') {
      list = list.filter(
        (p) =>
          p.tonerK >= 25 && p.tonerC >= 25 && p.tonerM >= 25 && p.tonerY >= 25 &&
          p.drumLife >= 25 && p.fuserLife >= 25 && p.wasteToner === 'OK'
      );
    }
    return list;
  }, [floorDevices, statusFilter]);

  // Bộ lọc theo thẻ vật tư kho đang chọn (nếu có)
  const displayedDevices = useMemo(() => {
    if (!selectedInventoryCategory) return filteredDevices;
    switch (selectedInventoryCategory) {
      case 'black':
        return filteredDevices.filter((p) => p.tonerK < 25);
      case 'cyan':
        return filteredDevices.filter((p) => p.tonerC < 25);
      case 'magenta':
        return filteredDevices.filter((p) => p.tonerM < 25);
      case 'yellow':
        return filteredDevices.filter((p) => p.tonerY < 25);
      case 'waste_toner':
        return filteredDevices.filter((p) => p.wasteToner === 'Đầy' || p.wasteToner === 'Sắp đầy');
      case 'drum':
        return filteredDevices.filter((p) => p.drumLife < 25);
      default:
        return filteredDevices;
    }
  }, [filteredDevices, selectedInventoryCategory]);

  const criticalAlerts = useMemo(() => allAlerts.filter((a) => a.currentPercent < 15), [allAlerts]);
  const warningAlerts = useMemo(
    () => allAlerts.filter((a) => a.currentPercent >= 15 && a.currentPercent < 25),
    [allAlerts]
  );

  const criticalCount = criticalAlerts.length;
  const criticalPrinterCount = useMemo(
    () => new Set(criticalAlerts.map((a) => a.printerId)).size,
    [criticalAlerts]
  );
  const warningCount = warningAlerts.length;
  const warningTonerCount = useMemo(
    () => warningAlerts.filter((a) => ['black', 'cyan', 'magenta', 'yellow'].includes(a.itemType)).length,
    [warningAlerts]
  );
  const warningHardwareCount = useMemo(
    () => warningAlerts.filter((a) => ['drum', 'fuser'].includes(a.itemType)).length,
    [warningAlerts]
  );

  const wasteFullCount = useMemo(
    () => allDevicesOverview.filter((p) => p.wasteToner === 'Đầy').length,
    [allDevicesOverview]
  );
  const wasteSoonCount = useMemo(
    () => allDevicesOverview.filter((p) => p.wasteToner === 'Sắp đầy').length,
    [allDevicesOverview]
  );
  const wasteWarningCount = effectiveData?.summary?.wasteWarningCount ?? wasteFullCount + wasteSoonCount;

  // Tính toán tồn kho tổng & số danh mục thiếu hụt
  const totalStockUnits = useMemo(
    () => Object.values(inventoryStock).reduce((sum, c) => sum + c, 0),
    [inventoryStock]
  );

  const deficitCategoriesCount = useMemo(() => {
    let count = 0;
    if (floorDevices.filter((d) => d.tonerK < 15).length > inventoryStock.black) count++;
    if (floorDevices.filter((d) => d.tonerC < 15).length > inventoryStock.cyan) count++;
    if (floorDevices.filter((d) => d.tonerM < 15).length > inventoryStock.magenta) count++;
    if (floorDevices.filter((d) => d.tonerY < 15).length > inventoryStock.yellow) count++;
    if (floorDevices.filter((d) => d.wasteToner === 'Đầy').length > inventoryStock.waste_toner) count++;
    if (floorDevices.filter((d) => d.drumLife < 15).length > inventoryStock.drum) count++;
    return count;
  }, [floorDevices, inventoryStock]);

  const safeDeviceCount = useMemo(
    () =>
      allDevicesOverview.filter(
        (p) =>
          p.tonerK >= 25 && p.tonerC >= 25 && p.tonerM >= 25 && p.tonerY >= 25 &&
          p.drumLife >= 25 && p.fuserLife >= 25 && p.wasteToner === 'OK'
      ).length,
    [allDevicesOverview]
  );

  const handleConfirmBulkReplenish = async (logRecord: ReplenishmentLogRecord, consumed: ConsumedSuppliesMap) => {
    setHistoryLogs((prev) => [logRecord, ...prev]);

    if (onDispatchTransaction && inventoryItems.length > 0) {
      const entries = (Object.entries(consumed) as [keyof ConsumedSuppliesMap, number][]).filter(([, qty]) => qty > 0);
      for (const [categoryKey, qty] of entries) {
        const matchedItem = inventoryItems
          .filter((item) => matchCategoryKey(item) === categoryKey)
          .sort((a, b) => b.currentStock - a.currentStock)[0];
        if (matchedItem) {
          await onDispatchTransaction({
            itemId: matchedItem.id,
            type: 'EXPORT',
            quantity: qty,
            note: `Cấp phát hàng loạt (${logRecord.printers.length} máy) - ${logRecord.notes || 'D-Day'}`,
          });
        }
      }
    }

    const totalDeducted = Object.values(consumed).reduce((a, b) => a + b, 0);
    toast.success(
      `Đã ghi nhận cấp phát cho ${logRecord.printers.length} máy (${totalDeducted} vật tư)!`
    );
  };

  const handleConfirmSingleDispatch = (payload: {
    alertItem: ConsumableAlertItem;
    priority: 'urgent' | 'normal';
    quantity: number;
    technician: string;
    notes: string;
  }) => {
    const assignee = payload.technician || 'Kỹ thuật viên NOC';
    taskService.createTask(
      {
        title: `Cấp phát & Thay thế: ${payload.alertItem.itemName} (${payload.alertItem.printerName})`,
        description: `Yêu cầu cấp phát ${payload.quantity} ${payload.alertItem.itemName} cho thiết bị ${payload.alertItem.printerName} tại ${payload.alertItem.floor}. ${payload.notes ? `Ghi chú: ${payload.notes}` : ''}`,
        taskType: 'SUPPLY_REPLENISHMENT',
        priority: payload.priority === 'urgent' ? 'P1_Urgent' : 'P2_High',
        assignee,
        dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
        printerId: payload.alertItem.printerId,
        printerName: payload.alertItem.printerName,
        location: payload.alertItem.floor,
        status: 'Planned',
      },
      assignee
    );

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

  const handleOpenDiagnostics = (p: PrinterConsumablesOverview) => {
    const isWarning =
      p.tonerK < 15 || p.tonerC < 15 || p.tonerM < 15 || p.tonerY < 15 ||
      p.drumLife < 15 || p.fuserLife < 15 || p.wasteToner === 'Đầy';

    const printerObj: Printer = {
      id: p.printerId,
      name: p.printerName,
      model: p.model,
      location: `${p.floor} - ${p.department}`,
      floor: p.floor,
      department: p.department,
      connectionStatus: 'Online',
      monitoringStatus: 'Active',
      status: 'Online',
      alertSeverity: isWarning ? 'warning' : 'clear',
      alertText: isWarning ? 'Vật tư sắp cạn' : '',
      health: isWarning ? 'Warning' : 'Healthy',
      ip: '192.168.1.100',
      serial: 'SN-AUTO',
      firmware: 'v4.12.0',
      mfr: 'Ricoh',
      deviceType: 'Color MFP',
      snmpStatus: 'OK',
      lastScrape: new Date().toISOString(),
      lastSuccessfulScrape: new Date().toISOString(),
      scannerErr: '',
      adfErr: '',
      copierErr: '',
      mfpErr: '',
      thirtyDayVolume: p.totalMonthlyVolume,
      counters: { total: p.totalMonthlyVolume * 12, copier: null, fax: null, scanner: null },
      supplies: { black: p.tonerK, cyan: p.tonerC, magenta: p.tonerM, yellow: p.tonerY, waste: null },
      incidents: [],
    };
    setDrawerPrinter(printerObj);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* 1. Hàng 4 KPI Cards chi tiết */}
      <SuppliesSummaryBentoCards
        criticalCount={criticalCount}
        criticalPrinterCount={criticalPrinterCount}
        warningCount={warningCount}
        warningTonerCount={warningTonerCount}
        warningHardwareCount={warningHardwareCount}
        wasteWarningCount={wasteWarningCount}
        wasteFullCount={wasteFullCount}
        wasteSoonCount={wasteSoonCount}
        totalStockUnits={totalStockUnits}
        deficitCategoriesCount={deficitCategoriesCount}
        safeDeviceCount={safeDeviceCount}
        totalDeviceCount={allDevicesOverview.length}
        visibleCardIds={DEFAULT_SUPPLIES_KPI_CARDS}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
        isInventoryHighlighted={isInventoryHighlighted}
        onFocusInventory={() => setIsInventoryHighlighted((prev) => !prev)}
      />

      {/* 2. Bảng Dự Trù Mua Sắm / Xuất Kho Dùng Chung Hộp Mực (Đối chiếu tồn kho & Accordion xem máy) */}
      <SharedSuppliesProcurementTable
        devices={filteredDevices}
        stock={inventoryStock}
        onSelectPrinter={handleOpenDiagnostics}
        isInventoryHighlighted={isInventoryHighlighted}
      />

      {/* 3. Thanh điều khiển khu vực & Nút mở Nhật Ký Cấp Phát */}
      <SuppliesFilterToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        activeFloor={activeFloor}
        onFloorChange={setActiveFloor}
        availableFloors={availableFloors}
        summaryText={`Đang theo dõi ${filteredDevices.length} máy • ${filteredAlerts.length} cảnh báo`}
        onOpenHistoryDrawer={() => setIsHistoryDrawerOpen(true)}
        historyCount={historyLogs.length}
      />

      {/* 4. Bảng Chi Tiết 40+ Máy In (có Checkbox, Chip lọc nhanh vật tư, Nhãn D-Day, Floating Bar) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', minWidth: 0 }}>
        <HighLoadFleetSuppliesTable
          devices={filteredDevices}
          onSelectDevice={handleOpenDiagnostics}
          onOpenBulkConfirm={(selected) => {
            setBulkSelectedPrinters(selected);
            setIsBulkConfirmOpen(true);
          }}
        />
      </div>

      {/* 6. Modal Xác Nhận Cấp Phát Hàng Loạt */}
      <BulkSuppliesConfirmModal
        isOpen={isBulkConfirmOpen}
        selectedPrinters={bulkSelectedPrinters}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleConfirmBulkReplenish}
      />

      {/* 7. Ngăn Kéo Nhật Ký Cấp Phát Gần Đây (Đối soát) */}
      <ReplenishmentHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        logs={historyLogs}
      />

      {/* 8. Modal Cấp Phát Đơn Lẻ (Tương thích ngược) */}
      {selectedAlert && (
        <SuppliesDispatchModal
          isOpen={Boolean(selectedAlert)}
          alertItem={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onConfirmDispatch={handleConfirmSingleDispatch}
        />
      )}

      {/* 9. Diagnostics Drawer */}
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
