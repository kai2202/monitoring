/**
 * backend/prisma/seed.ts
 *
 * Dữ liệu khởi tạo mẫu (Seed Data) chuẩn hóa cho FleetMonitor:
 * - 3 Tài khoản người dùng tương ứng 3 vai trò RBAC và mảng quyền chi tiết.
 * - Cấu hình đơn giá chi phí in ấn và mục tiêu SLA (CostRateConfig).
 * - Danh mục Chi nhánh & Sơ đồ Tầng (Trụ sở HQ 7 tầng và 2 chi nhánh).
 * - Dữ liệu máy in mẫu tích hợp Zabbix/SNMP và trạng thái vật tư CMYK (PrinterConsumable).
 * - Từ điển mã lỗi chuẩn hóa ban đầu (ErrorDictionary).
 */

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  console.log('[Seed] Bắt đầu nạp dữ liệu mẫu cho FleetMonitor...');

  // 1. Khởi tạo mật khẩu mã hóa chuẩn (Password mặc định: "Fleet@2026")
  const defaultPasswordHash = await bcrypt.hash('Fleet@2026', 10);

  // 2. Khởi tạo các Người dùng chuẩn với Phân quyền RBAC & Quyền chi tiết
  const users = [
    {
      username: 'admin',
      email: 'admin@fleetmonitor.vn',
      fullName: 'Nguyễn Văn An (Admin)',
      role: UserRole.ADMIN,
      passwordHash: defaultPasswordHash,
      permissions: [
        'csv:import_printers',
        'csv:import_errors',
        'csv:export_cost',
        'cost:view',
        'printers:relocate',
        'tasks:create',
        'tasks:approve',
        'users:manage',
      ],
      dataScope: { departmentIds: [], floorIds: [] },
    },
    {
      username: 'admin_an',
      email: 'an.nguyen@fleetmonitor.vn',
      fullName: 'Nguyễn Văn An',
      role: UserRole.ADMIN,
      passwordHash: defaultPasswordHash,
      permissions: [
        'csv:import_printers',
        'csv:import_errors',
        'csv:export_cost',
        'cost:view',
        'printers:relocate',
        'tasks:create',
        'tasks:approve',
        'users:manage',
      ],
      dataScope: { departmentIds: [], floorIds: [] },
    },
    {
      username: 'fieldtech',
      email: 'tech@fleetmonitor.vn',
      fullName: 'Lê Hoàng Nam (Field Tech)',
      role: UserRole.FIELD_TECH,
      passwordHash: defaultPasswordHash,
      permissions: [
        'tasks:execute',
        'worklog:create',
        'attachments:upload',
        'printers:view',
      ],
      dataScope: { departmentIds: ['IT', 'Technical'], floorIds: [] },
    },
    {
      username: 'tech_nam',
      email: 'nam.le@fleetmonitor.vn',
      fullName: 'Lê Hoàng Nam',
      role: UserRole.FIELD_TECH,
      passwordHash: defaultPasswordHash,
      // Quy tắc bảo mật: FIELD_TECH KHÔNG có 'cost:view' và KHÔNG có 'csv:import_*'
      permissions: [
        'tasks:execute',
        'worklog:create',
        'attachments:upload',
        'printers:view',
      ],
      dataScope: { departmentIds: ['IT', 'Technical'], floorIds: [] },
    },
    {
      username: 'assethr',
      email: 'hr@fleetmonitor.vn',
      fullName: 'Phạm Thu Hà (Asset HR)',
      role: UserRole.ASSET_HR,
      passwordHash: defaultPasswordHash,
      permissions: [
        'csv:export_cost',
        'cost:view',
        'printers:view',
        'sla:view',
      ],
      dataScope: { departmentIds: ['Finance', 'HR'], floorIds: [] },
    },
    {
      username: 'asset_ha',
      email: 'ha.pham@fleetmonitor.vn',
      fullName: 'Phạm Thu Hà',
      role: UserRole.ASSET_HR,
      passwordHash: defaultPasswordHash,
      permissions: [
        'csv:export_cost',
        'cost:view',
        'printers:view',
        'sla:view',
      ],
      dataScope: { departmentIds: ['Finance', 'HR'], floorIds: [] },
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        role: u.role,
        permissions: u.permissions,
        dataScope: u.dataScope,
      },
      create: u,
    });
  }
  console.log(`[Seed] Đã nạp ${users.length} tài khoản người dùng RBAC.`);

  // 3. Khởi tạo Cấu hình Đơn giá Chi phí & Mục tiêu SLA (CostRateConfig)
  const existingConfig = await prisma.costRateConfig.findFirst({
    orderBy: { effectiveDate: 'desc' },
  });

  if (!existingConfig) {
    await prisma.costRateConfig.create({
      data: {
        monoRatePerPage: 150.0,       // 150 VNĐ / trang đơn sắc
        colorRatePerPage: 1000.0,     // 1.000 VNĐ / trang in màu
        techHourlyRate: 150000.0,     // 150.000 VNĐ / giờ công KTV
        targetUptimePercent: 99.0,    // Cam kết SLA Uptime 99.0%
        effectiveDate: new Date(),
      },
    });
    console.log('[Seed] Đã nạp cấu hình đơn giá chi phí SLA mặc định.');
  }

  // 4. Khởi tạo Danh mục Chi nhánh & Sơ đồ Tầng
  const branches = [
    {
      name: 'Trụ sở chính (HQ)',
      code: 'HQ-HN',
      address: 'Tòa nhà Central Plaza, Hà Nội',
      isHq: true,
      floors: ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5', 'Tầng 6', 'Tầng 7'],
    },
    {
      name: 'Chi nhánh Miền Nam',
      code: 'BR-SGN',
      address: 'Quận 1, TP. Hồ Chí Minh',
      isHq: false,
      floors: ['Tầng Trệt', 'Tầng 1', 'Tầng 2', 'Tầng 3'],
    },
    {
      name: 'Chi nhánh Miền Trung',
      code: 'BR-DAD',
      address: 'Hải Châu, TP. Đà Nẵng',
      isHq: false,
      floors: ['Tầng 1', 'Tầng 2'],
    },
  ];

  for (const b of branches) {
    const branchRecord = await prisma.branch.upsert({
      where: { code: b.code },
      update: { name: b.name, address: b.address, isHq: b.isHq },
      create: { name: b.name, code: b.code, address: b.address, isHq: b.isHq },
    });

    for (const flName of b.floors) {
      await prisma.floor.upsert({
        where: {
          branchId_name: {
            branchId: branchRecord.id,
            name: flName,
          },
        },
        update: {},
        create: {
          branchId: branchRecord.id,
          name: flName,
        },
      });
    }
  }
  console.log('[Seed] Đã nạp danh mục Chi nhánh và các Tầng làm việc.');

  // 5. Khởi tạo Thiết bị Máy in mẫu với Cấu hình Zabbix & Vật tư CMYK
  const hqBranch = await prisma.branch.findUnique({ where: { code: 'HQ-HN' } });
  const t1Floor = hqBranch ? await prisma.floor.findFirst({ where: { branchId: hqBranch.id, name: 'Tầng 1' } }) : null;

  const samplePrinter = {
    id: 'RICOH-T1-01',
    name: 'Ricoh MP C6004 - P.Kế toán',
    ip: '192.168.1.101',
    model: 'MP C6004',
    mfr: 'Ricoh',
    deviceType: 'Laser Đa Năng (MFP)',
    serialNumber: 'RCH-C6004-98412',
    branch: 'Trụ sở chính',
    branchId: hqBranch?.id,
    location: 'Tầng 1 - Phòng Kế toán & Tài chính',
    department: 'Kế toán & Tài chính',
    floor: 'T1',
    floorId: t1Floor?.id,
    isColor: true,
    connectionStatus: 'Online',
    health: 'Warning',
    alertSeverity: 'warning',
    zabbixHostId: '10582',
    snmpCommunity: 'public',
    snmpPort: 161,
    syncStatus: 'SUCCESS',
    lastSyncTime: new Date(),
  };

  await prisma.printer.upsert({
    where: { id: samplePrinter.id },
    update: samplePrinter,
    create: samplePrinter,
  });

  // Nạp mức vật tư CMYK tiêu hao cho máy in mẫu
  await prisma.printerConsumable.upsert({
    where: { printerId: samplePrinter.id },
    update: {
      tonerBlack: 82.0,
      tonerCyan: 65.0,
      tonerMagenta: 18.0, // Cảnh báo mực thấp < 25%
      tonerYellow: 42.0,
      drumLifePercent: 78,
      fuserLifePercent: 88,
      wasteTonerStatus: 'OK',
      forecastExhaustionDate: new Date(Date.now() + 5 * 24 * 3600 * 1000), // 5 ngày nữa
      lastUpdated: new Date(),
    },
    create: {
      printerId: samplePrinter.id,
      tonerBlack: 82.0,
      tonerCyan: 65.0,
      tonerMagenta: 18.0,
      tonerYellow: 42.0,
      drumLifePercent: 78,
      fuserLifePercent: 88,
      wasteTonerStatus: 'OK',
      forecastExhaustionDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      lastUpdated: new Date(),
    },
  });
  console.log('[Seed] Đã nạp máy in mẫu và mức vật tư tiêu hao (PrinterConsumable).');

  // 6. Khởi tạo Từ điển mã lỗi chuẩn hóa mẫu
  const sampleErrors = [
    {
      vendor: 'Ricoh',
      rawCode: 'SC542',
      canonicalCode: 'FM-FUS-01',
      subsystem: 'FUS',
      descriptionVi: 'Lỗi nhiệt độ sấy warm-up không đạt ngưỡng cài đặt',
      severity: 'critical',
      isPaperJam: false,
      isCoverOpen: false,
      isConsumable: false,
    },
    {
      vendor: 'Canon',
      rawCode: 'E000-0001',
      canonicalCode: 'FM-FUS-01',
      subsystem: 'FUS',
      descriptionVi: 'Quá nhiệt hoặc hở mạch điện trở sấy nhiệt',
      severity: 'critical',
      isPaperJam: false,
      isCoverOpen: false,
      isConsumable: false,
    },
    {
      vendor: 'HP',
      rawCode: '13.00.00',
      canonicalCode: 'FM-FED-01',
      subsystem: 'FED',
      descriptionVi: 'Kẹt giấy liên tục khay nạp 2 (Tray 2 Pick Roller)',
      severity: 'warning',
      isPaperJam: true,
      isCoverOpen: false,
      isConsumable: false,
    },
  ];

  for (const err of sampleErrors) {
    await prisma.errorDictionary.upsert({
      where: {
        vendor_rawCode: {
          vendor: err.vendor,
          rawCode: err.rawCode,
        },
      },
      update: err,
      create: err,
    });
  }
  console.log('[Seed] Đã nạp từ điển mã lỗi chuẩn hóa ban đầu.');
  console.log('[Seed] Hoàn tất nạp dữ liệu mẫu thành công!');
}

main()
  .catch((e) => {
    console.error('[Seed] Lỗi khi nạp dữ liệu mẫu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
