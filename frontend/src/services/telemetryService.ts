/**
 * Frontend/src/services/telemetryService.ts
 *
 * Singleton service cho Đo lường từ xa, Sản lượng in & Lemon Devices, tự động chọn MockProvider hoặc ApiProvider dựa trên DATA_SOURCE.
 */

import { DATA_SOURCE } from '../config/dataSource';
import { ITelemetryService } from './interfaces/ITelemetryService';
import { MockTelemetryProvider } from './providers/mock/MockTelemetryProvider';
import { ApiTelemetryProvider } from './providers/api/ApiTelemetryProvider';

export function createTelemetryService(source: 'mock' | 'api' = DATA_SOURCE): ITelemetryService {
  return source === 'api' ? new ApiTelemetryProvider() : new MockTelemetryProvider();
}

export const telemetryService: ITelemetryService = createTelemetryService();

