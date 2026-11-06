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
        if (bList.length > 0 && !selectedBranchId) {
          setSelectedBranchId(bList[0].id);
        }
      });
    }
  }, [isOpen, selectedBranchId]);

  if (!isOpen) return null;

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const getBranchPrinterCount = (bName: string) =>
    printers.filter((p) => p.branch === bName || (p.location && p.location.includes(bName))).length;

  const getFloorPrinterCount = (bName: string, fName: string) =>
    printers.filter((p) => {
      const matchBranch = p.branch === bName || (p.location && p.location.includes(bName));
      const matchFloor = p.floor === fName || (p.location && p.location.includes(fName));
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
      const created = await locationService.createBranchAsync(
        newBranchName,
        newBranchCode || 'BR',
        newBranchAddress
      );
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
    if (selectedBranchId === b.id && updated.length > 0) {
      setSelectedBranchId(updated[0].id);
    }
    showToast(`Đã xóa trụ sở: ${b.name}`);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1250, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '840px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '16px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Quản Lý Danh Mục Trụ Sở &amp; Sơ Đồ Tầng (Admin)
              </h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Thêm trụ sở mới, khai báo số tầng và kiểm soát phân bổ thiết bị toàn hệ thống
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '16px' }} />
          </button>
        </div>

        {errorMessage && (
          <div style={{ padding: '8px 20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '12px', fontWeight: 600, borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
            ⚠️ {errorMessage}
          </div>
        )}
        {toastMessage && (
          <div style={{ padding: '8px 20px', backgroundColor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', fontSize: '12px', fontWeight: 600, borderBottom: '1px solid rgba(22, 163, 74, 0.2)' }}>
            ✓ {toastMessage}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '18px 20px', overflowY: 'auto' }}>
          {/* Cột 1: Danh sách Trụ sở / Chi nhánh */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
              Danh Sách Trụ Sở ({branches.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {branches.map((b) => {
                const isSelected = currentBranch?.id === b.id;
                const pCount = getBranchPrinterCount(b.name);
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBranchId(b.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-subtle)',
                      border: isSelected ? '1px solid #2563eb' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '12.5px', color: isSelected ? '#2563eb' : 'var(--text-primary)' }}>
                        {b.name}{' '}
                        {b.isHq && (
                          <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', backgroundColor: '#2563eb', color: '#fff', marginLeft: '4px' }}>
                            HQ
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {b.floors.length} tầng • {pCount} máy in
                      </div>
                    </div>
                    {!b.isHq && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteBranch(b); }}
                        title="Xóa trụ sở"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: pCount > 0 ? '#cbd5e1' : '#ef4444', padding: '4px' }}
                      >
                        <FontAwesomeIcon icon={faTrashCan} style={{ fontSize: '11px' }} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleAddBranch} style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>+ Thêm Trụ sở mới</div>
              <input
                type="text"
                placeholder="Tên trụ sở / chi nhánh *"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '11.5px' }}
              />
              <input
                type="text"
                placeholder="Mã ký hiệu (VD: BR-HPG)"
                value={newBranchCode}
                onChange={(e) => setNewBranchCode(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '11.5px' }}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ padding: '6px 10px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: '11px' }} />
                <span>Thêm trụ sở</span>
              </button>
            </form>
          </div>

          {/* Cột 2: Sơ đồ tầng của Trụ sở đang chọn */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentBranch ? (
              <>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Sơ Đồ Tầng: <span style={{ color: '#2563eb' }}>{currentBranch.name}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto' }}>
                  {currentBranch.floors.map((fl) => {
                    const count = getFloorPrinterCount(currentBranch.name, fl);
                    return (
                      <div
                        key={fl}
                        style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: '11px', color: '#16a34a' }} />
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fl}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: count > 0 ? 'rgba(37, 99, 235, 0.1)' : 'rgba(100, 116, 139, 0.1)', color: count > 0 ? '#2563eb' : 'var(--text-muted)', fontWeight: 600 }}>
                            {count} máy in
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteFloor(fl)}
                            title={count > 0 ? 'Không thể xóa vì còn máy in' : 'Xóa tầng này'}
                            style={{ background: 'none', border: 'none', cursor: count > 0 ? 'not-allowed' : 'pointer', color: count > 0 ? '#cbd5e1' : '#ef4444' }}
                          >
                            <FontAwesomeIcon icon={faTrashCan} style={{ fontSize: '11px' }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleAddFloor} style={{ marginTop: 'auto', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>+ Thêm Tầng mới vào cơ sở này</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="VD: Tầng 8, Tầng Hầm B1..."
                      value={newFloorName}
                      onChange={(e) => setNewFloorName(e.target.value)}
                      style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '11.5px' }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#16a34a', color: '#fff', border: 'none', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FontAwesomeIcon icon={faPlus} style={{ fontSize: '11px' }} />
                      <span>Thêm tầng</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Chưa có trụ sở nào. Vui lòng tạo mới bên trái.</div>
            )}
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--bg-subtle)' }}>
          <button type="button" onClick={onClose} style={{ padding: '7px 18px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            Hoàn tất &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
