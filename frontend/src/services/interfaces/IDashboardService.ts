/**
 * Frontend/src/services/interfaces/IDashboardService.ts
 *
 * Hợp đồng Service Layer cho Dữ liệu Tổng quan Dashboard & KPI.
 */

import { Printer, Incident } from '../../types/printer';
import { MetricValue } from '../../types/dashboardTelemetry';

export interface DashboardSummary {
  kpis: {
    totalPrinters: number;
    onlineCount: MetricValue;
    offlineCount: MetricValue;
    unknownCount: MetricValue;
    onlineRate: MetricValue;
    activeAlertsCount: MetricValue;
    criticalAlertsCount: MetricValue;
    warningAlertsCount: MetricValue;
    lowSuppliesCount: MetricValue;
  };
  devicesNeedingAttention: Printer[];
  recentIncidents: Incident[];
  lastSyncTime: string;
  isStale: boolean;
}

export interface IDashboardService {
  getDashboardSummary(): Promise<DashboardSummary>;
}

