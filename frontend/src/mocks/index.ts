/**
 * mocks/index.ts
 *
 * Điểm xuất khẩu tập trung (Barrel Export) cho toàn bộ kho dữ liệu Mock Data.
 * Các Service Provider sẽ sử dụng dữ liệu này khi DATA_SOURCE = "mock".
 * Tuyệt đối không import trực tiếp tệp này từ các React UI Components.
 */

export * from './mockPrinters';
export * from './mockIncidents';
export * from './mockTasks';
export * from './mockTelemetry';
export * from './mockSupplies';
export * from './mockSettings';
