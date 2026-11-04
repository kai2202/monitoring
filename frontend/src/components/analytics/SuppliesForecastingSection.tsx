/**
 * Frontend/src/components/analytics/SuppliesForecastingSection.tsx
 *
 * Tab 2: Dự báo vật tư & Linh kiện (Supplies Forecasting Bento Grid):
 * - Clean architecture, tách nhỏ các sub-component (< 300 LOC/file).
 * - Kết nối SuppliesFilterToolbar, SuppliesAlertBentoGrid, FleetSuppliesPillCards, SuppliesDispatchModal.
 * - Tuân thủ AGENTS.md Rule 7.1.
 */

import React, { useState, useMemo } from 'react';
import { FloorTabId, ConsumableAlertItem } from '../../types/analyticsUI';
import { MOCK_CONSUMABLE_ALERTS, getMockPrinterConsumablesOverview } from '../../mocks/mockAnalyticsUIData';
import {
  SuppliesFilterToolbar,
  SuppliesFilterMode,
  SuppliesAlertBentoGrid,
  FleetSuppliesPillCards,
  SuppliesDispatchModal,
} from '../../features/analytics/components/supplies';

interface SuppliesForecastingSectionProps {
  onCreateTaskForPrinter?: (printer: any) => void;
}

export const SuppliesForecastingSection: React.FC<SuppliesForecastingSectionProps> = ({
  onCreateTaskForPrinter,
}) => {
  const [statusFilter, setStatusFilter] = useState<SuppliesFilterMode>('all');
  const [activeFloor, setActiveFloor] = useState<FloorTabId>('all');
  const [selectedAlert, setSelectedAlert] = useState<ConsumableAlertItem | null>(null);

  const allAlerts = MOCK_CONSUMABLE_ALERTS;
  const allDevicesOverview = useMemo(() => getMockPrinterConsumablesOverview(), []);

  // Lọc danh sách cảnh báo
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((item) => {
      if (statusFilter === 'critical' && item.currentPercent >= 15) return false;
      if (statusFilter === 'warning' && (item.currentPercent < 15 || item.currentPercent >= 25)) return false;
      if (statusFilter === 'normal' && item.currentPercent < 25) return false;

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

  // Lọc danh sách máy tải cao
  const heavyLoadPrinters = useMemo(() => {
    let list = allDevicesOverview;
    if (activeFloor !== 'all') {
      list = list.filter((p) => p.floorId === activeFloor);
    }
    return list.slice(0, 8);
  }, [allDevicesOverview, activeFloor]);

  const criticalCount = allAlerts.filter((a) => a.currentPercent < 15).length;
  const warningCount = allAlerts.filter((a) => a.currentPercent >= 15 && a.currentPercent < 25).length;
  const soonestEmptyDays = Math.min(...allAlerts.map((a) => a.daysRemaining));

  const handleConfirmDispatch = (payload: { alertItem: ConsumableAlertItem }) => {
    if (onCreateTaskForPrinter) {
      onCreateTaskForPrinter({
        id: payload.alertItem.printerId,
        name: payload.alertItem.printerName,
        model: payload.alertItem.model,
        location: payload.alertItem.floor,
        status: 'Online',
        customField: `Lệnh cấp phát vật tư ${payload.alertItem.itemName}`,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 1. Bộ lọc trạng thái & vị trí tầng */}
      <SuppliesFilterToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        activeFloor={activeFloor}
        onFloorChange={setActiveFloor}
        criticalCount={criticalCount}
        warningCount={warningCount}
      />

      {/* 2. Bento Grid Cảnh báo Cạn Kiệt Khẩn Cấp (<15%) & Days-to-Empty */}
      <SuppliesAlertBentoGrid
        alerts={filteredAlerts}
        criticalCount={criticalCount}
        warningCount={warningCount}
        soonestEmptyDays={soonestEmptyDays}
        onSelectAlertToDispatch={(item) => setSelectedAlert(item)}
      />

      {/* 3. Mức Vật Tư Hạm Đội với Segmented Pill Progress Indicators */}
      <FleetSuppliesPillCards printers={heavyLoadPrinters} />

      {/* 4. Modal Lập Lệnh Cấp Phát & Xuất Kho */}
      <SuppliesDispatchModal
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        alertItem={selectedAlert}
        onConfirmDispatch={handleConfirmDispatch}
      />
    </div>
  );
};

export default SuppliesForecastingSection;
