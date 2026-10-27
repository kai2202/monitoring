/**
 * backend/src/diagnostics/types.ts
 *
 * Types for the Multi-Vendor Diagnostic Error Catalog and SNMP Trap Interpreter.
 */

import { IncidentSeverity } from '../types/api.js';

export interface DiagnosticDetail {
  /** Mã lỗi gốc từ SNMP trap, prtAlertDescription hoặc Zabbix (vd: "SC542", "30402", "13.00.00", "E001") */
  rawCode: string;

  /** Tên lỗi tiếng Việt dễ hiểu, chuẩn hóa (vd: "Cụm sấy không đạt nhiệt độ khởi động") */
  errorName: string;

  /** Diễn giải kỹ thuật dễ hiểu về nguyên nhân gây lỗi */
  description: string;

  /** Phân hệ phần cứng hoặc linh kiện gặp sự cố (vd: "Cụm sấy (Fusing Unit)", "Khay nạp giấy 3") */
  subsystem: string;

  /** Mức độ nghiêm trọng chuẩn hóa ('Critical' | 'Warning' | 'Info') */
  severity: IncidentSeverity;

  /** Trạng thái đã xác minh: true nếu mã khớp quy tắc đã kiểm chứng, false nếu chưa xác định */
  isIdentified: boolean;

  /** Hãng sản xuất áp dụng quy tắc ("Ricoh" | "HP" | "Canon" | "Xerox" | "Standard RFC" | "Chưa xác định") */
  vendor: string;
}

export interface DiagnosticRule {
  /** Biểu thức chính quy hoặc chuỗi nhận diện mã lỗi */
  pattern: RegExp | string;

  /** Trích xuất mã lỗi hiển thị (hoặc chuỗi cố định) */
  code?: string | ((match: RegExpMatchArray) => string);

  /** Tên lỗi tiếng Việt chuẩn hóa */
  name: string | ((match: RegExpMatchArray) => string);

  /** Mô tả chi tiết nguyên nhân */
  description: string | ((match: RegExpMatchArray) => string);

  /** Phân hệ phần cứng */
  subsystem: string;

  /** Mức độ nghiêm trọng */
  severity: IncidentSeverity;
}

export interface VendorDiagnosticCatalog {
  vendorName: string;
  rules: DiagnosticRule[];
}
