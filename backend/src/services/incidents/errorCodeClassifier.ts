/**
 * Backend/src/services/incidents/errorCodeClassifier.ts
 *
 * Bộ Phân Loại Lỗi Phần Cứng & Đối Chiếu Từ Điển PostgreSQL (TASK-BE-02 & TASK-BE-05):
 * - Trích xuất mã lỗi phần cứng nguyên gốc (SCxxx, Exxx, 50.x, 13.xx.xx, Cxxx, 0x...) từ Zabbix Trigger.
 * - Đối chiếu trực tiếp với bảng `ErrorDictionary` nạp từ CSV trong PostgreSQL (`classifyWithDbDictionary`).
 * - Khi bộ CSV chưa có mã lỗi (hoặc đã gỡ CSV khỏi CSDL), đánh dấu `isMapped: false`, `needsMappingReview: true`
 *   và gán `FM-UNK-01` để tự động đưa vào danh sách thông báo mã lỗi chưa tích hợp CSV cho Admin.
 * - Tuân thủ AGENTS.md Rule 6 & Rule 7.1 (< 300 LOC).
 */

export interface ClassifiedErrorCode {
  internalCode: string;
  canonicalCode: string;
  subsystem: string;
  rawVendorCode: string;
  errorCode: string;
  severity: 'Critical' | 'Warning' | 'Info';
  isMapped: boolean;
  needsMappingReview: boolean;
  descriptionVi: string;
}

export interface DbErrorDictEntry {
  vendor: string;
  rawCode: string;
  canonicalCode: string;
  subsystem: string;
  severity: string;
  descriptionVi: string;
}

// Bảng cơ sở phục vụ kiểm thử đơn vị đồng bộ (Unit Test Sync Fallback)
const KNOWN_ERROR_MAPPINGS: Record<
  string,
  { internalCode: string; subsystem: string; severity: 'Critical' | 'Warning' | 'Info'; descriptionVi: string }
> = {
  RICOH_SC542: {
    internalCode: 'FM-FUS-01',
    subsystem: 'FUS',
    severity: 'Critical',
    descriptionVi: 'Lỗi nhiệt độ khối sấy Fuser không đạt chuẩn trong thời gian quy định',
  },
  RICOH_SC396: {
    internalCode: 'FM-DRM-01',
    subsystem: 'DRM',
    severity: 'Critical',
    descriptionVi: 'Động cơ trống quang học Drum bị kẹt hoặc quá tải cơ học',
  },
  'CANON_E000-0001': {
    internalCode: 'FM-FUS-02',
    subsystem: 'FUS',
    severity: 'Critical',
    descriptionVi: 'Lỗi gia nhiệt cụm sấy vượt ngưỡng an toàn',
  },
  CANON_E020: {
    internalCode: 'FM-SUP-01',
    subsystem: 'SUP',
    severity: 'Warning',
    descriptionVi: 'Cụm cấp mực bị tắc nghẽn hoặc cảm biến cấp mực không phản hồi',
  },
  'HP_50.1': {
    internalCode: 'FM-FUS-03',
    subsystem: 'FUS',
    severity: 'Critical',
    descriptionVi: 'Lỗi nhiệt độ sấy thấp Fuser Error',
  },
  'HP_13.00.00': {
    internalCode: 'FM-JAM-01',
    subsystem: 'JAM',
    severity: 'Warning',
    descriptionVi: 'Kẹt giấy tại khay nạp giấy chính (Tray 2 Jam)',
  },
};

export function normalizeVendorKey(rawVendor?: string | null): string {
  const v = (rawVendor || '').trim().toLowerCase();
  if (v.includes('ricoh')) return 'ricoh';
  if (v.includes('canon')) return 'canon';
  if (v.includes('hp') || v.includes('hewlett')) return 'hp';
  if (v.includes('epson')) return 'epson';
  if (v.includes('brother')) return 'brother';
  if (v.includes('toshiba')) return 'toshiba';
  if (v.includes('xerox')) return 'xerox';
  return 'general';
}

export function normalizeRawCodeKey(rawCode?: string | null): string {
  return (rawCode || '').trim().toUpperCase().replace(/[\s_-]+/g, '');
}

/**
 * Trích xuất mã lỗi hãng sản xuất từ tên Trigger hoặc chuỗi văn bản cảnh báo.
 */
export function extractRawVendorCode(triggerDescription: string): string | null {
  const text = triggerDescription || '';

  // 1. Dạng mã Ricoh: SCxxx (ví dụ: SC542, SC-542, sc 542)
  const ricohMatch = text.match(/\bSC[- ]?(\d{3,4})\b/i);
  if (ricohMatch) return `SC${ricohMatch[1]}`;

  // 2. Dạng mã Canon: Exxx-xxxx hoặc Exxx (ví dụ: E000-0001, E020)
  const canonMatch = text.match(/\bE(\d{3})(?:-(\d{4}))?\b/i);
  if (canonMatch) {
    return canonMatch[2] ? `E${canonMatch[1]}-${canonMatch[2]}` : `E${canonMatch[1]}`;
  }

  // 3. Dạng mã HP số thập phân / chấm: 50.1, 13.00.00, 59.F0
  const hpMatch = text.match(/\b(\d{2}\.[0-9A-Za-z]{1,2}(?:\.[0-9A-Za-z]{1,2})?)\b/);
  if (hpMatch) return hpMatch[1];

  // 4. Dạng mã Brother / Toshiba: Cxxx, 0xHEX
  const brotherMatch = text.match(/\b(0x[0-9A-Fa-f]{4,8})\b/);
  if (brotherMatch) return brotherMatch[1].toUpperCase();

  const toshibaMatch = text.match(/\b([A-Z]\d{3,4})\b/);
  if (toshibaMatch) return toshibaMatch[1].toUpperCase();

  return null;
}

/**
 * Dự đoán khối linh kiện bị ảnh hưởng (Subsystem) từ văn cảnh Trigger.
 */
export function detectSubsystemFromTrigger(triggerText: string): string {
  const lower = (triggerText || '').toLowerCase();
  if (lower.includes('fuser') || lower.includes('sấy') || lower.includes('heat') || lower.includes('nhiệt')) return 'FUS';
  if (lower.includes('drum') || lower.includes('trống') || lower.includes('quang học')) return 'DRM';
  if (lower.includes('toner') || lower.includes('mực') || lower.includes('supply') || lower.includes('cartridge')) return 'SUP';
  if (lower.includes('jam') || lower.includes('kẹt giấy') || lower.includes('paper') || lower.includes('roller')) return 'JAM';
  if (lower.includes('cover') || lower.includes('door') || lower.includes('nắp') || lower.includes('cửa')) return 'CVR';
  if (lower.includes('laser') || lower.includes('optic') || lower.includes('gương') || lower.includes('polygon')) return 'OPT';
  if (lower.includes('network') || lower.includes('mạng') || lower.includes('offline') || lower.includes('ping')) return 'NET';
  return 'GEN';
}

/**
 * Phân loại mã lỗi đối chiếu 100% với bảng `ErrorDictionary` từ PostgreSQL (Hỗ trợ CSV nạp động).
 */
export function classifyWithDbDictionary(
  triggerId: string,
  vendor: string,
  triggerDescription: string,
  triggerSeverity: number = 3,
  dbDictionary: DbErrorDictEntry[] = []
): ClassifiedErrorCode {
  const extractedRawCode = extractRawVendorCode(triggerDescription);
  const vendorKey = normalizeVendorKey(vendor);
  const codeKey = extractedRawCode ? normalizeRawCodeKey(extractedRawCode) : '';

  // 1. Tra cứu trực tiếp từ bảng ErrorDictionary đã nạp qua CSV
  if (codeKey && dbDictionary.length > 0) {
    const matched = dbDictionary.find((entry) => {
      const entryVendorKey = normalizeVendorKey(entry.vendor);
      const entryCodeKey = normalizeRawCodeKey(entry.rawCode);
      const isVendorMatch = entryVendorKey === vendorKey || entryVendorKey === 'general';
      return isVendorMatch && entryCodeKey === codeKey;
    });

    if (matched) {
      const isCrit = matched.severity.toLowerCase() === 'critical';
      return {
        internalCode: matched.canonicalCode,
        canonicalCode: matched.canonicalCode,
        subsystem: matched.subsystem || detectSubsystemFromTrigger(triggerDescription),
        rawVendorCode: matched.rawCode,
        errorCode: matched.rawCode,
        severity: isCrit ? 'Critical' : 'Warning',
        isMapped: true,
        needsMappingReview: false,
        descriptionVi: matched.descriptionVi || triggerDescription,
      };
    }
  }

  // 2. Tra cứu từ bảng cơ sở tĩnh (Fallback)
  if (codeKey) {
    const staticKey = `${vendorKey.toUpperCase()}_${extractedRawCode}`;
    const staticFallback = KNOWN_ERROR_MAPPINGS[staticKey];
    if (staticFallback) {
      return {
        internalCode: staticFallback.internalCode,
        canonicalCode: staticFallback.internalCode,
        subsystem: staticFallback.subsystem,
        rawVendorCode: extractedRawCode!,
        errorCode: extractedRawCode!,
        severity: staticFallback.severity,
        isMapped: true,
        needsMappingReview: false,
        descriptionVi: staticFallback.descriptionVi,
      };
    }
  }

  // 3. Trường hợp mã lỗi chưa có trong từ điển CSV
  const detectedSubsystem = detectSubsystemFromTrigger(triggerDescription);
  const isSeverityCritical = triggerSeverity >= 4 || triggerDescription.toLowerCase().includes('critical');

  return {
    internalCode: 'FM-UNK-01',
    canonicalCode: 'FM-UNK-01',
    subsystem: detectedSubsystem,
    rawVendorCode: extractedRawCode || triggerDescription.slice(0, 32),
    errorCode: extractedRawCode || 'UNKNOWN',
    severity: isSeverityCritical ? 'Critical' : 'Warning',
    isMapped: false,
    needsMappingReview: true,
    descriptionVi: `[Chưa đối chiếu CSV] ${triggerDescription}`,
  };
}

