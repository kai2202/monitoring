/**
 * Frontend/src/features/dashboard/components/workorder/useWorkOrderAttachments.ts
 *
 * Custom Hook tách biệt toàn bộ side-effects Upload (`FormData` -> MinIO S3)
 * và Tải xuống bằng chứng đính kèm qua Presigned URL khỏi component JSX.
 * - Tuân thủ AGENTS.md Rule 4, Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { DATA_SOURCE } from '../../../../config/dataSource';
import { taskService } from '../../../../services';
import { TaskAttachment } from '../../../../types/task';

interface UseWorkOrderAttachmentsParams {
  taskId?: string;
  uploaderName: string;
  onAddAttachment?: (att: TaskAttachment) => void;
  onUploadedSuccess?: () => void;
}

export function useWorkOrderAttachments({
  taskId,
  uploaderName,
  onAddAttachment,
  onUploadedSuccess,
}: UseWorkOrderAttachmentsParams) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isImage = file.type.startsWith('image/');

        if (taskId) {
          const uploaded = await taskService.uploadTaskAttachment(
            taskId,
            file,
            uploaderName,
            isImage
          );
          if (onAddAttachment) onAddAttachment(uploaded);
          toast.success(`Đã tải lên tệp đính kèm: ${uploaded.fileName}`);
        } else {
          const sizeKb = file.size / 1024;
          const formattedSize =
            sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(sizeKb))} KB`;
          if (onAddAttachment) {
            onAddAttachment({
              id: `att-${Date.now()}-${i}`,
              fileName: file.name,
              fileType: isImage ? 'IMAGE' : 'DOC',
              fileSize: formattedSize,
              uploadedAt: `${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString('vi-VN')}`,
              uploadedBy: uploaderName,
            });
          }
        }
      }
      if (onUploadedSuccess) onUploadedSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải tệp đính kèm lên kho lưu trữ.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadAttachment = async (att: TaskAttachment) => {
    try {
      let targetUrl = att.fileUrl || null;
      if (DATA_SOURCE === 'api' && taskId) {
        const freshUrl = await taskService.getAttachmentDownloadUrl(taskId, att.id);
        if (freshUrl) targetUrl = freshUrl;
      }

      if (targetUrl) {
        const a = document.createElement('a');
        a.href = targetUrl;
        a.download = att.fileName;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`Đang tải xuống tệp đính kèm: ${att.fileName}`);
        return;
      }

      if (DATA_SOURCE === 'api') {
        toast.error(`Không tìm thấy đường dẫn lưu trữ MinIO cho tệp ${att.fileName}`);
        return;
      }

      const content = `FleetMonitor Verification Attachment Proof\nID: ${att.id}\nFile: ${att.fileName}\nUploaded: ${att.uploadedAt}\nUploadedBy: ${att.uploadedBy || uploaderName}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.fileName.includes('.') ? att.fileName : `${att.fileName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Đang tải xuống tệp đính kèm: ${att.fileName}`);
    } catch (err: any) {
      toast.error(err?.message || `Không thể tải tệp ${att.fileName}`);
    }
  };

  return {
    isUploading,
    fileInputRef,
    handleFileUpload,
    handleDownloadAttachment,
  };
}

