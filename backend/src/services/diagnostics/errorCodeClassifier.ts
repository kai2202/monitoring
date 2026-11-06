/**
 * Backend/src/services/diagnostics/errorCodeClassifier.ts
 *
 * Bộ Phân Loại Lỗi Phần Cứng & Fallback Engine (TASK-BE-02):
 * - Chuẩn hóa mã lỗi đa hãng (Ricoh, Canon, HP, Brother, Epson) sang FM-<SUBSYSTEM>-<INDEX>.
 * - Cơ chế Fallback FM-UNK-01 bảo toàn rawVendorCode và đánh dấu needsMappingReview: true.
 * - Tuân thủ AGENTS.md Rule 6 & Rule 7.1 (< 300 LOC).
 */

export interface ClassifiedErrorCode {
  internalCode: string;       // FM-<SUBSYSTEM>-<INDEX> hoặc FM-UNK-01
  subsystem: string;          // FUS, OPT, SCN, FED, DRM, DEV, TNR, TRN, PWR, NET, UNK
  rawVendorCode: string;      // SC542, E000-0001, 50.1, 13.00.00...
  severity: 'Critical' | 'Warning' | 'Info';
  isMapped: boolean;
  needsMappingReview: boolean;
  descriptionVi: string;
}

// Bảng từ điển mã lỗi chuẩn nội bộ cơ sở (In-memory Knowledge Base)
const KNOWN_ERROR_MAPPINGS: Record<string, { internalCode: string; subsystem: string; severity: 'Critical' | 'Warning' | 'Info'; descriptionVi: string }> = {
  'RICOH_SC542': { internalCode: 'FM-FUS-01', subsystem: 'FUS', severity: 'Critical', descriptionVi: 'Lỗi nhiệt độ khối sấy Fuser không đạt chuẩn trong thời gian quy định' },
  'RICOH_SC396': { internalCode: 'FM-DRM-01', subsystem: 'DRM', severity: 'Critical', descriptionVi: 'Động cơ trống quang học Drum bị kẹt hoặc quá tải cơ học' },
  'CANON_E000-0001': { internalCode: 'FM-FUS-02', subsystem: 'FUS', severity: 'Critical', descriptionVi: 'Bộ sấy không gia nhiệt đạt nhiệt độ hoạt động tiêu chuẩn' },
  'CANON_E014-0000': { internalCode: 'FM-DRM-02', subsystem: 'DRM', severity: 'Critical', descriptionVi: 'Động cơ chính Main Motor bị lỗi hoặc đứt kết nối cáp' },
  'HP_50.1': { internalCode: 'FM-FUS-03', subsystem: 'FUS', severity: 'Critical', descriptionVi: 'Cụm sấy nhiệt độ thấp hơn ngưỡng vận hành an toàn' },
  'HP_13.00.00': { internalCode: 'FM-FED-01', subsystem: 'FED', severity: 'Warning', descriptionVi: 'Kẹt giấy khay chính hoặc đường dẫn giấy nội bộ' },
  'EPSON_000021': { internalCode: 'FM-OPT-01', subsystem: 'OPT', severity: 'Critical', descriptionVi: 'Đầu kim / cụm đầu phun bị vướng vật cản không thể di chuyển' },
};

export function detectSubsystemFromTrigger(triggerName: string): string {
  const text = triggerName.toLowerCase();
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
  if (severityNum >= 4) return 'Critical'; // High / Disaster
  if (severityNum >= 2) return 'Warning';  // Warning / Average
  return 'Info';                           // Information
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

  // 1. Tra cứu trong bảng mã lỗi đã biết
  const known = KNOWN_ERROR_MAPPINGS[key];
  if (known) {
    return {
      internalCode: known.internalCode,
      subsystem: known.subsystem,
      rawVendorCode: cleanCode,
      severity: known.severity,
      isMapped: true,
      needsMappingReview: false,
      descriptionVi: known.descriptionVi,
    };
  }

  // 2. Fallback Engine: Tự động đoán Subsystem từ Trigger & bảo toàn rawVendorCode
  const detectedSubsystem = detectSubsystemFromTrigger(triggerName);
  const fallbackCode = detectedSubsystem !== 'UNK' ? `FM-${detectedSubsystem}-99` : 'FM-UNK-01';

  return {
    internalCode: fallbackCode,
    subsystem: detectedSubsystem,
    rawVendorCode: cleanCode || 'RAW_CODE_UNSPECIFIED',
    severity: mapZabbixSeverity(zabbixSeverity),
    isMapped: false,
    needsMappingReview: true, // Đưa vào hàng đợi kiểm duyệt tại /settings
    descriptionVi: `Lỗi phần cứng ${vendor} chưa ánh xạ (${cleanCode || triggerName})`,
  };
}
