/**
 * frontend/src/diagnostics/vendors/standard.ts
 *
 * Bộ quy tắc chẩn đoán chuẩn RFC 3805 (Printer-MIB) dùng chung cho mọi dòng máy in.
 */

import { VendorDiagnosticCatalog } from '../types';

export const STANDARD_CATALOG: VendorDiagnosticCatalog = {
  vendorName: 'Standard RFC',
  rules: [
    {
      pattern: /jam|kẹt giấy/i,
      code: 'JAM-GENERAL',
      name: 'Kẹt giấy trong máy in (Paper Jam)',
      description: 'Giấy in bị kẹt lại trên đường đi, bộ đảo mặt duplex hoặc cụm sấy khiến máy tạm dừng hoạt động.',
      subsystem: 'Cơ cấu chuyển giấy (Paper Transport / Duplex)',
      actionGuidance: 'Mở nắp hông hoặc cửa trước máy in theo chỉ dẫn, cẩn thận kéo giấy bị kẹt theo chiều cuốn ra ngoài và đóng chặt cửa.',
      severity: 'Critical',
    },
    {
      pattern: /no paper|out of paper|paper empty|add paper|load paper|paper missing|thiếu giấy|hết giấy|nạp giấy/i,
      code: 'PAPER-EMPTY',
      name: 'Hết giấy in trong khay nạp (Out of Paper)',
      description: 'Cảm biến phát hiện khay nạp giấy đang rỗng hoặc cữ chặn giấy chưa gài khít khổ giấy yêu cầu.',
      subsystem: 'Khay nạp giấy (Paper Feed Tray)',
      actionGuidance: 'Kéo khay nạp ra, nạp thêm giấy in đúng khổ quy định và căn chỉnh thanh gạt vừa sát mép giấy.',
      severity: 'Warning',
    },
    {
      pattern: /cover open|door open|interlock open|mở cửa|mở nắp/i,
      code: 'DOOR-OPEN',
      name: 'Cửa hoặc nắp máy in đang mở (Cover Open)',
      description: 'Công tắc an toàn (Interlock Switch) phát hiện cửa trước, cửa hông hoặc nắp khay nạp ADF chưa được đóng chặt.',
      subsystem: 'Công tắc nắp cửa (Interlock Switch)',
      actionGuidance: 'Kiểm tra và đóng chặt tất cả các cửa hông, cửa trước và nắp dàn quét của máy in.',
      severity: 'Critical',
    },
    {
      pattern: /toner empty|cartridge empty|hết mực|cạn mực/i,
      code: 'TONER-EMPTY',
      name: 'Hộp mực in đã cạn (Toner Empty)',
      description: 'Cảm biến nồng độ mực phát hiện bình mực in đã hết hoàn toàn, máy in tạm dừng để tránh hại cụm từ.',
      subsystem: 'Hộp mực in (Toner Cartridge)',
      actionGuidance: 'Mở cửa trước máy in, tháo bình mực rỗng và lắp bình mực mới đúng màu tương ứng (K, C, M, Y).',
      severity: 'Warning',
    },
    {
      pattern: /toner low|sắp hết mực/i,
      code: 'TONER-LOW',
      name: 'Mực in sắp hết (Toner Low)',
      description: 'Lượng mực trong bình còn dưới 15%, cần chuẩn bị sẵn hộp mực mới dự phòng.',
      subsystem: 'Hộp mực in (Toner Cartridge)',
      actionGuidance: 'Chuẩn bị sẵn hộp mực mới để thay thế ngay khi máy hết mực.',
      severity: 'Warning',
    },
    {
      pattern: /waste.*full|mực thải đầy/i,
      code: 'WASTE-FULL',
      name: 'Hộp mực thải đã đầy (Waste Toner Box Full)',
      description: 'Cảm biến quang phát hiện hộp chứa mực thải đã đầy, cần thay mới để tránh tràn mực ra máy.',
      subsystem: 'Hộp mực thải (Waste Toner Container)',
      actionGuidance: 'Mở nắp hộc chứa, cẩn thận lấy hộp mực thải đã đầy ra cho vào túi ni-lông và lắp hộp mực thải mới vào.',
      severity: 'Warning',
    },
    {
      pattern: /icmp|unreachable|ngoại tuyến|offline/i,
      code: 'NET-OFFLINE',
      name: 'Thiết bị mất kết nối mạng (Device Offline)',
      description: 'Máy chủ giám sát không nhận được phản hồi gói tin ICMP Ping hoặc truy vấn SNMP từ địa chỉ IP của máy in.',
      subsystem: 'Card mạng (NIC) / Hạ tầng mạng LAN',
      actionGuidance: '1. Kiểm tra máy in đã bật công tắc nguồn chưa.\n2. Kiểm tra dây cáp mạng LAN cắm phía sau máy và cổng switch mạng.\n3. Kiểm tra xem địa chỉ IP máy in có bị xung đột mạng không.',
      severity: 'Critical',
    },
  ],
};
