import React, { useState } from 'react';
import { FontAwesomeIcon, faXmark } from '../../../shared/icons';
import { ManagedUser } from './UserRbacManagerCard';

interface UserPasswordChangeModalProps {
  user: ManagedUser | null;
  onClose: () => void;
  onSuccess: (user: ManagedUser) => void;
}

export const UserPasswordChangeModal: React.FC<UserPasswordChangeModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState<string | null>(null);

  if (!user) return null;

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPwdMessage('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage('Mật khẩu xác nhận không khớp.');
      return;
    }
    onSuccess(user);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '420px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
            Đổi mật khẩu: {user.name}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '14px' }} />
          </button>
        </div>
        <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '12px' }}
            />
          </div>
          {pwdMessage && <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>{pwdMessage}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none', fontSize: '12px', cursor: 'pointer' }}>Hủy</button>
            <button type="submit" style={{ padding: '6px 16px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Lưu mật khẩu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

