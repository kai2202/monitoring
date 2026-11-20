/**
 * Frontend/src/features/printers/components/modals/PrinterEditModal.tsx
 *
 * Drawer Hồ Sơ & Điều Chuyển Thiết Bị (Dribbble Enterprise SaaS Style):
 * - Slide-over Drawer từ bên phải, nền sáng tối giản (#f8fafc).
 * - Live "Từ → Đến" Summary Strip cập nhật theo thời gian thực.
 * - Vertical Stepper Timeline nối Bước 1 (Thu hồi) → Bước 2 (Bàn giao mới).
 * - Drag & Drop Dropzone hiện đại cho biên bản thu hồi & biên bản bàn giao.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  FontAwesomeIcon,
  faPenToSquare,
  faXmark,
  faCheck,
  faUpload,
  faFileLines,
  faTriangleExclamation,
  faLocationDot,
  faBoxesStacked,
} from '@/shared/icons';
import { Printer } from '@/types/printer';
import { printerService, locationService } from '@/services';

export type OperationMode = 'relocate' | 'recall';

export interface PrinterEditModalProps {
  printer: Printer | null;
  isOpen: boolean;
  onClose: () => void;
  onPrinterUpdated?: (updated: Printer) => void;
  initialMode?: OperationMode;
  onOpenDrawer?: (printer: Printer, tab?: 'diag' | 'tasks' | 'counters' | 'history') => void;
}

const MANAGING_TEAMS = [
  'Ban Quản trị Tổng vụ',
  'Đội Kỹ thuật CNTT (IT)',
  'Phòng Hành chính - Nhân sự',
  'Khối Vận hành Kinh doanh',
  'Phòng Kế toán Tài chính',
];

interface TransferFormState {
  branch: string;
  floor: string;
  department: string;
  managingTeam: string;
  custodianName: string;
  recallReason: string;
  transferReason: string;
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  border: 'none',
  background: 'transparent',
  outline: 'none',
  fontSize: '12.5px',
  fontWeight: 600,
  color: '#0f172a',
};

const TEXTAREA_STYLE: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  borderRadius: '10px',
  border: 'none',
  backgroundColor: '#f1f5f9',
  fontSize: '12.5px',
  outline: 'none',
  resize: 'vertical',
  color: '#0f172a',
  lineHeight: 1.45,
};

const getInitials = (name?: string | null): string => {
  const clean = (name || '').trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/);
  return (parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : clean.slice(0, 2)).toUpperCase();
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ borderRadius: '10px', backgroundColor: '#f1f5f9', padding: '8px 12px' }}>
    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '2px' }}>
      {label}
    </label>
    {children}
  </div>
);

const FileDropzone: React.FC<{
  file: File | null;
  onChange: (file: File | null) => void;
  title: string;
  accentColor: string;
}> = ({ file, onChange, title, accentColor }) => {
  const [files, setFiles] = useState<File[]>(() => (file ? [file] : []));
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!file) setFiles([]);
    else setFiles((prev) => (prev.some((f) => f === file) ? prev : [file]));
  }, [file]);

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;
    setFiles((prev) => {
      const next = [...prev, ...incoming];
      onChange(next[0] || null);
      return next;
    });
  };

  const removeFileAt = (idx: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      onChange(next[0] || null);
      return next;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files || []));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {files.map((item, idx) => (
        <div
          key={`${item.name}-${item.size}-${idx}`}
          onClick={() => {
            const url = URL.createObjectURL(item);
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => URL.revokeObjectURL(url), 60000);
          }}
          title="Bấm để xem trước tệp"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '9px 12px', borderRadius: '10px', backgroundColor: `${accentColor}12`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#ffffff', color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FontAwesomeIcon icon={faFileLines} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div title={item.name} style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{formatFileSize(item.size)} • Bấm để xem</div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeFileAt(idx);
            }}
            title="Gỡ bỏ tệp đính kèm"
            style={{ width: '26px', height: '26px', borderRadius: '6px', border: 'none', backgroundColor: '#ffffff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '11px' }} />
          </button>
        </div>
      ))}

      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 14px',
          borderRadius: '10px',
          backgroundColor: isDragging ? `${accentColor}14` : '#f1f5f9',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#ffffff', color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FontAwesomeIcon icon={faUpload} style={{ fontSize: '12px' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
            {files.length > 0 ? `Tải thêm ${title.toLowerCase()}` : title}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Kéo thả hoặc bấm để chọn nhiều tệp (PDF, PNG, JPG)</div>
        </div>
        <input
          type="file"
          multiple
          accept=".pdf,image/*"
          onChange={(e) => {
            addFiles(Array.from(e.target.files || []));
            e.target.value = '';
          }}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};

export const PrinterEditModal: React.FC<PrinterEditModalProps> = ({
  printer,
  isOpen,
  onClose,
  onPrinterUpdated,
  initialMode = 'relocate',
}) => {
  const branches = useMemo(() => locationService.getBranchNames(), []);
  const [operationMode, setOperationMode] = useState<OperationMode>(initialMode);
  const [form, setForm] = useState<TransferFormState>({
    branch: '', floor: '', department: '', managingTeam: 'Ban Quản trị Tổng vụ',
    custodianName: '', recallReason: '', transferReason: '',
  });
  const [recallFile, setRecallFile] = useState<File | null>(null);
  const [handoverFile, setHandoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const setField = useCallback(<K extends keyof TransferFormState>(k: K, val: TransferFormState[K]) => {
    setForm((prev) => ({ ...prev, [k]: val }));
  }, []);

  useEffect(() => {
    if (!isOpen || !printer) return;
    const activeBranches = locationService.getBranchNames();
    const defaultBranch = printer.branch || activeBranches[0] || '';
    const branchFloors = locationService.getFloorsByBranch(defaultBranch);
    setOperationMode(initialMode);
    setForm({
      branch: defaultBranch,
      floor: printer.floor || branchFloors[0] || 'Tầng 1',
      department: printer.department || '',
      managingTeam: printer.managingTeam || 'Ban Quản trị Tổng vụ',
      custodianName: '', recallReason: '', transferReason: '',
    });
    setRecallFile(null);
    setHandoverFile(null);
    setErrorMsg('');
  }, [isOpen, printer, initialMode]);

  const availableFloors = useMemo(() => {
    const list = locationService.getFloorsByBranch(form.branch);
    return form.floor && !list.includes(form.floor) ? [form.floor, ...list] : list;
  }, [form.branch, form.floor]);

  const willClearGridPos = Boolean(
    printer?.gridX != null && (operationMode === 'recall' || form.branch !== (printer.branch || branches[0] || '') || form.floor !== (printer.floor || ''))
  );

  if (!isOpen || !printer) return null;

  const currentLocLabel = [printer.branch, printer.floor, printer.department].filter(Boolean).join(' • ') || printer.location || 'Chưa xác định';
  const nextLocLabel = [form.branch, form.floor, form.department.trim()].filter(Boolean).join(' • ') || 'Chưa xác định';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recallReason.trim()) {
      setErrorMsg('Vui lòng nhập lý do thu hồi thiết bị.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      if (operationMode === 'recall') {
        const updated = await printerService.updatePrinter(printer.id, {
          monitoringStatus: 'Storage', custodianName: null, custodianContact: null,
          gridX: null, gridY: null, handoverFile: recallFile, handoverReason: form.recallReason.trim(),
        });
        onPrinterUpdated?.(updated);
        onClose();
        return;
      }

      const composedLocation = [form.branch, form.floor, form.department.trim()].filter(Boolean).join(' - ');
      const combinedReason = [
        `[Thu hồi] ${form.recallReason.trim()}`,
        form.transferReason.trim() ? `[Điều chuyển] ${form.transferReason.trim()}` : '',
      ].filter(Boolean).join(' | ');

      const updated = await printerService.updatePrinter(printer.id, {
        monitoringStatus: 'Active', branch: form.branch, floor: form.floor,
        department: form.department.trim(), location: composedLocation,
        managingTeam: form.managingTeam, custodianName: form.custodianName.trim() || null,
        ...(willClearGridPos ? { gridX: null, gridY: null } : {}),
        handoverFile: handoverFile || recallFile, handoverReason: combinedReason,
      });
      onPrinterUpdated?.(updated);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: '700px', height: '100vh', backgroundColor: '#f8fafc', borderLeft: '1px solid #e2e8f0', boxShadow: '-24px 0 60px rgba(15, 23, 42, 0.18)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '16px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Hồ Sơ &amp; Điều Chuyển Thiết Bị</h2>
                <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", backgroundColor: '#eff6ff', padding: '2px 7px', borderRadius: '6px', color: '#2563eb', fontWeight: 700 }}>{printer.ip}</span>
              </div>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {printer.name} • {printer.model} • {printer.ip}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#ffffff', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Mode Switcher + Live "Từ → Đến" Strip */}
        <div style={{ padding: '14px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '4px', borderRadius: '11px', backgroundColor: '#f1f5f9' }}>
            <button type="button" onClick={() => { setOperationMode('relocate'); setErrorMsg(''); }} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', backgroundColor: operationMode === 'relocate' ? '#ffffff' : 'transparent', color: operationMode === 'relocate' ? '#2563eb' : '#64748b', boxShadow: operationMode === 'relocate' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none', transition: 'all 0.15s ease' }}>
              <FontAwesomeIcon icon={faLocationDot} /><span>Điều chuyển vị trí</span>
            </button>
            <button type="button" onClick={() => { setOperationMode('recall'); setErrorMsg(''); }} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', backgroundColor: operationMode === 'recall' ? '#ffffff' : 'transparent', color: operationMode === 'recall' ? '#d97706' : '#64748b', boxShadow: operationMode === 'recall' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none', transition: 'all 0.15s ease' }}>
              <FontAwesomeIcon icon={faBoxesStacked} /><span>Thu hồi</span>
            </button>
          </div>

          {/* Live "Từ → Đến" Summary Pill */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {getInitials(printer.custodianName)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{printer.custodianName || 'Chưa có người giữ'}</div>
                <div title={currentLocLabel} style={{ fontSize: '10.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentLocLabel}</div>
              </div>
            </div>

            <div style={{ padding: '3px 9px', borderRadius: '9999px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 800, color: operationMode === 'recall' ? '#d97706' : '#2563eb', whiteSpace: 'nowrap' }}>
              → {operationMode === 'recall' ? 'Lưu kho' : 'Chuyển giao'}
            </div>

            {operationMode === 'recall' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'right', minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#b45309' }}>Kho dự phòng (Storage)</div>
                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>Gỡ khỏi sơ đồ tầng</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getInitials(form.custodianName)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.custodianName.trim() || 'Người nhận mới'}</div>
                  <div title={nextLocLabel} style={{ fontSize: '10.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nextLocLabel}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMsg && (
              <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12px', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {/* Bước 1: Thu hồi */}
            <div style={{ display: 'flex', gap: '14px' }}>
              {operationMode === 'relocate' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#fef3c7', border: '2px solid #f59e0b', color: '#b45309', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
                  <div style={{ width: '2px', flex: 1, backgroundColor: '#cbd5e1', margin: '6px 0 -16px 0' }} />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0, padding: '16px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {operationMode === 'relocate' ? '01 / Hồ sơ thu hồi thiết bị' : 'Hồ sơ thu hồi thiết bị về kho'}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '9999px' }}>
                    {printer.managingTeam || 'Chưa phân công'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ borderRadius: '9px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '7px 11px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Ban/Team đang quản lý</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{printer.managingTeam || 'Chưa phân công'}</div>
                  </div>
                  <div style={{ borderRadius: '9px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '7px 11px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Người đại diện hiện tại</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{printer.custodianName || 'Chưa có'}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.9fr 1.1fr', gap: '8px' }}>
                  <div style={{ borderRadius: '9px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '7px 11px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Trụ sở / Chi nhánh</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{printer.branch || 'Chưa xác định'}</div>
                  </div>
                  <div style={{ borderRadius: '9px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '7px 11px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tầng đặt máy</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{printer.floor || 'Chưa xác định'}</div>
                  </div>
                  <div style={{ borderRadius: '9px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '7px 11px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Phòng ban / Vị trí</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{printer.department || 'Chưa xác định'}</div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>Lý do thu hồi *</label>
                  <textarea rows={operationMode === 'recall' ? 3 : 2} value={form.recallReason} onChange={(e) => setField('recallReason', e.target.value)} placeholder="Nhập lý do thu hồi từ người/bộ phận hiện tại..." style={TEXTAREA_STYLE} />
                </div>

                <FileDropzone file={recallFile} onChange={setRecallFile} title="Biên bản thu hồi thiết bị" accentColor="#d97706" />
              </div>
            </div>

            {/* Bước 2: Điều chuyển mới */}
            {operationMode === 'relocate' && (
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dbeafe', border: '2px solid #2563eb', color: '#1d4ed8', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
                </div>

                <div style={{ flex: 1, minWidth: 0, padding: '16px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #bfdbfe', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    02 / Điều chuyển &amp; Bàn giao mới
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <FormField label="Ban/Team chịu trách nhiệm mới">
                      <select value={form.managingTeam} onChange={(e) => setField('managingTeam', e.target.value)} style={{ ...INPUT_STYLE, cursor: 'pointer' }}>
                        {MANAGING_TEAMS.map((t) => (<option key={t} value={t}>{t}</option>))}
                      </select>
                    </FormField>
                    <FormField label="Người đại diện mới (Họ tên)">
                      <input type="text" value={form.custodianName} onChange={(e) => setField('custodianName', e.target.value)} placeholder="VD: Nguyễn Văn B" style={INPUT_STYLE} />
                    </FormField>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.9fr 1.1fr', gap: '10px' }}>
                    <FormField label="Trụ sở / Chi nhánh mới">
                      <select
                        value={form.branch}
                        onChange={(e) => {
                          const nextBranch = e.target.value;
                          const nextFloors = locationService.getFloorsByBranch(nextBranch);
                          setForm((prev) => ({ ...prev, branch: nextBranch, floor: nextFloors[0] || prev.floor }));
                        }}
                        style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                      >
                        {branches.map((b) => (<option key={b} value={b}>{b}</option>))}
                        {form.branch && !branches.includes(form.branch) && <option value={form.branch}>{form.branch}</option>}
                      </select>
                    </FormField>
                    <FormField label="Tầng đặt máy mới">
                      <select value={form.floor} onChange={(e) => setField('floor', e.target.value)} style={{ ...INPUT_STYLE, cursor: 'pointer' }}>
                        {availableFloors.map((fl) => (<option key={fl} value={fl}>{fl}</option>))}
                      </select>
                    </FormField>
                    <FormField label="Phòng ban / Vị trí chi tiết">
                      <input type="text" value={form.department} onChange={(e) => setField('department', e.target.value)} placeholder="VD: Phòng Kế toán" style={INPUT_STYLE} />
                    </FormField>
                  </div>

                  {willClearGridPos && (
                    <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '11.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FontAwesomeIcon icon={faTriangleExclamation} style={{ flexShrink: 0, color: '#d97706' }} />
                      <span>Thay đổi Tầng hoặc Trụ sở sẽ tự động gỡ tọa độ ô cũ trên sơ đồ hiện tại.</span>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>Ghi chú / Lý do bàn giao mới</label>
                    <textarea rows={2} value={form.transferReason} onChange={(e) => setField('transferReason', e.target.value)} placeholder="Ghi chú bàn giao, tình trạng máy khi chuyển giao cho người mới..." style={TEXTAREA_STYLE} />
                  </div>

                  <FileDropzone file={handoverFile} onChange={setHandoverFile} title="Biên bản bàn giao mới" accentColor="#2563eb" />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} style={{ padding: '8px 16px', borderRadius: '9999px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
              Hủy bỏ
            </button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '8px 20px', borderRadius: '9999px', border: 'none', backgroundColor: operationMode === 'recall' ? '#d97706' : '#2563eb', color: '#ffffff', fontSize: '12.5px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: operationMode === 'recall' ? '0 4px 12px rgba(217, 119, 6, 0.25)' : '0 4px 12px rgba(37, 99, 235, 0.25)' }}>
              <FontAwesomeIcon icon={faCheck} />
              <span>{isSubmitting ? 'Đang lưu...' : operationMode === 'recall' ? 'Xác nhận thu hồi' : 'Xác nhận điều chuyển'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PrinterEditModal;
