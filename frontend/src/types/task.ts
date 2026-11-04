/**
 * Frontend/src/types/task.ts
 *
 * Kiểu dữ liệu TypeScript chuẩn mực cho Quản lý công việc & bảo trì (Tasks / Work Orders)
 * theo mô hình Notion Workspace & CMMS của FleetMonitor.
 *
 * Bổ sung các cấu trúc chuyên sâu:
 * 1. Work Log (Chi tiết từng bước kỹ thuật, thời lượng, kết quả, đo đạc)
 * 2. Vendor Communication (Lịch sử liên hệ hãng sản xuất)
 * 3. Time & Cost (Thời gian sửa chữa, chờ, downtime, chi phí nhân công & linh kiện)
 * 4. Resolution Report (Biên bản nghiệm thu, nguyên nhân gốc rễ, người ký)
 * 5. Task Attachment (Tài liệu đính kèm: PDF, ảnh hiện trường, file log)
 *
 * Tuân thủ nghiêm ngặt AGENTS.md: MetricValue = number | null, không bịa đặt số 0 vô lý.
 */

export type TaskType =
  | 'CORRECTIVE_REPAIR'
  | 'PREVENTIVE_MAINTENANCE'
  | 'SUPPLY_REPLENISHMENT'
  | 'HARDWARE_INSPECTION';

export type TaskPriority = 'P1_Urgent' | 'P2_High' | 'P3_Medium' | 'P4_Low';

export type TaskStatus =
  | 'Planned'
  | 'In_Progress'
  | 'Waiting'
  | 'Pending_Verification'
  | 'Completed'
  | 'Cancelled';

export type TaskAction =
  | 'CREATED'
  | 'ASSIGNED'
  | 'REASSIGNED'
  | 'STATUS_CHANGED'
  | 'RESCHEDULED'
  | 'PROGRESS_UPDATED'
  | 'NOTE_ADDED';

export interface TaskActivityLog {
  id: string;
  author: string;
  timestamp: string;
  action: TaskAction;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
}

export interface TaskStepItem {
  id: string;
  stepNumber: number;
  title: string;
  notes?: string;
  status: 'Pending' | 'In_Progress' | 'Completed';
  completedAt?: string;
  completedBy?: string;
  durationMinutes?: number;
}

export interface TaskActivityFeedItem {
  id: string;
  author: string;
  avatarText?: string;
  timestamp: string;
  type: 'status_change' | 'step_completed' | 'note_added';
  content: string;
}

export interface TaskChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

// 1. WORK LOG CHI TIẾT
export interface WorkLogEntry {
  id: string;
  stepId?: string; // ID bước quy trình tương ứng trong dynamicSteps
  stepNumber: number;
  stepTitle: string;
  performerName: string;
  performerAvatar: string;
  createdAt?: string; // Tự động ghi lại thời gian & ngày tạo (VD: "14:35, 03/11/2026")
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  actionsTaken: string;
  resultStatus: 'SUCCESS' | 'WAITING_PARTS' | 'FOLLOWUP_NEEDED';
  measurementsAndNotes?: string;
  additionalCostVnd?: number;
  additionalTimeHours?: number;
}

// 2. VENDOR COMMUNICATION LOG
export interface VendorCommunicationLog {
  id: string;
  vendorName: string; // "Ricoh Vietnam Support", "Canon Service Center"
  contactPerson: string;
  phoneOrEmail: string;
  timestamp: string;
  discussionContent: string;
  vendorGuidance: string;
  resultOutcome?: string;
}

// 3. TIME & COST SUMMARY
export interface TimeAndCostSummary {
  repairTimeHours: number | null;
  waitingTimeHours: number | null;
  downtimeHours: number | null;
  laborCostVnd: number | null;
  partsCostVnd: number | null;
  totalCostVnd: number | null;
}

// 4. ATTACHMENT
export interface TaskAttachment {
  id: string;
  fileName: string;
  fileType: 'PDF' | 'IMAGE' | 'LOG' | 'DOC';
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
}

// 5. TRƯỜNG THÔNG TIN TÙY BIẾN (DYNAMIC CUSTOM FIELD)
export interface TaskCustomField {
  id: string;
  key: string;
  value: string;
}

// Legacy resolution report interface retained for backwards compatibility if needed
export interface ResolutionReport {
  rootCause: string;
  correctiveSolution: string;
  replacedParts: string[];
  testPrintResult: string;
  confirmedBy: string;
  confirmedDate: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  startDate: string;
  dueDate: string;
  nextCheckDate?: string;
  completedDate?: string;
  progressPercent: number;
  printerId: string;
  printerName: string;
  location: string;
  incidentId?: string;
  errorCode?: string; // e.g. "SC-542", "E000-0001", "13.01.00"
  dueDateStatus: 'overdue' | 'due_soon' | 'on_track';
  notes: string;
  contingencyPlan?: string;
  activityLogs: TaskActivityLog[];
  dynamicSteps?: TaskStepItem[];
  activityFeed?: TaskActivityFeedItem[];
  checklist?: TaskChecklistItem[];
  // 4 Khu vực kỹ thuật cốt lõi (Đã loại bỏ Resolution Report)
  workLogs?: WorkLogEntry[];
  vendorCommunications?: VendorCommunicationLog[];
  timeAndCost?: TimeAndCostSummary;
  estimatedTimeAndCost?: TimeAndCostSummary;
  attachments?: TaskAttachment[];
  customFields?: TaskCustomField[];
  createdAt: string;
  updatedAt: string;
}
