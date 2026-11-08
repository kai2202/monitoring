/**
 * Frontend/src/features/printers/hooks/usePrinterModals.ts
 *
 * Custom Hook điều phối các cửa sổ modal & drawer chẩn đoán của Phân hệ Máy in:
 * - Khai báo máy in mới (Create Modal)
 * - Chỉnh sửa thông tin cấu hình (Edit Modal)
 * - Điều chuyển vị trí / phòng ban (Relocate Modal)
 * - Quản lý danh mục trụ sở & tầng (Branch Floor Manager Modal)
 * - Slide-over Diagnostics Drawer
 * - Xử lý ngưng giám sát (Storage) & Khôi phục giám sát (Active)
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Printer } from '@/types/printer';
import { printerService } from '@/services';

export function usePrinterModals(onDataRefresh: () => void) {
  // Modal states
  const [isCreatePrinterOpen, setIsCreatePrinterOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [relocatePrinter, setRelocatePrinter] = useState<Printer | null>(null);
  const [isRelocateModalOpen, setIsRelocateModalOpen] = useState(false);
  const [isBranchManagerOpen, setIsBranchManagerOpen] = useState(false);

  // Drawer states
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerInitialTab, setDrawerInitialTab] = useState<'diag' | 'tasks' | 'counters'>('diag');
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  const handleOpenDrawer = useCallback(
    (printer: Printer, tab: 'diag' | 'tasks' | 'counters' = 'diag', taskId?: string) => {
      setSelectedPrinter(printer);
      setDrawerInitialTab(tab);
      setSelectedTaskId(taskId);
      setIsDrawerOpen(true);
    },
    []
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedTaskId(undefined);
    onDataRefresh();
  }, [onDataRefresh]);

  const handleOpenRelocate = useCallback((printer: Printer) => {
    setRelocatePrinter(printer);
    setIsRelocateModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((printer: Printer) => {
    setEditingPrinter(printer);
    setIsEditModalOpen(true);
  }, []);

  const handleDecommissionPrinter = useCallback(
    async (printer: Printer) => {
      try {
        await printerService.updatePrinter(printer.id, { monitoringStatus: 'Storage' });
        toast.success(`Đã chuyển máy in ${printer.name} (${printer.id}) sang trạng thái Lưu kho.`);
        onDataRefresh();
      } catch (err) {
        toast.error('Lỗi khi ngưng giám sát thiết bị.');
        console.error(err);
      }
    },
    [onDataRefresh]
  );

  const handleReactivatePrinter = useCallback(
    async (printer: Printer) => {
      try {
        await printerService.updatePrinter(printer.id, { monitoringStatus: 'Active' });
        toast.success(`Đã khôi phục giám sát máy in ${printer.name} (${printer.id}) thành công.`);
        onDataRefresh();
      } catch (err) {
        toast.error('Lỗi khi khôi phục giám sát thiết bị.');
        console.error(err);
      }
    },
    [onDataRefresh]
  );

  return {
    // Modals
    isCreatePrinterOpen,
    setIsCreatePrinterOpen,
    editingPrinter,
    setEditingPrinter,
    isEditModalOpen,
    setIsEditModalOpen,
    relocatePrinter,
    setIsRelocateModalOpen,
    isRelocateModalOpen,
    isBranchManagerOpen,
    setIsBranchManagerOpen,
    handleOpenRelocate,
    handleOpenEdit,
    // Drawer
    selectedPrinter,
    isDrawerOpen,
    drawerInitialTab,
    selectedTaskId,
    handleOpenDrawer,
    handleCloseDrawer,
    // Actions
    handleDecommissionPrinter,
    handleReactivatePrinter,
  };
}

