/**
 * Frontend/src/features/printers/components/modals/BranchFloorManagerModal.tsx
 *
 * Modal Quản Lý Trụ Sở & Tầng (Master-Detail Phẳng Hiện Đại):
 * - Cột Trái: Danh mục Trụ sở (divide-y) + Quick-Add.
 * - Cột Phải: Danh sách Tầng của Trụ sở đang chọn (divide-y) + Quick-Add.
 * - Hỗ trợ đóng bằng phím Esc hoặc click backdrop; không dùng emoji.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon, faBuilding, faPlus, faXmark, faCheck, faTriangleExclamation } from '@/shared/icons';
import { Printer } from '@/types/printer';
import { locationService, BranchLocation, printerService } from '@/services';
import { getFloorObstacles, clearFloorLayout } from '../../utils/floorObstacles';
import { BranchItemCard } from './BranchItemCard';
import { FloorItemCard } from './FloorItemCard';
import { DeleteFloorBranchConfirmModal, DeleteConfirmTarget } from './DeleteFloorBranchConfirmModal';

export interface BranchFloorManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  printers: Printer[];
}

export const BranchFloorManagerModal: React.FC<BranchFloorManagerModalProps> = ({
  isOpen,
  onClose,
  printers,
}) => {
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newFloorName, setNewFloorName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<DeleteConfirmTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const bList = locationService.getBranches();
      setBranches(bList);
      if (bList.length > 0 && !selectedBranchId) setSelectedBranchId(bList[0].id);
    }
  }, [isOpen, selectedBranchId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleteConfirmTarget && !isDeleting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, deleteConfirmTarget, isDeleting, onClose]);

  if (!isOpen) return null;

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const getBranchPrinterCount = (bName: string) =>
    printers.filter((p) => p.branch === bName || (p.location && p.location.includes(bName))).length;
  const getFloorPrinterCount = (bName: string, fName: string) =>
    printers.filter(
      (p) => (p.branch === bName || (p.location && p.location.includes(bName))) && (p.floor === fName || (p.location && p.location.includes(fName)))
    ).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) {
      setErrorMessage('Vui lòng nhập tên Trụ sở / Chi nhánh mới.');
      return;
    }
    const created = locationService.addBranch(newBranchName.trim(), newBranchCode.trim() || 'BR');
    setBranches(locationService.getBranches());
    setSelectedBranchId(created.id);
    setNewBranchName('');
    setNewBranchCode('');
    showToast(`Đã thêm trụ sở: ${created.name}`);
  };

  const handleAddFloor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName.trim() || !currentBranch) return;
    const ok = locationService.addFloor(currentBranch.id, newFloorName.trim());
    if (ok) {
      setBranches(locationService.getBranches());
      setNewFloorName('');
      showToast(`Đã thêm '${newFloorName.trim()}' vào ${currentBranch.name}`);
    } else {
      setErrorMessage(`Tầng '${newFloorName.trim()}' đã tồn tại trong ${currentBranch.name}`);
    }
  };

  const handleRequestDeleteFloor = (floorName: string) => {
    if (!currentBranch) return;
    const obstacles = getFloorObstacles(floorName, currentBranch.name);
    setDeleteConfirmTarget({
      type: 'floor',
      id: currentBranch.id,
      name: floorName,
      count: getFloorPrinterCount(currentBranch.name, floorName),
      desksCount: obstacles.filter((o) => o.type === 'desk').length,
      hasWalls: obstacles.some((o) => o.type === 'wall' || (o.wallEdges && o.wallEdges.length > 0)),
    });
  };

  const handleRequestDeleteBranch = (b: BranchLocation) => {
    setDeleteConfirmTarget({ type: 'branch', id: b.id, name: b.name, count: getBranchPrinterCount(b.name) });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    setIsDeleting(true);
    try {
      if (deleteConfirmTarget.type === 'floor' && currentBranch) {
        const affected = printers.filter(
          (p) =>
            (p.branch === currentBranch.name || p.location?.includes(currentBranch.name)) &&
            (p.floor === deleteConfirmTarget.name || p.location?.includes(deleteConfirmTarget.name))
        );
        await Promise.all(
          affected.map((p) =>
            printerService.updatePrinter(p.id, {
              monitoringStatus: 'Storage',
              floor: 'Kho Lưu Trữ',
              gridX: null,
              gridY: null,
              location: `${currentBranch.name} - Kho Lưu Trữ (Giải phóng tầng)`,
            })
          )
        );
        clearFloorLayout(deleteConfirmTarget.name, currentBranch.name);
        locationService.removeFloor(currentBranch.id, deleteConfirmTarget.name);
        setBranches(locationService.getBranches());
        showToast(`Đã xóa ${deleteConfirmTarget.name} và giải phóng ${affected.length} máy in về kho.`);
      } else if (deleteConfirmTarget.type === 'branch') {
        const targetB = branches.find((b) => b.id === deleteConfirmTarget.id);
        if (targetB) {
          const affected = printers.filter((p) => p.branch === targetB.name || p.location?.includes(targetB.name));
          await Promise.all(
            affected.map((p) =>
              printerService.updatePrinter(p.id, {
                monitoringStatus: 'Storage',
                branch: 'Kho Tập Trung',
                floor: 'Kho Lưu Trữ',
                gridX: null,
                gridY: null,
                location: 'Kho Tập Trung - Kho Lưu Trữ',
              })
            )
          );
          targetB.floors.forEach((fl) => clearFloorLayout(fl, targetB.name));
          locationService.removeBranch(targetB.id);
          const next = locationService.getBranches();
          setBranches(next);
          if (selectedBranchId === targetB.id && next[0]) setSelectedBranchId(next[0].id);
          showToast(`Đã xóa trụ sở ${targetB.name} và chuyển ${affected.length} máy in về kho.`);
        }
      }
    } finally {
      setIsDeleting(false);
      setDeleteConfirmTarget(null);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[99999] p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-[920px] h-[620px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faBuilding} className="text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">Quản Lý Trụ Sở &amp; Tầng</h3>
              <p className="text-[11.5px] text-slate-500 m-0 mt-0.5">Khai báo chi nhánh và cấu hình danh sách tầng theo mặt bằng</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center bg-transparent border-none cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
          </button>
        </div>

        {/* Thông báo lỗi / Thành công */}
        {errorMessage && (
          <div className="px-5 py-2 bg-rose-50 text-rose-600 text-xs font-semibold border-b border-rose-200 flex items-center gap-2 shrink-0">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-[11px]" />
            <span>{errorMessage}</span>
          </div>
        )}
        {toastMessage && (
          <div className="px-5 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold border-b border-emerald-200 flex items-center gap-2 shrink-0">
            <FontAwesomeIcon icon={faCheck} className="text-[11px]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Master-Detail Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* CỘT TRÁI: TRỤ SỞ */}
          <div className="md:col-span-5 flex flex-col bg-slate-50/60 dark:bg-slate-900/40 p-4 gap-3 min-h-0">
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Trụ sở / Chi nhánh ({branches.length})
              </span>
              <span className="text-[10.5px] text-slate-400">Chọn để xem tầng</span>
            </div>

            <form
              onSubmit={handleAddBranch}
              className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700"
            >
              <input
                type="text"
                placeholder="Tên trụ sở mới..."
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="flex-1 min-w-0 border-none outline-none bg-transparent text-xs text-slate-900 dark:text-slate-100 px-1.5"
              />
              <input
                type="text"
                placeholder="Mã"
                value={newBranchCode}
                onChange={(e) => setNewBranchCode(e.target.value)}
                className="w-12 border-none border-l border-slate-200 outline-none bg-transparent text-[11px] text-slate-600 px-1.5 uppercase"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-md border-none bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1 shrink-0"
              >
                <FontAwesomeIcon icon={faPlus} className="text-[9.5px]" />
                <span>Thêm</span>
              </button>
            </form>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto flex-1 min-h-0">
              {branches.length === 0 ? (
                <div className="py-8 px-3 text-center text-xs text-slate-400">
                  Chưa có trụ sở nào. Nhập tên ở trên để thêm.
                </div>
              ) : (
                branches.map((b) => (
                  <BranchItemCard
                    key={b.id}
                    branch={b}
                    isSelected={currentBranch?.id === b.id}
                    printerCount={getBranchPrinterCount(b.name)}
                    onSelect={setSelectedBranchId}
                    onDelete={() => handleRequestDeleteBranch(b)}
                  />
                ))
              )}
            </div>
          </div>

          {/* CỘT PHẢI: DANH SÁCH TẦNG */}
          <div className="md:col-span-7 flex flex-col bg-white dark:bg-slate-900 p-4 gap-3 min-h-0">
            {currentBranch ? (
              <>
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} className="text-blue-600 text-xs" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Danh sách tầng: <span className="text-blue-600">{currentBranch.name}</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {currentBranch.floors.length} tầng
                  </span>
                </div>

                <form
                  onSubmit={handleAddFloor}
                  className="flex items-center gap-2 shrink-0 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <input
                    type="text"
                    placeholder="VD: Tầng 8, Tầng Hầm B1..."
                    value={newFloorName}
                    onChange={(e) => setNewFloorName(e.target.value)}
                    className="flex-1 min-w-0 border-none bg-transparent outline-none text-xs text-slate-900 dark:text-slate-100 px-2"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-md border-none bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1 shrink-0"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-[9.5px]" />
                    <span>Thêm tầng</span>
                  </button>
                </form>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto flex-1 min-h-0">
                  {currentBranch.floors.length === 0 ? (
                    <div className="py-10 px-4 text-center text-xs text-slate-400">
                      Trụ sở này chưa có tầng nào. Nhập tên tầng ở trên để thêm.
                    </div>
                  ) : (
                    currentBranch.floors.map((fl) => (
                      <FloorItemCard
                        key={fl}
                        floor={fl}
                        count={getFloorPrinterCount(currentBranch.name, fl)}
                        onDelete={() => handleRequestDeleteFloor(fl)}
                      />
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1 text-xs text-slate-400">
                Vui lòng chọn một trụ sở ở cột bên trái.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faCheck} className="text-[11px]" />
            <span>Hoàn tất &amp; Đóng</span>
          </button>
        </div>
      </div>

      <DeleteFloorBranchConfirmModal
        isOpen={Boolean(deleteConfirmTarget)}
        target={deleteConfirmTarget}
        isSubmitting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmTarget(null)}
      />
    </div>,
    document.body
  );
};

export default BranchFloorManagerModal;
