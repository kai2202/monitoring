/**
 * Frontend/src/features/printers/utils/printerCsvExport.ts
 *
 * Tiện ích xuất danh mục máy in ra tệp CSV kiểm kê tài sản:
 * - Chuẩn hóa UTF-8 BOM để Excel hiển thị tiếng Việt có dấu hoàn hảo.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { Printer } from '../../../types/printer';

export function exportPrintersToCsv(printers: Printer[]): void {
  if (!printers || printers.length === 0) return;

  const headers = [
    'Mã thiết bị',
    'Tên máy in',
    'Địa chỉ IP',
    'Hãng sản xuất',
    'Model',
    'Số Serial',
    'Trụ sở / Chi nhánh',
    'Tầng',
    'Phòng ban',
    'Loại máy in',
    'Trạng thái kết nối',
    'Sức khỏe phần cứng',
    'Trạng thái quản lý',
    'Mực K (%)',
    'Mực C (%)',
    'Mực M (%)',
    'Mực Y (%)',
    'Tổng sản lượng (Counter)',
  ];

  const rows = printers.map((p) => [
    `"${p.id}"`,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.ip}"`,
    `"${p.mfr}"`,
    `"${p.model}"`,
    `"${p.serial || ''}"`,
    `"${p.branch || ''}"`,
    `"${p.floor || ''}"`,
    `"${p.department || ''}"`,
    `"${p.deviceType}"`,
    `"${p.connectionStatus}"`,
    `"${p.health}"`,
    `"${p.monitoringStatus || 'Active'}"`,
    p.supplies.black ?? '—',
    p.supplies.cyan ?? '—',
    p.supplies.magenta ?? '—',
    p.supplies.yellow ?? '—',
    p.counters.total ?? '—',
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fleetmonitor-danh-muc-may-in-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

