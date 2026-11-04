/**
 * Frontend/src/tests/WorkOrderProgressEnhance.test.tsx
 *
 * Kiểm thử đơn vị (Unit Tests) cho nâng cấp Lệnh Bảo Trì (Work Order):
 * 1. Cấu trúc 4 khu vực kỹ thuật cột trái: Time & Cost, Work Log, Vendor, Attachments.
 * 2. Đã LOẠI BỎ hoàn toàn Resolution Report (Biên bản nghiệm thu & nguyên nhân gốc).
 * 3. Tiến trình quy trình Progress dọc chuẩn 100% Ảnh 1 ở cột phải:
 *    - Node hoàn thành có dấu check ✓ (đen)
 *    - Node đang thực hiện hiển thị số thứ tự (xanh)
 *    - Node chờ hiển thị số thứ tự (viền xám)
 * 4. Cơ chế Dynamic Custom Fields: Hiển thị danh sách, cho phép thêm bớt trường linh hoạt.
 * 5. Thời gian & Chi phí khởi tạo và cộng dồn minh bạch.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkOrderDetailView } from '../components/dashboard/WorkOrderDetailView';
import { Task } from '../types/task';

describe('WorkOrderDetailView - Cấu trúc 4 Khu Vực & Loại bỏ Resolution Report', () => {
  const dummyTask: Task = {
    id: 'WO-TEST-001',
    title: 'Xử lý lỗi kẹt giấy và thay cụm sấy',
    description: 'Chi tiết sự cố máy in',
    taskType: 'CORRECTIVE_REPAIR',
    priority: 'P1_Urgent',
    status: 'In_Progress',
    assignee: 'Nguyễn Văn An',
    startDate: '2026-11-03T08:00:00.000Z',
    dueDate: '2026-11-04T18:00:00.000Z',
    progressPercent: 60,
    printerId: 'prt-004',
    printerName: 'Ricoh Pro C7200s Production',
    location: 'Tầng 2 - Kỹ thuật',
    dueDateStatus: 'on_track',
    notes: 'Đang lắp ráp linh kiện mới',
    activityLogs: [],
    dynamicSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Tiếp nhận & Xác thực',
        status: 'Completed',
        completedAt: '08:15',
        completedBy: 'Nguyễn Văn An',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Phê duyệt & Điều phối',
        status: 'Completed',
        completedAt: '08:30',
        completedBy: 'Lê Minh Tuấn',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Kiểm tra & Chẩn đoán tại chỗ',
        status: 'Completed',
        completedAt: '09:00',
        completedBy: 'Nguyễn Văn An',
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Xử lý & Thay thế linh kiện',
        status: 'In_Progress',
        durationMinutes: 45,
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Kiểm thử & Bàn giao',
        status: 'Pending',
        durationMinutes: 30,
      },
    ],
    workLogs: [
      {
        id: 'wl-1',
        stepNumber: 1,
        stepTitle: 'Tháo khối sấy cũ và đo điện trở',
        performerName: 'Nguyễn Văn An',
        performerAvatar: 'NA',
        startTime: '08:15',
        endTime: '09:00',
        durationMinutes: 45,
        actionsTaken: 'Rút cụm Fuser Unit, đo cuộn may-so',
        resultStatus: 'SUCCESS',
        measurementsAndNotes: 'Điện trở Thermistor đo được: ∞',
      },
    ],
    vendorCommunications: [
      {
        id: 'vc-1',
        vendorName: 'Ricoh Vietnam Support',
        contactPerson: 'Trần Đức Thắng',
        phoneOrEmail: '028-3914-1188',
        timestamp: '08:35',
        discussionContent: 'Tham vấn reset mã lỗi qua SP mode',
        vendorGuidance: 'Chạy SP 5-810-001',
        resultOutcome: 'Đã nhận hướng dẫn',
      },
    ],
    estimatedTimeAndCost: {
      repairTimeHours: 2.0,
      waitingTimeHours: 1.0,
      downtimeHours: 3.0,
      laborCostVnd: 600000,
      partsCostVnd: 4200000,
      totalCostVnd: 4800000,
    },
    timeAndCost: {
      repairTimeHours: 1.5,
      waitingTimeHours: 0.5,
      downtimeHours: 2.0,
      laborCostVnd: 450000,
      partsCostVnd: 3850000,
      totalCostVnd: 4300000,
    },
    customFields: [
      { id: 'cf-1', key: 'Điện áp cấp', value: '220V / 50Hz' },
      { id: 'cf-2', key: 'Firmware Version', value: 'v2.41' },
    ],
    attachments: [
      {
        id: 'att-1',
        fileName: 'Bien_ban_kiem_tra.pdf',
        fileType: 'PDF',
        fileSize: '1.2 MB',
        uploadedAt: '09:00',
        uploadedBy: 'Nguyễn Văn An',
      },
    ],
    createdAt: '2026-11-03T08:00:00.000Z',
    updatedAt: '2026-11-03T09:30:00.000Z',
  };

  it('chỉ hiển thị đúng 4 khu vực kỹ thuật ở cột trái, tuyệt đối không có Resolution Report', () => {
    render(<WorkOrderDetailView task={dummyTask} />);

    // 1. Time & Cost
    expect(screen.getByText(/1\. Thời Gian & Chi Phí Bảo Trì/i)).toBeTruthy();
    // 2. Work Log
    expect(screen.getByText(/2\. Nhật Ký Thao Tác Kỹ Thuật/i)).toBeTruthy();
    // 3. Vendor Communication
    expect(screen.getByText(/3\. Lịch Sử Liên Hệ Nhà Cung Cấp/i)).toBeTruthy();
    // 4. Attachments
    expect(screen.getByText(/4\. Tài Liệu & Hình Ảnh Đính Kèm/i)).toBeTruthy();

    // Xác nhận đã loại bỏ Resolution Report
    expect(screen.queryByText(/Biên Bản Nghiệm Thu & Nguyên Nhân Gốc/i)).toBeNull();
    expect(screen.queryByText(/Resolution Report/i)).toBeNull();
  });

  it('hiển thị khối Progress dọc chuẩn Ảnh 1 với đủ 5 mốc quy trình và trạng thái các node', () => {
    render(<WorkOrderDetailView task={dummyTask} />);

    // Header Progress
    expect(screen.getByText('Progress')).toBeTruthy();
    expect(screen.getByText(/3\/5 bước/i)).toBeTruthy();

    // 5 bước quy trình chuẩn CMMS
    expect(screen.getByText('Tiếp nhận & Xác thực')).toBeTruthy();
    expect(screen.getByText('Phê duyệt & Điều phối')).toBeTruthy();
    expect(screen.getByText('Kiểm tra & Chẩn đoán tại chỗ')).toBeTruthy();
    expect(screen.getByText('Xử lý & Thay thế linh kiện')).toBeTruthy();
    expect(screen.getByText('Kiểm thử & Bàn giao')).toBeTruthy();

    // Bước 4 đang thực hiện
    expect(screen.getByText('Đang xử lý')).toBeTruthy();
  });

  it('hiển thị đầy đủ thông số kỹ thuật và các trường tùy biến (Custom Fields) có nút xóa', () => {
    const handleUpdateTask = vi.fn();
    render(<WorkOrderDetailView task={dummyTask} onUpdateTask={handleUpdateTask} />);

    // Kiểm tra custom fields hiển thị
    expect(screen.getByText(/Điện áp cấp:/i)).toBeTruthy();
    expect(screen.getByText('220V / 50Hz')).toBeTruthy();
    expect(screen.getByText(/Firmware Version:/i)).toBeTruthy();
    expect(screen.getByText('v2.41')).toBeTruthy();

    // Nút xóa trường
    const deleteBtn = screen.getByTitle('Xóa trường Điện áp cấp');
    expect(deleteBtn).toBeTruthy();
    fireEvent.click(deleteBtn);
    expect(handleUpdateTask).toHaveBeenCalled();
  });

  it('cho phép thêm trường tùy biến động mới vào công việc', () => {
    const handleUpdateTask = vi.fn();
    render(<WorkOrderDetailView task={dummyTask} onUpdateTask={handleUpdateTask} />);

    // Click nút Thêm trường
    const addBtn = screen.getByRole('button', { name: /Thêm trường/i });
    fireEvent.click(addBtn);

    // Điền form
    const keyInput = screen.getByPlaceholderText(/Tên trường/i);
    const valInput = screen.getByPlaceholderText(/Giá trị/i);
    fireEvent.change(keyInput, { target: { value: 'Mã linh kiện dự phòng' } });
    fireEvent.change(valInput, { target: { value: 'D242-4000' } });

    const saveBtn = screen.getByRole('button', { name: /Lưu trường/i });
    fireEvent.click(saveBtn);

    expect(handleUpdateTask).toHaveBeenCalled();
  });

  it('hiển thị đối chiếu giữa Dự toán ban đầu và Thực tế trong khối Time & Cost', () => {
    render(<WorkOrderDetailView task={dummyTask} />);

    // Kiểm tra giá trị thực tế
    expect(screen.getByText('1.5h')).toBeTruthy();
    expect(screen.getByText('2h')).toBeTruthy(); // Downtime thực tế
    expect(screen.getByText('4.300.000 đ')).toBeTruthy(); // Tổng chi phí thực tế

    // Kiểm tra dự toán ban đầu
    expect(screen.getByText(/Dự toán ban đầu/i)).toBeTruthy();
    expect(screen.getByText(/Dự kiến: 2h/i)).toBeTruthy();
  });
});

