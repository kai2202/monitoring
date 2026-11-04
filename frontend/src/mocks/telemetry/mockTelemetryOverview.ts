export interface MockLemonDevice {
  printerId: string;
  name: string;
  model: string;
  location: string;
  incidentCountLast30Days: number;
  criticalIncidentCount: number;
  totalDowntimeHours: number;
  availabilityPercent: number;
  reasons: string[];
  recommendedAction: 'Needs_Monitoring' | 'Replacement_Candidate';
}

export interface MockVolumeTrendPoint {
  date: string; // YYYY-MM-DD
  colorPages: number | null;
  monoPages: number | null;
  totalPages: number | null;
}

export interface MockAvailabilityPoint {
  timeLabel: string;
  onlineRate: number; // percentage
  onlineCount: number;
  offlineCount: number;
  warningCount?: number;
}

// 1. Xu hướng sản lượng in 30 ngày gần nhất
export const mockVolumeTrend: MockVolumeTrendPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(Date.now() - (29 - i) * 24 * 3600 * 1000);
  const dateStr = d.toISOString().split('T')[0];
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;

  // Cuối tuần sản lượng thấp hơn
  const baseMono = isWeekend ? 850 : 4200;
  const baseColor = isWeekend ? 210 : 1850;
  const variance = (i % 7) * 120;

  return {
    date: dateStr,
    colorPages: baseColor + variance,
    monoPages: baseMono + variance * 2,
    totalPages: baseColor + baseMono + variance * 3,
  };
});

// 2. Xu hướng tính khả dụng (Availability Timeline) 24 giờ qua
export const mockAvailabilityTimeline: MockAvailabilityPoint[] = [
  { timeLabel: '00:00', onlineRate: 97.1, onlineCount: 34, offlineCount: 1 },
  { timeLabel: '02:00', onlineRate: 97.1, onlineCount: 34, offlineCount: 1 },
  { timeLabel: '04:00', onlineRate: 97.1, onlineCount: 34, offlineCount: 1 },
  { timeLabel: '06:00', onlineRate: 97.1, onlineCount: 34, offlineCount: 1 },
  { timeLabel: '08:00', onlineRate: 94.3, onlineCount: 33, offlineCount: 2, warningCount: 3 },
  { timeLabel: '10:00', onlineRate: 91.4, onlineCount: 32, offlineCount: 3, warningCount: 4 },
  { timeLabel: '12:00', onlineRate: 91.4, onlineCount: 32, offlineCount: 3, warningCount: 4 },
  { timeLabel: '14:00', onlineRate: 94.3, onlineCount: 33, offlineCount: 2, warningCount: 3 },
  { timeLabel: '16:00', onlineRate: 94.3, onlineCount: 33, offlineCount: 2, warningCount: 2 },
  { timeLabel: '18:00', onlineRate: 97.1, onlineCount: 34, offlineCount: 1 },
  { timeLabel: '20:00', onlineRate: 97.1, onlineCount: 34, offlineCount: 1 },
  { timeLabel: '22:00', onlineRate: 97.1, onlineCount: 34, offlineCount: 1 },
];

// 3. Danh sách thiết bị hoạt động kém (Lemon Devices)
export const mockLemonDevices: MockLemonDevice[] = [
  {
    printerId: 'prt-008',
    name: 'Canon MF445dw - Kho Vận',
    model: 'imageCLASS MF445dw',
    location: 'Tầng 1 - Kho Hàng & Logistics',
    incidentCountLast30Days: 6,
    criticalIncidentCount: 4,
    totalDowntimeHours: 84.5,
    availabilityPercent: 82.3,
    reasons: [
      'Tần suất sự cố vượt ngưỡng (6 lần/tháng >= 5 lần)',
      'Thời gian ngừng hoạt động vượt quá 72 giờ (84.5 giờ)',
      'Tỷ lệ khả dụng dưới 85% (82.3%)',
    ],
    recommendedAction: 'Replacement_Candidate',
  },
  {
    printerId: 'prt-001',
    name: 'Ricoh MP C6004 - P.Kế toán',
    model: 'MP C6004',
    location: 'Tầng 1 - Phòng Kế toán & Tài chính',
    incidentCountLast30Days: 5,
    criticalIncidentCount: 2,
    totalDowntimeHours: 42.0,
    availabilityPercent: 91.2,
    reasons: [
      'Tần suất sự cố chạm ngưỡng (5 lần/tháng)',
      'Lỗi nhiệt cụm sấy SC541 tái diễn 2 lần',
    ],
    recommendedAction: 'Needs_Monitoring',
  },
  {
    printerId: 'prt-011',
    name: 'HP PageWide 556xh - P.Dự Án',
    model: 'PageWide Enterprise Color 556xh',
    location: 'Tầng 3 - Phòng Quản lý Dự án PMO',
    incidentCountLast30Days: 5,
    criticalIncidentCount: 1,
    totalDowntimeHours: 26.5,
    availabilityPercent: 94.8,
    reasons: [
      'Kẹt giấy liên tục khay 2 (5 lần báo lỗi cảm biến)',
    ],
    recommendedAction: 'Needs_Monitoring',
  },
];

// 4. Chỉ số độ tin cậy tổng thể
export const mockReliabilityStats = {
  totalFleetVolume30Days: 198450,
  averageFleetAvailability: 97.4,
  fleetMtbfHours: 320, // Giờ hoạt động trung bình giữa các lần hỏng
  healthyPrintersCount: 29,
  warningPrintersCount: 4,
  criticalPrintersCount: 2,
};

