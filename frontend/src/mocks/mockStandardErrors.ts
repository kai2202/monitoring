/**
 * Frontend/src/mocks/mockStandardErrors.ts
 *
 * Dữ liệu chuẩn mực Từ điển Mã lỗi Nội bộ (FM-...) và Kho Tri thức Giải pháp Kỹ thuật.
 * Tuyệt đối không chứa trường actionGuidance.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { StandardErrorCode } from '../types/errorStandard';
import { mockRootCauseSolutions } from './mockStandardSolutions';

export { mockRootCauseSolutions };

export const mockStandardErrorCodes: StandardErrorCode[] = [
  {
    internalCode: 'FM-FUS-01',
    subsystem: 'FUSER',
    subsystemNameVi: 'Cụm sấy (Fuser Unit)',
    nameVi: 'Lỗi sấy: Không gia nhiệt hoặc đứt mạch cảm biến nhiệt nung',
    severity: 'Critical',
    description: 'Nhiệt độ cụm nung sấy không tăng lên sau khi bật máy nung trong khoảng thời gian khởi động quy định.',
    vendorMappings: [
      {
        vendor: 'Ricoh',
        rawCode: 'SC541',
        vendorDescription: 'Fusing thermistor open circuit (Center/End thermistor)',
        sampleModels: ['MP C6004', 'MP 3055', 'Pro C7200s'],
      },
      {
        vendor: 'Ricoh',
        rawCode: 'SC542',
        vendorDescription: 'Fusing temperature warmup error',
        sampleModels: ['MP C4503', 'MP C3004'],
      },
      {
        vendor: 'Canon',
        rawCode: 'E000',
        vendorDescription: 'Error in fixing heater heating circuit',
        sampleModels: ['iR-ADV C5535i', 'iR-ADV C5560i', 'imageCLASS MF445dw'],
      },
      {
        vendor: 'Canon',
        rawCode: 'E001',
        vendorDescription: 'Fixing unit abnormal temperature detected',
        sampleModels: ['iR-ADV C5250', 'PRO-4100'],
      },
      {
        vendor: 'HP',
        rawCode: '50.1',
        vendorDescription: 'Fuser Error: Low temperature warmup failure',
        sampleModels: ['LaserJet M608dn', 'PageWide 556xh', 'LaserJet E87640'],
      },
      {
        vendor: 'Brother',
        rawCode: 'Self-Diagnostic (Fuser Error)',
        vendorDescription: 'Fuser unit low temperature malfunction',
        sampleModels: ['HL-L6200DW', 'MFC-L8900CDW'],
      },
    ],
    solutionId: 'SOL-FUS-01',
    solution: mockRootCauseSolutions['SOL-FUS-01'],
  },
  {
    internalCode: 'FM-FUS-02',
    subsystem: 'FUSER',
    subsystemNameVi: 'Cụm sấy (Fuser Unit)',
    nameVi: 'Lỗi sấy: Quá nhiệt ngưỡng bảo vệ rơ-le an toàn',
    severity: 'Critical',
    description: 'Cảm biến đọc nhiệt độ vượt ngưỡng an toàn trần (>230°C), kích hoạt ngắt mạch nhiệt cơ học.',
    vendorMappings: [
      {
        vendor: 'Ricoh',
        rawCode: 'SC543',
        vendorDescription: 'Fusing thermistor overheat failure (High temperature cutout)',
        sampleModels: ['MP C6004', 'Pro C7200s'],
      },
      {
        vendor: 'Canon',
        rawCode: 'E002',
        vendorDescription: 'Fixing unit main thermistor high temperature error',
        sampleModels: ['iR-ADV C5535i'],
      },
      {
        vendor: 'HP',
        rawCode: '50.2',
        vendorDescription: 'Fuser Error: High temperature warmup failure',
        sampleModels: ['LaserJet M608dn'],
      },
    ],
    solutionId: 'SOL-FUS-02',
    solution: mockRootCauseSolutions['SOL-FUS-02'],
  },
  {
    internalCode: 'FM-SCN-01',
    subsystem: 'SCANNER',
    subsystemNameVi: 'Bộ quét quang học & ADF',
    nameVi: 'Lỗi cảm biến mảng quét CCD / Đèn chiếu sáng Scanner',
    severity: 'Warning',
    description: 'Bộ đọc quét quang học không tìm thấy dải chuẩn trắng (White shading plate calibration error).',
    vendorMappings: [
      {
        vendor: 'Ricoh',
        rawCode: 'SC101',
        vendorDescription: 'Exposure lamp error (Shading data peak level defective)',
        sampleModels: ['MP C4503', 'MP 5055'],
      },
      {
        vendor: 'Canon',
        rawCode: 'E225',
        vendorDescription: 'Reader lamp illumination intensity abnormal',
        sampleModels: ['iR-ADV C5535i', 'iR 2630i'],
      },
      {
        vendor: 'HP',
        rawCode: '30.01.41',
        vendorDescription: 'Scanner illumination failure / Flatbed sensor calibration',
        sampleModels: ['LaserJet E87640'],
      },
    ],
    solutionId: 'SOL-SCN-01',
    solution: mockRootCauseSolutions['SOL-SCN-01'],
  },
  {
    internalCode: 'FM-DRM-01',
    subsystem: 'DRUM',
    subsystemNameVi: 'Khối tạo ảnh & Trống quang (OPC Drum)',
    nameVi: 'Trống quang học hoặc cụm gạt mực bị kẹt / Hết hạn chu kỳ',
    severity: 'Critical',
    description: 'Điện trở bề mặt lớp quang dẫn bị đánh thủng hoặc động cơ quay trống bị quá tải cơ khí.',
    vendorMappings: [
      {
        vendor: 'Ricoh',
        rawCode: 'SC396',
        vendorDescription: 'Drum motor lock error (BK/Color PCU drive overload)',
        sampleModels: ['MP C6004', 'Pro C7200s'],
      },
      {
        vendor: 'Canon',
        rawCode: 'E014',
        vendorDescription: 'Drum drive motor abnormal rotation',
        sampleModels: ['iR-ADV C5250'],
      },
      {
        vendor: 'HP',
        rawCode: '59.F0',
        vendorDescription: 'Transfer alienation motor failure / Drum contact gear error',
        sampleModels: ['LaserJet M608dn', 'LaserJet E87640'],
      },
    ],
    solutionId: 'SOL-DRM-01',
    solution: mockRootCauseSolutions['SOL-DRM-01'],
  },
  {
    internalCode: 'FM-LSR-01',
    subsystem: 'LASER',
    subsystemNameVi: 'Khối quang khắc Laser (LSU)',
    nameVi: 'Mô-tơ gương đa giác Laser không đồng bộ tốc độ quay',
    severity: 'Critical',
    description: 'Động cơ đa giác không đạt tốc độ quét yêu cầu trong khoảng thời gian quy định sau tín hiệu kích hoạt.',
    vendorMappings: [
      {
        vendor: 'Ricoh',
        rawCode: 'SC202',
        vendorDescription: 'Polygon mirror motor error (Speed lock failed)',
        sampleModels: ['MP C4503', 'MP 3055'],
      },
      {
        vendor: 'Canon',
        rawCode: 'E100',
        vendorDescription: 'Laser scanner unit beam detect BD circuit error',
        sampleModels: ['iR-ADV C5535i'],
      },
      {
        vendor: 'HP',
        rawCode: '51.00.19',
        vendorDescription: 'Beam detect malfunction / Laser sync signal missing',
        sampleModels: ['LaserJet M608dn'],
      },
    ],
    solutionId: 'SOL-LSR-01',
    solution: mockRootCauseSolutions['SOL-LSR-01'],
  },
  {
    internalCode: 'FM-JAM-01',
    subsystem: 'PAPER_FEED',
    subsystemNameVi: 'Khay cấp giấy & Đường dẫn giấy',
    nameVi: 'Kẹt giấy liên tục tại khay nạp chính / Mòn quả đào cuốn giấy',
    severity: 'Warning',
    description: 'Giấy không rời khỏi khay nạp sau số lần kích hoạt cơ cấu cuốn giấy (Pick-up timeout).',
    vendorMappings: [
      {
        vendor: 'Ricoh',
        rawCode: 'J001',
        vendorDescription: 'Paper feed delay jam (Tray 1 paper feed sensor did not turn ON)',
        sampleModels: ['MP C6004', 'MP C4503'],
      },
      {
        vendor: 'Canon',
        rawCode: '0101',
        vendorDescription: 'Cassette 1 pick-up delay jam',
        sampleModels: ['iR-ADV C5535i'],
      },
      {
        vendor: 'HP',
        rawCode: '13.00.00',
        vendorDescription: 'Generic paper feed jam / Paper stay jam inside Tray 2',
        sampleModels: ['LaserJet M608dn', 'PageWide 556xh'],
      },
    ],
    solutionId: 'SOL-JAM-01',
    solution: mockRootCauseSolutions['SOL-JAM-01'],
  },
  {
    internalCode: 'FM-SUP-01',
    subsystem: 'SUPPLIES',
    subsystemNameVi: 'Vật tư tiêu hao (Toner & Ink)',
    nameVi: 'Lỗi cấp mực: Mô-tơ cấp mực không đẩy bột mực vào phễu từ',
    severity: 'Warning',
    description: 'Cảm biến nồng độ mực (Toner Density Sensor) phát hiện thiếu mực nhưng mô-tơ cấp mực không thay đổi điện áp.',
    vendorMappings: [
      {
        vendor: 'Ricoh',
        rawCode: 'SC360',
        vendorDescription: 'Toner density sensor error (TD sensor output voltage out of range)',
        sampleModels: ['MP C6004', 'Pro C7200s'],
      },
      {
        vendor: 'Canon',
        rawCode: 'E020',
        vendorDescription: 'Toner supply sensor abnormality / Sub-hopper empty',
        sampleModels: ['iR-ADV C5535i'],
      },
      {
        vendor: 'HP',
        rawCode: '10.00.10',
        vendorDescription: 'Black cartridge memory chip error / Missing toner supply pump',
        sampleModels: ['LaserJet M608dn'],
      },
    ],
    solutionId: 'SOL-SUP-01',
    solution: mockRootCauseSolutions['SOL-SUP-01'],
  },
];
