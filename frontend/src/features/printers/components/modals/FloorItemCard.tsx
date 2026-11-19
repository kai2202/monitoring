/**
 * Frontend/src/features/printers/components/modals/FloorItemCard.tsx
 *
 * Dòng hiển thị Tầng Kỹ Thuật phẳng trong BranchFloorManagerModal.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React from 'react';
import { FontAwesomeIcon, faLocationDot, faTrashCan, faTableColumns } from '@/shared/icons';
import { getFloorObstacles } from '../../utils/floorObstacles';

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
  const obstacles = getFloorObstacles(floor);
  const desksCount = obstacles.filter((o) => o.type === 'desk').length;
  const hasWalls = obstacles.some((o) => o.type === 'wall' || (o.wallEdges && o.wallEdges.length > 0));
  const hasBlueprint = desksCount > 0 || hasWalls;

  return (
    <div className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <FontAwesomeIcon icon={faLocationDot} className="text-emerald-600 text-xs shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{floor}</span>
            {hasBlueprint ? (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 inline-flex items-center gap-1"
                title={`Sơ đồ gồm ${desksCount} bàn làm việc`}
              >
                <FontAwesomeIcon icon={faTableColumns} className="text-[9px] text-blue-600" />
                <span>{desksCount} bàn</span>
              </span>
            ) : (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                Chưa tạo lưới
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            <span className={count > 0 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
              {count} máy in
            </span>{' '}
            đang vận hành
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(floor)}
        title={count > 0 ? `Xóa tầng này (giải phóng ${count} máy in về kho)` : 'Xóa tầng này'}
        className="w-7 h-7 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center border-none cursor-pointer text-[11px] transition-colors shrink-0"
      >
        <FontAwesomeIcon icon={faTrashCan} />
      </button>
    </div>
  );
};

export default FloorItemCard;
