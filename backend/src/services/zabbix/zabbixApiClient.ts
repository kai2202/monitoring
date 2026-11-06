/**
 * Backend/src/services/zabbix/zabbixApiClient.ts
 *
 * Client giao tiếp JSON-RPC 2.0 kiên cường với Zabbix 7.0 LTS (TASK-BE-01):
 * - Timeout cứng 5s bằng AbortController.
 * - Circuit Breaker 3 lần lỗi liên tiếp -> giãn chu kỳ 15s để chống spam request.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
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
  private readonly CIRCUIT_RESET_MS = 15 * 1000; // 15s backoff

  public isConnected(): boolean {
    return this.consecutiveFailures < zabbixConfig.maxConsecutiveFailures;
  }

  private isCircuitOpen(): boolean {
    if (this.consecutiveFailures >= zabbixConfig.maxConsecutiveFailures) {
      if (Date.now() - this.lastFailureTime < this.CIRCUIT_RESET_MS) {
        return true;
      }
      // Thử lại một lần sau khi hết thời gian backoff (Half-Open state)
    }
    return false;
  }

  async call<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    if (this.isCircuitOpen()) {
      throw new Error(`[Zabbix Circuit Breaker] Tạm dừng kết nối Zabbix API do ${this.consecutiveFailures} lần lỗi liên tiếp.`);
    }

    const payload: ZabbixJsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: this.requestId++,
      auth: zabbixConfig.apiToken ? zabbixConfig.apiToken : undefined,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), zabbixConfig.requestTimeoutMs);

    try {
      const response = await fetch(zabbixConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json-rpc',
          ...(zabbixConfig.apiToken ? { Authorization: `Bearer ${zabbixConfig.apiToken}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as ZabbixJsonRpcResponse<T>;
      if (data.error) {
        throw new Error(`Zabbix API Error [${data.error.code}]: ${data.error.message} - ${data.error.data}`);
      }

      // Khôi phục thành công -> Reset Circuit Breaker
      this.consecutiveFailures = 0;
      return data.result as T;
    } catch (err: any) {
      clearTimeout(timer);
      this.consecutiveFailures++;
      this.lastFailureTime = Date.now();
      throw err;
    }
  }

  async checkVersion(): Promise<string> {
    return this.call<string>('apiinfo.version', {});
  }

  async getHosts(): Promise<ZabbixHost[]> {
    return this.call<ZabbixHost[]>('host.get', {
      output: ['hostid', 'host', 'name', 'status'],
      selectInterfaces: ['ip', 'type', 'main', 'port'],
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
