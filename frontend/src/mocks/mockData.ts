import rawPrinters from '../../../mocks/printers.json';
import rawIncidents from '../../../mocks/incidents.json';
import rawTelemetry from '../../../mocks/telemetry.json';
import {
  Printer,
  Incident,
  PrinterTelemetryResponse,
  VolumeTimeframe,
  TimeframeType,
  TelemetryBucket,
} from '../types/printer';
import { AvailabilityDataPoint } from '../services/fleetService';

export const mockPrinters: Printer[] = rawPrinters as unknown as Printer[];
export const mockIncidents: Incident[] = rawIncidents as unknown as Incident[];
export const mockTelemetry: PrinterTelemetryResponse[] = (rawTelemetry as { telemetryList: unknown[] }).telemetryList as unknown as PrinterTelemetryResponse[];

/**
 * Tạo dữ liệu chuỗi thời gian khả dụng (Availability Timeline) phục vụ
 * biểu đồ "XU HƯỚNG TÍNH SẴN SÀNG TOÀN HỆ THỐNG" trên Dashboard
 */
export function generateMockAvailabilityTimeline(timeframe: TimeframeType): AvailabilityDataPoint[] {
  let labels: string[] = [];

  switch (timeframe) {
    case '1h':
      labels = ['-50m', '-40m', '-30m', '-20m', '-10m', 'Hiện tại'];
      break;
    case '6h':
      labels = ['-5h', '-4h', '-3h', '-2h', '-1h', 'Hiện tại'];
      break;
    case '24h':
      labels = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', 'Hiện tại'];
      break;
    case '7d':
      labels = ['21/10', '22/10', '23/10', '24/10', '25/10', '26/10', 'Hôm nay'];
      break;
    default:
      labels = ['00:00', '04:00', '08:00', '12:00', '16:00', 'Hiện tại'];
  }

  const total = mockPrinters.length || 24;
  const offline = mockPrinters.filter(p => p.connectionStatus === 'Offline').length || 1;
  const online = total - offline;
  const warning = mockPrinters.filter(p => p.health === 'Warning' || p.alertSeverity === 'warning').length || 4;
  const rate = Number(((online / total) * 100).toFixed(1));

  return labels.map((timeLabel, index) => {
    // Nhẹ nhàng tạo độ gợn sóng thực tế cho các mốc quá khứ
    const isPast = index < labels.length - 1;
    const warningDelta = isPast && index % 2 === 0 ? 1 : 0;

    return {
      timeLabel,
      onlineRate: rate,
      onlineCount: online,
      offlineCount: offline,
      warningCount: Math.max(0, warning - warningDelta),
    };
  });
}

/**
 * Tạo dữ liệu lịch sử tải in (Load Curves) cho toàn bộ 24 máy in
 * phục vụ biểu đồ "Biểu Đồ Sản Lượng In Theo Thời Gian" trên Analytics
 */
export function generateMockTelemetry(
  range: VolumeTimeframe = '6h',
  printerId?: string
): PrinterTelemetryResponse[] {
  let bucketTemplates: { timeLabel: string; hourOffset: number }[] = [];

  if (range === '6h') {
    bucketTemplates = [
      { timeLabel: '10:00', hourOffset: 5.5 },
      { timeLabel: '10:30', hourOffset: 5.0 },
      { timeLabel: '11:00', hourOffset: 4.5 },
      { timeLabel: '11:30', hourOffset: 4.0 },
      { timeLabel: '12:00', hourOffset: 3.5 },
      { timeLabel: '12:30', hourOffset: 3.0 },
      { timeLabel: '13:00', hourOffset: 2.5 },
      { timeLabel: '13:30', hourOffset: 2.0 },
      { timeLabel: '14:00', hourOffset: 1.5 },
      { timeLabel: '14:30', hourOffset: 1.0 },
      { timeLabel: '15:00', hourOffset: 0.5 },
      { timeLabel: '15:30', hourOffset: 0.0 }
    ];
  } else if (range === '24h') {
    bucketTemplates = [
      { timeLabel: '00:00', hourOffset: 22 },
      { timeLabel: '02:00', hourOffset: 20 },
      { timeLabel: '04:00', hourOffset: 18 },
      { timeLabel: '06:00', hourOffset: 16 },
      { timeLabel: '08:00', hourOffset: 14 },
      { timeLabel: '10:00', hourOffset: 12 },
      { timeLabel: '12:00', hourOffset: 10 },
      { timeLabel: '14:00', hourOffset: 8 },
      { timeLabel: '16:00', hourOffset: 6 },
      { timeLabel: '18:00', hourOffset: 4 },
      { timeLabel: '20:00', hourOffset: 2 },
      { timeLabel: '22:00', hourOffset: 0 }
    ];
  } else {
    // 7d
    bucketTemplates = [
      { timeLabel: '21/10', hourOffset: 144 },
      { timeLabel: '22/10', hourOffset: 120 },
      { timeLabel: '23/10', hourOffset: 96 },
      { timeLabel: '24/10', hourOffset: 72 },
      { timeLabel: '25/10', hourOffset: 48 },
      { timeLabel: '26/10', hourOffset: 24 },
      { timeLabel: '27/10', hourOffset: 0 }
    ];
  }

  const printersToProcess = printerId
    ? mockPrinters.filter(p => p.id === printerId)
    : mockPrinters;

  return printersToProcess.map(printer => {
    // Các máy ngoại tuyến hoặc máy cắm qua PC chia sẻ không có telemetry
    const isUnsupported =
      printer.connectionStatus === 'Offline' ||
      printer.model.includes('Print Server') ||
      printer.health === 'Offline' ||
      printer.health === 'Unknown';

    if (isUnsupported) {
      const emptyBuckets: TelemetryBucket[] = bucketTemplates.map(t => ({
        timestamp: new Date(Date.now() - t.hourOffset * 3600000).toISOString(),
        timeLabel: t.timeLabel,
        pagesPrinted: null,
        status: 'no_data'
      }));

      return {
        printerId: printer.id,
        printerName: printer.name,
        range,
        totalPrintedInRange: 0,
        dataQuality: 'no_data',
        lastScraped: printer.lastScrape || new Date().toISOString(),
        buckets: emptyBuckets
      };
    }

    // Các máy in bình thường: sinh số lượng trang theo đặc thù thiết bị
    const isColorMFP = printer.deviceType === 'Color MFP';
    const isMonoMFP = printer.deviceType === 'Mono MFP';
    const isMonoLaser = printer.deviceType === 'Mono Laser';
    const isCritical = printer.health === 'Critical';

    // Hệ số cơ bản theo từng loại máy
    let baseFactor = isColorMFP ? 25 : isMonoMFP ? 15 : isMonoLaser ? 4 : 8;
    if (range === '24h') baseFactor *= 3;
    if (range === '7d') baseFactor *= 10;

    let totalSum = 0;
    const buckets: TelemetryBucket[] = bucketTemplates.map((t, idx) => {
      // Giờ trưa (12:00 - 13:00) hoặc ban đêm (00:00 - 06:00) in ít
      let multiplier = 1.0;
      if (t.timeLabel === '12:00' || t.timeLabel === '12:30') multiplier = 0.2;
      if (t.timeLabel === '00:00' || t.timeLabel === '02:00' || t.timeLabel === '04:00') multiplier = 0.05;

      // Máy lỗi (Critical) ở các mốc gần đây bị gián đoạn in
      if (isCritical && idx >= bucketTemplates.length - 4) {
        multiplier = 0;
      }

      const seed = (Number(printer.id) * 17 + idx * 31) % 10;
      const variation = 0.7 + (seed / 10) * 0.6; // 0.7 -> 1.3
      const pages = Math.max(0, Math.round(baseFactor * multiplier * variation));
      totalSum += pages;

      return {
        timestamp: new Date(Date.now() - t.hourOffset * 3600000).toISOString(),
        timeLabel: t.timeLabel,
        pagesPrinted: pages,
        status: 'complete'
      };
    });

    return {
      printerId: printer.id,
      printerName: printer.name,
      range,
      totalPrintedInRange: totalSum,
      dataQuality: 'complete',
      lastScraped: printer.lastScrape || new Date().toISOString(),
      buckets
    };
  });
}
