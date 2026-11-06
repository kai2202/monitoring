/**
 * Frontend/src/features/settings/utils/errorDictionaryCsvHelper.ts
 *
 * Tiện ích Chuẩn hóa Dữ liệu Xuất/Nhập CSV cho Từ điển mã lỗi phần cứng:
 * - Định dạng chuẩn UTF-8 BOM (\uFEFF) tương thích Microsoft Excel & Sheets.
 * - Hỗ trợ cả định dạng cột tiếng Anh và tiếng Việt.
 * - Bộ kiểm tra tính hợp lệ (Validation Engine) chi tiết từng dòng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { PrinterErrorCode } from '@/types/api';

export interface CsvValidationItem {
  rowNumber: number;
  data: {
    vendor: string;
    errorCode: string;
    errorName: string;
    affectedSubsystem: string;
    severity: 'Critical' | 'Warning' | 'Info';
    description: string;
  };
  isValid: boolean;
  errors: string[];
  action: 'NEW' | 'UPDATE' | 'REJECT';
}

export interface CsvValidationResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  newCount: number;
  updateCount: number;
  items: CsvValidationItem[];
  validRows: PrinterErrorCode[];
}

export const SAMPLE_CSV_CONTENT = `\uFEFFvendor,errorCode,errorName,affectedSubsystem,severity,description\r
Canon,E000,Lỗi cụm sấy: Bộ nung không gia nhiệt,Fuser,Critical,Thanh nhiệt gốm Ceramic Heater không đạt nhiệt độ khởi động\r
Ricoh,SC542,Lỗi quá nhiệt sấy ống lồng fuser,Fuser,Critical,Nhiệt độ cụm sấy vượt ngưỡng 230 độ C bảo vệ an toàn\r
HP,13.01.00,Kẹt giấy khay nạp 1 (Tray 1 paper jam),Paper_Feed,Warning,Giấy không rời khỏi khay nạp đúng chu kỳ cảm biến\r
Epson,0x9A,Lỗi mạch điều khiển đầu phun PrecisionCore,Controller_Board,Critical,Lỗi xung tín hiệu điều khiển đầu kim phun mực\r
Brother,Self-Diag,Bộ điều khiển nhiệt sấy chưa đạt chuẩn,Fuser,Warning,Nhiệt trở sấy đọc giá trị dao động bất thường\r
Toshiba,C440,Điện áp trở nhiệt sấy ngoài ngưỡng,Fuser,Critical,Điện áp trở nhiệt sấy vượt dải tham chiếu an toàn\r
General,FM-UNK-01,Mã lỗi phần cứng chưa định danh,General,Info,Lỗi phần cứng chưa có trong từ điển chuẩn hóa`;

/**
 * Phân tích chuỗi CSV theo chuẩn RFC 4180 (hỗ trợ dấu ngoặc kép và dấu phẩy/chấm phẩy)
 */
export function parseCsvText(text: string): string[][] {
  const cleanText = text.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  const lines = cleanText.split(/\r\n|\n|\r/);
  const result: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let insideQuote = false;
    let entry = '';
    const delimiter = line.includes(';') && !line.includes(',') ? ';' : ',';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === delimiter && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    result.push(row);
  }
  return result;
}

/**
 * Kiểm tra tính hợp lệ và chuẩn hóa danh sách mã lỗi từ CSV
 */
export function validateErrorDictionaryCsv(
  matrix: string[][],
  existingCodes: MockErrorCode[] = []
): CsvValidationResult {
  if (matrix.length < 2) {
    return {
      totalRows: 0,
      validCount: 0,
      invalidCount: 0,
      newCount: 0,
      updateCount: 0,
      items: [],
      validRows: [],
    };
  }

  const rawHeaders = matrix[0].map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, ''));
  const headerMap = {
    vendor: rawHeaders.findIndex((h) => ['vendor', 'hang', 'hangsanxuat', 'brand'].includes(h)),
    code: rawHeaders.findIndex((h) => ['errorcode', 'code', 'malo', 'maloi'].includes(h)),
    name: rawHeaders.findIndex((h) => ['errorname', 'name', 'tenloi', 'tenmalo'].includes(h)),
    subsystem: rawHeaders.findIndex((h) => ['affectedsubsystem', 'subsystem', 'phanhe', 'khoi', 'bophan'].includes(h)),
    severity: rawHeaders.findIndex((h) => ['severity', 'mucdo', 'mucdonghiemtrong'].includes(h)),
    description: rawHeaders.findIndex((h) => ['description', 'mota', 'chitiet'].includes(h)),
  };

  const existingMap = new Map<string, MockErrorCode>();
  existingCodes.forEach((e) => {
    const key = `${e.vendor.toLowerCase()}_${(e.errorCode || (e as any).code || '').toLowerCase()}`;
    existingMap.set(key, e);
  });

  const seenInFile = new Set<string>();
  const items: CsvValidationItem[] = [];
  const validRows: MockErrorCode[] = [];
  let newCount = 0;
  let updateCount = 0;

  for (let i = 1; i < matrix.length; i++) {
    const row = matrix[i];
    if (row.length === 0 || row.every((c) => !c.trim())) continue;

    const rowNum = i + 1;
    const errors: string[] = [];

    const rawVendor = (headerMap.vendor >= 0 ? row[headerMap.vendor] : row[0]) || '';
    const rawCode = (headerMap.code >= 0 ? row[headerMap.code] : row[1]) || '';
    const rawName = (headerMap.name >= 0 ? row[headerMap.name] : row[2]) || '';
    const rawSub = (headerMap.subsystem >= 0 ? row[headerMap.subsystem] : row[3]) || '';
    const rawSeverity = (headerMap.severity >= 0 ? row[headerMap.severity] : row[4]) || '';
    const rawDesc = (headerMap.description >= 0 ? row[headerMap.description] : row[5]) || '';

    // 1. Validate Code
    const errorCode = rawCode.trim();
    if (!errorCode) {
      errors.push('Mã lỗi không được để trống.');
    }

    // 2. Validate & Normalize Vendor
    let vendor = rawVendor.trim();
    if (!vendor) {
      errors.push('Hãng sản xuất không được để trống.');
    } else {
      const vLower = vendor.toLowerCase();
      if (vLower.includes('ricoh')) vendor = 'Ricoh';
      else if (vLower.includes('canon')) vendor = 'Canon';
      else if (vLower.includes('hp')) vendor = 'HP';
      else if (vLower.includes('epson')) vendor = 'Epson';
      else if (vLower.includes('toshiba')) vendor = 'Toshiba';
      else if (vLower.includes('brother')) vendor = 'Brother';
      else if (vLower.includes('general') || vLower.includes('chung')) vendor = 'General';
      else vendor = vendor.charAt(0).toUpperCase() + vendor.slice(1);
    }

    // 3. Validate Severity
    let severity: 'Critical' | 'Warning' | 'Info' = 'Warning';
    const sLower = rawSeverity.toLowerCase().trim();
    if (['critical', 'nguy cấp', 'nghiêm trọng', 'nguy cap', 'nghiem trong'].includes(sLower)) {
      severity = 'Critical';
    } else if (['warning', 'cảnh báo', 'canh bao', 'lưu ý', 'luu y'].includes(sLower)) {
      severity = 'Warning';
    } else if (['info', 'thông tin', 'thong tin', 'nhẹ'].includes(sLower)) {
      severity = 'Info';
    } else if (!rawSeverity) {
      errors.push('Mức độ nghiêm trọng không được để trống.');
    } else {
      errors.push(`Mức độ '${rawSeverity}' không hợp lệ (hỗ trợ: Critical, Warning, Info).`);
    }

    // 4. Validate Subsystem & Description
    const subsystem = rawSub.trim() || 'General';
    const description = rawDesc.trim();
    if (!description) {
      errors.push('Mô tả chi tiết lỗi không được để trống.');
    }
    const errorName = rawName.trim() || `Sự cố ${errorCode} (${vendor})`;

    // 5. Check Duplicates in File & System
    const key = `${vendor.toLowerCase()}_${errorCode.toLowerCase()}`;
    let action: 'NEW' | 'UPDATE' | 'REJECT' = 'NEW';

    if (seenInFile.has(key)) {
      errors.push(`Mã lỗi '${errorCode}' bị lặp lại nhiều lần trong file CSV.`);
    } else {
      seenInFile.add(key);
    }

    if (existingMap.has(key)) {
      action = 'UPDATE';
      updateCount++;
    } else {
      newCount++;
    }

    const isValid = errors.length === 0;
    if (!isValid) action = 'REJECT';

    const itemResult: CsvValidationItem = {
      rowNumber: rowNum,
      data: { vendor, errorCode, errorName, affectedSubsystem: subsystem, severity, description },
      isValid,
      errors,
      action,
    };
    items.push(itemResult);

    if (isValid) {
      validRows.push({
        id: existingMap.get(key)?.id || `err-imp-${Date.now()}-${i}`,
        vendor: vendor as any,
        errorCode,
        errorName,
        affectedSubsystem: subsystem as any,
        severity,
        description,
      });
    }
  }

  return {
    totalRows: items.length,
    validCount: validRows.length,
    invalidCount: items.length - validRows.length,
    newCount,
    updateCount,
    items,
    validRows,
  };
}

/**
 * Xuất danh mục mã lỗi ra file CSV chuẩn UTF-8 BOM
 */
export function exportErrorDictionaryToCsv(
  errors: PrinterErrorCode[],
  fileName?: string
): void {
  const headers = ['vendor', 'errorCode', 'errorName', 'affectedSubsystem', 'severity', 'description'];

  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r') || str.includes(';')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = errors.map((e) =>
    [
      escapeCsv(e.vendor),
      escapeCsv(e.errorCode || (e as any).code),
      escapeCsv(e.errorName || ''),
      escapeCsv(e.affectedSubsystem || (e as any).subsystem || 'General'),
      escapeCsv(e.severity),
      escapeCsv(e.description || ''),
    ].join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    fileName || `Tu_Dien_Ma_Loi_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

