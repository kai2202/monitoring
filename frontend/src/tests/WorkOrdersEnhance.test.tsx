/**
 * Frontend/src/tests/WorkOrdersEnhance.test.tsx
 *
 * Kiểm thử toàn diện cho các thành phần mở rộng Work Order (Lệnh Bảo Trì):
 * 1. WorkOrdersTable: Bảng phân cấp chuẩn Sensys CMMS, mở rộng sub-steps, bộ lọc đa chiều.
 * 2. WorkOrderDetailView: Giao diện 2 cột độc lập (Time & Cost, Work Log, Vendor Communication,
 *    Resolution Report, Attachments, Stepper Progress & Activity Stream).
 *
 * Tuân thủ AGENTS.md: MetricValue = number | null, kiểm tra nhãn tiếng Việt tự nhiên.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkOrdersTable } from '../components/dashboard/WorkOrdersTable';
import { WorkOrderDetailView } from '../components/dashboard/WorkOrderDetailView';
import { Task } from '../types/task';
import { Printer } from '../types/printer';
import { mockTasks } from '../mocks/mockTasks';

const samplePrinters: Printer[] = [
  {
    id: 'PRN-001',
    name: 'Ricoh MP 5055 (P. Kế toán)',
    model: 'MP 5055',
    mfr: 'Ricoh',
    ip: '192.168.1.101',
    deviceType: 'MFP Đa năng',
    location: 'Tầng 2 - Phòng Kế toán',
    connectionStatus: 'Online',
    health: 'Warning',
    alertSeverity: 'warning',
    supplies: { black: 12, cyan: null, magenta: null, yellow: null, waste: 45 },
    counters: { total: 145230, copier: 98120, fax: 1450, scanner: 45660 },
    snmpStatus: 'Active',
    colorCapability: 'Monochrome',
    firmware: 'v2.40.1',
    isStale: false,
    lastScrape: 'Vừa xong',
  },
  {
    id: 'PRN-002',
    name: 'Canon imageRUNNER ADVANCE (P. Giám đốc)',
    model: 'C5535i',
    mfr: 'Canon',
    ip: '192.168.1.102',
    deviceType: 'MFP Màu',
    location: 'Tầng 5 - Phòng Giám đốc',
    connectionStatus: 'Online',
    health: 'Critical',
    alertSeverity: 'critical',
    supplies: { black: 78, cyan: 65, magenta: 82, yellow: 54, waste: 20 },
    counters: { total: 89410, copier: 42100, fax: 320, scanner: 46990 },
    snmpStatus: 'Active',
    colorCapability: 'Color',
    firmware: 'v1.18.4',
    isStale: false,
    lastScrape: '1 phút trước',
  },
];

describe('WorkOrdersTable Component (Sensys CMMS Style)', () => {
  it('renders work orders list with proper columns and tasks', () => {
    const handleOpenDetail = vi.fn();
    render(
      <WorkOrdersTable
        tasks={mockTasks}
        printers={samplePrinters}
        onOpenTaskDetail={handleOpenDetail}
      />
    );

    // Kiểm tra header bảng
    expect(screen.getByText('TÊN LỆNH / MÔ TẢ BẢO TRÌ')).toBeDefined();
    expect(screen.getByText('NGƯỜI PHỤ TRÁCH')).toBeDefined();
    expect(screen.getByText('TRẠNG THÁI')).toBeDefined();
    expect(screen.getByText('ƯU TIÊN')).toBeDefined();
    expect(screen.getByText('THIẾT BỊ MỤC TIÊU')).toBeDefined();

    // Kiểm tra render task đầu tiên
    expect(screen.getByText('Khắc phục kẹt giấy liên tục & vệ sinh sensor quang học')).toBeDefined();
    expect(screen.getByText('WO-20261028-0001')).toBeDefined();
  });

  it('allows expanding and collapsing sub-steps for hierarchical work orders', () => {
    const handleOpenDetail = vi.fn();
    render(
      <WorkOrdersTable
        tasks={mockTasks}
        printers={samplePrinters}
        onOpenTaskDetail={handleOpenDetail}
      />
    );

    // Task đầu tiên mở mặc định
    expect(screen.getByText('QUY TRÌNH KỸ THUẬT CON (SUB-STEPS):')).toBeDefined();
    expect(screen.getByText(/Tiếp nhận & khảo sát kẹt giấy/i)).toBeDefined();

    // Bấm nút đóng/mở dòng
    const toggleButton = screen.getByTitle('Mở rộng / Thu gọn các bước con');
    fireEvent.click(toggleButton);

    // Sau khi thu gọn, quy trình kỹ thuật con bị ẩn
    expect(screen.queryByText('QUY TRÌNH KỸ THUẬT CON (SUB-STEPS):')).toBeNull();
  });

  it('filters tasks by scope (All vs Active vs Completed)', () => {
    render(
      <WorkOrdersTable
        tasks={mockTasks}
        printers={samplePrinters}
        onOpenTaskDetail={vi.fn()}
      />
    );

    // Bấm chuyển sang tab "Đã hoàn thành"
    const completedTabBtn = screen.getByRole('button', { name: /Đã hoàn thành/i });
    fireEvent.click(completedTabBtn);

    // Task completed hiển thị
    expect(screen.getByText('WO-20261025-0004')).toBeDefined();
    // Task đang làm không hiển thị trong tab đã hoàn thành
    expect(screen.queryByText('WO-20261028-0001')).toBeNull();
  });

  it('triggers onOpenTaskDetail when clicking on detail action button', () => {
    const handleOpenDetail = vi.fn();
    render(
      <WorkOrdersTable
        tasks={mockTasks}
        printers={samplePrinters}
        onOpenTaskDetail={handleOpenDetail}
      />
    );

    const detailButtons = screen.getAllByTitle('Mở Drawer chi tiết lệnh bảo trì (Slide-over 60%)');
    fireEvent.click(detailButtons[0]);

    expect(handleOpenDetail).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'PRN-001' }),
      'WO-20261028-0001'
    );
  });
});

describe('WorkOrderDetailView Component (Dual-Column Technical Layout)', () => {
  const sampleTask: Task = mockTasks[0];

  it('renders technical details column with Time & Cost cards', () => {
    render(<WorkOrderDetailView task={sampleTask} />);

    // Khối Time & Cost
    expect(screen.getByText('Thời Gian & Chi Phí Bảo Trì (Time & Cost)')).toBeDefined();
    expect(screen.getByText('SỬA CHỮA')).toBeDefined();
    expect(screen.getByText('2.5h')).toBeDefined();
    expect(screen.getByText('DOWNTIME')).toBeDefined();
    expect(screen.getByText('4.0h')).toBeDefined();
    expect(screen.getByText('TỔNG CHI PHÍ')).toBeDefined();
  });

  it('renders Work Log step execution details', () => {
    render(<WorkOrderDetailView task={sampleTask} />);

    // Khối Work Log
    expect(screen.getByText(/Nhật Ký Thực Thi Kỹ Thuật \(Work Log\)/i)).toBeDefined();
    expect(screen.getByText('Tháo cụm đảo mặt và kiểm tra cơ cấu kéo giấy')).toBeDefined();
    expect(screen.getByText('Vệ sinh sensor quang học và con lăn pick-up roller')).toBeDefined();
    expect(screen.getByText(/Vệ sinh bằng dung dịch chuyên dụng/i)).toBeDefined();
  });

  it('allows expanding Vendor Communication card and Resolution Report', () => {
    render(<WorkOrderDetailView task={sampleTask} />);

    // Thẻ Liên hệ nhà cung cấp
    const vendorHeader = screen.getByText(/Liên Hệ Hãng & Đối Tác \(Vendor Communication\)/i);
    expect(vendorHeader).toBeDefined();
    expect(screen.getByText('Trung tâm Kỹ thuật Ricoh Việt Nam')).toBeDefined();
    expect(screen.getByText('Nguyễn Văn Hùng (Chuyên viên hãng)')).toBeDefined();

    // Thẻ Báo cáo nghiệm thu & nguyên nhân gốc rễ
    const resolutionHeader = screen.getByText(/Báo Cáo Khắc Phục Triệt Để \(Resolution Report\)/i);
    fireEvent.click(resolutionHeader);

    expect(screen.getByText('NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE)')).toBeDefined();
    expect(screen.getByText('LINH KIỆN ĐÃ THAY THẾ')).toBeDefined();
    expect(screen.getByText('KẾT QUẢ IN KIỂM THỬ (TEST PRINT)')).toBeDefined();
  });

  it('renders Right-hand Progress Timeline with step checkboxes and completion handlers', () => {
    const handleToggleStep = vi.fn();
    const handleCompleteTask = vi.fn();

    render(
      <WorkOrderDetailView
        task={sampleTask}
        onToggleStepStatus={handleToggleStep}
        onCompleteTask={handleCompleteTask}
      />
    );

    // Stepper header
    expect(screen.getByText('Tiến Độ Thực Thi (Progress)')).toBeDefined();

    // Toggle step status
    const stepItems = screen.getAllByTitle('Bấm để đổi trạng thái bước này');
    expect(stepItems.length).toBeGreaterThan(0);
    fireEvent.click(stepItems[0]);

    expect(handleToggleStep).toHaveBeenCalledWith(sampleTask.id, sampleTask.dynamicSteps![0].id);

    // Complete & Archive button
    const completeButton = screen.getByRole('button', { name: /Nghiệm Thu & Lưu Kho/i });
    fireEvent.click(completeButton);

    expect(handleCompleteTask).toHaveBeenCalledWith(sampleTask.id);
  });
});

