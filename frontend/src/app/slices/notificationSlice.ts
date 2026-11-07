/**
 * Frontend/src/app/slices/notificationSlice.ts
 *
 * Quản lý trạng thái thông báo tập trung cho FleetMonitor:
 * 1. Chuông Cảnh báo lỗi phần cứng chưa gán vào Từ điển (Unmapped Error Codes)
 * 2. Chuông Duyệt nghiệm thu (Admin: chờ duyệt | Field Tech: yêu cầu làm lại)
 *
 * Tuân thủ nghiêm ngặt AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UnmappedHardwareErrorItem } from '../../services/interfaces/ISettingsService';

export interface TaskNotificationItem {
  id: string;
  taskId: string;
  taskTitle: string;
  printerId: string;
  type: 'PENDING_APPROVAL' | 'REWORK_REQUIRED';
  message: string;
  assigneeName: string;
  requestedByName?: string;
  reworkReason?: string;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationState {
  unmappedErrors: UnmappedHardwareErrorItem[];
  taskNotifications: TaskNotificationItem[];
}

const initialUnmappedErrors: UnmappedHardwareErrorItem[] = [
  {
    vendor: 'Ricoh',
    errorCode: 'SC-990',
    occurrencesCount: 2,
    openIncidentsCount: 1,
    affectedPrinters: ['PRN-HN-01', 'PRN-HN-02'],
    sampleTitle: 'Mã lỗi hoạt động phần mềm hệ thống quét',
    suggestedSubsystem: 'SCANNER',
    severity: 'Warning',
    lastDetectedAt: '12 phút trước',
  },
  {
    vendor: 'Canon',
    errorCode: 'E000020-0001',
    occurrencesCount: 1,
    openIncidentsCount: 1,
    affectedPrinters: ['PRN-DN-01'],
    sampleTitle: 'Cảm biến cấp mực phát hiện bất thường',
    suggestedSubsystem: 'TONER',
    severity: 'Critical',
    lastDetectedAt: '28 phút trước',
  },
];

const initialTaskNotifications: TaskNotificationItem[] = [
  {
    id: 'notif-task-1',
    taskId: 'TASK-102',
    taskTitle: 'Thay bao lụa & con lăn sấy Ricoh MP 5054',
    printerId: 'PRN-HN-01',
    type: 'PENDING_APPROVAL',
    message: 'Kỹ thuật viên Lê Hoàng Nam đã gửi yêu cầu nghiệm thu đóng lệnh',
    assigneeName: 'Lê Hoàng Nam',
    timestamp: '15 phút trước',
    isRead: false,
  },
  {
    id: 'notif-task-2',
    taskId: 'TASK-105',
    taskTitle: 'Vệ sinh hộp quang & gương Canon iR2625i',
    printerId: 'PRN-SG-03',
    type: 'REWORK_REQUIRED',
    message: 'Bản in test còn vết sọc đen mép phải, cần vệ sinh lại gương phản xạ số 2',
    assigneeName: 'Lê Hoàng Nam',
    requestedByName: 'Nguyễn Văn An (Admin)',
    reworkReason: 'Bản in test còn vết sọc đen mép phải, cần vệ sinh lại gương phản xạ số 2',
    timestamp: '1 giờ trước',
    isRead: false,
  },
];

const initialState: NotificationState = {
  unmappedErrors: initialUnmappedErrors,
  taskNotifications: initialTaskNotifications,
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setUnmappedErrors: (state, action: PayloadAction<UnmappedHardwareErrorItem[]>) => {
      state.unmappedErrors = action.payload;
    },
    dismissUnmappedError: (state, action: PayloadAction<string>) => {
      state.unmappedErrors = state.unmappedErrors.filter((e) => e.errorCode !== action.payload);
    },
    addTaskNotification: (state, action: PayloadAction<TaskNotificationItem>) => {
      const existingIdx = state.taskNotifications.findIndex(
        (n) => n.taskId === action.payload.taskId && n.type === action.payload.type
      );
      if (existingIdx >= 0) {
        state.taskNotifications[existingIdx] = action.payload;
      } else {
        state.taskNotifications.unshift(action.payload);
      }
    },
    markTaskNotificationAsRead: (state, action: PayloadAction<string>) => {
      const item = state.taskNotifications.find((n) => n.id === action.payload);
      if (item) item.isRead = true;
    },
    markAllTaskNotificationsAsRead: (state) => {
      state.taskNotifications.forEach((n) => {
        n.isRead = true;
      });
    },
    removeTaskNotificationByTaskId: (state, action: PayloadAction<string>) => {
      state.taskNotifications = state.taskNotifications.filter((n) => n.taskId !== action.payload);
    },
  },
});

export const {
  setUnmappedErrors,
  dismissUnmappedError,
  addTaskNotification,
  markTaskNotificationAsRead,
  markAllTaskNotificationsAsRead,
  removeTaskNotificationByTaskId,
} = notificationSlice.actions;

export default notificationSlice.reducer;

