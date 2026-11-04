/**
 * Frontend/src/services/dashboardService.ts
 *
 * Singleton service cho Dashboard KPI & Dữ liệu tổng quan, tự động chọn MockProvider hoặc ApiProvider dựa trên DATA_SOURCE.
 */

import { DATA_SOURCE } from '../config/dataSource';
import { IDashboardService } from './interfaces/IDashboardService';
import { MockDashboardProvider } from './providers/mock/MockDashboardProvider';
import { ApiDashboardProvider } from './providers/api/ApiDashboardProvider';

export function createDashboardService(source: 'mock' | 'api' = DATA_SOURCE): IDashboardService {
  return source === 'api' ? new ApiDashboardProvider() : new MockDashboardProvider();
}

export const dashboardService: IDashboardService = createDashboardService();

