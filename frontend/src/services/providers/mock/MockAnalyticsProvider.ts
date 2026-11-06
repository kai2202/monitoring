/**
 * Frontend/src/services/providers/mock/MockAnalyticsProvider.ts
 *
 * Triển khai Mock Service chuẩn hóa cho Phân hệ Phân tích Sản lượng (Analytics):
 * - Dữ liệu tính toán động trực tiếp từ danh mục máy in thực tế (Single Source of Truth).
 * - Đồng bộ 100% qua MockDataProvider.
 * - Tuân thủ AGENTS.md Rule 5 (Data Integrity) & Rule 7.1 (< 300 LOC).
 */

import { IAnalyticsService } from '../../interfaces/IAnalyticsService';
import {
  AnalyticsFilterParams,
  AnalyticsSummaryData,
  ProductionTrendResponse,
  FleetProductionDistributionResponse,
  SuppliesAnalyticsResponse,
  SLACostAnalyticsResponse,
  ComparisonKPIsResponse,
  DeviceProductionItem,
  FloorVolumeSummary,
  ProductionTrendPoint,
} from '../../../types/api';
import { FloorTabId } from '../../../types/analyticsUI';
import { printerService } from '../../printerService';
import { locationService } from '../../locationService';
import { Printer } from '../../../types/printer';
import {
  MockDataProvider,
  mockSLAKpis,
  mockDepartmentCosts,
  mockIncidentHeatmapWeeks,
  mockIncidentMatrixCounts,
  generateMockCellIncidents,
} from '../../../mocks';

export class MockAnalyticsProvider implements IAnalyticsService {
  private async getScopedPrinters(branch?: string, floorId?: string): Promise<Printer[]> {
    const all = await printerService.getPrinters();
    return all.filter((p) => {
      if (branch && branch !== 'all') {
        const isHq = branch.includes('Trụ sở') || branch.includes('HQ');
        const printerBranch = p.branch || 'Trụ sở chính (HQ)';
        const matchBranch =
          (isHq && (!p.branch || p.branch.includes('Trụ sở') || p.branch.includes('HQ'))) ||
          printerBranch.toLowerCase().includes(branch.toLowerCase()) ||
          (p.location && p.location.toLowerCase().includes(branch.toLowerCase()));
        if (!matchBranch) return false;
      }
      if (floorId && floorId !== 'all') {
        const floorNum = floorId.replace('floor-', '');
        const matchFloor =
          p.floor === `Tầng ${floorNum}` ||
          (p.location && (p.location.includes(`T${floorNum}`) || p.location.includes(`Tầng ${floorNum}`)));
        if (!matchFloor) return false;
      }
      return true;
    });
  }

  private calculateDeviceVolume(p: Printer, timeframe: string): { total: number; mono: number; color: number } {
    const baseMonthly = p.thirtyDayVolume ?? 12000;
    let factor = 1;
    if (timeframe === 'hourly') factor = 1 / (30 * 8);
    else if (timeframe === '7days') factor = 7 / 30;

    const total = Math.max(10, Math.round(baseMonthly * factor));
    const isMono =
      p.colorCapability === 'Monochrome' ||
      (!p.colorCapability && (p.deviceType?.toLowerCase()?.includes('mono') ?? false));
    const monoRatio = isMono ? 1 : 0.68;
    const mono = Math.round(total * monoRatio);
    const color = total - mono;
    return { total, mono, color };
  }

  async getAnalyticsSummary(params: AnalyticsFilterParams): Promise<AnalyticsSummaryData> {
    const printers = await this.getScopedPrinters(params.branch, params.floorId);
    let totalVol = 0;
    let monoVol = 0;
    let colorVol = 0;

    printers.forEach((p) => {
      const vol = this.calculateDeviceVolume(p, params.timeframe);
      totalVol += vol.total;
      monoVol += vol.mono;
      colorVol += vol.color;
    });

    const activeCount = printers.filter((p) => p.connectionStatus === 'Online').length;
    const daysInPeriod = params.timeframe === 'hourly' ? 1 : params.timeframe === '7days' ? 7 : 30;

    return {
      totalFleetVolume: printers.length > 0 ? totalVol : null,
      monoVolume: printers.length > 0 ? monoVol : null,
      colorVolume: printers.length > 0 ? colorVol : null,
      avgDailyVolume: printers.length > 0 ? Math.round(totalVol / daysInPeriod) : null,
      activePrintersCount: activeCount,
      totalPrintersCount: printers.length,
      growthRatePercent: printers.length > 0 ? 5.8 : null,
      lastUpdated: new Date().toLocaleTimeString('vi-VN'),
    };
  }

  async getProductionTrend(params: AnalyticsFilterParams): Promise<ProductionTrendResponse> {
    const printers = await this.getScopedPrinters(params.branch, params.floorId);
    const dataPoints: ProductionTrendPoint[] = [];
    const count = params.timeframe === 'hourly' ? 24 : params.timeframe === '7days' ? 7 : 30;

    const totalPeriodVolume = printers.reduce(
      (acc, p) => acc + this.calculateDeviceVolume(p, params.timeframe).total,
      0
    );
    const basePointVol = count > 0 ? Math.round(totalPeriodVolume / count) : 0;

    let peakLabel = '';
    let peakVolume = 0;

    for (let i = 0; i < count; i++) {
      let label = '';
      if (params.timeframe === 'hourly') {
        label = `${String(i).padStart(2, '0')}:00`;
      } else if (params.timeframe === '7days') {
        const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
        label = days[i % 7];
      } else {
        label = `${i + 1}/11`;
      }

      const wave =
        params.timeframe === 'hourly' ? (i >= 8 && i <= 17 ? 1.4 : 0.2) : 1 + 0.15 * Math.sin(i * 0.8);

      const curVal = Math.round(basePointVol * wave);
      const prevVal = Math.round(curVal * 0.94);

      if (curVal > peakVolume) {
        peakVolume = curVal;
        peakLabel = label;
      }

      dataPoints.push({
        timestamp: label,
        label,
        currentVolume: curVal,
        previousVolume: prevVal,
      });
    }

    const curTotal = dataPoints.reduce((s, p) => s + p.currentVolume, 0);
    const prevTotal = dataPoints.reduce((s, p) => s + p.previousVolume, 0);
    const growth = prevTotal > 0 ? Number((((curTotal - prevTotal) / prevTotal) * 100).toFixed(1)) : 0;

    return {
      timeframe: params.timeframe,
      dataPoints,
      currentTotalVolume: curTotal,
      previousTotalVolume: prevTotal,
      growthPercent: growth,
      peakLabel: peakLabel || '14:00',
      peakVolume,
    };
  }

  async getFleetDistribution(params: AnalyticsFilterParams): Promise<FleetProductionDistributionResponse> {
    const printers = await this.getScopedPrinters(params.branch, params.floorId);
    let totalFleetVolume = 0;

    const devices: DeviceProductionItem[] = printers.map((p) => {
      const vol = this.calculateDeviceVolume(p, params.timeframe);
      totalFleetVolume += vol.total;

      const floorMatch = (p.floor || p.location || '').match(/T(\d+)|Tầng (\d+)/);
      const floorNum = floorMatch ? floorMatch[1] || floorMatch[2] : '1';
      const floorId = `floor-${floorNum}` as FloorTabId;
      const floorName = `Tầng ${floorNum}`;
      const isColor =
        p.colorCapability === 'Color' || (!p.colorCapability && p.deviceType.toLowerCase().includes('color'));
      const healthStatus: 'Healthy' | 'Warning' | 'Critical' =
        p.health === 'Critical' ? 'Critical' : p.health === 'Warning' ? 'Warning' : 'Healthy';

      return {
        id: p.id,
        name: p.name,
        model: p.model,
        mfr: p.mfr || 'Ricoh',
        ip: p.ip,
        serial: p.serial || 'SN-UNKNOWN',
        branch: p.branch || 'Trụ sở chính (HQ)',
        floorId,
        floorName,
        department: p.department || 'Văn phòng chung',
        status: p.connectionStatus === 'Online' ? 'Online' : 'Offline',
        health: healthStatus,
        totalVol: vol.total,
        monoVol: vol.mono,
        colorVol: vol.color,
        monoPercent: vol.total > 0 ? Math.round((vol.mono / vol.total) * 100) : 100,
        colorPercent: vol.total > 0 ? Math.round((vol.color / vol.total) * 100) : 0,
        ppmNominal: 35,
        ppmActual: 31,
        isColorCapable: isColor,
      };
    });

    const floorMap = new Map<string, { count: number; volume: number }>();
    devices.forEach((d) => {
      const cur = floorMap.get(d.floorName) || { count: 0, volume: 0 };
      floorMap.set(d.floorName, {
        count: cur.count + 1,
        volume: cur.volume + d.totalVol,
      });
    });

    const floorColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#a855f7', '#ec4899'];
    const floors: FloorVolumeSummary[] = Array.from(floorMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, data], idx) => ({
        floorId: `floor-${name.replace('Tầng ', '')}`,
        floorName: name,
        deviceCount: data.count,
        totalVolume: data.volume,
        sharePercentage: totalFleetVolume > 0 ? Math.round((data.volume / totalFleetVolume) * 100) : 0,
        color: floorColors[idx % floorColors.length],
      }));

    return {
      devices,
      floors,
      totalFleetVolume,
    };
  }

  async getSuppliesForecasting(branch?: string): Promise<SuppliesAnalyticsResponse> {
    const printers = await this.getScopedPrinters(branch);
    return MockDataProvider.getSuppliesForecasting(printers);
  }

  async getSLACostAnalytics(branch?: string): Promise<SLACostAnalyticsResponse> {
    const floorDefs = locationService.getFloorsByBranch(branch || 'Trụ sở chính (HQ)');
    const activeFloors = floorDefs.map((f, i) => ({
      id: `f${i + 1}`,
      name: f,
      shortName: f.replace('Tầng ', 'T'),
      room: `Khu vực ${f}`,
    }));

    const matrix = activeFloors.map((_, fIdx) => mockIncidentMatrixCounts[fIdx] || [0, 0, 1, 0, 0, 0, 0]);

    const details: Record<string, any[]> = {};
    activeFloors.forEach((fl, fIdx) => {
      mockIncidentHeatmapWeeks.forEach((_, wIdx) => {
        const count = matrix[fIdx]?.[wIdx] ?? 0;
        if (count > 0) {
          const key = `${fl.id}_${wIdx}`;
          details[key] = generateMockCellIncidents(key, `${fl.name} (${fl.room})`, count);
        }
      });
    });

    return {
      kpis: mockSLAKpis,
      departmentCosts: mockDepartmentCosts,
      incidentHeatmap: {
        floors: activeFloors,
        weeks: mockIncidentHeatmapWeeks,
        matrix,
        details,
      },
    };
  }

  async getComparisonKPIs(printerIds: string[]): Promise<ComparisonKPIsResponse> {
    const all = await printerService.getPrinters();
    const selected = all.filter((p) => printerIds.includes(p.id));
    return MockDataProvider.getComparisonKPIs(selected);
  }
}
