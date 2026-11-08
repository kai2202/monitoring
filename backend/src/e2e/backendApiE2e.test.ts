/**
 * Backend/src/e2e/backendApiE2e.test.ts
 *
 * Kiểm thử Tích hợp End-to-End (E2E) toàn diện cho FleetMonitor Backend API (TASK-BE-01 -> TASK-BE-18):
 * - Khởi chạy HTTP Server thật từ `app` trên cổng động (ephemeral port).
 * - Xác minh: Health Check, Helmet Headers, Auth JWT 3 vai trò (ADMIN, FIELD_TECH, ASSET_HR),
 *   ẩn chi phí tài chính (sanitizeCostData), Sơ đồ Tầng T1-T5 (không còn Branch),
 *   CMMS Assignee Ownership, Phê duyệt & Yêu cầu làm lại (Rework),
 *   Zabbix Webhook Idempotency & Khóa Critical Incident (Rule 6).
 * - Tuân thủ AGENTS.md Rule 5, Rule 6 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import { tokenService } from '../services/auth/tokenService';

describe('FleetMonitor Backend E2E Integration Suite (BE-01 -> BE-18)', () => {
  let server: Server;
  let baseUrl: string;

  const adminToken = tokenService.generateAccessToken({
    userId: 'usr-admin-01',
    username: 'admin',
    fullName: 'Nguyễn Văn An (Admin)',
    role: 'ADMIN',
    permissions: ['all'],
  });

  const techAssignedToken = tokenService.generateAccessToken({
    userId: 'usr-tech-01',
    username: 'tech_nam',
    fullName: 'Lê Hoàng Nam',
    role: 'FIELD_TECH',
    permissions: ['tasks:execute', 'worklog:create'],
  });

  const techOtherToken = tokenService.generateAccessToken({
    userId: 'usr-tech-02',
    username: 'tech_other',
    fullName: 'Trần Văn Bình',
    role: 'FIELD_TECH',
    permissions: ['tasks:execute'],
  });

  const hrToken = tokenService.generateAccessToken({
    userId: 'usr-hr-01',
    username: 'asset_ha',
    fullName: 'Phạm Thu Hà',
    role: 'ASSET_HR',
    permissions: ['cost:view', 'printers:view', 'sla:view'],
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

  it('1. [BE-01] GET /api/v1/health trả về 200 OK kèm HTTP Helmet security headers', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    const body = (await res.json()) as any;

    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('FleetMonitor Backend API');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('2. [BE-03] Chặn truy cập 401 UNAUTHORIZED khi gọi endpoint bảo vệ không có Bearer Token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/printers`);
    const body = (await res.json()) as any;

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('3. [BE-02 & BE-06] GET /api/v1/printers & /api/v1/settings/branches trả về chuẩn Trụ sở chính & Tầng T1-T5', async () => {
    vi.spyOn(prisma.printer, 'findMany').mockResolvedValue([
      {
        id: 'RICOH-T1-01',
        name: 'Ricoh MP C6004 - P.Kế toán',
        ip: '192.168.1.101',
        model: 'MP C6004',
        mfr: 'Ricoh',
        deviceType: 'Laser Đa Năng (MFP)',
        serialNumber: 'RCH-C6004-98412',
        building: 'Trụ sở chính',
        location: 'Tầng 1 - Phòng Kế toán',
        floor: 'T1',
        department: 'Kế toán & Tài chính',
        isColor: true,
        connectionStatus: 'Online',
        health: 'Healthy',
        alertSeverity: 'info',
        syncStatus: 'SUCCESS',
        lastSeenAt: new Date(),
        lastSyncTime: new Date(),
        consumable: {
          tonerBlack: 78,
          tonerCyan: 62,
          tonerMagenta: 14,
          tonerYellow: 45,
          drumLifePercent: 76,
          fuserLifePercent: 84,
          wasteTonerStatus: 'OK',
        },
      } as any,
    ]);

    vi.spyOn(prisma.floor, 'findMany').mockResolvedValue([
      { id: 'f1', building: 'Trụ sở chính', code: 'T1', name: 'Tầng 1', createdAt: new Date() },
      { id: 'f2', building: 'Trụ sở chính', code: 'T2', name: 'Tầng 2', createdAt: new Date() },
    ]);

    const resPrinters = await fetch(`${baseUrl}/api/v1/printers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const printers = (await resPrinters.json()) as any[];

    expect(resPrinters.status).toBe(200);
    expect(printers).toHaveLength(1);
    expect(printers[0].building).toBe('Trụ sở chính');
    expect(printers[0].floor).toBe('T1');
    expect(printers[0].supplies.black).toBe(78);

    const resFloors = await fetch(`${baseUrl}/api/v1/settings/branches`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const buildings = (await resFloors.json()) as any[];
    expect(resFloors.status).toBe(200);
    expect(buildings[0].name).toBe('Trụ sở chính');
    expect(buildings[0].floors).toEqual(['Tầng 1', 'Tầng 2']);
  });

  it('4. [BE-12 & BE-17] Bảo vệ bí mật tài chính: Chặn FIELD_TECH xem /finance/costs/breakdown & tự ẩn giá VNĐ trong Task', async () => {
    const resForbidden = await fetch(`${baseUrl}/api/v1/finance/costs/breakdown`, {
      headers: { Authorization: `Bearer ${techAssignedToken}` },
    });
    expect(resForbidden.status).toBe(403);

    vi.spyOn(prisma.costRateConfig, 'findFirst').mockResolvedValue({
      monoRatePerPage: 150,
      colorRatePerPage: 1000,
    } as any);
    vi.spyOn(prisma.printer, 'findMany').mockResolvedValue([
      {
        id: 'RICOH-T1-01',
        department: 'Kế toán & Tài chính',
        counterRollups: [{ deltaMono: 1000, deltaColor: 200 }],
        contracts: [{ monthlyRentalCost: 2500000 }],
      } as any,
    ]);

    const resHrFinance = await fetch(`${baseUrl}/api/v1/finance/costs/breakdown`, {
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    const financeBody = (await resHrFinance.json()) as any;
    expect(resHrFinance.status).toBe(200);
    expect(financeBody.summary.totalPrintingCostVnd).toBe(350000);
    expect(financeBody.summary.totalTcoVnd).toBe(2850000);

    vi.spyOn(prisma.task, 'findMany').mockResolvedValue([
      {
        id: 'TASK-001',
        printerId: 'RICOH-T1-01',
        title: 'Thay cụm sấy Ricoh',
        taskType: 'HARDWARE_REPAIR',
        priority: 'P1_Urgent',
        status: 'In_Progress',
        assigneeId: 'usr-tech-01',
        assigneeName: 'Lê Hoàng Nam',
        progressPercent: 50,
        dynamicSteps: [],
        timeAndCost: {
          repairTimeHours: 1.5,
          laborCostVnd: 225000,
          partsCostVnd: 3800000,
          totalCostVnd: 4025000,
        },
        workLogs: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    ]);

    const resTechTasks = await fetch(`${baseUrl}/api/v1/tasks`, {
      headers: { Authorization: `Bearer ${techAssignedToken}` },
    });
    const techTasks = (await resTechTasks.json()) as any[];
    expect(resTechTasks.status).toBe(200);
    expect(techTasks[0].timeAndCost.repairTimeHours).toBe(1.5);
    expect(techTasks[0].timeAndCost.laborCostVnd).toBeNull();
    expect(techTasks[0].timeAndCost.partsCostVnd).toBeNull();
    expect(techTasks[0].timeAndCost.totalCostVnd).toBeNull();
  });

  it('5. [BE-08 & BE-13] Kiểm soát quyền sở hữu Task (Assignee), Yêu cầu làm lại (Rework) & Phê duyệt đóng lệnh', async () => {
    const sampleTask = {
      id: 'TASK-001',
      printerId: 'RICOH-T1-01',
      incidentId: 'INC-01',
      title: 'Sửa cụm sấy SC542',
      status: 'Pending_Verification',
      assigneeId: 'usr-tech-01',
      assigneeName: 'Lê Hoàng Nam',
      progressPercent: 100,
      dynamicSteps: [{ id: 's1', title: 'Kiểm tra nhiệt trở', status: 'completed' }],
    };

    vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(sampleTask as any);

    const resOtherTech = await fetch(`${baseUrl}/api/v1/tasks/TASK-001/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${techOtherToken}` },
      body: JSON.stringify({ status: 'In_Progress', progressPercent: 60 }),
    });
    expect(resOtherTech.status).toBe(403);

    const resSelfApprove = await fetch(`${baseUrl}/api/v1/approvals/tasks/TASK-001/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${techAssignedToken}` },
    });
    expect(resSelfApprove.status).toBe(403);

    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
      const txMock = {
        task: { update: vi.fn().mockImplementation(({ data }) => ({ ...sampleTask, ...data })) },
        incident: { update: vi.fn() },
        approvalAction: { create: vi.fn() },
        auditLog: { create: vi.fn() },
      };
      return cb(txMock);
    });

    const resRework = await fetch(`${baseUrl}/api/v1/approvals/tasks/TASK-001/rework`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ reason: 'Ảnh in test còn vệt mờ bên lề phải' }),
    });
    const reworkBody = (await resRework.json()) as any;

    expect(resRework.status).toBe(200);
    expect(reworkBody.data.status).toBe('In_Progress');
    expect(reworkBody.data.progressPercent).toBe(80);
    expect(reworkBody.data.dynamicSteps[1].title).toContain('[Làm lại]');
  });

  it('6. [BE-04 & BE-07] Zabbix Webhook tiếp nhận sự cố, chống trùng lặp (Idempotency) & khóa Auto-Close lỗi Critical', async () => {
    vi.spyOn(prisma.printer, 'findFirst').mockResolvedValue({
      id: 'RICOH-T1-01',
      name: 'Ricoh MP C6004',
      ip: '192.168.1.101',
      mfr: 'Ricoh',
    } as any);
    vi.spyOn(prisma.errorDictionary, 'findMany').mockResolvedValue([
      {
        vendor: 'Ricoh',
        rawCode: 'SC542',
        canonicalCode: 'FM-FUS-01',
        subsystem: 'Fuser',
        severity: 'critical',
        descriptionVi: 'Lỗi nhiệt độ sấy warm-up không đạt ngưỡng cài đặt',
      } as any,
    ]);
    vi.spyOn(prisma.incident, 'findFirst').mockResolvedValue(null);
    const createIncSpy = vi.spyOn(prisma.incident, 'create').mockResolvedValue({ id: 'inc-new-1' } as any);
    vi.spyOn(prisma.printer, 'update').mockResolvedValue({} as any);

    const payloadProblem = {
      eventid: 'evt-99001',
      event_value: '1',
      trigger_name: 'Ricoh Printer Error SC542 Fuser Failure',
      trigger_severity: '4',
      host_ip: '192.168.1.101',
    };

    const res1 = await fetch(`${baseUrl}/api/v1/integrations/zabbix-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadProblem),
    });
    const body1 = (await res1.json()) as any;
    expect(res1.status).toBe(200);
    expect(body1.action).toBe('INCIDENT_CREATED');
    expect(body1.canonicalCode).toBe('FM-FUS-01');
    expect(createIncSpy).toHaveBeenCalledTimes(1);

    const resDup = await fetch(`${baseUrl}/api/v1/integrations/zabbix-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadProblem),
    });
    const bodyDup = (await resDup.json()) as any;
    expect(resDup.status).toBe(200);
    expect(bodyDup.message).toContain('Idempotent');
    expect(createIncSpy).toHaveBeenCalledTimes(1);

    vi.spyOn(prisma.incident, 'findMany').mockResolvedValue([
      { id: 'inc-crit-1', printerId: 'RICOH-T1-01', severity: 'critical', status: 'OPEN', canonicalCode: 'FM-FUS-01' } as any,
    ]);
    vi.spyOn(prisma.incident, 'count').mockResolvedValue(1);
    const updateIncSpy = vi.spyOn(prisma.incident, 'update').mockResolvedValue({} as any);

    const resRec = await fetch(`${baseUrl}/api/v1/integrations/zabbix-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventid: 'evt-99002', event_value: '0', host_ip: '192.168.1.101' }),
    });
    expect(resRec.status).toBe(200);
    expect(updateIncSpy).not.toHaveBeenCalled();
  });
});
