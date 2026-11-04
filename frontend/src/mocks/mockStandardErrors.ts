/**
 * Frontend/src/mocks/mockStandardErrors.ts
 *
 * Dữ liệu chuẩn mực Từ điển Mã lỗi Nội bộ (FM-...) và Kho Tri thức Giải pháp Kỹ thuật.
 * Tuyệt đối không chứa trường actionGuidance.
 */

import { StandardErrorCode, RootCauseSolution } from '../types/errorStandard';

export const mockRootCauseSolutions: Record<string, RootCauseSolution> = {
  'SOL-FUS-01': {
    id: 'SOL-FUS-01',
    internalCode: 'FM-FUS-01',
    title: 'Quy trình kiểm tra & phục hồi cụm sấy: Lỗi gia nhiệt thermistor',
    rootCauseDescription: 'Cảm biến nhiệt độ (Thermistor/Thermostat) bám cặn mực hoặc đứt cầu chì nhiệt, khiến bo điều khiển ngắt rơ-le gia nhiệt để phòng chống cháy nổ.',
    verifiedTroubleshootingSteps: [
      'Ngắt nguồn điện tổng của máy in, chờ 15 phút để cụm sấy hạ nhiệt xuống dưới 40°C.',
      'Rút cụm sấy (Fuser Unit), dùng đồng hồ VOM đo thông mạch cuộn cảm biến nhiệt (điện trở tiêu chuẩn: 1.8kΩ - 2.5kΩ).',
      'Vệ sinh nhẹ bề mặt thanh gốm / đèn sấy bằng cồn Isopropyl 99% để loại bỏ muội mực.',
      'Nếu cảm biến đứt mạch, thay thế cặp Thermistor mới chính hãng và kiểm tra rơ-le nhiệt.',
      'Lắp lại cụm sấy, vào Service Mode (SP Mode đối với Ricoh / Service Mode đối với Canon) để thực hiện lệnh xóa cờ lỗi Fuser SC Reset.',
      'In thử bản test 50 trang để xác nhận nhiệt độ sấy ổn định trong ngưỡng 160°C - 185°C.',
    ],
    requiredParts: ['Cặp cảm biến nhiệt (Thermistor)', 'Cầu chì bảo vệ nhiệt', 'Thanh nung / Đèn sấy'],
    estimatedResolutionMinutes: 45,
    historicalSuccessRate: 98,
    verifiedByEngineer: 'Kỹ sư Trưởng Lê Hoàng Nam (NOC)',
    lastUpdated: '15/10/2026',
  },
  'SOL-FUS-02': {
    id: 'SOL-FUS-02',
    internalCode: 'FM-FUS-02',
    title: 'Quy trình xử lý quá nhiệt rơ-le an toàn cụm sấy',
    rootCauseDescription: 'Bo điều khiển cấp dòng AC liên tục cho đèn nung do hỏng linh kiện bán dẫn Triac trên nguồn chính, kích hoạt rơ-le ngắt nhiệt cơ học.',
    verifiedTroubleshootingSteps: [
      'Ngắt điện, kiểm tra rơ-le nhiệt (Thermostat) bằng VOM; nếu tiếp điểm nhảy mở, thực hiện gõ phục hồi nhẹ hoặc thay thế.',
      'Đo kiểm tra mạch kích Triac trên bo mạch điều khiển nguồn (Power Supply Board).',
      'Thay mới cụm rơ-le nhiệt bảo vệ nếu đã bị biến dạng nhiệt.',
      'Thực hiện quy trình Fuser Code Clear trong bảng điều khiển kỹ thuật.',
    ],
    requiredParts: ['Rơ-le nhiệt Thermostat', 'Bo mạch nguồn phụ AC'],
    estimatedResolutionMinutes: 60,
    historicalSuccessRate: 94,
    verifiedByEngineer: 'Kỹ sư Trưởng Lê Hoàng Nam (NOC)',
    lastUpdated: '20/10/2026',
  },
  'SOL-SCN-01': {
    id: 'SOL-SCN-01',
    internalCode: 'FM-SCN-01',
    title: 'Quy trình hiệu chuẩn khối quét quang học Scanner & CCD Sensor',
    rootCauseDescription: 'Gương phản xạ, thấu kính hội tụ bị bụi bám hoặc đèn LED quét bị suy hao độ rọi quang học dưới ngưỡng kiểm định mức trắng chuẩn (White Level Calibration).',
    verifiedTroubleshootingSteps: [
      'Tháo mặt kính phẳng máy quét, vệ sinh dải kính chuẩn trắng (White Reference Plate) ở cạnh trái.',
      'Lau sạch 3 gương phản xạ bên trong hộp quang bằng khăn microfiber chuyên dụng không xơ.',
      'Kiểm tra cáp dẹt truyền tín hiệu (FFC Cable) từ CCD Sensor về bo xử lý hình ảnh.',
      'Khởi động máy và chạy chức năng Scanner Auto White Level Calibration trong cài đặt hệ thống.',
    ],
    requiredParts: ['Dung dịch vệ sinh quang học', 'Cáp tín hiệu dẹt FFC 32-pin (nếu đứt)'],
    estimatedResolutionMinutes: 30,
    historicalSuccessRate: 96,
    verifiedByEngineer: 'Chuyên viên Vũ Tiến Đạt (NOC)',
    lastUpdated: '22/10/2026',
  },
  'SOL-OPT-01': {
    id: 'SOL-OPT-01',
    internalCode: 'FM-OPT-01',
    title: 'Quy trình kiểm tra động cơ đa giác Laser Polygon Motor',
    rootCauseDescription: 'Ổ bi trượt đệm khí/từ của động cơ gương đa giác laser bị kẹt hoặc khô dầu mỡ chịu nhiệt tốc độ cao, không đạt tần số đồng bộ quét 30.000 RPM.',
    verifiedTroubleshootingSteps: [
      'Tháo hộp Laser Optical Unit trong phòng sạch chống bụi tĩnh điện.',
      'Dùng tay kiểm tra độ trơn tru của trục xoay Polygon Mirror; nếu có cảm giác cọ rát, thay thế cụm motor.',
      'Vệ sinh cảm biến đồng bộ tia quét Laser Detector (LD Sensor).',
      'Siết chặt cáp nguồn motor và chạy chế độ kiểm tra Laser Test Pattern.',
    ],
    requiredParts: ['Động cơ đa giác Polygon Mirror Motor', 'Hộp quang Laser đồng bộ'],
    estimatedResolutionMinutes: 75,
    historicalSuccessRate: 92,
    verifiedByEngineer: 'Kỹ sư Trưởng Lê Hoàng Nam (NOC)',
    lastUpdated: '18/10/2026',
  },
  'SOL-FED-01': {
    id: 'SOL-FED-01',
    internalCode: 'FM-FED-01',
    title: 'Quy trình phục hồi cơ cấu kéo giấy & khay nạp đảo mặt',
    rootCauseDescription: 'Cao su quả đào cuốn giấy (Pickup / Feed / Separation Rollers) bị mòn vẹt rãnh ma sát hoặc cảm biến quang học nhận diện vị trí giấy bị kẹt bám bụi giấy mùn.',
    verifiedTroubleshootingSteps: [
      'Tháo cụm 3 quả đào cao su (Cuốn - Kéo - Tách) của khay chứa giấy chính.',
      'Dùng dung dịch phục hồi cao su Platenclene lau sạch bột giấy và tăng độ ma sát bám; nếu đã mòn nhẵn thì thay mới.',
      'Dùng bình khí nén vệ sinh sạch cảm biến quang nhận diện đỉnh giấy (Paper Lead-edge Sensor).',
      'Nạp 100 tờ giấy mới định lượng chuẩn 80gsm và chạy thử in 2 mặt tốc độ tối đa.',
    ],
    requiredParts: ['Bộ 3 quả đào cao su cuốn giấy', 'Cảm biến quang kẹt giấy'],
    estimatedResolutionMinutes: 25,
    historicalSuccessRate: 99,
    verifiedByEngineer: 'Kỹ thuật viên Nguyễn Văn Bình',
    lastUpdated: '28/10/2026',
  },
  'SOL-DRM-01': {
    id: 'SOL-DRM-01',
    internalCode: 'FM-DRM-01',
    title: 'Quy trình phục hồi cụm trống hình ảnh & cao áp nạp sạc',
    rootCauseDescription: 'Dây cao áp sạc (Corona Wire) hoặc trục cao áp nạp (PCR Roller) bị bám bụi mực tĩnh điện gây phóng điện cục bộ rò rỉ điện áp cao (High Voltage Leakage).',
    verifiedTroubleshootingSteps: [
      'Rút khối Drum Unit, kéo gạt vệ sinh thanh nạp sạc tích hợp nhiều lần.',
      'Tháo gạt mực thải (Cleaning Blade) và kiểm tra bề mặt lớp quang dẫn OPC Drum xem có xước sâu.',
      'Dùng cồn vệ sinh các tiếp điểm lá đồng dẫn điện cao áp từ sườn máy vào cụm Drum.',
      'Nếu điện áp cao áp vẫn báo rò rỉ, thay thế thanh nạp sạc sấy hoặc toàn bộ cụm Drum Cartridge.',
    ],
    requiredParts: ['Trống quang dẫn OPC Drum', 'Gạt mực thải Cleaning Blade', 'Trục nạp sạc PCR'],
    estimatedResolutionMinutes: 40,
    historicalSuccessRate: 95,
    verifiedByEngineer: 'Chuyên viên Vũ Tiến Đạt (NOC)',
    lastUpdated: '25/10/2026',
  },
  'SOL-CTL-01': {
    id: 'SOL-CTL-01',
    internalCode: 'FM-CTL-01',
    title: 'Quy trình xử lý lỗi bo điều khiển trung tâm & phân vùng bộ nhớ',
    rootCauseDescription: 'Phân vùng lưu trữ trên ổ đĩa cứng máy in (HDD/eMMC) bị phân mảnh hoặc lỗi tệp cấu hình NVRAM khiến chip xử lý Controller treo khi khởi động.',
    verifiedTroubleshootingSteps: [
      'Tháo thanh RAM bộ nhớ đệm mở rộng, vệ sinh chân cắm bằng cồn và cắm chặt lại.',
      'Vào chế độ cứu hộ khởi động (Recovery Mode), chạy lệnh kiểm tra toàn vẹn ổ cứng HDD Check.',
      'Nếu ổ cứng có bad sector vật lý, thay thế ổ đĩa SSD chuẩn SATA công nghiệp và chạy nạp lại Firmware chính hãng.',
      'Khôi phục các thông số mạng và địa chỉ IP tĩnh từ bản sao lưu cấu hình.',
    ],
    requiredParts: ['Thanh RAM DDR3 2GB', 'Ổ đĩa SSD máy in công nghiệp 128GB'],
    estimatedResolutionMinutes: 50,
    historicalSuccessRate: 91,
    verifiedByEngineer: 'Kỹ sư Trưởng Lê Hoàng Nam (NOC)',
    lastUpdated: '12/10/2026',
  },
};

export const mockStandardErrorCodes: StandardErrorCode[] = [
  // 1. CỤM SẤY (FUSER)
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
        vendorDescription: 'Fixing unit high temperature detection circuit activated',
        sampleModels: ['iR-ADV C5535i', 'iR-ADV C5560i'],
      },
      {
        vendor: 'HP',
        rawCode: '50.3',
        vendorDescription: 'Fuser Error: High temperature safety circuit tripped',
        sampleModels: ['LaserJet M608dn'],
      },
    ],
    solutionId: 'SOL-FUS-02',
    solution: mockRootCauseSolutions['SOL-FUS-02'],
  },

  // 2. KHỐI QUÉT QUANG HỌC & ADF (SCANNER_ADF)
  {
    internalCode: 'FM-SCN-01',
    subsystem: 'SCANNER_ADF',
    subsystemNameVi: 'Khối quét & Quang học (Scanner / ADF)',
    nameVi: 'Lỗi quét quang học: Hỏng đèn quét CCD hoặc mất tín hiệu cân chỉnh trắng',
    severity: 'Warning',
    description: 'Mức ánh sáng trắng phản xạ từ tấm chuẩn quang học không đạt yêu cầu hiệu chuẩn khi khởi động.',
    vendorMappings: [
      {
        vendor: 'Ricoh',
        rawCode: 'SC101',
        vendorDescription: 'Exposure lamp error (White level peak not detected)',
        sampleModels: ['MP C6004', 'MP 3055'],
      },
      {
        vendor: 'Canon',
        rawCode: 'E225',
        vendorDescription: 'CCD scanner lamp light level abnormal',
        sampleModels: ['iR-ADV C5535i', 'iR-ADV C5560i'],
      },
      {
        vendor: 'HP',
        rawCode: '30.01.08',
        vendorDescription: 'Scanner calibration failure (White reference out of spec)',
        sampleModels: ['LaserJet E87640'],
      },
    ],
    solutionId: 'SOL-SCN-01',
    solution: mockRootCauseSolutions['SOL-SCN-01'],
  },

  // 3. CỤM LASER & MOTOR ĐA GIÁC (LASER_OPTICS)
  {
    internalCode: 'FM-OPT-01',
    subsystem: 'LASER_OPTICS',
    subsystemNameVi: 'Cụm quang học Laser (Laser Optics)',
    nameVi: 'Lỗi Laser: Động cơ gương đa giác (Polygon Motor) không khóa tốc độ',
    severity: 'Critical',
    description: 'Tín hiệu khóa tốc độ vòng quay động cơ laser đa giác không phản hồi sau 10 giây cấp lệnh xoay.',
    vendorMappings: [
      {
        vendor: 'Ricoh',
        rawCode: 'SC320',
        vendorDescription: 'Polygon mirror motor error (Speed lock signal inactive)',
        sampleModels: ['MP C6004', 'MP 3055', 'Pro C7200s'],
      },
      {
        vendor: 'Canon',
        rawCode: 'E100',
        vendorDescription: 'BD circuit malfunction / Laser scanner polygon motor failure',
        sampleModels: ['iR-ADV C5535i', 'iR-ADV C5560i'],
      },
      {
        vendor: 'HP',
        rawCode: '51.10',
        vendorDescription: 'Beam detect / Laser scanner polygon motor error',
        sampleModels: ['LaserJet M608dn', 'PageWide 556xh'],
      },
    ],
    solutionId: 'SOL-OPT-01',
    solution: mockRootCauseSolutions['SOL-OPT-01'],
  },

  // 4. CƠ KÉO GIẤY & KHAY TRỮ (PAPER_FEED)
  {
    internalCode: 'FM-FED-01',
    subsystem: 'PAPER_FEED',
    subsystemNameVi: 'Cơ kéo giấy & Khay nạp (Paper Feed)',
    nameVi: 'Lỗi cấp giấy: Mòn quả đào kéo giấy hoặc kẹt cơ khay nạp chính',
    severity: 'Warning',
    description: 'Giấy không rời khỏi khay nạp sau 3 lần kích hoạt ly hợp cuốn giấy (Feed Clutch Timeout).',
    vendorMappings: [
      {
        vendor: 'Ricoh',
        rawCode: 'SC501',
        vendorDescription: 'Tray 1 lift motor malfunction or paper pickup failure',
        sampleModels: ['MP C6004', 'MP 3055'],
      },
      {
        vendor: 'Canon',
        rawCode: 'E010',
        vendorDescription: 'Main drive motor / Paper feed pickup roller slip error',
        sampleModels: ['iR-ADV C5535i'],
      },
      {
        vendor: 'HP',
        rawCode: '13.01.00',
        vendorDescription: 'Paper feed delay jam at Tray 2 pick roller',
        sampleModels: ['LaserJet M608dn', 'LaserJet E87640'],
      },
      {
        vendor: 'Brother',
        rawCode: 'Jam Tray 1',
        vendorDescription: 'Paper feed roller slip or pickup error',
        sampleModels: ['HL-L6200DW'],
      },
    ],
    solutionId: 'SOL-FED-01',
    solution: mockRootCauseSolutions['SOL-FED-01'],
  },

  // 5. CỤM TRỐNG & CAO ÁP (DRUM_UNIT)
  {
    internalCode: 'FM-DRM-01',
    subsystem: 'DRUM_UNIT',
    subsystemNameVi: 'Cụm trống & Cao áp (Drum Unit)',
    nameVi: 'Lỗi cao áp nạp sạc: Rò rỉ điện áp hoặc đứt dây cao áp nạp trống',
    severity: 'Critical',
    description: 'Mạch dò dòng phát hiện rò rỉ điện áp nạp sạc cao áp vượt mức cho phép trên cụm trống hình ảnh.',
    vendorMappings: [
      {
        vendor: 'Ricoh',
        rawCode: 'SC401',
        vendorDescription: 'Charge roller leak / High voltage charge error',
        sampleModels: ['MP C6004', 'MP C4503'],
      },
      {
        vendor: 'Canon',
        rawCode: 'E060',
        vendorDescription: 'Primary charging high voltage circuit leak',
        sampleModels: ['iR-ADV C5535i', 'iR-ADV C5560i'],
      },
      {
        vendor: 'HP',
        rawCode: '54.00.01',
        vendorDescription: 'Drum charge roller high voltage bias leakage',
        sampleModels: ['LaserJet E87640'],
      },
    ],
    solutionId: 'SOL-DRM-01',
    solution: mockRootCauseSolutions['SOL-DRM-01'],
  },

  // 6. BO MẠCH ĐIỀU KHIỂN & BỘ NHỚ (CONTROLLER_BOARD)
  {
    internalCode: 'FM-CTL-01',
    subsystem: 'CONTROLLER_BOARD',
    subsystemNameVi: 'Bo mạch điều khiển (Controller Board)',
    nameVi: 'Lỗi bo điều khiển: Lỗi phân vùng ổ cứng HDD hoặc bộ nhớ đệm RAM',
    severity: 'Critical',
    description: 'Không thể khởi động hệ điều hành máy in do phân vùng đĩa cứng bị hỏng hoặc lỗi bộ nhớ đệm.',
    vendorMappings: [
      {
        vendor: 'Ricoh',
        rawCode: 'SC672',
        vendorDescription: 'Controller startup error / Communication between engine and controller failed',
        sampleModels: ['MP C6004', 'Pro C7200s', 'MP 3055'],
      },
      {
        vendor: 'Canon',
        rawCode: 'E602',
        vendorDescription: 'Hard disk drive partition / System boot error',
        sampleModels: ['iR-ADV C5535i', 'iR-ADV C5560i'],
      },
      {
        vendor: 'HP',
        rawCode: '49.38.07',
        vendorDescription: 'Critical firmware exception / Controller memory parity error',
        sampleModels: ['LaserJet M608dn', 'LaserJet E87640'],
      },
    ],
    solutionId: 'SOL-CTL-01',
    solution: mockRootCauseSolutions['SOL-CTL-01'],
  },
];
