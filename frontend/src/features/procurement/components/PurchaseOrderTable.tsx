/**
 * Frontend/src/features/procurement/components/PurchaseOrderTable.tsx
 *
 * Bảng Quản Lý Đơn Hàng Mua Sắm (Purchase Orders Table):
 * - Hỗ trợ thao tác Nghiệm thu nhập kho (Receive PO) tự động cộng dồn tồn kho.
 * - Tuân thủ AGENTS.md Rule 4, Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faCheck, faClock, faBoxesStacked, faCircleCheck } from '../../../shared/icons';
import { PurchaseOrder } from '../types';

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  isLoading?: boolean;
  onReceiveOrder: (poId: string) => void;
  canApprove?: boolean;
}

export const PurchaseOrderTable: React.FC<PurchaseOrderTableProps> = ({
  orders,
  isLoading = false,
  onReceiveOrder,
  canApprove = true,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FontAwesomeIcon icon={faCircleCheck} />
            <span>Đã nhập kho</span>
          </span>
        );
      case 'ORDERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <FontAwesomeIcon icon={faBoxesStacked} />
            <span>Đang giao hàng</span>
          </span>
        );
      case 'PENDING_APPROVAL':
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <FontAwesomeIcon icon={faClock} />
            <span>Chờ phê duyệt</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Số Hiệu PO</th>
              <th className="py-3 px-4">Nhà Cung Cấp</th>
              <th className="py-3 px-4">Thời Gian Tạo</th>
              <th className="py-3 px-4 text-center">Số Mặt Hàng</th>
              <th className="py-3 px-4 text-right">Tổng Tiền (VNĐ)</th>
              <th className="py-3 px-4 text-center">Trạng Thái</th>
              <th className="py-3 px-4">Người Lập</th>
              {canApprove && <th className="py-3 px-4 text-center">Thao Tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={canApprove ? 8 : 7} className="py-8 text-center text-slate-400">
                  Đang tải danh sách đơn hàng PO...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={canApprove ? 8 : 7} className="py-8 text-center text-slate-400">
                  Chưa có đơn mua hàng nào được khởi tạo
                </td>
              </tr>
            ) : (
              orders.map((po) => {
                const itemCount = Array.isArray(po.itemsJson) ? po.itemsJson.length : 1;
                const isReceived = po.status === 'RECEIVED';
                return (
                  <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-700">{po.poNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {po.vendor?.name || 'Nhà cung cấp ủy quyền'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {po.createdAt ? new Date(po.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {itemCount} mục
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      {po.totalAmount > 0 ? `${po.totalAmount.toLocaleString('vi-VN')} đ` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(po.status)}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{po.createdBy?.fullName || 'Hệ thống'}</td>
                    {canApprove && (
                      <td className="py-3 px-4 text-center">
                        {!isReceived ? (
                          <button
                            type="button"
                            onClick={() => onReceiveOrder(po.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1.5 shadow-sm"
                            title="Xác nhận hàng đã về và cộng dồn kho vật tư"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                            <span>Nghiệm thu kho</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Đã hoàn tất</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderTable;

