/**
 * Frontend/src/features/printers/components/modals/FloorItemCard.tsx
 *
 * Thẻ hiển thị Tầng trong BranchFloorManagerModal.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faLocationDot, faTrashCan } from '@/shared/icons';

interface FloorItemCardProps {
  floor: string;
  count: number;
  onDelete: (floor: string) => void;
}

export const FloorItemCard: React.FC<FloorItemCardProps> = ({
  floor,
  count,
  onDelete,
}) => {
  return (
    <div className="p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">
          <FontAwesomeIcon icon={faLocationDot} />
        </div>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {floor}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
            count > 0
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}
        >
          {count} máy in
        </span>
        <button
          type="button"
          onClick={() => onDelete(floor)}
          disabled={count > 0}
          title={count > 0 ? 'Không thể xóa vì còn máy in' : 'Xóa tầng này'}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            count > 0
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60'
          }`}
        >
          <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
        </button>
      </div>
    </div>
  );
};

