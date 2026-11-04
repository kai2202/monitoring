/**
 * Frontend/src/types/errorStandard.ts
 *
 * Kiểu dữ liệu TypeScript chuẩn hóa Mã lỗi Nội bộ (Standardized Fleet Error Code - FESC)
 * và Kho Tri Thức Giải Pháp Kỹ Thuật (Root Cause Solutions Knowledge Base):
 * - Mã nội bộ quy chuẩn: FM-<SUBSYSTEM>-<INDEX>
 * - Ánh xạ hai chiều với mã gốc nhà sản xuất: Ricoh (SC), Canon (E-code), HP, Brother, Epson.
 * - Tuyệt đối không chứa trường actionGuidance.
 */

export type HardwareSubsystem =
  | 'FUSER'            // Cụm sấy
  | 'SCANNER_ADF'      // Khối quang học & Khay nạp tự động ADF
  | 'LASER_OPTICS'     // Cụm quang học Laser & Motor đa giác
  | 'PAPER_FEED'       // Cơ cấu kéo giấy & Khay trữ
  | 'DRUM_UNIT'        // Cụm trống & Cao áp
  | 'CONTROLLER_BOARD' // Bo điều khiển & Bộ nhớ;

export interface VendorErrorMapping {
  vendor: 'Ricoh' | 'Canon' | 'HP' | 'Brother' | 'Epson';
  rawCode: string;
  vendorDescription: string;
  sampleModels: string[];
}

export interface RootCauseSolution {
  id: string;
  internalCode: string;
  title: string;
  rootCauseDescription: string;
  verifiedTroubleshootingSteps: string[];
  requiredParts?: string[];
  estimatedResolutionMinutes: number;
  historicalSuccessRate: number; // e.g. 96 (%)
  verifiedByEngineer: string;
  lastUpdated: string;
}

export interface StandardErrorCode {
  internalCode: string;          // vd: 'FM-FUS-01'
  subsystem: HardwareSubsystem;
  subsystemNameVi: string;      // vd: 'Cụm sấy (Fuser Unit)'
  nameVi: string;               // Tiêu đề chuẩn hóa tiếng Việt
  severity: 'Critical' | 'Warning' | 'Info';
  description: string;
  vendorMappings: VendorErrorMapping[];
  solutionId?: string;
  solution?: RootCauseSolution;
}
