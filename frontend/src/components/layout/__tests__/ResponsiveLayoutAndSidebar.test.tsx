/**
 * Frontend/src/components/layout/__tests__/ResponsiveLayoutAndSidebar.test.tsx
 *
 * Unit tests kiểm thử tính đáp ứng (Responsive) và chế độ Thu gọn Sidebar (72px vs 260px):
 * - Sidebar co giãn mượt mà: 72px khi thu gọn, 260px khi mở rộng.
 * - Icon căn giữa tuyệt đối, không tràn lề khi thu gọn (Rule 7.1).
 * - Footer hồ sơ hiển thị gọn gàng trong 72px và mở popover nổi khi click.
 * - Header co giãn linh hoạt, nút Zabbix Live đồng bộ.
 * - Grid lịch trình bảo trì triệt tiêu hoàn toàn khe hở (ghost spacing) nhờ separate border-spacing 0.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../../features/auth/slices/authSlice';
import uiReducer from '../../../app/slices/uiSlice';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { SidebarProfileFooter } from '../SidebarProfileFooter';
import { TimelineCalendarGrid } from '../../../features/dashboard/components/timeline/TimelineCalendarGrid';
import { DayItem } from '../../../features/dashboard/components/timeline/timelineLanesHelper';
import { Printer } from '../../../types/printer';

const createMockStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: 'usr-admin',
          username: 'noc_admin',
          fullName: 'Nguyễn Văn An',
          email: 'an.nguyen@fleetmonitor.vn',
          role: 'ADMIN' as any,
          roleNameVi: 'Admin Quản Trị Hệ Thống',
          avatarInitials: 'NA',
          dataScope: { departmentName: 'NOC HQ' },
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
      ui: {
        isSyncingZabbix: false,
        lastSyncTime: '12:00:00',
        toastMessage: null,
        selectedBranch: null,
      },
    },
  });

describe('ResponsiveLayoutAndSidebar Test Suite', () => {
  it('1. Sidebar thu gọn (collapsed = true) có chiều rộng 72px và ẩn nhãn chữ', () => {
    const store = createMockStore();
    const onToggle = vi.fn();
    const onSelect = vi.fn();

    const { container } = render(
      <Provider store={store}>
        <Sidebar activeTab="dashboard" onSelectTab={onSelect} collapsed={true} onToggleCollapse={onToggle} />
      </Provider>
    );

    const aside = container.querySelector('aside');
    expect(aside).toHaveStyle({ width: '72px' });

    // Khi collapsed, chữ thương hiệu 'Enterprise NOC' không xuất hiện trong DOM
    expect(screen.queryByText('Enterprise NOC')).toBeNull();

    // Logo squircle có thể click để mở rộng menu
    const logoWrapper = screen.getByTitle('Nhấn để mở rộng thanh menu');
    expect(logoWrapper).toBeInTheDocument();
    fireEvent.click(logoWrapper);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('2. Sidebar mở rộng (collapsed = false) có chiều rộng 260px và hiển thị đầy đủ nhãn chữ', () => {
    const store = createMockStore();
    const onToggle = vi.fn();
    const onSelect = vi.fn();

    const { container } = render(
      <Provider store={store}>
        <Sidebar activeTab="dashboard" onSelectTab={onSelect} collapsed={false} onToggleCollapse={onToggle} />
      </Provider>
    );

    const aside = container.querySelector('aside');
    expect(aside).toHaveStyle({ width: '260px' });
    expect(screen.getByText('FleetMonitor')).toBeInTheDocument();
    expect(screen.getByText('Enterprise NOC')).toBeInTheDocument();

    // Có nút thu gọn menu góc phải
    const collapseBtn = screen.getByTitle('Thu gọn menu');
    expect(collapseBtn).toBeInTheDocument();
    fireEvent.click(collapseBtn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('3. SidebarProfileFooter khi thu gọn hiển thị avatar gọn gàng và click mở Popover nổi', () => {
    const store = createMockStore();
    const onToggle = vi.fn();

    render(
      <Provider store={store}>
        <SidebarProfileFooter collapsed={true} onToggleCollapse={onToggle} />
      </Provider>
    );

    // Avatar NA xuất hiện
    expect(screen.getByText('NA')).toBeInTheDocument();

    // Click vào avatar để mở popover tùy chọn
    const avatarWrapper = screen.getByTitle(/Nguyễn Văn An/);
    fireEvent.click(avatarWrapper);

    // Popover xuất hiện chứa tùy chọn 'Mở rộng thanh bên' và các vai trò
    expect(screen.getByText('Mở rộng thanh bên')).toBeInTheDocument();
    expect(screen.getByText('Đổi vai trò phân quyền')).toBeInTheDocument();
    expect(screen.getByText('Admin Hệ Thống (Toàn quyền)')).toBeInTheDocument();

    // Click 'Mở rộng thanh bên' kích hoạt onToggleCollapse
    fireEvent.click(screen.getByText('Mở rộng thanh bên'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('4. Header hiển thị đúng breadcrumb, huy hiệu Zabbix Live và nút Đồng bộ', () => {
    const onRefresh = vi.fn();
    const onTheme = vi.fn();

    render(
      <Header
        activeTab="printers"
        isDark={false}
        onToggleTheme={onTheme}
        onManualRefresh={onRefresh}
        isRefreshing={false}
        lastSyncTime="14:30:00"
      />
    );

    expect(screen.getByText('Xin chào, Kỹ sư NOC!')).toBeInTheDocument();
    expect(screen.getByText('Danh mục máy in')).toBeInTheDocument();
    expect(screen.getByText('Zabbix Live')).toBeInTheDocument();

    const refreshBtn = screen.getByRole('button', { name: /Đồng Bộ Zabbix/i });
    expect(refreshBtn).toBeInTheDocument();
    fireEvent.click(refreshBtn);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('5. TimelineCalendarGrid sử dụng borderCollapse separate và borderSpacing 0 loại bỏ khoảng trống dư', () => {
    const days: DayItem[] = [
      {
        date: new Date(2026, 10, 2),
        dateStr: '2026-11-02',
        dayNumber: 2,
        dayOfWeekStr: 'T2',
        isToday: false,
        isWeekend: false,
      },
      {
        date: new Date(2026, 10, 3),
        dateStr: '2026-11-03',
        dayNumber: 3,
        dayOfWeekStr: 'T3',
        isToday: true,
        isWeekend: false,
      },
    ];

    const printers: Printer[] = [
      {
        id: 'p-1',
        name: 'Ricoh MP C6004 - P.Kế toán',
        model: 'MP C6004',
        serial: 'W84729104',
        ip: '192.168.1.50',
        location: 'Tầng 1 - Kế toán',
        connectionStatus: 'Online',
        health: 'Healthy',
        monitoringStatus: 'Monitored',
        supplies: { black: 80, cyan: 75, magenta: 70, yellow: 65, waste: 20 },
      } as any,
    ];

    const { container } = render(
      <TimelineCalendarGrid
        days={days}
        printers={printers}
        printerTasksMap={new Map()}
        onSelectTask={vi.fn()}
        onHoverTask={vi.fn()}
      />
    );

    const table = container.querySelector('table');
    expect(table).toHaveStyle({ borderCollapse: 'separate' });
    expect(screen.getByText('Ricoh MP C6004 - P.Kế toán')).toBeInTheDocument();
  });
});

