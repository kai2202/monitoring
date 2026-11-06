import React, { useState } from 'react';
import { FontAwesomeIcon, faLocationDot, faBuilding, faCheck, faXmark, faWrench } from '../../../shared/icons';
import { Printer } from '../../../types/printer';
import { locationService } from '../../../services';

interface PrinterRelocateModalProps {
  printer: Printer | null;
  isOpen: boolean;
  onClose: () => void;
  onRelocateSuccess: (printerId: string, updatedLocation: { branch: string; floor: string; department: string; fullLocation: string; reason: string }) => void;
}

const AVAILABLE_DEPARTMENTS = [
  'Ban Giám Đốc',
  'Phòng Tài Chính Kế Toán',
  'Phòng Hành Chính Nhân Sự',
  'Phòng Marketing & Kinh Doanh',
  'Trung Tâm Vận Hành Kỹ Thuật (NOC)',
  'Phòng Dự Án & Giải Pháp',
  'Khu Vực In Ấn Chung',
  'Kho Lưu Trữ Thiết Bị',
];

export const PrinterRelocateModal: React.FC<PrinterRelocateModalProps> = ({
  printer,
  isOpen,
  onClose,
  onRelocateSuccess,
}) => {
  const availableBranches = locationService.getBranchNames();
  const [targetBranch, setTargetBranch] = useState(printer?.branch || availableBranches[0] || 'Trụ sở chính (HQ)');
  const floorList = locationService.getFloorsByBranch(targetBranch);
  const [targetFloor, setTargetFloor] = useState(printer?.floor || floorList[0] || 'Tầng 1');
  const [targetDepartment, setTargetDepartment] = useState(printer?.department || AVAILABLE_DEPARTMENTS[0]);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !printer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage('Vui lòng nhập lý do điều chuyển thiết bị.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);

    const fullLocation = `${targetBranch} - ${targetFloor} (${targetDepartment})`;
    setTimeout(() => {
      onRelocateSuccess(printer.id, {
        branch: targetBranch,
        floor: targetFloor,
        department: targetDepartment,
        fullLocation,
        reason: reason.trim(),
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '540px', padding: '22px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: '16px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Điều Chuyển Vị Trí Máy In (Admin Only)
              </h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Thiết bị: <strong style={{ color: 'var(--text-primary)' }}>{printer.name}</strong> ({printer.id})
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '15px' }} />
          </button>
        </div>

        {/* Current Location Info */}
        <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Vị trí hiện tại: </span>
          <strong style={{ color: 'var(--text-primary)' }}>{printer.location || 'Chưa thiết lập'}</strong>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Chi nhánh */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '11px', marginRight: '6px', color: '#2563eb' }} />
              Chi nhánh tiếp nhận
            </label>
            <select
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '12.5px', outline: 'none', cursor: 'pointer' }}
            >
              {availableBranches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Tầng & Phòng ban */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Tầng
              </label>
              <select
                value={targetFloor}
                onChange={(e) => setTargetFloor(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '12.5px', outline: 'none', cursor: 'pointer' }}
              >
                {floorList.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Phòng ban
              </label>
              <select
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '12.5px', outline: 'none', cursor: 'pointer' }}
              >
                {AVAILABLE_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lý do điều chuyển */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              <FontAwesomeIcon icon={faWrench} style={{ fontSize: '11px', marginRight: '6px', color: '#d97706' }} />
              Lý do điều chuyển &amp; Quyết định phân bổ
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Điều chuyển theo yêu cầu tái cơ cấu văn phòng của HR & Ban Giám Đốc..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
            />
          </div>

          {errorMessage && (
            <div style={{ fontSize: '11.5px', color: '#ef4444', fontWeight: 600 }}>{errorMessage}</div>
          )}

          {/* Footer buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none', fontSize: '12px', cursor: 'pointer' }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ padding: '7px 18px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px' }} />
              <span>{isSubmitting ? 'Đang cập nhật...' : 'Xác nhận Điều chuyển'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

