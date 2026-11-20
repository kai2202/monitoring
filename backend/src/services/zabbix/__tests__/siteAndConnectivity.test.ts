import { describe, it, expect } from 'vitest';
import { isIpInCidr, resolveSiteForPrinter } from '../siteSubnetResolver';
import {
  resolveHostConnectivity,
  computeSupplyHealth,
  classifyCurrentPrinterFault,
  resolveSupplyPercentFromItems,
  extractHostSerialAndModel,
} from '../zabbixCounterRollupHelper';
import { ZabbixHost, ZabbixItem } from '../../../types/zabbixTypes';

describe('siteSubnetResolver', () => {
  it('matches IPv4 addresses against CIDR subnets accurately', () => {
    expect(isIpInCidr('10.10.1.45', '10.10.1.0/24')).toBe(true);
    expect(isIpInCidr('10.10.2.45', '10.10.1.0/24')).toBe(false);
    expect(isIpInCidr('192.168.12.5', '192.168.0.0/16')).toBe(true);
    expect(isIpInCidr('invalid-ip', '10.10.1.0/24')).toBe(false);
  });

  it('picks longest matching CIDR rule and falls back to Zabbix host group', () => {
    const rules = [
      { siteName: 'Site Miền Nam', subnetCidr: '10.10.0.0/16' },
      { siteName: 'Site HCM - Q1', subnetCidr: '10.10.1.0/24' },
    ];
    expect(resolveSiteForPrinter('10.10.1.20', rules)).toBe('Site HCM - Q1');
    expect(
      resolveSiteForPrinter('172.16.5.10', rules, [{ name: 'Printers' }, { name: 'Site Đà Nẵng' }])
    ).toBe('Site Đà Nẵng');
  });
});

describe('resolveHostConnectivity (ICMP + SNMP separation)', () => {
  const baseHost: ZabbixHost = {
    hostid: '101',
    host: 'PRN-01',
    name: 'PRN-01',
    status: '0',
    interfaces: [{ interfaceid: '1', ip: '10.10.1.20', type: '2', main: '1', port: '161', available: '1' }],
  };

  it('reports both ICMP UP and SNMP UP when healthy', () => {
    const items: ZabbixItem[] = [
      { itemid: '1', hostid: '101', name: 'ICMP', key_: 'icmpping', lastvalue: '1', status: '0' },
    ];
    expect(resolveHostConnectivity(baseHost, items)).toEqual({
      alive: true,
      icmpStatus: 'UP',
      snmpStatus: 'UP',
    });
  });

  it('keeps icmpStatus=UP and snmpStatus=DOWN distinct when ping succeeds but SNMP fails', () => {
    const hostSnmpDown: ZabbixHost = {
      ...baseHost,
      interfaces: [{ interfaceid: '1', ip: '10.10.1.20', type: '2', main: '1', port: '161', available: '2' }],
    };
    const items: ZabbixItem[] = [
      { itemid: '1', hostid: '101', name: 'ICMP', key_: 'icmpping', lastvalue: '1', status: '0' },
    ];
    expect(resolveHostConnectivity(hostSnmpDown, items)).toEqual({
      alive: true,
      icmpStatus: 'UP',
      snmpStatus: 'DOWN',
    });
  });
});

describe('computeSupplyHealth & classifyCurrentPrinterFault', () => {
  it('warns strictly below 15%', () => {
    expect(computeSupplyHealth([15], 15, 5).health).toBe('Healthy');
    expect(computeSupplyHealth([14], 15, 5).health).toBe('Warning');
    expect(computeSupplyHealth([5], 15, 5).health).toBe('Critical');
  });

  it('classifies PAPER_JAM and HARDWARE_ERROR while ignoring paper empty', () => {
    expect(classifyCurrentPrinterFault(['Tray 1 paper empty'])).toEqual({
      faultType: 'NONE',
      faultText: null,
    });
    expect(classifyCurrentPrinterFault(['Paper jam at Tray 2'])).toEqual({
      faultType: 'PAPER_JAM',
      faultText: 'Paper jam at Tray 2',
    });
    expect(classifyCurrentPrinterFault(['SC542 Fuser temperature error'])).toEqual({
      faultType: 'HARDWARE_ERROR',
      faultText: 'SC542 Fuser temperature error',
    });
  });

  it('computes percentage from raw level & maxCapacity and extracts serial/model', () => {
    const items: ZabbixItem[] = [
      { itemid: '1', hostid: '101', name: 'Black Level', key_: 'toner_black.level', lastvalue: '4500', status: '0' },
      { itemid: '2', hostid: '101', name: 'Black Max', key_: 'toner_black.max', lastvalue: '10000', status: '0' },
      { itemid: '3', hostid: '101', name: 'Serial', key_: 'prtGeneralSerialNumber', lastvalue: 'SN-998877', status: '0' },
      { itemid: '4', hostid: '101', name: 'Model', key_: 'hrDeviceDescr', lastvalue: 'Ricoh MP C6004', status: '0' },
      { itemid: '5', hostid: '101', name: 'Mức Vật Tư: Cyan Toner', key_: 'printer.supply.level[2]', lastvalue: '3000', status: '0' },
      { itemid: '6', hostid: '101', name: 'Dung Lượng Tối Đa Vật Tư: Cyan Toner', key_: 'printer.supply.max[2]', lastvalue: '10000', status: '0' },
      { itemid: '7', hostid: '101', name: 'Mức Vật Tư: Toner', key_: 'printer.supply.level[1]', lastvalue: '60', status: '0' },
    ];
    expect(resolveSupplyPercentFromItems(items, ['toner_black'])).toBe(45);
    expect(resolveSupplyPercentFromItems(items, ['toner_cyan'], ['cyan'])).toBe(30);
    expect(resolveSupplyPercentFromItems(items.filter((it) => !it.name.includes('Cyan')), [], ['toner'])).toBe(60);
    expect(extractHostSerialAndModel(items)).toEqual({
      serialNumber: 'SN-998877',
      model: 'Ricoh MP C6004',
    });
  });
});
