/**
 * Frontend/src/config/dataSource.ts
 *
 * Cấu hình một tham số duy nhất để chuyển đổi nguồn dữ liệu toàn hệ thống.
 * - 'api' (Mặc định khi vận hành): Kết nối trực tiếp Backend RESTful API, PostgreSQL, MinIO và Zabbix.
 * - 'mock': Chỉ kích hoạt khi chạy kiểm thử Vitest độc lập hoặc bật tường minh VITE_USE_MOCK=true.
 */

export type DataSourceType = 'mock' | 'api';

const metaEnv = (import.meta as any).env || {};
const isVitest = Boolean(metaEnv.VITEST) || metaEnv.MODE === 'test';
const envUseMock = metaEnv.VITE_USE_MOCK as string | undefined;
const envSource = metaEnv.VITE_DATA_SOURCE as DataSourceType | undefined;

export const DATA_SOURCE: DataSourceType = isVitest
  ? envSource === 'api' && metaEnv.VITE_FORCE_API_IN_TEST === 'true'
    ? 'api'
    : 'mock'
  : envUseMock === 'true' || envSource === 'mock' || metaEnv.MODE === 'mock'
  ? 'mock'
  : 'api';

export const isMockSource = (): boolean => DATA_SOURCE === 'mock';
export const isApiSource = (): boolean => DATA_SOURCE === 'api';

export const API_BASE_URL: string = metaEnv.VITE_API_BASE_URL || '/api';
