/**
 * Frontend/src/features/settings/components/modals/UserScopeAssignModal.tsx
 *
 * Modal Gán Phạm Vi Quản Lý Chi Nhánh & Tầng (Admin Only):
 * - Áp dụng thiết kế thẻ phân quyền (Image 2) với các chip chọn linh hoạt.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon, faXmark, faBuilding, faLocationDot, faCheck } from '@/shared/icons';
import { ManagedUser } from '../UserRbacManagerCard';
import { locationService } from '@/services';

export interface UserScopeAssignModalProps {
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
        
        {/* Header - Image 2 Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <FontAwesomeIcon icon={faBuilding} className="text-base" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Phân Bổ Phạm Vi Giám Sát
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[220px]">
                Nhân sự: <strong className="text-slate-700 dark:text-slate-200">{user.name}</strong> ({user.role})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col gap-4">
          {/* Branch scope chips */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
              <FontAwesomeIcon icon={faBuilding} className="text-indigo-600 dark:text-indigo-400 text-[10px]" />
              Chi Nhánh Được Phép Truy Cập
            </label>
            <div className="flex flex-wrap gap-2">
              {availableBranches.map((b) => {
                const isSelected = selectedBranches.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBranch(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-400 dark:border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {b} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Floor scope chips */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
              <FontAwesomeIcon icon={faLocationDot} className="text-emerald-600 dark:text-emerald-400 text-[10px]" />
              Sơ Đồ Tầng Giám Sát (HQ 7 Tầng)
            </label>
            <div className="flex flex-wrap gap-2">
              {hqFloors.map((f) => {
                const isSelected = selectedFloors.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFloor(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-400 dark:border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {f} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer - Image 1 Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>Cập nhật phạm vi</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserScopeAssignModal;
