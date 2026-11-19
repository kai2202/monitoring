/**
 * Frontend/src/services/suppliesService.ts
 *
 * Singleton service cho Vật tư tiêu hao (Toner & Waste Box), tự động chọn MockProvider hoặc ApiProvider dựa trên DATA_SOURCE.
 */

import { DATA_SOURCE } from '../config/dataSource';
import { ISuppliesService } from './interfaces/ISuppliesService';
import { MockSuppliesProvider } from './providers/mock/MockSuppliesProvider';
import { ApiSuppliesProvider } from './providers/api/ApiSuppliesProvider';

export function createSuppliesService(source: 'mock' | 'api' = DATA_SOURCE): ISuppliesService {
  return source === 'api' ? new ApiSuppliesProvider() : new MockSuppliesProvider();
}

export const suppliesService: ISuppliesService = createSuppliesService();

