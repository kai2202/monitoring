/**
 * Frontend/src/services/interfaces/IDashboardService.ts
 *
 * Hợp đồng Service Layer cho Dữ liệu Tổng quan Dashboard & KPI.
 */

import { Printer, Incident } from '../../types/printer';

export interface DashboardSummary {
  kpis: {
    totalPrinters: number;
    onlineCount: number;
    offlineCount: number;
    unknownCount: number;
    onlineRate: number;
    activeAlertsCount: number;
    criticalAlertsCount: number;
    warningAlertsCount: number;
    lowSuppliesCount: number;
  };
  devicesNeedingAttention: Printer[];
  recentIncidents: Incident[];
  lastSyncTime: string;
  isStale: boolean;
}

export interface IDashboardService {
  getDashboardSummary(): Promise<DashboardSummary>;
}

