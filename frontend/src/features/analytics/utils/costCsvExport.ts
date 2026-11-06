/**
 * Frontend/src/features/analytics/utils/costCsvExport.ts
 *
 * Tiện ích xuất báo cáo phân bổ chi phí và SLA hạm đội ra file CSV UTF-8 BOM.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { toast } from 'sonner';
import { DepartmentCostAllocationItem } from '@/types/analyticsUI';

export function exportCostAllocationToCsv(
  departments: DepartmentCostAllocationItem[],
  fileName = 'bao_cao_chi_phi_sla_fleetmonitor.csv'
): void {
  const headers = [
    'Phòng Ban',
    'Trang In Đen Trắng (Mono)',
    'Trang In Màu (Color)',
    'Tổng Trang In',
    'Tỷ Trọng (%)',
    'Tổng Chi Phí (VNĐ)',
  ];

  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = departments.map((d) => {
    const totalPages = (d.monoPages || 0) + (d.colorPages || 0);
    return [
      escapeCsv(d.departmentName),
      escapeCsv(d.monoPages),
      escapeCsv(d.colorPages),
      escapeCsv(totalPages),
      escapeCsv(d.percentageShare),
      escapeCsv(d.totalCost),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success('Đã xuất báo cáo chi phí SLA ra tệp CSV thành công');
}
