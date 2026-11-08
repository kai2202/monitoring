/**
 * Frontend/src/app/api/mockBaseQuery.ts
 *
 * Mock BaseQuery cô lập dành riêng cho chế độ Mock / GitHub Pages Demo (`DATA_SOURCE === 'mock'`).
 * - Tuân thủ AGENTS.md Rule 5.1 & Rule 7.4: Chỉ kích hoạt khi `isMockSource() === true`,
 *   tuyệt đối không che giấu lỗi API trong môi trường vận hành thực (`api` mode).
 * - Cung cấp dữ liệu mô phỏng cho Kho vật tư (Inventory) và Đơn mua hàng (Procurement PO).
 */

import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { InventoryItem } from '../../features/inventory/types';
import type { PurchaseOrder, ProcurementRequest } from '../../features/procurement/types';

let mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-001',
    sku: 'MP-C6004-BK',
    name: 'Hộp mực Ricoh MP C6004 Black (Chính hãng)',
    category: 'TONER',
    compatibleModels: ['Ricoh MP C6004', 'Ricoh MP C4504'],
    currentStock: 14,
    safetyStock: 5,
    unit: 'Hộp',
    unitCost: 1450000,
    location: 'Kho Tổng Tầng B1 - Kệ A1',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-002',
    sku: 'MP-C6004-CY',
    name: 'Hộp mực Ricoh MP C6004 Cyan (Xanh)',
    category: 'TONER',
    compatibleModels: ['Ricoh MP C6004', 'Ricoh MP C4504'],
    currentStock: 3,
    safetyStock: 5,
    unit: 'Hộp',
    unitCost: 1850000,
    location: 'Kho Tổng Tầng B1 - Kệ A1',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-003',
    sku: 'CF226X-HP',
    name: 'Hộp mực HP 26X High Yield Black (CF226X)',
    category: 'TONER',
    compatibleModels: ['HP LaserJet Pro M402dn', 'HP LaserJet Pro MFP M426fdw'],
    currentStock: 8,
    safetyStock: 4,
    unit: 'Hộp',
    unitCost: 2100000,
    location: 'Kho Tổng Tầng B1 - Kệ B2',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-004',
    sku: 'DR-3455-BRO',
    name: 'Cụm trống từ Brother DR-3455 Drum Unit',
    category: 'DRUM',
    compatibleModels: ['Brother HL-L6400DW', 'Brother MFC-L6900DW'],
    currentStock: 2,
    safetyStock: 3,
    unit: 'Cụm',
    unitCost: 2650000,
    location: 'Kho Linh Kiện Tầng 1 - Tủ C3',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-005',
    sku: 'FUSER-C6004',
    name: 'Cụm sấy Ricoh MP C6004 Fuser Unit 220V',
    category: 'FUSER',
    compatibleModels: ['Ricoh MP C6004'],
    currentStock: 1,
    safetyStock: 2,
    unit: 'Cụm',
    unitCost: 6800000,
    location: 'Kho Linh Kiện Tầng 1 - Tủ D1',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-006',
    sku: 'WT-C6004',
    name: 'Hộp chứa mực thải Ricoh MP C6004 Waste Toner Bottle',
    category: 'WASTE_BOX',
    compatibleModels: ['Ricoh MP C6004', 'Ricoh MP C4504'],
    currentStock: 9,
    safetyStock: 3,
    unit: 'Hộp',
    unitCost: 480000,
    location: 'Kho Tổng Tầng B1 - Kệ A3',
    updatedAt: new Date().toISOString(),
  },
];

let mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-001',
    poNumber: 'PO-2026-0841',
    vendorId: 'v-ricoh',
    vendor: { id: 'v-ricoh', name: 'Ricoh Vietnam Official', code: 'RICOH-VN', phone: '1900 1821' },
    status: 'ORDERED',
    totalAmount: 16500000,
    itemsJson: [
      { sku: 'MP-C6004-CY', name: 'Hộp mực Ricoh MP C6004 Cyan (Xanh)', quantity: 4, unitPrice: 1850000 },
      { sku: 'FUSER-C6004', name: 'Cụm sấy Ricoh MP C6004 Fuser Unit 220V', quantity: 1, unitPrice: 6800000 },
      { sku: 'MP-C6004-BK', name: 'Hộp mực Ricoh MP C6004 Black', quantity: 1, unitPrice: 2300000 },
    ],
    createdById: 'u-admin',
    createdBy: { id: 'u-admin', fullName: 'Nguyễn Quản Trị (Admin)', role: 'ADMIN' },
    orderedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    note: 'Bổ sung vật tư màu & cụm sấy dự phòng quý 4',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'po-002',
    poNumber: 'PO-2026-0792',
    vendorId: 'v-hp',
    vendor: { id: 'v-hp', name: 'HP Enterprise Supply Partner', code: 'HPE-VN', phone: '1800 588 868' },
    status: 'RECEIVED',
    totalAmount: 10500000,
    itemsJson: [
      { sku: 'CF226X-HP', name: 'Hộp mực HP 26X High Yield Black (CF226X)', quantity: 5, unitPrice: 2100000 },
    ],
    createdById: 'u-admin',
    createdBy: { id: 'u-admin', fullName: 'Trần Trưởng Phòng Vật Tư', role: 'ASSET_HR' },
    orderedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    receivedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    note: 'Đã nghiệm thu nhập kho đủ 5 hộp nguyên tem',
    createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
  },
];

let mockProcurementRequests: ProcurementRequest[] = [];

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

  // 4. POST /v1/inventory/transactions
  if (url === '/v1/inventory/transactions' && method === 'POST') {
    const { itemId, type, quantity } = body || {};
    const qty = Number(quantity) || 0;
    mockInventoryItems = mockInventoryItems.map((it) => {
      if (it.id !== itemId) return it;
      const nextStock =
        type === 'EXPORT'
          ? Math.max(0, it.currentStock - qty)
          : type === 'IMPORT'
          ? it.currentStock + qty
          : qty;
      return { ...it, currentStock: nextStock, updatedAt: new Date().toISOString() };
    });
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

