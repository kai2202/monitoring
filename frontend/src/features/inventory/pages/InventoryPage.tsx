/**
 * Frontend/src/features/inventory/pages/InventoryPage.tsx
 *
 * Màn hình Quản Lý Kho Vật Tư & Linh Kiện Dự Phòng:
 * - Strip KPI phẳng 4 ô + Segmented Control chuyển đổi [Danh mục tồn kho | Lịch sử xuất / nhập].
 * - Tuân thủ AGENTS.md Rule 4, Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { toast } from 'sonner';
import { FontAwesomeIcon, faPlus } from '../../../shared/icons';
import { analyticsService, locationService } from '../../../services';
import { SuppliesAnalyticsResponse } from '../../../types/api';
import { SuppliesForecastingSection } from '../../analytics/components/supplies';
import {
  useGetInventoryItemsQuery,
  useGetInventoryTransactionsQuery,
  useCreateStockTransactionMutation,
} from '../slices/inventoryApiSlice';
import { InventoryStatsCards } from '../components/InventoryStatsCards';
import { InventoryTable } from '../components/InventoryTable';
import { InventoryTransactionsTable } from '../components/InventoryTransactionsTable';
import { StockTransactionModal } from '../components/StockTransactionModal';
import { InventoryItem, CreateStockTransactionDto } from '../types';

export const InventoryPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const globalBranch = useSelector((state: RootState) => state.ui.selectedBranch);
  const branches = locationService.getBranchNames();
  const selectedBranch = globalBranch || (branches.length > 0 ? branches[0] : '');

  const role = user?.role || 'ADMIN';
  const isFieldTech = role === 'FIELD_TECH';
  const canViewCost = !isFieldTech;

  const { data: response, isLoading, refetch } = useGetInventoryItemsQuery();
  const {
    data: txResponse,
    isLoading: isTxLoading,
    refetch: refetchTx,
  } = useGetInventoryTransactionsQuery();
  const [createTransaction] = useCreateStockTransactionMutation();

  const items: InventoryItem[] = response?.data || [];
  const transactions = txResponse?.data || [];

  const [activeView, setActiveView] = useState<'forecast' | 'items' | 'transactions'>('forecast');
  const [suppliesData, setSuppliesData] = useState<SuppliesAnalyticsResponse | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    analyticsService
      .getSuppliesForecasting(selectedBranch)
      .then((res) => {
        if (!cancelled) setSuppliesData(res);
      })
      .catch(() => {
        if (!cancelled) setSuppliesData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBranch]);

  const handleOpenModal = (item?: InventoryItem) => {
    setSelectedItem(item || null);
    setIsModalOpen(true);
  };

  const handleDispatchTransaction = async (dto: CreateStockTransactionDto) => {
    try {
      await createTransaction(dto).unwrap();
      refetch();
      refetchTx();
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || 'Không thể trừ tồn kho tự động.');
    }
  };

  const handleTransactionSubmit = async (dto: CreateStockTransactionDto) => {
    try {
      await createTransaction(dto).unwrap();
      toast.success(
        dto.type === 'EXPORT'
          ? `Đã xuất kho thành công ${dto.quantity} linh kiện!`
          : dto.type === 'IMPORT'
          ? `Đã nhập kho thành công ${dto.quantity} linh kiện!`
          : 'Đã điều chỉnh tồn kho thành công!'
      );
      refetch();
      refetchTx();
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || 'Không thể ghi nhận giao dịch kho.');
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] w-full mx-auto">
      {/* 1. Minimalist Split Bar: Tab gạch chân bên trái & Nút Xuất/Nhập Kho bên phải */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto max-w-full">
          {[
            { id: 'forecast' as const, label: 'Dự báo & Cấp phát (D-Day)', count: null },
            { id: 'items' as const, label: 'Danh mục tồn kho', count: items.length },
            { id: 'transactions' as const, label: 'Lịch sử xuất / nhập', count: transactions.length },
          ].map((tab) => {
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold transition-colors whitespace-nowrap border-0 border-b-2 border-solid bg-transparent cursor-pointer -mb-px ${
                  isActive
                    ? 'border-b-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-b-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="pb-2 sm:pb-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs border-none cursor-pointer inline-flex items-center gap-1.5 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
            <span>Nhập kho</span>
          </button>
        </div>
      </div>

      {/* 2. Nội dung chính theo View đang chọn */}
      {activeView === 'forecast' ? (
        <SuppliesForecastingSection
          selectedBranch={selectedBranch}
          suppliesData={suppliesData}
          inventoryItems={items}
          onDispatchTransaction={handleDispatchTransaction}
        />
      ) : (
        <>
          <InventoryStatsCards
            items={items}
            isLoading={isLoading}
            lowStockOnly={lowStockOnly}
            onToggleLowStock={() => {
              setLowStockOnly((prev) => !prev);
              setActiveView('items');
            }}
          />

          {activeView === 'items' ? (
            <InventoryTable
              items={items}
              isLoading={isLoading}
              canViewCost={canViewCost}
              lowStockOnly={lowStockOnly}
              onToggleLowStock={() => setLowStockOnly((prev) => !prev)}
              onOpenTransactionModal={handleOpenModal}
            />
          ) : (
            <InventoryTransactionsTable transactions={transactions} isLoading={isTxLoading} />
          )}
        </>
      )}

      {/* 4. Modal Nhập Kho */}
      <StockTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedItem={selectedItem}
        items={items}
        importOnly
        onSubmit={handleTransactionSubmit}
      />
    </div>
  );
};

export default InventoryPage;
