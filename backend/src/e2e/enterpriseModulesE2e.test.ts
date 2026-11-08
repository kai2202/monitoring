/**
 * Backend/src/e2e/enterpriseModulesE2e.test.ts
 *
 * Kiểm thử Tích hợp End-to-End (E2E) cho các Phân hệ Mở rộng (BE-09 -> BE-15):
 * - Quản lý Kho vật tư & Giao dịch xuất kho tự động (BE-09).
 * - Đề xuất mua sắm & Nghiệm thu đơn hàng PO tự động cộng tồn kho (BE-10).
 * - Danh bạ Nhà cung cấp & Nhật ký liên hệ kỹ thuật hãng trong Task (BE-11).
 * - Phân tích Sản lượng, Dự báo Vật tư D-Day & SLA Cost (BE-14).
 * - Chuông Thông Báo Tập Trung theo vai trò & Đánh dấu đã đọc (BE-15).
 * - Tuân thủ AGENTS.md Rule 5, Rule 6 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import { tokenService } from '../services/auth/tokenService';

describe('FleetMonitor Enterprise Modules E2E Suite (BE-09 -> BE-15)', () => {
  let server: Server;
  let baseUrl: string;

  const adminToken = tokenService.generateAccessToken({
    userId: 'usr-admin-01',
    username: 'admin',
    fullName: 'Nguyễn Văn An (Admin)',
    role: 'ADMIN',
    permissions: ['all'],
  });

  const techToken = tokenService.generateAccessToken({
    userId: 'usr-tech-01',
    username: 'tech_nam',
    fullName: 'Lê Hoàng Nam',
    role: 'FIELD_TECH',
    permissions: ['tasks:execute', 'worklog:create'],
  });

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. [BE-09] Quản lý Kho vật tư: Cảnh báo chạm ngưỡng Safety Stock & Xuất kho gắn với Task', async () => {
    vi.spyOn(prisma.inventoryItem, 'findMany').mockResolvedValue([
      {
        id: 'item-bk-01',
        sku: 'MP-C6004-BK',
        name: 'Hộp mực Ricoh MP C6004 Black',
        category: 'TONER',
        compatibleModels: ['MP C6004'],
        currentStock: 4,
        safetyStock: 5,
        unit: 'Hộp',
        unitCost: 850000,
        location: 'Kho T1 - Kệ A1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const resItems = await fetch(`${baseUrl}/api/v1/inventory/items?lowStockOnly=true`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const itemsBody = (await resItems.json()) as any;

    expect(resItems.status).toBe(200);
    expect(itemsBody.summary.lowStockCount).toBe(1);
    expect(itemsBody.data[0].isLowStock).toBe(true);

    vi.spyOn(prisma.inventoryItem, 'findUnique').mockResolvedValue({
      id: 'item-bk-01',
      sku: 'MP-C6004-BK',
      currentStock: 4,
    } as any);

    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
      const txMock = {
        inventoryItem: {
          update: vi.fn().mockResolvedValue({ id: 'item-bk-01', sku: 'MP-C6004-BK', currentStock: 2 }),
        },
        inventoryTransaction: {
          create: vi.fn().mockResolvedValue({
            id: 'tx-01',
            itemId: 'item-bk-01',
            type: 'EXPORT',
            quantity: -2,
            balanceAfter: 2,
            taskId: 'TASK-001',
          }),
        },
        auditLog: { create: vi.fn() },
      };
      return cb(txMock);
    });

    const resTx = await fetch(`${baseUrl}/api/v1/inventory/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${techToken}`,
      },
      body: JSON.stringify({
        itemId: 'item-bk-01',
        type: 'EXPORT',
        quantity: 2,
        taskId: 'TASK-001',
        note: 'Thay mực đen cho máy Ricoh T1',
      }),
    });
    const txBody = (await resTx.json()) as any;

    expect(resTx.status).toBe(201);
    expect(txBody.data.balanceAfter).toBe(2);
    expect(txBody.item.currentStock).toBe(2);
  });

  it('2. [BE-10] Mua sắm Vật tư: Nghiệm thu đơn hàng PO tự động cộng tồn kho vật tư', async () => {
    vi.spyOn(prisma.purchaseOrder, 'findUnique').mockResolvedValue({
      id: 'po-01',
      poNumber: 'PO-2026-001',
      status: 'ORDERED',
      itemsJson: [{ sku: 'MP-C6004-BK', name: 'Mực Ricoh Đen', quantity: 10, unitPrice: 850000 }],
    } as any);

    const updateStockSpy = vi.fn().mockResolvedValue({});
    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
      const txMock = {
        purchaseOrder: {
          update: vi.fn().mockResolvedValue({ id: 'po-01', poNumber: 'PO-2026-001', status: 'RECEIVED' }),
        },
        inventoryItem: {
          findUnique: vi.fn().mockResolvedValue({ id: 'item-bk-01', sku: 'MP-C6004-BK', currentStock: 2 }),
          update: updateStockSpy,
        },
        inventoryTransaction: { create: vi.fn() },
        auditLog: { create: vi.fn() },
      };
      return cb(txMock);
    });

    const resReceive = await fetch(`${baseUrl}/api/v1/procurement/orders/po-01/receive`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const receiveBody = (await resReceive.json()) as any;

    expect(resReceive.status).toBe(200);
    expect(receiveBody.data.status).toBe('RECEIVED');
    expect(updateStockSpy).toHaveBeenCalledWith({
      where: { id: 'item-bk-01' },
      data: { currentStock: 12 },
    });
  });

  it('3. [BE-11] Quản trị Đối tác Hãng: Ghi nhận nhật ký trao đổi kỹ thuật (Vendor Log) trong lệnh bảo trì', async () => {
    vi.spyOn(prisma.task, 'findUnique').mockResolvedValue({ id: 'TASK-001', title: 'Sửa cụm sấy' } as any);
    vi.spyOn(prisma.vendorCommunicationLog, 'create').mockResolvedValue({
      id: 'vlog-01',
      vendorId: 'vnd-ricoh',
      taskId: 'TASK-001',
      callerName: 'tech_nam',
      vendorAgent: 'Kỹ sư Hoàng - Ricoh VN',
      externalTicketNumber: 'RMA-2026-889',
      content: 'Đã xác nhận bảo hành cụm sấy chính hãng',
    } as any);

    const resLog = await fetch(`${baseUrl}/api/v1/vendors/tasks/TASK-001/vendor-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${techToken}`,
      },
      body: JSON.stringify({
        vendorId: 'vnd-ricoh',
        vendorAgent: 'Kỹ sư Hoàng - Ricoh VN',
        externalTicketNumber: 'RMA-2026-889',
        content: 'Đã xác nhận bảo hành cụm sấy chính hãng',
      }),
    });
    const logBody = (await resLog.json()) as any;

    expect(resLog.status).toBe(201);
    expect(logBody.data.externalTicketNumber).toBe('RMA-2026-889');
  });

  it('4. [BE-14] Analytics SLA & Cost: Bóc tách chi phí phòng ban và Ma trận nhiệt sự cố theo Tầng', async () => {
    vi.spyOn(prisma.printer, 'findMany').mockResolvedValue([
      {
        id: 'RICOH-T1-01',
        name: 'Ricoh MP C6004',
        building: 'Trụ sở chính',
        floor: 'T1',
        department: 'Kế toán & Tài chính',
        counterRollups: [{ deltaMono: 500, deltaColor: 100 }],
      } as any,
    ]);
    vi.spyOn(prisma.costRateConfig, 'findFirst').mockResolvedValue({
      monoRatePerPage: 150,
      colorRatePerPage: 1000,
      targetUptimePercent: 99.0,
    } as any);
    vi.spyOn(prisma.incident, 'findMany').mockResolvedValue([
      {
        id: 'inc-01',
        printerId: 'RICOH-T1-01',
        title: 'SC542 Fuser Error',
        severity: 'critical',
        detectedAt: new Date(),
        resolvedAt: null,
        printer: { name: 'Ricoh MP C6004', floor: 'T1', department: 'Kế toán & Tài chính' },
      } as any,
    ]);

    const resSla = await fetch(`${baseUrl}/api/v1/analytics/sla-cost?building=all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const slaBody = (await resSla.json()) as any;

    expect(resSla.status).toBe(200);
    expect(slaBody.kpis.totalPrintCost).toBe(175000);
    expect(slaBody.departmentCosts[0].departmentName).toBe('Kế toán & Tài chính');
    expect(slaBody.incidentHeatmap.floors[0].shortName).toBe('T1');
  });

  it('5. [BE-15] Chuông Thông Báo Tập Trung: Tổng hợp thông báo cho ADMIN và đánh dấu đã đọc', async () => {
    vi.spyOn(prisma.incident, 'findMany').mockResolvedValue([
      {
        id: 'inc-unk-01',
        errorCode: 'SC899',
        canonicalCode: 'FM-UNK-01',
        status: 'OPEN',
        detectedAt: new Date(),
        printer: { name: 'Ricoh MP C6004' },
      } as any,
    ]);
    vi.spyOn(prisma.task, 'findMany').mockResolvedValue([]);
    vi.spyOn(prisma.printerConsumable, 'findMany').mockResolvedValue([]);

    const resNotif = await fetch(`${baseUrl}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const notifBody = (await resNotif.json()) as any;

    expect(resNotif.status).toBe(200);
    expect(notifBody.unreadCount).toBe(1);
    const targetNotifId = notifBody.notifications[0].id;
    expect(targetNotifId).toBe('notif-unmapped-inc-unk-01');

    const resRead = await fetch(`${baseUrl}/api/v1/notifications/${targetNotifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(resRead.status).toBe(200);

    const resAfter = await fetch(`${baseUrl}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const afterBody = (await resAfter.json()) as any;
    expect(afterBody.unreadCount).toBe(0);
    expect(afterBody.notifications[0].isRead).toBe(true);
  });
});
