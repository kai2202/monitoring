export interface PrinterDailyVolumePoint {
  date: string;
  pages: number;
  colorPages: number;
  monoPages: number;
}

export interface MockTopPrinterVolume {
  rank: number;
  printerId: string;
  name: string;
  shortName: string;
  model: string;
  mfr: string;
  location: string;
  monthlyVolume: number;
  monoPages: number;
  colorPages: number;
  percentageOfFleet: number;
  color: string;
  dailyVolume: PrinterDailyVolumePoint[];
}

// Hàm sinh 30 ngày dữ liệu phân tách sản lượng in thực tế cho từng máy in
export const generatePrinterDailyPoints = (
  monthlyVolume: number,
  colorPagesRatio: number,
  seed: number
): PrinterDailyVolumePoint[] => {
  const avgDaily = monthlyVolume / 22; // ~22 ngày làm việc / tháng
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 24 * 3600 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    const factor = isWeekend ? 0.08 : 0.72 + ((i * 3 + seed * 7) % 11) * 0.06;
    const pages = Math.round(avgDaily * factor);
    const color = Math.round(pages * colorPagesRatio);
    const mono = pages - color;

    return {
      date: dateStr,
      pages,
      colorPages: color,
      monoPages: mono,
    };
  });
};

// 5. Bảng xếp hạng Top sản lượng in 30 ngày (Top Printers by Volume)
export const mockTopPrintersVolume: MockTopPrinterVolume[] = [
  {
    rank: 1,
    printerId: 'prt-004',
    name: 'Ricoh Pro C7200s - Trung tâm In ấn',
    shortName: 'Pro C7200s (Hầm B1)',
    model: 'Pro C7200s',
    mfr: 'Ricoh',
    location: 'Tầng Hầm B1 - Trung tâm Chế bản In ấn',
    monthlyVolume: 85000,
    monoPages: 52000,
    colorPages: 33000,
    percentageOfFleet: 42.8,
    color: '#0284c7', // Sky Blue
    dailyVolume: generatePrinterDailyPoints(85000, 33000 / 85000, 1),
  },
  {
    rank: 2,
    printerId: 'prt-021',
    name: 'Canon iR-ADV C5560i - P.Kinh Doanh',
    shortName: 'iR-ADV C5560i (T2)',
    model: 'iR-ADV C5560i',
    mfr: 'Canon',
    location: 'Tầng 2 - Khối Kinh Doanh & Dự Án',
    monthlyVolume: 28400,
    monoPages: 17000,
    colorPages: 11400,
    percentageOfFleet: 14.3,
    color: '#7c3aed', // Purple
    dailyVolume: generatePrinterDailyPoints(28400, 11400 / 28400, 2),
  },
  {
    rank: 3,
    printerId: 'prt-015',
    name: 'HP LaserJet M608dn - P.IT Server Room',
    shortName: 'LaserJet M608dn (T4)',
    model: 'LaserJet Enterprise M608dn',
    mfr: 'HP',
    location: 'Tầng 4 - Trung tâm Dữ liệu & IT',
    monthlyVolume: 22100,
    monoPages: 22100,
    colorPages: 0,
    percentageOfFleet: 11.1,
    color: '#ea580c', // Orange
    dailyVolume: generatePrinterDailyPoints(22100, 0, 3),
  },
  {
    rank: 4,
    printerId: 'prt-001',
    name: 'Ricoh MP C6004 - P.Kế toán',
    shortName: 'MP C6004 (Kế toán)',
    model: 'MP C6004',
    mfr: 'Ricoh',
    location: 'Tầng 1 - Phòng Kế toán & Tài chính',
    monthlyVolume: 14250,
    monoPages: 9200,
    colorPages: 5050,
    percentageOfFleet: 7.2,
    color: '#16a34a', // Emerald Green
    dailyVolume: generatePrinterDailyPoints(14250, 5050 / 14250, 4),
  },
  {
    rank: 5,
    printerId: 'prt-002',
    name: 'Ricoh MP C6004 - P.Nhân sự',
    shortName: 'MP C6004 (Nhân sự)',
    model: 'MP C6004',
    mfr: 'Ricoh',
    location: 'Tầng 1 - Phòng Hành chính Nhân sự',
    monthlyVolume: 9800,
    monoPages: 6400,
    colorPages: 3400,
    percentageOfFleet: 4.9,
    color: '#e11d48', // Rose Red
    dailyVolume: generatePrinterDailyPoints(9800, 3400 / 9800, 5),
  },
  {
    rank: 6,
    printerId: 'prt-003',
    name: 'Ricoh MP 3055 - Sảnh Lễ tân',
    shortName: 'MP 3055 (Lễ tân)',
    model: 'MP 3055',
    mfr: 'Ricoh',
    location: 'Tầng 1 - Sảnh Lễ tân Tòa nhà',
    monthlyVolume: 8200,
    monoPages: 8200,
    colorPages: 0,
    percentageOfFleet: 4.1,
    color: '#0d9488', // Teal
    dailyVolume: generatePrinterDailyPoints(8200, 0, 6),
  },
  {
    rank: 7,
    printerId: 'prt-022',
    name: 'Canon imageRUNNER 2630i - P.Marketing',
    shortName: 'iR 2630i (Marketing)',
    model: 'imageRUNNER 2630i',
    mfr: 'Canon',
    location: 'Tầng 3 - Phòng Marketing & Sáng tạo',
    monthlyVolume: 7600,
    monoPages: 3500,
    colorPages: 4100,
    percentageOfFleet: 3.8,
    color: '#d97706', // Amber
    dailyVolume: generatePrinterDailyPoints(7600, 4100 / 7600, 7),
  },
  {
    rank: 8,
    printerId: 'prt-011',
    name: 'HP PageWide 556xh - P.Dự Án',
    shortName: 'PageWide 556xh (Dự án)',
    model: 'PageWide Enterprise Color 556xh',
    mfr: 'HP',
    location: 'Tầng 3 - Phòng Quản lý Dự án PMO',
    monthlyVolume: 6900,
    monoPages: 3700,
    colorPages: 3200,
    percentageOfFleet: 3.5,
    color: '#4f46e5', // Indigo
    dailyVolume: generatePrinterDailyPoints(6900, 3200 / 6900, 8),
  },
  {
    rank: 9,
    printerId: 'prt-005',
    name: 'Ricoh MP 5055 - Kho Vận',
    shortName: 'MP 5055 (Kho Vận)',
    model: 'MP 5055',
    mfr: 'Ricoh',
    location: 'Tầng 1 - Khu Vực Kho Vận & Tiếp Nhận',
    monthlyVolume: 6100,
    monoPages: 6100,
    colorPages: 0,
    percentageOfFleet: 3.1,
    color: '#db2777', // Pink Magenta
    dailyVolume: generatePrinterDailyPoints(6100, 0, 9),
  },
  {
    rank: 10,
    printerId: 'prt-031',
    name: 'Brother MFC-L8900CDW - P.Giám Đốc',
    shortName: 'MFC-L8900CDW (P.GĐ)',
    model: 'MFC-L8900CDW',
    mfr: 'Brother',
    location: 'Tầng 5 - Ban Tổng Giám Đốc',
    monthlyVolume: 5200,
    monoPages: 2400,
    colorPages: 2800,
    percentageOfFleet: 2.6,
    color: '#059669', // Mint Jade
    dailyVolume: generatePrinterDailyPoints(5200, 2800 / 5200, 10),
  },
];

// Alias tương thích cho MockDataProvider
export const mockVolumeRankings = mockTopPrintersVolume;


