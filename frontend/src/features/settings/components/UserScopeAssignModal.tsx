import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon, faXmark } from '../../../shared/icons';
import { ManagedUser } from './UserRbacManagerCard';
import { locationService } from '../../../services';

interface UserScopeAssignModalProps {
  user: ManagedUser | null;
  onClose: () => void;
  onSave: (userId: string, branches: string[], floors: string[]) => void;
}

export const UserScopeAssignModal: React.FC<UserScopeAssignModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const availableBranches = locationService.getBranchNames();
  const hqFloors = locationService.getFloorsByBranch('Trụ sở chính (HQ)');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setSelectedBranches(user.branchScope);
      setSelectedFloors(user.floorsScope);
    }
  }, [user]);

  if (!user) return null;

  const toggleBranch = (b: string) => {
    setSelectedBranches((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  const toggleFloor = (f: string) => {
    setSelectedFloors((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const handleConfirm = () => {
    onSave(user.id, selectedBranches, selectedFloors);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '480px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
            Gán Chi nhánh &amp; Tầng: {user.name}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '14px' }} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Chi nhánh được phép truy cập</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {availableBranches.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBranch(b)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    backgroundColor: selectedBranches.includes(b) ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-subtle)',
                    border: selectedBranches.includes(b) ? '1px solid #2563eb' : '1px solid var(--border-color)',
                    color: selectedBranches.includes(b) ? '#2563eb' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Tầng giám sát (Trụ sở chính 7 Tầng)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {hqFloors.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFloor(f)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    backgroundColor: selectedFloors.includes(f) ? 'rgba(22, 163, 74, 0.12)' : 'var(--bg-subtle)',
                    border: selectedFloors.includes(f) ? '1px solid #16a34a' : '1px solid var(--border-color)',
                    color: selectedFloors.includes(f) ? '#16a34a' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none', fontSize: '12px', cursor: 'pointer' }}>Hủy</button>
            <button type="button" onClick={handleConfirm} style={{ padding: '6px 16px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Cập nhật phạm vi</button>
          </div>
        </div>
      </div>
    </div>
  );
};

