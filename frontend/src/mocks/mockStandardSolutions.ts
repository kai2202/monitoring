/**
 * Frontend/src/mocks/mockStandardSolutions.ts
 *
 * Dữ liệu chuẩn mực Kho Tri thức Giải pháp Kỹ thuật (Root Cause Solutions).
 * Tuyệt đối không chứa trường actionGuidance.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { RootCauseSolution } from '../types/errorStandard';

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
    rootCauseDescription: 'Bụi giấy hoặc vết ố dầu mỡ bám trên dải kính chuẩn trắng (White Reference Glass), khiến cảm biến CCD đọc sai mức cân bằng trắng ban đầu.',
    verifiedTroubleshootingSteps: [
      'Tắt nguồn, mở nắp nạp tự động ADF và kính phẳng Platen Glass.',
      'Dùng khăn vi sợi (Microfiber) tẩm dung dịch lau kính quang học chuyên dụng lau sạch dải kính trắng mỏng bên mép trái.',
      'Kiểm tra cáp bẹ dẹt (Flat Ribbon Cable) nối từ bo quét về Mainboard; cắm lại chắc chắn.',
      'Khởi động lại máy in, kiểm tra đèn LED/Xenon quét qua lại 2 lần để tự động cân chỉnh.',
      'Thực hiện quét thử 1 tài liệu có nhiều vùng tối để kiểm tra không bị sọc dọc đen.',
    ],
    requiredParts: ['Dung dịch vệ sinh quang học', 'Khăn vi sợi không xơ'],
    estimatedResolutionMinutes: 30,
    historicalSuccessRate: 99,
    verifiedByEngineer: 'Kỹ thuật viên Phạm Minh Quân (Hiện trường)',
    lastUpdated: '18/10/2026',
  },
  'SOL-DRM-01': {
    id: 'SOL-DRM-01',
    internalCode: 'FM-DRM-01',
    title: 'Quy trình thay thế & thiết lập trống quang học OPC Drum quá hạn',
    rootCauseDescription: 'Lớp quang dẫn hữu cơ (OPC) trên bề mặt trống bị bào mòn sau chu kỳ 100.000 trang, làm suy giảm khả năng tích điện tĩnh và gây vệt mờ toàn trang.',
    verifiedTroubleshootingSteps: [
      'Mở cửa trước, gạt khóa an toàn cụm tạo ảnh (Image Unit / Drum Unit).',
      'Rút nhẹ cụm Drum cũ, tránh để ánh sáng mặt trời chiếu trực tiếp vào bề mặt quang học.',
      'Gắn cụm trống Drum chính hãng mới (đã tháo seal bảo vệ màu cam).',
      'Đóng cửa máy, máy sẽ tự động kích hoạt chu trình hiệu chỉnh điện áp sạc lưới (Charge Roller Bias Tuning).',
      'Xóa bộ đếm tuổi thọ Drum trong menu bảo trì quản trị viên.',
    ],
    requiredParts: ['Cụm trống từ quang học OPC Drum Unit', 'Thanh gạt mực thu hồi Drum Cleaning Blade'],
    estimatedResolutionMinutes: 25,
    historicalSuccessRate: 99,
    verifiedByEngineer: 'Kỹ sư Trưởng Lê Hoàng Nam (NOC)',
    lastUpdated: '22/10/2026',
  },
  'SOL-LSR-01': {
    id: 'SOL-LSR-01',
    internalCode: 'FM-LSR-01',
    title: 'Quy trình chẩn đoán động cơ gương đa giác Laser Polygon Motor',
    rootCauseDescription: 'Động cơ xoay gương đa giác (Polygon Mirror Motor) bị kẹt trục do khô dầu ổ bi từ tính, không đạt tốc độ quét đồng bộ (thường từ 20.000 - 35.000 RPM).',
    verifiedTroubleshootingSteps: [
      'Ngắt nguồn máy in, tháo nắp lưng tiếp cận hộp quang Laser Scanner Unit (LSU).',
      'Dùng tay xoay thử mặt gương đa giác; nếu có cảm giác rít hoặc phát tiếng kêu cọ xát, bắt buộc phải thay thế mô-tơ hoặc cả cụm LSU.',
      'Tuyệt đối không dùng tay chạm vào các mặt gương phản xạ quang học.',
      'Vệ sinh cảm biến đồng bộ chùm tia Laser (Beam Detect Sensor).',
      'Thay mới cụm LSU, siết chặt ốc tiếp địa chống nhiễu cao tần.',
    ],
    requiredParts: ['Cụm hộp quang Laser Scanner Assembly', 'Cáp tín hiệu LSU'],
    estimatedResolutionMinutes: 75,
    historicalSuccessRate: 91,
    verifiedByEngineer: 'Kỹ sư Trưởng Lê Hoàng Nam (NOC)',
    lastUpdated: '05/10/2026',
  },
  'SOL-JAM-01': {
    id: 'SOL-JAM-01',
    internalCode: 'FM-JAM-01',
    title: 'Quy trình xử lý kẹt giấy lặp lại tại khay nạp giấy chính (Tray 1/2)',
    rootCauseDescription: 'Cao su quả đào cuốn giấy (Pick-up / Feed Roller) bị mòn nhẵn mất độ bám, hoặc bụi giấy tích tụ làm kẹt cơ cấu ly hợp cuốn giấy (Feed Clutch).',
    verifiedTroubleshootingSteps: [
      'Kéo rời khay giấy ra khỏi máy, kiểm tra các vụn giấy vụn hoặc ghim bấm sót trong đường dẫn.',
      'Tháo quả đào cuốn giấy và đệm phân tách (Separation Pad), kiểm tra độ nhám của vân cao su.',
      'Dùng dung dịch phục hồi cao su chuyên dụng (Platenclene) lau sạch bụi giấy bám trên quả đào.',
      'Nếu bề mặt cao su đã chai cứng hoặc mòn vẹt, thay bộ 3 quả đào (Pick-up, Feed, Reverse Roller) mới.',
      'Căn chỉnh thanh chặn giấy trong khay vừa khít kích thước khổ giấy (A4/Letter), không để lỏng lẻo.',
    ],
    requiredParts: ['Bộ quả đào kéo giấy Tray 1/2', 'Đệm tách giấy (Separation Pad)'],
    estimatedResolutionMinutes: 20,
    historicalSuccessRate: 97,
    verifiedByEngineer: 'Kỹ thuật viên Phạm Minh Quân (Hiện trường)',
    lastUpdated: '25/10/2026',
  },
  'SOL-SUP-01': {
    id: 'SOL-SUP-01',
    internalCode: 'FM-SUP-01',
    title: 'Quy trình kiểm tra trục khuấy & cảm biến mực hộp tiếp vận',
    rootCauseDescription: 'Mực in bị ẩm vón cục làm nghẽn đường dẫn trục xoắn cấp mực (Toner Supply Tube / Hopper), khiến cảm biến áp điện (Piezo Sensor) báo cạn giả.',
    verifiedTroubleshootingSteps: [
      'Tháo hộp mực (Toner Cartridge), lắc đều theo phương ngang 5-6 lần để làm tơi bột mực.',
      'Kiểm tra cổng sổ khóa ngàm xả mực; nếu kẹt lẫy cơ học, dùng cọ mềm vệ sinh cặn mực đóng bánh.',
      'Rút cụm phễu cấp mực (Sub-hopper), kiểm tra mô-tơ cấp mực có quay khi kích hoạt test motor.',
      'Dùng khí nén khô thổi sạch bụi mực bám trên bề mặt cảm biến nhận diện chip mực.',
      'Lắp lại hộp mực chính hãng, kích hoạt lệnh nạp mực cưỡng bức (Forced Toner Supply) trong menu kỹ thuật.',
    ],
    requiredParts: ['Hộp mực chính hãng dự phòng', 'Bộ phễu cấp mực (Toner Hopper Unit)'],
    estimatedResolutionMinutes: 30,
    historicalSuccessRate: 96,
    verifiedByEngineer: 'Kỹ thuật viên Phạm Minh Quân (Hiện trường)',
    lastUpdated: '12/10/2026',
  },
};

