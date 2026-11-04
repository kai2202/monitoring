/**
 * Frontend/src/services/index.ts
 *
 * Điểm xuất khẩu chính (Barrel Export) cho toàn bộ Service Layer của FleetMonitor.
 * UI components chỉ import các services từ đây, không bao giờ import trực tiếp từ mocks/.
 */

// 1. Interfaces & Types
export * from './interfaces';

// 2. Mock Providers
export * from './providers/mock';

// 3. API Providers
export * from './providers/api';

// 4. Service Instances & Factories
export * from './printerService';
export * from './taskService';
export * from './incidentService';
export * from './suppliesService';
export * from './telemetryService';
export * from './settingsService';
export * from './dashboardService';

