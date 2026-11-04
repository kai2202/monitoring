/**
 * mocks/mockSupplies.ts
 *
 * Dữ liệu mô phỏng tổng quan vật tư tiêu hao (Toner & Waste Toner Box).
 * Tuyệt đối không chứa trường actionGuidance.
 */

import { mockPrinters } from './mockPrinters';

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
