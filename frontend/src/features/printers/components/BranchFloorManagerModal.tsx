/**
 * Frontend/src/features/printers/components/BranchFloorManagerModal.tsx
 *
 * Modal Quản Lý Danh Mục Trụ Sở & Sơ Đồ Tầng (Admin Only):
 * - Đấu nối đồng bộ trực tiếp với PostgreSQL qua `locationService.*Async()` khi ở chế độ API.
 * - Bảo vệ toàn vẹn dữ liệu: Ngăn xóa tầng/trụ sở còn thiết bị hoạt động hoặc HQ chính.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon, faBuilding, faLocationDot, faPlus, faTrashCan, faXmark } from '../../../shared/icons';
import { Printer } from '../../../types/printer';
import { locationService, BranchLocation } from '../../../services';

interface BranchFloorManagerModalProps {
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
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newFloorName, setNewFloorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      locationService.fetchBranches().then((bList) => {
        setBranches(bList);
        if (bList.length > 0 && !selectedBranchId) setSelectedBranchId(bList[0].id);
      });
    }
  }, [isOpen, selectedBranchId]);

  if (!isOpen) return null;

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const getBranchPrinterCount = (bName: string) =>
    printers.filter((p) => p.branch === bName || Boolean(p.location && p.location.includes(bName))).length;

  const getFloorPrinterCount = (bName: string, fName: string) =>
    printers.filter((p) => {
      const matchBranch = p.branch === bName || Boolean(p.location && p.location.includes(bName));
      const matchFloor = p.floor === fName || Boolean(p.location && p.location.includes(fName));
      return matchBranch && matchFloor;
    }).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) {
      setErrorMessage('Vui lòng nhập tên Trụ sở / Chi nhánh mới.');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await locationService.createBranchAsync(newBranchName, newBranchCode || 'BR', newBranchAddress);
      setBranches(locationService.getBranches());
      setSelectedBranchId(created.id);
      setNewBranchName('');
      setNewBranchCode('');
      setNewBranchAddress('');
      showToast(`Đã thêm thành công: ${created.name}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể thêm trụ sở mới.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName.trim() || !currentBranch) return;
    setIsSubmitting(true);
    try {
      const targetFloor = newFloorName.trim();
      const res = await locationService.addFloorAsync(currentBranch.id, targetFloor);
      if (res.success) {
        setBranches(locationService.getBranches());
        setNewFloorName('');
        showToast(`Đã thêm '${targetFloor}' vào ${currentBranch.name}`);
      } else {
        setErrorMessage(res.message || `Tầng '${targetFloor}' đã tồn tại.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFloor = async (floorName: string) => {
    if (!currentBranch) return;
    const activeCount = getFloorPrinterCount(currentBranch.name, floorName);
    const result = await locationService.removeFloorAsync(currentBranch.id, floorName, activeCount);
    if (!result.success) {
      setErrorMessage(result.message || 'Không thể xóa tầng này.');
      return;
    }
    setBranches(locationService.getBranches());
    showToast(`Đã xóa '${floorName}' khỏi ${currentBranch.name}`);
  };

  const handleDeleteBranch = async (b: BranchLocation) => {
    const activeCount = getBranchPrinterCount(b.name);
    const result = await locationService.removeBranchAsync(b.id, activeCount);
    if (!result.success) {
      setErrorMessage(result.message || 'Không thể xóa trụ sở này.');
      return;
    }
    const updated = locationService.getBranches();
    setBranches(updated);
    if (selectedBranchId === b.id && updated.length > 0) setSelectedBranchId(updated[0].id);
    showToast(`Đã xóa trụ sở: ${b.name}`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1250] p-5">
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] w-full max-w-[840px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faBuilding} className="text-base" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold m-0 text-[var(--text-primary)]">
                Quản Lý Danh Mục Trụ Sở &amp; Sơ Đồ Tầng (Admin)
              </h3>
              <p className="text-[11.5px] text-[var(--text-muted)] m-0 mt-0.5">
                Thêm trụ sở mới, khai báo số tầng và kiểm soát phân bổ thiết bị toàn hệ thống
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="bg-transparent border-0 cursor-pointer text-[var(--text-muted)] p-1">
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {errorMessage && (
          <div className="px-5 py-2 bg-red-500/10 text-red-500 text-xs font-semibold border-b border-red-500/20">⚠️ {errorMessage}</div>
        )}
        {toastMessage && (
          <div className="px-5 py-2 bg-emerald-600/10 text-emerald-600 text-xs font-semibold border-b border-emerald-600/20">✓ {toastMessage}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 overflow-y-auto">
          <div className="flex flex-col gap-3 md:border-r md:border-[var(--border-color)] md:pr-4">
            <div className="font-bold text-[13px] text-[var(--text-primary)]">Danh Sách Trụ Sở ({branches.length})</div>
            <div className="flex flex-col gap-1.5">
              {branches.map((b) => {
                const isSelected = currentBranch?.id === b.id;
                const pCount = getBranchPrinterCount(b.name);
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBranchId(b.id)}
                    className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between border ${
                      isSelected ? 'bg-blue-600/10 border-blue-600' : 'bg-[var(--bg-subtle)] border-[var(--border-color)]'
                    }`}
                  >
                    <div>
                      <div className={`font-semibold text-[12.5px] ${isSelected ? 'text-blue-600' : 'text-[var(--text-primary)]'}`}>
                        {b.name}
                        {b.isHq && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white ml-1.5">HQ</span>}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">{b.floors.length} tầng • {pCount} máy in</div>
                    </div>
                    {!b.isHq && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteBranch(b); }}
                        title="Xóa trụ sở"
                        className={`bg-transparent border-0 cursor-pointer p-1 ${pCount > 0 ? 'text-slate-300' : 'text-red-500'}`}
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="text-[11px]" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleAddBranch} className="mt-2 p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] flex flex-col gap-2">
              <div className="text-xs font-bold text-[var(--text-primary)]">+ Thêm Trụ sở mới</div>
              <input type="text" placeholder="Tên trụ sở / chi nhánh *" value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-[var(--border-color)] text-[11.5px] bg-[var(--bg-card)]" />
              <input type="text" placeholder="Mã ký hiệu (VD: BR-HPG)" value={newBranchCode} onChange={(e) => setNewBranchCode(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-[var(--border-color)] text-[11.5px] bg-[var(--bg-card)]" />
              <button type="submit" disabled={isSubmitting} className="px-2.5 py-1.5 rounded-md bg-blue-600 text-white border-0 text-[11.5px] font-semibold cursor-pointer flex items-center justify-center gap-1">
                <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
                <span>Thêm trụ sở</span>
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-3">
            {currentBranch ? (
              <>
                <div className="font-bold text-[13px] text-[var(--text-primary)]">
                  Sơ Đồ Tầng: <span className="text-blue-600">{currentBranch.name}</span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto">
                  {currentBranch.floors.map((fl) => {
                    const count = getFloorPrinterCount(currentBranch.name, fl);
                    return (
                      <div key={fl} className="px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faLocationDot} className="text-[11px] text-emerald-600" />
                          <span className="font-semibold text-[var(--text-primary)]">{fl}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${count > 0 ? 'bg-blue-600/10 text-blue-600' : 'bg-slate-500/10 text-[var(--text-muted)]'}`}>
                            {count} máy in
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteFloor(fl)}
                            title={count > 0 ? 'Không thể xóa vì còn máy in' : 'Xóa tầng này'}
                            className={`bg-transparent border-0 ${count > 0 ? 'cursor-not-allowed text-slate-300' : 'cursor-pointer text-red-500'}`}
                          >
                            <FontAwesomeIcon icon={faTrashCan} className="text-[11px]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleAddFloor} className="mt-auto p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] flex flex-col gap-2">
                  <div className="text-xs font-bold text-[var(--text-primary)]">+ Thêm Tầng mới vào cơ sở này</div>
                  <div className="flex gap-1.5">
                    <input type="text" placeholder="VD: Tầng 8, Tầng Hầm B1..." value={newFloorName} onChange={(e) => setNewFloorName(e.target.value)} className="flex-1 px-2 py-1.5 rounded-md border border-[var(--border-color)] text-[11.5px] bg-[var(--bg-card)]" />
                    <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 rounded-md bg-emerald-600 text-white border-0 text-[11.5px] font-semibold cursor-pointer flex items-center gap-1">
                      <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
                      <span>Thêm tầng</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-[var(--text-muted)] text-xs">Chưa có trụ sở nào. Vui lòng tạo mới bên trái.</div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[var(--border-color)] flex justify-end bg-[var(--bg-subtle)]">
          <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white border-0 text-xs font-bold cursor-pointer">
            Hoàn tất &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
