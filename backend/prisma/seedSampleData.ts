/**
 * backend/prisma/seedSampleData.ts
 *
 * Dữ liệu khởi tạo vận hành chuẩn hóa (Printers, Consumables, CounterRollup 14d, Incidents, Tasks):
 * - Tách riêng để giữ `seed.ts` gọn nhẹ (< 200 LOC) theo AGENTS.md Rule 7.1.
 * - Bao gồm cả mã lỗi đã có trong CSV (`SC542`, `E000-0001`) và 2 mã lỗi thực tế chưa tích hợp CSV
 *   (`SC899` trên Ricoh & `50.2` trên HP) để Admin kiểm chứng ngay cơ chế đối chiếu tự động tại `/settings/dictionary`.
 */

import { PrismaClient, TaskPriority, TaskStatus } from '@prisma/client';

export async function seedOperationalFleetData(
  prisma: PrismaClient,
  refs: {
    adminId: string;
    techId: string;
    techFullName: string;
    hqBranchId?: string;
    sgnBranchId?: string;
    t1FloorId?: string;
    t2FloorId?: string;
    t3FloorId?: string;
  }
) {
  const now = new Date();

  // 1. Danh mục 5 máy in đa hãng (Ricoh, Canon, HP, Brother)
  const fleet = [
    {
      printer: {
        id: 'RICOH-T1-01',
        name: 'Ricoh MP C6004 - P.Kế toán',
        ip: '192.168.1.101',
        model: 'MP C6004',
        mfr: 'Ricoh',
        deviceType: 'Laser Đa Năng (MFP)',
        serialNumber: 'RCH-C6004-98412',
        branch: 'Trụ sở chính (HQ)',
        branchId: refs.hqBranchId,
        location: 'Tầng 1 - Phòng Kế toán & Tài chính',
        department: 'Kế toán & Tài chính',
        floor: 'Tầng 1',
        floorId: refs.t1FloorId,
        isColor: true,
        connectionStatus: 'Online',
        health: 'Critical',
        alertSeverity: 'critical',
        zabbixHostId: '10582',
        syncStatus: 'SUCCESS',
        lastSeenAt: now,
        lastSyncTime: now,
      },
      consumable: {
        tonerBlack: 78,
        tonerCyan: 62,
        tonerMagenta: 14,
        tonerYellow: 45,
        drumLifePercent: 76,
        fuserLifePercent: 84,
        wasteTonerStatus: 'OK',
      },
      dailyMono: 320,
      dailyColor: 140,
    },
    {
      printer: {
        id: 'CANON-T3-02',
        name: 'Canon iR-ADV C5550i - P.Marketing',
        ip: '192.168.1.102',
        model: 'iR-ADV C5550i',
        mfr: 'Canon',
        deviceType: 'Laser Đa Năng (MFP)',
        serialNumber: 'CNN-5550-44210',
        branch: 'Trụ sở chính (HQ)',
        branchId: refs.hqBranchId,
        location: 'Tầng 3 - Kinh doanh & Marketing',
        department: 'Kinh doanh & Marketing',
        floor: 'Tầng 3',
        floorId: refs.t3FloorId,
        isColor: true,
        connectionStatus: 'Online',
        health: 'Warning',
        alertSeverity: 'warning',
        zabbixHostId: '10583',
        syncStatus: 'SUCCESS',
        lastSeenAt: now,
        lastSyncTime: now,
      },
      consumable: {
        tonerBlack: 54,
        tonerCyan: 11,
        tonerMagenta: 49,
        tonerYellow: 38,
        drumLifePercent: 68,
        fuserLifePercent: 72,
        wasteTonerStatus: 'WARNING',
      },
      dailyMono: 210,
      dailyColor: 260,
    },
    {
      printer: {
        id: 'HP-T2-03',
        name: 'HP LaserJet Enterprise M608dn - P.Nhân sự',
        ip: '192.168.1.103',
        model: 'LaserJet M608dn',
        mfr: 'HP',
        deviceType: 'A4 Laser Đơn Sắc',
        serialNumber: 'HPQ-M608-77129',
        branch: 'Trụ sở chính (HQ)',
        branchId: refs.hqBranchId,
        location: 'Tầng 2 - Hành chính - Nhân sự',
        department: 'Hành chính - Nhân sự',
        floor: 'Tầng 2',
        floorId: refs.t2FloorId,
        isColor: false,
        connectionStatus: 'Online',
        health: 'Warning',
        alertSeverity: 'warning',
        zabbixHostId: '10584',
        syncStatus: 'SUCCESS',
        lastSeenAt: now,
        lastSyncTime: now,
      },
      consumable: {
        tonerBlack: 64,
        tonerCyan: null,
        tonerMagenta: null,
        tonerYellow: null,
        drumLifePercent: 81,
        fuserLifePercent: 65,
        wasteTonerStatus: 'OK',
      },
      dailyMono: 410,
      dailyColor: 0,
    },
    {
      printer: {
        id: 'BROTHER-SGN-04',
        name: 'Brother MFC-L6900DW - CN Miền Nam',
        ip: '10.20.1.55',
        model: 'MFC-L6900DW',
        mfr: 'Brother',
        deviceType: 'Laser Đa Năng Đơn Sắc',
        serialNumber: 'BRT-6900-19283',
        branch: 'Chi nhánh Miền Nam',
        branchId: refs.sgnBranchId,
        location: 'Tầng 1 - Chăm sóc Khách hàng',
        department: 'Chăm sóc Khách hàng',
        floor: 'Tầng 1',
        isColor: false,
        connectionStatus: 'Online',
        health: 'Healthy',
        alertSeverity: 'info',
        zabbixHostId: '10585',
        syncStatus: 'SUCCESS',
        lastSeenAt: now,
        lastSyncTime: now,
      },
      consumable: {
        tonerBlack: 91,
        tonerCyan: null,
        tonerMagenta: null,
        tonerYellow: null,
        drumLifePercent: 93,
        fuserLifePercent: 95,
        wasteTonerStatus: 'OK',
      },
      dailyMono: 185,
      dailyColor: 0,
    },
  ];

  for (const item of fleet) {
    await prisma.printer.upsert({
      where: { id: item.printer.id },
      update: item.printer,
      create: item.printer,
    });

    await prisma.printerConsumable.upsert({
      where: { printerId: item.printer.id },
      update: { ...item.consumable, lastUpdated: now },
      create: { printerId: item.printer.id, ...item.consumable, lastUpdated: now },
    });

    // Nạp 14 ngày CounterRollup thực tế
    let runningMono = 45000;
    let runningColor = item.printer.isColor ? 18000 : 0;
    for (let d = 13; d >= 0; d--) {
      const recDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - d));
      const factor = recDate.getUTCDay() === 0 || recDate.getUTCDay() === 6 ? 0.25 : 1 + ((d % 3) - 1) * 0.15;
      const dMono = Math.round(item.dailyMono * factor);
      const dColor = item.printer.isColor ? Math.round(item.dailyColor * factor) : 0;
      runningMono += dMono;
      runningColor += dColor;

      await prisma.counterRollup.upsert({
        where: { printerId_recordedDate: { printerId: item.printer.id, recordedDate: recDate } },
        update: {},
        create: {
          printerId: item.printer.id,
          recordedDate: recDate,
          monoPages: runningMono,
          colorPages: runningColor,
          scanPages: Math.round(dMono * 0.2),
          totalPages: runningMono + runningColor,
          deltaMono: dMono,
          deltaColor: dColor,
        },
      });
    }
  }

  // 2. Khởi tạo Sự cố mẫu (bao gồm mã đã ánh xạ SC542 và 2 mã chưa tích hợp CSV: SC899, 50.2)
  const existingIncidents = await prisma.incident.count();
  if (existingIncidents === 0) {
    const incSc542 = await prisma.incident.create({
      data: {
        printerId: 'RICOH-T1-01',
        errorCode: 'SC542',
        canonicalCode: 'FM-FUS-01',
        subsystem: 'FUS',
        severity: 'critical',
        status: 'OPEN',
        title: 'Ricoh Fuser Warm-up Error SC542',
        description: 'Lỗi nhiệt độ sấy warm-up không đạt ngưỡng cài đặt',
      },
    });

    await prisma.incident.createMany({
      data: [
        {
          printerId: 'RICOH-T1-01',
          errorCode: 'SC899',
          canonicalCode: 'FM-UNK-01',
          subsystem: 'CTL',
          severity: 'warning',
          status: 'OPEN',
          title: 'Controller ASIC Watchdog Timeout [SC899]',
          description: 'Mã lỗi phần cứng Ricoh chưa tích hợp vào bộ CSV hiện hành (SC899)',
        },
        {
          printerId: 'HP-T2-03',
          errorCode: '50.2',
          canonicalCode: 'FM-UNK-01',
          subsystem: 'FUS',
          severity: 'critical',
          status: 'OPEN',
          title: 'HP Slow Fuser Warmup Error 50.2',
          description: 'Mã lỗi phần cứng HP chưa tích hợp vào bộ CSV hiện hành (50.2)',
        },
      ],
    });

    await prisma.task.create({
      data: {
        id: 'TASK-SEED01',
        printerId: 'RICOH-T1-01',
        incidentId: incSc542.id,
        title: 'Kiểm tra cụm sấy Fuser & cảm biến nhiệt SC542',
        taskType: 'HARDWARE_REPAIR',
        priority: TaskPriority.P1_Urgent,
        status: TaskStatus.In_Progress,
        assigneeId: refs.techId,
        assigneeName: refs.techFullName,
        dueDate: new Date(Date.now() + 2 * 86_400_000),
        progressPercent: 50,
        dynamicSteps: [
          { id: 's-1', title: 'Đo thông mạch cầu chì nhiệt & Thermistor khối sấy', isCompleted: true },
          { id: 's-2', title: 'Vệ sinh trục ép & chạy in test 20 bản kiểm chứng', isCompleted: false },
        ],
        timeAndCost: { estimatedHours: 1.5, actualHours: 0.5, partsCostVnd: 0, totalCostVnd: 75000 },
      },
    });
  }

  // 3. Lưu vết đợt nạp CSV khởi tạo để hiển thị thời gian nạp rõ ràng trên UI
  const existingCsvJob = await prisma.csvImportJob.count({ where: { entityType: 'ERROR_DICT' } });
  if (existingCsvJob === 0) {
    await prisma.csvImportJob.create({
      data: {
        fileName: 'error_dictionary_initial_v1.csv',
        uploadedById: refs.adminId,
        entityType: 'ERROR_DICT',
        totalRows: 3,
        validRows: 3,
        errorRows: 0,
        status: 'COMPLETED',
        completedAt: now,
      },
    });
  }
}

