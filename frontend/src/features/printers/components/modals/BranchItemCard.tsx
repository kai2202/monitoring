/**
 * Frontend/src/features/printers/components/modals/BranchItemCard.tsx
 *
 * Thẻ hiển thị Chi nhánh Trụ sở trong BranchFloorManagerModal.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faBuilding, faTrashCan } from '@/shared/icons';
import { BranchLocation } from '@/services';

interface BranchItemCardProps {
  branch: BranchLocation;
  isSelected: boolean;
  printerCount: number;
  onSelect: (id: string) => void;
  onDelete: (b: BranchLocation) => void;
}

export const BranchItemCard: React.FC<BranchItemCardProps> = ({
  branch,
  isSelected,
  printerCount,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onSelect(branch.id)}
      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
        isSelected
          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-sm'
          : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${
            isSelected
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <FontAwesomeIcon icon={faBuilding} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-bold ${
                isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {branch.name}
            </span>
            {branch.isHq && (
              <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-600 text-white uppercase tracking-wider">
                HQ
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-300">
            {branch.floors.length} tầng • {printerCount} máy in
          </span>
        </div>
      </div>

      {!branch.isHq && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(branch);
          }}
          disabled={printerCount > 0}
          title={printerCount > 0 ? 'Không thể xóa trụ sở còn máy in' : 'Xóa trụ sở này'}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            printerCount > 0
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60'
          }`}
        >
          <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
        </button>
      )}
    </div>
  );
};

