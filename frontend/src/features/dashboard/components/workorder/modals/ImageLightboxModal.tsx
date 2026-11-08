/**
 * Frontend/src/features/dashboard/components/workorder/modals/ImageLightboxModal.tsx
 *
 * Modal Lightbox Xem Trước Ảnh Nghiệm Thu & Bản In Test Enterprise:
 * - Hỗ trợ Zoom in, Zoom out, Xoay ảnh 90°, Tải xuống và phím tắt Escape.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useState, useEffect } from 'react';
import {
  FontAwesomeIcon,
  faXmark,
  faDownload,
  faRotate,
  faPlus,
  faPaperclip,
} from '@/shared/icons';
import { TaskAttachment } from '@/types/task';

interface ImageLightboxModalProps {
  attachment: TaskAttachment | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (att: TaskAttachment) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  attachment,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setRotation(0);
    }
  }, [isOpen, attachment?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !attachment) return null;

  const isImage = attachment.fileType === 'IMAGE' || Boolean(attachment.isTestPrintProof);
  const displayUrl = attachment.fileUrl;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(3, +(prev + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.5, +(prev - 0.25).toFixed(2)));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs shrink-0">
              <FontAwesomeIcon icon={faPaperclip} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-100 truncate" title={attachment.fileName}>
                {attachment.fileName}
              </h4>
              <p className="text-[11px] text-slate-400">
                {attachment.fileSize} • Đăng tải bởi <strong className="text-slate-300">{attachment.uploadedBy}</strong> ({attachment.uploadedAt})
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            {isImage && (
              <>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Thu nhỏ"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Về tỷ lệ 100%"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Phóng to"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Xoay ảnh 90°"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  <FontAwesomeIcon icon={faRotate} />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => onDownload(attachment)}
              title="Tải tệp về máy"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-colors"
            >
              <FontAwesomeIcon icon={faDownload} className="text-xs" />
              <span className="hidden sm:inline">Tải về</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Đóng xem trước (Esc)"
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors ml-1"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="relative flex-1 overflow-auto p-4 flex items-center justify-center min-h-[360px] max-h-[74vh] bg-slate-950/60 select-none">
          {isImage ? (
            displayUrl ? (
              <div className="flex items-center justify-center w-full h-full overflow-hidden">
                <img
                  src={displayUrl}
                  alt={attachment.fileName}
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg border border-slate-800/80 pointer-events-auto cursor-grab active:cursor-grabbing"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-lg text-slate-500">
                  <FontAwesomeIcon icon={faPaperclip} />
                </div>
                <p className="text-xs">Không tìm thấy đường dẫn hiển thị trực tiếp cho ảnh này.</p>
                <button
                  type="button"
                  onClick={() => onDownload(attachment)}
                  className="mt-2 text-xs text-indigo-400 hover:underline font-semibold"
                >
                  Bấm vào đây để tải về tệp gốc
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300 gap-3 p-8 text-center max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl text-amber-400">
                <FontAwesomeIcon icon={faPaperclip} />
              </div>
              <h5 className="text-sm font-bold text-slate-100">{attachment.fileName}</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tệp này thuộc định dạng tài liệu ({attachment.fileType}) và không hỗ trợ preview ảnh trực tiếp. Vui lòng tải về máy để xem chi tiết.
              </p>
              <button
                type="button"
                onClick={() => onDownload(attachment)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-colors"
              >
                <FontAwesomeIcon icon={faDownload} />
                <span>Tải tệp về máy ({attachment.fileSize})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

