/**
 * Frontend/src/features/printers/components/PrinterCreateModal.tsx
 *
 * Modal Khai Báo Máy In Mới Vào Hệ Thống Giám Sát (Admin Only):
 * - Chọn Chi nhánh và Tầng (T1 - T7) linh hoạt từ locationService.
 * - Hãng sản xuất ưu tiên: Canon, Ricoh và các hãng khác (HP, Epson, Brother, Xerox, Toshiba...).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon, faPrint, faXmark, faCheck } from '../../../shared/icons';
import { Printer, DeviceType } from '../../../types/printer';
import { printerService, locationService } from '../../../services';

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
      const defaultBranch = branches[0] || 'Trụ sở chính (HQ)';
      setBranch(defaultBranch);
      const floors = locationService.getFloorsByBranch(defaultBranch);
      setFloor(floors[0] || 'Tầng 1');
      setDepartment('Khối Kỹ thuật');
      setErrorMsg('');
    }
  }, [isOpen, branches]);

  const availableFloors = useMemo(() => {
    return locationService.getFloorsByBranch(branch);
  }, [branch]);

  const handleBranchChange = (newBranch: string) => {
    setBranch(newBranch);
    const fls = locationService.getFloorsByBranch(newBranch);
    setFloor(fls[0] || 'Tầng 1');
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
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faPrint} style={{ fontSize: '16px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #0f172a)' }}>Khai Báo Máy In Mới</h2>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', margin: 0 }}>Thêm thiết bị vào hệ thống giám sát NOC tập trung</p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer', fontSize: '16px' }}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '72vh', overflowY: 'auto' }}>
          {errorMsg && (
            <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', fontSize: '12px' }}>
              {errorMsg}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Tên hiển thị máy in *</label>
            <input type="text" placeholder="vd: Canon imageRUNNER ADVANCE C5560i" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Hãng sản xuất *</label>
              <select value={mfr} onChange={(e) => setMfr(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-card, #ffffff)' }}>
                {POPULAR_MANUFACTURERS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.items.map((it) => (
                      <option key={it} value={it}>{it}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Model máy *</label>
              <input type="text" placeholder="vd: C5560i / MP 6055" value={model} onChange={(e) => setModel(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Địa chỉ IP tĩnh (IPv4) *</label>
              <input type="text" placeholder="192.168.1.55" value={ip} onChange={(e) => setIp(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Số Serial</label>
              <input type="text" placeholder="SN-123456" value={serial} onChange={(e) => setSerial(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Trụ sở / Chi nhánh *</label>
              <select value={branch} onChange={(e) => handleBranchChange(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-card, #ffffff)' }}>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Tầng đặt máy *</label>
              <select value={floor} onChange={(e) => setFloor(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-card, #ffffff)' }}>
                {availableFloors.map((fl) => (
                  <option key={fl} value={fl}>{fl}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Phòng ban / Vị trí chi tiết</label>
            <input type="text" placeholder="vd: Khối Kỹ thuật, Phòng Kế toán, Sảnh Lễ tân" value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Khả năng in</label>
              <select value={colorCapability} onChange={(e) => setColorCapability(e.target.value as any)} style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-card, #ffffff)' }}>
                <option value="Color">In Màu (Color)</option>
                <option value="Monochrome">Đơn sắc (Monochrome)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Loại máy in</label>
              <select value={deviceType} onChange={(e) => setDeviceType(e.target.value as any)} style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-card, #ffffff)' }}>
                <option value="Color MFP">Đa năng Màu (Color MFP)</option>
                <option value="Mono MFP">Đa năng Đơn sắc (Mono MFP)</option>
                <option value="Mono Laser">Laser Đơn sắc (Mono Laser)</option>
                <option value="Large Format Plotter">Khổ lớn (Plotter)</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', backgroundColor: 'transparent', color: 'var(--text-secondary, #475569)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '12.5px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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

