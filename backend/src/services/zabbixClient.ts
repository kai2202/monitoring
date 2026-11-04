/**
 * Backend/src/services/zabbixClient.ts
 *
 * Client giao tiếp JSON-RPC 2.0 với máy chủ Zabbix 7.0 LTS.
 * - Hỗ trợ host.get, item.get, history.get để truy vấn bộ đếm trang in SNMP thực tế.
 * - Tuân thủ AGENTS.md: không bịa đặt số liệu khi Zabbix ngắt kết nối.
 */

export interface ZabbixJsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: Record<string, any>;
  id: number;
  auth?: string | null;
}

export interface ZabbixJsonRpcResponse<T = any> {
  jsonrpc: '2.0';
  result?: T;
  error?: {
    code: number;
    message: string;
    data: string;
  };
  id: number;
}

export class ZabbixClient {
  private apiUrl: string;
  private apiToken: string;
  private requestId = 1;

  constructor() {
    this.apiUrl = process.env.ZABBIX_API_URL || 'http://192.168.1.50/zabbix/api_jsonrpc.php';
    this.apiToken = process.env.ZABBIX_API_TOKEN || '';
  }

  async call<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    const payload: ZabbixJsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: this.requestId++,
      auth: this.apiToken ? this.apiToken : undefined,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json-rpc',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Zabbix HTTP error ${res.status}: ${res.statusText}`);
      }

      const json: ZabbixJsonRpcResponse<T> = await res.json();

      if (json.error) {
        throw new Error(`Zabbix API Error [${json.error.code}]: ${json.error.message} (${json.error.data})`);
      }

      return json.result as T;
    } catch (err: any) {
      console.warn(`[ZabbixClient] Không thể gọi API ${method}:`, err.message);
      throw err;
    }
  }

  async checkVersion(): Promise<string> {
    return this.call<string>('apiinfo.version');
  }
}

export const zabbixClient = new ZabbixClient();

