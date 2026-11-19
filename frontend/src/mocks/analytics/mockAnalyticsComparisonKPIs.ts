import { ComparisonDeviceKPIs } from '../../types/analyticsUI';
import {
  MOCK_PRINTER_DEFINITIONS,
  DEVICE_PALETTE,
  findAnyFleetDevice,
} from './mockAnalyticsDefinitions';

export function getMockComparisonKPIs(printerIds: string[]): ComparisonDeviceKPIs[] {
  if (!printerIds || printerIds.length === 0) {
    return [];
  }

  return printerIds.map((id, index) => {
    const d =
      findAnyFleetDevice(id) ||
      MOCK_PRINTER_DEFINITIONS.find((p) => p.id === id) ||
      MOCK_PRINTER_DEFINITIONS[index % MOCK_PRINTER_DEFINITIONS.length];

    const totalPages = d.base30Days.reduce((a, b) => a + b, 0);
    const monoPages = Math.round(totalPages * d.monoRatio);
    const colorPages = totalPages - monoPages;

    return {
      printerId: d.id,
      printerName: d.name,
      model: d.model,
      brand: d.brand,
      floor: d.floorName,
      department: d.department,
      color: DEVICE_PALETTE[index % DEVICE_PALETTE.length],
      totalPages,
      ppmActual: d.ppmActual,
      ppmNominal: d.ppmNominal,
      uptimePercent: d.uptimePercent,
      mtbfHours: d.mtbfHours,
      failureCount: d.failureCount,
      downtimeHours: d.downtimeHours,
      production: {
        monoPages,
        colorPages,
        colorRatioPercent: Math.round((1 - d.monoRatio) * 100),
        avgDailyPages: Math.round(totalPages / 30),
      },
      speed: {
        firstPageOutSeconds: d.brand === 'Canon' ? 4.8 : d.brand === 'Ricoh' ? 5.2 : 6.1,
        warmupTimeSeconds: d.brand === 'Ricoh' ? 20 : d.brand === 'Canon' ? 15 : 25,
      },
      reliability: {
        mttrHours: typeof d.downtimeHours === 'number' && !isNaN(d.downtimeHours)
          ? +(d.downtimeHours / (d.failureCount || 1)).toFixed(1)
          : 0,
        paperJamCount: Math.max(1, (d.failureCount || 0) * 2),
        hardwareFaultCount: d.failureCount || 0,
        lastIncidentTime: d.failureCount && d.failureCount > 0 ? 'Hôm qua, 14:30' : null,
      },
      availability: {
        maintenanceCount: 2,
        scheduledDowntimeHours: 1.5,
        unscheduledDowntimeHours: typeof d.downtimeHours === 'number' && !isNaN(d.downtimeHours)
          ? +Math.max(0, d.downtimeHours - 1.5).toFixed(1)
          : 0,
      },
      consumables: {
        tonerBlackPercent: d.tonerK,
        tonerCyanPercent: d.tonerC > 0 ? d.tonerC : null,
        tonerMagentaPercent: d.tonerM > 0 ? d.tonerM : null,
        tonerYellowPercent: d.tonerY > 0 ? d.tonerY : null,
        drumLifePercent: d.drumLife,
        wasteTonerBoxStatus: d.wasteToner,
      },
    };
  });
}

