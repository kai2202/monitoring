/**
 * Backend/src/controllers/operations/vendorController.ts
 *
 * Quản trị nhà cung cấp thiết bị và Nhật ký trao đổi hỗ trợ hãng (TASK-BE-11):
 * - Theo dõi danh bạ đối tác chính hãng (Ricoh, Canon, HP...), SLA đáp ứng.
 * - Lưu vết nhật ký cuộc gọi hỗ trợ kỹ thuật và mã Ticket RMA trong Task CMMS.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 8 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export class VendorController {
  // GET /api/v1/vendors
  async getVendors(_req: Request, res: Response) {
    try {
      const vendors = await prisma.vendor.findMany({
        include: {
          _count: {
            select: { communications: true, contracts: true, purchaseOrders: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      return res.status(200).json({ success: true, count: vendors.length, data: vendors });
    } catch (err: any) {
      console.error('[VendorController.getVendors] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể truy vấn danh sách nhà cung cấp', message: err.message });
    }
  }

  // POST /api/v1/vendors
  async createVendor(req: Request, res: Response) {
    try {
      const { name, code, contactPerson, phone, email, address, slaResponseHours, notes } = req.body;

      if (!name || !code) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: name, code' });
      }

      const existing = await prisma.vendor.findUnique({ where: { code } });
      if (existing) {
        return res.status(409).json({ error: 'Mã nhà cung cấp này đã tồn tại' });
      }

      const vendor = await prisma.vendor.create({
        data: {
          name,
          code,
          contactPerson: contactPerson || null,
          phone: phone || null,
          email: email || null,
          address: address || null,
          slaResponseHours: Number(slaResponseHours) || 4,
          notes: notes || null,
        },
      });

      return res.status(201).json({ success: true, data: vendor });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tạo mới nhà cung cấp', message: err.message });
    }
  }

  // GET /api/v1/vendors/:id/communications
  async getVendorCommunications(req: Request, res: Response) {
    try {
      const vendorId = req.params.id;

      const logs = await prisma.vendorCommunicationLog.findMany({
        where: { vendorId },
        include: {
          task: { select: { id: true, title: true, status: true, printerId: true } },
        },
        orderBy: { loggedAt: 'desc' },
      });

      return res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể truy vấn lịch sử trao đổi', message: err.message });
    }
  }

  // POST /api/v1/tasks/:taskId/vendor-logs
  async logTaskCommunication(req: Request, res: Response) {
    try {
      const taskId = req.params.taskId;
      const { vendorId, vendorAgent, channel, externalTicketNumber, content, result } = req.body;
      const callerName = req.user?.username || 'Kỹ thuật viên';

      if (!vendorId || !content) {
        return res.status(400).json({ error: 'Thiếu thông tin: vendorId hoặc nội dung trao đổi (content)' });
      }

      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ error: 'Không tìm thấy lệnh bảo trì (Task) tương ứng' });
      }

      const log = await prisma.vendorCommunicationLog.create({
        data: {
          vendorId,
          taskId,
          callerName,
          vendorAgent: vendorAgent || null,
          channel: channel || 'PHONE',
          externalTicketNumber: externalTicketNumber || null,
          content,
          result: result || null,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Đã lưu nhật ký liên hệ hỗ trợ kỹ thuật của hãng',
        data: log,
      });
    } catch (err: any) {
      console.error('[VendorController.logTaskCommunication] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể lưu nhật ký trao đổi hãng', message: err.message });
    }
  }
}

export const vendorController = new VendorController();

