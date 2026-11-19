/**
 * Frontend/src/features/printers/components/grid/FloorPlanToolbar.tsx
 *
 * Thanh công cụ điều khiển sơ đồ tầng (Floor Plan Toolbar):
 * - Hàng 1: Chọn Trụ sở + Tabs chọn tầng + Thống kê bàn + Nút [Quản lý Trụ sở & Tầng] + [Thiết kế / Hủy bỏ / Lưu].
 * - Hàng 2 (chỉ hiện khi isDesignMode): [Bố trí | Tẩy xóa], Kích thước, [- Hàng +], [- Cột +], Hoàn tác, Khôi phục mẫu.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React from 'react';
import {
  FontAwesomeIcon, faPlus, faMinus, faPenToSquare, faBuilding,
  faClockRotateLeft, faFloppyDisk, faXmark, faRotate, faTrashCan,
} from '@/shared/icons';
import { Printer } from '@/types/printer';

export interface FloorPlanToolbarProps {
  branches?: string[];
  activeBranch?: string;
  onBranchSelect?: (branch: string) => void;
  floorList: string[];
  activeFloor: string;
  printers: Printer[];
  currentDims: { rows: number; cols: number };
  isDesignMode: boolean;
  designSubMode?: 'create' | 'delete';
  onSubModeChange?: (mode: 'create' | 'delete') => void;
  canUndo?: boolean;
  onUndo?: () => void;
  onFloorSelect: (floor: string) => void;
  onAddRow: () => void;
  onRemoveRow: () => void;
  onAddCol: () => void;
  onRemoveCol: () => void;
  onResetDefault?: () => void;
  desksCount?: number;
  onEnterDesignMode: () => void;
  onSaveDesignMode: () => void;
  onCancelDesignMode: () => void;
  onOpenBranchManager?: () => void;
}

export const FloorPlanToolbar: React.FC<FloorPlanToolbarProps> = ({
  branches = [], activeBranch, onBranchSelect,
  floorList, activeFloor, printers, currentDims, isDesignMode,
  designSubMode = 'create', onSubModeChange, canUndo = false,
  onUndo, onFloorSelect, onAddRow, onRemoveRow, onAddCol, onRemoveCol,
  onResetDefault, desksCount = 0, onEnterDesignMode, onSaveDesignMode,
  onCancelDesignMode, onOpenBranchManager,
}) => {
  const matchScope = (p: Printer, fl: string) =>
    p.monitoringStatus !== 'Storage' && p.monitoringStatus !== 'Decommissioned'
    && (p.floor || 'Tầng trệt') === fl && (!activeBranch || !p.branch || p.branch === activeBranch);
  const floorPrintersCount = printers.filter((p) => matchScope(p, activeFloor)).length;
  const availableDesks = Math.max(0, desksCount - floorPrintersCount);

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Hàng 1: Chọn Trụ sở + Tabs chọn tầng & Hành động chính cố định bên phải */}
      <div className="px-3.5 py-2.5 flex items-center justify-between flex-wrap gap-2.5">
        <div className="flex items-center flex-wrap gap-1.5 min-w-0">
          {branches.length > 0 && onBranchSelect && (
            <select
              value={activeBranch || branches[0]}
              onChange={(e) => onBranchSelect(e.target.value)}
              title="Chọn Trụ sở / Chi nhánh"
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-[11.5px] cursor-pointer outline-none shrink-0"
              style={{ borderRadius: '8px' }}
            >
              {branches.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
          {floorList.map((fl) => {
            const count = printers.filter((p) => matchScope(p, fl)).length;
            const isSelected = fl === activeFloor;
            return (
              <button
                key={fl}
                type="button"
                onClick={() => onFloorSelect(fl)}
                className={`px-2.5 py-1 rounded-lg text-[11.5px] cursor-pointer inline-flex items-center gap-1.5 shrink-0 transition-colors border ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <span>{fl}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cụm Thống kê & Nút chính luôn cố định bên phải Hàng 1 */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <span>Bàn: <strong className="text-slate-900 dark:text-slate-100">{desksCount}</strong></span>
            <span>• Đã đặt: <strong className="text-emerald-600">{floorPrintersCount}</strong></span>
            <span>• Trống: <strong className="text-blue-600">{availableDesks}</strong></span>
          </div>

          {onOpenBranchManager && (
            <button
              type="button"
              onClick={onOpenBranchManager}
              title="Quản lý Trụ sở & Tầng"
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-[11.5px] font-semibold cursor-pointer inline-flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faBuilding} className="text-[11px] text-blue-600" />
              <span>Trụ sở &amp; Tầng</span>
            </button>
          )}

          {!isDesignMode ? (
            <button
              type="button"
              onClick={onEnterDesignMode}
              title="Mở chế độ thiết kế mặt bằng"
              className="px-3 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11.5px] font-semibold cursor-pointer inline-flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="text-[11px]" />
              <span>Thiết kế</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={onCancelDesignMode}
                title="Hủy bỏ thay đổi"
                className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11.5px] font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faXmark} className="text-[11px]" />
                <span>Hủy</span>
              </button>
              <button
                type="button"
                onClick={onSaveDesignMode}
                title="Lưu sơ đồ tầng"
                className="px-3 py-1 rounded-lg border-none bg-emerald-600 hover:bg-emerald-700 text-white text-[11.5px] font-semibold cursor-pointer inline-flex items-center gap-1.5"
              >
                <FontAwesomeIcon icon={faFloppyDisk} className="text-[11px]" />
                <span>Lưu sơ đồ</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hàng 2: Thanh công cụ Thiết kế (Chỉ hiện khi isDesignMode = true) */}
      {isDesignMode && (
        <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bộ Chuyển Chế Độ: Bố trí vs Tẩy xóa */}
            <div className="inline-flex items-center bg-slate-200/70 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => onSubModeChange?.('create')}
                className={`px-2.5 py-1 rounded-md border-none text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1 transition-all ${
                  designSubMode === 'create' ? 'bg-blue-600 text-white shadow-xs' : 'bg-transparent text-slate-600'
                }`}
              >
                <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
                <span>Bố trí</span>
              </button>
              <button
                type="button"
                onClick={() => onSubModeChange?.('delete')}
                className={`px-2.5 py-1 rounded-md border-none text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1 transition-all ${
                  designSubMode === 'delete' ? 'bg-rose-600 text-white shadow-xs' : 'bg-transparent text-slate-600'
                }`}
              >
                <FontAwesomeIcon icon={faTrashCan} className="text-[9px]" />
                <span>Tẩy xóa</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-mono font-semibold px-1">
              {currentDims.rows}h × {currentDims.cols}c
            </span>

            {/* Điều Khiển Hàng */}
            <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={onRemoveRow}
                disabled={currentDims.rows <= 5}
                title="Xóa hàng cuối"
                className="px-2 py-1 border-none bg-slate-50 hover:bg-slate-100 disabled:opacity-40 cursor-pointer text-[9px] text-rose-600"
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <span className="px-2 py-1 text-[10.5px] font-semibold text-slate-700 border-x border-slate-200">Hàng</span>
              <button
                type="button"
                onClick={onAddRow}
                title="Thêm hàng mới"
                className="px-2 py-1 border-none bg-slate-50 hover:bg-slate-100 cursor-pointer text-[9px] text-emerald-600"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            {/* Điều Khiển Cột */}
            <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={onRemoveCol}
                disabled={currentDims.cols <= 5}
                title="Xóa cột cuối"
                className="px-2 py-1 border-none bg-slate-50 hover:bg-slate-100 disabled:opacity-40 cursor-pointer text-[9px] text-rose-600"
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <span className="px-2 py-1 text-[10.5px] font-semibold text-slate-700 border-x border-slate-200">Cột</span>
              <button
                type="button"
                onClick={onAddCol}
                title="Thêm cột mới"
                className="px-2 py-1 border-none bg-slate-50 hover:bg-slate-100 cursor-pointer text-[9px] text-emerald-600"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onUndo && (
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                title="Hoàn tác (Ctrl+Z)"
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faClockRotateLeft} className="text-[10px]" />
                <span>Hoàn tác</span>
              </button>
            )}

            {onResetDefault && (
              <button
                type="button"
                onClick={onResetDefault}
                title="Khôi phục sơ đồ mẫu chuẩn ban đầu"
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faRotate} className="text-[10px]" />
                <span>Khôi phục mẫu</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorPlanToolbar;
