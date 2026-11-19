/**
 * Frontend/src/app/api/mockBaseQuery.ts
 *
 * Mock BaseQuery cô lập dành riêng cho chế độ Mock / GitHub Pages Demo (`DATA_SOURCE === 'mock'`).
 * - Tuân thủ AGENTS.md Rule 5.1 & Rule 7.4: Chỉ kích hoạt khi `isMockSource() === true`,
 *   tuyệt đối không che giấu lỗi API trong môi trường vận hành thực (`api` mode).
 * - Cung cấp dữ liệu mô phỏng cho Kho vật tư (Inventory) và Đơn mua hàng (Procurement PO).
 */

import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { InventoryItem, InventoryTransaction } from '../../features/inventory/types';
import type { PurchaseOrder, ProcurementRequest } from '../../features/procurement/types';
import {
  mockInventoryItems as seedInventoryItems,
  mockInventoryTransactions as seedInventoryTransactions,
  mockPurchaseOrders as seedPurchaseOrders,
  mockProcurementRequests as seedProcurementRequests,
} from '../../mocks/inventory/mockInventoryData';

let mockInventoryTransactions: InventoryTransaction[] = [...seedInventoryTransactions];
let mockInventoryItems: InventoryItem[] = [...seedInventoryItems];
let mockPurchaseOrders: PurchaseOrder[] = [...seedPurchaseOrders];
let mockProcurementRequests: ProcurementRequest[] = [...seedProcurementRequests];

export const mockBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args
) => {
  const url = typeof args === 'string' ? args : args.url;
  const method = typeof args === 'string' ? 'GET' : (args.method || 'GET').toUpperCase();
  const body = typeof args === 'string' ? undefined : (args.body as any);

  // 1. GET /v1/inventory/items
  if (url === '/v1/inventory/items' && method === 'GET') {
    return {
      data: {
        success: true,
        data: [...mockInventoryItems],
        count: mockInventoryItems.length,
      },
    };
  }

  // 2. GET /v1/inventory/compatibility/:model
  if (url.startsWith('/v1/inventory/compatibility/') && method === 'GET') {
    const model = decodeURIComponent(url.replace('/v1/inventory/compatibility/', ''));
    const matched = mockInventoryItems.filter((item) =>
      item.compatibleModels.some((m) => m.toLowerCase().includes(model.toLowerCase()))
    );
    return { data: matched.length > 0 ? matched : [...mockInventoryItems] };
  }

  // 3. POST /v1/inventory/items
  if (url === '/v1/inventory/items' && method === 'POST') {
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      sku: body?.sku || `SKU-${Date.now()}`,
      name: body?.name || 'Vật tư mới',
      category: body?.category || 'TONER',
      compatibleModels: body?.compatibleModels || [],
      currentStock: Number(body?.currentStock) || 0,
      safetyStock: Number(body?.safetyStock) || 2,
      unit: body?.unit || 'Hộp',
      unitCost: Number(body?.unitCost) || 0,
      location: body?.location || 'Kho Tổng Tầng B1',
      updatedAt: new Date().toISOString(),
    };
    mockInventoryItems = [newItem, ...mockInventoryItems];
    return { data: newItem };
  }

  // 3b. GET /v1/inventory/transactions
  if (url === '/v1/inventory/transactions' && method === 'GET') {
    return {
      data: {
        success: true,
        count: mockInventoryTransactions.length,
        data: [...mockInventoryTransactions],
      },
    };
  }

  // 4. POST /v1/inventory/transactions
  if (url === '/v1/inventory/transactions' && method === 'POST') {
    const { itemId, type, quantity, taskId, note } = body || {};
    const qty = Number(quantity) || 0;
    const targetItem = mockInventoryItems.find((it) => it.id === itemId);
    let nextStock = targetItem ? targetItem.currentStock : 0;

    mockInventoryItems = mockInventoryItems.map((it) => {
      if (it.id !== itemId) return it;
      nextStock =
        type === 'EXPORT'
          ? Math.max(0, it.currentStock - qty)
          : type === 'IMPORT'
          ? it.currentStock + qty
          : qty;
      return { ...it, currentStock: nextStock, updatedAt: new Date().toISOString() };
    });

    if (targetItem) {
      const delta = type === 'EXPORT' ? -Math.abs(qty) : Math.abs(qty);
      mockInventoryTransactions = [
        {
          id: `tx-${Date.now()}`,
          itemId,
          type,
          quantity: delta,
          balanceAfter: nextStock,
          taskId: taskId || null,
          performedByName: 'Người vận hành',
          note: note || (type === 'EXPORT' ? 'Xuất kho bảo trì' : 'Nhập kho bổ sung'),
          createdAt: new Date().toISOString(),
          item: { sku: targetItem.sku, name: targetItem.name, unit: targetItem.unit, category: targetItem.category },
        },
        ...mockInventoryTransactions,
      ];
    }
    return { data: { success: true } };
  }

  // 5. GET /v1/procurement/orders
  if (url === '/v1/procurement/orders' && method === 'GET') {
    return {
      data: {
        success: true,
        data: [...mockPurchaseOrders],
        count: mockPurchaseOrders.length,
      },
    };
  }

  // 6. POST /v1/procurement/orders
  if (url === '/v1/procurement/orders' && method === 'POST') {
    const items = Array.isArray(body?.items) ? body.items : [];
    const totalAmount = items.reduce(
      (sum: number, it: any) => sum + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      0
    );
    const newOrder: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: body?.poNumber || `PO-2026-${Date.now().toString().slice(-4)}`,
      status: 'ORDERED',
      totalAmount,
      itemsJson: items,
      createdById: 'u-admin',
      createdBy: { id: 'u-admin', fullName: 'Quản Trị Viên (Mock)', role: 'ADMIN' },
      orderedAt: new Date().toISOString(),
      note: body?.note || null,
      createdAt: new Date().toISOString(),
    };
    mockPurchaseOrders = [newOrder, ...mockPurchaseOrders];
    return { data: { success: true, data: newOrder } };
  }

  // 7. POST /v1/procurement/orders/:id/receive
  if (url.startsWith('/v1/procurement/orders/') && url.endsWith('/receive') && method === 'POST') {
    const poId = url.replace('/v1/procurement/orders/', '').replace('/receive', '');
    const targetPo = mockPurchaseOrders.find((p) => p.id === poId);
    if (targetPo && targetPo.status !== 'RECEIVED') {
      const poItems = Array.isArray(targetPo.itemsJson) ? targetPo.itemsJson : [];
      poItems.forEach((poIt: any) => {
        const existing = mockInventoryItems.find((inv) => inv.sku === poIt.sku);
        if (existing) {
          existing.currentStock += Number(poIt.quantity) || 0;
        }
      });
      mockPurchaseOrders = mockPurchaseOrders.map((p) =>
        p.id === poId ? { ...p, status: 'RECEIVED', receivedAt: new Date().toISOString() } : p
      );
    }
    return { data: { success: true } };
  }

  // 8. GET / POST /v1/procurement/requests
  if (url === '/v1/procurement/requests') {
    if (method === 'GET') {
      return {
        data: {
          success: true,
          data: [...mockProcurementRequests],
          count: mockProcurementRequests.length,
        },
      };
    }
    if (method === 'POST') {
      const reqItem: ProcurementRequest = {
        id: `req-${Date.now()}`,
        requestedById: 'u-admin',
        itemName: body?.itemName || 'Vật tư đề xuất',
        quantity: Number(body?.quantity) || 1,
        reason: body?.reason || '',
        status: 'PENDING',
        urgency: body?.urgency || 'NORMAL',
        createdAt: new Date().toISOString(),
      };
      mockProcurementRequests = [reqItem, ...mockProcurementRequests];
      return { data: { success: true, data: reqItem } };
    }
  }

  return { data: { success: true, data: [] } };
};

