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
  FontAwesomeIcon,
  faPhone,
  faPaperclip,
  faChevronDown,
  faChevronUp,
  faFolder,
  faDownload,
  faPlus,
} from '../../../../shared/icons';
import { VendorCommunicationLog, TaskAttachment } from '../../../../types/task';
import { useWorkOrderAttachments } from './useWorkOrderAttachments';

interface WorkOrderVendorAndAttachmentsProps {
  taskId?: string;
  uploaderName?: string;
  vendorLogs: VendorCommunicationLog[];
  attachments: TaskAttachment[];
  onAddVendorLog?: (log: Partial<VendorCommunicationLog>) => void;
  onAddAttachment?: (att: TaskAttachment) => void;
}

export const WorkOrderVendorAndAttachments: React.FC<WorkOrderVendorAndAttachmentsProps> = ({
  taskId,
  uploaderName = 'Kỹ sư NOC',
  vendorLogs,
  attachments,
  onAddVendorLog,
  onAddAttachment,
}) => {
  const [isVendorOpen, setIsVendorOpen] = useState(vendorLogs.length > 0);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(true);
  const [isAddingVendor, setIsAddingVendor] = useState(false);

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

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Vendor Communications */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
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

            {isAddingVendor ? (
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
            )}
          </div>
        )}
      </div>

      {/* 2. Attachments - Yellow Folder Cards + MinIO S3 Integration */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsAttachmentsOpen(!isAttachmentsOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faFolder} />
            </div>
            <strong className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Tài Liệu &amp; Ảnh Nghiệm Thu ({attachments.length})
            </strong>
          </div>
          <FontAwesomeIcon icon={isAttachmentsOpen ? faChevronUp : faChevronDown} className="text-xs text-slate-400" />
        </button>

        {isAttachmentsOpen && (
          <div className="p-4 pt-1 flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                {attachments.length} tệp tin xác thực
              </span>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                <span>{isUploading ? 'Đang tải lên...' : 'Thêm tệp / ảnh test'}</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".jpg,.jpeg,.png,.webp,.pdf,.log,.txt,.csv"
                multiple
                className="hidden"
              />
            </div>

            {attachments.length === 0 ? (
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className="p-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <FontAwesomeIcon icon={faPaperclip} className="text-indigo-600 text-base" />
                <span className="text-xs font-semibold text-indigo-600">
                  {isUploading ? 'Đang truyền tải tệp lên kho lưu trữ...' : 'Bấm để tải lên ảnh bản in test / biên bản / file log'}
                </span>
                <span className="text-[10.5px] text-slate-600 dark:text-slate-300">
                  Hỗ trợ PNG, JPG, WEBP, PDF, LOG, TXT (Tối đa 10MB)
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm shrink-0 shadow-xs">
                        <FontAwesomeIcon icon={faFolder} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {att.fileName}
                        </div>
                        <div className="text-[10.5px] text-slate-600 dark:text-slate-300 font-medium">
                          {att.fileSize} • {att.uploadedBy}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      title={`Tải xuống ${att.fileName}`}
                      onClick={() => handleDownloadAttachment(att)}
                      className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors shrink-0"
                    >
                      <FontAwesomeIcon icon={faDownload} className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
