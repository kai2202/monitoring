/**
 * src/utils/formatDate.ts
 *
 * Tiện ích chuyển đổi chuỗi thời gian ISO (UTC) sang định dạng thời gian Việt Nam (GMT+7)
 * chuẩn mực, thân thiện và dễ đọc cho người dùng quản trị văn phòng.
 */

/**
 * Định dạng chuỗi thời gian sang dạng giờ:phút:giây ngày/tháng/năm theo múi giờ Việt Nam.
 * Ví dụ: "2026-10-27T01:29:48.000Z" -> "08:29:48 27/10/2026"
 *
 * @param isoString Chuỗi thời gian ISO 8601 hoặc timestamp
 * @returns Chuỗi ngày giờ tiếng Việt đã định dạng hoặc "—" nếu không có dữ liệu
 */
export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '—';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const datePart = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  const timePart = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);

  return `${timePart} ${datePart}`;
}

/**
 * Định dạng thời gian tương đối ngắn gọn (VD: "Vừa xong", "3 phút trước", "1 giờ trước").
 *
 * @param isoString Chuỗi thời gian ISO 8601
 * @returns Chuỗi tương đối hoặc ngày giờ đầy đủ nếu quá 7 ngày
 */
export function formatRelativeTime(isoString?: string | null): string {
  if (!isoString) return '—';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 0) return formatDateTime(isoString);
  if (diffSec < 45) return 'Vừa xong';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)} ngày trước`;

  return formatDateTime(isoString);
}
