/**
 * Frontend/src/features/printers/components/modals/PrinterInitializeDrawer.tsx
 *
 * Slide-over Drawer Khởi Tạo Thiết Bị Mới Từ Zabbix:
 * - Chỉ phục vụ điền thông tin nghiệp vụ & vị trí cho máy in mới được Zabbix đồng bộ theo IP.
 * - Khối thông số kỹ thuật (IP, Model, Hãng, Serial, Firmware) hiển thị chỉ đọc.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import {
  FontAwesomeIcon,
  faPrint,
  faXmark,
  faCheck,
  faLocationDot,
  faUpload,
  faFileLines,
  faChevronDown,
  faDownload,
} from '@/shared/icons';
import { Printer } from '@/types/printer';
import { printerService, locationService } from '@/services';

export interface PrinterInitializeDrawerProps {
  printer: Printer | null;
  isOpen: boolean;
  onClose: () => void;
  onInitialized?: (updated: Printer) => void;
}

const MANAGING_TEAMS = [
  'Ban Quản trị Tổng vụ',
  'Đội Kỹ thuật CNTT (IT)',
  'Phòng Hành chính - Nhân sự',
  'Khối Vận hành Kinh doanh',
  'Phòng Kế toán Tài chính',
];

export const PrinterInitializeDrawer: React.FC<PrinterInitializeDrawerProps> = ({
  printer,
  isOpen,
  onClose,
  onInitialized,
}) => {
  const [branches] = useState(() => locationService.getBranches());
  const defaultBranch = branches[0]?.name || 'Trụ sở chính (HQ)';

  const [name, setName] = useState('');
  const [branch, setBranch] = useState(defaultBranch);
  const [floor, setFloor] = useState('Tầng 1');
  const [department, setDepartment] = useState('');
  const [managingTeam, setManagingTeam] = useState(MANAGING_TEAMS[0]);
  const [custodianName, setCustodianName] = useState('');
  const [handoverFiles, setHandoverFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const availableFloors = useMemo(() => {
    const list = locationService.getFloorsByBranch(branch);
    return list.length > 0 ? list : ['Tầng 1', 'Tầng 2', 'Tầng 3'];
  }, [branch]);

  useEffect(() => {
    if (!isOpen || !printer) return;
    const isAutoName = printer.name.includes('(Mới từ Zabbix)') || printer.name === printer.ip;
    setName(isAutoName ? `${printer.mfr} ${printer.model}`.trim() : printer.name);
    const nextBranch = printer.branch || defaultBranch;
    setBranch(nextBranch);
    const floors = locationService.getFloorsByBranch(nextBranch);
    setFloor(printer.floor || floors[0] || 'Tầng 1');
    setDepartment(printer.department || '');
    setManagingTeam(printer.managingTeam || MANAGING_TEAMS[0]);
    setCustodianName(printer.custodianName || '');
    setHandoverFiles([]);
  }, [isOpen, printer, defaultBranch]);

  useEffect(() => {
    if (!availableFloors.includes(floor)) {
      setFloor(availableFloors[0] || 'Tầng 1');
    }
  }, [availableFloors, floor]);

  if (!isOpen || !printer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !department.trim()) {
      toast.error('Vui lòng nhập Tên gợi nhớ và Phòng ban / Vị trí.');
      return;
    }

    setIsSaving(true);
    try {
      const fullLocation = [branch, floor, department.trim()].filter(Boolean).join(' - ');
      const updated = await printerService.updatePrinter(printer.id, {
        name: name.trim(),
        branch,
        floor,
        department: department.trim(),
        location: fullLocation,
        managingTeam,
        custodianName: custodianName.trim() || undefined,
        handoverFile: handoverFiles[0] || null,
        handoverReason: 'Khởi tạo thiết bị mới từ Zabbix',
      });
      toast.success(`Đã khởi tạo thiết bị ${name.trim()} (${printer.ip}) thành công.`);
      onInitialized?.(updated);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu thông tin khởi tạo thiết bị.');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-slate-900/45 backdrop-blur-[2px] flex justify-end animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faPrint} className="text-sm" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 m-0">
                  Khởi Tạo Thiết Bị Mới
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  {printer.ip || 'Chưa có IP'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-0 truncate">
                Điền thông tin nghiệp vụ &amp; vị trí cho thiết bị vừa đồng bộ từ Zabbix
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-3 space-y-4">
            {/* Block 1: Thông số kỹ thuật từ SNMP/Zabbix (Chỉ đọc) */}
            <div className="rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Thông số kỹ thuật (SNMP / Zabbix)
                </span>
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-500">
                  Chỉ đọc
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <div className="text-[10.5px] text-slate-400">Địa chỉ IP</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-100">{printer.ip || '—'}</div>
                </div>
                <div>
                  <div className="text-[10.5px] text-slate-400">Hãng &amp; Dòng máy</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {[printer.mfr, printer.model].filter(Boolean).join(' ') || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] text-slate-400">Serial</div>
                  <div className="font-mono font-semibold text-slate-700 dark:text-slate-200 truncate">{printer.serial || '—'}</div>
                </div>
                <div>
                  <div className="text-[10.5px] text-slate-400">Firmware</div>
                  <div className="font-mono font-semibold text-slate-700 dark:text-slate-200 truncate">{printer.firmware || '—'}</div>
                </div>
              </div>
            </div>

            {/* Block 2: Thông tin nghiệp vụ & Vị trí */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <FontAwesomeIcon icon={faLocationDot} className="text-amber-500" />
                <span>Thông tin nghiệp vụ &amp; Vị trí</span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Tên gợi nhớ thiết bị <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Ricoh MP 3055 - P.Kế toán"
                  className="w-full rounded-xl bg-slate-100/80 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500/25 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Trụ sở / Chi nhánh <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full appearance-none rounded-xl bg-slate-100/80 dark:bg-slate-800/60 pl-3 pr-8 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/25 cursor-pointer"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Tầng đặt máy <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full appearance-none rounded-xl bg-slate-100/80 dark:bg-slate-800/60 pl-3 pr-8 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/25 cursor-pointer"
                    >
                      {availableFloors.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Phòng ban / Vị trí chi tiết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="VD: Phòng Kế toán & Tài chính"
                  className="w-full rounded-xl bg-slate-100/80 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500/25 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Đơn vị quản lý
                  </label>
                  <div className="relative">
                    <select
                      value={managingTeam}
                      onChange={(e) => setManagingTeam(e.target.value)}
                      className="w-full appearance-none rounded-xl bg-slate-100/80 dark:bg-slate-800/60 pl-3 pr-8 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/25 cursor-pointer"
                    >
                      {MANAGING_TEAMS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Người đại diện
                  </label>
                  <input
                    type="text"
                    value={custodianName}
                    onChange={(e) => setCustodianName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full rounded-xl bg-slate-100/80 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500/25 transition-colors"
                  />
                </div>
              </div>

              {/* Đính kèm biên bản bàn giao (hỗ trợ nhiều tệp, bấm để xem trước, luôn hiện nút tải thêm) */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Biên bản bàn giao thiết bị {handoverFiles.length > 0 && `(${handoverFiles.length} tệp)`}
                </label>

                {handoverFiles.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {handoverFiles.map((file, idx) => (
                      <div
                        key={`${file.name}-${file.size}-${idx}`}
                        onClick={() => {
                          const url = URL.createObjectURL(file);
                          window.open(url, '_blank', 'noopener,noreferrer');
                          setTimeout(() => URL.revokeObjectURL(url), 60000);
                        }}
                        title="Bấm để xem trước tệp"
                        className="rounded-xl bg-emerald-50/80 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 px-3.5 py-2 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faFileLines} className="text-xs" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {file.name}
                            </div>
                            <div className="text-[10.5px] text-slate-500">
                              {(file.size / 1024).toFixed(1)} KB • Bấm để xem
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              const url = URL.createObjectURL(file);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = file.name;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              setTimeout(() => URL.revokeObjectURL(url), 60000);
                            }}
                            title={`Tải xuống ${file.name}`}
                            aria-label={`Tải xuống ${file.name}`}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white/80 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                          >
                            <FontAwesomeIcon icon={faDownload} className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setHandoverFiles((prev) => prev.filter((_, i) => i !== idx))}
                            aria-label="Xóa tệp đính kèm"
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                          >
                            <FontAwesomeIcon icon={faXmark} className="text-xs" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const dropped = Array.from(e.dataTransfer.files || []);
                    if (dropped.length > 0) setHandoverFiles((prev) => [...prev, ...dropped]);
                  }}
                  className={`rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                    isDragging
                      ? 'bg-amber-50 dark:bg-amber-950/30 ring-2 ring-amber-500/30'
                      : 'bg-slate-100/80 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const selected = Array.from(e.target.files || []);
                      if (selected.length > 0) setHandoverFiles((prev) => [...prev, ...selected]);
                      e.target.value = '';
                    }}
                  />
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 text-amber-600 flex items-center justify-center shadow-xs shrink-0">
                    <FontAwesomeIcon icon={faUpload} className="text-xs" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {handoverFiles.length > 0 ? 'Tải thêm biên bản bàn giao' : 'Tải lên biên bản bàn giao'}
                    </div>
                    <div className="text-[10.5px] text-slate-400">
                      Kéo thả hoặc bấm để chọn nhiều tệp (PDF, PNG, JPG, DOCX)
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faCheck} className="text-[11px]" />
              <span>{isSaving ? 'Đang lưu...' : 'Xác nhận khởi tạo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PrinterInitializeDrawer;
