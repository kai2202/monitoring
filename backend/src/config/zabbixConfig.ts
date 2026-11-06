/**
 * Backend/src/config/zabbixConfig.ts
 *
 * Cấu hình cố định kết nối Zabbix 7.0 LTS JSON-RPC API (TASK-BE-01):
 * - Nạp thông số từ biến môi trường, bảo vệ an toàn (Read-only UI).
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

export interface ZabbixConfig {
  apiUrl: string;
  apiToken: string;
  fastPollIntervalMs: number; // Mặc định 30.000ms (30s)
  slowPollIntervalMs: number; // Mặc định 3.600.000ms (1h)
  safeWindowMs: number;       // Mặc định 600.000ms (10m) chống flapping
  requestTimeoutMs: number;   // Mặc định 5.000ms (5s)
  maxConsecutiveFailures: number; // 3 lần
}

export const zabbixConfig: ZabbixConfig = {
  apiUrl: process.env.ZABBIX_API_URL || 'http://192.168.1.50/zabbix/api_jsonrpc.php',
  apiToken: process.env.ZABBIX_API_TOKEN || '',
  fastPollIntervalMs: process.env.ZABBIX_FAST_POLL_MS ? parseInt(process.env.ZABBIX_FAST_POLL_MS, 10) : 30 * 1000,
  slowPollIntervalMs: process.env.ZABBIX_SLOW_POLL_MS ? parseInt(process.env.ZABBIX_SLOW_POLL_MS, 10) : 60 * 60 * 1000,
  safeWindowMs: process.env.ZABBIX_SAFE_WINDOW_MS ? parseInt(process.env.ZABBIX_SAFE_WINDOW_MS, 10) : 10 * 60 * 1000,
  requestTimeoutMs: 5 * 1000,
  maxConsecutiveFailures: 3,
};

export function getMaskedZabbixUrl(): string {
  try {
    const url = new URL(zabbixConfig.apiUrl);
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}/...`;
  } catch {
    return 'http://[ZABBIX_HOST_CONFIGURED]';
  }
}
