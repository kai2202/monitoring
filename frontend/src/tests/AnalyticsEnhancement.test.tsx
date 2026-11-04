/**
 * Frontend/src/tests/AnalyticsEnhancement.test.tsx
 *
 * Kiểm thử đơn vị (Unit Tests) cho các cải tiến giao diện phân hệ Analytics:
 * 1. PrintVolumePeakLineChart:
 *    - Kéo dài toàn màn hình với SVG preserveAspectRatio="none" và chiều cao 380px.
 *    - Trục hoành chế độ 30 ngày hiển thị thuần số ngày 1-30, tuyệt đối không có tiền tố "Ngày...".
 *    - Trục hoành chế độ 7 ngày hiển thị T2 -> CN.
 * 2. AnalyticsHeaderBanner:
 *    - Thay thế 4 thẻ trôi nổi bằng cấu trúc bảng phẳng Clean Table row (theo phong cách Ảnh 3).
 *    - Bộ chuyển Tab kép: "Chỉ số trọng yếu" (4 KPI: FL, PR, CL, SL) và "Top thiết bị" (Top 5 máy in sắp xếp theo sản lượng).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrintVolumePeakLineChart } from '../components/analytics/PrintVolumePeakLineChart';
import { AnalyticsHeaderBanner } from '../components/analytics/AnalyticsHeaderBanner';
import { getMockFloorSummaries } from '../mocks/mockAnalyticsUIData';

describe('PrintVolumePeakLineChart - Trục hoành và Kích thước SVG', () => {
  it('hiển thị biểu đồ SVG với preserveAspectRatio="none" và chiều cao 380px', () => {
    const handleTimeframeChange = vi.fn();
    const { container } = render(
      <PrintVolumePeakLineChart
        timeframe="30days"
        onTimeframeChange={handleTimeframeChange}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('preserveAspectRatio')).toBe('none');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 1400 360');
    expect(svg?.style.height).toBe('380px');
  });

  it('ở chế độ 30 ngày: trục hoành hiển thị thuần số ngày 1 đến 30, không có chữ "Ngày"', () => {
    const handleTimeframeChange = vi.fn();
    const { container } = render(
      <PrintVolumePeakLineChart
        timeframe="30days"
        onTimeframeChange={handleTimeframeChange}
      />
    );

    const textNodes = Array.from(container.querySelectorAll('text'));
    const dayLabels = textNodes.map((n) => n.textContent?.trim() || '');

    // Kiểm tra không có bất kỳ nhãn nào chứa chữ "Ngày"
    const hasNgayPrefix = dayLabels.some((txt) => txt.includes('Ngày'));
    expect(hasNgayPrefix).toBe(false);

    // Kiểm tra các mốc ngày 1, 15, 30 xuất hiện dưới dạng số thuần túy
    expect(dayLabels).toContain('1');
    expect(dayLabels).toContain('15');
    expect(dayLabels).toContain('30');
  });

  it('ở chế độ 7 ngày: trục hoành hiển thị thứ T2 -> CN', () => {
    const handleTimeframeChange = vi.fn();
    const { container } = render(
      <PrintVolumePeakLineChart
        timeframe="7days"
        onTimeframeChange={handleTimeframeChange}
      />
    );

    const textNodes = Array.from(container.querySelectorAll('text'));
    const dayLabels = textNodes.map((n) => n.textContent?.trim() || '');

    expect(dayLabels).toContain('T2');
    expect(dayLabels).toContain('CN');
  });
});

describe('AnalyticsHeaderBanner - Bảng Clean Table Row & Tab Switcher', () => {
  const dummyFloorSummaries = getMockFloorSummaries('30days');

  it('hiển thị bảng phẳng Hiệu Suất Vận Hành với bộ chuyển 2 tab', () => {
    render(
      <AnalyticsHeaderBanner
        timeframe="30days"
        onTimeframeChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        pinnedPrinterIds={['prt-004', 'prt-001']}
        onUnpinPrinter={vi.fn()}
        onOpenComparison={vi.fn()}
        totalFleetVolume={420000}
        floorSummaries={dummyFloorSummaries}
      />
    );

    expect(screen.getByText(/Hiệu Suất Vận Hành/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Chỉ số trọng yếu/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Top thiết bị/i })).toBeTruthy();
  });

  it('ở tab "Chỉ số trọng yếu", hiển thị đủ 4 KPI với huy hiệu viết tắt (FL, PR, CL, SL)', () => {
    render(
      <AnalyticsHeaderBanner
        timeframe="30days"
        onTimeframeChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        pinnedPrinterIds={[]}
        onUnpinPrinter={vi.fn()}
        onOpenComparison={vi.fn()}
        totalFleetVolume={420000}
        floorSummaries={dummyFloorSummaries}
      />
    );

    // Kiểm tra 4 huy hiệu viết tắt
    expect(screen.getByText('FL')).toBeTruthy();
    expect(screen.getByText('PR')).toBeTruthy();
    expect(screen.getByText('CL')).toBeTruthy();
    expect(screen.getByText('SL')).toBeTruthy();

    // Kiểm tra tên các chỉ số
    expect(screen.getByText('Tầng in nhiều nhất')).toBeTruthy();
    expect(screen.getByText('Máy tải cao nhất')).toBeTruthy();
    expect(screen.getByText('Cơ cấu Màu / B&W')).toBeTruthy();
    expect(screen.getByText('Độ sẵn sàng SLA')).toBeTruthy();
  });

  it('chuyển sang tab "Top thiết bị" hiển thị danh sách Top 5 máy in có sản lượng cao nhất', () => {
    render(
      <AnalyticsHeaderBanner
        timeframe="30days"
        onTimeframeChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        pinnedPrinterIds={[]}
        onUnpinPrinter={vi.fn()}
        onOpenComparison={vi.fn()}
        totalFleetVolume={420000}
        floorSummaries={dummyFloorSummaries}
      />
    );

    // Click nút chuyển sang tab Top thiết bị
    const topTabBtn = screen.getByRole('button', { name: /Top thiết bị/i });
    fireEvent.click(topTabBtn);

    // Kiểm tra huy hiệu Top #1
    expect(screen.getByText('Top #1')).toBeTruthy();
    // Máy in dẫn đầu trong mock data là Ricoh Pro C7200s Production
    expect(screen.getByText(/Ricoh Pro C7200s Production/i)).toBeTruthy();
  });
});

