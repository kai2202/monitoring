/**
 * Frontend/src/features/printers/components/modals/BranchItemCard.tsx
 *
 * Dòng hiển thị Chi nhánh Trụ sở phẳng trong BranchFloorManagerModal.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React from 'react';
import { FontAwesomeIcon, faBuilding, faTrashCan, faChevronRight } from '@/shared/icons';
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
      className={`px-3.5 py-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors border-l-2 ${
        isSelected
          ? 'bg-blue-50/80 dark:bg-blue-950/30 border-l-blue-600'
          : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-transparent'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <FontAwesomeIcon
          icon={faBuilding}
          className={`text-xs shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-bold truncate ${
                isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {branch.name}
            </span>
            {branch.isHq && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white tracking-wider shrink-0">
                HQ
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
            <span>{branch.floors.length} tầng</span>
            <span>•</span>
            <span className={printerCount > 0 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
              {printerCount} máy in
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {!branch.isHq && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(branch);
            }}
            title={printerCount > 0 ? `Xóa trụ sở (giải phóng ${printerCount} máy in về kho)` : 'Xóa trụ sở này'}
            className="w-6 h-6 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center border-none cursor-pointer text-[10.5px] transition-colors"
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        )}
        {isSelected && <FontAwesomeIcon icon={faChevronRight} className="text-[10px] text-blue-600" />}
      </div>
    </div>
  );
};

export default BranchItemCard;
