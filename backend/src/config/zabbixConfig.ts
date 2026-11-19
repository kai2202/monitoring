/**
 * Backend/src/config/zabbixConfig.ts
 *
 * Cấu hình kết nối Zabbix 7.0 LTS JSON-RPC API (đồng bộ với env.ts):
 * - Hỗ trợ cả API Token (Bearer) lẫn fallback User/Password (user.login).
 * - Timeout mặc định 15.000ms (15s) phù hợp cho sync toàn bộ hosts/items.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { env } from './env';

export interface ZabbixConfig {
  apiUrl: string;
  apiToken: string;
  user: string;
  password: string;
  hostGroup: string;
  tlsInsecure: boolean;
  fastPollIntervalMs: number;
  slowPollIntervalMs: number;
  safeWindowMs: number;
  requestTimeoutMs: number;
  maxConsecutiveFailures: number;
}

function safeInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const zabbixConfig: ZabbixConfig = {
  get apiUrl(): string {
    return process.env.ZABBIX_API_URL || env.ZABBIX_API_URL;
  },
  get apiToken(): string {
    return process.env.ZABBIX_API_TOKEN || env.ZABBIX_API_TOKEN || '';
  },
  get user(): string {
    return process.env.ZABBIX_USER || env.ZABBIX_USER;
  },
  get password(): string {
    return process.env.ZABBIX_PASSWORD || env.ZABBIX_PASSWORD;
  },
  get hostGroup(): string {
    return process.env.ZABBIX_HOST_GROUP || env.ZABBIX_HOST_GROUP || '';
  },
  get tlsInsecure(): boolean {
    return (process.env.ZABBIX_TLS_INSECURE || String(env.ZABBIX_TLS_INSECURE)) === 'true';
  },
  get fastPollIntervalMs(): number {
    return safeInt(process.env.ZABBIX_FAST_POLL_MS, 30 * 1000);
  },
  get slowPollIntervalMs(): number {
    return safeInt(process.env.ZABBIX_SLOW_POLL_MS, 60 * 60 * 1000);
  },
  get safeWindowMs(): number {
    return safeInt(process.env.ZABBIX_SAFE_WINDOW_MS, 10 * 60 * 1000);
  },
  get requestTimeoutMs(): number {
    return safeInt(process.env.ZABBIX_TIMEOUT_MS, env.ZABBIX_TIMEOUT_MS || 15 * 1000);
  },
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
