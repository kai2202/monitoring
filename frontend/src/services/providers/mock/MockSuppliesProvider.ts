/**
 * Frontend/src/services/providers/mock/MockSuppliesProvider.ts
 *
 * Triển khai ISuppliesService giám sát mực in và hộp mực thải trong bộ nhớ.
 */

import { ISuppliesService, PrinterSupplyItem } from '../../interfaces/ISuppliesService';
import { SuppliesSummary, mockSuppliesSummary, mockSuppliesList } from '../../../mocks/mockSupplies';
import { Supplies } from '../../../types/printer';

export class MockSuppliesProvider implements ISuppliesService {
  private summary: SuppliesSummary = { ...mockSuppliesSummary };
  private suppliesList: PrinterSupplyItem[] = [...mockSuppliesList];

  async getSuppliesSummary(): Promise<SuppliesSummary> {
    await new Promise(r => setTimeout(r, 30));
    return { ...this.summary };
  }

  async getSuppliesList(): Promise<PrinterSupplyItem[]> {
    await new Promise(r => setTimeout(r, 40));
    return [...this.suppliesList];
  }

  async getPrinterSupplies(printerId: string): Promise<Supplies | null> {
    await new Promise(r => setTimeout(r, 20));
    const found = this.suppliesList.find(s => s.printerId === printerId);
    return found ? { ...found.supplies } : null;
  }
}

