/**
 * Frontend/src/features/procurement/slices/procurementApiSlice.ts
 *
 * RTK Query API Slice cho Quy trình Mua sắm & Đơn hàng PO (TASK-BE-10):
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { baseApi } from '../../../app/api/baseApi';
import {
  ProcurementRequest,
  PurchaseOrder,
  CreateProcurementRequestDto,
  CreatePurchaseOrderDto,
} from '../types';

export const procurementApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProcurementRequests: builder.query<{ success: boolean; data: ProcurementRequest[]; count: number }, void>({
      query: () => '/v1/procurement/requests',
      providesTags: ['Procurement'],
    }),
    createProcurementRequest: builder.mutation<any, CreateProcurementRequestDto>({
      query: (body) => ({
        url: '/v1/procurement/requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Procurement'],
    }),
    getPurchaseOrders: builder.query<{ success: boolean; data: PurchaseOrder[]; count: number }, void>({
      query: () => '/v1/procurement/orders',
      providesTags: ['Procurement'],
    }),
    createPurchaseOrder: builder.mutation<any, CreatePurchaseOrderDto>({
      query: (body) => ({
        url: '/v1/procurement/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Procurement'],
    }),
    receivePurchaseOrder: builder.mutation<any, string>({
      query: (poId) => ({
        url: `/v1/procurement/orders/${poId}/receive`,
        method: 'POST',
      }),
      invalidatesTags: ['Procurement', 'Inventory'],
    }),
  }),
});

export const {
  useGetProcurementRequestsQuery,
  useCreateProcurementRequestMutation,
  useGetPurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
} = procurementApiSlice;

