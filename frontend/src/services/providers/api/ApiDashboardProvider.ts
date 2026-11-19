/**
 * Frontend/src/services/providers/api/ApiDashboardProvider.ts
 *
 * Triển khai IDashboardService thông qua REST API Backend.
 */

import { IDashboardService, DashboardSummary } from '../../interfaces/IDashboardService';
import { requestApi } from './apiClient';

export class ApiDashboardProvider implements IDashboardService {
  async getDashboardSummary(): Promise<DashboardSummary> {
    return requestApi<DashboardSummary>('/dashboard/summary');
  }
}

