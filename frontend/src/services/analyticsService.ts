/**
 * Frontend/src/services/analyticsService.ts
 *
 * Singleton service cho Phân hệ Analytics, tự động chuyển đổi giữa Mock và REST API.
 * Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { DATA_SOURCE } from '../config/dataSource';
import { IAnalyticsService } from './interfaces/IAnalyticsService';
import { MockAnalyticsProvider } from './providers/mock/MockAnalyticsProvider';
import { ApiAnalyticsProvider } from './providers/api/ApiAnalyticsProvider';

export function createAnalyticsService(source: 'mock' | 'api' = DATA_SOURCE): IAnalyticsService {
  return source === 'api' ? new ApiAnalyticsProvider() : new MockAnalyticsProvider();
}

export const analyticsService: IAnalyticsService = createAnalyticsService();

