/**
 * Frontend/src/services/printerService.ts
 *
 * Singleton service cho Máy in, tự động chọn MockProvider hoặc ApiProvider dựa trên DATA_SOURCE.
 */

import { DATA_SOURCE } from '../config/dataSource';
import { IPrinterService } from './interfaces/IPrinterService';
import { MockPrinterProvider } from './providers/mock/MockPrinterProvider';
import { ApiPrinterProvider } from './providers/api/ApiPrinterProvider';

export function createPrinterService(source: 'mock' | 'api' = DATA_SOURCE): IPrinterService {
  return source === 'api' ? new ApiPrinterProvider() : new MockPrinterProvider();
}

export const printerService: IPrinterService = createPrinterService();

