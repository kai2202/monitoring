/**
 * src/types/zabbix.ts
 *
 * TypeScript interfaces for Zabbix API 7.0 JSON-RPC responses.
 * Only the fields actually used by this application are defined here.
 * Add fields as integration expands.
 */

/** Zabbix JSON-RPC request envelope */
export interface ZabbixRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: Record<string, unknown>;
  id: number;
}

/** Zabbix JSON-RPC response envelope */
export interface ZabbixRpcResponse<T> {
  jsonrpc: '2.0';
  result: T;
  id: number;
  error?: {
    code: number;
    message: string;
    data: string;
  };
}

/** Zabbix Host object (subset of host.get output) */
export interface ZabbixHost {
  hostid: string;
  host: string;
  name: string;
  status: string; // '0' = monitored, '1' = unmonitored
  available: string; // '0' = unknown, '1' = available, '2' = unavailable
  error: string;
  interfaces: ZabbixInterface[];
  inventory?: Record<string, string>;
  groups?: ZabbixGroup[];
}

export interface ZabbixInterface {
  interfaceid: string;
  ip: string;
  port: string;
  type: string; // '2' = SNMP
  main: string; // '1' = default interface
}

export interface ZabbixGroup {
  groupid: string;
  name: string;
}

/** Zabbix Problem (active trigger) */
export interface ZabbixProblem {
  eventid: string;
  objectid: string;   // triggerid
  name: string;       // trigger name (alert description)
  severity: string;   // '0' Not classified, '2' Warning, '3' Average, '4' High, '5' Disaster
  clock: string;      // Unix timestamp of problem start
  r_clock?: string;   // Unix timestamp of resolution (absent if still active)
  acknowledged: string;
  hosts?: ZabbixProblemHost[];
}

export interface ZabbixProblemHost {
  hostid: string;
  name: string;
}

/** Latest item value from Zabbix */
export interface ZabbixItem {
  itemid: string;
  hostid: string;
  key_: string;
  name: string;
  lastvalue: string;
  lastclock: string;
  units: string;
}

export interface ZabbixHistoryPoint {
  itemid: string;
  clock: string;
  value: string;
  ns?: string;
}

export interface ZabbixTrendPoint {
  itemid: string;
  clock: string;
  num: string;
  value_min: string;
  value_avg: string;
  value_max: string;
}
