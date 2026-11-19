/**
 * Backend/src/services/analytics/lemonAndRecurringErrorsService.ts
 *
 * Dịch vụ tính toán Bảng Xếp Hạng Máy In Hư Nhiều (Lemon Devices)
 * và Bảng Thống Kê Các Mã Lỗi Lặp Lại Nhiều Nhất (Recurring Errors):
 * - Dữ liệu lấy từ PostgreSQL qua Prisma ORM (Printer, Incident, Task).
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { prisma } from '../../lib/prisma';

export interface LemonPrinterItem {
  printerId: string;
  name: string;
  model: string;
  mfr: string;
  floor: string;
  department: string;
  managingTeam: string | null;
  custodianName: string | null;
  incidentCount: number;
  totalRepairCostVnd: number;
  connectionStatus: string;
  health: string;
  isLemonWarning: boolean; // true nếu chi phí sửa chữa cao bất thường
}

export interface RecurringErrorItem {
  errorCode: string;
  vendor: string;
  vietnameseDesc: string;
  occurrenceCount: number;
  severity: 'critical' | 'warning';
  topAffectedPrinters: Array<{ printerId: string; name: string; count: number }>;
  history: Array<{
    id: string;
    printerId: string;
    printerName: string;
    detectedAt: string;
    resolvedAt: string | null;
    taskId?: string;
  }>;
}

export async function computeLemonAndRecurringErrors(building?: string) {
  const wherePrinter: any = {};
  if (building && building !== 'all') {
    wherePrinter.building = { contains: building, mode: 'insensitive' };
  }

  const [printers, incidents] = await Promise.all([
    prisma.printer.findMany({
      where: wherePrinter,
      include: {
        tasks: {
          select: {
            id: true,
            totalCostVnd: true,
            status: true,
          },
        },
        incidents: {
          select: {
            id: true,
            errorCode: true,
            severity: true,
            detectedAt: true,
          },
        },
      },
    }),
    prisma.incident.findMany({
      where: building && building !== 'all' ? { printer: wherePrinter } : undefined,
      include: {
        printer: {
          select: {
            id: true,
            name: true,
            model: true,
            mfr: true,
          },
        },
        tasks: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
      orderBy: { detectedAt: 'desc' },
      take: 200,
    }),
  ]);

  // 1. Tổng hợp Lemon Printers
  const lemonPrinters: LemonPrinterItem[] = printers.map((p) => {
    const totalRepairCost = p.tasks.reduce((sum, t) => sum + (t.totalCostVnd || 0), 0);
    const incidentCount = p.incidents.length;

    return {
      printerId: p.id,
      name: p.name,
      model: p.model,
      mfr: p.mfr,
      floor: p.floor || 'T1',
      department: p.department || 'Văn phòng',
      managingTeam: p.managingTeam,
      custodianName: p.custodianName,
      incidentCount,
      totalRepairCostVnd: totalRepairCost,
      connectionStatus: p.connectionStatus,
      health: p.health,
      // Đánh dấu cảnh báo nếu chi phí sửa chữa vượt 10,000,000 VNĐ hoặc hỏng trên 5 lần
      isLemonWarning: totalRepairCost >= 10000000 || incidentCount >= 5,
    };
  });

  // Sắp xếp: ưu tiên số lần hỏng nhiều nhất, sau đó đến tổng tiền sửa
  lemonPrinters.sort((a, b) => {
    if (b.incidentCount !== a.incidentCount) {
      return b.incidentCount - a.incidentCount;
    }
    return b.totalRepairCostVnd - a.totalRepairCostVnd;
  });

  // 2. Tổng hợp Recurring Errors
  const errorMap = new Map<
    string,
    {
      errorCode: string;
      vendor: string;
      vietnameseDesc: string;
      occurrenceCount: number;
      severities: string[];
      printerCountMap: Map<string, { id: string; name: string; count: number }>;
      history: Array<{
        id: string;
        printerId: string;
        printerName: string;
        detectedAt: string;
        resolvedAt: string | null;
        taskId?: string;
      }>;
    }
  >();

  incidents.forEach((inc) => {
    const code = (inc.errorCode || inc.canonicalCode || inc.title || 'ERR_GENERIC').trim();
    const vendor = inc.printer?.mfr || 'Ricoh';
    const cur = errorMap.get(code) || {
      errorCode: code,
      vendor,
      vietnameseDesc: inc.description || inc.title || `Sự cố thiết bị ${code}`,
      occurrenceCount: 0,
      severities: [],
      printerCountMap: new Map(),
      history: [],
    };

    cur.occurrenceCount += 1;
    cur.severities.push(inc.severity);

    const pId = inc.printer?.id || inc.printerId;
    const pName = inc.printer?.name || pId;
    const pCur = cur.printerCountMap.get(pId) || { id: pId, name: pName, count: 0 };
    pCur.count += 1;
    cur.printerCountMap.set(pId, pCur);

    if (cur.history.length < 10) {
      cur.history.push({
        id: inc.id,
        printerId: pId,
        printerName: pName,
        detectedAt: inc.detectedAt.toISOString(),
        resolvedAt: inc.resolvedAt ? inc.resolvedAt.toISOString() : null,
        taskId: inc.tasks[0]?.id,
      });
    }

    errorMap.set(code, cur);
  });

  const recurringErrors: RecurringErrorItem[] = Array.from(errorMap.values()).map((err) => {
    const isCritical = err.severities.includes('critical');
    const topPrinters = Array.from(err.printerCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((p) => ({
        printerId: p.id,
        name: p.name,
        count: p.count,
      }));

    return {
      errorCode: err.errorCode,
      vendor: err.vendor,
      vietnameseDesc: err.vietnameseDesc,
      occurrenceCount: err.occurrenceCount,
      severity: isCritical ? 'critical' : 'warning',
      topAffectedPrinters: topPrinters,
      history: err.history,
    };
  });

  // Sắp xếp mã lỗi lặp lại nhiều nhất
  recurringErrors.sort((a, b) => b.occurrenceCount - a.occurrenceCount);

  return {
    lemonPrinters,
    recurringErrors,
  };
}

