/**
 * Backend/src/services/csvImportService.ts
 *
 * Dịch Vụ Xử Lý & Kiểm Duyệt Nạp Dữ Liệu CSV (TASK-BE-05):
 * - Hỗ trợ chuẩn RFC 4180 (dấu phẩy & chấm phẩy), xử lý ký tự UTF-8 BOM (\uFEFF).
 * - Ghi trực tiếp vào bảng `ErrorDictionary` khớp 100% schema Prisma (`descriptionVi`, `canonicalCode`...).
 * - Tự động gọi `errorDictLifecycleService.reconcileIncidentsWithDictionary()` để đối chiếu và tự ẩn
 *   các thông báo mã lỗi chưa tích hợp CSV tương ứng ngay sau khi nạp.
 * - Tuân thủ AGENTS.md Rule 4, Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { prisma } from '../lib/prisma';
import {
  errorDictLifecycleService,
  ErrorDictionaryLifecycleStatus,
} from './errorDictLifecycleService';

export interface CsvRowError {
  rowNumber: number;
  field: string;
  value: string;
  message: string;
}

export interface CsvImportExecutionResult {
  jobId: string;
  fileName: string;
  entityType: 'ERROR_DICT' | 'PRINTER' | 'TELEMETRY';
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: CsvRowError[];
  status: 'COMPLETED' | 'FAILED';
  importedAt: string;
  resolvedUnmappedCount: number;
  lifecycle?: ErrorDictionaryLifecycleStatus;
}

function normalizeVendorDisplay(rawVendor: string): string {
  const clean = rawVendor.trim();
  const lower = clean.toLowerCase();
  if (lower.includes('ricoh')) return 'Ricoh';
  if (lower.includes('canon')) return 'Canon';
  if (lower.includes('hp') || lower.includes('hewlett')) return 'HP';
  if (lower.includes('epson')) return 'Epson';
  if (lower.includes('brother')) return 'Brother';
  if (lower.includes('toshiba')) return 'Toshiba';
  if (lower.includes('xerox')) return 'Xerox';
  if (lower.includes('general') || lower.includes('chung')) return 'General';
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'General';
}

export class CsvImportService {
  /**
   * Phân tích cú pháp chuỗi CSV, loại bỏ UTF-8 BOM và bóc tách các dòng/cột.
   */
  public parseCsv(rawContent: string): string[][] {
    const cleanContent = rawContent.replace(/^\uFEFF/, '').trim();
    if (!cleanContent) return [];

    const lines = cleanContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    return lines.map((line) => {
      const row: string[] = [];
      let inQuotes = false;
      let currentVal = '';
      const delimiter = line.includes(';') && !line.includes(',') ? ';' : ',';

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            currentVal += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          row.push(currentVal.trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      row.push(currentVal.trim());
      return row;
    });
  }

  /**
   * Nạp và kiểm duyệt Từ điển mã lỗi đa hãng (ErrorDictionary) vào PostgreSQL.
   */
  public async importErrorDictionary(
    fileName: string,
    rawCsv: string,
    userId?: string,
    ipAddress?: string
  ): Promise<CsvImportExecutionResult> {
    const importedAt = new Date();
    const matrix = this.parseCsv(rawCsv);
    const totalRows = Math.max(0, matrix.length - 1);
    const errors: CsvRowError[] = [];

    if (matrix.length <= 1) {
      return {
        jobId: `job-invalid-${Date.now()}`,
        fileName,
        entityType: 'ERROR_DICT',
        totalRows: 0,
        validRows: 0,
        errorRows: 1,
        errors: [{ rowNumber: 1, field: 'file', value: '', message: 'File CSV không có dòng dữ liệu hợp lệ' }],
        status: 'FAILED',
        importedAt: importedAt.toISOString(),
        resolvedUnmappedCount: 0,
      };
    }

    const headers = matrix[0].map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, ''));
    const vendorIdx = headers.findIndex((h) => ['vendor', 'hang', 'hangsanxuat', 'brand'].includes(h));
    const codeIdx = headers.findIndex((h) => ['errorcode', 'code', 'maloi', 'malo'].includes(h));
    const nameIdx = headers.findIndex((h) => ['errorname', 'name', 'tenloi', 'canonicalcode'].includes(h));
    const subsystemIdx = headers.findIndex((h) => ['affectedsubsystem', 'subsystem', 'phanhe', 'khoi'].includes(h));
    const severityIdx = headers.findIndex((h) => ['severity', 'mucdo', 'mucdonghiemtrong'].includes(h));
    const descIdx = headers.findIndex((h) => ['description', 'mota', 'chitiet'].includes(h));

    const validData: Array<{
      vendor: string;
      rawCode: string;
      canonicalCode: string;
      subsystem: string;
      descriptionVi: string;
      severity: string;
      isPaperJam: boolean;
      isCoverOpen: boolean;
      isConsumable: boolean;
    }> = [];

    for (let i = 1; i < matrix.length; i++) {
      const row = matrix[i];
      if (row.length === 0 || row.every((c) => !c.trim())) continue;

      const rawVendor = (vendorIdx >= 0 ? row[vendorIdx] : row[0]) || '';
      const rawCode = ((codeIdx >= 0 ? row[codeIdx] : row[1]) || '').trim();
      const rawName = ((nameIdx >= 0 ? row[nameIdx] : row[2]) || '').trim();
      const rawSubsystem = ((subsystemIdx >= 0 ? row[subsystemIdx] : row[3]) || 'General').trim();
      const rawSeverity = ((severityIdx >= 0 ? row[severityIdx] : row[4]) || 'Warning').trim();
      const rawDesc = ((descIdx >= 0 ? row[descIdx] : row[5]) || '').trim();

      if (!rawCode) {
        errors.push({ rowNumber: i + 1, field: 'errorCode', value: '', message: 'Mã lỗi không được để trống' });
        continue;
      }

      const vendor = normalizeVendorDisplay(rawVendor || 'General');
      const subClean = rawSubsystem.toUpperCase() || 'GENERAL';
      const subShort = subClean.replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'SYS';
      const canonicalCode = rawName.startsWith('FM-')
        ? rawName
        : `FM-${subShort}-${String(i).padStart(2, '0')}`;

      const sevLower = rawSeverity.toLowerCase();
      const severity =
        sevLower === 'critical' || sevLower.includes('nguy')
          ? 'critical'
          : sevLower === 'info' || sevLower.includes('thông')
          ? 'info'
          : 'warning';

      const combinedText = `${rawName} ${rawDesc} ${rawSubsystem}`.toLowerCase();
      const descriptionVi =
        rawDesc && rawName && !rawName.startsWith('FM-') && !rawDesc.includes(rawName)
          ? `${rawName}: ${rawDesc}`
          : rawDesc || rawName || `Mã lỗi chuẩn hóa ${rawCode} (${vendor})`;

      validData.push({
        vendor,
        rawCode,
        canonicalCode,
        subsystem: rawSubsystem || 'General',
        descriptionVi,
        severity,
        isPaperJam: combinedText.includes('jam') || combinedText.includes('kẹt giấy'),
        isCoverOpen: combinedText.includes('cover') || combinedText.includes('mở nắp'),
        isConsumable: combinedText.includes('toner') || combinedText.includes('mực'),
      });
    }

    const validRows = validData.length;
    const errorRows = errors.length;
    const status = validRows > 0 ? 'COMPLETED' : 'FAILED';

    const dbJob = await prisma.csvImportJob.create({
      data: {
        fileName,
        uploadedById: userId || null,
        entityType: 'ERROR_DICT',
        totalRows,
        validRows,
        errorRows,
        errorLog: errors as any,
        status: status as any,
        completedAt: importedAt,
      },
    });

    if (validData.length > 0) {
      await prisma.$transaction(
        validData.map((item) =>
          prisma.errorDictionary.upsert({
            where: { vendor_rawCode: { vendor: item.vendor, rawCode: item.rawCode } },
            update: {
              canonicalCode: item.canonicalCode,
              subsystem: item.subsystem,
              descriptionVi: item.descriptionVi,
              severity: item.severity,
              isPaperJam: item.isPaperJam,
              isCoverOpen: item.isCoverOpen,
              isConsumable: item.isConsumable,
            },
            create: item,
          })
        )
      );
    }

    const resolvedUnmappedCount = await errorDictLifecycleService.reconcileIncidentsWithDictionary();

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action: 'IMPORT_CSV',
        targetId: dbJob.id,
        ipAddress: ipAddress || '127.0.0.1',
        diffJson: {
          fileName,
          entityType: 'ERROR_DICT',
          totalRows,
          validRows,
          errorRows,
          resolvedUnmappedCount,
          importedAt: importedAt.toISOString(),
        },
      },
    });

    const lifecycle = await errorDictLifecycleService.getStatus();

    return {
      jobId: dbJob.id,
      fileName,
      entityType: 'ERROR_DICT',
      totalRows,
      validRows,
      errorRows,
      errors,
      status,
      importedAt: importedAt.toISOString(),
      resolvedUnmappedCount,
      lifecycle,
    };
  }

  public async getImportJobs(limit: number = 20) {
    return prisma.csvImportJob.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { fullName: true, username: true } } },
    });
  }

  public async getAuditLogs(limit: number = 50) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, username: true, role: true } } },
    });
  }
}

export const csvImportService = new CsvImportService();
