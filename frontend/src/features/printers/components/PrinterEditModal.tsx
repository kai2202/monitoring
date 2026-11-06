/**
 * Frontend/src/features/printers/components/PrinterEditModal.tsx
 *
 * Modal Chỉnh Sửa Thông Tin Cấu Hình Máy In (Admin Only):
 * - Hiệu chỉnh Tên, IP, Model, Serial, Trạng thái quản lý (Đang giám sát/Lưu kho/Thanh lý).
 * - Cập nhật vị trí Chi nhánh, Tầng (T1 - T7), Phòng ban qua locationService.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon, faPenToSquare, faXmark, faCheck } from '../../../shared/icons';
import { Printer, DeviceType } from '../../../types/printer';
import { printerService, locationService } from '../../../services';

export interface PrinterEditModalProps {
  printer: Printer | null;
  isOpen: boolean;
  onClose: () => void;
  onPrinterUpdated?: (updated: Printer) => void;
}

const POPULAR_MANUFACTURERS = [
  { group: 'Hãng chủ lực', items: ['Canon', 'Ricoh'] },
  { group: 'Hãng đồng hành', items: ['HP', 'Epson', 'Brother', 'Xerox', 'Toshiba', 'Olivetti'] },
];

export const PrinterEditModal: React.FC<PrinterEditModalProps> = ({
  printer,
  isOpen,
  onClose,
  onPrinterUpdated,
}) => {
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [mfr, setMfr] = useState('Canon');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [monitoringStatus, setMonitoringStatus] = useState('Active');
  const [colorCapability, setColorCapability] = useState<'Color' | 'Monochrome'>('Color');
  const [deviceType, setDeviceType] = useState<DeviceType>('Color MFP');
  const [branch, setBranch] = useState('');
  const [floor, setFloor] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const branches = useMemo(() => locationService.getBranchNames(), []);

  useEffect(() => {
    if (isOpen && printer) {
      setName(printer.name);
      setIp(printer.ip);
      setMfr(printer.mfr || 'Canon');
      setModel(printer.model);
      setSerial(printer.serial || '');
      setMonitoringStatus(printer.monitoringStatus || 'Active');
      setColorCapability(printer.colorCapability || 'Color');
      setDeviceType(printer.deviceType || 'Color MFP');
      const b = printer.branch || branches[0] || 'Trụ sở chính (HQ)';
      setBranch(b);
      setFloor(printer.floor || 'Tầng 1');
      setDepartment(printer.department || '');
      setErrorMsg('');
    }
  }, [isOpen, printer, branches]);

  const availableFloors = useMemo(() => locationService.getFloorsByBranch(branch), [branch]);

  const handleBranchChange = (newBranch: string) => {
    setBranch(newBranch);
    const fls = locationService.getFloorsByBranch(newBranch);
    setFloor(fls[0] || 'Tầng 1');
  };

  if (!isOpen || !printer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ip.trim() || !model.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Tên máy in, IP và Model.');
      return;
    }
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip.trim())) {
      setErrorMsg('Địa chỉ IP không đúng định dạng IPv4.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const updated = await printerService.updatePrinter(printer.id, {
        name: name.trim(),
        ip: ip.trim(),
        mfr,
        model: model.trim(),
        serial: serial.trim() || undefined,
        monitoringStatus,
        colorCapability,
        deviceType,
        branch,
        floor,
        department: department.trim(),
      });
      if (onPrinterUpdated) onPrinterUpdated(updated);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật.');
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
              <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: '15px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #0f172a)' }}>Chỉnh Sửa Thông Tin Máy In</h2>
                <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", backgroundColor: 'var(--bg-subtle, #f1f5f9)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted, #64748b)' }}>{printer.id}</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', margin: 0 }}>Cập nhật thông số mạng, trạng thái giám sát và vị trí</p>
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
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }} />
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
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Địa chỉ IP tĩnh (IPv4) *</label>
              <input type="text" value={ip} onChange={(e) => setIp(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Trạng thái quản lý</label>
              <select value={monitoringStatus} onChange={(e) => setMonitoringStatus(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-card, #ffffff)' }}>
                <option value="Active">Đang giám sát NOC (Active)</option>
                <option value="Suspended">Tạm ngưng giám sát (Suspended)</option>
                <option value="Storage">Lưu kho dự phòng (Storage)</option>
                <option value="Decommissioned">Đã thanh lý (Decommissioned)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Trụ sở / Chi nhánh</label>
              <select value={branch} onChange={(e) => handleBranchChange(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-card, #ffffff)' }}>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Tầng</label>
              <select value={floor} onChange={(e) => setFloor(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-card, #ffffff)' }}>
                {availableFloors.map((fl) => (
                  <option key={fl} value={fl}>{fl}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>Phòng ban / Vị trí chi tiết</label>
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-color, #cbd5e1)', backgroundColor: 'transparent', color: 'var(--text-secondary, #475569)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '12.5px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FontAwesomeIcon icon={faCheck} />
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrinterEditModal;

