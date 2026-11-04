/**
 * Frontend/src/tests/TimeDurationPicker.test.tsx
 *
 * Unit tests cho:
 * 1. Hàm định dạng thời gian formatDurationVi ("1h 30p", "45p", "—")
 * 2. Component TimeDurationPicker (Cặp ô Giờ + Phút, nút chọn nhanh +15p, +30p, +1h, ↺ 0, auto-normalize khi blur)
 * 3. Tích hợp trong WorkOrderDetailView
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  formatDurationVi,
  TimeDurationPicker,
  WorkOrderDetailView,
} from '../components/dashboard/WorkOrderDetailView';
import { Task } from '../types/task';

describe('1. formatDurationVi utility', () => {
  it('correctly formats various duration inputs to natural Vietnamese', () => {
    expect(formatDurationVi(null)).toBe('—');
    expect(formatDurationVi(undefined)).toBe('—');
    expect(formatDurationVi(0)).toBe('0p');
    expect(formatDurationVi(0.25)).toBe('15p');
    expect(formatDurationVi(0.5)).toBe('30p');
    expect(formatDurationVi(0.75)).toBe('45p');
    expect(formatDurationVi(1)).toBe('1h');
    expect(formatDurationVi(1.5)).toBe('1h 30p');
    expect(formatDurationVi(2.25)).toBe('2h 15p');
  });
});

describe('2. TimeDurationPicker component', () => {
  it('renders dual hour and minute inputs with unit labels', () => {
    const handleH = vi.fn();
    const handleM = vi.fn();

    render(
      <TimeDurationPicker
        label="Thời gian sửa chữa"
        hours={1}
        minutes={30}
        onChangeHours={handleH}
        onChangeMinutes={handleM}
      />
    );

    expect(screen.getByText('Thời gian sửa chữa')).toBeDefined();
    expect(screen.getByText('giờ')).toBeDefined();
    expect(screen.getByText('phút')).toBeDefined();
    expect(screen.getByDisplayValue('1')).toBeDefined();
    expect(screen.getByDisplayValue('30')).toBeDefined();
  });

  it('handles quick add buttons (+15p, +30p, +1h) and resets to 0', () => {
    let h = 0;
    let m = 0;
    const handleH = vi.fn((val) => (h = val));
    const handleM = vi.fn((val) => (m = val));

    const { rerender } = render(
      <TimeDurationPicker
        hours={h}
        minutes={m}
        onChangeHours={handleH}
        onChangeMinutes={handleM}
      />
    );

    // Click +15p
    const btn15 = screen.getByText('+15p');
    fireEvent.click(btn15);
    expect(handleH).toHaveBeenCalledWith(0);
    expect(handleM).toHaveBeenCalledWith(15);

    // Click +1h
    const btn1h = screen.getByText('+1h');
    fireEvent.click(btn1h);
    expect(handleH).toHaveBeenCalledWith(1);
    expect(handleM).toHaveBeenCalledWith(0);

    // Click ↺ 0
    const btnReset = screen.getByText('↺ 0');
    fireEvent.click(btnReset);
    expect(handleH).toHaveBeenCalledWith(0);
    expect(handleM).toHaveBeenCalledWith(0);
  });

  it('auto-normalizes minutes >= 60 on blur', () => {
    let h = 0;
    let m = 90;
    const handleH = vi.fn((val) => (h = val));
    const handleM = vi.fn((val) => (m = val));

    render(
      <TimeDurationPicker
        hours={h}
        minutes={m}
        onChangeHours={handleH}
        onChangeMinutes={handleM}
      />
    );

    const minInput = screen.getByDisplayValue('90');
    fireEvent.blur(minInput);

    // 90 minutes normalized -> 1 hour and 30 minutes
    expect(handleH).toHaveBeenCalledWith(1);
    expect(handleM).toHaveBeenCalledWith(30);
  });
});

describe('3. WorkOrderDetailView integration', () => {
  const mockTask: Task = {
    id: 'WO-20261103-0001',
    title: 'Thay thế bao lụa cụm sấy (Fuser Film)',
    printerId: 'prt-001',
    printerName: 'Canon imageRUNNER ADV C5560i',
    priority: 'P1_Urgent',
    status: 'In_Progress',
    type: 'CORRECTIVE_REPAIR',
    assignee: 'Trần Kỹ Thuật',
    startDate: '2026-11-03T08:00:00Z',
    dueDate: '2026-11-03T18:00:00Z',
    createdAt: '2026-11-03T08:00:00Z',
    updatedAt: '2026-11-03T08:00:00Z',
    timeAndCost: {
      repairTimeHours: 1.5,
      waitingTimeHours: 0.5,
      downtimeHours: 2.0,
      laborCostVnd: 250000,
      partsCostVnd: 750000,
      totalCostVnd: 1000000,
    },
    workLogs: [
      {
        id: 'wl-1',
        stepId: 'step-1',
        stepNumber: 1,
        stepTitle: 'Tháo cụm sấy kiểm tra nhiệt điện trở',
        performerName: 'Trần Kỹ Thuật',
        createdAt: '08:30, 03/11/2026',
        actionsTaken: 'Đã tháo và đo kiểm điện trở, phát hiện rách bao lụa.',
        resultStatus: 'SUCCESS',
        additionalTimeHours: 0.75,
      },
    ],
    dynamicSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Tháo cụm sấy kiểm tra nhiệt điện trở',
        status: 'In_Progress',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Thay bao lụa mới & bôi mỡ nhiệt',
        status: 'Pending',
      },
    ],
  };

  it('renders read-only formatted durations on cards and work log badges', () => {
    render(<WorkOrderDetailView task={mockTask} />);

    // 1.5h -> "1h 30p"
    expect(screen.getByText('1h 30p')).toBeDefined();
    // 0.5h -> "30p"
    expect(screen.getByText('30p')).toBeDefined();
    // 2.0h -> "2h"
    expect(screen.getByText('2h')).toBeDefined();

    // Work log badge: +0.75h -> "+45p"
    expect(screen.getByText('+45p')).toBeDefined();
  });

  it('switches to dual hour-minute picker in editing mode', () => {
    render(<WorkOrderDetailView task={mockTask} />);

    // Click "Chỉnh sửa"
    const editBtn = screen.getByText('Chỉnh sửa');
    fireEvent.click(editBtn);

    // Form inputs and quick add buttons should be rendered
    const quickAddBtns = screen.getAllByText('+15p');
    expect(quickAddBtns.length).toBeGreaterThanOrEqual(2); // One for repair, one for waiting
  });

  it('filters Work Logs when clicking on a step in Progress', () => {
    render(<WorkOrderDetailView task={mockTask} />);

    // Click on step 1 in Progress
    const stepTitle = screen.getByText('Thay bao lụa mới & bôi mỡ nhiệt');
    fireEvent.click(stepTitle);

    // Active filter banner should appear
    expect(screen.getByText(/Đang lọc theo:/i)).toBeDefined();
    expect(screen.getByText(/Bước 2 — Thay bao lụa mới & bôi mỡ nhiệt/i)).toBeDefined();
  });

  it('opens Work Log form with step preselected when clicking Ghi log quick button', () => {
    render(<WorkOrderDetailView task={mockTask} />);

    // Click "Ghi log" quick button on step 2
    const ghiLogBtns = screen.getAllByText('Ghi log');
    expect(ghiLogBtns.length).toBeGreaterThan(0);
    fireEvent.click(ghiLogBtns[1]);

    // Work Log form should be visible with step 2 title
    expect(screen.getByText('Ghi Nhận Thao Tác Bước Mới')).toBeDefined();
    expect(screen.getByDisplayValue('Thay bao lụa mới & bôi mỡ nhiệt')).toBeDefined();
  });

  it('renders the Image 1 style Blue KPI Card for SOP Progress summary', () => {
    render(<WorkOrderDetailView task={mockTask} />);

    // Renders the 3 metrics according to Image 1 layout
    expect(screen.getByText('Chi phí bảo trì')).toBeDefined();
    expect(screen.getByText('Quy trình SOP')).toBeDefined();
    expect(screen.getByText('Tỷ lệ hoàn thành')).toBeDefined();
  });
});

