import {
  AnalyticsTimeframe,
  FloorTabId,
  TimeSeriesDataPoint,
  LineChartSeriesMeta,
} from '../../types/analyticsUI';
import {
  MOCK_PRINTER_DEFINITIONS,
  DEVICE_PALETTE,
} from './mockAnalyticsDefinitions';

export function getMockTimeSeriesData(
  timeframe: AnalyticsTimeframe,
  floorTab: FloorTabId,
  selectedPrinterIds: string[]
): {
  dataPoints: TimeSeriesDataPoint[];
  seriesMeta: LineChartSeriesMeta[];
} {
  let targetDevices = [...MOCK_PRINTER_DEFINITIONS];

  if (floorTab === 'floor-compare') {
    return getFloorComparisonTimeSeries(timeframe);
  }

  if (floorTab !== 'all') {
    targetDevices = targetDevices.filter((d) => d.floorId === floorTab);
  }

  targetDevices.sort((a, b) => {
    const sumA = a.base30Days.reduce((acc, v) => acc + v, 0);
    const sumB = b.base30Days.reduce((acc, v) => acc + v, 0);
    return sumB - sumA;
  });

  const top10Ids = targetDevices.slice(0, 10).map((d) => d.id);
  const activeIdsSet = new Set([...top10Ids, ...selectedPrinterIds]);
  const activeDevices = targetDevices.filter((d) => activeIdsSet.has(d.id));

  const seriesMeta: LineChartSeriesMeta[] = activeDevices.map((d, idx) => {
    const totalVolume =
      timeframe === 'hourly'
        ? d.baseHourly.reduce((acc, v) => acc + v, 0)
        : timeframe === '7days'
        ? d.base7Days.reduce((acc, v) => acc + v, 0)
        : d.base30Days.reduce((acc, v) => acc + v, 0);

    return {
      printerId: d.id,
      printerName: d.name,
      model: d.model,
      floor: d.floorName,
      color: DEVICE_PALETTE[idx % DEVICE_PALETTE.length],
      visible: true,
      totalVolume,
    };
  });

  let labels: string[] = [];
  let length = 0;

  if (timeframe === 'hourly') {
    length = 24;
    labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  } else if (timeframe === '7days') {
    length = 7;
    labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'CN'];
  } else {
    length = 30;
    labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
  }

  const dataPoints: TimeSeriesDataPoint[] = [];

  for (let i = 0; i < length; i++) {
    const timestamp = labels[i];
    const values: Record<string, number | null> = {};

    activeDevices.forEach((d) => {
      let val: number | null = 0;
      if (timeframe === 'hourly') {
        val = d.baseHourly[i] ?? null;
      } else if (timeframe === '7days') {
        val = d.base7Days[i] ?? null;
      } else {
        val = d.base30Days[i] ?? null;
      }
      values[d.id] = val;
    });

    dataPoints.push({
      timestamp,
      label: timestamp,
      values,
    });
  }

  return { dataPoints, seriesMeta };
}

function getFloorComparisonTimeSeries(timeframe: AnalyticsTimeframe): {
  dataPoints: TimeSeriesDataPoint[];
  seriesMeta: LineChartSeriesMeta[];
} {
  const floors = [
    { id: 'floor-1', name: 'Tầng 1 (Lễ tân & HC-NS)', color: '#2563eb' },
    { id: 'floor-2', name: 'Tầng 2 (Kỹ thuật & Dự án)', color: '#06b6d4' },
    { id: 'floor-3', name: 'Tầng 3 (Kinh doanh & Marketing)', color: '#8b5cf6' },
    { id: 'floor-4', name: 'Tầng 4 (Tài chính & Kế toán)', color: '#f59e0b' },
    { id: 'floor-5', name: 'Tầng 5 (Ban Giám đốc)', color: '#10b981' },
  ];

  let length = timeframe === 'hourly' ? 24 : timeframe === '7days' ? 7 : 30;
  let labels: string[] = [];

  if (timeframe === 'hourly') {
    labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  } else if (timeframe === '7days') {
    labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'CN'];
  } else {
    labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
  }

  const dataPoints: TimeSeriesDataPoint[] = [];

  for (let i = 0; i < length; i++) {
    const values: Record<string, number | null> = {};

    floors.forEach((fl) => {
      const devices = MOCK_PRINTER_DEFINITIONS.filter((d) => d.floorId === fl.id);
      let sum = 0;
      devices.forEach((d) => {
        const val =
          timeframe === 'hourly'
            ? d.baseHourly[i] || 0
            : timeframe === '7days'
            ? d.base7Days[i] || 0
            : d.base30Days[i] || 0;
        sum += val;
      });
      values[fl.id] = sum;
    });

    dataPoints.push({
      timestamp: labels[i],
      label: labels[i],
      values,
    });
  }

  const seriesMeta: LineChartSeriesMeta[] = floors.map((fl) => {
    const totalVolume = dataPoints.reduce((acc, pt) => acc + (pt.values[fl.id] || 0), 0);
    return {
      printerId: fl.id,
      printerName: fl.name,
      model: 'Tổng hợp Tầng',
      floor: fl.name,
      color: fl.color,
      visible: true,
      totalVolume,
    };
  });

  return { dataPoints, seriesMeta };
}
