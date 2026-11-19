/**
 * Frontend/src/services/settingsService.ts
 *
 * Singleton service cho Cấu hình hệ thống & Từ điển lỗi phần cứng, tự động chọn MockProvider hoặc ApiProvider dựa trên DATA_SOURCE.
 */

import { DATA_SOURCE } from '../config/dataSource';
import { ISettingsService } from './interfaces/ISettingsService';
import { MockSettingsProvider } from './providers/mock/MockSettingsProvider';
import { ApiSettingsProvider } from './providers/api/ApiSettingsProvider';

export function createSettingsService(source: 'mock' | 'api' = DATA_SOURCE): ISettingsService {
  return source === 'api' ? new ApiSettingsProvider() : new MockSettingsProvider();
}

export const settingsService: ISettingsService = createSettingsService();

