/**
 * Frontend/src/features/printers/components/grid/FloorPlanSelectionBar.tsx
 *
 * Thanh Công Cụ Nổi Mini (Quick Action Bar) Phân Tách 2 Chế Độ Bố Trí & Tẩy Xóa:
 * - Thiết kế phẳng hiện đại: Thanh nổi rounded-lg, các nút rounded-md gọn gàng (bỏ kiểu viên thuốc 9999px & emoji).
 * - Render qua createPortal(..., document.body) với position: fixed & zIndex: 999999.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FloorObstacleType } from '@/types/printer';
import { MANAGING_TEAMS, getTeamStyle } from '../../utils/teamColors';
import {
  FontAwesomeIcon,
  faTableColumns,
  faRoute,
  faTrashCan,
  faXmark,
  faPrint,
} from '@/shared/icons';

export interface FloorPlanSelectionBarProps {
  range: { minX: number; maxX: number; minY: number; maxY: number } | null;
  gridRef: React.RefObject<HTMLDivElement>;
  mode?: 'create' | 'delete';
  onApplyWall: (edges: ('top' | 'bottom' | 'left' | 'right')[], label: string) => void;
  onApplyFurniture: (type: FloorObstacleType, label: string, team?: string) => void;
  hasSelectedDesks?: boolean;
  onUpdateDeskTeam?: (team: string) => void;
  onDeleteRow?: (rowIdx: number) => void;
  onDeleteCol?: (colIdx: number) => void;
  onClearWalls: () => void;
  onClearDesks: () => void;
  onClearAll: () => void;
  onAssignPrinter?: (x: number, y: number) => void;
  canAssignPrinter?: boolean;
  onClose: () => void;
}

export const FloorPlanSelectionBar: React.FC<FloorPlanSelectionBarProps> = ({
  range,
  gridRef,
  mode = 'create',
  onApplyWall,
  onApplyFurniture,
  hasSelectedDesks = false,
  onUpdateDeskTeam,
  onDeleteRow,
  onDeleteCol,
  onClearWalls,
  onClearDesks,
  onClearAll,
  onAssignPrinter,
  canAssignPrinter = true,
  onClose,
}) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>(MANAGING_TEAMS[0]);

  const updatePosition = useCallback(() => {
    if (!range || !gridRef.current) {
      setCoords(null);
      return;
    }
    const rect = gridRef.current.getBoundingClientRect();
    const cellWidth = 38;
    const barWidth = mode === 'create' ? 540 : 430;

    const cellScreenX = rect.left + range.minX * cellWidth;
    const cellScreenY = rect.top + range.minY * cellWidth;

    let top = cellScreenY - 46;
    if (top < 10) top = cellScreenY + cellWidth + 8;

    let left = cellScreenX;
    if (left + barWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - barWidth - 16);
    }
    if (left < 16) left = 16;

    setCoords({ top, left });
  }, [range, gridRef, mode]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  if (!range || !coords || typeof document === 'undefined') return null;

  const count = (range.maxX - range.minX + 1) * (range.maxY - range.minY + 1);
  const isSingleRow = range.minY === range.maxY;
  const isSingleCol = range.minX === range.maxX;
  const isSingleCell = isSingleRow && isSingleCol;
  const isBox = !isSingleRow && !isSingleCol;

  const btnBase =
    'px-2 py-1 rounded-md text-[10.5px] font-semibold border transition-colors cursor-pointer inline-flex items-center gap-1';

  return createPortal(
    <div
      style={{ top: `${coords.top}px`, left: `${coords.left}px`, zIndex: 999999 }}
      className="fixed flex items-center gap-1.5 bg-slate-900/95 text-white px-2.5 py-1.5 rounded-lg border border-slate-700/80 shadow-xl backdrop-blur-sm whitespace-nowrap pointer-events-auto"
    >
      {/* Thông tin vùng chọn */}
      <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700">
        <span className={`text-[11px] font-bold ${mode === 'create' ? 'text-sky-400' : 'text-rose-400'}`}>
          {count} ô
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          [{range.minX + 1},{range.minY + 1}]
        </span>
      </div>

      {/* CHẾ ĐỘ 1: BỐ TRÍ & TẠO MỚI */}
      {mode === 'create' && (
        <>
          <div className="flex items-center gap-1">
            {isSingleRow && !isSingleCell && (
              <>
                <button
                  type="button"
                  onClick={() => onApplyWall(['top'], 'Tường mép trên')}
                  title="Vẽ tường mép TRÊN"
                  className={`${btnBase} bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600`}
                >
                  Tường Trên
                </button>
                <button
                  type="button"
                  onClick={() => onApplyWall(['bottom'], 'Tường mép dưới')}
                  title="Vẽ tường mép DƯỚI"
                  className={`${btnBase} bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600`}
                >
                  Tường Dưới
                </button>
              </>
            )}

            {isSingleCol && !isSingleCell && (
              <>
                <button
                  type="button"
                  onClick={() => onApplyWall(['left'], 'Tường mép trái')}
                  title="Vẽ tường mép TRÁI"
                  className={`${btnBase} bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600`}
                >
                  Tường Trái
                </button>
                <button
                  type="button"
                  onClick={() => onApplyWall(['right'], 'Tường mép phải')}
                  title="Vẽ tường mép PHẢI"
                  className={`${btnBase} bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600`}
                >
                  Tường Phải
                </button>
              </>
            )}

            {(isBox || isSingleCell) && (
              <button
                type="button"
                onClick={() => onApplyWall(['top', 'bottom', 'left', 'right'], 'Tường chu vi')}
                title="Dựng tường 4 cạnh chu vi"
                className={`${btnBase} bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600`}
              >
                + Tường Chu Vi
              </button>
            )}
          </div>

          <div className="w-px h-3.5 bg-slate-700" />

          <div className="flex items-center gap-1">
            <select
              value={selectedTeam}
              onChange={(e) => {
                const nextTeam = e.target.value;
                setSelectedTeam(nextTeam);
                if (hasSelectedDesks && onUpdateDeskTeam) {
                  onUpdateDeskTeam(nextTeam);
                }
              }}
              title="Chọn Team cho dãy bàn (tự động đổi màu các bàn đang chọn)"
              className="px-1.5 py-1 rounded-md text-[10.5px] font-semibold bg-slate-800 text-slate-100 border border-slate-600 outline-none cursor-pointer max-w-[130px]"
            >
              {MANAGING_TEAMS.map((t) => (
                <option key={t} value={t}>{getTeamStyle(t).shortName}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onApplyFurniture('desk', `Bàn ${getTeamStyle(selectedTeam).shortName}`, selectedTeam)}
              title={`Áp dụng Dãy bàn cho ${selectedTeam}`}
              className={`${btnBase} bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/40`}
            >
              <FontAwesomeIcon icon={faTableColumns} className="text-[9.5px]" />
              <span>+ Bàn</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onApplyFurniture('walkway', 'Hành lang')}
            title="Áp dụng Lối đi"
            className={`${btnBase} bg-slate-700/80 hover:bg-slate-700 text-slate-200 border-slate-600`}
          >
            <FontAwesomeIcon icon={faRoute} className="text-[9.5px]" />
            <span>+ Lối đi</span>
          </button>

          <button
            type="button"
            onClick={() => onApplyFurniture('pillar', 'Cột bê tông')}
            title="Áp dụng Cột"
            className={`${btnBase} bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600`}
          >
            + Cột
          </button>

          <button
            type="button"
            onClick={() => onApplyFurniture('door', 'Cửa mở 90°')}
            title="Áp dụng Cửa"
            className={`${btnBase} bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border-orange-500/40`}
          >
            + Cửa
          </button>

          {canAssignPrinter && isSingleCell && onAssignPrinter && (
            <button
              type="button"
              onClick={() => onAssignPrinter(range.minX, range.minY)}
              title="Bố trí máy in vào vị trí này"
              className={`${btnBase} bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-300 border-emerald-500/50`}
            >
              <FontAwesomeIcon icon={faPrint} className="text-[9.5px]" />
              <span>+ Máy in</span>
            </button>
          )}
        </>
      )}

      {/* CHẾ ĐỘ 2: TẨY XÓA */}
      {mode === 'delete' && (
        <>
          <button
            type="button"
            onClick={onClearWalls}
            title="Chỉ xóa nét tường"
            className={`${btnBase} bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40`}
          >
            Xóa Tường
          </button>

          <button
            type="button"
            onClick={onClearDesks}
            title="Chỉ xóa bàn"
            className={`${btnBase} bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border-sky-500/40`}
          >
            Xóa Bàn
          </button>

          {onDeleteRow && (
            <button
              type="button"
              onClick={() => onDeleteRow(range.minY)}
              title="Xóa cả hàng chứa ô này"
              className={`${btnBase} bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/35`}
            >
              Xóa Hàng
            </button>
          )}

          {onDeleteCol && (
            <button
              type="button"
              onClick={() => onDeleteCol(range.minX)}
              title="Xóa cả cột chứa ô này"
              className={`${btnBase} bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/35`}
            >
              Xóa Cột
            </button>
          )}

          <button
            type="button"
            onClick={onClearAll}
            title="Xóa toàn bộ vật thể và tường trong vùng"
            className={`${btnBase} bg-rose-600/30 hover:bg-rose-600/45 text-rose-200 border-rose-500/50`}
          >
            <FontAwesomeIcon icon={faTrashCan} className="text-[9.5px]" />
            <span>Xóa Hết</span>
          </button>
        </>
      )}

      {/* Nút đóng Minibox */}
      <button
        type="button"
        onClick={onClose}
        title="Đóng thanh chọn (Esc)"
        className="w-5 h-5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center bg-transparent border-none cursor-pointer ml-0.5"
      >
        <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
      </button>
    </div>,
    document.body
  );
};

export default FloorPlanSelectionBar;
