import { describe, it, expect } from 'vitest';
import { classifyProblem, computeHealth, PrinterDataService } from '../printerDataService.js';
import { ZabbixHost, ZabbixItem, ZabbixProblem } from '../../types/zabbix.js';

const mockItem = (itemid: string, hostid: string, key_: string, name: string, lastvalue: string, lastclock: string, units = '%'): ZabbixItem => ({
  itemid,
  hostid,
  key_,
  name,
  lastvalue,
  lastclock,
  units,
});

describe('Edge Cases - classifyProblem resilience', () => {
  it('handles null, undefined, empty string, and whitespace without crashing', () => {
    // Null/undefined/empty input
    const res1 = classifyProblem(null as any, '4');
    expect(res1.alertSeverity).toBe('unknown');
    expect(res1.incidentSeverity).toBe('Info');
    expect(res1.category).toBe('System');

    const res2 = classifyProblem(undefined as any, '3');
    expect(res2.alertSeverity).toBe('unknown');

    const res3 = classifyProblem('', '2');
    expect(res3.alertSeverity).toBe('unknown');

    const res4 = classifyProblem('   ', '4');
    expect(res4.alertSeverity).toBe('unknown');
  });

  it('correctly classifies Ricoh Service Call (SC) error codes as Critical Hardware Errors', () => {
    const testCases = [
      'Printer Hardware Error: SC542 Fusing temperature warm-up error {15000}',
      'SC-554 Pressure roller thermistor error',
      'SC 670 Controller startup error',
      'SC552 Fusing unit heater lamp failure',
      'Ricoh SC990 Software error',
    ];

    for (const msg of testCases) {
      const res = classifyProblem(msg, '4');
      expect(res.alertSeverity).toBe('critical');
      expect(res.incidentSeverity).toBe('Critical');
      expect(res.category).toBe('Hardware Error');
    }
  });

  it('classifies maintenance supplies such as Cleaning Web as Warning Supply Alert', () => {
    const web1 = classifyProblem('Replace Cleaning Web {30402}', '3');
    expect(web1.alertSeverity).toBe('warning');
    expect(web1.incidentSeverity).toBe('Warning');
    expect(web1.category).toBe('Supply Alert');

    const web2 = classifyProblem('Printer Warning: Cuộn lau sấy sắp hết', '4');
    expect(web2.alertSeverity).toBe('warning');
    expect(web2.incidentSeverity).toBe('Warning');
    expect(web2.category).toBe('Supply Alert');
  });

  it('classifies fusing unit errors as Critical Hardware Error', () => {
    const fuser1 = classifyProblem('Replace Fusing Unit {30405}', '4');
    expect(fuser1.alertSeverity).toBe('critical');
    expect(fuser1.incidentSeverity).toBe('Critical');
    expect(fuser1.category).toBe('Hardware Error');

    const fuser2 = classifyProblem('Lỗi cụm sấy nhiệt độ cao', '4');
    expect(fuser2.alertSeverity).toBe('critical');
    expect(fuser2.category).toBe('Hardware Error');
  });

  it('classifies multilingual and mixed Vietnamese/English paper and jam alerts', () => {
    const jam1 = classifyProblem('Kẹt giấy khay nạp 1', '4');
    expect(jam1.category).toBe('Paper Jam');
    expect(jam1.alertSeverity).toBe('critical');

    const paper1 = classifyProblem('Khay 2 rỗng - Nạp giấy A4', '3');
    expect(paper1.category).toBe('Paper / Tray');
    expect(paper1.alertSeverity).toBe('warning');
  });
});

describe('Edge Cases - computeHealth state machine', () => {
  it('prioritizes Offline connection status above any alert severity', () => {
    // Offline must remain Offline even if there are critical alerts or stale flags
    expect(computeHealth('Offline', 'critical', false)).toBe('Offline');
    expect(computeHealth('Offline', 'warning', true)).toBe('Offline');
    expect(computeHealth('Offline', 'clear', false)).toBe('Offline');
  });

  it('prioritizes Stale status when connection is Online but telemetry stopped', () => {
    expect(computeHealth('Online', 'clear', true)).toBe('Stale');
    expect(computeHealth('Online', 'warning', true)).toBe('Stale');
  });

  it('reports Unknown when connection status is Unknown', () => {
    expect(computeHealth('Unknown', 'clear', false)).toBe('Unknown');
  });

  it('evaluates Critical and Warning severities when Online and Fresh', () => {
    expect(computeHealth('Online', 'critical', false)).toBe('Critical');
    expect(computeHealth('Online', 'warning', false)).toBe('Warning');
  });

  it('reports Healthy only when Online, not Stale, and AlertSeverity is clear or unknown', () => {
    expect(computeHealth('Online', 'clear', false)).toBe('Healthy');
  });
});

describe('Edge Cases - mapHostToPrinter data sanitization and resilience', () => {
  class TestablePrinterDataService extends PrinterDataService {
    public testMapHost(
      host: ZabbixHost,
      problems: ZabbixProblem[],
      items: ZabbixItem[],
      volume: number | null = null
    ) {
      return (this as any).mapHostToPrinter(host, problems, items, volume);
    }
  }

  const mockClient = {} as any;
  const service = new TestablePrinterDataService(mockClient);

  it('handles RFC 3805 negative supply level codes (-3, -2, -1) gracefully', () => {
    const mockHost: ZabbixHost = {
      hostid: '1001',
      host: 'Test_Printer',
      name: 'Test Printer RFC3805',
      status: '0',
      available: '1',
      error: '',
      interfaces: [{ interfaceid: '1', ip: '10.0.0.1', port: '161', type: '2', main: '1' }],
    };

    // Items with negative levels (-3: some remaining, -2: unknown, -1: no restriction)
    const items: ZabbixItem[] = [
      mockItem('1', '1001', 'printer.supply.level.percent[1]', 'Black Toner', '-3', '1700000000'),
      mockItem('2', '1001', 'printer.supply.level.percent[2]', 'Cyan Toner', '-2', '1700000000'),
      mockItem('3', '1001', 'printer.supply.level.percent[3]', 'Magenta Toner', '-1', '1700000000'),
      mockItem('4', '1001', 'printer.supply.level.percent[4]', 'Yellow Toner', '85.4', '1700000000'),
      mockItem('5', '1001', 'printer.supply.level.percent[5]', 'Waste Toner', '105', '1700000000'), // clamped to 100
    ];

    const result = service.testMapHost(mockHost, [], items);

    // Negative values must be normalized to null (cannot display -3% toner)
    expect(result.supplies.black).toBeNull();
    expect(result.supplies.cyan).toBeNull();
    expect(result.supplies.magenta).toBeNull();
    // Valid value rounded
    expect(result.supplies.yellow).toBe(85);
    // Over-100 clamped to 100
    expect(result.supplies.waste).toBe(100);
  });

  it('supports direct Ricoh vendor keys (ricoh.toner.black) as well as LLD items', () => {
    const mockHost: ZabbixHost = {
      hostid: '1002',
      host: 'Ricoh_Direct',
      name: 'Ricoh Aficio MP 5002',
      status: '0',
      available: '1',
      error: '',
      interfaces: [{ interfaceid: '1', ip: '10.48.3.253', port: '161', type: '2', main: '1' }],
    };

    const items: ZabbixItem[] = [
      mockItem('10', '1002', 'ricoh.toner.black', 'Ricoh: Black Toner Level %', '40', '1700000000'),
      mockItem('11', '1002', 'ricoh.model', 'Ricoh: Printer Model', 'Aficio MP 5002', '1700000000', ''),
      mockItem('12', '1002', 'ricoh.firmware', 'Ricoh: Firmware Version', '2.16', '1700000000', ''),
    ];

    const result = service.testMapHost(mockHost, [], items);

    expect(result.supplies.black).toBe(40);
    expect(result.supplies.cyan).toBeNull(); // Mono machine has no color toner
    expect(result.model).toBe('Aficio MP 5002');
    expect(result.firmware).toBe('2.16');
    expect(result.deviceType).toBe('Mono MFP');
    expect(result.colorCapability).toBe('Monochrome');
  });

  it('detects different printer manufacturers (HP, Canon, Xerox, Brother) from sysDescr', () => {
    const makeHost = (name: string): ZabbixHost => ({
      hostid: '2001',
      host: name,
      name,
      status: '0',
      available: '1',
      error: '',
      interfaces: [{ interfaceid: '1', ip: '192.168.1.50', port: '161', type: '2', main: '1' }],
    });

    const hpRes = service.testMapHost(makeHost('HP-PRN'), [], [
      mockItem('1', '2001', 'system.descr', 'Descr', 'HP LaserJet Enterprise M607, Firmware 2407085_000028', '1700000000', '')
    ]);
    expect(hpRes.mfr).toBe('HP');
    expect(hpRes.model).toBe('LaserJet Enterprise M607');

    const canonRes = service.testMapHost(makeHost('Canon-PRN'), [], [
      mockItem('2', '2001', 'system.descr', 'Descr', 'Canon imageRUNNER ADV C5535i', '1700000000', '')
    ]);
    expect(canonRes.mfr).toBe('Canon');

    const xeroxRes = service.testMapHost(makeHost('Xerox-PRN'), [], [
      mockItem('3', '2001', 'system.descr', 'Descr', 'Xerox VersaLink C7020 Multifunction', '1700000000', '')
    ]);
    expect(xeroxRes.mfr).toBe('Xerox');
  });

  it('detects Zombie state (Ping UP, but SNMP connection has failed)', () => {
    const mockHost: ZabbixHost = {
      hostid: '3001',
      host: 'Zombie_Printer',
      name: 'Zombie Printer 10.48.3.250',
      status: '0',
      available: '1',
      error: 'Timeout while connecting to 10.48.3.250:161', // SNMP poller error
      interfaces: [{ interfaceid: '1', ip: '10.48.3.250', port: '161', type: '2', main: '1' }],
    };

    const items: ZabbixItem[] = [
      mockItem('1', '3001', 'icmpping', 'Ping', '1', String(Math.floor(Date.now() / 1000)), '')
    ];

    const result = service.testMapHost(mockHost, [], items);

    expect(result.connectionStatus).toBe('Online'); // Ping responded
    expect(result.monitoringStatus).toBe('Monitoring Degraded'); // SNMP is broken
    expect(result.snmpStatus).toContain('Timeout while connecting');
  });

  it('detects Stale telemetry when metrics are older than 30 minutes', () => {
    const twoHoursAgoSec = Math.floor(Date.now() / 1000) - 7200;
    const mockHost: ZabbixHost = {
      hostid: '3002',
      host: 'Stale_Printer',
      name: 'Stale Printer',
      status: '0',
      available: '1',
      error: '',
      interfaces: [{ interfaceid: '1', ip: '10.48.3.252', port: '161', type: '2', main: '1' }],
    };

    const items: ZabbixItem[] = [
      mockItem('1', '3002', 'icmpping', 'Ping', '1', String(twoHoursAgoSec), ''),
      mockItem('2', '3002', 'printer.counter.total', 'Total', '800000', String(twoHoursAgoSec), ''),
    ];

    const result = service.testMapHost(mockHost, [], items);

    expect(result.isStale).toBe(true);
    expect(result.health).toBe('Stale');
    expect(result.monitoringStatus).toBe('Monitoring Degraded');
  });

  it('extracts real page counters (total, print, copy, fax) when present', () => {
    const mockHost: ZabbixHost = {
      hostid: '4001',
      host: 'AC_Kaizen',
      name: 'AC Kaizen MP 4002',
      status: '0',
      available: '1',
      error: '',
      interfaces: [{ interfaceid: '1', ip: '192.168.93.7', port: '161', type: '2', main: '1' }],
    };

    const items: ZabbixItem[] = [
      mockItem('1', '4001', 'printer.counter.total', 'Total', '853193', '1700000000', 'pages'),
      mockItem('2', '4001', 'ricoh.counter.copy', 'Copy', '404050', '1700000000', 'pages'),
      mockItem('3', '4001', 'ricoh.counter.print', 'Print', '427014', '1700000000', 'pages'),
      mockItem('4', '4001', 'ricoh.counter.fax', 'Fax', '22113', '1700000000', 'pages'),
    ];

    const result = service.testMapHost(mockHost, [], items);

    expect(result.counters.total).toBe(853193);
    expect(result.counters.copier).toBe(404050);
    expect(result.counters.scanner).toBe(427014); // print/scanner channel
    expect(result.counters.fax).toBe(22113);
  });
});
