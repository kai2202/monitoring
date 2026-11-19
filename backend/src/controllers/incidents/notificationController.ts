/**
 * Backend/src/controllers/incidents/notificationController.ts
 *
 * Controller xử lý Chuông Thông Báo Tập Trung (Notification Pipeline - TASK-BE-15):
 * - Phân phối thông báo In-App theo vai trò (ADMIN, FIELD_TECH, ASSET_HR).
 * - Tự động tổng hợp thông báo từ các nguồn: Sự cố chưa gán, Task chờ duyệt, Yêu cầu làm lại, Vật tư nguy cấp.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 8 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';
  category: 'MAINTENANCE' | 'DIAGNOSTICS' | 'SUPPLIES' | 'SECURITY';
  targetRole?: string;
  targetUserId?: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

const userReadNotifications = new Map<string, Set<string>>();

export class NotificationController {
  // GET /api/v1/notifications
  async getNotifications(req: Request, res: Response) {
    try {
      const user = req.user;
      const userId = user?.userId || 'anonymous';
      const userRole = user?.role || 'FIELD_TECH';
      const readSet = userReadNotifications.get(userId) || new Set<string>();

      const notifications: SystemNotification[] = [];

      if (userRole === 'ADMIN') {
        const unmappedIncidents = await prisma.incident.findMany({
          where: { canonicalCode: 'FM-UNK-01', status: 'OPEN' },
          include: { printer: true },
          take: 5,
          orderBy: { detectedAt: 'desc' },
        });

        for (const inc of unmappedIncidents) {
          const notifId = `notif-unmapped-${inc.id}`;
          notifications.push({
            id: notifId,
            title: 'Mã lỗi chưa có trong từ điển',
            message: `Máy in [${inc.printer.name}] phát sinh mã lỗi [${inc.errorCode}]. Cần kiểm tra từ điển CSV.`,
            type: 'WARNING',
            category: 'DIAGNOSTICS',
            targetRole: 'ADMIN',
            isRead: readSet.has(notifId),
            createdAt: inc.detectedAt.toISOString(),
            link: '/settings/dictionary',
          });
        }

        const pendingTasks = await prisma.task.findMany({
          where: { status: 'Pending_Verification' },
          include: { printer: true },
          take: 5,
          orderBy: { updatedAt: 'desc' },
        });

        for (const t of pendingTasks) {
          const notifId = `notif-verify-${t.id}`;
          notifications.push({
            id: notifId,
            title: 'Lệnh bảo trì chờ duyệt nghiệm thu',
            message: `KTV ${t.assigneeName || ''} đã hoàn tất lệnh [${t.title}] trên máy in [${t.printer.name}]. Chờ Admin duyệt.`,
            type: 'INFO',
            category: 'MAINTENANCE',
            targetRole: 'ADMIN',
            isRead: readSet.has(notifId),
            createdAt: t.updatedAt.toISOString(),
            link: '/printers/history',
          });
        }
      }

      if (userRole === 'FIELD_TECH' || userRole === 'ADMIN') {
        const reworkTasks = await prisma.task.findMany({
          where: {
            reworkReason: { not: null },
            status: { not: 'Completed' },
            ...(userRole === 'FIELD_TECH' ? { assigneeId: userId } : {}),
          },
          include: { printer: true },
          take: 5,
          orderBy: { updatedAt: 'desc' },
        });

        for (const t of reworkTasks) {
          const notifId = `notif-rework-${t.id}`;
          notifications.push({
            id: notifId,
            title: 'Yêu cầu làm lại lệnh bảo trì',
            message: `Lệnh [${t.title}] bị Admin từ chối: "${t.reworkReason}". Vui lòng hoàn thành bước làm lại.`,
            type: 'ERROR',
            category: 'MAINTENANCE',
            targetRole: 'FIELD_TECH',
            targetUserId: t.assigneeId || undefined,
            isRead: readSet.has(notifId),
            createdAt: t.updatedAt.toISOString(),
            link: `/printers/history?taskId=${t.id}`,
          });
        }
      }

      if (userRole === 'ASSET_HR' || userRole === 'ADMIN') {
        const lowConsumables = await prisma.printerConsumable.findMany({
          where: {
            OR: [
              { tonerBlack: { lte: 10 } },
              { tonerCyan: { lte: 10 } },
              { tonerMagenta: { lte: 10 } },
              { tonerYellow: { lte: 10 } },
              { wasteTonerStatus: 'FULL' },
            ],
          },
          include: { printer: true },
          take: 5,
        });

        for (const c of lowConsumables) {
          const notifId = `notif-supply-${c.id}`;
          notifications.push({
            id: notifId,
            title: 'Vật tư chạm ngưỡng cạn kiệt',
            message: `Máy in [${c.printer.name}] tại [${c.printer.floor}] sắp hết vật tư tiêu hao. Cần lập kế hoạch cấp phát.`,
            type: 'WARNING',
            category: 'SUPPLIES',
            targetRole: 'ASSET_HR',
            isRead: readSet.has(notifId),
            createdAt: c.lastUpdated.toISOString(),
            link: '/analytics/supplies',
          });
        }
      }

      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return res.status(200).json({
        success: true,
        unreadCount,
        notifications,
      });
    } catch (err: any) {
      console.error('[NotificationController.getNotifications] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể lấy danh sách thông báo', message: err.message });
    }
  }

  // PATCH /api/v1/notifications/:id/read
  async markAsRead(req: Request, res: Response) {
    try {
      const notifId = req.params.id;
      const userId = req.user?.userId || 'anonymous';

      let readSet = userReadNotifications.get(userId);
      if (!readSet) {
        readSet = new Set<string>();
        userReadNotifications.set(userId, readSet);
      }
      readSet.add(notifId);

      return res.status(200).json({ success: true, message: 'Đã đánh dấu thông báo đã đọc', notifId });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể cập nhật trạng thái thông báo', message: err.message });
    }
  }
}

export const notificationController = new NotificationController();

