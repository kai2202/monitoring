/**
 * Frontend/src/services/providers/mock/MockDashboardProvider.ts
 *
 * Triển khai IDashboardService tính toán và tổng hợp dữ liệu KPI Dashboard từ bộ nhớ.
 */

import { IDashboardService, DashboardSummary } from '../../interfaces/IDashboardService';
import { mockPrinters } from '../../../mocks/mockPrinters';
import { mockIncidents } from '../../../mocks/mockIncidents';
import { Printer, Incident } from '../../../types/printer';

export class MockDashboardProvider implements IDashboardService {
  private printers: Printer[] = [...mockPrinters];
  private incidents: Incident[] = [...mockIncidents];

  async getDashboardSummary(): Promise<DashboardSummary> {
    await new Promise(r => setTimeout(r, 50));

    const totalPrinters = this.printers.length;
    const onlineCount = this.printers.filter(p => p.connectionStatus === 'Online').length;
    const offlineCount = this.printers.filter(p => p.connectionStatus === 'Offline').length;
    const unknownCount = this.printers.filter(p => p.connectionStatus === 'Unknown').length;
    const onlineRate = totalPrinters > 0 ? Number(((onlineCount / totalPrinters) * 100).toFixed(1)) : null;

    const activeIncidents = this.incidents.filter(i => i.status === 'Active');
    const criticalAlertsCount = activeIncidents.filter(i => i.severity === 'Critical').length;
    const warningAlertsCount = activeIncidents.filter(i => i.severity === 'Warning').length;
    const activeAlertsCount = activeIncidents.length;

    const lowSuppliesCount = this.printers.filter(p => {
      const s = p.supplies;
      return (
        (s.black !== null && s.black <= 20) ||
        (s.cyan !== null && s.cyan <= 20) ||
        (s.magenta !== null && s.magenta <= 20) ||
        (s.yellow !== null && s.yellow <= 20) ||
        (s.waste !== null && s.waste >= 80)
      );
    }).length;

    // Thiết bị cần chú ý: Thiết bị có trạng thái Error, Warning, Offline, hoặc mực thấp
    const devicesNeedingAttention = this.printers.filter(p => {
      const isCriticalOrWarning = p.technicalSeverity === 'Critical' || p.technicalSeverity === 'Warning';
      const isOffline = p.connectionStatus === 'Offline';
      const s = p.supplies;
      const isLowSupply = (s.black !== null && s.black <= 10) || (s.waste !== null && s.waste >= 90);
      return isCriticalOrWarning || isOffline || isLowSupply;
    });

    const recentIncidents = [...this.incidents]
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
      .slice(0, 5);

    return {
      kpis: {
        totalPrinters,
        onlineCount,
        offlineCount,
        unknownCount,
        onlineRate,
        activeAlertsCount,
        criticalAlertsCount,
        warningAlertsCount,
        lowSuppliesCount,
      },
      devicesNeedingAttention,
      recentIncidents,
      lastSyncTime: new Date().toISOString(),
      isStale: false,
    };
  }
}

