/**
 * Frontend/tests/components/AppShell.test.tsx
 *
 * Kiểm thử render AppShell, các mục điều hướng Sidebar và nút chuyển theme.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../../src/App';

describe('AppShell & Navigation', () => {
  it('phải render thương hiệu FleetMonitor và 6 mục điều hướng chính', () => {
    render(<App />);

    expect(screen.getByText('FleetMonitor')).toBeDefined();
    expect(screen.getByText('Tổng quan')).toBeDefined();
    expect(screen.getByText('Vận hành')).toBeDefined();
    expect(screen.getByText('Máy in')).toBeDefined();
    expect(screen.getByText('Vật tư')).toBeDefined();
    expect(screen.getByText('Phân tích')).toBeDefined();
    expect(screen.getByText('Cấu hình')).toBeDefined();
  });

  it('phải chuyển đổi nội dung khi chọn phân hệ Máy in', () => {
    render(<App />);

    const printersNavBtn = screen.getByText('Máy in');
    fireEvent.click(printersNavBtn);

    expect(screen.getByText('Danh mục & Chẩn đoán Máy in (Printers)')).toBeDefined();
    expect(screen.getByText('Đặc tả: TASK-004')).toBeDefined();
  });

  it('phải chuyển đổi nội dung khi chọn phân hệ Vận hành', () => {
    render(<App />);

    const operationsNavBtn = screen.getByText('Vận hành');
    fireEvent.click(operationsNavBtn);

    expect(screen.getByText('Vận hành & Xử lý Sự cố (Operations)')).toBeDefined();
    expect(screen.getByText('Đặc tả: TASK-014 & TASK-001')).toBeDefined();
  });
});

