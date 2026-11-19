// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AnalyticsPageHeader } from '../components/banner/AnalyticsPageHeader';
import { SuppliesUrgencyTimeline } from '../components/supplies/SuppliesUrgencyTimeline';
import { DepartmentCostBreakdown } from '../components/sla/DepartmentCostBreakdown';
import { SLAKpiCards } from '../components/sla/SLAKpiCards';
import { SuppliesSegmentedPillCell } from '../components/supplies/SuppliesSegmentedPillCell';
import { OverviewKpiCards } from '../components/banner/OverviewKpiCards';
import { FloorVolumeBreakdownCard } from '../components/banner/FloorVolumeBreakdownCard';
import { getDynamicFloorSummaries } from '../utils/analyticsFloorHelper';
import { MockDataProvider } from '../../../mocks/MockDataProvider';
import { ConsumableAlertItem } from '../../../types/analyticsUI';

afterEach(() => {
  cleanup();
});

function createMockAuthStore(role: string) {
  return configureStore({
    reducer: {
      auth: () => ({
        user: { id: 'u1', fullName: 'Test User', role, roleNameVi: role, token: 'tok' },
        isAuthenticated: true,
        isBootstrapping: false,
      }),
    },
  });
}

describe('Analytics Flow — RBAC, Data Integrity & Components', () => {
  it('renders role-specific sub-tab labels for ADMIN, ASSET_HR, and hides sla-cost for FIELD_TECH', () => {
    const onSubTabChange = vi.fn();

    const { unmount: unmountAdmin } = render(
      <Provider store={createMockAuthStore('ADMIN')}>
        <AnalyticsPageHeader currentTab="overview" onSubTabChange={onSubTabChange} />
      </Provider>
    );
    expect(screen.getByText('Sản lượng in')).toBeTruthy();
    expect(screen.queryByText('Dự báo vật tư')).toBeNull();
    expect(screen.getByText('SLA & Chi phí')).toBeTruthy();
    unmountAdmin();

    const { unmount: unmountHr } = render(
      <Provider store={createMockAuthStore('ASSET_HR')}>
        <AnalyticsPageHeader currentTab="sla-cost" onSubTabChange={onSubTabChange} />
      </Provider>
    );
    expect(screen.getByText('Sản lượng in')).toBeTruthy();
    expect(screen.queryByText('Dự báo mực in')).toBeNull();
    expect(screen.getByText('Chi phí phòng ban')).toBeTruthy();
    unmountHr();

    render(
      <Provider store={createMockAuthStore('FIELD_TECH')}>
        <AnalyticsPageHeader currentTab="overview" onSubTabChange={onSubTabChange} />
      </Provider>
    );
    expect(screen.getByText('Sản lượng in')).toBeTruthy();
    expect(screen.queryByText('Dự báo vật tư')).toBeNull();
    expect(screen.queryByText('SLA & Chi phí')).toBeNull();
    expect(screen.queryByText('Chi phí phòng ban')).toBeNull();
  });

  it('SuppliesUrgencyTimeline renders only urgent alerts (<= 3 days) and triggers dispatch', () => {
    const onOpenDispatchModal = vi.fn();
    const alerts: ConsumableAlertItem[] = [
      {
        id: 'a1',
        printerId: 'p1',
        printerName: 'Ricoh C4500',
        model: 'IM C4500',
        floor: 'Tầng 2',
        department: 'Kế toán',
        itemType: 'black',
        itemName: 'Mực Đen (K)',
        currentPercent: 8,
        dailyBurnRate: 2.5,
        daysRemaining: 2,
        estimatedEmptyDate: '19/11/2026',
        status: 'critical',
      },
      {
        id: 'a2',
        printerId: 'p2',
        printerName: 'Canon C5550i',
        model: 'C5550i',
        floor: 'Tầng 1',
        department: 'Hành chính',
        itemType: 'cyan',
        itemName: 'Mực Xanh (C)',
        currentPercent: 18,
        dailyBurnRate: 1.5,
        daysRemaining: 6,
        estimatedEmptyDate: '23/11/2026',
        status: 'warning',
      },
    ];

    render(
      <SuppliesUrgencyTimeline alerts={alerts} onOpenDispatchModal={onOpenDispatchModal} />
    );

    expect(screen.getByText('Ricoh C4500')).toBeTruthy();
    expect(screen.queryByText('Canon C5550i')).toBeNull();

    fireEvent.click(screen.getByText('Cấp phát'));
    expect(onOpenDispatchModal).toHaveBeenCalledTimes(1);
    expect(onOpenDispatchModal).toHaveBeenCalledWith(alerts[0]);
  });

  it('SuppliesUrgencyTimeline renders Clean Slate message when no urgent alerts exist', () => {
    render(<SuppliesUrgencyTimeline alerts={[]} onOpenDispatchModal={vi.fn()} />);
    expect(
      screen.getByText('Không có hộp mực nào ở ngưỡng khẩn cấp (≤ 3 ngày tới) theo bộ lọc hiện tại.')
    ).toBeTruthy();
  });

  it('DepartmentCostBreakdown renders Clean Slate message on empty array and supports search + CostBreakdownDetailModal', () => {
    const { rerender } = render(<DepartmentCostBreakdown departments={[]} />);
    expect(screen.getByText('Chưa có dữ liệu phân bổ chi phí theo tầng và quản lý.')).toBeTruthy();

    rerender(
      <DepartmentCostBreakdown
        departments={[
          {
            departmentId: 'fl-1',
            departmentName: 'Tầng 1 · Hành chính',
            floorName: 'Tầng 1',
            managerName: 'Nguyễn Văn An',
            monoPages: 10000,
            colorPages: 2000,
            monoCost: 1500000,
            colorCost: 1300000,
            repairCost: 1800000,
            suppliesCost: 900000,
            otherCost: 100000,
            costItems: [
              { id: 'c1', category: 'supplies', title: 'Hộp mực đen Canon NPG-71', note: 'Xuất kho', amountVnd: 900000 },
            ],
            totalCost: 2800000,
            percentageShare: 100,
            deviceCount: 2,
            color: '#2563eb',
          },
        ]}
      />
    );
    expect(screen.getByText('Tầng 1 · Hành chính')).toBeTruthy();
    expect(screen.getByText(/Nguyễn Văn An/i)).toBeTruthy();
    expect(screen.queryByText(/Chi phí Mono/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Khoản chi/i }));
    expect(screen.getByText(/Chi Tiết Khoản Chi/i)).toBeTruthy();
    expect(screen.getAllByText('Hộp mực đen Canon NPG-71').length).toBeGreaterThanOrEqual(2);
  });

  it('SLAKpiCards displays 3 cards (no MTBF/MTTR) and em-dash (—) when data is missing', () => {
    render(<SLAKpiCards kpis={undefined} />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBe(3);
    expect(screen.queryByText(/MTBF/i)).toBeNull();
    expect(screen.queryByText(/MTTR/i)).toBeNull();
  });

  it('SuppliesSegmentedPillCell displays 0% for empty color toner and em-dash only for null/Monochrome', () => {
    const { rerender } = render(
      <SuppliesSegmentedPillCell tonerK={45} tonerC={0} tonerM={null} tonerY={20} colorCapability="Color" />
    );
    expect(screen.getByText('0%')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();

    rerender(
      <SuppliesSegmentedPillCell tonerK={45} tonerC={0} tonerM={0} tonerY={0} colorCapability="Monochrome" />
    );
    expect(screen.getAllByText('—').length).toBe(3);
  });

  it('getDynamicFloorSummaries returns empty array for empty branch/devices and aggregates shares cleanly', () => {
    expect(getDynamicFloorSummaries('UnknownBranch', [])).toEqual([]);
    const summaries = getDynamicFloorSummaries('UnknownBranch', [
      {
        id: 'p1',
        name: 'Printer 1',
        model: 'M1',
        mfr: 'Ricoh',
        ip: '10.0.0.1',
        serial: 'S1',
        branch: 'HQ',
        floorId: 'floor-1',
        floorName: 'Tầng 1',
        department: 'HR',
        status: 'Online',
        health: 'Healthy',
        totalVol: 750,
        monoVol: 750,
        colorVol: 0,
        monoPercent: 100,
        colorPercent: 0,
        isColorCapable: false,
      },
      {
        id: 'p2',
        name: 'Printer 2',
        model: 'M2',
        mfr: 'Canon',
        ip: '10.0.0.2',
        serial: 'S2',
        branch: 'HQ',
        floorId: 'floor-2',
        floorName: 'Tầng 2',
        department: 'IT',
        status: 'Online',
        health: 'Healthy',
        totalVol: 250,
        monoVol: 250,
        colorVol: 0,
        monoPercent: 100,
        colorPercent: 0,
        isColorCapable: false,
      },
    ]);
    expect(summaries.length).toBe(2);
    expect(summaries[0].sharePercentage).toBe(75);
    expect(summaries[1].sharePercentage).toBe(25);
  });

  it('OverviewKpiCards renders 3 KPI cards, omits Mono/Color card, and handles 0-device empty state cleanly', () => {
    const { rerender } = render(
      <OverviewKpiCards
        timeframe="30days"
        summary={{
          totalFleetVolume: 12000,
          monoVolume: 9000,
          colorVolume: 3000,
          avgDailyVolume: 400,
          activePrintersCount: 8,
          totalPrintersCount: 10,
          growthRatePercent: -4.2,
          lastUpdated: '2026-11-18T00:00:00Z',
        }}
        trend={{
          timeframe: '30days',
          dataPoints: [],
          currentTotalVolume: 12000,
          previousTotalVolume: 12520,
          growthPercent: -4.2,
          peakLabel: '15/11',
          peakVolume: 950,
        }}
      />
    );

    expect(screen.getByText('-4.2%')).toBeTruthy();
    expect(screen.queryByText(/Cơ cấu Đen trắng/i)).toBeNull();
    expect(screen.getByText('8 / 10')).toBeTruthy();
    expect(screen.getByText('80% Online')).toBeTruthy();

    rerender(
      <OverviewKpiCards
        timeframe="30days"
        summary={{
          totalFleetVolume: 0,
          monoVolume: 0,
          colorVolume: 0,
          avgDailyVolume: 0,
          activePrintersCount: 0,
          totalPrintersCount: 0,
          growthRatePercent: 0,
          lastUpdated: '2026-11-18T00:00:00Z',
        }}
        trend={{
          timeframe: '30days',
          dataPoints: [],
          currentTotalVolume: 0,
          previousTotalVolume: 0,
          growthPercent: 0,
          peakLabel: '14:00',
          peakVolume: 0,
        }}
      />
    );
    expect(screen.queryByText('+0.0%')).toBeNull();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
  });

  it('FloorVolumeBreakdownCard renders Mono/Color ratio and triggers floor cross-filter on click', () => {
    const onSelectFloorTab = vi.fn();
    render(
      <FloorVolumeBreakdownCard
        floorSummaries={[
          { floorId: 'floor-1', floorName: 'Tầng 1', deviceCount: 1, totalVolume: 750, sharePercentage: 100, color: '#3b82f6' },
        ]}
        devices={[
          {
            id: 'p1',
            name: 'Ricoh Tầng 1',
            model: 'IM C3000',
            mfr: 'Ricoh',
            ip: '10.0.0.1',
            serial: 'S1',
            branch: 'HQ',
            floorId: 'floor-1',
            floorName: 'Tầng 1',
            department: 'HR',
            status: 'Online',
            health: 'Healthy',
            totalVol: 750,
            monoVol: 600,
            colorVol: 150,
            monoPercent: 80,
            colorPercent: 20,
            isColorCapable: true,
          },
        ]}
        activeFloorTab="all"
        onSelectFloorTab={onSelectFloorTab}
      />
    );

    expect(screen.getByText('80%')).toBeTruthy();
    expect(screen.getByText('20%')).toBeTruthy();
    const floorBtn = screen.getByText('Tầng 1').closest('button');
    expect(floorBtn).toBeTruthy();
    fireEvent.click(floorBtn!);
    expect(onSelectFloorTab).toHaveBeenCalledWith('floor-1');
  });

  it('MockDataProvider centralizes 22 printers and keeps tasks, supplies logs, and SLA synced', () => {
    const printers = MockDataProvider.getPrinters();
    expect(printers.length).toBe(22);

    const printerIds = new Set(printers.map((p) => p.id));
    const tasks = MockDataProvider.getTasks();
    expect(tasks.length).toBe(8);
    tasks.forEach((t) => expect(printerIds.has(t.printerId)).toBe(true));

    const logs = MockDataProvider.getSuppliesReplenishmentLogs();
    expect(logs.length).toBeGreaterThanOrEqual(2);
    logs.forEach((l) => l.printers.forEach((lp) => expect(printerIds.has(lp.printerId)).toBe(true)));

    const sla = MockDataProvider.getSLACostAnalytics(printers);
    expect((sla.lemonPrinters || []).length).toBeGreaterThan(0);
    (sla.lemonPrinters || []).forEach((lp) => expect(printerIds.has(lp.printerId)).toBe(true));
  });
});
