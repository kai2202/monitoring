/**
 * Frontend/src/tests/AnalyticsModernUI.test.tsx
 *
 * Kiểm thử Unit Test toàn diện cho các thành phần UI mới của phân hệ Analytics:
 * 1. AnalyticsHeaderBanner (Style Ảnh 3)
 * 2. PrintVolumePeakLineChart (Style Ảnh 1)
 * 3. FloorContributionBarChart (Style Ảnh 2)
 * 4. FloatingComparisonDock & DeviceComparisonModal (Slide-over 70%)
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AnalyticsHeaderBanner } from '../components/analytics/AnalyticsHeaderBanner';
import { PrintVolumePeakLineChart } from '../components/analytics/PrintVolumePeakLineChart';
import { FloorContributionBarChart } from '../components/analytics/FloorContributionBarChart';
import { FloatingComparisonDock } from '../components/analytics/FloatingComparisonDock';
import { DeviceComparisonModal } from '../components/analytics/DeviceComparisonModal';
import { getMockFloorSummaries } from '../mocks/mockAnalyticsUIData';

describe('Fleet Analytics Modern SaaS UI Components', () => {
  const mockFloorSummaries = getMockFloorSummaries('30days');

  it('1. AnalyticsHeaderBanner hiển thị đầy đủ tổng sản lượng và các thẻ KPI tóm tắt', () => {
    const handleTimeframeChange = vi.fn();
    const handleSearchChange = vi.fn();
    const handleRemovePinned = vi.fn();
    const handleAddPinned = vi.fn();
    const handleOpenModal = vi.fn();

    render(
      <AnalyticsHeaderBanner
        timeframe="30days"
        onTimeframeChange={handleTimeframeChange}
        searchQuery=""
        onSearchChange={handleSearchChange}
        pinnedPrinterIds={['prt-001', 'prt-004']}
        onRemovePinnedPrinter={handleRemovePinned}
        onAddPinnedPrinter={handleAddPinned}
        onOpenComparisonModal={handleOpenModal}
        floorSummaries={mockFloorSummaries}
        totalFleetVolume={528976}
      />
    );

    // Kiểm tra hiển thị tổng sản lượng máy in
    expect(screen.getByText('528.976')).toBeDefined();
    expect(screen.getByText('+7.9%')).toBeDefined();

    // Kiểm tra các thẻ KPI tóm tắt (Style Ảnh 3)
    expect(screen.getByText('Tầng in nhiều nhất')).toBeDefined();
    expect(screen.getByText('Máy tải cao nhất')).toBeDefined();
    expect(screen.getByText('Cơ cấu Màu / B&W')).toBeDefined();
    expect(screen.getByText('Khả dụng máy in')).toBeDefined();

    // Kiểm tra nút chuyển chu kỳ
    const hourlyBtn = screen.getByText('Theo Giờ');
    fireEvent.click(hourlyBtn);
    expect(handleTimeframeChange).toHaveBeenCalledWith('hourly');
  });

  it('2. PrintVolumePeakLineChart hiển thị các tab tầng và legend pills bật/tắt', () => {
    const handleTimeframeChange = vi.fn();

    render(
      <PrintVolumePeakLineChart
        timeframe="30days"
        onTimeframeChange={handleTimeframeChange}
      />
    );

    // Kiểm tra tiêu đề biểu đồ
    expect(screen.getByText('Xu hướng Sản lượng & Đỉnh tải (Print Volume & Peak Load)')).toBeDefined();

    // Kiểm tra có các tab tầng
    expect(screen.getByText('Top 10 máy in')).toBeDefined();
    expect(screen.getByText('Tầng 1')).toBeDefined();
    expect(screen.getByText('So Sánh Giữa Các Tầng')).toBeDefined();

    // Chuyển tab sang Tầng 2
    const floor2Btn = screen.getByText('Tầng 2');
    fireEvent.click(floor2Btn);
  });

  it('3. FloorContributionBarChart hỗ trợ lọc Top N, sắp xếp và ghim so sánh', () => {
    const handleTogglePin = vi.fn();

    render(
      <FloorContributionBarChart
        timeframe="30days"
        pinnedPrinterIds={['prt-001']}
        onTogglePinPrinter={handleTogglePin}
      />
    );

    // Kiểm tra tiêu đề
    expect(
      screen.getByText(
        'Đóng góp Sản lượng theo Tầng & Thiết bị (Department & Device Contribution)'
      )
    ).toBeDefined();

    // Kiểm tra các nút Top N
    expect(screen.getByText('Top 5')).toBeDefined();
    expect(screen.getByText('Top 10')).toBeDefined();

    // Bấm nút đổi sắp xếp
    const sortBtn = screen.getByTitle('Đổi thứ tự sắp xếp');
    fireEvent.click(sortBtn);
    expect(screen.getByText('Thấp → Cao')).toBeDefined();
  });

  it('4. FloatingComparisonDock xuất hiện khi có máy được ghim và kích hoạt modal', () => {
    const handleRemovePinned = vi.fn();
    const handleClearAll = vi.fn();
    const handleOpenModal = vi.fn();

    render(
      <FloatingComparisonDock
        pinnedPrinterIds={['prt-001', 'prt-004']}
        onRemovePinnedPrinter={handleRemovePinned}
        onClearAllPinned={handleClearAll}
        onOpenComparisonModal={handleOpenModal}
      />
    );

    // Kiểm tra hiển thị số máy đang so sánh
    expect(screen.getByText('So sánh (2):')).toBeDefined();

    // Bấm nút So sánh chi tiết
    const compareBtn = screen.getByText('So sánh chi tiết');
    fireEvent.click(compareBtn);
    expect(handleOpenModal).toHaveBeenCalled();

    // Bấm nút Xóa hết
    const clearBtn = screen.getByText('Xóa hết');
    fireEvent.click(clearBtn);
    expect(handleClearAll).toHaveBeenCalled();
  });

  it('5. DeviceComparisonModal hiển thị 4 khu vực và chuyển đổi metric tabs', () => {
    const handleClose = vi.fn();
    const handleAdd = vi.fn();
    const handleRemove = vi.fn();

    render(
      <DeviceComparisonModal
        isOpen={true}
        onClose={handleClose}
        selectedPrinterIds={['prt-001', 'prt-004']}
        onAddPrinter={handleAdd}
        onRemovePrinter={handleRemove}
      />
    );

    // 1. Header
    expect(screen.getByText('Hiệu Suất & So Sánh Đối Đầu Thiết Bị')).toBeDefined();

    // 2. Performance Overview KPI Cards
    expect(screen.getByText('TỔNG SẢN LƯỢNG')).toBeDefined();
    expect(screen.getByText('TỐC ĐỘ THỰC TẾ')).toBeDefined();
    expect(screen.getByText('ĐỘ KHẢ DỤNG (UPTIME)')).toBeDefined();

    // 3. Visual Comparison & Metric Tabs
    expect(screen.getByText('Trực Quan Hóa Đối Chiếu (Visual Comparison)')).toBeDefined();
    const ppmTab = screen.getByText('Tốc độ thực tế');
    fireEvent.click(ppmTab);

    // 4. Detailed Comparison 5 nhóm
    expect(screen.getByText('1. Sản Xuất & Tải In (Production)')).toBeDefined();
    expect(screen.getByText('2. Tốc Độ Vận Hành (Speed)')).toBeDefined();
    expect(screen.getByText('3. Độ Tin Cậy & Sự Cố (Reliability)')).toBeDefined();
    expect(screen.getByText('4. Tính Khả Dụng (Availability)')).toBeDefined();
    expect(screen.getByText('5. Mức Tiêu Hao Vật Tư (Consumables)')).toBeDefined();
  });
});

