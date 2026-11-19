/**
 * Frontend/src/features/analytics/utils/costCsvExport.ts
 *
 * Tiện ích xuất báo cáo phân bổ chi phí sửa chữa & vật tư theo Tầng / Quản lý ra file CSV UTF-8 BOM.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { toast } from 'sonner';
import { DepartmentCostAllocationItem } from '@/types/analyticsUI';

export function exportCostAllocationToCsv(
  departments: DepartmentCostAllocationItem[],
  fileName = 'bao_cao_chi_phi_sla_fleetmonitor.csv'
): void {
  const headers = [
    'Tầng / Khu Vực',
    'Người Quản Lý Đại Diện',
    'Chi Phí Sửa Chữa (VNĐ)',
    'Chi Phí Vật Tư & Khác (VNĐ)',
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
    const repairCost = d.repairCost ?? '';
    const suppliesAndOther =
      d.suppliesCost !== undefined || d.otherCost !== undefined
        ? (d.suppliesCost ?? 0) + (d.otherCost ?? 0)
        : '';
    return [
      escapeCsv(d.floorName || d.departmentName),
      escapeCsv(d.managerName || '—'),
      escapeCsv(repairCost),
      escapeCsv(suppliesAndOther),
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
