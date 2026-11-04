/**
 * Frontend/src/config/dataSource.ts
 *
 * Cấu hình một tham số duy nhất để chuyển đổi nguồn dữ liệu toàn hệ thống.
 * - 'mock': Sử dụng dữ liệu mô phỏng trong bộ nhớ phục vụ phát triển giao diện và demo.
 * - 'api': Kết nối trực tiếp Backend RESTful API và Zabbix.
 *
 * Có thể ghi đè thông qua biến môi trường VITE_DATA_SOURCE trong .env.
 */

export type DataSourceType = 'mock' | 'api';

const envSource = (import.meta as any).env?.VITE_DATA_SOURCE as DataSourceType | undefined;

export const DATA_SOURCE: DataSourceType = envSource === 'api' ? 'api' : 'mock';

export const isMockSource = (): boolean => DATA_SOURCE === 'mock';
export const isApiSource = (): boolean => DATA_SOURCE === 'api';

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL || '/api';

