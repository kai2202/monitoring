// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { UserRbacManagerCard } from '../components/UserRbacManagerCard';
import { ManagedUser } from '../../../types/settings';

afterEach(() => {
  cleanup();
});

const SAMPLE_USERS: ManagedUser[] = [
  {
    id: 'u-1',
    name: 'Nguyễn Văn An',
    email: 'admin@fleetmonitor.vn',
    role: 'ADMIN',
    roleNameVi: 'Quản trị viên Hệ thống (Admin)',
    branchScope: ['Trụ sở chính (HQ)'],
    floorsScope: ['Tất cả 7 tầng'],
    status: 'ACTIVE',
  },
  {
    id: 'u-2',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@fleetmonitor.vn',
    role: 'FIELD_TECH',
    roleNameVi: 'Kỹ thuật viên NOC & Hiện trường',
    branchScope: ['Trụ sở chính (HQ)'],
    floorsScope: ['Tất cả 7 tầng'],
    status: 'INACTIVE',
  },
];

describe('UserRbacManagerCard — Simplified RBAC Layout, Split Actions & Modals', () => {
  it('renders unified split actions (Quản lý + menu) and hides removed features', () => {
    render(<UserRbacManagerCard initialUsers={SAMPLE_USERS} />);

    const manageButtons = screen.getAllByRole('button', { name: /Quản lý/i });
    expect(manageButtons).toHaveLength(2);
    expect(screen.queryByText('Đổi MK')).toBeNull();
    expect(screen.queryByText('Gán nhánh')).toBeNull();
    expect(screen.queryByText(/Ma trận phân quyền/i)).toBeNull();
    expect(screen.queryByText(/Phạm Vi Chi Nhánh/i)).toBeNull();
  });

  it('opens UserManageModal via Quản lý with 2 tabs and no Refresh Token notice card', () => {
    render(<UserRbacManagerCard initialUsers={SAMPLE_USERS} />);

    const manageButtons = screen.getAllByRole('button', { name: /Quản lý/i });
    fireEvent.click(manageButtons[0]);

    expect(screen.getByText('Hồ sơ & Vai trò')).toBeTruthy();
    expect(screen.getByText('Đổi mật khẩu')).toBeTruthy();
    expect(screen.queryByText('Phạm vi nhánh')).toBeNull();

    fireEvent.click(screen.getByText('Đổi mật khẩu'));
    expect(screen.getByText(/Mật khẩu mới \(Tối thiểu 6 ký tự\)/i)).toBeTruthy();
    expect(screen.queryByText(/Refresh Token/i)).toBeNull();
  });

  it('opens more-actions dropdown menu and jumps to Đổi mật khẩu tab', () => {
    render(<UserRbacManagerCard initialUsers={SAMPLE_USERS} />);

    const menuTrigger = screen.getByLabelText('Thao tác khác cho Lê Hoàng Nam');
    fireEvent.click(menuTrigger);

    expect(screen.queryByText(/Phân bổ chi nhánh/i)).toBeNull();
    fireEvent.click(screen.getByRole('menuitem', { name: /Đổi mật khẩu/i }));
    expect(screen.getByText(/Mật khẩu mới \(Tối thiểu 6 ký tự\)/i)).toBeTruthy();
  });

  it('filters users by status dropdown and opens UserCreateModal without branch scope', () => {
    render(<UserRbacManagerCard initialUsers={SAMPLE_USERS} />);

    const statusSelect = screen.getByLabelText('Lọc theo trạng thái tài khoản');
    fireEvent.change(statusSelect, { target: { value: 'INACTIVE' } });

    expect(screen.queryByText('Nguyễn Văn An')).toBeNull();
    expect(screen.getByText('Lê Hoàng Nam')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Tạo tài khoản/i }));
    expect(screen.getByText('Tạo Tài Khoản Người Dùng Mới')).toBeTruthy();
    expect(screen.queryByText(/Phạm vi Chi nhánh/i)).toBeNull();
  });
});
