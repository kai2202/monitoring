/**
 * src/zabbix/client.ts
 *
 * Zabbix API 7.0 JSON-RPC client.
 *
 * Responsibilities:
 * - Authenticate with Zabbix and manage the auth token.
 * - Provide typed wrappers for the Zabbix API methods used by this application.
 * - Never expose credentials to the frontend or logs.
 *
 * NOTE: This is a skeleton implementation. All methods return placeholder
 * values until the Zabbix server is deployed and confirmed accessible.
 */

import {
  ZabbixRpcRequest,
  ZabbixRpcResponse,
  ZabbixHost,
  ZabbixProblem,
  ZabbixItem,
  ZabbixHistoryPoint,
  ZabbixTrendPoint,
} from '../types/zabbix.js';

export class ZabbixClientError extends Error {
  constructor(
    message: string,
    public readonly code?: number
  ) {
    super(message);
    this.name = 'ZabbixClientError';
  }
}

export class ZabbixClient {
  private authToken: string | null = null;
  private requestId = 1;

  constructor(
    private readonly apiUrl: string,
    private readonly username?: string,
    private readonly password?: string,
    staticToken?: string
  ) {
    if (staticToken) {
      this.authToken = staticToken;
    }
  }

  // --------------------------------------------------------------------------
  // Authentication
  // --------------------------------------------------------------------------

  /**
   * Authenticate with Zabbix API and store the auth token.
   * If a static API Token was provided in constructor, this verifies connection.
   */
  async authenticate(): Promise<void> {
    if (this.authToken) {
      // Token is already set, verify via apiinfo.version
      await this.rpc<string>('apiinfo.version', {}, true);
      return;
    }

    if (!this.username || !this.password) {
      throw new ZabbixClientError('Missing credentials or API token for Zabbix authentication.');
    }

    const result = await this.rpc<string>('user.login', {
      username: this.username,
      password: this.password,
    }, /* skipAuth */ true);
    this.authToken = result;
  }

  async reAuthenticate(): Promise<void> {
    this.authToken = null;
    await this.authenticate();
  }

  // --------------------------------------------------------------------------
  // Host methods
  // --------------------------------------------------------------------------

  /**
   * Retrieve all monitored hosts with their SNMP interface and inventory.
   * Zabbix API: host.get
   */
  async getHosts(): Promise<ZabbixHost[]> {
    return this.rpc<ZabbixHost[]>('host.get', {
      output: ['hostid', 'host', 'name', 'status', 'available', 'error'],
      selectInterfaces: ['interfaceid', 'ip', 'port', 'type', 'main'],
      selectInventory: ['location', 'serialno_a', 'model', 'vendor'],
      selectGroups: ['groupid', 'name'],
      monitored_hosts: true,
    });
  }

  /**
   * Update host inventory metadata (e.g. location, model, vendor).
   * Zabbix API: host.update
   */
  async updateHostInventory(
    hostid: string,
    inventory: Record<string, string>
  ): Promise<void> {
    await this.rpc('host.update', {
      hostid,
      inventory,
    });
  }

  // --------------------------------------------------------------------------
  // Problem methods
  // --------------------------------------------------------------------------

  /**
   * Retrieve active Zabbix Problems (unresolved triggers).
   * Optionally filtered to a specific hostid or array of hostids.
   * Zabbix API: problem.get
   */
  async getActiveProblems(hostids?: string | string[]): Promise<ZabbixProblem[]> {
    const params: Record<string, unknown> = {
      output: 'extend',
      recent: false,
      suppressed: false,
      selectHosts: ['hostid', 'name'],
    };
    if (hostids) {
      params['hostids'] = Array.isArray(hostids) ? hostids : [hostids];
    }
    return this.rpc<ZabbixProblem[]>('problem.get', params);
  }

  /**
   * Retrieve all problems (active + resolved) within a time window.
   * Zabbix API: problem.get with time_from / time_till
   */
  async getProblemsInRange(
    timeFrom: number,
    timeTill: number,
    hostids?: string | string[]
  ): Promise<ZabbixProblem[]> {
    const params: Record<string, unknown> = {
      output: 'extend',
      time_from: timeFrom,
      time_till: timeTill,
      selectHosts: ['hostid', 'name'],
    };
    if (hostids) {
      params['hostids'] = Array.isArray(hostids) ? hostids : [hostids];
    }
    return this.rpc<ZabbixProblem[]>('problem.get', params);
  }

  // --------------------------------------------------------------------------
  // Item methods
  // --------------------------------------------------------------------------

  /**
   * Retrieve the latest item values for a given host or list of hosts.
   * Zabbix API: item.get
   */
  async getLatestItems(hostids: string | string[], itemKeys?: string[]): Promise<ZabbixItem[]> {
    const params: Record<string, unknown> = {
      output: ['itemid', 'hostid', 'key_', 'name', 'lastvalue', 'lastclock', 'units'],
      hostids: Array.isArray(hostids) ? hostids : [hostids],
    };
    if (itemKeys && itemKeys.length > 0) {
      params['filter'] = { key_: itemKeys };
    }
    return this.rpc<ZabbixItem[]>('item.get', params);
  }

  // --------------------------------------------------------------------------
  // History & Trend methods
  // --------------------------------------------------------------------------

  /**
   * Retrieve historical metric values.
   * Zabbix API: history.get
   * historyType: 0 - numeric float, 1 - character, 2 - log, 3 - numeric unsigned, 4 - text, 5 - binary
   */
  async getHistory(
    itemids: string[],
    timeFrom?: number,
    timeTill?: number,
    historyType = 3,
    limit?: number
  ): Promise<ZabbixHistoryPoint[]> {
    const params: Record<string, unknown> = {
      output: 'extend',
      history: historyType,
      itemids,
      sortfield: 'clock',
      sortorder: 'ASC',
    };
    if (timeFrom !== undefined) params['time_from'] = timeFrom;
    if (timeTill !== undefined) params['time_till'] = timeTill;
    if (limit !== undefined) params['limit'] = limit;
    return this.rpc<ZabbixHistoryPoint[]>('history.get', params);
  }

  /**
   * Retrieve trend data (hourly aggregated metrics).
   * Zabbix API: trend.get
   */
  async getTrends(
    itemids: string[],
    timeFrom?: number,
    timeTill?: number,
    limit?: number
  ): Promise<ZabbixTrendPoint[]> {
    const params: Record<string, unknown> = {
      output: ['itemid', 'clock', 'num', 'value_min', 'value_avg', 'value_max'],
      itemids,
      sortfield: 'clock',
      sortorder: 'ASC',
    };
    if (timeFrom !== undefined) params['time_from'] = timeFrom;
    if (timeTill !== undefined) params['time_till'] = timeTill;
    if (limit !== undefined) params['limit'] = limit;
    return this.rpc<ZabbixTrendPoint[]>('trend.get', params);
  }

  // --------------------------------------------------------------------------
  // Low-level JSON-RPC transport
  // --------------------------------------------------------------------------

  private async rpc<T>(
    method: string,
    params: Record<string, unknown>,
    skipAuth = false
  ): Promise<T> {
    if (!skipAuth && !this.authToken) {
      throw new ZabbixClientError(
        'Not authenticated. Call authenticate() before making API requests.'
      );
    }

    const body: ZabbixRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: this.requestId++,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (!skipAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), 15_000); // 15s timeout for Zabbix calls

    let response: globalThis.Response;
    try {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ZabbixClientError(`Zabbix API request timed out after 15s at ${this.apiUrl}`);
      }
      throw new ZabbixClientError(`Zabbix API connection failed: ${errorMsg}`);
    } finally {
      clearTimeout(timeoutTimer);
    }

    if (!response.ok) {
      throw new ZabbixClientError(
        `HTTP ${response.status} from Zabbix API at ${this.apiUrl}`
      );
    }

    const json = (await response.json()) as ZabbixRpcResponse<T>;

    if (json.error) {
      throw new ZabbixClientError(
        `Zabbix API error [${json.error.code}]: ${json.error.message} — ${json.error.data}`,
        json.error.code
      );
    }

    return json.result;
  }
}

// --------------------------------------------------------------------------
// Singleton factory — one ZabbixClient per process
// --------------------------------------------------------------------------

let _client: ZabbixClient | null = null;

export function getZabbixClient(): ZabbixClient {
  if (!_client) {
    const url = process.env['ZABBIX_API_URL'];
    const token = process.env['ZABBIX_API_TOKEN'];
    const user = process.env['ZABBIX_API_USER'];
    const password = process.env['ZABBIX_API_PASSWORD'];

    if (!url) {
      throw new ZabbixClientError('Missing required environment variable: ZABBIX_API_URL');
    }

    if (!token && (!user || !password)) {
      throw new ZabbixClientError(
        'Missing authentication: provide either ZABBIX_API_TOKEN or both ZABBIX_API_USER and ZABBIX_API_PASSWORD'
      );
    }

    _client = new ZabbixClient(url, user, password, token);
  }
  return _client;
}
