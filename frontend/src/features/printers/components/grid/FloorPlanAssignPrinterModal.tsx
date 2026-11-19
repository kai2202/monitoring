/**
 * Frontend/src/features/printers/components/grid/FloorPlanAssignPrinterModal.tsx
 *
 * Modal Bố Trí & Bàn Giao Vị Trí Máy In Trên Sơ Đồ Tầng:
 * - createPortal(..., document.body) phủ mờ 100% toàn màn hình (kể cả Header & Sidebar).
 * - Điền đầy đủ văn bản: Vị trí cụ thể, Người phụ trách tài sản, Ghi chú bàn giao.
 * - Live Preview chi tiết máy in đã chọn (Model, S/N, IP, Mực CMYK, Sức khỏe).
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon, faPrint, faXmark, faCheck, faCircleDot, faCircleInfo } from '@/shared/icons';
import { Printer } from '@/types/printer';
import { locationService } from '@/services';
import { getPrinterSizeCategory, getPrinterSizeMeta } from '../../utils/deviceSize';

const MANAGING_TEAMS = ['Ban Quản trị Tổng vụ', 'Đội Kỹ thuật CNTT (IT)', 'Phòng Hành chính - Nhân sự', 'Khối Vận hành Kinh doanh', 'Phòng Kế toán Tài chính'];

export interface FloorPlanAssignPrinterModalProps {
  isOpen: boolean;
  branch?: string;
  cell: { floor: string; x: number; y: number } | null;
  defaultTeam?: string;
  isDeskCell?: boolean;
  printers: Printer[];
  onClose: () => void;
  onAssignSuccess: (
    printerId: string,
    updates: { branch?: string; floor: string; department: string; managingTeam: string; location: string; custodianName?: string; monitoringStatus?: string; handoverReason?: string }
  ) => Promise<void>;
}

export const FloorPlanAssignPrinterModal: React.FC<FloorPlanAssignPrinterModalProps> = ({
  isOpen, branch, cell, defaultTeam, isDeskCell = false, printers, onClose, onAssignSuccess,
}) => {
  const departments = useMemo(() => locationService.getDepartments(), []);
  const [selectedPrinterId, setSelectedPrinterId] = useState('');
  const [department, setDepartment] = useState(departments[0] || '');
  const [managingTeam, setManagingTeam] = useState(MANAGING_TEAMS[0]);
  const [custodian, setCustodian] = useState('');
  const [handoverReason, setHandoverReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lọc máy in chưa gán ô, đang lưu kho, hoặc đang ở Trụ sở/Tầng khác (loại trừ máy đã thanh lý)
  const assignablePrinters = printers.filter(
    (p) => p.monitoringStatus !== 'Decommissioned' && (p.gridX == null || p.gridY == null || p.monitoringStatus === 'Storage' || p.floor !== cell?.floor || (branch && p.branch && p.branch !== branch))
  );
  const selectedPrinter = printers.find((p) => p.id === selectedPrinterId);

  useEffect(() => {
    if (isOpen && cell) {
      setSelectedPrinterId('');
      setDepartment(departments[0] || '');
      setManagingTeam(defaultTeam || MANAGING_TEAMS[0]);
      setCustodian('');
      setHandoverReason('Bố trí máy in vào sơ đồ vị trí mặt sàn');
    }
  }, [isOpen, cell, departments, defaultTeam]);

  useEffect(() => {
    if (selectedPrinter) {
      if (selectedPrinter.custodianName) setCustodian(selectedPrinter.custodianName);
      if (selectedPrinter.department) setDepartment(selectedPrinter.department);
      if (!defaultTeam && selectedPrinter.managingTeam) setManagingTeam(selectedPrinter.managingTeam);
    }
  }, [selectedPrinter, defaultTeam]);

  if (!isOpen || !cell) return null;

  const isStoragePrinter = selectedPrinter?.monitoringStatus === 'Storage';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrinterId) return;
    if (isDeskCell && selectedPrinter && getPrinterSizeCategory(selectedPrinter.deviceType) === 'large') return;
    setIsSubmitting(true);
    const activeBranch = branch || selectedPrinter?.branch || '';
    const fullLocation = [activeBranch, cell.floor, department.trim()].filter(Boolean).join(' - ');
    try {
      await onAssignSuccess(selectedPrinterId, {
        branch: activeBranch || undefined,
        floor: cell.floor,
        department: department.trim(),
        managingTeam,
        location: fullLocation,
        custodianName: custodian.trim() || undefined,
        monitoringStatus: isStoragePrinter ? 'Active' : undefined,
        handoverReason: handoverReason.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOnline = selectedPrinter?.connectionStatus === 'Online';

  return createPortal(
    <div
      className="animate-fadeIn"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="animate-scaleUp"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              HỒ SƠ BỐ TRÍ &amp; BÀN GIAO THIẾT BỊ
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
              Đặt Máy In Vào {cell.floor} • Ô [{cell.x + 1}, {cell.y + 1}]
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ffffff',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '15px' }} />
          </button>
        </div>

        {/* Form Nội Dung */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isDeskCell && (
            <div style={{ padding: '9px 12px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '11.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faCircleInfo} style={{ flexShrink: 0 }} />
              <span>Ô <strong>Bàn làm việc</strong>: Chỉ hỗ trợ bố trí <strong>Máy nhỏ để bàn</strong>. Máy công nghiệp / cỡ lớn chỉ được đặt dưới mặt sàn.</span>
            </div>
          )}
          {/* 1. Chọn Thiết Bị */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Chọn máy in cần gán vị trí <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={selectedPrinterId}
              onChange={(e) => setSelectedPrinterId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">-- Chọn máy in trong danh mục --</option>
              {assignablePrinters.map((p) => {
                const sizeMeta = getPrinterSizeMeta(p.deviceType);
                const blockedOnDesk = isDeskCell && sizeMeta.category === 'large';
                return (
                  <option key={p.id} value={p.id} disabled={blockedOnDesk}>
                    {p.name} ({p.ip}) • {sizeMeta.shortLabel} {blockedOnDesk ? '[Chỉ đặt dưới sàn]' : p.monitoringStatus === 'Storage' ? '[Lưu kho]' : p.gridX != null ? `[Đang ở ${p.floor}]` : '[Chưa gán ô]'}
                  </option>
                );
              })}
            </select>
          </div>

          {isStoragePrinter && (
            <div style={{ padding: '9px 12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '11.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faCircleInfo} style={{ flexShrink: 0 }} />
              <span>Máy đang <strong>Lưu kho</strong> sẽ tự động chuyển sang trạng thái <strong>Đang giám sát (Active)</strong> khi đặt lên sơ đồ.</span>
            </div>
          )}

          {/* Live Preview Card khi chọn máy in */}
          {selectedPrinter && (
            <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faPrint} style={{ fontSize: '12px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>{selectedPrinter.name}</div>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>{selectedPrinter.model} {selectedPrinter.serial ? `• S/N: ${selectedPrinter.serial}` : ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FontAwesomeIcon icon={faCircleDot} style={{ fontSize: '8px', color: isOnline ? '#16a34a' : '#ef4444' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: isOnline ? '#16a34a' : '#ef4444' }}>{isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '10.5px', fontWeight: 700, paddingTop: '4px', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ color: '#0f172a' }}>K: {selectedPrinter.supplies?.black ?? '—'}%</span>
                {selectedPrinter.colorCapability === 'Color' && (
                  <>
                    <span style={{ color: '#0284c7' }}>C: {selectedPrinter.supplies?.cyan ?? '—'}%</span>
                    <span style={{ color: '#db2777' }}>M: {selectedPrinter.supplies?.magenta ?? '—'}%</span>
                    <span style={{ color: '#ca8a04' }}>Y: {selectedPrinter.supplies?.yellow ?? '—'}%</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                Phòng ban sử dụng <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff' }}>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                {department && !departments.includes(department) && <option value={department}>{department}</option>}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>Ban/Team quản lý</label>
              <select value={managingTeam} onChange={(e) => setManagingTeam(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff' }}>
                {MANAGING_TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>Người đại diện / Cán bộ phụ trách tài sản</label>
            <input type="text" value={custodian} onChange={(e) => setCustodian(e.target.value)} placeholder="Ví dụ: Nguyễn Văn An" style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Lý do bố trí &amp; Biên bản ghi nhận
            </label>
            <textarea
              rows={2} value={handoverReason} onChange={(e) => setHandoverReason(e.target.value)}
              placeholder="Ghi chú thêm về việc bàn giao hoặc vị trí..."
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} style={{ padding: '8px 18px', borderRadius: '9999px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              Hủy
            </button>
            <button
              type="submit" disabled={!selectedPrinterId || isSubmitting}
              style={{
                padding: '8px 20px', borderRadius: '9999px', border: 'none',
                backgroundColor: !selectedPrinterId || isSubmitting ? '#94a3b8' : '#2563eb',
                color: '#ffffff', fontSize: '12px', fontWeight: 700,
                cursor: !selectedPrinterId || isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
              }}
            >
              <FontAwesomeIcon icon={faCheck} />
              <span>{isSubmitting ? 'Đang cập nhật...' : 'Xác Nhận Bố Trí'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default FloorPlanAssignPrinterModal;
