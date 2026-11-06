/**
 * Frontend/src/mocks/MockDataProvider.ts
 *
 * Cổng Điều Phối Dữ Liệu Giả Lập Duy Nhất (Unified Mock Data Adapter):
 * - Đóng gói toàn bộ logic truy xuất mock data của các domains (Printers, Analytics, SLA, Tasks...).
 * - Tầng Service chỉ tương tác qua MockDataProvider này khi DATA_SOURCE === 'mock'.
 * - Khi xoá thư mục mocks/ hoặc đặt VITE_USE_MOCK=false, tầng UI hoàn toàn không bị ảnh hưởng.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { mockPrinters } from './printers';
import { mockIncidents } from './incidents';
import { mockTasks } from './tasks';
import { mockAvailabilityTimeline, mockTopPrintersVolume } from './telemetry';
import { generateMockSuppliesForecasting, mockSuppliesSummary } from './supplies';
import {
  mockSLAKpis,
  mockDepartmentCosts,
  mockIncidentHeatmapWeeks,
  mockIncidentMatrixCounts,
  generateMockCellIncidents,
  generateMockComparisonKPIs,
} from './sla';
import { mockSystemSettings, mockErrorDictionary, mockUsers } from './settings';
import { MOCK_BRANCHES, MOCK_DEPARTMENTS, MockBranchLocation } from './locations';
import { Printer } from '../types/printer';
import { Task } from '../types/task';
import {
  ProductionTrendResponse,
  FleetProductionDistributionResponse,
  SuppliesAnalyticsResponse,
  SLACostAnalyticsResponse,
  AnalyticsSummaryData,
} from '../types/api';

export class MockDataProvider {
  // 1. Printers & Scale
  static getPrinters(): Printer[] {
    return [...mockPrinters];
  }

  // 2. Incidents & Hardware Errors
  static getIncidents() {
    return [...mockIncidents];
  }

  // 3. Maintenance Tasks & Activity Logs
  static getTasks(): Task[] {
    return [...mockTasks];
  }

  // 4. Telemetry & Availability
  static getAvailabilityTimeline() {
    return [...mockAvailabilityTimeline];
  }

  static getVolumeRankings() {
    return [...mockTopPrintersVolume];
  }

  // 5. Supplies & Forecasting
  static getSuppliesForecasting(printers: Printer[]): SuppliesAnalyticsResponse {
    return generateMockSuppliesForecasting(printers);
  }

  static getSuppliesSummary() {
    return { ...mockSuppliesSummary };
  }

  // 6. SLA Performance & Cost Allocation
  static getSLACostAnalytics(scopedPrinters: Printer[], branchName = 'Trụ sở chính (HQ)'): SLACostAnalyticsResponse {
    const floors = [
      { id: 'f1', name: 'Tầng 1', shortName: 'T1', room: 'Kế toán & Tài chính' },
      { id: 'f2', name: 'Tầng 2', shortName: 'T2', room: 'Marketing & Truyền thông' },
      { id: 'f3', name: 'Tầng 3', shortName: 'T3', room: 'Kỹ thuật & R&D' },
      { id: 'f4', name: 'Tầng 4', shortName: 'T4', room: 'Ban Giám Đốc' },
      { id: 'f5', name: 'Tầng 5', shortName: 'T5', room: 'Nhân sự & Pháp chế' },
      { id: 'f6', name: 'Tầng 6', shortName: 'T6', room: 'Hành chính tổng hợp' },
      { id: 'f7', name: 'Tầng 7', shortName: 'T7', room: 'Hội trường & NOC' },
    ];

    const weeks = [...mockIncidentHeatmapWeeks];
    const matrix = [...mockIncidentMatrixCounts];
    const details: Record<string, any[]> = {};

    floors.forEach((fl, fIdx) => {
      weeks.forEach((_, wIdx) => {
        const count = matrix[fIdx]?.[wIdx] ?? 0;
        const key = `${fl.id}_${wIdx}`;
        details[key] = generateMockCellIncidents(key, `${fl.name} (${fl.room})`, count);
      });
    });

    return {
      kpis: { ...mockSLAKpis },
      departmentCosts: [...mockDepartmentCosts],
      incidentHeatmap: {
        floors,
        weeks,
        matrix,
        details,
      },
    };
  }

  // 7. Comparison KPIs
  static getComparisonKPIs(selectedPrinters: Printer[]) {
    return generateMockComparisonKPIs(selectedPrinters);
  }

  // 8. Settings & RBAC Users
  static getSystemSettings() {
    return { ...mockSystemSettings };
  }

  static getErrorDictionary() {
    return [...mockErrorDictionary];
  }

  static getUsers() {
    return [...mockUsers];
  }

  // 9. Locations & Departments
  static getBranches(): MockBranchLocation[] {
    return [...MOCK_BRANCHES];
  }

  static getDepartments(): string[] {
    return [...MOCK_DEPARTMENTS];
  }
}

