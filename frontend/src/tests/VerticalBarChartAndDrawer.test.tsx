/**
 * Frontend/src/tests/VerticalBarChartAndDrawer.test.tsx
 *
 * Kiểm thử tích hợp & Unit test cho:
 * 1. Khối Đóng Góp Sản Lượng: Biểu đồ cột đứng (Vertical Column Bar Chart SVG)
 * 2. Ngăn kéo Chẩn đoán Thiết bị (PrinterDiagnosticsDrawer): Tinh gọn còn 2 tab, tích hợp bộ đếm OID & Zabbix
 * 3. Bảng Lệnh Bảo trì (WorkOrdersTable): Loại bỏ nút bấm "Lịch trình Gantt"
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloorContributionBarChart } from '../components/analytics/FloorContributionBarChart';
import { PrinterDiagnosticsDrawer } from '../components/dashboard/PrinterDiagnosticsDrawer';
import { WorkOrdersTable } from '../components/dashboard/WorkOrdersTable';
import { Printer } from '../types/printer';
import { Task } from '../types/task';

// Mock Printer
const mockPrinter: Printer = {
  id: 'printer-test-01',
  name: 'Ricoh Pro C7200s (Phòng In Nhanh)',
  ip: '192.168.1.150',
  model: 'Pro C7200s',
  mfr: 'Ricoh',
  deviceType: 'Production Color MFP',
  status: 'Ready',
  healthStatus: 'Normal',
  snmpStatus: 'Active',
  location: 'Tầng 1 - Khu Vực Văn Phòng',
  firmware: 'v2.10-ENG',
  lastScrape: 'Vừa xong (10s trước)',
  downtimeDuration: null,
  isStale: false,
  supplies: {
    black: 85,
    cyan: 70,
    magenta: 45,
    yellow: 90,
    wasteToner: 15,
  },
  counters: {
    total: 42300,
    copier: 15200,
    fax: 120,
    scanner: 8900,
  },
};

// Mock Task
const mockTasks: Task[] = [
  {
    id: 'WO-20261028-0001',
    title: 'Thay thế Cụm Sấy (Fuser Unit)',
    printerId: 'printer-test-01',
    printerName: 'Ricoh Pro C7200s (Phòng In Nhanh)',
    location: 'Tầng 1 - Khu Vực Văn Phòng',
    priority: 'P1_Urgent',
    status: 'In_Progress',
    type: 'CORRECTIVE_REPAIR',
    assignee: 'Nguyễn Văn Hùng',
    startDate: '2026-10-28T08:00:00.000Z',
    dueDate: '2026-10-29T18:00:00.000Z',
    createdAt: '2026-10-28T08:00:00.000Z',
    updatedAt: '2026-10-28T08:00:00.000Z',
    errorCode: 'SC-542',
    dynamicSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Chẩn đoán cảm biến nhiệt',
        status: 'Completed',
        durationMinutes: 20,
      },
    ],
  },
];

describe('1. FloorContributionBarChart (Vertical Column Bar Chart)', () => {
  it('renders vertical bar chart SVG with column bars and top numbers', () => {
    const handleTogglePin = vi.fn();
    render(
      <FloorContributionBarChart
        timeframe="30d"
        pinnedPrinterIds={['p-t1-01']}
        onTogglePinPrinter={handleTogglePin}
      />
    );

    // Tiêu đề & badge
    expect(screen.getByText(/Đóng Góp Sản Lượng Theo Tầng & Thiết Bị/i)).toBeDefined();

    // Các tab tầng
    expect(screen.getByText('Tất cả tầng')).toBeDefined();
    expect(screen.getByText('Tầng 1')).toBeDefined();
    expect(screen.getByText('Tầng 2')).toBeDefined();

    // Khung biểu đồ SVG
    const svgElement = document.querySelector('svg');
    expect(svgElement).not.toBeNull();

    // Các cột đứng dạng rect với bo góc phía trên rx="6" ry="6"
    const rects = document.querySelectorAll('svg rect');
    expect(rects.length).toBeGreaterThan(0);

    // Click vào thanh cột đầu tiên để ghim/bỏ ghim
    const firstBar = rects[0];
    fireEvent.click(firstBar);
    expect(handleTogglePin).toHaveBeenCalled();
  });

  it('safely handles bar hover tooltip without throwing toFixed error on missing or undefined sharePercentage', () => {
    const handleTogglePin = vi.fn();
    const { container } = render(
      <FloorContributionBarChart
        timeframe="30days"
        pinnedPrinterIds={['p-t1-01']}
        onTogglePinPrinter={handleTogglePin}
      />
    );

    const barGroups = container.querySelectorAll('svg g[style*="cursor: pointer"]');
    expect(barGroups.length).toBeGreaterThan(0);

    // Hover over bar group
    fireEvent.mouseEnter(barGroups[0]);

    // Check that popover appears with percentage without throwing toFixed error
    expect(screen.getByText(/Tỷ trọng đóng góp:/i)).toBeDefined();
    expect(screen.getByText(/% tải tầng/i)).toBeDefined();
  });
});

describe('2. PrinterDiagnosticsDrawer (Streamlined 2 Tabs & Merged Counters)', () => {
  it('renders only 2 tabs and includes SNMP counters & Zabbix monitoring inside Tab 1', () => {
    render(
      <PrinterDiagnosticsDrawer
        printer={mockPrinter}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Kiểm tra chính xác 2 tab: "Chẩn đoán & Vật tư" và "Công việc & Tiến trình"
    expect(screen.getByText(/Chẩn đoán & Vật tư/i)).toBeDefined();
    expect(screen.getByText(/Công việc & Tiến trình/i)).toBeDefined();

    // KHÔNG còn tab thứ 3 "Bộ đếm & Lịch sử SNMP" trên header bar
    const tabHeaders = screen.queryByRole('button', { name: /Bộ đếm & Lịch sử SNMP/i });
    expect(tabHeaders).toBeNull();

    // KHÔNG còn nút "Tạo Lệnh Công Việc Cho Máy In Này"
    const createTaskBtn = screen.queryByText(/Tạo Lệnh Công Việc Cho Máy In Này/i);
    expect(createTaskBtn).toBeNull();

    // Tab 1 phải chứa khu vực Bộ Đếm Trang In Thực Tế (SNMP OID Counters)
    expect(screen.getByText(/Bộ Đếm Trang In Thực Tế \(SNMP OID Counters\)/i)).toBeDefined();
    expect(screen.getByText('TỔNG TRANG IN')).toBeDefined();
    expect(screen.getByText('BẢN SAO (COPY)')).toBeDefined();
    expect(screen.getByText('BẢN FAX')).toBeDefined();
    expect(screen.getByText('BẢN QUÉT (SCAN)')).toBeDefined();

    // Tab 1 phải chứa Thông Số Giám Sát Zabbix
    expect(screen.getByText(/Thông Số Giám Sát Zabbix/i)).toBeDefined();
    expect(screen.getByText(/Lần cào dữ liệu gần nhất:/i)).toBeDefined();
    expect(screen.getByText(/Thời gian ngừng trệ \(Downtime\):/i)).toBeDefined();
    expect(screen.getByText(/Chất lượng dữ liệu:/i)).toBeDefined();
  });
});

describe('3. WorkOrdersTable (Removed Gantt Button)', () => {
  it('does not render "Lịch trình Gantt" button in toolbar', () => {
    render(
      <WorkOrdersTable
        tasks={mockTasks}
        printers={[mockPrinter]}
        onOpenTaskDetail={vi.fn()}
        onSwitchToTimelineView={vi.fn()}
      />
    );

    // Kiểm tra nút "Lịch trình Gantt" đã được loại bỏ hoàn toàn
    const ganttButton = screen.queryByText(/Lịch trình Gantt/i);
    expect(ganttButton).toBeNull();

    // Bảng lệnh vẫn render đúng các thành phần chính
    expect(screen.getByText(/Thay thế Cụm Sấy \(Fuser Unit\)/i)).toBeDefined();
    expect(screen.getByText(/Tên Lệnh \/ Công Việc \(Name\)/i)).toBeDefined();
  });
});

