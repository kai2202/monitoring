/**
 * Frontend/src/features/analytics/components/sla/SLACostSection.tsx
 *
 * Tab 3: Hiệu suất SLA & Chi phí (/analytics/sla-cost):
 * - Hàng 1: 3 Thẻ KPI SLA (Uptime SLA, MTBF, MTTR).
 * - Hàng 2: LemonDeviceRankingCard + Modal Chi Tiết Máy & Modal Đề Xuất Thay Thế.
 * - Hàng 3: RecurringErrorsTable (tìm kiếm, lọc, sort, phân trang) + RecurringErrorDetailDrawer.
 * - Hàng 4: SLAIncidentHeatmapMatrix.
 */

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { SLACostAnalyticsResponse, LemonPrinterItem, RecurringErrorItem } from '@/types/api';
import { taskService } from '@/services';
import { SLAKpiCards } from './SLAKpiCards';
import { CostHealthBar, CostHealthFilterMode } from './CostHealthBar';
import { DepartmentCostBreakdown } from './DepartmentCostBreakdown';
import { LemonDeviceRankingCard } from './LemonDeviceRankingCard';
import { LemonDeviceDetailModal } from './LemonDeviceDetailModal';
import { LemonReplacementModal, ReplacementProposalPayload } from './LemonReplacementModal';
import { RecurringErrorsTable } from './RecurringErrorsTable';

export interface SLACostSectionProps {
  hideHeader?: boolean;
  slaCostData?: SLACostAnalyticsResponse | null;
  onOpenTask?: (taskId: string) => void;
}

export const SLACostSection: React.FC<SLACostSectionProps> = ({
  hideHeader = false,
  slaCostData,
  onOpenTask,
}) => {
  const [detailPrinter, setDetailPrinter] = useState<LemonPrinterItem | null>(null);
  const [replacementPrinter, setReplacementPrinter] = useState<LemonPrinterItem | null>(null);
  const [costFilter, setCostFilter] = useState<CostHealthFilterMode>('all');

  const effectiveData = slaCostData;
  const kpis = effectiveData?.kpis;
  const departmentCosts = useMemo(() => effectiveData?.departmentCosts || [], [effectiveData]);
  const lemonPrinters = useMemo(() => effectiveData?.lemonPrinters || [], [effectiveData]);

  const handleSelectPrinter = (printerId: string) => {
    const found = lemonPrinters.find((p) => p.printerId === printerId) || null;
    if (found) setDetailPrinter(found);
  };

  const handleSubmitReplacementProposal = (payload: ReplacementProposalPayload) => {
    const actionLabels = {
      replace_new: 'Đề xuất Vendor đổi máy',
      relocate_backup: 'Điều chuyển máy dự phòng',
      major_overhaul: 'Sửa chữa / Đại tu phát sinh',
    };
    taskService.createTask(
      {
        title: `Đề xuất ${actionLabels[payload.actionType]}: ${payload.printer.name}`,
        description: `Thiết bị phát sinh ${payload.printer.incidentCount} sự cố (tổng chi phí sửa chữa ${payload.printer.totalRepairCostVnd.toLocaleString('vi-VN')} đ). Ngân sách dự kiến: ${payload.estimatedBudgetVnd} đ. ${payload.notes ? `Ghi chú: ${payload.notes}` : ''}`,
        taskType: 'HARDWARE_INSPECTION',
        priority: payload.priority,
        assignee: payload.printer.custodianName || 'Quản lý tài sản & NOC',
        dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
        printerId: payload.printer.printerId,
        printerName: payload.printer.name,
        location: `${payload.printer.floor} - ${payload.printer.department}`,
        status: 'Planned',
      },
      payload.printer.custodianName || 'Quản lý NOC'
    );
    toast.success(`Đã gửi đề xuất thay thế cho ${payload.printer.name}`);
  };

  const handleCreatePreventiveTask = (err: RecurringErrorItem) => {
    const topPrinter = err.topAffectedPrinters[0];
    taskService.createTask(
      {
        title: `Kiểm tra lỗi lặp lại [${err.vendor} ${err.errorCode}]`,
        description: `${err.vietnameseDesc} (đã lặp ${err.occurrenceCount} lần). ${err.actionGuidance || ''}`,
        taskType: 'PREVENTIVE_MAINTENANCE',
        priority: err.severity === 'critical' ? 'P1_Urgent' : 'P2_High',
        assignee: 'Kỹ thuật viên NOC',
        dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
        printerId: topPrinter?.printerId || 'fleet-wide',
        printerName: topPrinter?.name || 'Toàn hạm đội',
        location: 'Theo danh sách máy ảnh hưởng',
        status: 'Planned',
      },
      'Kỹ thuật viên NOC'
    );
    toast.success(`Đã tạo Task kiểm tra mã lỗi ${err.errorCode}`);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {!hideHeader && (
        <div>
          <h2 className="text-base font-bold m-0 text-slate-900 dark:text-slate-100">
            Hiệu Suất SLA &amp; Hạch Toán Chi Phí Hệ Thống Máy In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
            Phân bổ chi phí phòng ban, xếp hạng máy lỗi nhiều và mã lỗi lặp lại
          </p>
        </div>
      )}

      {/* Tầng 1: Strip KPI 3 ô phẳng */}
      <SLAKpiCards kpis={kpis} departments={departmentCosts} lemonPrinters={lemonPrinters} />

      {/* Tầng 2: Thanh phân bổ ngân sách 1 hàng (phong cách FleetHealthBar /printers) */}
      <CostHealthBar
        departments={departmentCosts}
        activeFilter={costFilter}
        onSelectFilter={setCostFilter}
      />

      {/* Tầng 3: Phân bổ chi phí theo tầng & quản lý */}
      <DepartmentCostBreakdown departments={departmentCosts} costFilter={costFilter} />

      {/* Tầng 3: Bảng Máy in lỗi nhiều & Chi phí sửa chữa */}
      <LemonDeviceRankingCard
        printers={lemonPrinters}
        onSelectPrinter={handleSelectPrinter}
        onRequestReplacement={(printer) => setReplacementPrinter(printer)}
      />

      {/* Tầng 4: Bảng Mã Lỗi Lặp Lại (Full-width) */}
      <RecurringErrorsTable
        recurringErrors={effectiveData?.recurringErrors}
        onOpenTask={onOpenTask}
        onCreatePreventiveTask={handleCreatePreventiveTask}
      />

      {/* Modals riêng của Tab SLA & Chi phí */}
      <LemonDeviceDetailModal
        printer={detailPrinter}
        isOpen={Boolean(detailPrinter)}
        onClose={() => setDetailPrinter(null)}
        onRequestReplacement={(p) => setReplacementPrinter(p)}
      />

      <LemonReplacementModal
        printer={replacementPrinter}
        isOpen={Boolean(replacementPrinter)}
        onClose={() => setReplacementPrinter(null)}
        onSubmitProposal={handleSubmitReplacementProposal}
      />
    </div>
  );
};

export default SLACostSection;
