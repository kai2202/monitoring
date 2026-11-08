/**
 * Backend/src/controllers/zabbixWebhookController.ts
 *
 * Endpoint tiếp nhận Zabbix Action Webhook Push (Problem & Recovery) tức thời:
 * - Cơ chế Idempotency: Kiểm tra eventid trong bộ đệm để tránh xử lý trùng lặp.
 * - Tuân thủ AGENTS.md Rule 6: Nghiêm cấm Auto-Close đối với sự cố phần cứng nghiêm trọng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { fleetMemoryCache } from '../services/cache/fleetMemoryCache';
import { classifyWithDbDictionary } from '../services/diagnostics/errorCodeClassifier';

// Bộ đệm lưu trữ các eventid đã xử lý trong 10 phút để đảm bảo tính Idempotency
const processedEvents = new Map<string, number>();
const EVENT_TTL_MS = 10 * 60 * 1000;

function cleanupProcessedEvents() {
  const now = Date.now();
  for (const [eventId, timestamp] of processedEvents.entries()) {
    if (now - timestamp > EVENT_TTL_MS) {
      processedEvents.delete(eventId);
    }
  }
}

export class ZabbixWebhookController {
  public async handleWebhook(req: Request, res: Response) {
    cleanupProcessedEvents();

    try {
      const payload = req.body;
      const eventId = String(payload?.eventid || payload?.eventId || '');
      const eventValue = String(payload?.event_value ?? payload?.eventValue ?? '1'); // 1: Problem, 0: Recovery
      const triggerId = String(payload?.triggerid || payload?.triggerId || '');
      const triggerName = String(payload?.trigger_name || payload?.name || payload?.triggerDescription || '');
      const severity = parseInt(String(payload?.trigger_severity || payload?.severity || '3'), 10);
      const hostId = String(payload?.hostid || payload?.hostId || payload?.zabbix_host_id || '').trim();
      const hostIp = String(payload?.host_ip || payload?.ip || '').trim();
      const hostName = String(payload?.hostname || payload?.host || '').trim();
      const serialNumber = String(payload?.serial || payload?.serial_number || payload?.serialNumber || '').trim();

      if (!eventId) {
        return res.status(400).json({ success: false, error: 'Thiếu trường eventid trong payload webhook.' });
      }

      // 1. Chống xử lý trùng lặp (Idempotency)
      if (processedEvents.has(eventId)) {
        return res.status(200).json({ success: true, message: 'Sự kiện đã được xử lý trước đó (Idempotent).', eventId });
      }
      processedEvents.set(eventId, Date.now());

      // 2. Tìm máy in tương ứng trong CSDL theo 3 cấp độ định danh (zabbixHostId -> IP -> Serial/Name)
      let printer = hostId ? await prisma.printer.findFirst({ where: { zabbixHostId: hostId } }) : null;

      if (!printer && hostIp) {
        printer = await prisma.printer.findFirst({ where: { ip: hostIp } });
        // Tự động liên kết (Auto-bind) hostId nếu máy in chưa có
        if (printer && hostId && !printer.zabbixHostId) {
          await prisma.printer.update({
            where: { id: printer.id },
            data: { zabbixHostId: hostId },
          });
        }
      }

      if (!printer) {
        printer = await prisma.printer.findFirst({
          where: {
            OR: [
              ...(serialNumber ? [{ serialNumber }] : []),
              ...(hostName ? [{ name: { contains: hostName, mode: 'insensitive' as const } }, { id: hostName }] : []),
            ],
          },
        });
        if (printer && hostId && !printer.zabbixHostId) {
          await prisma.printer.update({
            where: { id: printer.id },
            data: { zabbixHostId: hostId },
          });
        }
      }

      if (!printer) {
        return res.status(200).json({
          success: true,
          message: `Không tìm thấy máy in tương ứng với HostID: ${hostId || '—'}, IP: ${hostIp || '—'} hoặc Host: ${hostName || '—'}. Bỏ qua xử lý.`,
          eventId,
        });
      }

      // 3. Xử lý sự kiện Sự Cố (Problem: event_value = 1)
      if (eventValue === '1') {
        const dbDictionary = await prisma.errorDictionary.findMany();
        const classified = classifyWithDbDictionary(
          triggerId,
          printer.mfr || 'General',
          triggerName,
          severity,
          dbDictionary
        );

        // Tạo bản ghi Incident trong PostgreSQL nếu chưa tồn tại sự cố mở tương tự
        const existingOpen = await prisma.incident.findFirst({
          where: {
            printerId: printer.id,
            status: 'OPEN',
            canonicalCode: classified.canonicalCode,
          },
        });

        const isCrit = classified.severity.toLowerCase() === 'critical';

        if (!existingOpen) {
          await prisma.incident.create({
            data: {
              printerId: printer.id,
              errorCode: classified.rawVendorCode || triggerName.slice(0, 50),
              canonicalCode: classified.canonicalCode,
              subsystem: classified.subsystem,
              severity: isCrit ? 'critical' : 'warning',
              status: 'OPEN',
              title: triggerName || `Sự cố Zabbix [${classified.canonicalCode}]`,
              description: classified.descriptionVi,
            },
          });

          // Cập nhật tình trạng sức khỏe máy in
          await prisma.printer.update({
            where: { id: printer.id },
            data: {
              health: isCrit ? 'Critical' : 'Warning',
              alertSeverity: isCrit ? 'critical' : 'warning',
            },
          });
        }

        // Hủy cache để Dashboard cập nhật ngay lập tức
        fleetMemoryCache.invalidate('alerts');
        fleetMemoryCache.invalidate('printers');

        return res.status(200).json({
          success: true,
          action: 'INCIDENT_CREATED',
          printerId: printer.id,
          canonicalCode: classified.canonicalCode,
        });
      }

      // 4. Xử lý sự kiện Phục Hồi (Recovery: event_value = 0)
      if (eventValue === '0') {
        // Tìm sự cố đang mở của máy in này
        const openIncidents = await prisma.incident.findMany({
          where: { printerId: printer.id, status: 'OPEN' },
        });

        for (const inc of openIncidents) {
          // TUÂN THỦ AGENTS.md Rule 6: Lỗi phần cứng nghiêm trọng TUYỆT ĐỐI CẤM Auto-Close
          if (inc.severity === 'critical') {
            console.log(`[ZabbixWebhook] Khóa Auto-Close sự cố ${inc.id} (${inc.canonicalCode}) do mức độ Critical.`);
            continue;
          }

          // Sự cố nhẹ tự phục hồi (ví dụ: đóng lại nắp, thêm giấy) cho phép đóng tự động
          await prisma.incident.update({
            where: { id: inc.id },
            data: {
              status: 'RESOLVED',
              resolvedAt: new Date(),
            },
          });
        }

        // Kiểm tra xem còn sự cố nào mở không để trả lại trạng thái Healthy
        const remainingOpen = await prisma.incident.count({
          where: { printerId: printer.id, status: 'OPEN' },
        });
        if (remainingOpen === 0) {
          await prisma.printer.update({
            where: { id: printer.id },
            data: { health: 'Healthy', alertSeverity: 'info' },
          });
        }

        fleetMemoryCache.invalidate('alerts');
        fleetMemoryCache.invalidate('printers');

        return res.status(200).json({
          success: true,
          action: 'INCIDENT_RECOVERED',
          printerId: printer.id,
        });
      }

      return res.status(200).json({ success: true, message: 'Sự kiện không thuộc diện kích hoạt.', eventId });
    } catch (err: any) {
      console.error('[ZabbixWebhookController] Lỗi xử lý webhook:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const zabbixWebhookController = new ZabbixWebhookController();

