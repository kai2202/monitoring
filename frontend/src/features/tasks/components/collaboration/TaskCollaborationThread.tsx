/**
 * Frontend/src/features/tasks/components/collaboration/TaskCollaborationThread.tsx
 *
 * Chuỗi Phối Hợp Xử Lý Nhiệm Vụ Dạng Gmail (Universal Gmail-Style Collaboration Thread):
 * - Áp dụng cho 100% các Task (Kỹ thuật viên, Quản trị viên, Đại diện phòng ban, Vendor).
 * - Timeline hội thoại đa chiều, hiển thị Avatar vai trò, thời gian, nội dung và tệp đính kèm.
 * - Form gửi phản hồi nhanh kèm đính kèm chứng từ (hóa đơn, phiếu kho, ảnh hiện trường).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { toast } from 'sonner';
import { FontAwesomeIcon, faPaperPlane, faPaperclip, faCommentDots, faXmark } from '@/shared/icons';
import { Task, TaskContribution } from '@/types/task';
import { taskService } from '@/services';

export interface TaskCollaborationThreadProps {
  task: Task;
  onTaskUpdated?: (updated: Task) => void;
}

const ROLE_BADGES: Record<string, { label: string; bg: string; color: string }> = {
  FIELD_TECH: { label: 'Kỹ Thuật Viên', bg: '#eff6ff', color: '#1d4ed8' },
  FIELD_TECHNICIAN: { label: 'Kỹ Thuật Viên', bg: '#eff6ff', color: '#1d4ed8' },
  ADMIN: { label: 'Quản Trị Hệ Thống', bg: '#fdf2f8', color: '#be185d' },
  ASSET_HR: { label: 'Tổng Vụ / HR Tài Sản', bg: '#f0fdf4', color: '#15803d' },
  DEPARTMENT_USER: { label: 'Đại Diện Phòng Ban', bg: '#fefce8', color: '#a16207' },
  VENDOR: { label: 'Hãng / Nhà Cung Cấp', bg: '#f5f3ff', color: '#6d28d9' },
};

export const TaskCollaborationThread: React.FC<TaskCollaborationThreadProps> = ({
  task,
  onTaskUpdated,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [replyContent, setReplyContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  const contributions: TaskContribution[] = task.contributions || [];
  const isArchived = task.dossierStatus === 'DOSSIER_ARCHIVED';

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    setIsSending(true);
    try {
      const updated = await taskService.addContribution(task.id, {
        authorName: user?.fullName || 'Thành viên',
        authorRole: user?.role || 'FIELD_TECH',
        content: replyContent.trim(),
        file: selectedFile,
      });

      toast.success('Đã gửi phản hồi thành công!');
      setReplyContent('');
      setSelectedFile(null);
      if (onTaskUpdated) onTaskUpdated(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi khi gửi phản hồi.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* Header Luồng */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
          <FontAwesomeIcon icon={faCommentDots} style={{ color: '#2563eb' }} />
          <span>Chuỗi Trao Đổi Phối Hợp &amp; Chứng Từ ({contributions.length})</span>
        </div>
        {isArchived && (
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '6px' }}>
            ✓ Hồ Sơ Đã Khóa Lưu Trữ
          </span>
        )}
      </div>

      {/* Danh Sách Hội Thoại Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
        {contributions.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
            Chưa có phản hồi nào trong luồng. Bắt đầu trao đổi tiến độ hoặc đính kèm biên bản bên dưới.
          </div>
        ) : (
          contributions.map((c) => {
            const badge = ROLE_BADGES[c.authorRole] || { label: c.authorRole, bg: '#f1f5f9', color: '#475569' };

            return (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '12px 14px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                }}
              >
                {/* Header item: Tên, Role badge & Thời gian */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: badge.bg, color: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px' }}>
                      {c.authorName ? c.authorName.slice(0, 2).toUpperCase() : 'NV'}
                    </div>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>{c.authorName}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: badge.bg, color: badge.color, padding: '1px 6px', borderRadius: '6px' }}>
                      {badge.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                    {new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Nội dung tin nhắn */}
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap', paddingLeft: '36px' }}>
                  {c.content}
                </div>

                {/* Tệp đính kèm nếu có */}
                {c.attachedFileName && (
                  <div style={{ paddingLeft: '36px', marginTop: '4px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>
                      <FontAwesomeIcon icon={faPaperclip} />
                      <span>{c.attachedFileName}</span>
                      {c.fileSize && <span style={{ color: '#64748b' }}>({(c.fileSize / 1024).toFixed(0)} KB)</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Form Gửi Phản Hồi (ẩn nếu task đã archived) */}
      {!isArchived && (
        <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <textarea
            rows={2}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Nhập thông tin phản hồi, tiến độ hoặc ghi chú nghiệm thu..."
            style={{ width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px 10px', fontSize: '12px', outline: 'none', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            {/* Đính kèm file */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#475569', fontWeight: 600 }}>
                <FontAwesomeIcon icon={faPaperclip} style={{ color: '#2563eb' }} />
                <span>Đính kèm chứng từ</span>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  style={{ display: 'none' }}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </label>

              {selectedFile && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16a34a', fontWeight: 600, backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: '6px' }}>
                  <span>{selectedFile.name}</span>
                  <button type="button" onClick={() => setSelectedFile(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              )}
            </div>

            {/* Nút gửi */}
            <button
              type="submit"
              disabled={isSending || !replyContent.trim()}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: isSending || !replyContent.trim() ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              <span>{isSending ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaskCollaborationThread;

