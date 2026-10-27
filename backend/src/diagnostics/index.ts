/**
 * backend/src/diagnostics/index.ts
 *
 * Multi-Vendor Diagnostic Registry & SNMP Trap Interpreter.
 * Transforms raw error codes & trap payloads into structured, human-friendly diagnostics.
 */

import { DiagnosticDetail, VendorDiagnosticCatalog } from './types.js';
import { RICOH_CATALOG } from './vendors/ricoh.js';
import { CANON_CATALOG } from './vendors/canon.js';
import { STANDARD_CATALOG } from './vendors/standard.js';

export * from './types.js';
export { RICOH_CATALOG } from './vendors/ricoh.js';
export { CANON_CATALOG } from './vendors/canon.js';
export { STANDARD_CATALOG } from './vendors/standard.js';

const VENDOR_CATALOGS: Record<string, VendorDiagnosticCatalog> = {
  ricoh: RICOH_CATALOG,
  canon: CANON_CATALOG,
};

/**
 * Trích xuất mã lỗi ngắn từ chuỗi thô để phục vụ truy vết kỹ thuật
 */
export function extractRawCode(rawText: string): string {
  if (!rawText) return 'N/A';

  // 1. Mã SC Ricoh (vd: SC542, SC-554, SC 672)
  const scMatch = rawText.match(/sc[\s-]?([0-9]{3})/i);
  if (scMatch) return `SC${scMatch[1]}`;

  // 2. Mã trong ngoặc nhọn (vd: {30402}, {13400})
  const braceMatch = rawText.match(/\{([0-9]{4,6})\}/);
  if (braceMatch) return braceMatch[1];

  // 3. Mã HP (vd: 10.00.00, 13.01.00, 49.23.54, 50.1, 50.2)
  const hpMatch = rawText.match(/\b([0-9]{2}\.[0-9A-Z]{1,2}(\.[0-9A-Z]{1,2})?)\b/i);
  if (hpMatch) return hpMatch[1];

  // 4. Mã Canon E-code (vd: E000, E001, E730)
  const canonMatch = rawText.match(/\b(E[0-9]{3})\b/i);
  if (canonMatch) return canonMatch[1].toUpperCase();

  // 5. Mã Xerox (vd: 010-327, 077-101)
  const xeroxMatch = rawText.match(/\b([0-9]{3}-[0-9]{3})\b/);
  if (xeroxMatch) return xeroxMatch[1];

  // 6. Mã số 4-6 chữ số đứng riêng (vd: 30402, 30405, 13400, 99881)
  const numMatch = rawText.match(/\b([0-9]{4,6})\b/);
  if (numMatch) return numMatch[1];

  // 7. Mã *UNKNOWN*
  if (rawText.includes('*UNKNOWN*')) return '*UNKNOWN*';

  return rawText.slice(0, 30).trim();
}

/**
 * Phân giải chuỗi cảnh báo / SNMP Trap thô thành chi tiết chẩn đoán đầy đủ
 *
 * @param rawText Chuỗi lỗi thô từ SNMP prtAlertDescription hoặc Zabbix trigger
 * @param vendor Hãng máy in nếu đã biết (vd: "Ricoh", "HP", "Canon", "Xerox")
 * @param _model Model máy in nếu đã biết (phục vụ mở rộng chuyên sâu)
 */
export function resolveDiagnostic(
  rawText: string,
  vendor?: string,
  _model?: string
): DiagnosticDetail {
  if (!rawText || typeof rawText !== 'string' || rawText.trim() === '') {
    return {
      rawCode: 'NORMAL',
      errorName: 'Bình thường',
      description: 'Thiết bị đang hoạt động ổn định, không ghi nhận cảnh báo lỗi từ SNMP Trap.',
      subsystem: 'Toàn hệ thống',
      severity: 'Info',
      isIdentified: true,
      vendor: 'Standard RFC',
    };
  }

  const cleanText = rawText
    .replace(/^Printer Hardware Error:\s*/i, '')
    .replace(/^Printer Warning:\s*/i, '')
    .trim();

  const detectedCode = extractRawCode(cleanText);
  const normalizedVendor = (vendor || '').toLowerCase().trim();

  // 1. Thử catalog của hãng ưu tiên nếu đã biết vendor
  if (normalizedVendor) {
    const specificCatalog = Object.entries(VENDOR_CATALOGS).find(([k]) =>
      normalizedVendor.includes(k)
    )?.[1];

    if (specificCatalog) {
      const match = matchCatalogRules(cleanText, specificCatalog);
      if (match) return match;
    }
  }

  // 2. Thử lần lượt các catalog chuyên hãng khác (nếu máy in chưa rõ vendor nhưng lỗi mang mã chuyên hãng như SCxxx)
  for (const catalog of Object.values(VENDOR_CATALOGS)) {
    const match = matchCatalogRules(cleanText, catalog);
    if (match) return match;
  }

  // 3. Thử catalog chuẩn RFC 3805 (kẹt giấy, hết giấy, mở nắp, hết mực, mất mạng)
  const stdMatch = matchCatalogRules(cleanText, STANDARD_CATALOG);
  if (stdMatch) return stdMatch;

  // 4. KHÔNG TỰ SUY ĐOÁN: Nếu không khớp bất kỳ quy tắc đã xác minh nào -> Trả về "Chưa xác định" cùng mã gốc
  return {
    rawCode: detectedCode,
    errorName: 'Chưa xác định',
    description: `Hệ thống chưa có quy tắc ánh xạ được xác minh cho mã lỗi: "${cleanText}". Dữ liệu gốc được lưu giữ nguyên vẹn để phục vụ kỹ thuật.`,
    subsystem: 'Chưa phân loại',
    severity: 'Warning',
    isIdentified: false,
    vendor: vendor || 'Chưa xác định',
  };
}

function matchCatalogRules(
  text: string,
  catalog: VendorDiagnosticCatalog
): DiagnosticDetail | null {
  for (const rule of catalog.rules) {
    let isMatch = false;
    let matchResult: RegExpMatchArray | null = null;

    if (rule.pattern instanceof RegExp) {
      matchResult = text.match(rule.pattern);
      if (matchResult) isMatch = true;
    } else if (text.toLowerCase().includes(rule.pattern.toLowerCase())) {
      isMatch = true;
    }

    if (isMatch) {
      const detectedCode = extractRawCode(text);
      const isSpecificCode = detectedCode && detectedCode !== text.slice(0, 30).trim() && detectedCode !== 'N/A';
      const extractedCode = isSpecificCode
        ? detectedCode
        : (rule.code
            ? (typeof rule.code === 'function' && matchResult ? rule.code(matchResult) : rule.code)
            : detectedCode);

      const name = typeof rule.name === 'function' && matchResult ? rule.name(matchResult) : rule.name;
      const description = typeof rule.description === 'function' && matchResult ? rule.description(matchResult) : rule.description;

      return {
        rawCode: extractedCode as string,
        errorName: name as string,
        description: description as string,
        subsystem: rule.subsystem,
        severity: rule.severity,
        isIdentified: true,
        vendor: catalog.vendorName,
      };
    }
  }

  return null;
}
