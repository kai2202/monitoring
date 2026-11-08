/**
 * backend/prisma/seedEnterpriseExtensions.ts
 *
 * Dữ liệu khởi tạo phân hệ doanh nghiệp mở rộng (BE-09 đến BE-13):
 * - Vendors, Inventory Items, Department Budgets & Printer Contracts.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { PrismaClient } from '@prisma/client';

export async function seedEnterpriseExtensions(prisma: PrismaClient, refs: { adminId: string }) {
  console.log('[Seed] Khởi tạo dữ liệu Nhà cung cấp, Kho vật tư & Hợp đồng ngân sách...');

  // 1. Nhà cung cấp (Vendors)
  const vendors = [
    {
      name: 'Ricoh Việt Nam - Chi nhánh Hà Nội',
      code: 'RICOH-VN',
      contactPerson: 'Trần Văn Hoàng (Trưởng phòng Dịch vụ)',
      phone: '024-3942-8888',
      email: 'service.hn@ricoh.com.vn',
      address: 'Tòa nhà Charmvit, 117 Trần Duy Hưng, Cầu Giấy, Hà Nội',
      slaResponseHours: 4,
      rating: 4.8,
      notes: 'Hợp đồng bảo trì toàn diện dòng Ricoh MP Series và Pro Series',
    },
    {
      name: 'Công ty Cổ phần Đầu tư & Công nghệ An Khang (Canon Partner)',
      code: 'CANON-AK',
      contactPerson: 'Nguyễn Thị Minh Thư',
      phone: '024-3783-6688',
      email: 'support@ankhangcanon.vn',
      address: 'Số 18 Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
      slaResponseHours: 4,
      rating: 4.6,
      notes: 'Đại lý ủy quyền chính thức Canon iR-ADV và linh kiện vật tư tiêu hao',
    },
    {
      name: 'HP Enterprise Services Vietnam',
      code: 'HP-ENT',
      contactPerson: 'Lê Minh Tuấn',
      phone: '1800-588-868',
      email: 'vietnam.support@hp.com',
      address: 'Tầng 10, Tòa tháp Landmark 72, Nam Từ Liêm, Hà Nội',
      slaResponseHours: 2,
      rating: 4.9,
      notes: 'Hỗ trợ kỹ thuật 24/7 và bảo hành đổi phụ tùng tận nơi',
    },
  ];

  for (const v of vendors) {
    await prisma.vendor.upsert({
      where: { code: v.code },
      update: v,
      create: v,
    });
  }

  // 2. Danh mục kho vật tư tiêu hao (Inventory Items)
  const inventoryItems = [
    {
      sku: 'MP-C6004-BK',
      name: 'Hộp mực Ricoh MP C6004 Black (Đen)',
      category: 'TONER',
      compatibleModels: ['MP C6004', 'MP C4504', 'MP C5504'],
      currentStock: 12,
      safetyStock: 5,
      unit: 'Hộp',
      unitCost: 850000,
      location: 'Kho T1 - Kệ A1-01',
    },
    {
      sku: 'MP-C6004-CY',
      name: 'Hộp mực Ricoh MP C6004 Cyan (Xanh)',
      category: 'TONER',
      compatibleModels: ['MP C6004', 'MP C4504', 'MP C5504'],
      currentStock: 8,
      safetyStock: 3,
      unit: 'Hộp',
      unitCost: 950000,
      location: 'Kho T1 - Kệ A1-02',
    },
    {
      sku: 'GPR-55-BK',
      name: 'Hộp mực Canon NPG-71 / GPR-55 Black',
      category: 'TONER',
      compatibleModels: ['iR-ADV C5550i', 'iR-ADV C5535i'],
      currentStock: 6,
      safetyStock: 4,
      unit: 'Hộp',
      unitCost: 1100000,
      location: 'Kho T1 - Kệ B2-01',
    },
    {
      sku: 'W9004MC',
      name: 'Hộp mực HP LaserJet Managed Black (W9004MC)',
      category: 'TONER',
      compatibleModels: ['LaserJet MFP E82540', 'LaserJet E82550'],
      currentStock: 15,
      safetyStock: 5,
      unit: 'Hộp',
      unitCost: 1250000,
      location: 'Kho T1 - Kệ C1-03',
    },
    {
      sku: 'DR-3455',
      name: 'Cụm trống quang Brother Drum Unit DR-3455',
      category: 'DRUM',
      compatibleModels: ['HL-L6200DW', 'MFC-L6900DW'],
      currentStock: 4,
      safetyStock: 2,
      unit: 'Cụm',
      unitCost: 1600000,
      location: 'Kho T1 - Kệ D1-02',
    },
    {
      sku: 'FUS-RIC-C60',
      name: 'Cụm sấy nhiệt Ricoh Fuser Unit C6004',
      category: 'FUSER',
      compatibleModels: ['MP C6004'],
      currentStock: 2,
      safetyStock: 1,
      unit: 'Cụm',
      unitCost: 3800000,
      location: 'Kho T1 - Kệ D2-05',
    },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { sku: item.sku },
      update: item,
      create: item,
    });
  }

  // 3. Định mức ngân sách phòng ban (Department Budgets 2026)
  const budgets = [
    { department: 'Kế toán & Tài chính', monthlyQuotaVnd: 15000000, monthlyPageQuota: 60000, fiscalYear: 2026 },
    { department: 'Kinh doanh & Marketing', monthlyQuotaVnd: 25000000, monthlyPageQuota: 90000, fiscalYear: 2026 },
    { department: 'Kỹ thuật & Công nghệ', monthlyQuotaVnd: 12000000, monthlyPageQuota: 40000, fiscalYear: 2026 },
    { department: 'Hành chính & Nhân sự', monthlyQuotaVnd: 10000000, monthlyPageQuota: 35000, fiscalYear: 2026 },
    { department: 'Ban Giám đốc', monthlyQuotaVnd: 8000000, monthlyPageQuota: 20000, fiscalYear: 2026 },
  ];

  for (const b of budgets) {
    await prisma.departmentBudget.upsert({
      where: { department_fiscalYear: { department: b.department, fiscalYear: b.fiscalYear } },
      update: b,
      create: b,
    });
  }

  // 4. Hợp đồng thuê máy in (Printer Contracts)
  const ricohVendor = await prisma.vendor.findUnique({ where: { code: 'RICOH-VN' } });
  const canonVendor = await prisma.vendor.findUnique({ where: { code: 'CANON-AK' } });

  const contracts = [
    {
      contractNumber: 'CTR-2026-RCH01',
      vendorId: ricohVendor?.id,
      printerId: 'RICOH-T1-01',
      contractType: 'LEASE',
      monthlyRentalCost: 2500000,
      freePagesPerMonth: 5000,
      overageMonoRate: 120,
      overageColorRate: 900,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      status: 'ACTIVE',
    },
    {
      contractNumber: 'CTR-2026-CNN02',
      vendorId: canonVendor?.id,
      printerId: 'CANON-T3-02',
      contractType: 'LEASE',
      monthlyRentalCost: 3200000,
      freePagesPerMonth: 6000,
      overageMonoRate: 130,
      overageColorRate: 950,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      status: 'ACTIVE',
    },
  ];

  for (const c of contracts) {
    await prisma.printerContract.upsert({
      where: { contractNumber: c.contractNumber },
      update: c,
      create: c,
    });
  }

  console.log('[Seed] Hoàn tất nạp dữ liệu phân hệ doanh nghiệp mở rộng thành công!');
}

