/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderVendorAndAttachments.tsx
 *
 * Khối Liên Hệ Hãng & Tài Liệu Đính Kèm (Vendor & Attachments):
 * - Quản lý trao đổi kỹ thuật với hãng và tài liệu đính kèm (PDF, ảnh, log).
 * - Bổ sung nút "Thêm tệp đính kèm" tải file thực tế hoặc mô phỏng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useRef } from 'react';
import {
  FontAwesomeIcon,
  faPhone,
  faPaperclip,
  faChevronDown,
  faChevronUp,
  faFileLines,
  faDownload,
  faPlus,
} from '../../../../shared/icons';
import { VendorCommunicationLog, TaskAttachment } from '../../../../types/task';

interface WorkOrderVendorAndAttachmentsProps {
  vendorLogs: VendorCommunicationLog[];
  attachments: TaskAttachment[];
  onAddVendorLog?: (log: Partial<VendorCommunicationLog>) => void;
  onAddAttachment?: (att: TaskAttachment) => void;
}

export const WorkOrderVendorAndAttachments: React.FC<WorkOrderVendorAndAttachmentsProps> = ({
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toUpperCase() || '';
      let fileType: 'PDF' | 'IMAGE' | 'LOG' | 'DOC' = 'DOC';
      if (['JPG', 'JPEG', 'PNG', 'WEBP', 'SVG'].includes(ext)) fileType = 'IMAGE';
      else if (ext === 'PDF') fileType = 'PDF';
      else if (['LOG', 'TXT', 'JSON', 'CSV'].includes(ext)) fileType = 'LOG';

      const sizeKb = file.size / 1024;
      const formattedSize = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb.toFixed(0)} KB`;

      if (onAddAttachment) {
        onAddAttachment({
          id: `att-${Date.now()}-${i}`,
          fileName: file.name,
          fileType,
          fileSize: formattedSize,
          uploadedAt: `${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString('vi-VN')}`,
          uploadedBy: 'Kỹ sư NOC',
        });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsAttachmentsOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 1. Vendor Communications */}
      <div style={{ borderRadius: '16px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setIsVendorOpen(!isVendorOpen)}
          style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faPhone} style={{ fontSize: '13px', color: '#8b5cf6' }} />
            <strong style={{ fontSize: '12.5px', color: 'var(--text-primary, #0f172a)' }}>
              Liên Hệ Hãng &amp; Chuyên Gia ({vendorLogs.length})
            </strong>
          </div>
          <FontAwesomeIcon icon={isVendorOpen ? faChevronUp : faChevronDown} style={{ fontSize: '12px' }} />
        </button>

        {isVendorOpen && (
          <div style={{ padding: '0 16px 14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {vendorLogs.map((v) => (
              <div key={v.id} style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle, #f8fafc)', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>{v.vendorName} ({v.contactPerson || 'KTV hãng'})</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>{v.timestamp ? new Date(v.timestamp).toLocaleDateString('vi-VN') : ''}</span>
                </div>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary, #475569)' }}>{v.discussionContent || (v as any).discussionSummary}</p>
              </div>
            ))}

            {isAddingVendor ? (
              <form onSubmit={handleAddVendor} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                <input
                  type="text"
                  placeholder="Đơn vị / Tên chuyên gia hỗ trợ..."
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  style={{ padding: '5px 8px', fontSize: '11.5px', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)' }}
                />
                <input
                  type="text"
                  placeholder="Người liên hệ / SĐT hoặc Email..."
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  style={{ padding: '5px 8px', fontSize: '11.5px', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)' }}
                />
                <textarea
                  rows={2}
                  placeholder="Nội dung khuyến nghị từ hãng..."
                  value={discussion}
                  onChange={(e) => setDiscussion(e.target.value)}
                  style={{ padding: '5px 8px', fontSize: '11.5px', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button type="button" onClick={() => setIsAddingVendor(false)} style={{ fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer' }}>Hủy</button>
                  <button type="submit" style={{ padding: '4px 10px', fontSize: '11px', backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Lưu</button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingVendor(true)}
                style={{ fontSize: '11px', color: '#8b5cf6', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
              >
                + Ghi nhận liên hệ hãng
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Attachments with Upload Button */}
      <div style={{ borderRadius: '16px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setIsAttachmentsOpen(!isAttachmentsOpen)}
          style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: '13px', color: '#2563eb' }} />
            <strong style={{ fontSize: '12.5px', color: 'var(--text-primary, #0f172a)' }}>
              Tài Liệu Đính Kèm &amp; Sơ Đồ ({attachments.length})
            </strong>
          </div>
          <FontAwesomeIcon icon={isAttachmentsOpen ? faChevronUp : faChevronDown} style={{ fontSize: '12px' }} />
        </button>

        {isAttachmentsOpen && (
          <div style={{ padding: '0 16px 14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Header Thao Tác Thêm File */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                {attachments.length} tệp tin đính kèm
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: '10px' }} />
                <span>Thêm tệp đính kèm</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                style={{ display: 'none' }}
              />
            </div>

            {attachments.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px dashed var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--bg-subtle, #f8fafc)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: '15px', color: '#2563eb' }} />
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#2563eb' }}>
                  Bấm để tải lên tài liệu / ảnh / file log
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>
                  Hỗ trợ PDF, PNG, JPG, LOG, DOC (Tối đa 25MB)
                </span>
              </div>
            ) : (
              attachments.map((att) => (
                <div
                  key={att.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-subtle, #f8fafc)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    fontSize: '11.5px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <FontAwesomeIcon icon={faFileLines} style={{ fontSize: '14px', color: '#2563eb', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {att.fileName}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>
                        {att.fileSize} • {att.uploadedAt}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    title={`Tải xuống ${att.fileName}`}
                    onClick={() => alert(`Tải xuống tệp tin: ${att.fileName}`)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: '4px' }}
                  >
                    <FontAwesomeIcon icon={faDownload} style={{ fontSize: '12px' }} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
