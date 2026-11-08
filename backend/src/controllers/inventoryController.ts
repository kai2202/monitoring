/**
 * Backend/src/controllers/inventoryController.ts
 *
 * Quản lý kho vật tư tiêu hao và giao dịch xuất/nhập phụ tùng (TASK-BE-09):
 * - Theo dõi danh mục SKU, ngưỡng tồn kho an toàn (Safety Stock).
 * - Ghi nhận giao dịch xuất kho gắn với Task bảo trì hoặc nhập kho bổ sung.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class InventoryController {
  // GET /api/v1/inventory/items
  async getItems(req: Request, res: Response) {
    try {
      const { category, search, lowStockOnly } = req.query;

      const items = await prisma.inventoryItem.findMany({
        where: {
          ...(category ? { category: String(category) } : {}),
          ...(search
            ? {
                OR: [
                  { name: { contains: String(search), mode: 'insensitive' } },
                  { sku: { contains: String(search), mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Lọc các mặt hàng chạm hoặc dưới ngưỡng an toàn nếu yêu cầu
      const filtered = lowStockOnly === 'true'
        ? items.filter((item) => item.currentStock <= item.safetyStock)
        : items;

      const summary = {
        totalItems: items.length,
        lowStockCount: items.filter((item) => item.currentStock <= item.safetyStock).length,
        totalStockValueVnd: items.reduce((sum, item) => sum + item.currentStock * item.unitCost, 0),
      };

      return res.status(200).json({
        success: true,
        summary,
        data: filtered.map((item) => ({
          ...item,
          isLowStock: item.currentStock <= item.safetyStock,
        })),
      });
    } catch (err: any) {
      console.error('[InventoryController.getItems] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể truy vấn danh mục kho', message: err.message });
    }
  }

  // POST /api/v1/inventory/items
  async createItem(req: Request, res: Response) {
    try {
      const { sku, name, category, compatibleModels, currentStock, safetyStock, unit, unitCost, location } = req.body;

      if (!sku || !name || !category) {
        return res.status(400).json({ error: 'Thiếu trường bắt buộc: sku, name, category' });
      }

      const existing = await prisma.inventoryItem.findUnique({ where: { sku } });
      if (existing) {
        return res.status(409).json({ error: 'Mã phụ tùng SKU này đã tồn tại trong kho' });
      }

      const item = await prisma.inventoryItem.create({
        data: {
          sku,
          name,
          category,
          compatibleModels: Array.isArray(compatibleModels) ? compatibleModels : [],
          currentStock: Number(currentStock) || 0,
          safetyStock: Number(safetyStock) || 5,
          unit: unit || 'Hộp',
          unitCost: Number(unitCost) || 0,
          location: location || 'Kho T1 - Kệ A1',
        },
      });

      return res.status(201).json({ success: true, data: item });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tạo mới vật tư', message: err.message });
    }
  }

  // POST /api/v1/inventory/transactions
  async createTransaction(req: Request, res: Response) {
    try {
      const { itemId, type, quantity, taskId, note } = req.body;
      const performedById = req.user?.userId;

      if (!itemId || !type || quantity === undefined) {
        return res.status(400).json({ error: 'Thiếu thông tin: itemId, type, quantity' });
      }

      const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
      if (!item) {
        return res.status(404).json({ error: 'Không tìm thấy vật tư tương ứng trong kho' });
      }

      const delta = type === 'EXPORT' ? -Math.abs(Number(quantity)) : Math.abs(Number(quantity));
      const nextStock = item.currentStock + delta;

      if (nextStock < 0) {
        return res.status(400).json({
          error: `Số lượng tồn kho không đủ (Hiện có: ${item.currentStock}, Yêu cầu xuất: ${Math.abs(Number(quantity))})`,
        });
      }

      // Thực thi transaction đảm bảo tính toàn vẹn CSDL
      const result = await prisma.$transaction(async (tx) => {
        const updatedItem = await tx.inventoryItem.update({
          where: { id: itemId },
          data: { currentStock: nextStock },
        });

        const txRecord = await tx.inventoryTransaction.create({
          data: {
            itemId,
            type,
            quantity: delta,
            balanceAfter: nextStock,
            taskId: taskId || null,
            performedById: performedById || null,
            note: note || (type === 'EXPORT' ? 'Xuất kho phục vụ bảo trì' : 'Nhập kho bổ sung'),
          },
        });

        // Ghi AuditLog an ninh
        await tx.auditLog.create({
          data: {
            userId: performedById || null,
            action: 'STOCK_TRANSACTION',
            targetId: itemId,
            diffJson: {
              sku: item.sku,
              type,
              quantity: delta,
              before: item.currentStock,
              after: nextStock,
              taskId,
            },
          },
        });

        return { updatedItem, txRecord };
      });

      return res.status(201).json({
        success: true,
        message: 'Ghi nhận giao dịch kho thành công',
        data: result.txRecord,
        item: result.updatedItem,
      });
    } catch (err: any) {
      console.error('[InventoryController.createTransaction] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể ghi nhận giao dịch kho', message: err.message });
    }
  }

  // GET /api/v1/inventory/compatibility/:printerModel
  async getCompatibility(req: Request, res: Response) {
    try {
      const { printerModel } = req.params;

      const items = await prisma.inventoryItem.findMany({
        where: {
          compatibleModels: {
            has: printerModel,
          },
        },
      });

      return res.status(200).json({
        success: true,
        printerModel,
        compatibleItems: items,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tra cứu tính tương thích', message: err.message });
    }
  }
}

export const inventoryController = new InventoryController();

