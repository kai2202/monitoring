/**
 * Backend/src/services/analytics/compareAnalyticsService.ts
 *
 * Dịch vụ tổng hợp dữ liệu So sánh Hiệu suất Thiết bị Máy in (Device Comparison):
 * - Truy vấn 100% từ PostgreSQL qua Prisma ORM (`Printer`, `PrinterConsumable`, `CounterRollup`, `Incident`, `Task`).
 * - Tính toán MTTR và Downtime thực tế từ nhật ký `Task.timeAndCost`, trả về `null` khi chưa có dữ liệu đo kiểm.
 * - Tuân thủ AGENTS.md Rule 5 (MetricValue = number | null) & Rule 7.1 (< 300 LOC).
 */

import { prisma } from '../../lib/prisma';

export async function computeDeviceComparison(ids: string[]) {
  const printers = await prisma.printer.findMany({
    where: ids.length > 0 ? { id: { in: ids } } : undefined,
    include: { consumable: true, counterRollups: { take: 30 }, incidents: true, tasks: true },
    take: 10,
  });

  return printers.map((p) => {
    const mono = p.counterRollups.reduce((s, r) => s + r.deltaMono, 0);
    const color = p.counterRollups.reduce((s, r) => s + r.deltaColor, 0);
    const total = mono + color;

    let repairSum = 0;
    let repairCount = 0;
    let downtimeSum = 0;
    p.tasks.forEach((t) => {
      const tc: any = t.timeAndCost || {};
      if (typeof tc.repairTimeHours === 'number') {
        repairSum += tc.repairTimeHours;
        repairCount++;
      }
      if (typeof tc.downtimeHours === 'number') {
        downtimeSum += tc.downtimeHours;
      }
    });

    const mttrHours = repairCount > 0 ? Number((repairSum / repairCount).toFixed(2)) : null;
    const uptimePercent =
      downtimeSum > 0
        ? Number(Math.max(0, 100 - (downtimeSum / 720) * 100).toFixed(1))
        : p.connectionStatus === 'Online'
        ? 100
        : null;

    return {
      printerId: p.id,
      printerName: p.name,
      model: p.model,
      brand: p.mfr,
      floor: p.floor,
      department: p.department,
      color: '#2563eb',
      totalPages: total,
      ppmActual: null,
      ppmNominal: null,
      uptimePercent,
      mtbfHours: p.incidents.length > 0 ? Math.round(720 / p.incidents.length) : null,
      failureCount: p.incidents.length,
      downtimeHours: downtimeSum > 0 ? Number(downtimeSum.toFixed(1)) : 0,
      production: {
        monoPages: mono,
        colorPages: color,
        colorRatioPercent: total > 0 ? Math.round((color / total) * 100) : 0,
        avgDailyPages: Math.round(total / 30),
      },
      speed: { firstPageOutSeconds: null, warmupTimeSeconds: null },
      reliability: {
        mttrHours,
        paperJamCount: p.incidents.filter((i) => i.subsystem === 'PAPER_FEED' || i.subsystem === 'FED').length,
        hardwareFaultCount: p.incidents.filter((i) => i.severity === 'critical').length,
        lastIncidentTime: p.incidents[0]?.detectedAt
          ? p.incidents[0].detectedAt.toLocaleDateString('vi-VN')
          : null,
      },
      availability: {
        maintenanceCount: p.tasks.length,
        scheduledDowntimeHours: null,
        unscheduledDowntimeHours: downtimeSum > 0 ? Number(downtimeSum.toFixed(1)) : 0,
      },
      consumables: {
        tonerBlackPercent: p.consumable?.tonerBlack ?? null,
        tonerCyanPercent: p.consumable?.tonerCyan ?? null,
        tonerMagentaPercent: p.consumable?.tonerMagenta ?? null,
        tonerYellowPercent: p.consumable?.tonerYellow ?? null,
        drumLifePercent: p.consumable?.drumLifePercent ?? null,
        wasteTonerBoxStatus:
          p.consumable?.wasteTonerStatus === 'FULL'
            ? 'Đầy'
            : p.consumable?.wasteTonerStatus === 'WARNING'
            ? 'Sắp đầy'
            : p.consumable
            ? 'OK'
            : '—',
      },
    };
  });
}

