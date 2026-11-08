/**
 * Frontend/src/features/inventory/pages/InventoryPage.tsx
 *
 * Màn hình Quản Lý Kho Vật Tư & Linh Kiện Dự Phòng (Bento Grid UI):
 * - Theo dõi tồn kho thực tế, cảnh báo ngưỡng an toàn, xuất nhập kho theo Task.
 * - Tuân thủ AGENTS.md Rule 4, Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { toast } from 'sonner';
import { FontAwesomeIcon, faPlus } from '../../../shared/icons';
import { useGetInventoryItemsQuery, useCreateStockTransactionMutation } from '../slices/inventoryApiSlice';
import { InventoryStatsCards } from '../components/InventoryStatsCards';
import { InventoryTable } from '../components/InventoryTable';
import { StockTransactionModal } from '../components/StockTransactionModal';
import { InventoryItem, CreateStockTransactionDto } from '../types';

export const InventoryPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role || 'ADMIN';
  const isFieldTech = role === 'FIELD_TECH' || role === 'FIELD_TECHNICIAN';
  const canViewCost = !isFieldTech; // KTV bị ẩn chi phí VNĐ theo quy định

  const { data: response, isLoading, refetch } = useGetInventoryItemsQuery();
  const [createTransaction] = useCreateStockTransactionMutation();

  const items: InventoryItem[] = response?.data || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleOpenModal = (item?: InventoryItem) => {
    setSelectedItem(item || null);
    setIsModalOpen(true);
  };

  const handleTransactionSubmit = async (dto: CreateStockTransactionDto) => {
    try {
      await createTransaction(dto).unwrap();
      toast.success(
        dto.type === 'EXPORT'
          ? `Đã xuất kho thành công ${dto.quantity} linh kiện!`
          : `Đã nhập kho thành công ${dto.quantity} linh kiện!`
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || 'Không thể ghi nhận giao dịch kho.');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black text-sky-600 uppercase tracking-widest">
            HẠ TẦNG VẬN HÀNH &amp; KHO VẬN TẬP TRUNG
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Quản Lý Kho Vật Tư &amp; Linh Kiện<span className="text-sky-600">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Theo dõi tồn kho thực tế, cảnh báo cạn kiệt và luân chuyển linh kiện cho Kỹ thuật viên hiện trường.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Tạo Phiếu Xuất / Nhập Kho</span>
          </button>
        </div>
      </div>

      {/* 2. Thẻ Thống Kê KPI Bento */}
      <InventoryStatsCards items={items} isLoading={isLoading} />

      {/* 3. Bảng Danh Mục Vật Tư */}
      <InventoryTable
        items={items}
        isLoading={isLoading}
        canViewCost={canViewCost}
        onOpenTransactionModal={handleOpenModal}
      />

      {/* 4. Modal Xuất Nhập Kho */}
      <StockTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedItem={selectedItem}
        items={items}
        onSubmit={handleTransactionSubmit}
      />
    </div>
  );
};

export default InventoryPage;

