/**
 * Backend/src/services/diagnostics/errorCodeClassifier.ts
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
    descriptionVi: 'Bộ sấy không gia nhiệt đạt nhiệt độ hoạt động tiêu chuẩn',
  },
  'CANON_E014-0000': {
    internalCode: 'FM-DRM-02',
    subsystem: 'DRM',
    severity: 'Critical',
    descriptionVi: 'Động cơ chính Main Motor bị lỗi hoặc đứt kết nối cáp',
  },
  'HP_50.1': {
    internalCode: 'FM-FUS-03',
    subsystem: 'FUS',
    severity: 'Critical',
    descriptionVi: 'Cụm sấy nhiệt độ thấp hơn ngưỡng vận hành an toàn',
  },
  'HP_13.00.00': {
    internalCode: 'FM-FED-01',
    subsystem: 'FED',
    severity: 'Warning',
    descriptionVi: 'Kẹt giấy khay chính hoặc đường dẫn giấy nội bộ',
  },
  EPSON_000021: {
    internalCode: 'FM-OPT-01',
    subsystem: 'OPT',
    severity: 'Critical',
    descriptionVi: 'Đầu kim / cụm đầu phun bị vướng vật cản không thể di chuyển',
  },
};

export function normalizeVendorKey(vendor?: string | null): string {
  const v = (vendor || 'general').trim().toLowerCase();
  if (v.includes('ricoh')) return 'ricoh';
  if (v.includes('canon')) return 'canon';
  if (v.includes('hp') || v.includes('hewlett')) return 'hp';
  if (v.includes('epson')) return 'epson';
  if (v.includes('brother')) return 'brother';
  if (v.includes('toshiba')) return 'toshiba';
  if (v.includes('xerox')) return 'xerox';
  if (v.includes('general') || v.includes('chung')) return 'general';
  return v || 'general';
}

export function normalizeRawCodeKey(code?: string | null): string {
  return (code || '').trim().toUpperCase();
}

export function extractRawErrorCodeFromTrigger(triggerName: string, fallbackCode?: string): string {
  const text = (triggerName || '').trim();
  const patterns = [
    /\b(SC\d{3,4}(?:-\d{2})?)\b/i,
    /\b(E\d{3,6}(?:-\d{4})?)\b/i,
    /\b(\d{2}\.\d{1,2}(?:\.\d{2})?)\b/,
    /\b(0x[0-9A-Fa-f]{2,4})\b/,
    /\b(C\d{3,4})\b/i,
    /\[([A-Za-z0-9._-]{3,16})\]/,
  ];

  for (const regex of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  const cleanFallback = (fallbackCode || '').trim();
  if (cleanFallback && !/^\d+$/.test(cleanFallback)) {
    return cleanFallback;
  }
  return cleanFallback ? `TRIG-${cleanFallback}` : 'RAW_CODE_UNSPECIFIED';
}

export function detectSubsystemFromTrigger(triggerName: string): string {
  const text = (triggerName || '').toLowerCase();
  if (text.includes('fuser') || text.includes('sấy') || text.includes('fixing') || text.includes('nhiệt')) return 'FUS';
  if (text.includes('drum') || text.includes('trống') || text.includes('opc')) return 'DRM';
  if (text.includes('laser') || text.includes('polygon') || text.includes('quang')) return 'OPT';
  if (text.includes('scanner') || text.includes('adf') || text.includes('quét') || text.includes('bản gốc')) return 'SCN';
  if (text.includes('paper') || text.includes('feed') || text.includes('kẹt') || text.includes('khay') || text.includes('roller')) return 'FED';
  if (text.includes('toner') || text.includes('mực') || text.includes('cartridge')) return 'TNR';
  if (text.includes('transfer') || text.includes('băng tải') || text.includes('belt')) return 'TRN';
  if (text.includes('power') || text.includes('nguồn') || text.includes('volt')) return 'PWR';
  if (text.includes('net') || text.includes('lan') || text.includes('ping') || text.includes('snmp')) return 'NET';
  return 'UNK';
}

export function mapZabbixSeverity(severityNum: number): 'Critical' | 'Warning' | 'Info' {
  if (severityNum >= 4) return 'Critical';
  if (severityNum >= 2) return 'Warning';
  return 'Info';
}

/**
 * Phân loại lỗi phần cứng đối chiếu trực tiếp với bảng `ErrorDictionary` từ PostgreSQL.
 * Không dùng bảng gán cứng để đảm bảo khi gỡ CSV khỏi CSDL thì mọi mã lỗi đều chuyển về trạng thái chờ tích hợp CSV.
 */
export function classifyWithDbDictionary(
  rawCodeInput: string,
  vendor: string,
  triggerName: string,
  zabbixSeverity: number,
  dbDictionary: DbErrorDictEntry[]
): ClassifiedErrorCode {
  const extractedCode = extractRawErrorCodeFromTrigger(triggerName, rawCodeInput);
  const vKey = normalizeVendorKey(vendor);
  const cKey = normalizeRawCodeKey(extractedCode);

  const matched =
    dbDictionary.find(
      (d) => normalizeVendorKey(d.vendor) === vKey && normalizeRawCodeKey(d.rawCode) === cKey
    ) ||
    dbDictionary.find(
      (d) => normalizeVendorKey(d.vendor) === 'general' && normalizeRawCodeKey(d.rawCode) === cKey
    );

  if (matched) {
    const mappedSev: 'Critical' | 'Warning' | 'Info' =
      matched.severity.toLowerCase() === 'critical'
        ? 'Critical'
        : matched.severity.toLowerCase() === 'info'
        ? 'Info'
        : 'Warning';
    return {
      internalCode: matched.canonicalCode,
      canonicalCode: matched.canonicalCode,
      subsystem: matched.subsystem,
      rawVendorCode: extractedCode,
      errorCode: extractedCode,
      severity: mappedSev,
      isMapped: true,
      needsMappingReview: false,
      descriptionVi: matched.descriptionVi,
    };
  }

  const detectedSubsystem = detectSubsystemFromTrigger(triggerName);
  const fallbackCode = 'FM-UNK-01';

  return {
    internalCode: fallbackCode,
    canonicalCode: fallbackCode,
    subsystem: detectedSubsystem,
    rawVendorCode: extractedCode,
    errorCode: extractedCode,
    severity: mapZabbixSeverity(zabbixSeverity),
    isMapped: false,
    needsMappingReview: true,
    descriptionVi: `Lỗi phần cứng ${vendor || 'Thiết bị'} chưa tích hợp CSV (${extractedCode} — ${triggerName})`,
  };
}

export function classifyHardwareError(
  rawCode: string,
  vendor: string,
  triggerName: string,
  zabbixSeverity: number
): ClassifiedErrorCode {
  const cleanVendor = (vendor || 'RICOH').toUpperCase();
  const cleanCode = (rawCode || '').trim();
  const key = `${cleanVendor}_${cleanCode}`;

  const known = KNOWN_ERROR_MAPPINGS[key];
  if (known) {
    return {
      internalCode: known.internalCode,
      canonicalCode: known.internalCode,
      subsystem: known.subsystem,
      rawVendorCode: cleanCode,
      errorCode: cleanCode,
      severity: known.severity,
      isMapped: true,
      needsMappingReview: false,
      descriptionVi: known.descriptionVi,
    };
  }

  const detectedSubsystem = detectSubsystemFromTrigger(triggerName);
  const fallbackCode = detectedSubsystem !== 'UNK' ? `FM-${detectedSubsystem}-99` : 'FM-UNK-01';
  const finalRaw = cleanCode || 'RAW_CODE_UNSPECIFIED';

  return {
    internalCode: fallbackCode,
    canonicalCode: fallbackCode,
    subsystem: detectedSubsystem,
    rawVendorCode: finalRaw,
    errorCode: finalRaw,
    severity: mapZabbixSeverity(zabbixSeverity),
    isMapped: false,
    needsMappingReview: true,
    descriptionVi: `Lỗi phần cứng ${vendor} chưa ánh xạ (${cleanCode || triggerName})`,
  };
}
