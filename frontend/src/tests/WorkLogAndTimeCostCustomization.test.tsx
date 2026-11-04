/**
 * Frontend/src/tests/WorkLogAndTimeCostCustomization.test.tsx
 *
 * Kiểm thử tính năng tinh gọn Nhật ký thao tác kỹ thuật & Bảng Thời gian & Chi phí:
 * 1. Work Log: Bỏ thời lượng & số liệu đo đạc, tự động lưu ngày giờ tạo (createdAt).
 * 2. Time & Cost trong WorkOrderDetailView: Bỏ tiền tố "1.", dạng bảng thẻ Ảnh 1, nút tick bật/tắt ô điền.
 * 3. Tạo Task trong PrinterDiagnosticsDrawer: Tick button bật/tắt các ô điền dự toán chi phí.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkOrderDetailView } from '../components/dashboard/WorkOrderDetailView';
import { PrinterDiagnosticsDrawer } from '../components/dashboard/PrinterDiagnosticsDrawer';
import { Task } from '../types/task';
import { Printer } from '../types/printer';

const mockTask: Task = {
  id: 'WO-20261103-0001',
  title: 'Xử lý cụm sấy nhiệt độ cao SC-542',
  description: 'Lỗi nhiệt độ sấy vượt ngưỡng cho phép, cần kiểm tra thermistor.',
  taskType: 'CORRECTIVE_REPAIR',
  priority: 'P1_Urgent',
  status: 'In_Progress',
  assignee: 'Nguyễn Văn An',
  startDate: '2026-11-03T08:00:00.000Z',
  dueDate: '2026-11-04T18:00:00.000Z',
  progressPercent: 50,
  printerId: 'prt-004',
  printerName: 'Ricoh Pro C7200s Production',
  location: 'Tầng 2 - Phòng Thiết kế',
  createdAt: '2026-11-03T08:00:00.000Z',
  updatedAt: '2026-11-03T08:00:00.000Z',
  timeAndCost: {
    repairTimeHours: 2.0,
    waitingTimeHours: 1.0,
    downtimeHours: 3.0,
    laborCostVnd: 600000,
    partsCostVnd: 1200000,
    totalCostVnd: 1800000,
  },
  estimatedTimeAndCost: {
    repairTimeHours: 2.5,
    waitingTimeHours: 0.5,
    downtimeHours: 3.0,
    laborCostVnd: 750000,
    partsCostVnd: 1200000,
    totalCostVnd: 1950000,
  },
  workLogs: [
    {
      id: 'wl-01',
      stepNumber: 1,
      stepTitle: 'Kiểm tra cảm biến nhiệt độ thermistor',
      performerName: 'Nguyễn Văn An',
      performerAvatar: 'NA',
      createdAt: '08:30, 03/11/2026',
      actionsTaken: 'Dùng đồng hồ đo điện trở Thermistor, giá trị đo được bình thường 120 Ohm.',
      resultStatus: 'SUCCESS',
    },
  ],
};

const mockPrinter: Printer = {
  id: 'prt-004',
  name: 'Ricoh Pro C7200s Production',
  ip: '192.168.1.104',
  model: 'Pro C7200s',
  mfr: 'Ricoh',
  deviceType: 'Production MFP',
  status: 'Warning',
  healthStatus: 'Warning',
  snmpStatus: 'Active',
  location: 'Tầng 2 - Phòng Thiết kế',
  firmware: 'v2.10',
  lastScrape: 'Vừa xong',
  downtimeDuration: '30 phút',
  isStale: false,
};

describe('1. WorkOrderDetailView - Time & Cost (Ảnh 1 & Tick Bật/Tắt)', () => {
  it('renders Time & Cost without "1." prefix and with toggle tick buttons for each field', () => {
    const handleUpdate = vi.fn();
    render(<WorkOrderDetailView task={mockTask} onUpdateTask={handleUpdate} />);

    // Kiểm tra tiêu đề KHÔNG có tiền tố "1."
    expect(screen.getByText(/Thời Gian & Chi Phí Bảo Trì \(Time & Cost\)/i)).toBeDefined();
    expect(screen.queryByText(/^1\.\s+Thời Gian/i)).toBeNull();

    // Kiểm tra các nút tick bật/tắt trường
    expect(screen.getByText('Sửa chữa')).toBeDefined();
    expect(screen.getByText('Chờ linh kiện')).toBeDefined();
    expect(screen.getByText('Downtime')).toBeDefined();
    expect(screen.getByText('Nhân công')).toBeDefined();
    expect(screen.getByText('Linh kiện')).toBeDefined();
    expect(screen.getByText('Tổng chi phí')).toBeDefined();

    // Kiểm tra hiển thị số liệu thẻ dọc chuẩn Ảnh 1
    expect(screen.getByText('2h')).toBeDefined();
    expect(screen.getByText('1h')).toBeDefined();
    expect(screen.getByText('3h')).toBeDefined();
    expect(screen.getByText('600.000 đ')).toBeDefined();
    expect(screen.getByText('1.200.000 đ')).toBeDefined();
    expect(screen.getByText('1.800.000 đ')).toBeDefined();
  });

  it('allows unticking a field to hide it from the table', () => {
    render(<WorkOrderDetailView task={mockTask} />);

    // Ban đầu có "Thời gian sửa chữa"
    expect(screen.getByText('Thời gian sửa chữa')).toBeDefined();

    // Bấm nút tick "Sửa chữa" để tắt
    const toggleRepairBtn = screen.getByTitle('Bấm để tắt (xóa ô trường này)');
    fireEvent.click(toggleRepairBtn);

    // Sau khi tắt, nhãn "Thời gian sửa chữa" trong bảng thẻ bị ẩn đi
    expect(screen.queryByText('Thời gian sửa chữa')).toBeNull();
  });
});

describe('2. WorkOrderDetailView - Work Log (Loại bỏ thời lượng & đo đạc, tự động lưu ngày giờ)', () => {
  it('does not render duration and measurement note fields in the work log form', () => {
    render(<WorkOrderDetailView task={mockTask} />);

    // Mở form thêm Work Log
    const openAddBtn = screen.getByText('Thêm nhật ký bước');
    fireEvent.click(openAddBtn);

    // Kiểm tra ô "Tên bước thao tác" có mặt
    expect(screen.getByPlaceholderText(/Kiểm tra điện áp cuộn may-so sấy/i)).toBeDefined();

    // Kiểm tra KHÔNG CÒN ô "Thời lượng (phút)" và KHÔNG CÒN ô "Số liệu đo đạc & Ghi chú kỹ thuật"
    expect(screen.queryByText(/Thời lượng \(phút\)/i)).toBeNull();
    expect(screen.queryByPlaceholderText(/Điện trở Thermistor/i)).toBeNull();
  });

  it('displays the created timestamp on existing work log entries and does not show measurements note', () => {
    render(<WorkOrderDetailView task={mockTask} />);

    // Kiểm tra ngày giờ tạo được ghi nhận và hiển thị
    expect(screen.getByText('08:30, 03/11/2026')).toBeDefined();

    // Kiểm tra không có khối "Đo đạc & Sensor:"
    expect(screen.queryByText(/Đo đạc & Sensor:/i)).toBeNull();
  });
});

describe('3. PrinterDiagnosticsDrawer - Task Creation with Cost Tick Buttons', () => {
  it('renders cost estimation tick buttons and toggles input fields', () => {
    render(
      <PrinterDiagnosticsDrawer
        printer={mockPrinter}
        isOpen={true}
        onClose={vi.fn()}
        initialTab="tasks"
      />
    );

    // Bấm nút tạo task mới
    const createBtn = screen.getByRole('button', { name: /Tạo công việc/i });
    fireEvent.click(createBtn);

    // Kiểm tra có các nút tick chọn dự toán
    expect(screen.getByText(/Dự toán Thời gian & Chi phí Ban Đầu/i)).toBeDefined();
    expect(screen.getByText('Tick vào ô để thêm/bớt trường điền')).toBeDefined();

    // Kiểm tra các ô input ban đầu xuất hiện khi mặc định được tick
    expect(screen.getByText('Sửa chữa (giờ)')).toBeDefined();
    expect(screen.getByText('Chờ linh kiện (giờ)')).toBeDefined();
    expect(screen.getByText('Nhân công (VNĐ)')).toBeDefined();
    expect(screen.getByText('Linh kiện (VNĐ)')).toBeDefined();
  });
});

