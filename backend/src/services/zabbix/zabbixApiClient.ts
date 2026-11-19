/**
 * Backend/src/services/zabbix/zabbixApiClient.ts
 *
 * Client giao tiếp JSON-RPC 2.0 với Zabbix 7.0 LTS:
 * - Hỗ trợ cả API Token (Bearer) và fallback tự động đăng nhập `user.login` (ZABBIX_USER/PASSWORD).
 * - Timeout mặc định 15s qua AbortController + Circuit Breaker backoff 15s.
 * - Hỗ trợ lọc Host Group tùy chọn (`ZABBIX_HOST_GROUP`) và bỏ qua SSL self-signed nếu cấu hình.
 */

import { zabbixConfig } from '../../config/zabbixConfig';
import {
  ZabbixHost,
  ZabbixItem,
  ZabbixProblem,
  ZabbixTrigger,
  ZabbixJsonRpcRequest,
  ZabbixJsonRpcResponse,
} from '../../types/zabbixTypes';

export class ZabbixApiClient {
  private requestId = 1;
  private consecutiveFailures = 0;
  private lastFailureTime = 0;
  private sessionToken: string | null = null;
  private readonly CIRCUIT_RESET_MS = 15 * 1000;

  public isConnected(): boolean {
    return this.consecutiveFailures < zabbixConfig.maxConsecutiveFailures;
  }

  private isCircuitOpen(): boolean {
    if (this.consecutiveFailures >= zabbixConfig.maxConsecutiveFailures) {
      if (Date.now() - this.lastFailureTime < this.CIRCUIT_RESET_MS) {
        return true;
      }
    }
    return false;
  }

  private async ensureAuthToken(): Promise<string> {
    if (zabbixConfig.apiToken) return zabbixConfig.apiToken;
    if (this.sessionToken) return this.sessionToken;

    if (!zabbixConfig.user || !zabbixConfig.password) {
      throw new Error('Thiếu ZABBIX_API_TOKEN hoặc ZABBIX_USER/ZABBIX_PASSWORD để xác thực Zabbix API.');
    }

    const token = await this.rawRpcCall<string>('user.login', {
      username: zabbixConfig.user,
      password: zabbixConfig.password,
    }, null);
    this.sessionToken = token;
    return token;
  }

  private async rawRpcCall<T = any>(
    method: string,
    params: Record<string, any>,
    bearerToken: string | null
  ): Promise<T> {
    if (zabbixConfig.tlsInsecure && process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    const payload: ZabbixJsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: this.requestId++,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), zabbixConfig.requestTimeoutMs);
    const headers: Record<string, string> = { 'Content-Type': 'application/json-rpc' };
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    try {
      const response = await fetch(zabbixConfig.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as ZabbixJsonRpcResponse<T>;
      if (data.error) {
        throw new Error(`Zabbix RPC [${data.error.code}]: ${data.error.message} (${data.error.data})`);
      }
      return data.result as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err?.name === 'AbortError') {
        throw new Error(`Zabbix API timeout sau ${zabbixConfig.requestTimeoutMs}ms (${method})`);
      }
      throw err;
    }
  }

  async call<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    if (this.isCircuitOpen()) {
      throw new Error(`[Zabbix Circuit Breaker] Tạm dừng kết nối do ${this.consecutiveFailures} lần lỗi liên tiếp.`);
    }

    const isPublicMethod = method === 'apiinfo.version' || method === 'user.login';
    try {
      const token = isPublicMethod ? null : await this.ensureAuthToken();
      const result = await this.rawRpcCall<T>(method, params, token);
      this.consecutiveFailures = 0;
      return result;
    } catch (err: any) {
      // Nếu session token hết hạn (khi dùng user.login), thử đăng nhập lại 1 lần
      const msg = String(err?.message || '');
      if (!zabbixConfig.apiToken && this.sessionToken && !isPublicMethod && (msg.includes('Session') || msg.includes('-32602') || msg.includes('re-login'))) {
        this.sessionToken = null;
        try {
          const freshToken = await this.ensureAuthToken();
          const retryResult = await this.rawRpcCall<T>(method, params, freshToken);
          this.consecutiveFailures = 0;
          return retryResult;
        } catch (retryErr) {
          this.consecutiveFailures++;
          this.lastFailureTime = Date.now();
          throw retryErr;
        }
      }

      this.consecutiveFailures++;
      this.lastFailureTime = Date.now();
      throw err;
    }
  }

  async checkVersion(): Promise<string> {
    return this.call<string>('apiinfo.version', {});
  }

  async getHosts(): Promise<ZabbixHost[]> {
    let groupids: string[] | undefined;
    if (zabbixConfig.hostGroup) {
      const groups = await this.call<Array<{ groupid: string }>>('hostgroup.get', {
        output: ['groupid'],
        filter: { name: [zabbixConfig.hostGroup] },
      });
      if (groups.length > 0) {
        groupids = groups.map((g) => g.groupid);
      }
    }

    return this.call<ZabbixHost[]>('host.get', {
      output: ['hostid', 'host', 'name', 'status', 'description'],
      selectInterfaces: ['interfaceid', 'ip', 'type', 'main', 'port', 'available'],
      selectGroups: ['groupid', 'name'],
      ...(groupids ? { groupids } : {}),
    });
  }

  async getActiveProblems(): Promise<ZabbixProblem[]> {
    return this.call<ZabbixProblem[]>('problem.get', {
      output: ['eventid', 'objectid', 'name', 'severity', 'clock', 'r_clock'],
      recent: true,
      sortfield: ['eventid'],
      sortorder: 'DESC',
      limit: 100,
    });
  }

  async getItemsByHostIds(hostIds: string[]): Promise<ZabbixItem[]> {
    if (!hostIds || hostIds.length === 0) return [];
    return this.call<ZabbixItem[]>('item.get', {
      output: ['itemid', 'hostid', 'name', 'key_', 'lastvalue', 'units', 'lastclock', 'status'],
      hostids: hostIds,
      filter: { status: 0 },
    });
  }

  async getTriggersByIds(triggerIds: string[]): Promise<ZabbixTrigger[]> {
    if (!triggerIds || triggerIds.length === 0) return [];
    return this.call<ZabbixTrigger[]>('trigger.get', {
      triggerids: triggerIds,
      output: ['triggerid', 'description', 'priority', 'value', 'lastchange'],
      selectHosts: ['hostid', 'host', 'name'],
    });
  }
}

export const zabbixApiClient = new ZabbixApiClient();
