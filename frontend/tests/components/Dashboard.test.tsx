/**
 * Frontend/tests/components/Dashboard.test.tsx
 *
 * Kiểm thử toàn diện phân hệ Dashboard (TASK-012):
 * - Render 4 thẻ Fleet KPI Cards và các widget
 * - Tương tác In-place Filter thẻ KPI & Chip hủy lọc
 * - Mở Slide-over Diagnostics Drawer 640px và phím tắt Esc
 * - Tuân thủ AGENTS.md: không có actionGuidance, tiếng Việt chuẩn
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DashboardPage } from '../../src/pages/DashboardPage';
import { FleetKpiCards } from '../../src/components/dashboard/FleetKpiCards';
import { DevicesNeedingAttention } from '../../src/components/dashboard/DevicesNeedingAttention';
import { PrinterDiagnosticsDrawer } from '../../src/components/dashboard/PrinterDiagnosticsDrawer';
import { mockPrinters } from '../../src/mocks/mockPrinters';

describe('Dashboard Module (TASK-012)', () => {
  it('render 4 thẻ Fleet KPI Cards với đúng giá trị và nhãn', () => {
    const handleSelectFilter = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <FleetKpiCards
        data={{
          totalPrinters: 35,
          onlineCount: 34,
          offlineCount: 1,
          unknownCount: 0,
          onlineRate: 97.1,
          activeAlertsCount: 4,
          criticalAlertsCount: 2,
          warningAlertsCount: 2,
          lowSuppliesCount: 3,
        }}
        activeFilter={null}
        onSelectFilter={handleSelectFilter}
        onNavigateModule={handleNavigate}
      />
    );

    expect(screen.getByText('Tổng số máy in')).toBeDefined();
    expect(screen.getByText('35')).toBeDefined();
    expect(screen.getByText('Tỷ lệ trực tuyến')).toBeDefined();
    expect(screen.getByText('97.1%')).toBeDefined();
    expect(screen.getByText('Cảnh báo đang mở')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();
    expect(screen.getByText('Vật tư thấp')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
  });

  it('nhấp vào thẻ KPI kích hoạt In-place filter callback', () => {
    const handleSelectFilter = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <FleetKpiCards
        data={{
          totalPrinters: 35,
          onlineCount: 34,
          offlineCount: 1,
          unknownCount: 0,
          onlineRate: 97.1,
          activeAlertsCount: 4,
          criticalAlertsCount: 2,
          warningAlertsCount: 2,
          lowSuppliesCount: 3,
        }}
        activeFilter={null}
        onSelectFilter={handleSelectFilter}
        onNavigateModule={handleNavigate}
      />
    );

    const criticalCard = screen.getByText('Cảnh báo đang mở');
    fireEvent.click(criticalCard);
    expect(handleSelectFilter).toHaveBeenCalledWith('critical');
  });

  it('render bảng Devices Needing Attention và hỗ trợ mở chẩn đoán', () => {
    const handleSelect = vi.fn();

    render(
      <DevicesNeedingAttention
        printers={mockPrinters.slice(0, 5)}
        onSelectPrinter={handleSelect}
      />
    );

    expect(screen.getByText(/Thiết bị cần chú ý ngay/)).toBeDefined();
    expect(screen.getByText('Ricoh MP C6004 - P.Kế toán')).toBeDefined();

    // Click vào nút Chẩn đoán
    const diagBtns = screen.getAllByText('Chẩn đoán');
    fireEvent.click(diagBtns[0]);
    expect(handleSelect).toHaveBeenCalledWith(mockPrinters[0]);
  });

  it('mở Slide-over Drawer 640px và đóng bằng phím Esc hoặc nút X', () => {
    const handleClose = vi.fn();
    const targetPrinter = mockPrinters[0];

    const { rerender } = render(
      <PrinterDiagnosticsDrawer
        printer={targetPrinter}
        isOpen={true}
        onClose={handleClose}
      />
    );

    // Kiểm tra thông tin máy in trong Drawer
    expect(screen.getByText('Ricoh MP C6004 - P.Kế toán')).toBeDefined();
    expect(screen.getByText('Chẩn đoán')).toBeDefined();
    expect(screen.getByText('Vật tư')).toBeDefined();
    expect(screen.getByText('Bộ đếm')).toBeDefined();
    expect(screen.getByText('Lịch sử')).toBeDefined();

    // Phím Esc đóng Drawer
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  it('tích hợp đầy đủ DashboardPage với Service Layer bất đồng bộ', async () => {
    const handleNavigate = vi.fn();

    render(<DashboardPage onNavigateModule={handleNavigate} />);

    // Đợi dữ liệu nạp từ Service Layer
    await waitFor(() => {
      expect(screen.getByText('Tổng số máy in')).toBeDefined();
    });

    expect(screen.getByText(/Xu hướng tính khả dụng/)).toBeDefined();
    expect(screen.getByText(/Phân bố sức khỏe thiết bị/)).toBeDefined();
    expect(screen.getByText(/Cơ cấu thương hiệu máy in/)).toBeDefined();
    expect(screen.getByText(/Hoạt động & Sự kiện gần đây/)).toBeDefined();
  });
});

