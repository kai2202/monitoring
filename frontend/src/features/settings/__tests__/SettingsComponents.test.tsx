/**
 * Frontend/src/features/settings/__tests__/SettingsComponents.test.tsx
 *
 * Unit tests cho phân hệ Cấu hình & Quản trị hệ thống (Settings):
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../../../app/slices/uiSlice';
import authReducer from '../../../features/auth/slices/authSlice';
import { SettingsPageHeader } from '../components/SettingsPageHeader';
import { DynamicThresholdsCard } from '../components/DynamicThresholdsCard';
import { ZabbixLivePingCard } from '../components/ZabbixLivePingCard';
import { UserRbacManagerCard } from '../components/UserRbacManagerCard';
import { ErrorDictionaryCard } from '../components/ErrorDictionaryCard';
import { MockErrorCode } from '../../../mocks/mockSettings';

const createTestStore = () =>
  configureStore({
    reducer: {
      ui: uiReducer,
      auth: authReducer,
    },
  });

describe('Settings Components Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders SettingsPageHeader with 4 sub-tabs and triggers tab change', () => {
    const handleTabChange = vi.fn();
    const handleRefresh = vi.fn();

    render(
      <SettingsPageHeader
        activeTab="gateway"
        onTabChange={handleTabChange}
        isLoading={false}
        onRefresh={handleRefresh}
      />
    );

    expect(screen.getByText('Cài Đặt Hệ Thống & Quy Tắc Vận Hành')).toBeDefined();
    expect(screen.getByText('Gateway & Kết nối')).toBeDefined();
    expect(screen.getByText('Người dùng & Phân quyền')).toBeDefined();
    expect(screen.getByText('Quy tắc & Ngưỡng')).toBeDefined();
    expect(screen.getByText('Từ điển mã lỗi')).toBeDefined();

    // Click on 'Quy tắc & Ngưỡng'
    fireEvent.click(screen.getByText('Quy tắc & Ngưỡng'));
    expect(handleTabChange).toHaveBeenCalledWith('rules');

    // Click on 'Làm mới dữ liệu'
    fireEvent.click(screen.getByText('Làm mới dữ liệu'));
    expect(handleRefresh).toHaveBeenCalled();
  });

  it('renders DynamicThresholdsCard with default values and saves to localStorage', () => {
    render(<DynamicThresholdsCard />);

    expect(screen.getByText('Ngưỡng Cảnh Báo Động & Dự Báo Tiêu Hao')).toBeDefined();
    expect(screen.getByText(/< 15%/i)).toBeDefined();
    expect(screen.getByText(/< 5%/i)).toBeDefined();
    expect(screen.getByText(/< 7 ngày/i)).toBeDefined();
    expect(screen.getByText(/215°C/i)).toBeDefined();

    // Click save
    const saveBtn = screen.getByRole('button', { name: /Lưu cấu hình/i });
    fireEvent.click(saveBtn);

    const saved = localStorage.getItem('fleetmonitor_dynamic_thresholds');
    expect(saved).toBeTruthy();
  });

  it('renders ZabbixLivePingCard with ping and sync triggers', async () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <ZabbixLivePingCard />
      </Provider>
    );

    expect(screen.getByText('Chẩn Đoán Kết Nối & Đồng Bộ Thời Gian Thực')).toBeDefined();
    expect(screen.getByText('35 máy in')).toBeDefined();

    const pingBtn = screen.getByRole('button', { name: /Kiểm tra Ping/i });
    fireEvent.click(pingBtn);

    await waitFor(() => {
      expect(screen.getByText(/Kết nối Zabbix API JSON-RPC ổn định/i)).toBeDefined();
    });

    const syncBtn = screen.getByRole('button', { name: /Đồng bộ Zabbix ngay/i });
    fireEvent.click(syncBtn);
    expect(store.getState().ui.isSyncingZabbix).toBe(true);
  });

  it('renders UserRbacManagerCard and filters users by search query and role', () => {
    render(<UserRbacManagerCard />);

    expect(screen.getByText('Quản Trị Người Dùng & Phân Quyền (RBAC)')).toBeDefined();
    expect(screen.getByText('Nguyễn Văn An')).toBeDefined();
    expect(screen.getByText('Lê Hoàng Nam')).toBeDefined();
    expect(screen.getByText('Phạm Thu Hà')).toBeDefined();

    // Search for 'Hoàng Nam'
    const searchInput = screen.getByPlaceholderText('Tìm theo tên, email...');
    fireEvent.change(searchInput, { target: { value: 'Hoàng Nam' } });

    expect(screen.getByText('Lê Hoàng Nam')).toBeDefined();
    expect(screen.queryByText('Nguyễn Văn An')).toBeNull();

    // Clear search and filter by role
    fireEvent.change(searchInput, { target: { value: '' } });
    const adminFilterBtn = screen.getByRole('button', { name: /Quản trị viên/i });
    fireEvent.click(adminFilterBtn);

    expect(screen.getByText('Nguyễn Văn An')).toBeDefined();
    expect(screen.queryByText('Lê Hoàng Nam')).toBeNull();
  });

  it('renders ErrorDictionaryCard and searches for errors', () => {
    const mockErrors: MockErrorCode[] = [
      {
        id: 'err-test-1',
        vendor: 'Ricoh',
        errorCode: 'SC541',
        errorName: 'Lỗi sấy SC541',
        affectedSubsystem: 'Fuser',
        severity: 'Critical',
        description: 'Đứt mạch cảm biến nhiệt',
      },
      {
        id: 'err-test-2',
        vendor: 'Canon',
        errorCode: 'E001',
        errorName: 'Lỗi nhiệt E001',
        affectedSubsystem: 'Fuser',
        severity: 'Warning',
        description: 'Nhiệt độ cụm sấy cao bất thường',
      },
    ];

    render(<ErrorDictionaryCard errorDict={mockErrors} isLoading={false} />);

    expect(screen.getByText('Từ Điển Mã Lỗi Phần Cứng Đa Thương Hiệu')).toBeDefined();
    expect(screen.getByText('SC541')).toBeDefined();
    expect(screen.getByText('E001')).toBeDefined();

    // Search for SC541
    const searchInput = screen.getByPlaceholderText('Tìm theo mã lỗi, tên lỗi, khối...');
    fireEvent.change(searchInput, { target: { value: 'SC541' } });

    expect(screen.getByText('SC541')).toBeDefined();
    expect(screen.queryByText('E001')).toBeNull();
  });
});

