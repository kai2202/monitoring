/**
 * Frontend/src/features/printers/components/modals/PrinterCreateModal.tsx
 *
 * Modal Khai Báo Máy In Mới Vào Hệ Thống Giám Sát (Admin Only):
 * - Chọn Chi nhánh và Tầng (T1 - T7) linh hoạt từ locationService.
 * - Hãng sản xuất ưu tiên: Canon, Ricoh và các hãng khác (HP, Epson, Brother, Xerox, Toshiba...).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon, faPrint, faXmark, faCheck } from '@/shared/icons';
import { Printer, DeviceType } from '@/types/printer';
import { printerService, locationService } from '@/services';
import { DATA_SOURCE } from '@/config/dataSource';

export interface PrinterCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrinterCreated?: (newPrinter: Printer) => void;
}

const POPULAR_MANUFACTURERS = [
  { group: 'Hãng chủ lực', items: ['Canon', 'Ricoh'] },
  { group: 'Hãng đồng hành', items: ['HP', 'Epson', 'Brother', 'Xerox', 'Toshiba', 'Olivetti'] },
];

export const PrinterCreateModal: React.FC<PrinterCreateModalProps> = ({
  isOpen,
  onClose,
  onPrinterCreated,
}) => {
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [mfr, setMfr] = useState('Canon');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [colorCapability, setColorCapability] = useState<'Color' | 'Monochrome'>('Color');
  const [deviceType, setDeviceType] = useState<DeviceType>('Color MFP');
  const [branch, setBranch] = useState('');
  const [floor, setFloor] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const branches = useMemo(() => locationService.getBranchNames(), []);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setIp('');
      setMfr('Canon');
      setModel('');
      setSerial('');
      setColorCapability('Color');
      setDeviceType('Color MFP');
      const defaultBranch = branches[0] || (DATA_SOURCE === 'mock' ? 'Trụ sở chính (HQ)' : '');
      setBranch(defaultBranch);
      const floors = defaultBranch ? locationService.getFloorsByBranch(defaultBranch) : [];
      setFloor(floors[0] || '');
      setDepartment(DATA_SOURCE === 'mock' ? 'Khối Kỹ thuật' : '');
      setErrorMsg('');
    }
  }, [isOpen, branches]);

  const availableFloors = useMemo(() => {
    return branch ? locationService.getFloorsByBranch(branch) : [];
  }, [branch]);

  const handleBranchChange = (newBranch: string) => {
    setBranch(newBranch);
    const fls = newBranch ? locationService.getFloorsByBranch(newBranch) : [];
    setFloor(fls[0] || '');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ip.trim() || !model.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Tên máy in, Địa chỉ IP và Model.');
      return;
    }
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip.trim())) {
      setErrorMsg('Địa chỉ IP không đúng định dạng IPv4 (vd: 192.168.1.100).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const created = await printerService.createPrinter({
        name: name.trim(),
        ip: ip.trim(),
        mfr,
        model: model.trim(),
        serial: serial.trim() || undefined,
        deviceType,
        colorCapability,
        branch,
        floor,
        department: department.trim() || 'Văn phòng',
      });
      if (onPrinterCreated) onPrinterCreated(created);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo máy in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: 'var(--bg-card, #ffffff)', borderRadius: '24px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '560px', overflow: 'hidden' }}>
        {/* Header (Ảnh 1 & 4) */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-subtle, #f8fafc)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px' }}>
              <FontAwesomeIcon icon={faPrint} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>Khai Báo Máy In Mới</h2>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0' }}>Thêm thiết bị vào hệ thống giám sát NOC tập trung</p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-card, #ffffff)', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '72vh', overflowY: 'auto' }}>
          {errorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12px', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          {/* Tên máy in */}
          <div style={{ borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '7px 12px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
              Tên hiển thị máy in *
            </label>
            <input type="text" placeholder="vd: Canon imageRUNNER ADVANCE C5560i" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0f172a)', padding: 0 }} />
          </div>

          {/* Hãng & Model */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '7px 12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                Hãng sản xuất *
              </label>
              <select value={mfr} onChange={(e) => setMfr(e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0f172a)', padding: 0, cursor: 'pointer' }}>
                {POPULAR_MANUFACTURERS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.items.map((it) => (
                      <option key={it} value={it}>{it}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div style={{ borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '7px 12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                Model máy *
              </label>
              <input type="text" placeholder="vd: C5560i / MP 6055" value={model} onChange={(e) => setModel(e.target.value)} required style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0f172a)', padding: 0 }} />
            </div>
          </div>

          {/* IP & Serial */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
            <div style={{ borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '7px 12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                Địa chỉ IP tĩnh (IPv4) *
              </label>
              <input type="text" placeholder="192.168.1.55" value={ip} onChange={(e) => setIp(e.target.value)} required style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', padding: 0, fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
            <div style={{ borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '7px 12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                Số Serial
              </label>
              <input type="text" placeholder="SN-123456" value={serial} onChange={(e) => setSerial(e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0f172a)', padding: 0, fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
          </div>

          {/* Trụ sở & Tầng */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '7px 12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                Trụ sở / Chi nhánh *
              </label>
              <select value={branch} onChange={(e) => handleBranchChange(e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0f172a)', padding: 0, cursor: 'pointer' }}>
                {branches.length === 0 ? (
                  <option value="">— Chưa có chi nhánh —</option>
                ) : (
                  branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))
                )}
              </select>
            </div>
            <div style={{ borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '7px 12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                Tầng đặt máy *
              </label>
              <select value={floor} onChange={(e) => setFloor(e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0f172a)', padding: 0, cursor: 'pointer' }}>
                {availableFloors.length === 0 ? (
                  <option value="">— Chưa có tầng —</option>
                ) : (
                  availableFloors.map((fl) => (
                    <option key={fl} value={fl}>{fl}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Phòng ban */}
          <div style={{ borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '7px 12px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
              Phòng ban / Vị trí chi tiết
            </label>
            <input type="text" placeholder="vd: Khối Kỹ thuật, Phòng Kế toán, Sảnh Lễ tân" value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0f172a)', padding: 0 }} />
          </div>

          {/* Khả năng in & Loại máy */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '7px 12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                Khả năng in
              </label>
              <select value={colorCapability} onChange={(e) => setColorCapability(e.target.value as any)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0f172a)', padding: 0, cursor: 'pointer' }}>
                <option value="Color">In Màu (Color)</option>
                <option value="Monochrome">Đơn sắc (Monochrome)</option>
              </select>
            </div>
            <div style={{ borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '7px 12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                Loại máy in
              </label>
              <select value={deviceType} onChange={(e) => setDeviceType(e.target.value as any)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0f172a)', padding: 0, cursor: 'pointer' }}>
                <option value="Color MFP">Đa năng Màu (Color MFP)</option>
                <option value="Mono MFP">Đa năng Đơn sắc (Mono MFP)</option>
                <option value="Mono Laser">Laser Đơn sắc (Mono Laser)</option>
                <option value="Large Format Plotter">Khổ lớn (Plotter)</option>
              </select>
            </div>
          </div>

          {/* Action Footer (Ảnh 1) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-color, #cbd5e1)', backgroundColor: 'transparent', color: 'var(--text-secondary, #475569)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
              Hủy bỏ
            </button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '9px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}>
              <FontAwesomeIcon icon={faCheck} />
              <span>{isSubmitting ? 'Đang thêm...' : 'Xác nhận thêm máy in'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrinterCreateModal;

