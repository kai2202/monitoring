export interface BasePrinterMeta {
  id: string;
  name: string;
  model: string;
  brand: 'Ricoh' | 'Canon' | 'HP' | 'Brother' | 'Epson';
  department: string;
  ip: string;
  isColor: boolean;
  baseCapacity: number; // trang/tháng
  connectionStatus: 'Online' | 'Offline';
  uptimePercent: number;
  incidentCount: number;
}

export const DEPARTMENTS = [
  'Tầng Hầm B1 - Trung tâm In ấn & Chế bản',
  'Tầng 1 - Khối Kế toán & Tài chính',
  'Tầng 1 - Sảnh Lễ tân Tòa nhà',
  'Tầng 1 - Phòng Hành chính Nhân sự',
  'Tầng 1 - Kho Hàng & Logistics',
  'Tầng 2 - Khối Kinh doanh & Dự án',
  'Tầng 2 - Khối Marketing & Truyền thông',
  'Tầng 3 - Phòng Thiết kế & R&D',
  'Tầng 3 - Khối Pháp chế & Tuân thủ',
  'Tầng 4 - Ban Giám đốc & Điều hành',
  'Tầng 4 - Trung tâm Dữ liệu & IT',
  'Tòa nhà B - Khối Vận hành Chi nhánh',
];

export const MODELS_BY_BRAND: Record<string, { model: string; name: string; isColor: boolean; capacity: number }[]> = {
  Ricoh: [
    { model: 'Pro C7200s', name: 'Trung tâm In ấn Công nghiệp', isColor: true, capacity: 85000 },
    { model: 'MP C6004', name: 'Máy in Đa năng Văn phòng', isColor: true, capacity: 25000 },
    { model: 'MP 3055', name: 'Máy in Đơn sắc Phòng ban', isColor: false, capacity: 18000 },
    { model: 'MP C4503', name: 'Máy in Màu Tốc độ cao', isColor: true, capacity: 32000 },
    { model: 'IM C3000', name: 'Máy in Kỹ thuật số Thế hệ mới', isColor: true, capacity: 22000 },
  ],
  Canon: [
    { model: 'iR-ADV C5560i', name: 'imageRUNNER ADVANCE C5560i', isColor: true, capacity: 45000 },
    { model: 'iR-ADV C5535i', name: 'imageRUNNER ADVANCE C5535i', isColor: true, capacity: 28000 },
    { model: 'imageCLASS MF445dw', name: 'Máy in Laser Đơn năng Mini', isColor: false, capacity: 12000 },
    { model: 'PRO-4100', name: 'Máy in Khổ lớn Large Format', isColor: true, capacity: 15000 },
    { model: 'iR 2625i', name: 'imageRUNNER Đơn sắc', isColor: false, capacity: 20000 },
  ],
  HP: [
    { model: 'LaserJet M608dn', name: 'LaserJet Enterprise M608dn', isColor: false, capacity: 35000 },
    { model: 'PageWide 556xh', name: 'PageWide Enterprise Color 556xh', isColor: true, capacity: 30000 },
    { model: 'LaserJet E87640', name: 'Color LaserJet Managed MFP', isColor: true, capacity: 40000 },
    { model: 'LaserJet Pro M404dn', name: 'Workgroup Printer M404dn', isColor: false, capacity: 10000 },
  ],
  Brother: [
    { model: 'HL-L6200DW', name: 'Laser High-Speed Workhorse', isColor: false, capacity: 15000 },
    { model: 'MFC-L8900CDW', name: 'Color All-in-One MFP', isColor: true, capacity: 18000 },
  ],
  Epson: [
    { model: 'WorkForce Pro WF-C879R', name: 'WorkForce Enterprise Inkjet', isColor: true, capacity: 28000 },
  ],
};

export const BRANDS = ['Ricoh', 'Canon', 'HP', 'Brother', 'Epson'] as const;

// 1. Sinh danh sách 120 máy in tiêu biểu mô phỏng quy mô lớn (đủ sức kéo đến 1.000 máy)
export const mockFleetPrinters: BasePrinterMeta[] = Array.from({ length: 120 }, (_, idx) => {
  const num = idx + 1;
  const id = `prt-${String(num).padStart(3, '0')}`;
  const brand = BRANDS[idx % BRANDS.length];
  const modelList = MODELS_BY_BRAND[brand];
  const modelInfo = modelList[idx % modelList.length];
  const dept = DEPARTMENTS[idx % DEPARTMENTS.length];
  const ip = `192.168.${Math.floor(idx / 50) + 1}.${(idx % 50) + 10}`;

  // Giả lập trạng thái hoạt động thực tế
  const isOffline = idx === 7 || idx === 23 || idx === 64; // một vài máy offline
  const incidentCount = idx === 7 ? 6 : idx === 1 ? 5 : (idx % 8 === 0 ? 3 : idx % 3 === 0 ? 1 : 0);
  const uptimePercent = isOffline ? 82.3 : Number((95 + (idx % 5) * 0.9).toFixed(1));

  return {
    id,
    name: `${brand} ${modelInfo.model} - ${dept.split(' - ')[1] || dept}`,
    model: modelInfo.model,
    brand,
    department: dept,
    ip,
    isColor: modelInfo.isColor,
    baseCapacity: modelInfo.capacity,
    connectionStatus: isOffline ? 'Offline' : 'Online',
    uptimePercent,
    incidentCount,
  };
});

// Cache cho sản lượng hàng ngày của từng máy in (30 ngày qua)
export interface DailyRecord {
  date: string;
  total: number;
  color: number;
  mono: number;
}

export const printerDailyCache = new Map<string, DailyRecord[]>();

export function getPrinterDailyVolume(printer: BasePrinterMeta): DailyRecord[] {
  if (printerDailyCache.has(printer.id)) {
    return printerDailyCache.get(printer.id)!;
  }

  const records: DailyRecord[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    // Sản lượng theo năng lực máy
    const dailyBase = Math.round(printer.baseCapacity / 30);
    const dayFactor = isWeekend ? 0.15 : 0.85 + ((i + parseInt(printer.id.slice(4) || '0', 10)) % 5) * 0.08;
    const total = Math.max(0, Math.round(dailyBase * dayFactor));

    let color = 0;
    let mono = total;

    if (printer.isColor) {
      const colorRatio = 0.35 + ((i % 4) * 0.05);
      color = Math.round(total * colorRatio);
      mono = total - color;
    }

    records.push({ date: dateStr, total, color, mono });
  }

  printerDailyCache.set(printer.id, records);
  return records;
}

