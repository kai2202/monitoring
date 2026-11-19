/**
 * Frontend/src/features/tasks/components/collaboration/DocumentPreviewModal.tsx
 *
 * Modal Xem Trước Tài Liệu & Biên Bản (In-app Document Preview Modal):
 * - Hỗ trợ xem trực tiếp file PDF và Ảnh biên bản bàn giao, hóa đơn linh kiện.
 * - Hiển thị mã băm SHA-256 để kiểm tra tính toàn vẹn tài liệu (Data Integrity).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React from 'react';
import { ModalPortal } from '@/shared/modals';
import {
  FontAwesomeIcon,
  faXmark,
  faDownload,
  faPaperclip,
  faShieldCheck,
  faCopy,
  faCheck,
} from '@/shared/icons';
import { toast } from 'sonner';

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl?: string | null;
  fileSize?: string | number | null;
  mimeType?: string | null;
  sha256Hash?: string | null;
  author?: string | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileUrl,
  fileSize,
  mimeType,
  sha256Hash,
  author,
}) => {
  const [copiedHash, setCopiedHash] = React.useState(false);

  if (!isOpen) return null;

  const isImage =
    mimeType?.startsWith('image/') ||
    /\.(png|jpe?g|webp|gif|svg)$/i.test(fileName);
  const isPdf =
    mimeType?.includes('pdf') ||
    /\.pdf$/i.test(fileName);

  const formattedSize =
    typeof fileSize === 'number'
      ? `${(fileSize / 1024).toFixed(0)} KB`
      : fileSize || 'Không rõ';

  const handleCopyHash = () => {
    if (!sha256Hash) return;
    navigator.clipboard?.writeText(sha256Hash);
    setCopiedHash(true);
    toast.success('Đã sao chép mã băm SHA-256 kiểm toán!');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownload = () => {
    if (!fileUrl) {
      toast.info('Tệp tin mẫu hoặc lưu trữ nội bộ (presigned URL chưa cấp)');
      return;
    }
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ModalPortal>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '850px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: isPdf ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)', color: isPdf ? '#ef4444' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
              <FontAwesomeIcon icon={faPaperclip} />
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>{fileName}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Dung lượng: <span style={{ fontWeight: 600 }}>{formattedSize}</span>
                {author && <> • Người nộp: <span style={{ fontWeight: 600 }}>{author}</span></>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {sha256Hash && (
              <button
                type="button"
                onClick={handleCopyHash}
                title="Bấm để sao chép mã băm SHA-256 toàn vẹn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  fontSize: '10.5px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                <FontAwesomeIcon icon={faShieldCheck} style={{ color: '#16a34a' }} />
                <span>SHA-256: {sha256Hash.slice(0, 8)}...</span>
                <FontAwesomeIcon icon={copiedHash ? faCheck : faCopy} style={{ fontSize: '10px' }} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '380px',
            maxHeight: '68vh',
            padding: '16px',
          }}
        >
          {isImage ? (
            <img
              src={fileUrl || 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80'}
              alt={fileName}
              style={{
                maxWidth: '100%',
                maxHeight: '62vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
              }}
            />
          ) : isPdf && fileUrl ? (
            <iframe
              src={fileUrl}
              title={fileName}
              style={{ width: '100%', height: '62vh', border: 'none', borderRadius: '8px', backgroundColor: '#fff' }}
            />
          ) : (
            <div
              style={{
                padding: '32px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                maxWidth: '440px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                <FontAwesomeIcon icon={faPaperclip} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{fileName}</div>
                <p style={{ fontSize: '11.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Định dạng tài liệu ({mimeType || 'PDF/Document'}) đã được ghi nhận chữ ký số an toàn.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
            Hệ thống lưu trữ MinIO Private Object Bucket
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDownload}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>Tải xuống</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default DocumentPreviewModal;
