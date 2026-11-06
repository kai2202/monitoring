/**
 * Frontend/src/features/printers/__tests__/HrTabsOptimization.test.tsx
 *
 * Unit tests kiểm thử tối ưu hóa phân hệ HR / Quản trị tài sản (ASSET_HR):
 * - Sidebar menu bao gồm 'Đối soát KPI & Bảo trì'
 * - PrintersPageHeader hiển thị đúng thứ tự sub-tabs và chip Chế độ Quản lý Tài sản
 * - PrinterTableRow hiển thị số serial thiết bị (S/N)
 * - WorkOrderTableRow hiển thị nút 'Hồ sơ đối soát →'
 * - WorkOrderDetailView hiển thị badge 'Hồ sơ đối soát kiểm kê'
 * - AnalyticsPageHeader hiển thị 3 sub-tabs với nhãn và tiêu đề thích ứng cho HR
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../auth/slices/authSlice';
import uiReducer from '../../../app/slices/uiSlice';
import { Sidebar } from '../../../components/layout/Sidebar';
import { PrintersPageHeader } from '../components/PrintersPageHeader';
import { PrinterTableRow } from '../components/PrinterTableRow';
import { WorkOrderTableRow } from '../components/workorders/WorkOrderTableRow';
import { WorkOrderDetailView } from '../../dashboard/components/workorder/WorkOrderDetailView';
import { AnalyticsPageHeader } from '../../analytics/components/banner/AnalyticsPageHeader';
import { Printer } from '../../../types/printer';
import { Task } from '../../../types/task';

const createHrStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: 'usr-003',
          username: 'hr_kiemke',
          fullName: 'Phạm Thu Hà',
          email: 'ha.pham@fleetmonitor.vn',
          role: 'ASSET_HR' as any,
          roleNameVi: 'HR / Kiểm kê Tài sản & Hành chính',
          avatarInitials: 'PH',
          dataScope: { departmentName: 'Kiểm kê tài sản' },
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    },
  });

const mockPrinter: Printer = {
  id: 'PRN-001',
  name: 'Ricoh MP C6004 - P.Kế toán',
  model: 'MP C6004',
  mfr: 'Ricoh',
  deviceType: 'MFP Color',
  serial: 'W87654321',
  ip: '192.168.1.101',
  location: 'Tầng 1 - Phòng Kế toán',
  branch: 'Trụ sở chính (HQ)',
  floor: 'Tầng 1',
  department: 'Kế toán & Tài chính',
  connectionStatus: 'Online',
  monitoringStatus: 'Monitored',
  health: 'Healthy',
  alertSeverity: 'info',
  supplies: { black: 80, cyan: 75, magenta: 60, yellow: 90, waste: 20 },
  counters: { total: 154200, mono: 120000, color: 34200 },
};

const mockTask: Task = {
  id: 'TASK-101',
  title: 'Bảo trì định kỳ cụm sấy Tầng 1',
  printerId: 'PRN-001',
  printerName: 'Ricoh MP C6004 - P.Kế toán',
  location: 'Tầng 1',
  priority: 'P2_High',
  status: 'In_Progress',
  assignee: 'Lê Hoàng Nam',
  dueDate: '2026-11-10',
  progressPercent: 60,
  dynamicSteps: [{ id: 's-1', title: 'Kiểm tra nhiệt độ sấy', status: 'Completed' }],
  timeAndCost: {
    repairTimeHours: 1.5,
    waitingTimeHours: 0.5,
    downtimeHours: 2.0,
    laborCostVnd: 450000,
    partsCostVnd: 1200000,
    totalCostVnd: 1650000,
  },
};

describe('HR / Asset Management Tabs Optimization Test Suite', () => {
  it('renders Sidebar with "Đối soát KPI & Bảo trì" in printer submenu for ASSET_HR', () => {
    const store = createHrStore();
    render(
      <Provider store={store}>
        <Sidebar activeTab="printers" onSelectTab={vi.fn()} collapsed={false} onToggleCollapse={vi.fn()} />
      </Provider>
    );

    expect(screen.getByText('Danh mục tài sản')).toBeDefined();
    expect(screen.getByText('Đối soát KPI & Bảo trì')).toBeDefined();
    expect(screen.getByText('Lịch bảo dưỡng')).toBeDefined();
  });

  it('renders PrintersPageHeader with HR sub-tabs, role badge and Asset Management mode chip', () => {
    const store = createHrStore();
    render(
      <Provider store={store}>
        <PrintersPageHeader
          activeTab="printers"
          onTabChange={vi.fn()}
          roleNameVi="HR / Kiểm kê Tài sản & Hành chính"
          isAdmin={false}
          totalPrinters={35}
          totalTasks={8}
          isLoading={false}
          onRefresh={vi.fn()}
          onOpenCreatePrinter={vi.fn()}
          onOpenBranchManager={vi.fn()}
        />
      </Provider>
    );

    expect(screen.getByText('Danh Mục Tài Sản Máy In')).toBeDefined();
    expect(screen.getByText(/Chế độ Quản lý Tài sản: Kiểm kê & Đối soát hợp đồng/i)).toBeDefined();
    expect(screen.getByText('Danh mục tài sản')).toBeDefined();
    expect(screen.getByText('Đối soát KPI')).toBeDefined();
    expect(screen.getByText('Lịch bảo dưỡng')).toBeDefined();

    // Admin buttons must be hidden
    expect(screen.queryByText('Khai báo máy in')).toBeNull();
    expect(screen.queryByText('Quản lý Vị trí & Tầng')).toBeNull();
  });

  it('displays hardware Serial number (S/N) in PrinterTableRow for asset auditing', () => {
    render(
      <table>
        <tbody>
          <PrinterTableRow
            printer={mockPrinter}
            copiedIp={null}
            isAdmin={false}
            onCopyIp={vi.fn()}
            onOpenDrawer={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText(/S\/N: W87654321/i)).toBeDefined();
  });

  it('renders "Hồ sơ đối soát →" in WorkOrderTableRow for ASSET_HR', () => {
    const store = createHrStore();
    render(
      <Provider store={store}>
        <table>
          <tbody>
            <WorkOrderTableRow
              task={mockTask}
              isExpanded={false}
              onToggleExpand={vi.fn()}
              onOpenDetail={vi.fn()}
              isAdmin={false}
            />
          </tbody>
        </table>
      </Provider>
    );

    expect(screen.getByText('Hồ sơ đối soát →')).toBeDefined();
  });

  it('displays audit badge in WorkOrderDetailView and hides technician completion button for HR', () => {
    const store = createHrStore();
    render(
      <Provider store={store}>
        <WorkOrderDetailView task={mockTask} />
      </Provider>
    );

    expect(screen.getByText('Hồ sơ đối soát kiểm kê')).toBeDefined();
    expect(screen.getByText('Xem ảnh in test')).toBeDefined();
    expect(screen.queryByText('Hoàn tất & Nghiệm thu')).toBeNull();
    expect(screen.queryByText('Phê duyệt nghiệm thu đóng lệnh')).toBeNull();
  });

  it('renders all 3 sub-tabs with HR titles on AnalyticsPageHeader for ASSET_HR', () => {
    const store = createHrStore();
    render(
      <Provider store={store}>
        <AnalyticsPageHeader
          currentTab="sla-cost"
          onSubTabChange={vi.fn()}
          branches={['Trụ sở chính (HQ)']}
          selectedBranch="Trụ sở chính (HQ)"
          onBranchChange={vi.fn()}
          timeframe="30days"
          onTimeframeChange={vi.fn()}
        />
      </Provider>
    );

    expect(screen.getByText('Sản lượng in')).toBeDefined();
    expect(screen.getByText('Vật tư D-Day')).toBeDefined();
    expect(screen.getByText('Hạch toán chi phí')).toBeDefined();
    expect(screen.getByText('Hạch Toán Chi Phí Thuê Máy Phòng Ban')).toBeDefined();
  });
});

