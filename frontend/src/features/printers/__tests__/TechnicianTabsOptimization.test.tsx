/**
 * Frontend/src/features/printers/__tests__/TechnicianTabsOptimization.test.tsx
 *
 * Unit tests kiểm thử tối ưu hóa phân hệ Kỹ thuật viên hiện trường (FIELD_TECH):
 * - Sub-tab ordering & Role chip trong PrintersPageHeader
 * - Nút lọc "Việc của tôi" trên TimelineCalendarHeader & WorkOrdersFilterBar
 * - Ẩn nút "Lập lệnh" trên AttentionDeviceTableRow đối với KTV
 * - Ẩn tab "SLA & Chi phí" trên AnalyticsPageHeader đối với KTV
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../auth/slices/authSlice';
import uiReducer from '../../../app/slices/uiSlice';
import { PrintersPageHeader } from '../components/PrintersPageHeader';
import { TimelineCalendarHeader } from '../../dashboard/components/timeline/TimelineCalendarHeader';
import { WorkOrdersFilterBar } from '../components/workorders/WorkOrdersFilterBar';
import { AttentionDeviceTableRow } from '../../dashboard/components/attention/AttentionDeviceTableRow';
import { AnalyticsPageHeader } from '../../analytics/components/banner/AnalyticsPageHeader';
import { Printer } from '../../../types/printer';

const createTechStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: 'usr-002',
          username: 'tech_nam',
          fullName: 'Lê Hoàng Nam',
          email: 'nam.le@fleetmonitor.vn',
          role: 'FIELD_TECH' as any,
          roleNameVi: 'Kỹ thuật viên Hiện trường',
          avatarInitials: 'LN',
          dataScope: { departmentName: 'Hiện trường' },
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    },
  });

const createAdminStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: 'usr-001',
          username: 'admin',
          fullName: 'Nguyễn Văn An',
          email: 'admin@fleetmonitor.vn',
          role: 'ADMIN' as any,
          roleNameVi: 'Quản trị viên Hệ thống',
          avatarInitials: 'AN',
          dataScope: { departmentName: 'Toàn hệ thống' },
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

describe('Technician Tabs Optimization Test Suite', () => {
  it('renders PrintersPageHeader with technician priority tabs & KTV badge for FIELD_TECH', () => {
    const handleTabChange = vi.fn();

    render(
      <PrintersPageHeader
        activeTab="timeline"
        onTabChange={handleTabChange}
        roleNameVi="Kỹ thuật viên Hiện trường"
        isAdmin={false}
        totalPrinters={35}
        totalTasks={8}
        isLoading={false}
        onRefresh={vi.fn()}
        onOpenCreatePrinter={vi.fn()}
        onOpenBranchManager={vi.fn()}
      />
    );

    // KTV badge
    expect(screen.getByText(/Chế độ Hiện trường: Tiếp nhận & Nghiệm thu SOP/i)).toBeDefined();
    // Buttons Khai báo máy in & Quản lý vị trí must NOT be present
    expect(screen.queryByText('Khai báo máy in')).toBeNull();
    expect(screen.queryByText('Quản lý Vị trí & Tầng')).toBeNull();

    // Verify Tab labels
    expect(screen.getByText('Lịch trình Gantt')).toBeDefined();
    expect(screen.getByText('Lệnh bảo trì')).toBeDefined();
    expect(screen.getByText('Danh sách máy')).toBeDefined();
  });

  it('renders TimelineCalendarHeader with "Việc của tôi" toggle for KTV and hides "Tạo việc mới"', () => {
    const handleToggleMyTasks = vi.fn();
    const store = createTechStore();

    render(
      <Provider store={store}>
        <TimelineCalendarHeader
          viewDuration={14}
          onChangeViewDuration={vi.fn()}
          dateRangeLabel="1 Th11 — 14 Th11, 2026"
          onPrevRange={vi.fn()}
          onNextRange={vi.fn()}
          onJumpToToday={vi.fn()}
          searchQuery=""
          onSearchChange={vi.fn()}
          typeFilter="all"
          onTypeFilterChange={vi.fn()}
          onlyWithTasks={false}
          onToggleOnlyWithTasks={vi.fn()}
          printersWithTasksCount={5}
          myTasksOnly={false}
          onToggleMyTasksOnly={handleToggleMyTasks}
          myTasksCount={3}
          onOpenCreateModal={vi.fn()}
        />
      </Provider>
    );

    const myTasksBtn = screen.getByText('Việc của tôi');
    expect(myTasksBtn).toBeDefined();
    expect(screen.getByText('3')).toBeDefined(); // Task count badge

    fireEvent.click(myTasksBtn);
    expect(handleToggleMyTasks).toHaveBeenCalledTimes(1);

    // "Tạo việc mới" must be hidden for FIELD_TECH
    expect(screen.queryByText('Tạo việc mới')).toBeNull();
  });

  it('renders WorkOrdersFilterBar with "Việc của tôi" pill and handles click', () => {
    const handleScopeChange = vi.fn();

    render(
      <WorkOrdersFilterBar
        searchQuery=""
        onSearchChange={vi.fn()}
        scopeFilter="all"
        onScopeFilterChange={handleScopeChange}
        myTasksCount={4}
        codeFilter="all"
        onCodeFilterChange={vi.fn()}
        availableCodes={[]}
        statusFilter="all"
        onStatusFilterChange={vi.fn()}
        priorityFilter="all"
        onPriorityFilterChange={vi.fn()}
      />
    );

    const myTasksTab = screen.getByText('⚡ Việc của tôi (4)');
    expect(myTasksTab).toBeDefined();

    fireEvent.click(myTasksTab);
    expect(handleScopeChange).toHaveBeenCalledWith('my_tasks');
  });

  it('hides "Lập lệnh" and displays "Xem lệnh" on AttentionDeviceTableRow for non-admin', () => {
    const store = createTechStore();
    const handleSelectPrinter = vi.fn();

    render(
      <Provider store={store}>
        <table>
          <tbody>
            <AttentionDeviceTableRow
              printer={mockPrinter}
              copiedIp={null}
              onCopyIp={vi.fn()}
              onSelectPrinter={handleSelectPrinter}
              onCreateTask={vi.fn()}
            />
          </tbody>
        </table>
      </Provider>
    );

    expect(screen.getByText('Chẩn đoán')).toBeDefined();
    expect(screen.getByText('Xem lệnh')).toBeDefined();
    expect(screen.queryByText('Lập lệnh')).toBeNull();
  });

  it('displays "Lập lệnh" on AttentionDeviceTableRow for admin', () => {
    const store = createAdminStore();

    render(
      <Provider store={store}>
        <table>
          <tbody>
            <AttentionDeviceTableRow
              printer={mockPrinter}
              copiedIp={null}
              onCopyIp={vi.fn()}
              onSelectPrinter={vi.fn()}
              onCreateTask={vi.fn()}
            />
          </tbody>
        </table>
      </Provider>
    );

    expect(screen.getByText('Chẩn đoán')).toBeDefined();
    expect(screen.getByText('Lập lệnh')).toBeDefined();
  });

  it('hides "SLA & Chi phí" sub-tab on AnalyticsPageHeader when user is FIELD_TECH', () => {
    const store = createTechStore();

    render(
      <Provider store={store}>
        <AnalyticsPageHeader
          currentTab="overview"
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
    expect(screen.getByText('Vật tư')).toBeDefined();
    // SLA & Chi phí must NOT be present for FIELD_TECH
    expect(screen.queryByText('SLA & Chi phí')).toBeNull();
  });
});

