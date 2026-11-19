export * from './mockAnalyticsTypes';
import { MOCK_PRINTERS_PART_1 } from './mockPrinterPart1';
import { MOCK_PRINTERS_PART_2 } from './mockPrinterPart2';
import { MockFleetDeviceDefinition, FloorTabId } from './mockAnalyticsTypes';

export const MOCK_PRINTER_DEFINITIONS: MockFleetDeviceDefinition[] = [
  ...MOCK_PRINTERS_PART_1,
  ...MOCK_PRINTERS_PART_2,
];

const FLEET_BRANDS_MODELS_DEF = [
  { brand: 'Canon', model: 'imageRUNNER ADV C5560i III', ppm: 60, type: 'Color MFP' },
  { brand: 'HP', model: 'LaserJet Managed MFP E82650', ppm: 50, type: 'Mono MFP' },
  { brand: 'Ricoh', model: 'IM C4500 Workgroup Multifunction', ppm: 45, type: 'Color MFP' },
  { brand: 'Ricoh', model: 'Pro C7200s Graphic Production', ppm: 85, type: 'Color MFP' },
  { brand: 'Canon', model: 'iR2630i Office Mono Enterprise', ppm: 30, type: 'Mono Laser' },
  { brand: 'Xerox', model: 'AltaLink C8170 Color Copier', ppm: 70, type: 'Color MFP' },
  { brand: 'Brother', model: 'HL-L6400DW High-speed Mono', ppm: 52, type: 'Mono Laser' },
  { brand: 'Konica Minolta', model: 'bizhub C650i Commercial', ppm: 65, type: 'Color MFP' },
];

const FLEET_DEPTS_DEF = [
  'Phòng Kinh doanh & Sales',
  'Phòng Kế toán & Tài chính',
  'Phòng Hành chính - Nhân sự',
  'Khối Kỹ thuật & R&D',
  'Trung tâm Thiết kế Dự án',
  'Phòng Vận hành & Hệ thống IT',
  'Ban Quản trị & Điều hành',
  'Bộ phận Chăm sóc Khách hàng',
];

/**
 * Tra cứu máy in đa năng theo ID:
 * - Khớp cả dải ID chuẩn (prt-001..prt-035)
 * - Khớp cả dải hạm đội mở rộng (PRN-0001..PRN-1000)
 * Tránh hoàn toàn việc mất thiết bị khi ghim so sánh từ drawer hay modal.
 */
export function findAnyFleetDevice(id: string): MockFleetDeviceDefinition | undefined {
  if (!id) return undefined;

  // 1. Tìm trong danh sách 35 máy in chuẩn
  const found = MOCK_PRINTER_DEFINITIONS.find((p) => p.id === id);
  if (found) return found;

  // 2. Tra cứu dải mở rộng (PRN-xxxx)
  if (id.startsWith('PRN-')) {
    const num = parseInt(id.replace('PRN-', ''), 10) || 1;
    const floorNum = Math.floor((num - 1) / 200) + 1;
    const modelItem = FLEET_BRANDS_MODELS_DEF[num % FLEET_BRANDS_MODELS_DEF.length];
    const dept = FLEET_DEPTS_DEF[num % FLEET_DEPTS_DEF.length];
    const fallbackTemplate = MOCK_PRINTER_DEFINITIONS[num % MOCK_PRINTER_DEFINITIONS.length];

    return {
      id,
      name: `${modelItem.brand} ${modelItem.model.split(' ')[0]} #${String(num).padStart(4, '0')}`,
      model: modelItem.model,
      brand: modelItem.brand,
      floorId: `floor-${floorNum}` as FloorTabId,
      floorName: `Tầng ${floorNum}`,
      department: dept,
      baseHourly: fallbackTemplate.baseHourly,
      base7Days: fallbackTemplate.base7Days,
      base30Days: fallbackTemplate.base30Days,
      ppmNominal: modelItem.ppm,
      ppmActual: Number((modelItem.ppm * 0.94).toFixed(1)),
      uptimePercent: 98.8,
      mtbfHours: 390,
      failureCount: 1,
      downtimeHours: 4.0,
      monoRatio: modelItem.type === 'Color MFP' ? 0.65 : 1.0,
      tonerK: 75,
      tonerC: 62,
      tonerM: 58,
      tonerY: 65,
      drumLife: 82,
      wasteToner: 'OK',
    };
  }

  return undefined;
}
