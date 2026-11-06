/**
 * Frontend/src/mocks/index.ts
 *
 * Cổng Điều Phối & Xuất Khẩu Dữ Liệu Giả Lập Tập Trung Duy Nhất (Single Mock Gateway).
 * - Tầng Service chỉ sử dụng cổng này hoặc MockDataProvider khi DATA_SOURCE === 'mock'.
 * - TUYỆT ĐỐI KHÔNG import tệp này hoặc bất kỳ file nào trong mocks/ từ tầng UI (Zero-Coupling).
 * - Khi xoá thư mục mocks/, ứng dụng tự động hoạt động hoàn toàn với Backend API thật.
 * - Tuân thủ AGENTS.md Rule 7.1.
 */

export * from './MockDataProvider';
export * from './printers';
export * from './incidents';
export * from './tasks';
export * from './telemetry';
export * from './supplies';
export * from './analytics';
export * from './sla';
export * from './settings';
export * from './locations';
