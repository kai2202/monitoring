/**
 * Frontend/src/features/procurement/pages/ProcurementPage.tsx
 *
 * Màn hình Quản Lý Mua Sắm & Đơn Hàng PO (Procurement Management):
 * - Theo dõi đơn đặt mua vật tư gửi nhà cung cấp, nghiệm thu nhập kho.
 * - Tuân thủ AGENTS.md Rule 4, Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { toast } from 'sonner';
import { FontAwesomeIcon, faPlus } from '../../../shared/icons';
import {
  useGetPurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
} from '../slices/procurementApiSlice';
import { ProcurementStatsCards } from '../components/ProcurementStatsCards';
import { PurchaseOrderTable } from '../components/PurchaseOrderTable';
import { CreatePurchaseOrderModal } from '../components/CreatePurchaseOrderModal';
import { PurchaseOrder, CreatePurchaseOrderDto } from '../types';

export const ProcurementPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role || 'ADMIN';
  const isFieldTech = role === 'FIELD_TECH' || role === 'FIELD_TECHNICIAN';
  const canApprove = !isFieldTech;

  const { data: response, isLoading, refetch } = useGetPurchaseOrdersQuery();
  const [createOrder] = useCreatePurchaseOrderMutation();
  const [receiveOrder] = useReceivePurchaseOrderMutation();

  const orders: PurchaseOrder[] = response?.data || [];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateOrder = async (dto: CreatePurchaseOrderDto) => {
    try {
      await createOrder(dto).unwrap();
      toast.success(`Đã tạo thành công đơn đặt hàng ${dto.poNumber}!`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || 'Không thể tạo đơn đặt mua.');
    }
  };

  const handleReceiveOrder = async (poId: string) => {
    try {
      await receiveOrder(poId).unwrap();
      toast.success('Đã nghiệm thu và tự động cộng dồn số lượng vào Kho vật tư!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || 'Không thể nghiệm thu đơn hàng.');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black text-sky-600 uppercase tracking-widest">
            QUY TRÌNH MUA SẮM &amp; ĐỐI TÁC HÃNG
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Quản Lý Đơn Đặt Mua Vật Tư (PO)<span className="text-sky-600">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Lập đơn hàng mua sắm gửi nhà cung cấp ủy quyền, phê duyệt ngân sách và xác nhận nhập kho tự động.
          </p>
        </div>

        {canApprove && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Lập Đơn Đặt Hàng PO Mới</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Thẻ Thống Kê KPI Bento */}
      <ProcurementStatsCards orders={orders} isLoading={isLoading} />

      {/* 3. Bảng Danh Sách Đơn Mua Hàng */}
      <PurchaseOrderTable
        orders={orders}
        isLoading={isLoading}
        canApprove={canApprove}
        onReceiveOrder={handleReceiveOrder}
      />

      {/* 4. Modal Lập Đơn Hàng PO Mới */}
      <CreatePurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
};

export default ProcurementPage;

