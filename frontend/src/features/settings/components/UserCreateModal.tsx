import React, { useState } from 'react';
import { FontAwesomeIcon, faUserPlus, faXmark, faCheck } from '../../../shared/icons';
import { ManagedUser } from './UserRbacManagerCard';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (user: ManagedUser) => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateUser,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'FIELD_TECH' | 'ASSET_HR'>('FIELD_TECH');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên nhân sự.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Mật khẩu khởi tạo phải có tối thiểu 6 ký tự.');
      return;
    }

    const roleNameVi =
      role === 'ADMIN'
        ? 'Quản trị viên Hệ thống (Admin)'
        : role === 'FIELD_TECH'
        ? 'Kỹ thuật viên NOC & Hiện trường'
        : 'Chuyên viên Tài sản & Kế toán HR';

    const newUser: ManagedUser = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      roleNameVi,
      branchScope: role === 'ADMIN' ? ['Trụ sở chính (HQ)', 'Chi nhánh Miền Nam'] : ['Trụ sở chính (HQ)'],
      floorsScope: ['Tất cả 7 tầng'],
      status: 'ACTIVE',
    };

    onCreateUser(newUser);
    setName('');
    setEmail('');
    setPassword('');
    setRole('FIELD_TECH');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '440px', padding: '22px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: '15px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Tạo Tài Khoản Người Dùng Mới
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Cấp quyền truy cập hệ thống FleetMonitor cho nhân sự
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '15px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              Họ và tên nhân sự *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Trần Quốc Tuấn"
              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              Email đăng nhập *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="VD: tuan.tran@fleetmonitor.vn"
              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              Mật khẩu khởi tạo *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              Vai trò tác nghiệp (Role) *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="FIELD_TECH">Kỹ thuật viên NOC &amp; Hiện trường (FIELD_TECH)</option>
              <option value="ASSET_HR">Chuyên viên Tài sản &amp; Kế toán HR (ASSET_HR)</option>
              <option value="ADMIN">Quản trị viên Hệ thống IT &amp; NOC (ADMIN)</option>
            </select>
          </div>

          {errorMessage && (
            <div style={{ fontSize: '11.5px', color: '#ef4444', fontWeight: 600 }}>{errorMessage}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none', fontSize: '12px', cursor: 'pointer' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{ padding: '6px 18px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px' }} />
              <span>Xác nhận tạo tài khoản</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

