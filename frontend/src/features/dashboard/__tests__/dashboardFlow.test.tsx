import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FleetKpiCards, FleetKpiData } from '../components/overview/FleetKpiCards';
import { ActiveOperationsCard } from '../components/overview/ActiveOperationsCard';
import { AttentionDevicesTable } from '../components/attention/AttentionDevicesTable';
import { Printer } from '@/types/printer';
import { Task } from '@/types/task';

const SAMPLE_PRINTER: Printer = {
  id: 'prn-1',
  name: 'Ricoh IM C4500',
  model: 'IM C4500',
  location: 'Tầng 2 · Kế toán',
  floor: 'Tầng 2',
  department: 'Kế toán',
  connectionStatus: 'Online',
  monitoringStatus: 'Active',
  status: 'Online',
  alertSeverity: 'critical',
  alertText: 'SC542 Lỗi cụm sấy',
  health: 'Critical',
  ip: '192.168.1.50',
  serial: 'SN-001',
  firmware: 'v4.12',
  mfr: 'Ricoh',
  deviceType: 'Color MFP',
  snmpStatus: 'OK',
  lastScrape: '2026-11-18T10:00:00Z',
  lastSuccessfulScrape: '2026-11-18T10:00:00Z',
  scannerErr: '',
  adfErr: '',
  copierErr: 'SC542',
  mfpErr: '',
  thirtyDayVolume: 12000,
  counters: { total: 120000, copier: 20000, fax: 0, scanner: 5000 },
  supplies: { black: 10, cyan: 45, magenta: 50, yellow: 60, waste: 20 },
  incidents: [],
};

const SAMPLE_TASKS: Task[] = [
  {
    id: 'TSK-01',
    title: 'Kiểm tra cụm sấy SC542',
    description: 'Kiểm tra thermistor',
    taskType: 'HARDWARE_INSPECTION',
    priority: 'P1_Urgent',
    status: 'In_Progress',
    assignee: 'Nguyễn Văn Kỹ Thuật',
    startDate: '2026-11-18',
    dueDate: '2026-11-19',
    progressPercent: 50,
    dueDateStatus: 'on_track',
    notes: '',
    activityLogs: [],
    printerId: 'prn-1',
    printerName: 'Ricoh IM C4500',
    location: 'Tầng 2',
    createdAt: '2026-11-18T08:00:00Z',
    updatedAt: '2026-11-18T08:00:00Z',
  },
  {
    id: 'TSK-02',
    title: 'Thay mực đen phòng Nhân sự',
    description: 'Xuất kho mực đen',
    taskType: 'SUPPLY_REPLENISHMENT',
    priority: 'P2_High',
    status: 'Planned',
    assignee: 'Trần Bảo Trì',
    startDate: '2026-11-18',
    dueDate: '2026-11-20',
    progressPercent: 0,
    dueDateStatus: 'on_track',
    notes: '',
    activityLogs: [],
    printerId: 'prn-2',
    printerName: 'Canon C5550i',
    location: 'Tầng 1',
    createdAt: '2026-11-18T09:00:00Z',
    updatedAt: '2026-11-18T09:00:00Z',
  },
  {
    id: 'TSK-03',
    title: 'Lệnh đã hoàn tất',
    description: 'Done',
    taskType: 'PREVENTIVE_MAINTENANCE',
    priority: 'P3_Medium',
    status: 'Completed',
    assignee: 'Lê Xong',
    startDate: '2026-11-17',
    dueDate: '2026-11-17',
    progressPercent: 100,
    dueDateStatus: 'on_track',
    notes: '',
    activityLogs: [],
    printerId: 'prn-1',
    printerName: 'Ricoh IM C4500',
    location: 'Tầng 2',
    createdAt: '2026-11-17T09:00:00Z',
    updatedAt: '2026-11-17T09:00:00Z',
  },
];

describe('Dashboard Flow — NOC KPI Strip, Open Work Orders & Attention Table', () => {
  it('FleetKpiCards renders em-dash (—) for null MetricValues and toggles filter on click', () => {
    const onSelectFilter = vi.fn();
    const emptyData: FleetKpiData = {
      totalPrinters: 0,
      onlineCount: null,
      offlineCount: null,
      unknownCount: null,
      onlineRate: null,
      activeAlertsCount: null,
      criticalAlertsCount: null,
      warningAlertsCount: null,
      lowSuppliesCount: null,
    };

    render(
      <FleetKpiCards
        data={emptyData}
        activeFilter={null}
        onSelectFilter={onSelectFilter}
        onNavigateModule={vi.fn()}
      />
    );

    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(4);
    fireEvent.click(screen.getByText('SỰ CỐ CẤP THIẾT'));
    expect(onSelectFilter).toHaveBeenCalledWith('critical');
  });

  it('ActiveOperationsCard renders only non-completed tasks, filters by status, and triggers onSelectTask', () => {
    const onSelectTask = vi.fn();
    render(
      <ActiveOperationsCard
        tasks={SAMPLE_TASKS}
        printers={[SAMPLE_PRINTER]}
        onSelectTask={onSelectTask}
        onNavigateWorkOrders={vi.fn()}
      />
    );

    expect(screen.getByText('Kiểm tra cụm sấy SC542')).toBeTruthy();
    expect(screen.getByText('Thay mực đen phòng Nhân sự')).toBeTruthy();
    expect(screen.queryByText('Lệnh đã hoàn tất')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Đang sửa' }));
    expect(screen.getByText('Kiểm tra cụm sấy SC542')).toBeTruthy();
    expect(screen.queryByText('Thay mực đen phòng Nhân sự')).toBeNull();

    fireEvent.click(screen.getByText('Kiểm tra cụm sấy SC542'));
    expect(onSelectTask).toHaveBeenCalledWith(SAMPLE_PRINTER, 'TSK-01');
  });

  it('AttentionDevicesTable filters by search query and renders Clean Slate when empty', () => {
    const { rerender } = render(
      <AttentionDevicesTable printers={[]} onSelectPrinter={vi.fn()} />
    );
    expect(screen.getByText('Hạm đội vận hành ổn định — 100% an toàn')).toBeTruthy();

    rerender(
      <AttentionDevicesTable
        printers={[SAMPLE_PRINTER]}
        onSelectPrinter={vi.fn()}
        onCreateTask={vi.fn()}
      />
    );
    expect(screen.getByText('Ricoh IM C4500')).toBeTruthy();
    const searchInput = screen.getByPlaceholderText('Tìm tên máy, IP, vị trí...');
    fireEvent.change(searchInput, { target: { value: '192.168.1.99' } });
    expect(screen.queryByText('Ricoh IM C4500')).toBeNull();
  });
});
