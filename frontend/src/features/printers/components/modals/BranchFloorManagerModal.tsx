/**
 * Frontend/src/features/printers/components/modals/BranchFloorManagerModal.tsx
 *
 * Quản Lý Danh Mục Trụ Sở & Sơ Đồ Tầng (Admin):
 * - Áp dụng thiết kế thẻ Access Member Card từ Image 2 & Nested Inputs từ Image 4.
 * - Clean Slate Architecture: Hiển thị Empty State khi chưa có chi nhánh.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon, faBuilding, faPlus, faXmark, faCheck } from '@/shared/icons';
import { Printer } from '@/types/printer';
import { locationService, BranchLocation } from '@/services';
import { BranchItemCard } from './BranchItemCard';
import { FloorItemCard } from './FloorItemCard';

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

  useEffect(() => {
    if (isOpen) {
      const bList = locationService.getBranches();
      setBranches(bList);
      if (bList.length > 0 && !selectedBranchId) {
        setSelectedBranchId(bList[0].id);
      }
    }
  }, [isOpen, selectedBranchId]);

  if (!isOpen) return null;

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const getBranchPrinterCount = (bName: string) => {
    return printers.filter((p) => p.branch === bName || (p.location && p.location.includes(bName))).length;
  };

  const getFloorPrinterCount = (bName: string, fName: string) => {
    return printers.filter((p) => {
      const matchBranch = p.branch === bName || (p.location && p.location.includes(bName));
      const matchFloor = p.floor === fName || (p.location && p.location.includes(fName));
      return matchBranch && matchFloor;
    }).length;
  };

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
    const created = locationService.addBranch(newBranchName, newBranchCode || 'BR');
    setBranches(locationService.getBranches());
    setSelectedBranchId(created.id);
    setNewBranchName('');
    setNewBranchCode('');
    showToast(`Đã thêm thành công: ${created.name}`);
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

  const handleDeleteFloor = (floorName: string) => {
    if (!currentBranch) return;
    const activeCount = getFloorPrinterCount(currentBranch.name, floorName);
    const result = locationService.removeFloor(currentBranch.id, floorName, activeCount);
    if (!result.success) {
      setErrorMessage(result.message || 'Không thể xóa tầng này.');
      return;
    }
    setBranches(locationService.getBranches());
    showToast(`Đã xóa '${floorName}' khỏi ${currentBranch.name}`);
  };

  const handleDeleteBranch = (b: BranchLocation) => {
    const activeCount = getBranchPrinterCount(b.name);
    const result = locationService.removeBranch(b.id, activeCount);
    if (!result.success) {
      setErrorMessage(result.message || 'Không thể xóa trụ sở này.');
      return;
    }
    const updated = locationService.getBranches();
    setBranches(updated);
    if (selectedBranchId === b.id && updated.length > 0) {
      setSelectedBranchId(updated[0].id);
    }
    showToast(`Đã xóa trụ sở: ${b.name}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1250] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <FontAwesomeIcon icon={faBuilding} className="text-base" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Quản Lý Danh Mục Trụ Sở &amp; Sơ Đồ Tầng
              </h3>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                Khai báo các chi nhánh, tầng vận hành và quy chuẩn phân bổ thiết bị toàn quốc
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

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="px-6 py-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold border-b border-rose-200/60">
            ⚠️ {errorMessage}
          </div>
        )}
        {toastMessage && (
          <div className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border-b border-emerald-200/60">
            ✓ {toastMessage}
          </div>
        )}

        {/* Two-Column Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 p-6 gap-6 overflow-y-auto">
          {/* Column 1: Branches */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Chi Nhánh Trụ Sở ({branches.length})
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300">Chọn để xem tầng</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {branches.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                  Chưa có chi nhánh nào trong hệ thống. Vui lòng thêm trụ sở mới bên dưới.
                </div>
              ) : (
                branches.map((b) => (
                  <BranchItemCard
                    key={b.id}
                    branch={b}
                    isSelected={currentBranch?.id === b.id}
                    printerCount={getBranchPrinterCount(b.name)}
                    onSelect={setSelectedBranchId}
                    onDelete={handleDeleteBranch}
                  />
                ))
              )}
            </div>

            {/* Add Branch Box */}
            <form onSubmit={handleAddBranch} className="mt-auto p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faPlus} className="text-indigo-600 text-xs" />
                Thêm Trụ Sở Mới
              </span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Tên trụ sở / chi nhánh *"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="col-span-2 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Mã (BR-HPG)"
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 uppercase font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span>Thêm trụ sở</span>
              </button>
            </form>
          </div>

          {/* Column 2: Floors */}
          <div className="flex flex-col gap-4 md:pl-6">
            {currentBranch ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Sơ Đồ Tầng: <span className="text-indigo-600 dark:text-indigo-400">{currentBranch.name}</span>
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">{currentBranch.floors.length} tầng</span>
                </div>

                <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                  {currentBranch.floors.map((fl) => (
                    <FloorItemCard
                      key={fl}
                      floor={fl}
                      count={getFloorPrinterCount(currentBranch.name, fl)}
                      onDelete={handleDeleteFloor}
                    />
                  ))}
                </div>

                {/* Add Floor Box */}
                <form onSubmit={handleAddFloor} className="mt-auto p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faPlus} className="text-emerald-600 text-xs" />
                    Thêm Tầng Mới
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="VD: Tầng 8, Tầng Hầm B1..."
                      value={newFloorName}
                      onChange={(e) => setNewFloorName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-xs" />
                      <span>Thêm</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-xs text-slate-400 py-10 text-center">
                Chưa có chi nhánh nào được chọn. Vui lòng thêm chi nhánh ở cột bên trái.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-colors"
          >
            <FontAwesomeIcon icon={faCheck} className="text-xs" />
            <span>Hoàn tất &amp; Đóng</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default BranchFloorManagerModal;
