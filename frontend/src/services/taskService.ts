/**
 * Frontend/src/services/taskService.ts
 *
 * Singleton service cho Công việc & Notion Sync, tự động chọn MockProvider hoặc ApiProvider dựa trên DATA_SOURCE.
 */

import { DATA_SOURCE } from '../config/dataSource';
import { ITaskService } from './interfaces/ITaskService';
import { MockTaskProvider } from './providers/mock/MockTaskProvider';
import { ApiTaskProvider } from './providers/api/ApiTaskProvider';

export function createTaskService(source: 'mock' | 'api' = DATA_SOURCE): ITaskService {
  return source === 'api' ? new ApiTaskProvider() : new MockTaskProvider();
}

export const taskService: ITaskService = createTaskService();

