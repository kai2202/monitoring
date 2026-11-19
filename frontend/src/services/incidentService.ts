/**
 * Frontend/src/services/incidentService.ts
 *
 * Singleton service cho Hàng đợi sự cố & Triage, tự động chọn MockProvider hoặc ApiProvider dựa trên DATA_SOURCE.
 */

import { DATA_SOURCE } from '../config/dataSource';
import { IIncidentService } from './interfaces/IIncidentService';
import { MockIncidentProvider } from './providers/mock/MockIncidentProvider';
import { ApiIncidentProvider } from './providers/api/ApiIncidentProvider';

export function createIncidentService(source: 'mock' | 'api' = DATA_SOURCE): IIncidentService {
  return source === 'api' ? new ApiIncidentProvider() : new MockIncidentProvider();
}

export const incidentService: IIncidentService = createIncidentService();

