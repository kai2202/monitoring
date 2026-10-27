import { MetricValue } from '../types/printer';

/**
 * Quy đổi giá trị hộp mực thải từ Server (RFC 3805 MarkerSupplies) sang Mức độ làm đầy bình (% Fullness):
 * Server trả về % dung lượng còn trống (100% = bình rỗng hoàn toàn, 0% = đầy tràn).
 * Frontend chuẩn hóa: Mức đầy (%) = 100 - giá trị Server.
 *   - Server trả 100 -> 0% đầy (An toàn, màu Tím #8b5cf6)
 *   - Server trả 60  -> 40% đầy (An toàn, màu Tím #8b5cf6)
 *   - Server trả 20  -> 80% đầy (Cảnh báo Sắp đầy, màu Vàng #f59e0b)
 *   - Server trả 10  -> 90% đầy (Cần thay/Đầy, màu Đỏ var(--status-offline))
 *   - Server trả 0   -> 100% đầy (Cần thay/Đầy, màu Đỏ var(--status-offline))
 */
export function getWasteFullness(serverValue: MetricValue | undefined): number | null {
  if (typeof serverValue !== 'number' || isNaN(serverValue)) return null;
  return Math.min(100, Math.max(0, 100 - serverValue));
}

/**
 * Lấy dung lượng còn trống của hộp mực thải (%)
 */
export function getWasteRemainingSpace(serverValue: MetricValue | undefined): number | null {
  if (typeof serverValue !== 'number' || isNaN(serverValue)) return null;
  return Math.min(100, Math.max(0, serverValue));
}

/**
 * Kiểm tra hộp mực thải có ở mức nguy hiểm cần thay thế không (Mức đầy >= 85%, tức dung lượng trống <= 15%)
 */
export function isWasteCritical(serverValue: MetricValue | undefined): boolean {
  const fullness = getWasteFullness(serverValue);
  return fullness !== null && fullness >= 85;
}

/**
 * Kiểm tra hộp mực thải có ở mức cảnh báo sắp đầy không (65% <= Mức đầy < 85%)
 */
export function isWasteWarning(serverValue: MetricValue | undefined): boolean {
  const fullness = getWasteFullness(serverValue);
  return fullness !== null && fullness >= 65 && fullness < 85;
}

/**
 * Màu sắc thanh hiển thị cho hộp mực thải:
 * - Mức đầy < 65%: Màu tím chuẩn (#8b5cf6)
 * - Mức đầy 65% - 84%: Màu vàng cảnh báo (#f59e0b)
 * - Mức đầy >= 85%: Màu đỏ khẩn cấp (#ef4444)
 */
export function getWasteFillColor(serverValue: MetricValue | undefined, isLight = false): string {
  if (isWasteCritical(serverValue)) {
    return isLight ? '#dc2626' : '#ef4444';
  }
  if (isWasteWarning(serverValue)) {
    return isLight ? '#d97706' : '#f59e0b';
  }
  return isLight ? '#7c3aed' : '#8b5cf6';
}
