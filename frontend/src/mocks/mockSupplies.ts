/**
 * mocks/mockSupplies.ts
 *
 * Dữ liệu mô phỏng tổng quan vật tư tiêu hao (Toner & Waste Toner Box).
 * Tuyệt đối không chứa trường actionGuidance.
 */

import { mockPrinters } from './mockPrinters';
import { SuppliesAnalyticsResponse } from '../types/api';
import { Printer } from '../types/printer';

export interface SuppliesSummary {
  totalMonitoredPrinters: number;
  lowTonerCriticalCount: number; // <= 10%
  lowTonerWarningCount: number;  // <= 20%
  wasteTonerFullCount: number;   // >= 80%
  monoPrintersCount: number;
  colorPrintersCount: number;
}

export const mockSuppliesSummary: SuppliesSummary = {
  totalMonitoredPrinters: mockPrinters.length,
  lowTonerCriticalCount: mockPrinters.filter(p => p.supplies.black !== null && p.supplies.black <= 10).length,
  lowTonerWarningCount: mockPrinters.filter(p => p.supplies.black !== null && p.supplies.black <= 20 && p.supplies.black > 10).length,
  wasteTonerFullCount: mockPrinters.filter(p => p.supplies.waste !== null && p.supplies.waste >= 80).length,
  monoPrintersCount: mockPrinters.filter(p => p.colorCapability === 'Monochrome').length,
  colorPrintersCount: mockPrinters.filter(p => p.colorCapability === 'Color').length,
};

export const mockSuppliesList = mockPrinters.map(p => ({
  printerId: p.id,
  printerName: p.name,
  model: p.model,
  location: p.location,
  colorCapability: p.colorCapability,
  connectionStatus: p.connectionStatus,
  supplies: p.supplies,
  suppliesUpdated: p.suppliesUpdated || p.lastSuccessfulScrape,
  hasLowSupply: (p.supplies.black !== null && p.supplies.black <= 20) ||
                (p.supplies.cyan !== null && p.supplies.cyan <= 20) ||
                (p.supplies.magenta !== null && p.supplies.magenta <= 20) ||
                (p.supplies.yellow !== null && p.supplies.yellow <= 20) ||
                (p.supplies.waste !== null && p.supplies.waste >= 80),
}));

export function generateMockSuppliesForecasting(printers: Printer[]): SuppliesAnalyticsResponse {
  const alerts: any[] = [];
  const devicesOverview: any[] = [];

  let criticalCount = 0;
  let warningCount = 0;
  let normalCount = 0;
  let wasteWarningCount = 0;

  printers.forEach((p) => {
    const tonerK = p.supplies?.black ?? 75;
    const tonerC = p.supplies?.cyan ?? 80;
    const tonerM = p.supplies?.magenta ?? 85;
    const tonerY = p.supplies?.yellow ?? 82;
    const drumLife = 65;
    const fuserLife = 85;

    const wasteVal = p.supplies?.waste;
    let wasteToner: 'OK' | 'Sắp đầy' | 'Đầy' = 'OK';
    if (wasteVal !== null && wasteVal !== undefined) {
      wasteToner = wasteVal >= 80 ? 'Đầy' : wasteVal >= 60 ? 'Sắp đầy' : 'OK';
    }

    if (wasteToner !== 'OK') wasteWarningCount++;

    const floorMatch = (p.floor || p.location || '').match(/T(\d+)|Tầng (\d+)/);
    const floorNum = floorMatch ? (floorMatch[1] || floorMatch[2]) : '1';
    const floorId = `floor-${floorNum}`;
    const floor = p.floor || `Tầng ${floorNum}`;
    const department = p.department || (p.location?.includes('-') ? p.location.split('-')[1]?.trim() : 'Hành chính');

    const tonerItems = [
      { key: 'black', name: 'Mực đen Black (K)', val: tonerK },
      { key: 'cyan', name: 'Mực xanh Cyan (C)', val: tonerC },
      { key: 'magenta', name: 'Mực đỏ Magenta (M)', val: tonerM },
      { key: 'yellow', name: 'Mực vàng Yellow (Y)', val: tonerY },
    ];

    let hasCritical = false;
    let hasWarning = false;

    tonerItems.forEach((item) => {
      if (item.val !== null && item.val < 15) {
        hasCritical = true;
        alerts.push({
          id: `alt-${p.id}-${item.key}`,
          printerId: p.id,
          printerName: p.name,
          model: p.model,
          floor,
          department,
          itemType: item.key,
          itemName: item.name,
          currentPercent: item.val,
          dailyBurnRate: 2.5,
          daysRemaining: Math.max(1, Math.round(item.val / 2.5)),
          estimatedEmptyDate: '10/11/2026',
          status: 'critical',
        });
      } else if (item.val !== null && item.val < 25) {
        hasWarning = true;
        alerts.push({
          id: `alt-${p.id}-${item.key}`,
          printerId: p.id,
          printerName: p.name,
          model: p.model,
          floor,
          department,
          itemType: item.key,
          itemName: item.name,
          currentPercent: item.val,
          dailyBurnRate: 2.0,
          daysRemaining: Math.max(1, Math.round(item.val / 2.0)),
          estimatedEmptyDate: '15/11/2026',
          status: 'warning',
        });
      }
    });

    if (hasCritical) criticalCount++;
    else if (hasWarning) warningCount++;
    else normalCount++;

    devicesOverview.push({
      printerId: p.id,
      printerName: p.name,
      model: p.model,
      floor,
      floorId,
      department,
      totalMonthlyVolume: p.thirtyDayVolume ?? 12000,
      tonerK,
      tonerC,
      tonerM,
      tonerY,
      drumLife,
      fuserLife,
      wasteToner,
    });
  });

  return {
    summary: { criticalCount, warningCount, normalCount, wasteWarningCount },
    alerts,
    devicesOverview,
  };
}

