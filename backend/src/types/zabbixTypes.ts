/**
 * Backend/src/types/zabbixTypes.ts
 *
 * Khai báo TypeScript Interfaces cho Zabbix 7.0 JSON-RPC 2.0 (TASK-BE-01):
 * - Định nghĩa cấu trúc Host, Interface, Item, Problem, Trigger chuẩn Zabbix.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

export interface ZabbixInterface {
  interfaceid: string;
  ip: string;
  type: string;
  main: string;
  port: string;
}

export interface ZabbixHost {
  hostid: string;
  host: string;
  name: string;
  status: string; // "0" = Monitored, "1" = Unmonitored
  interfaces?: ZabbixInterface[];
}

export interface ZabbixItem {
  itemid: string;
  hostid: string;
  name: string;
  key_: string;
  lastvalue?: string;
  units?: string;
  lastclock?: string;
  status: string; // "0" = Enabled, "1" = Disabled
}

export interface ZabbixProblem {
  eventid: string;
  objectid: string; // Trigger ID
  name: string;
  severity: string; // "0" = Not classified, "1" = Info, "2" = Warning, "3" = Average, "4" = High, "5" = Disaster
  clock: string;
  r_clock?: string;
  acknowledged?: string;
}

export interface ZabbixTrigger {
  triggerid: string;
  description: string;
  priority: string;
  value: string; // "0" = OK, "1" = PROBLEM
  lastchange: string;
  hosts?: Array<{
    hostid: string;
    host?: string;
    name?: string;
  }>;
}

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
