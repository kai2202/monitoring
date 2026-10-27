/**
 * __tests__/fleetService.test.ts
 *
 * Unit tests for fleetService.ts — pure computation functions.
 * No mocking required; these functions are fully deterministic on input.
 *
 * Run: npx vitest run
 */

import { describe, it, expect } from 'vitest';
import {
  getFleetStats,
  getPrintersNeedingAttention,
  getConnectivityDistribution,
  getManufacturerDistribution,
  getDeviceTypeDistribution,
  getAvailabilityTimeline,
} from '../services/fleetService';
import { Printer, Incident } from '../types/printer';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makePrinter(overrides: Partial<Printer>): Printer {
  return {
    id: 'p1',
    name: 'Printer 1',
    ip: '10.0.0.1',
    mfr: 'Ricoh',
    model: 'MP C6004',
    deviceType: 'Color MFP',
    serial: 'ABC123',
    firmware: '1.0',
    connectionStatus: 'Online',
    monitoringStatus: 'Monitoring Active',
    status: 'Online',
    alertSeverity: 'clear',
    alertText: '',
    location: 'Tầng 1',
    snmpStatus: 'No error',
    lastScrape: new Date().toISOString(),
    lastSuccessfulScrape: new Date().toISOString(),
    isStale: false,
    health: 'Healthy',
    scannerErr: '',
    adfErr: '',
    copierErr: '',
    mfpErr: '',
    supplies: { black: 80, cyan: 75, magenta: 60, yellow: 90, waste: 20 },
    counters: { total: 10000, copier: 5000, fax: 500, scanner: 4500 },
    thirtyDayVolume: 500,
    incidents: [],
    ...overrides,
  };
}

function makeIncident(overrides: Partial<Incident>): Incident {
  return {
    id: 'i1',
    printer: 'Printer 1',
    type: 'Hardware Error',
    desc: 'Paper jam',
    severity: 'Warning',
    status: 'Active',
    start: new Date().toISOString(),
    duration: '15m',
    notificationStatus: 'N/A',
    lifecycle: 'Active',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getFleetStats
// ---------------------------------------------------------------------------

describe('getFleetStats', () => {
  it('returns all-zero stats for empty printer list', () => {
    const stats = getFleetStats([], []);
    expect(stats.totalPrinters).toBe(0);
    expect(stats.onlineCount).toBe(0);
    expect(stats.offlineCount).toBe(0);
    expect(stats.lowSuppliesCount).toBe(0);
  });

  it('counts online and offline printers correctly', () => {
    const printers = [
      makePrinter({ id: 'p1', connectionStatus: 'Online' }),
      makePrinter({ id: 'p2', connectionStatus: 'Offline' }),
      makePrinter({ id: 'p3', connectionStatus: 'Online' }),
      makePrinter({ id: 'p4', connectionStatus: 'Unknown' }),
    ];
    const stats = getFleetStats(printers, []);
    expect(stats.totalPrinters).toBe(4);
    expect(stats.onlineCount).toBe(2);
    expect(stats.offlineCount).toBe(1);
    expect(stats.unknownCount).toBe(1);
    expect(stats.onlinePct).toBe(50.0);
  });

  it('counts active incidents by severity', () => {
    const incidents = [
      makeIncident({ id: 'i1', status: 'Active', severity: 'Critical' }),
      makeIncident({ id: 'i2', status: 'Active', severity: 'Warning' }),
      makeIncident({ id: 'i3', status: 'Resolved', severity: 'Critical' }),
    ];
    const stats = getFleetStats([], incidents);
    expect(stats.activeIncidentsCount).toBe(2);
    expect(stats.criticalIncidentsCount).toBe(1);
    expect(stats.warningIncidentsCount).toBe(1);
  });

  it('identifies printers with low toner (< 15%)', () => {
    const printers = [
      makePrinter({ id: 'p1', supplies: { black: 10, cyan: 80, magenta: 80, yellow: 80, waste: 5 } }),
      makePrinter({ id: 'p2', supplies: { black: 80, cyan: 80, magenta: 80, yellow: 80, waste: 5 } }),
    ];
    const stats = getFleetStats(printers, []);
    expect(stats.lowSuppliesCount).toBe(1);
  });

  it('identifies waste toner full (>= 85) as low supply', () => {
    const printers = [
      makePrinter({ id: 'p1', supplies: { black: 80, cyan: 80, magenta: 80, yellow: 80, waste: 85 } }),
      makePrinter({ id: 'p2', supplies: { black: 80, cyan: 80, magenta: 80, yellow: 80, waste: 84 } }),
    ];
    const stats = getFleetStats(printers, []);
    expect(stats.lowSuppliesCount).toBe(1);
  });

  it('does NOT count null supply values as low (data unavailable)', () => {
    const printers = [
      makePrinter({ id: 'p1', supplies: { black: null, cyan: null, magenta: null, yellow: null, waste: null } }),
    ];
    const stats = getFleetStats(printers, []);
    expect(stats.lowSuppliesCount).toBe(0);
  });

  it('counts stale printers correctly', () => {
    const printers = [
      makePrinter({ id: 'p1', isStale: true }),
      makePrinter({ id: 'p2', isStale: false }),
      makePrinter({ id: 'p3', isStale: true }),
    ];
    const stats = getFleetStats(printers, []);
    expect(stats.staleCount).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// getPrintersNeedingAttention
// ---------------------------------------------------------------------------

describe('getPrintersNeedingAttention', () => {
  it('returns empty array for empty input', () => {
    expect(getPrintersNeedingAttention([])).toHaveLength(0);
  });

  it('includes offline printers', () => {
    const printers = [
      makePrinter({ id: 'p1', connectionStatus: 'Offline' }),
      makePrinter({ id: 'p2', connectionStatus: 'Online' }),
    ];
    const result = getPrintersNeedingAttention(printers);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
  });

  it('includes printers with critical alert severity', () => {
    const printers = [
      makePrinter({ id: 'p1', alertSeverity: 'critical' }),
      makePrinter({ id: 'p2', alertSeverity: 'clear' }),
    ];
    const result = getPrintersNeedingAttention(printers);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
  });

  it('includes stale printers', () => {
    const printers = [
      makePrinter({ id: 'p1', isStale: true, alertSeverity: 'clear' }),
      makePrinter({ id: 'p2', isStale: false }),
    ];
    const result = getPrintersNeedingAttention(printers);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
  });

  it('sorts offline/critical before warning/stale', () => {
    const printers = [
      makePrinter({ id: 'p1', alertSeverity: 'warning' }),
      makePrinter({ id: 'p2', connectionStatus: 'Offline' }),
      makePrinter({ id: 'p3', alertSeverity: 'critical' }),
    ];
    const result = getPrintersNeedingAttention(printers);
    expect(['p2', 'p3']).toContain(result[0].id);
    expect(result[result.length - 1].id).toBe('p1');
  });

  it('excludes healthy printers with sufficient supplies', () => {
    const printers = [
      makePrinter({ id: 'p1', connectionStatus: 'Online', alertSeverity: 'clear', isStale: false,
        supplies: { black: 80, cyan: 80, magenta: 80, yellow: 80, waste: 20 } }),
    ];
    expect(getPrintersNeedingAttention(printers)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getConnectivityDistribution
// ---------------------------------------------------------------------------

describe('getConnectivityDistribution', () => {
  it('returns empty array for no printers', () => {
    expect(getConnectivityDistribution([])).toHaveLength(0);
  });

  it('returns correct distribution counts', () => {
    const printers = [
      makePrinter({ id: 'p1', connectionStatus: 'Online' }),
      makePrinter({ id: 'p2', connectionStatus: 'Online' }),
      makePrinter({ id: 'p3', connectionStatus: 'Offline' }),
    ];
    const result = getConnectivityDistribution(printers);
    const online = result.find(r => r.label.includes('Online'));
    const offline = result.find(r => r.label.includes('Offline'));
    expect(online?.count).toBe(2);
    expect(offline?.count).toBe(1);
  });

  it('percentages sum to 100', () => {
    const printers = [
      makePrinter({ id: 'p1', connectionStatus: 'Online' }),
      makePrinter({ id: 'p2', connectionStatus: 'Offline' }),
      makePrinter({ id: 'p3', connectionStatus: 'Unknown' }),
    ];
    const result = getConnectivityDistribution(printers);
    const total = result.reduce((sum, item) => sum + item.percentage, 0);
    expect(total).toBeCloseTo(100, 0);
  });
});

// ---------------------------------------------------------------------------
// getManufacturerDistribution
// ---------------------------------------------------------------------------

describe('getManufacturerDistribution', () => {
  it('groups and sorts by manufacturer count', () => {
    const printers = [
      makePrinter({ id: 'p1', mfr: 'HP' }),
      makePrinter({ id: 'p2', mfr: 'Ricoh' }),
      makePrinter({ id: 'p3', mfr: 'HP' }),
      makePrinter({ id: 'p4', mfr: 'Canon' }),
    ];
    const result = getManufacturerDistribution(printers);
    expect(result[0].label).toBe('HP');
    expect(result[0].count).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// getAvailabilityTimeline
// ---------------------------------------------------------------------------

describe('getAvailabilityTimeline', () => {
  it('returns empty array for no printers', () => {
    expect(getAvailabilityTimeline('24h', [])).toHaveLength(0);
  });

  it('returns current snapshot when printers are provided', () => {
    const printers = [
      makePrinter({ id: 'p1', connectionStatus: 'Online' }),
      makePrinter({ id: 'p2', connectionStatus: 'Offline' }),
    ];
    const result = getAvailabilityTimeline('24h', printers);
    expect(result).toHaveLength(1);
    expect(result[0].onlineRate).toBe(50.0);
    expect(result[0].onlineCount).toBe(1);
    expect(result[0].offlineCount).toBe(1);
  });

  it('correctly calculates 27/30 online (90.0%) when 3 out of 30 printers lose connection', () => {
    const printers: Printer[] = [];
    // 27 Online printers
    for (let i = 1; i <= 27; i++) {
      printers.push(makePrinter({ id: `p-on-${i}`, name: `Printer Online ${i}`, connectionStatus: 'Online' }));
    }
    // 3 Offline printers
    for (let i = 1; i <= 3; i++) {
      printers.push(makePrinter({ id: `p-off-${i}`, name: `Printer Offline ${i}`, connectionStatus: 'Offline' }));
    }

    const stats = getFleetStats(printers, []);
    expect(stats.totalPrinters).toBe(30);
    expect(stats.onlineCount).toBe(27);
    expect(stats.offlineCount).toBe(3);
    expect(stats.onlinePct).toBe(90.0);
    expect(stats.offlinePct).toBe(10.0);

    const timeline = getAvailabilityTimeline('24h', printers);
    expect(timeline[0].onlineCount).toBe(27);
    expect(timeline[0].offlineCount).toBe(3);
    expect(timeline[0].onlineRate).toBe(90.0);
  });
});

describe('fleetService Edge Cases - supplies and stale telemetry', () => {
  it('does not falsely trigger low supplies for null / missing metric values', () => {
    const printers = [
      makePrinter({
        id: 'p1',
        supplies: { black: null, cyan: null, magenta: null, yellow: null, waste: null },
      }),
    ];
    const stats = getFleetStats(printers, []);
    expect(stats.lowSuppliesCount).toBe(0);
    expect(getPrintersNeedingAttention(printers)).toHaveLength(0);
  });

  it('correctly handles waste toner threshold boundary (84 is safe, 85 is warning)', () => {
    const safePrinter = [makePrinter({ id: 'p1', supplies: { black: 80, cyan: 80, magenta: 80, yellow: 80, waste: 84 } })];
    expect(getFleetStats(safePrinter, []).lowSuppliesCount).toBe(0);

    const fullPrinter = [makePrinter({ id: 'p2', supplies: { black: 80, cyan: 80, magenta: 80, yellow: 80, waste: 85 } })];
    expect(getFleetStats(fullPrinter, []).lowSuppliesCount).toBe(1);
    expect(getPrintersNeedingAttention(fullPrinter)).toHaveLength(1);
  });

  it('identifies stale telemetry printers as needing attention', () => {
    const printers = [
      makePrinter({ id: 'p1', connectionStatus: 'Online', isStale: true, health: 'Stale' }),
      makePrinter({ id: 'p2', connectionStatus: 'Online', isStale: false, health: 'Healthy' }),
    ];
    const stats = getFleetStats(printers, []);
    expect(stats.staleCount).toBe(1);

    const attention = getPrintersNeedingAttention(printers);
    expect(attention).toHaveLength(1);
    expect(attention[0].id).toBe('p1');
  });
});
