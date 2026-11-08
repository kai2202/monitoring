/**
 * Backend/src/controllers/operations/procurementController.ts
 *
 * Quản lý quy trình Mua sắm & Đề xuất cấp phát vật tư tiêu hao (TASK-BE-10):
 * - Tiếp nhận đề xuất từ KTV & tự động thu thập từ cảnh báo cạn kiệt D-Day.
 * - Lập đơn đặt hàng PO (Purchase Order) gửi đối tác & xác nhận nhập kho.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 8 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export class ProcurementController {
  // GET /api/v1/procurement/requests
  async getRequests(req: Request, res: Response) {
    try {
      const { status } = req.query;

      const requests = await prisma.procurementRequest.findMany({
        where: status ? { status: String(status) } : undefined,
        include: {
          requestedBy: { select: { id: true, fullName: true, role: true } },
          printer: { select: { id: true, name: true, location: true, floor: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err: any) {
      console.error('[ProcurementController.getRequests] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể truy vấn danh sách đề xuất mua sắm', message: err.message });
    }
  }

  // GET /api/v1/procurement/orders
  async getPurchaseOrders(req: Request, res: Response) {
    try {
      const { status } = req.query;

      const orders = await prisma.purchaseOrder.findMany({
        where: status ? { status: String(status) } : undefined,
        include: {
          vendor: { select: { id: true, name: true, code: true, phone: true } },
          createdBy: { select: { id: true, fullName: true, role: true } },
          approvedBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err: any) {
      console.error('[ProcurementController.getPurchaseOrders] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể truy vấn danh sách đơn mua hàng PO', message: err.message });
    }
  }

  // POST /api/v1/procurement/requests
  async createRequest(req: Request, res: Response) {
    try {
      const { printerId, sku, itemName, quantity, reason, urgency } = req.body;
      const requestedById = req.user?.userId;

      if (!requestedById || !itemName) {
        return res.status(400).json({ error: 'Thiếu thông tin người yêu cầu hoặc tên vật tư' });
      }

      const newRequest = await prisma.procurementRequest.create({
        data: {
          requestedById,
          printerId: printerId || null,
          sku: sku || null,
          itemName,
          quantity: Number(quantity) || 1,
          reason: reason || 'Đề xuất thay thế vật tư bảo trì hiện trường',
          urgency: urgency || 'NORMAL',
          status: 'PENDING',
        },
      });

      return res.status(201).json({ success: true, message: 'Đã gửi yêu cầu cấp phát/mua sắm', data: newRequest });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tạo yêu cầu mua sắm', message: err.message });
    }
  }

  // POST /api/v1/procurement/orders
  async createPurchaseOrder(req: Request, res: Response) {
    try {
      const { poNumber, vendorId, items, note } = req.body;
      const createdById = req.user?.userId;

      if (!poNumber || !createdById || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Thiếu thông tin: poNumber hoặc danh sách mặt hàng đặt mua' });
      }

      const totalAmount = items.reduce(
        (sum: number, it: any) => sum + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
        0
      );

      const po = await prisma.purchaseOrder.create({
        data: {
          poNumber,
          vendorId: vendorId || null,
          status: 'PENDING_APPROVAL',
          totalAmount,
          itemsJson: items,
          createdById,
          note: note || 'Đơn đặt mua vật tư định kỳ',
        },
      });

      return res.status(201).json({ success: true, message: 'Tạo đơn đặt mua (PO) thành công', data: po });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tạo đơn đặt mua PO', message: err.message });
    }
  }

  // POST /api/v1/procurement/orders/:id/receive
  async receivePurchaseOrder(req: Request, res: Response) {
    try {
      const poId = req.params.id;
      const actorId = req.user?.userId;

      const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } });
      if (!po) {
        return res.status(404).json({ error: 'Không tìm thấy đơn mua hàng (PO)' });
      }

      if (po.status === 'RECEIVED') {
        return res.status(400).json({ error: 'Đơn mua hàng này đã được nghiệm thu nhập kho trước đó' });
      }

      const items = (po.itemsJson as any[]) || [];

      const result = await prisma.$transaction(async (tx) => {
        const updatedPo = await tx.purchaseOrder.update({
          where: { id: poId },
          data: {
            status: 'RECEIVED',
            receivedAt: new Date(),
          },
        });

        for (const it of items) {
          if (it.sku) {
            const foundItem = await tx.inventoryItem.findUnique({ where: { sku: it.sku } });
            if (foundItem) {
              const qty = Number(it.quantity) || 1;
              const nextBalance = foundItem.currentStock + qty;
              await tx.inventoryItem.update({
                where: { id: foundItem.id },
                data: { currentStock: nextBalance },
              });
              await tx.inventoryTransaction.create({
                data: {
                  itemId: foundItem.id,
                  type: 'IMPORT',
                  quantity: qty,
                  balanceAfter: nextBalance,
                  performedById: actorId || null,
                  note: `Nhập kho theo đơn đặt hàng ${po.poNumber}`,
                },
              });
            }
          }
        }

        await tx.auditLog.create({
          data: {
            userId: actorId || null,
            action: 'PO_STATUS_CHANGE',
            targetId: poId,
            diffJson: { poNumber: po.poNumber, status: 'RECEIVED' },
          },
        });

        return updatedPo;
      });

      return res.status(200).json({ success: true, message: 'Đã nghiệm thu và nhập kho thành công', data: result });
    } catch (err: any) {
      console.error('[ProcurementController.receivePurchaseOrder] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể xác nhận nghiệm thu đơn mua', message: err.message });
    }
  }
}

export const procurementController = new ProcurementController();

