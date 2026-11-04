import {
  AnalyticsTimeframe,
  FloorTabId,
  DeviceFloorContributionItem,
  FloorSummaryItem,
} from '../../types/analyticsUI';
import { MOCK_PRINTER_DEFINITIONS } from './mockAnalyticsDefinitions';

export function getMockFloorContributionData(
  floorTab: FloorTabId,
  timeframe: AnalyticsTimeframe,
  pinnedIds: string[]
): {
  items: DeviceFloorContributionItem[];
  totalVolume: number;
} {
  let devices = [...MOCK_PRINTER_DEFINITIONS];

  if (floorTab !== 'all' && floorTab !== 'floor-compare') {
    devices = devices.filter((d) => d.floorId === floorTab);
  }

  const fleetTotal = MOCK_PRINTER_DEFINITIONS.reduce((acc, d) => {
    const vol =
      timeframe === 'hourly'
        ? d.baseHourly.reduce((a, b) => a + b, 0)
        : timeframe === '7days'
        ? d.base7Days.reduce((a, b) => a + b, 0)
        : d.base30Days.reduce((a, b) => a + b, 0);
    return acc + vol;
  }, 0);

  const floorTotal = devices.reduce((acc, d) => {
    const vol =
      timeframe === 'hourly'
        ? d.baseHourly.reduce((a, b) => a + b, 0)
        : timeframe === '7days'
        ? d.base7Days.reduce((a, b) => a + b, 0)
        : d.base30Days.reduce((a, b) => a + b, 0);
    return acc + vol;
  }, 0);

  const items: DeviceFloorContributionItem[] = devices.map((d) => {
    const vol =
      timeframe === 'hourly'
        ? d.baseHourly.reduce((a, b) => a + b, 0)
        : timeframe === '7days'
        ? d.base7Days.reduce((a, b) => a + b, 0)
        : d.base30Days.reduce((a, b) => a + b, 0);

    const monoVol = Math.round(vol * d.monoRatio);
    const colorVol = vol - monoVol;

    return {
      printerId: d.id,
      printerName: d.name,
      model: d.model,
      brand: d.brand,
      floor: d.floorName,
      department: d.department,
      totalVolume: vol,
      colorVolume: colorVol,
      monoVolume: monoVol,
      percentageInFloor: floorTotal > 0 ? (vol / floorTotal) * 100 : 0,
      percentageInFleet: fleetTotal > 0 ? (vol / fleetTotal) * 100 : 0,
      sharePercentage: floorTotal > 0 ? (vol / floorTotal) * 100 : 0,
      isPinned: pinnedIds.includes(d.id),
    };
  });

  return { items, totalVolume: floorTotal };
}

export function getMockFloorSummaries(timeframe: AnalyticsTimeframe): FloorSummaryItem[] {
  const floors = [
    { id: 'floor-1', name: 'Tầng 1', color: '#2563eb' },
    { id: 'floor-2', name: 'Tầng 2', color: '#06b6d4' },
    { id: 'floor-3', name: 'Tầng 3', color: '#8b5cf6' },
    { id: 'floor-4', name: 'Tầng 4', color: '#f59e0b' },
    { id: 'floor-5', name: 'Tầng 5', color: '#10b981' },
  ];

  let grandTotal = 0;
  const raw = floors.map((fl) => {
    const devs = MOCK_PRINTER_DEFINITIONS.filter((d) => d.floorId === fl.id);
    const vol = devs.reduce((acc, d) => {
      const v =
        timeframe === 'hourly'
          ? d.baseHourly.reduce((a, b) => a + b, 0)
          : timeframe === '7days'
          ? d.base7Days.reduce((a, b) => a + b, 0)
          : d.base30Days.reduce((a, b) => a + b, 0);
      return acc + v;
    }, 0);
    grandTotal += vol;
    return {
      floorId: fl.id,
      floorName: fl.name,
      deviceCount: devs.length,
      totalVolume: vol,
      color: fl.color,
    };
  });

  return raw.map((r) => ({
    ...r,
    sharePercentage: grandTotal > 0 ? (r.totalVolume / grandTotal) * 100 : 0,
  }));
}

