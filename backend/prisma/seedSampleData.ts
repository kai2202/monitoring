/**
 * backend/prisma/seedSampleData.ts
 *
 * Dữ liệu khởi tạo vận hành chuẩn hóa (Printers, Consumables, CounterRollup 14d, Incidents, Tasks):
 * - Tách riêng và tối ưu hóa cấu trúc (< 200 LOC) theo AGENTS.md Rule 7.1.
 * - Bao gồm cả mã lỗi đã có trong CSV (`SC542`, `E000-0001`) và 2 mã lỗi thực tế chưa tích hợp CSV
 *   (`SC899` trên Ricoh & `50.2` trên HP) để Admin kiểm chứng ngay cơ chế đối chiếu tự động tại `/settings/dictionary`.
 */

import { PrismaClient, TaskPriority, TaskStatus } from '@prisma/client';

interface SeedPrinterConfig {
  id: string;
  name: string;
  ip: string;
  model: string;
  mfr: string;
  deviceType: string;
  serialNumber: string;
  location: string;
  department: string;
  floor: string;
  floorId?: string;
  isColor: boolean;
  health: string;
  alertSeverity: string;
  zabbixHostId: string;
  consumable: {
    tonerBlack: number | null;
    tonerCyan: number | null;
    tonerMagenta: number | null;
    tonerYellow: number | null;
    drumLifePercent: number;
    fuserLifePercent: number;
    wasteTonerStatus: string;
  };
  dailyMono: number;
  dailyColor: number;
}

export async function seedOperationalFleetData(
  prisma: PrismaClient,
  refs: {
    adminId: string;
    techId: string;
    techFullName: string;
    t1FloorId?: string;
    t2FloorId?: string;
    t3FloorId?: string;
    t4FloorId?: string;
    t5FloorId?: string;
  }
) {
  const now = new Date();

  const fleet: SeedPrinterConfig[] = [
    {
      id: 'RICOH-T1-01',
      name: 'Ricoh MP C6004 - P.Kế toán',
      ip: '192.168.1.101',
      model: 'MP C6004',
      mfr: 'Ricoh',
      deviceType: 'Laser Đa Năng (MFP)',
      serialNumber: 'RCH-C6004-98412',
      location: 'Tầng 1 - Phòng Kế toán & Tài chính',
      department: 'Kế toán & Tài chính',
      floor: 'T1',
      floorId: refs.t1FloorId,
      isColor: true,
      health: 'Critical',
      alertSeverity: 'critical',
      zabbixHostId: '10582',
      consumable: { tonerBlack: 78, tonerCyan: 62, tonerMagenta: 14, tonerYellow: 45, drumLifePercent: 76, fuserLifePercent: 84, wasteTonerStatus: 'OK' },
      dailyMono: 320,
      dailyColor: 140,
    },
    {
      id: 'CANON-T3-02',
      name: 'Canon iR-ADV C5550i - P.Marketing',
      ip: '192.168.1.102',
      model: 'iR-ADV C5550i',
      mfr: 'Canon',
      deviceType: 'Laser Đa Năng (MFP)',
      serialNumber: 'CNN-5550-44210',
      location: 'Tầng 3 - Kinh doanh & Marketing',
      department: 'Kinh doanh & Marketing',
      floor: 'T3',
      floorId: refs.t3FloorId,
      isColor: true,
      health: 'Warning',
      alertSeverity: 'warning',
      zabbixHostId: '10583',
      consumable: { tonerBlack: 54, tonerCyan: 11, tonerMagenta: 49, tonerYellow: 38, drumLifePercent: 68, fuserLifePercent: 72, wasteTonerStatus: 'WARNING' },
      dailyMono: 210,
      dailyColor: 260,
    },
    {
      id: 'HP-T2-03',
      name: 'HP LaserJet Enterprise M608dn - P.Nhân sự',
      ip: '192.168.1.103',
      model: 'LaserJet M608dn',
      mfr: 'HP',
      deviceType: 'A4 Laser Đơn Sắc',
      serialNumber: 'HPQ-M608-77129',
      location: 'Tầng 2 - Hành chính - Nhân sự',
      department: 'Hành chính - Nhân sự',
      floor: 'T2',
      floorId: refs.t2FloorId,
      isColor: false,
      health: 'Warning',
      alertSeverity: 'warning',
      zabbixHostId: '10584',
      consumable: { tonerBlack: 64, tonerCyan: null, tonerMagenta: null, tonerYellow: null, drumLifePercent: 81, fuserLifePercent: 65, wasteTonerStatus: 'OK' },
      dailyMono: 410,
      dailyColor: 0,
    },
    {
      id: 'BROTHER-T4-04',
      name: 'Brother MFC-L6900DW - P.Kỹ thuật',
      ip: '192.168.1.104',
      model: 'MFC-L6900DW',
      mfr: 'Brother',
      deviceType: 'Laser Đa Năng Đơn Sắc',
      serialNumber: 'BRT-6900-19283',
      location: 'Tầng 4 - Kỹ thuật & Vận hành',
      department: 'Kỹ thuật & Vận hành',
      floor: 'T4',
      floorId: refs.t4FloorId,
      isColor: false,
      health: 'Healthy',
      alertSeverity: 'info',
      zabbixHostId: '10585',
      consumable: { tonerBlack: 91, tonerCyan: null, tonerMagenta: null, tonerYellow: null, drumLifePercent: 93, fuserLifePercent: 95, wasteTonerStatus: 'OK' },
      dailyMono: 185,
      dailyColor: 0,
    },
    {
      id: 'EPSON-T5-05',
      name: 'Epson WorkForce Enterprise WF-C20590 - Ban Giám Đốc',
      ip: '192.168.1.105',
      model: 'WF-C20590',
      mfr: 'Epson',
      deviceType: 'Phun Siêu Tốc Đa Năng',
      serialNumber: 'EPS-20590-33821',
      location: 'Tầng 5 - Ban Giám Đốc',
      department: 'Ban Giám Đốc',
      floor: 'T5',
      floorId: refs.t5FloorId,
      isColor: true,
      health: 'Healthy',
      alertSeverity: 'info',
      zabbixHostId: '10586',
      consumable: { tonerBlack: 88, tonerCyan: 79, tonerMagenta: 82, tonerYellow: 85, drumLifePercent: 90, fuserLifePercent: 92, wasteTonerStatus: 'OK' },
      dailyMono: 150,
      dailyColor: 350,
    },
  ];

  for (const item of fleet) {
    const printerData = {
      id: item.id,
      name: item.name,
      ip: item.ip,
      model: item.model,
      mfr: item.mfr,
      deviceType: item.deviceType,
      serialNumber: item.serialNumber,
      building: 'Trụ sở chính',
      location: item.location,
      department: item.department,
      floor: item.floor,
      floorId: item.floorId,
      isColor: item.isColor,
      connectionStatus: 'Online',
      health: item.health,
      alertSeverity: item.alertSeverity,
      zabbixHostId: item.zabbixHostId,
      syncStatus: 'SUCCESS',
      lastSeenAt: now,
      lastSyncTime: now,
    };

    await prisma.printer.upsert({ where: { id: item.id }, update: printerData, create: printerData });
    await prisma.printerConsumable.upsert({
      where: { printerId: item.id },
      update: { ...item.consumable, lastUpdated: now },
      create: { printerId: item.id, ...item.consumable, lastUpdated: now },
    });

    let runningMono = 45000;
    let runningColor = item.isColor ? 18000 : 0;
    for (let d = 13; d >= 0; d--) {
      const recDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - d));
      const factor = recDate.getUTCDay() === 0 || recDate.getUTCDay() === 6 ? 0.25 : 1 + ((d % 3) - 1) * 0.15;
      const dMono = Math.round(item.dailyMono * factor);
      const dColor = item.isColor ? Math.round(item.dailyColor * factor) : 0;
      runningMono += dMono;
      runningColor += dColor;

      await prisma.counterRollup.upsert({
        where: { printerId_recordedDate: { printerId: item.id, recordedDate: recDate } },
        update: {},
        create: {
          printerId: item.id,
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
