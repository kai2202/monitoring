/**
 * Frontend/src/features/settings/utils/errorDictionaryFilterHelper.ts
 *
 * Hàm Tiện Ích Lọc & Tìm Kiếm Đa Tiêu Chí Cho Từ Điển Mã Lỗi Phần Cứng:
 * - Tra cứu đa từ khóa (tokenized multi-term search): AND giữa các từ, OR giữa các trường.
 * - Hỗ trợ lọc kết hợp Hãng, Mức độ nghiêm trọng (Severity) và Khối linh kiện (Subsystem).
 * - Tính toán số lượng bộ lọc đang kích hoạt & trích xuất danh sách khối linh kiện.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { PrinterErrorCode } from '@/types/api';

export const SUBSYSTEM_LABELS: Record<string, string> = {
  all: 'Tất cả khối linh kiện',
  Fuser: 'Bộ sấy (Fuser)',
  Scanner_ADF: 'Quang học / Quét ADF',
  Paper_Feed: 'Nạp & Kẹt giấy (Paper Feed)',
  Laser_Optics: 'Laser & Gương đa giác',
  Controller_Board: 'Bo mạch & Động cơ',
  General: 'Khác / Hệ thống chung',
};

/**
 * Trích xuất danh sách các khối linh kiện duy nhất xuất hiện trong dữ liệu mã lỗi
 */
export function extractAvailableSubsystems(errors: PrinterErrorCode[]): string[] {
  const set = new Set<string>();
  errors.forEach((e) => {
    const sub = e.affectedSubsystem || (e as any).subsystem;
    if (sub) set.add(sub);
  });
  return Array.from(set);
}

/**
 * Đếm số lượng tiêu chí lọc đang được áp dụng
 */
export function countActiveFilters(
  searchQuery: string,
  vendorFilter: string,
  severityFilter: string,
  subsystemFilter: string
): number {
  let count = 0;
  if (searchQuery.trim().length > 0) count++;
  if (vendorFilter !== 'all') count++;
  if (severityFilter !== 'all') count++;
  if (subsystemFilter !== 'all') count++;
  return count;
}

/**
 * Bộ lọc đa tiêu chí chuẩn xác cho từ điển mã lỗi phần cứng
 */
export function filterErrorDictionary(
  errors: PrinterErrorCode[],
  searchQuery: string,
  vendorFilter: string,
  severityFilter: string,
  subsystemFilter: string
): PrinterErrorCode[] {
  const q = searchQuery.toLowerCase().trim();
  const tokens = q ? q.split(/\s+/).filter(Boolean) : [];

  return errors.filter((item) => {
    // 1. Tìm kiếm đa từ khóa (AND giữa các token, OR giữa các trường thuộc tính)
    if (tokens.length > 0) {
      const code = (item.errorCode || (item as any).code || '').toLowerCase();
      const name = (item.errorName || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const sub = (item.affectedSubsystem || (item as any).subsystem || '').toLowerCase();
      const subLabel = (SUBSYSTEM_LABELS[item.affectedSubsystem] || '').toLowerCase();
      const vendor = (item.vendor || '').toLowerCase();

      const combinedText = `${code} ${name} ${desc} ${sub} ${subLabel} ${vendor}`;
      const matchAllTokens = tokens.every((token) => combinedText.includes(token));
      if (!matchAllTokens) return false;
    }

    // 2. Lọc theo hãng sản xuất (AND)
    if (vendorFilter !== 'all' && item.vendor.toLowerCase() !== vendorFilter.toLowerCase()) {
      return false;
    }

    // 3. Lọc theo mức độ nghiêm trọng (AND)
    if (severityFilter !== 'all' && item.severity.toLowerCase() !== severityFilter.toLowerCase()) {
      return false;
    }

    // 4. Lọc theo khối linh kiện phần cứng (AND)
    if (subsystemFilter !== 'all') {
      const itemSub = (item.affectedSubsystem || (item as any).subsystem || '').toLowerCase();
      if (itemSub !== subsystemFilter.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}

