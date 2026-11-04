import {
  AnalyticsTimeframe,
  FloorTabId,
  DeviceFloorContributionItem,
  ProductionDistributionBucket,
  FleetScaleMode,
  DistributionThresholdDef,
} from '../../types/analyticsUI';
import { getMockFloorContributionData } from './mockAnalyticsTimeSeries';

const FLEET_BRANDS_MODELS = [
  { brand: 'Canon', model: 'imageRUNNER ADV C5560i III', ppm: 60, type: 'Color MFP' },
  { brand: 'HP', model: 'LaserJet Managed MFP E82650', ppm: 50, type: 'Mono MFP' },
  { brand: 'Ricoh', model: 'IM C4500 Workgroup Multifunction', ppm: 45, type: 'Color MFP' },
  { brand: 'Ricoh', model: 'Pro C7200s Graphic Production', ppm: 85, type: 'Color MFP' },
  { brand: 'Canon', model: 'iR2630i Office Mono Enterprise', ppm: 30, type: 'Mono Laser' },
  { brand: 'Xerox', model: 'AltaLink C8170 Color Copier', ppm: 70, type: 'Color MFP' },
  { brand: 'Brother', model: 'HL-L6400DW High-speed Mono', ppm: 52, type: 'Mono Laser' },
  { brand: 'Konica Minolta', model: 'bizhub C650i Commercial', ppm: 65, type: 'Color MFP' },
];

const FLEET_DEPARTMENTS = [
  'Phòng Kinh doanh & Sales',
  'Phòng Kế toán & Tài chính',
  'Phòng Hành chính - Nhân sự',
  'Khối Kỹ thuật & R&D',
  'Trung tâm Thiết kế Dự án',
  'Phòng Vận hành & Hệ thống IT',
  'Ban Quản trị & Điều hành',
  'Bộ phận Chăm sóc Khách hàng',
  'Văn phòng Giao dịch Trung tâm',
  'Phòng Đấu thầu & Pháp chế',
];

export function getFleet1000Devices(
  timeframe: AnalyticsTimeframe,
  pinnedPrinterIds: string[]
): DeviceFloorContributionItem[] {
  const devices: DeviceFloorContributionItem[] = [];

  for (let i = 1; i <= 1000; i++) {
    const floorNum = Math.floor((i - 1) / 200) + 1;
    const floorName = `Tầng ${floorNum}`;

    const pseudoRand = Math.abs(Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;
    const pseudoRand2 = Math.abs(Math.sin(i * 269.5 + 183.3) * 23421.631) % 1;
    const pseudoRand3 = Math.abs(Math.sin(i * 419.2 + 97.4) * 31415.926) % 1;

    const brandModel = FLEET_BRANDS_MODELS[i % FLEET_BRANDS_MODELS.length];
    const dept = FLEET_DEPARTMENTS[i % FLEET_DEPARTMENTS.length];
    const printerId = `PRN-${String(i).padStart(4, '0')}`;
    const printerName = `${brandModel.brand} ${brandModel.model.split(' ')[0]} #${String(i).padStart(4, '0')}`;

    let base30Vol: number;
    if (pseudoRand < 0.05) {
      base30Vol = Math.round(100 + pseudoRand2 * 400);
    } else if (pseudoRand < 0.15) {
      base30Vol = Math.round(501 + pseudoRand2 * 499);
    } else if (pseudoRand < 0.35) {
      base30Vol = Math.round(1001 + pseudoRand2 * 999);
    } else if (pseudoRand < 0.60) {
      base30Vol = Math.round(2001 + pseudoRand2 * 999);
    } else if (pseudoRand < 0.78) {
      base30Vol = Math.round(3001 + pseudoRand2 * 999);
    } else if (pseudoRand < 0.88) {
      base30Vol = Math.round(4001 + pseudoRand2 * 999);
    } else if (pseudoRand < 0.94) {
      base30Vol = Math.round(5001 + pseudoRand2 * 2499);
    } else if (pseudoRand < 0.97) {
      base30Vol = Math.round(7501 + pseudoRand2 * 2499);
    } else if (pseudoRand < 0.99) {
      base30Vol = Math.round(10001 + pseudoRand2 * 4999);
    } else {
      base30Vol = Math.round(15001 + pseudoRand2 * 8999);
    }

    let currentVol = base30Vol;
    if (timeframe === '7days') {
      currentVol = Math.round(base30Vol * (0.22 + pseudoRand3 * 0.05));
    } else if (timeframe === 'hourly') {
      currentVol = Math.round(base30Vol * (0.012 + pseudoRand3 * 0.008));
    }

    const isColor = brandModel.type === 'Color MFP';
    const monoRatio = isColor ? 0.4 + pseudoRand3 * 0.4 : 1.0;
    const monoVolume = Math.round(currentVol * monoRatio);
    const colorVolume = currentVol - monoVolume;

    const isOnline = pseudoRand > 0.06;
    const healthStatus: 'Healthy' | 'Warning' | 'Critical' = !isOnline
      ? 'Critical'
      : pseudoRand < 0.88
      ? 'Healthy'
      : 'Warning';

    devices.push({
      printerId,
      printerName,
      model: brandModel.model,
      brand: brandModel.brand,
      floor: floorName,
      department: dept,
      totalVolume: currentVol,
      colorVolume,
      monoVolume,
      percentageInFloor: 0,
      percentageInFleet: 0,
      isPinned: pinnedPrinterIds.includes(printerId),
      ip: `192.168.${floorNum * 10}.${(i % 240) + 10}`,
      serial: `${brandModel.brand.slice(0, 2).toUpperCase()}${20260000 + i}`,
      status: isOnline ? 'Online' : 'Offline',
      health: healthStatus,
      tonerK: Math.round(20 + pseudoRand * 80),
      tonerC: isColor ? Math.round(15 + pseudoRand2 * 85) : undefined,
      tonerM: isColor ? Math.round(15 + pseudoRand3 * 85) : undefined,
      tonerY: isColor ? Math.round(15 + pseudoRand * 85) : undefined,
      drumLife: Math.round(40 + pseudoRand2 * 60),
      ppm: brandModel.ppm,
    });
  }

  return devices;
}

export function getDefaultThresholds(timeframe: AnalyticsTimeframe): DistributionThresholdDef[] {
  if (timeframe === '30days') {
    return [
      { id: 'b1', rangeLabel: '0 – 500', min: 0, max: 500 },
      { id: 'b2', rangeLabel: '501 – 1.000', min: 501, max: 1000 },
      { id: 'b3', rangeLabel: '1.001 – 2.000', min: 1001, max: 2000 },
      { id: 'b4', rangeLabel: '2.001 – 3.000', min: 2001, max: 3000 },
      { id: 'b5', rangeLabel: '3.001 – 4.000', min: 3001, max: 4000 },
      { id: 'b6', rangeLabel: '4.001 – 5.000', min: 4001, max: 5000 },
      { id: 'b7', rangeLabel: '5.001 – 7.500', min: 5001, max: 7500 },
      { id: 'b8', rangeLabel: '7.501 – 10.000', min: 7501, max: 10000 },
      { id: 'b9', rangeLabel: '10.001 – 15.000', min: 1001, max: 15000 },
      { id: 'b10', rangeLabel: '> 15.000', min: 15001, max: Infinity },
    ];
  } else if (timeframe === '7days') {
    return [
      { id: 'b1', rangeLabel: '0 – 120', min: 0, max: 120 },
      { id: 'b2', rangeLabel: '121 – 250', min: 121, max: 250 },
      { id: 'b3', rangeLabel: '251 – 500', min: 251, max: 500 },
      { id: 'b4', rangeLabel: '501 – 750', min: 501, max: 750 },
      { id: 'b5', rangeLabel: '751 – 1.000', min: 751, max: 1000 },
      { id: 'b6', rangeLabel: '1.001 – 1.250', min: 1001, max: 1250 },
      { id: 'b7', rangeLabel: '1.251 – 1.800', min: 1251, max: 1800 },
      { id: 'b8', rangeLabel: '1.801 – 2.500', min: 1801, max: 2500 },
      { id: 'b9', rangeLabel: '2.501 – 3.750', min: 2501, max: 3750 },
      { id: 'b10', rangeLabel: '> 3.750', min: 3751, max: Infinity },
    ];
  } else {
    return [
      { id: 'b1', rangeLabel: '0 – 5', min: 0, max: 5 },
      { id: 'b2', rangeLabel: '6 – 15', min: 6, max: 15 },
      { id: 'b3', rangeLabel: '16 – 30', min: 16, max: 30 },
      { id: 'b4', rangeLabel: '31 – 50', min: 31, max: 50 },
      { id: 'b5', rangeLabel: '51 – 80', min: 51, max: 80 },
      { id: 'b6', rangeLabel: '81 – 120', min: 81, max: 120 },
      { id: 'b7', rangeLabel: '121 – 160', min: 121, max: 160 },
      { id: 'b8', rangeLabel: '161 – 220', min: 161, max: 220 },
      { id: 'b9', rangeLabel: '221 – 300', min: 221, max: 300 },
      { id: 'b10', rangeLabel: '> 300', min: 301, max: Infinity },
    ];
  }
}

export function getProductionDistributionBuckets(
  timeframe: AnalyticsTimeframe,
  floorTab: FloorTabId,
  fleetScale: FleetScaleMode,
  pinnedPrinterIds: string[],
  customThresholds?: DistributionThresholdDef[]
): {
  buckets: ProductionDistributionBucket[];
  totalDevices: number;
  totalVolume: number;
  avgVolumePerDevice: number;
  dominantBucket: ProductionDistributionBucket | null;
} {
  let allDevices: DeviceFloorContributionItem[] = [];

  if (fleetScale === '1000') {
    allDevices = getFleet1000Devices(timeframe, pinnedPrinterIds);
  } else {
    const baseData = getMockFloorContributionData('all', timeframe, pinnedPrinterIds);
    allDevices = baseData.items.map((it, idx) => ({
      ...it,
      ip: `192.168.1.${(idx % 200) + 10}`,
      serial: `SN-2026-${String(idx + 1).padStart(4, '0')}`,
      status: 'Online',
      health: 'Healthy',
      tonerK: 75,
      drumLife: 80,
      ppm: 55,
    }));
  }

  let filteredDevices = allDevices;
  if (floorTab !== 'all' && floorTab !== 'floor-compare') {
    const floorIndex = floorTab.replace('floor-', '');
    const floorLabel = `Tầng ${floorIndex}`;
    filteredDevices = allDevices.filter((d) => d.floor.includes(floorLabel));
  }

  const totalDevices = filteredDevices.length;
  const totalVolume = filteredDevices.reduce((sum, d) => sum + d.totalVolume, 0);
  const avgVolumePerDevice = totalDevices > 0 ? Math.round(totalVolume / totalDevices) : 0;

  const thresholds: DistributionThresholdDef[] =
    customThresholds && customThresholds.length > 0
      ? customThresholds
      : getDefaultThresholds(timeframe);

  const buckets: ProductionDistributionBucket[] = thresholds.map((t) => {
    const bucketDevices = filteredDevices
      .filter((d) => d.totalVolume >= t.min && d.totalVolume <= t.max)
      .sort((a, b) => b.totalVolume - a.totalVolume);

    const bucketDeviceCount = bucketDevices.length;
    const bucketTotalVolume = bucketDevices.reduce((sum, d) => sum + d.totalVolume, 0);
    const bucketAvgVolume = bucketDeviceCount > 0 ? Math.round(bucketTotalVolume / bucketDeviceCount) : 0;
    const percentageShare = totalDevices > 0 ? Number(((bucketDeviceCount / totalDevices) * 100).toFixed(1)) : 0;

    return {
      id: t.id,
      rangeLabel: t.rangeLabel,
      minVolume: t.min,
      maxVolume: t.max,
      deviceCount: bucketDeviceCount,
      percentageShare,
      totalVolume: bucketTotalVolume,
      avgVolume: bucketAvgVolume,
      devices: bucketDevices,
    };
  });

  let dominantBucket: ProductionDistributionBucket | null = null;
  if (buckets.length > 0) {
    dominantBucket = [...buckets].sort((a, b) => b.deviceCount - a.deviceCount)[0] || null;
  }

  return {
    buckets,
    totalDevices,
    totalVolume,
    avgVolumePerDevice,
    dominantBucket,
  };
}

