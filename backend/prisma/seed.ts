/**
 * backend/prisma/seed.ts
 *
 * Dữ liệu khởi tạo chuẩn hóa (Seed Data) cho FleetMonitor:
 * - 6 Tài khoản người dùng RBAC (Admin, Field Tech, Asset HR).
 * - Cấu hình đơn giá chi phí in ấn và mục tiêu SLA (`CostRateConfig`).
 * - Danh mục Chi nhánh & Sơ đồ Tầng (`Branch`, `Floor`).
 * - Bộ từ điển mã lỗi CSV khởi tạo (`ErrorDictionary`) & dữ liệu vận hành mẫu (`seedSampleData.ts`).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedOperationalFleetData } from './seedSampleData';

const prisma = new PrismaClient();

export async function main() {
  console.log('[Seed] Bắt đầu nạp dữ liệu khởi tạo cho FleetMonitor...');

  const defaultPasswordHash = await bcrypt.hash('Fleet@2026', 10);

  const adminPerms = [
    'csv:import_printers',
    'csv:import_errors',
    'csv:export_cost',
    'cost:view',
    'printers:relocate',
    'tasks:create',
    'tasks:approve',
    'users:manage',
  ];
  const techPerms = ['tasks:execute', 'worklog:create', 'attachments:upload', 'printers:view'];
  const hrPerms = ['csv:export_cost', 'cost:view', 'printers:view', 'sla:view'];

  const users = [
    {
      username: 'admin',
      email: 'admin@fleetmonitor.vn',
      fullName: 'Nguyễn Văn An (Admin)',
      role: UserRole.ADMIN,
      passwordHash: defaultPasswordHash,
      permissions: adminPerms,
      dataScope: { departmentIds: [], floorIds: [] },
    },
    {
      username: 'admin_an',
      email: 'an.nguyen@fleetmonitor.vn',
      fullName: 'Nguyễn Văn An',
      role: UserRole.ADMIN,
      passwordHash: defaultPasswordHash,
      permissions: adminPerms,
      dataScope: { departmentIds: [], floorIds: [] },
    },
    {
      username: 'fieldtech',
      email: 'tech@fleetmonitor.vn',
      fullName: 'Lê Hoàng Nam (Field Tech)',
      role: UserRole.FIELD_TECH,
      passwordHash: defaultPasswordHash,
      permissions: techPerms,
      dataScope: { departmentIds: ['IT', 'Technical'], floorIds: [] },
    },
    {
      username: 'tech_nam',
      email: 'nam.le@fleetmonitor.vn',
      fullName: 'Lê Hoàng Nam',
      role: UserRole.FIELD_TECH,
      passwordHash: defaultPasswordHash,
      permissions: techPerms,
      dataScope: { departmentIds: ['IT', 'Technical'], floorIds: [] },
    },
    {
      username: 'assethr',
      email: 'hr@fleetmonitor.vn',
      fullName: 'Phạm Thu Hà (Asset HR)',
      role: UserRole.ASSET_HR,
      passwordHash: defaultPasswordHash,
      permissions: hrPerms,
      dataScope: { departmentIds: ['Finance', 'HR'], floorIds: [] },
    },
    {
      username: 'asset_ha',
      email: 'ha.pham@fleetmonitor.vn',
      fullName: 'Phạm Thu Hà',
      role: UserRole.ASSET_HR,
      passwordHash: defaultPasswordHash,
      permissions: hrPerms,
      dataScope: { departmentIds: ['Finance', 'HR'], floorIds: [] },
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: { role: u.role, permissions: u.permissions, dataScope: u.dataScope },
      create: u,
    });
  }

  const adminUser = await prisma.user.findUniqueOrThrow({ where: { username: 'admin' } });
  const techUser = await prisma.user.findUniqueOrThrow({ where: { username: 'tech_nam' } });

  const existingConfig = await prisma.costRateConfig.findFirst({ orderBy: { effectiveDate: 'desc' } });
  if (!existingConfig) {
    await prisma.costRateConfig.create({
      data: {
        monoRatePerPage: 150.0,
        colorRatePerPage: 1000.0,
        techHourlyRate: 150000.0,
        targetUptimePercent: 99.0,
        effectiveDate: new Date(),
      },
    });
  }

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
        where: { branchId_name: { branchId: branchRecord.id, name: flName } },
        update: {},
        create: { branchId: branchRecord.id, name: flName },
      });
    }
  }

  const sampleErrors = [
    {
      vendor: 'Ricoh',
      rawCode: 'SC542',
      canonicalCode: 'FM-FUS-01',
      subsystem: 'Fuser',
      descriptionVi: 'Lỗi nhiệt độ sấy warm-up không đạt ngưỡng cài đặt',
      severity: 'critical',
      isPaperJam: false,
      isCoverOpen: false,
      isConsumable: false,
    },
    {
      vendor: 'Canon',
      rawCode: 'E000-0001',
      canonicalCode: 'FM-FUS-02',
      subsystem: 'Fuser',
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
      subsystem: 'Paper_Feed',
      descriptionVi: 'Kẹt giấy liên tục khay nạp 2 (Tray 2 Pick Roller)',
      severity: 'warning',
      isPaperJam: true,
      isCoverOpen: false,
      isConsumable: false,
    },
  ];

  for (const err of sampleErrors) {
    await prisma.errorDictionary.upsert({
      where: { vendor_rawCode: { vendor: err.vendor, rawCode: err.rawCode } },
      update: err,
      create: err,
    });
  }

  const hqBranch = await prisma.branch.findUnique({ where: { code: 'HQ-HN' } });
  const sgnBranch = await prisma.branch.findUnique({ where: { code: 'BR-SGN' } });
  const t1Floor = hqBranch
    ? await prisma.floor.findFirst({ where: { branchId: hqBranch.id, name: 'Tầng 1' } })
    : null;
  const t2Floor = hqBranch
    ? await prisma.floor.findFirst({ where: { branchId: hqBranch.id, name: 'Tầng 2' } })
    : null;
  const t3Floor = hqBranch
    ? await prisma.floor.findFirst({ where: { branchId: hqBranch.id, name: 'Tầng 3' } })
    : null;

  await seedOperationalFleetData(prisma, {
    adminId: adminUser.id,
    techId: techUser.id,
    techFullName: techUser.fullName,
    hqBranchId: hqBranch?.id,
    sgnBranchId: sgnBranch?.id,
    t1FloorId: t1Floor?.id,
    t2FloorId: t2Floor?.id,
    t3FloorId: t3Floor?.id,
  });

  console.log('[Seed] Hoàn tất nạp dữ liệu khởi tạo thành công!');
}

main()
  .catch((e) => {
    console.error('[Seed] Lỗi khi nạp dữ liệu mẫu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
