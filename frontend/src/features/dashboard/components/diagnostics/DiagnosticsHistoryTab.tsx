/**
 * Frontend/src/features/dashboard/components/diagnostics/DiagnosticsHistoryTab.tsx
 *
 * Tab Nhật Ký Biến Động Tài Sản & Bàn Giao (Asset Lifecycle Trail):
 * - Thanh tóm tắt chủ sở hữu hiện tại (Đơn vị quản lý, Người đại diện, Kiểm kê gần nhất).
 * - Bộ lọc nhanh theo loại biến động (Điều chuyển, Bàn giao, Kiểm kê, Trạng thái).
 * - Timeline dọc chuẩn FontAwesome với khối so sánh Trước -> Sau và xem trước biên bản SHA-256.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useState, useMemo } from 'react';
import {
  FontAwesomeIcon,
  faClock,
  faPaperclip,
  faBuilding,
  faShieldCheck,
  faArrowRight,
  faUser,
  faClipboardCheck,
  faSliders,
} from '@/shared/icons';
import { Printer, PrinterHistoryLog } from '@/types/printer';
import { DocumentPreviewModal } from '@/features/tasks/components/collaboration';

export interface DiagnosticsHistoryTabProps {
  printer: Printer;
}

type HistoryFilter = 'ALL' | 'RELOCATION' | 'CUSTODIAN_TRANSFER' | 'INVENTORY_AUDIT' | 'STATUS_CHANGE';

const ACTION_CONFIGS: Record<string, { label: string; badgeClass: string; iconBg: string; icon: typeof faBuilding }> = {
  RELOCATION: {
    label: 'Điều Chuyển Vị Trí',
    badgeClass: 'bg-blue-50/90 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    icon: faBuilding,
  },
  CUSTODIAN_TRANSFER: {
    label: 'Bàn Giao Người Phụ Trách',
    badgeClass: 'bg-violet-50/90 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    iconBg: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
    icon: faUser,
  },
  INVENTORY_AUDIT: {
    label: 'Kiểm Kê Hiện Trạng',
    badgeClass: 'bg-emerald-50/90 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    icon: faClipboardCheck,
  },
  STATUS_CHANGE: {
    label: 'Đổi Trạng Thái Quản Lý',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    icon: faSliders,
  },
};

const FILTER_OPTIONS: Array<{ id: HistoryFilter; label: string }> = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'RELOCATION', label: 'Điều chuyển' },
  { id: 'CUSTODIAN_TRANSFER', label: 'Bàn giao' },
  { id: 'INVENTORY_AUDIT', label: 'Kiểm kê' },
  { id: 'STATUS_CHANGE', label: 'Trạng thái' },
];

export const DiagnosticsHistoryTab: React.FC<DiagnosticsHistoryTabProps> = ({ printer }) => {
  const [filter, setFilter] = useState<HistoryFilter>('ALL');
  const [previewDoc, setPreviewDoc] = useState<{
    name: string;
    size?: string | number | null;
    sha256?: string | null;
    author?: string | null;
  } | null>(null);

  const allAssetLogs: PrinterHistoryLog[] = useMemo(
    () => (printer.historyLogs || []).filter((log) => log.actionType !== 'TASK_DOSSIER_ARCHIVED'),
    [printer.historyLogs]
  );

  const visibleLogs = useMemo(
    () => (filter === 'ALL' ? allAssetLogs : allAssetLogs.filter((l) => l.actionType === filter)),
    [allAssetLogs, filter]
  );

  return (
    <div className="p-5 flex flex-col gap-4">
      {/* 1. Bộ lọc nhanh theo loại biến động */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map((opt) => {
            const count =
              opt.id === 'ALL' ? allAssetLogs.length : allAssetLogs.filter((l) => l.actionType === opt.id).length;
            const isActive = filter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilter(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-blue-600'
                    : 'bg-slate-100/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Timeline Dọc Biến Động Tài Sản */}
      {visibleLogs.length === 0 ? (
        <div className="py-10 px-5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 flex flex-col items-center text-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-slate-500 flex items-center justify-center text-base">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {allAssetLogs.length === 0 ? 'Chưa có biến động tài sản' : 'Không có bản ghi phù hợp bộ lọc'}
            </div>
            <p className="text-[11.5px] text-slate-500 mt-1 mb-0 max-w-md">
              Các sự kiện điều chuyển vị trí, bàn giao người phụ trách, kiểm kê hoặc đổi trạng thái lưu kho sẽ tự động ghi nhận tại đây.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative pl-7 flex flex-col gap-3 before:content-[''] before:absolute before:left-[13px] before:top-3 before:bottom-3 before:w-[2px] before:rounded-full before:bg-slate-100 dark:before:bg-slate-800">
          {visibleLogs.map((log) => {
            const config = ACTION_CONFIGS[log.actionType] || {
              label: log.actionType,
              badgeClass: 'bg-slate-100 text-slate-700',
              iconBg: 'bg-slate-100 text-slate-600',
              icon: faClock,
            };
            const prev = log.previousData || {};
            const next = log.newData || {};
            const hasDiff =
              (prev.floor && next.floor && prev.floor !== next.floor) ||
              prev.custodianName !== next.custodianName ||
              prev.managingTeam !== next.managingTeam;

            return (
              <div key={log.id} className="relative">
                {/* Node icon trên trục Timeline */}
                <div
                  className={`absolute -left-7 top-3 w-7 h-7 rounded-full flex items-center justify-center text-[11px] z-10 shadow-xs ${config.iconBg}`}
                >
                  <FontAwesomeIcon icon={config.icon} />
                </div>

                <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-xs ring-1 ring-slate-900/[0.05] dark:ring-white/[0.06] px-4 py-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap ${config.badgeClass}`}>
                        {config.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {log.performedBy || 'Quản trị viên'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {log.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 m-0 leading-relaxed">{log.notes}</p>
                  )}

                  {hasDiff && (
                    <div className="px-3 py-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 text-[11.5px] text-slate-600 dark:text-slate-300 flex items-center gap-4 flex-wrap">
                      {prev.floor && next.floor && prev.floor !== next.floor && (
                        <div className="inline-flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faBuilding} className="text-blue-600 text-[11px]" />
                          <span className="line-through text-slate-400">{prev.floor}</span>
                          <FontAwesomeIcon icon={faArrowRight} className="text-[9px] text-slate-400" />
                          <span className="font-bold text-slate-900 dark:text-slate-100">{next.floor}</span>
                        </div>
                      )}
                      {prev.custodianName !== next.custodianName && (
                        <div className="inline-flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faUser} className="text-violet-600 text-[11px]" />
                          <span className="line-through text-slate-400">{prev.custodianName || 'Chưa có'}</span>
                          <FontAwesomeIcon icon={faArrowRight} className="text-[9px] text-slate-400" />
                          <span className="font-bold text-slate-900 dark:text-slate-100">{next.custodianName || 'Chưa gán'}</span>
                        </div>
                      )}
                      {prev.managingTeam !== next.managingTeam && (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-slate-400">Đơn vị:</span>
                          <span className="line-through text-slate-400">{prev.managingTeam || 'Chưa có'}</span>
                          <FontAwesomeIcon icon={faArrowRight} className="text-[9px] text-slate-400" />
                          <span className="font-bold text-slate-900 dark:text-slate-100">{next.managingTeam || 'Chưa gán'}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {log.attachedFileName && (
                    <div className="pt-1.5 flex items-center justify-between flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewDoc({
                            name: log.attachedFileName || 'Biên bản',
                            size: log.fileSize,
                            sha256: log.sha256Hash,
                            author: log.performedBy,
                          })
                        }
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                        title="Click để xem trước biên bản trực tiếp"
                      >
                        <FontAwesomeIcon icon={faPaperclip} />
                        <span>{log.attachedFileName}</span>
                        {log.fileSize && <span className="text-slate-400 font-normal">({(log.fileSize / 1024).toFixed(0)} KB)</span>}
                      </button>

                      {log.sha256Hash && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50/90 px-2 py-0.5 rounded-md">
                          <FontAwesomeIcon icon={faShieldCheck} />
                          <span>SHA-256: {log.sha256Hash.slice(0, 8)}...</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        fileName={previewDoc?.name || ''}
        fileSize={previewDoc?.size}
        sha256Hash={previewDoc?.sha256}
        author={previewDoc?.author}
      />
    </div>
  );
};

export default DiagnosticsHistoryTab;
