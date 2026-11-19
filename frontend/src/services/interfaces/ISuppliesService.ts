/**
 * Frontend/src/services/interfaces/ISuppliesService.ts
 *
 * Hợp đồng Service Layer cho Giám sát vật tư tiêu hao CMYK và hộp mực thải.
 */

import { SuppliesSummary } from '../../mocks/mockSupplies';
import { Supplies } from '../../types/printer';

export interface PrinterSupplyItem {
  printerId: string;
  printerName: string;
  model: string;
  location: string;
  colorCapability?: 'Color' | 'Monochrome';
  connectionStatus: string;
  supplies: Supplies;
  suppliesUpdated: string;
  hasLowSupply: boolean;
}

export interface ISuppliesService {
  getSuppliesSummary(): Promise<SuppliesSummary>;
  getSuppliesList(): Promise<PrinterSupplyItem[]>;
  getPrinterSupplies(printerId: string): Promise<Supplies | null>;
}

