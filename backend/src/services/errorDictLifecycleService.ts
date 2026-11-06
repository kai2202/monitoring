/**
 * Backend/src/services/errorDictLifecycleService.ts
 *
 * Dịch Vụ Quản Trị Vòng Đời Bộ Từ Điển CSV & Đối Chiếu Mã Lỗi Chưa Tích Hợp:
 * - Theo dõi chính xác thời điểm nạp bộ CSV hiện hành (`fileName`, `importedAt`, `importedBy`).
 * - Hỗ trợ gỡ bỏ hoàn toàn bộ mã lỗi CSV khỏi PostgreSQL (`unloadDictionary`) để làm sạch CSDL trước khi nạp bộ mới.
 * - Tự động phát hiện các mã lỗi phát sinh trên thiết bị (`Incident`) chưa có trong `ErrorDictionary`.
 * - Cơ chế tương thích tự động: Ngay khi nạp CSV có chứa mã lỗi tương ứng, thông báo mã thiếu tự động biến mất
 *   và đồng bộ chuẩn hóa lại `canonicalCode`/`subsystem` cho các sự cố liên quan.
 * - Tuân thủ AGENTS.md Rule 5, Rule 6 & Rule 7.1 (< 300 LOC).
 */

import { prisma } from '../lib/prisma';
import {
  detectSubsystemFromTrigger,
  normalizeRawCodeKey,
  normalizeVendorKey,
} from './diagnostics/errorCodeClassifier';

export interface ActiveCsvDatasetInfo {
  isLoaded: boolean;
  activeCodesCount: number;
  fileName: string | null;
  importedAt: string | null;
  importedBy: string | null;
  lastUnloadedAt: string | null;
  lastUnloadedBy: string | null;
}

export interface UnmappedHardwareErrorItem {
  vendor: string;
  errorCode: string;
  occurrencesCount: number;
  openIncidentsCount: number;
  affectedPrinters: string[];
  sampleTitle: string;
  suggestedSubsystem: string;
  severity: 'Critical' | 'Warning';
  lastDetectedAt: string;
}

export interface ErrorDictionaryLifecycleStatus {
  activeDataset: ActiveCsvDatasetInfo;
  unmappedCodes: UnmappedHardwareErrorItem[];
}

function formatVendorDisplay(rawVendor?: string | null): string {
  const key = normalizeVendorKey(rawVendor);
  const map: Record<string, string> = {
    ricoh: 'Ricoh',
    canon: 'Canon',
    hp: 'HP',
    epson: 'Epson',
    brother: 'Brother',
    toshiba: 'Toshiba',
    xerox: 'Xerox',
    general: 'General',
  };
  return map[key] || (rawVendor ? rawVendor.trim() : 'General');
}

export class ErrorDictLifecycleService {
  /**
   * Trả về trạng thái bộ CSV đang nạp và danh sách các mã lỗi phát sinh chưa tích hợp vào CSV.
   */
  public async getStatus(): Promise<ErrorDictionaryLifecycleStatus> {
    const [dictEntries, latestImportJob, latestUnloadLog, incidents] = await Promise.all([
      prisma.errorDictionary.findMany({
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.csvImportJob.findFirst({
        where: { entityType: 'ERROR_DICT', status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { fullName: true, username: true } } },
      }),
      prisma.auditLog.findFirst({
        where: { targetId: 'CSV_ERROR_DICT_UNLOAD' },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, username: true } } },
      }),
      prisma.incident.findMany({
        where: { errorCode: { not: null } },
        include: { printer: { select: { id: true, name: true, mfr: true } } },
        orderBy: { detectedAt: 'desc' },
      }),
    ]);

    const activeCodesCount = dictEntries.length;
    const unloadTime = latestUnloadLog?.createdAt ?? null;
    const importTime = latestImportJob ? latestImportJob.completedAt ?? latestImportJob.createdAt : null;

    // Kiểm tra xem lần nạp CSV gần nhất có diễn ra SAU lần gỡ gần nhất không
    const hasActiveCsvJob =
      activeCodesCount > 0 &&
      latestImportJob !== null &&
      (!unloadTime || (importTime !== null && importTime.getTime() >= unloadTime.getTime()));

    const activeDataset: ActiveCsvDatasetInfo = {
      isLoaded: activeCodesCount > 0,
      activeCodesCount,
      fileName:
        activeCodesCount === 0
          ? null
          : hasActiveCsvJob && latestImportJob
          ? latestImportJob.fileName
          : 'Bộ từ điển khởi tạo hệ thống (Seed)',
      importedAt:
        activeCodesCount === 0
          ? null
          : hasActiveCsvJob && importTime
          ? importTime.toISOString()
          : dictEntries[0]?.updatedAt?.toISOString() ?? null,
      importedBy:
        activeCodesCount === 0
          ? null
          : hasActiveCsvJob
          ? latestImportJob?.uploadedBy?.fullName || latestImportJob?.uploadedBy?.username || 'Quản trị viên'
          : 'Hệ thống',
      lastUnloadedAt: unloadTime ? unloadTime.toISOString() : null,
      lastUnloadedBy: latestUnloadLog?.user?.fullName || latestUnloadLog?.user?.username || null,
    };

    // Tập khóa tra cứu O(1) từ bảng ErrorDictionary hiện có trong PostgreSQL
    const mappedKeys = new Set<string>();
    for (const d of dictEntries) {
      mappedKeys.add(`${normalizeVendorKey(d.vendor)}::${normalizeRawCodeKey(d.rawCode)}`);
    }

    // Gom nhóm các mã lỗi phát sinh thực tế trên máy in chưa có trong ErrorDictionary
    const unmappedMap = new Map<string, UnmappedHardwareErrorItem>();
    for (const inc of incidents) {
      const rawCode = (inc.errorCode || '').trim();
      if (!rawCode || rawCode === 'UNKNOWN' || rawCode === 'RAW_CODE_UNSPECIFIED') continue;

      const vendorNorm = normalizeVendorKey(inc.printer?.mfr);
      const codeNorm = normalizeRawCodeKey(rawCode);

      const isMatchedExact = mappedKeys.has(`${vendorNorm}::${codeNorm}`);
      const isMatchedGeneral = mappedKeys.has(`general::${codeNorm}`);
      if (isMatchedExact || isMatchedGeneral) {
        continue; // Cơ chế tương thích: Đã có trong CSV -> Tự động không hiển thị cảnh báo thiếu!
      }

      const groupKey = `${vendorNorm}::${codeNorm}`;
      const existing = unmappedMap.get(groupKey);
      const printerLabel = inc.printer?.name || inc.printerId;
      const isOpen = inc.status.toUpperCase() !== 'RESOLVED';
      const isCrit = inc.severity.toLowerCase() === 'critical';

      if (!existing) {
        unmappedMap.set(groupKey, {
          vendor: formatVendorDisplay(inc.printer?.mfr),
          errorCode: rawCode,
          occurrencesCount: 1,
          openIncidentsCount: isOpen ? 1 : 0,
          affectedPrinters: [printerLabel],
          sampleTitle: inc.title || inc.description || `Sự cố mã ${rawCode}`,
          suggestedSubsystem:
            inc.subsystem && inc.subsystem !== 'UNK'
              ? inc.subsystem
              : detectSubsystemFromTrigger(inc.title || ''),
          severity: isCrit ? 'Critical' : 'Warning',
          lastDetectedAt: inc.detectedAt.toISOString(),
        });
      } else {
        existing.occurrencesCount += 1;
        if (isOpen) existing.openIncidentsCount += 1;
        if (isCrit) existing.severity = 'Critical';
        if (!existing.affectedPrinters.includes(printerLabel)) {
          existing.affectedPrinters.push(printerLabel);
        }
      }
    }

    return {
      activeDataset,
      unmappedCodes: Array.from(unmappedMap.values()),
    };
  }

  /**
   * Tháo gỡ hoàn toàn bộ mã lỗi CSV hiện tại khỏi bảng ErrorDictionary trong PostgreSQL.
   */
  public async unloadDictionary(userId?: string, ipAddress?: string) {
    const unloadedAt = new Date();
    const removedCount = await prisma.$transaction(async (tx) => {
      const delRes = await tx.errorDictionary.deleteMany({});
      await tx.incident.updateMany({
        where: { errorCode: { not: null } },
        data: { canonicalCode: 'FM-UNK-01' },
      });
      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'IMPORT_CSV',
          targetId: 'CSV_ERROR_DICT_UNLOAD',
          ipAddress: ipAddress || '127.0.0.1',
          diffJson: {
            action: 'UNLOAD_CSV_DICTIONARY',
            removedCodesCount: delRes.count,
            unloadedAt: unloadedAt.toISOString(),
          },
        },
      });
      return delRes.count;
    });

    const lifecycle = await this.getStatus();
    return {
      success: true,
      removedCount,
      unloadedAt: unloadedAt.toISOString(),
      lifecycle,
    };
  }

  /**
   * Đối chiếu đồng bộ lại các Incident đang có trong CSDL ngay sau khi nạp bộ CSV mới.
   */
  public async reconcileIncidentsWithDictionary(): Promise<number> {
    const [dictEntries, incidents] = await Promise.all([
      prisma.errorDictionary.findMany(),
      prisma.incident.findMany({
        where: { errorCode: { not: null } },
        include: { printer: { select: { mfr: true } } },
      }),
    ]);

    const dictMap = new Map<string, (typeof dictEntries)[number]>();
    for (const d of dictEntries) {
      dictMap.set(`${normalizeVendorKey(d.vendor)}::${normalizeRawCodeKey(d.rawCode)}`, d);
    }

    const reconciledGroups = new Set<string>();
    for (const inc of incidents) {
      const rawCode = (inc.errorCode || '').trim();
      if (!rawCode) continue;
      const vKey = normalizeVendorKey(inc.printer?.mfr);
      const cKey = normalizeRawCodeKey(rawCode);

      const matched = dictMap.get(`${vKey}::${cKey}`) || dictMap.get(`general::${cKey}`);
      if (matched) {
        if (inc.canonicalCode === 'FM-UNK-01' || !inc.canonicalCode) {
          reconciledGroups.add(`${vKey}::${cKey}`);
        }
        if (inc.canonicalCode !== matched.canonicalCode || inc.subsystem !== matched.subsystem) {
          await prisma.incident.update({
            where: { id: inc.id },
            data: {
              canonicalCode: matched.canonicalCode,
              subsystem: matched.subsystem,
            },
          });
        }
      }
    }

    return reconciledGroups.size;
  }
}

export const errorDictLifecycleService = new ErrorDictLifecycleService();

