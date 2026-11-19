/**
 * Frontend/src/mocks/supplies/mockSuppliesHistory.ts
 *
 * Nhật ký cấp phát & thay thế vật tư gần đây (dùng ở tab /inventory trong DATA_SOURCE === 'mock').
 * Đồng bộ printerId với danh mục 22 máy in chuẩn (prt-001..prt-022).
 */

import type { ReplenishmentLogRecord } from '../../features/analytics/components/supplies/BulkSuppliesConfirmModal';

export const mockReplenishmentLogs: ReplenishmentLogRecord[] = [
  {
    id: 'log-01',
    timestamp: '18/11/2026, 09:30',
    technician: 'Lê Hoàng Nam (KTV Hiện trường)',
    notes: 'Thay mực Đỏ (M) và hộp mực thải cho Chi nhánh Miền Nam Tầng 3 theo phiếu TSK-2026-005.',
    printers: [
      {
        printerId: 'prt-018',
        printerName: 'Canon iR C3226i - P.Hành chính MN',
        floor: 'Tầng 3',
        itemsReplaced: ['Mực Đỏ (M)', 'Hộp Mực Thải'],
      },
    ],
  },
  {
    id: 'log-02',
    timestamp: '16/11/2026, 14:15',
    technician: 'Lê Hoàng Nam (KTV Hiện trường)',
    notes: 'Thay hộp mực đen mới cho Ricoh MP 3055 Sảnh Lễ tân và bảo dưỡng định kỳ HP M608 Tầng 3.',
    printers: [
      {
        printerId: 'prt-003',
        printerName: 'Ricoh MP 3055 - Sảnh Lễ tân',
        floor: 'Tầng 1',
        itemsReplaced: ['Mực Đen (K)'],
      },
      {
        printerId: 'prt-010',
        printerName: 'HP LaserJet M608 - P.Pháp Chế',
        floor: 'Tầng 3',
        itemsReplaced: ['Vệ sinh cụm Duplex'],
      },
    ],
  },
];
