/**
 * frontend/src/diagnostics/index.ts
 *
 * Multi-Vendor Diagnostic Registry & SNMP Trap Interpreter for Frontend.
 */

import { DiagnosticDetail, VendorDiagnosticCatalog } from './types';
import { RICOH_CATALOG } from './vendors/ricoh';
import { CANON_CATALOG } from './vendors/canon';
import { STANDARD_CATALOG } from './vendors/standard';

export * from './types';
export { RICOH_CATALOG } from './vendors/ricoh';
export { CANON_CATALOG } from './vendors/canon';
export { STANDARD_CATALOG } from './vendors/standard';

const VENDOR_CATALOGS: Record<string, VendorDiagnosticCatalog> = {
  ricoh: RICOH_CATALOG,
  canon: CANON_CATALOG,
};

export function extractRawCode(rawText: string): string {
  if (!rawText) return 'N/A';

  const scMatch = rawText.match(/sc[\s-]?([0-9]{3})/i);
  if (scMatch) return `SC${scMatch[1]}`;

  const braceMatch = rawText.match(/\{([0-9]{4,6})\}/);
  if (braceMatch) return braceMatch[1];

  const hpMatch = rawText.match(/\b([0-9]{2}\.[0-9A-Z]{1,2}(\.[0-9A-Z]{1,2})?)\b/i);
  if (hpMatch) return hpMatch[1];

  const canonMatch = rawText.match(/\b(E[0-9]{3})\b/i);
  if (canonMatch) return canonMatch[1].toUpperCase();

  const xeroxMatch = rawText.match(/\b([0-9]{3}-[0-9]{3})\b/);
  if (xeroxMatch) return xeroxMatch[1];

  const numMatch = rawText.match(/\b([0-9]{4,6})\b/);
  if (numMatch) return numMatch[1];

  if (rawText.includes('*UNKNOWN*')) return '*UNKNOWN*';

  return rawText.slice(0, 30).trim();
}

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

  if (normalizedVendor) {
    const specificCatalog = Object.entries(VENDOR_CATALOGS).find(([k]) =>
      normalizedVendor.includes(k)
    )?.[1];

    if (specificCatalog) {
      const match = matchCatalogRules(cleanText, specificCatalog);
      if (match) return match;
    }
  }

  for (const catalog of Object.values(VENDOR_CATALOGS)) {
    const match = matchCatalogRules(cleanText, catalog);
    if (match) return match;
  }

  const stdMatch = matchCatalogRules(cleanText, STANDARD_CATALOG);
  if (stdMatch) return stdMatch;

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
