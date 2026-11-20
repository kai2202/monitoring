/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderVendorAndAttachments.tsx
 *
 * Khối Liên Hệ Hãng & Tài Liệu Đính Kèm (Vendor & Attachments):
 * - Đấu nối Upload trực tiếp lên MinIO S3 qua `taskService.uploadTaskAttachment` (`FormData`)
 *   và tải tệp an toàn qua Presigned Download URL (`taskService.getAttachmentDownloadUrl`).
 * - Tuân thủ AGENTS.md Rule 4, Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import {
  FontAwesomeIcon, faPhone, faChevronDown, faChevronUp,
  faDownload, faPlus, faFileLines, faUpload, faXmark,
} from '../../../../shared/icons';
import { VendorCommunicationLog, TaskAttachment } from '../../../../types/task';
import { useWorkOrderAttachments } from './useWorkOrderAttachments';

interface WorkOrderVendorAndAttachmentsProps {
  taskId?: string;
  uploaderName?: string;
  vendorLogs: VendorCommunicationLog[];
  attachments: TaskAttachment[];
  isReadOnly?: boolean;
  embedded?: boolean;
  section?: 'all' | 'vendor' | 'attachments';
  onAddVendorLog?: (log: Partial<VendorCommunicationLog>) => void;
  onAddAttachment?: (att: TaskAttachment) => void;
  onDeleteAttachment?: (attachmentId: string) => void;
}

export const WorkOrderVendorAndAttachments: React.FC<WorkOrderVendorAndAttachmentsProps> = ({
  taskId,
  uploaderName = 'Kỹ sư NOC',
  vendorLogs,
  attachments,
  isReadOnly = false,
  embedded = false,
  section = 'all',
  onAddVendorLog,
  onAddAttachment,
  onDeleteAttachment,
}) => {
  const [isVendorOpen, setIsVendorOpen] = useState(vendorLogs.length > 0);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(true);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [vendorName, setVendorName] = useState('Hỗ trợ kỹ thuật chính hãng');
  const [contact, setContact] = useState('');
  const [discussion, setDiscussion] = useState('');

  const { isUploading, fileInputRef, handleFileUpload, handleDownloadAttachment } =
    useWorkOrderAttachments({
      taskId,
      uploaderName,
      onAddAttachment,
      onUploadedSuccess: () => setIsAttachmentsOpen(true),
    });

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussion.trim()) return;
    if (onAddVendorLog) {
      onAddVendorLog({
        id: `v-${Date.now()}`,
        vendorName,
        contactPerson: contact,
        discussionContent: discussion.trim(),
        timestamp: new Date().toISOString(),
      });
    }
    setDiscussion('');
    setContact('');
    setIsAddingVendor(false);
    setIsVendorOpen(true);
  };

  const showVendor = section === 'all' || section === 'vendor';
  const showAttachments = section === 'all' || section === 'attachments';

  return (
    <div className={embedded ? 'flex flex-col divide-y divide-slate-200/70 dark:divide-slate-800' : 'flex flex-col gap-3'}>
      {/* 1. Vendor Communications */}
      {showVendor && (
      <div className="rounded-xl bg-white dark:bg-slate-900 shadow-xs ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsVendorOpen(!isVendorOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faPhone} />
            </div>
            <strong className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Trao Đổi Kỹ Thuật Với Hãng ({vendorLogs.length})
            </strong>
          </div>
          <FontAwesomeIcon icon={isVendorOpen ? faChevronUp : faChevronDown} className="text-xs text-slate-400" />
        </button>

        {isVendorOpen && (
          <div className="p-4 pt-1 flex flex-col gap-2.5 border-t border-slate-100 dark:border-slate-800">
            {vendorLogs.map((v) => (
              <div key={v.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>{v.vendorName} ({v.contactPerson || 'KTV hãng'})</span>
                  <span className="text-[10.5px] text-slate-600 dark:text-slate-300 font-normal">
                    {v.timestamp ? new Date(v.timestamp).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
                  {v.discussionContent || (v as any).discussionSummary}
                </p>
              </div>
            ))}

            {!isReadOnly && (isAddingVendor ? (
              <form onSubmit={handleAddVendor} className="flex flex-col gap-2 mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  placeholder="Đơn vị / Tên chuyên gia hỗ trợ..."
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                />
                <input
                  type="text"
                  placeholder="Người liên hệ / SĐT hoặc Email..."
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Nội dung khuyến nghị từ hãng..."
                  value={discussion}
                  onChange={(e) => setDiscussion(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none resize-none"
                />
                <div className="flex justify-end gap-2 mt-1">
                  <button type="button" onClick={() => setIsAddingVendor(false)} className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800">Hủy</button>
                  <button type="submit" className="px-3 py-1 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs">Lưu ghi nhận</button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingVendor(true)}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold text-left pt-1 flex items-center gap-1.5"
              >
                <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                <span>+ Ghi nhận cuộc gọi / trao đổi với hãng</span>
              </button>
            ))}
          </div>
        )}
      </div>
      )}

      {/* 2. Attachments */}
      {showAttachments && (
      <div className="rounded-xl bg-white dark:bg-slate-900 shadow-xs ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsAttachmentsOpen(!isAttachmentsOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50 cursor-pointer"
        >
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Tài liệu &amp; Ảnh nghiệm thu {attachments.length > 0 && `(${attachments.length} tệp)`}
          </span>
          <FontAwesomeIcon icon={isAttachmentsOpen ? faChevronUp : faChevronDown} className="text-xs text-slate-400" />
        </button>

        {isAttachmentsOpen && (
          <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
            {!isReadOnly && (
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".jpg,.jpeg,.png,.webp,.pdf,.log,.txt,.csv"
                multiple
                className="hidden"
              />
            )}

            {attachments.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => {
                      if (att.fileUrl) {
                        window.open(att.fileUrl, '_blank', 'noopener,noreferrer');
                      } else {
                        const content = `Tệp đính kèm: ${att.fileName}\nDung lượng: ${att.fileSize}\nNgười tải lên: ${att.uploadedBy}`;
                        const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
                        window.open(url, '_blank', 'noopener,noreferrer');
                        setTimeout(() => URL.revokeObjectURL(url), 60000);
                      }
                    }}
                    title={`Bấm để mở trong tab mới: ${att.fileName}`}
                    className="rounded-xl bg-emerald-50/80 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 px-3.5 py-2 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faFileLines} className="text-xs" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {att.fileName}
                        </div>
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                          {att.fileSize} • {att.uploadedBy} • Bấm để xem
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        title={`Tải xuống ${att.fileName}`}
                        onClick={() => handleDownloadAttachment(att)}
                        className="w-7 h-7 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faDownload} className="text-xs" />
                      </button>
                      {!isReadOnly && onDeleteAttachment && (
                        <button
                          type="button"
                          title={`Xoá tệp ${att.fileName}`}
                          onClick={() => onDeleteAttachment(att.id)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faXmark} className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isReadOnly && (
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (!isUploading && e.dataTransfer.files?.length) {
                    handleFileUpload({
                      target: { files: e.dataTransfer.files, value: '' },
                    } as unknown as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
                className={`rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                  isDragging
                    ? 'bg-amber-50 dark:bg-amber-950/30 ring-2 ring-amber-500/30'
                    : 'bg-slate-100/80 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 text-amber-600 flex items-center justify-center shadow-xs shrink-0">
                  <FontAwesomeIcon icon={faUpload} className="text-xs" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {isUploading
                      ? 'Đang truyền tải tệp lên kho lưu trữ...'
                      : attachments.length > 0
                      ? 'Tải thêm biên bản kỹ thuật / chứng từ / ảnh'
                      : 'Tải lên biên bản kỹ thuật / chứng từ / ảnh'}
                  </div>
                  <div className="text-[10.5px] text-slate-400">
                    Kéo thả hoặc bấm để chọn nhiều tệp (PNG, JPG, WEBP, PDF, LOG, TXT, CSV)
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      )}

    </div>
  );
};
