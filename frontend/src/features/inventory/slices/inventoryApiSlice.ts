/**
 * Frontend/src/features/inventory/slices/inventoryApiSlice.ts
 *
 * RTK Query API Slice cho Quản lý Kho vật tư (TASK-BE-09):
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { baseApi } from '../../../app/api/baseApi';
import { InventoryItem, CreateStockTransactionDto } from '../types';

export const inventoryApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryItems: builder.query<{ success: boolean; data: InventoryItem[]; count: number }, void>({
      query: () => '/v1/inventory/items',
      providesTags: ['Inventory'],
    }),
    getCompatibleItems: builder.query<InventoryItem[], string>({
      query: (printerModel) => `/v1/inventory/compatibility/${encodeURIComponent(printerModel)}`,
      providesTags: ['Inventory'],
    }),
    createInventoryItem: builder.mutation<InventoryItem, Partial<InventoryItem>>({
      query: (body) => ({
        url: '/v1/inventory/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Inventory'],
    }),
    createStockTransaction: builder.mutation<any, CreateStockTransactionDto>({
      query: (body) => ({
        url: '/v1/inventory/transactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Inventory', 'Printers'],
    }),
  }),
});

export const {
  useGetInventoryItemsQuery,
  useGetCompatibleItemsQuery,
  useCreateInventoryItemMutation,
  useCreateStockTransactionMutation,
} = inventoryApiSlice;

