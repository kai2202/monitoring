/**
 * frontend/src/diagnostics/vendors/canon.ts
 *
 * Từ điển chẩn đoán mã lỗi dòng máy in Canon (imageRUNNER ADVANCE, LBP).
 */

import { VendorDiagnosticCatalog } from '../types';

export const CANON_CATALOG: VendorDiagnosticCatalog = {
  vendorName: 'Canon',
  rules: [
    {
      pattern: /E00[0-4]/i,
      code: 'E000-E004',
      name: 'Lỗi nhiệt độ cụm sấy máy in Canon (Fixing Assembly Error)',
      description: 'Nhiệt độ nung của cụm sấy không tăng lên trong thời gian quy định hoặc cảm biến nhiệt phát hiện nhiệt độ quá mức an toàn.',
      subsystem: 'Cụm sấy (Fixing Assembly) / Thanh gia nhiệt Film',
      severity: 'Critical',
    },
    {
      pattern: /E01[0-4]/i,
      code: 'E010-E014',
      name: 'Lỗi động cơ truyền động chính hoặc động cơ sấy Canon',
      description: 'Bộ cảm biến tốc độ động cơ chính (Main Motor) hoặc động cơ sấy không phát hiện tín hiệu đồng hồ quay.',
      subsystem: 'Động cơ chính (Main Motor) / Cụm nhông truyền lực',
      severity: 'Critical',
    },
    {
      pattern: /E1[0-1]0/i,
      code: 'E100-E110',
      name: 'Lỗi cụm quang hoặc gương xoay đa giác Laser Canon',
      description: 'Tia phát quang laser hoặc motor gương đa giác polygon không đạt xung đồng bộ ban đầu.',
      subsystem: 'Khối phát Laser / Motor đa giác',
      severity: 'Critical',
    },
    {
      pattern: /E73[0-3]/i,
      code: 'E730-E733',
      name: 'Lỗi giao tiếp bo mạng PDL / Bo điều khiển trung tâm Canon',
      description: 'Lỗi truyền dữ liệu nội bộ giữa bo điều khiển chính và bo xử lý lệnh in mạng.',
      subsystem: 'Bo mạng PDL / Bo Controller Canon',
      severity: 'Critical',
    },
  ],
};
