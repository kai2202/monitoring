/**
 * Frontend/src/features/dashboard/components/workorder/TestPrintReviewModal.tsx
 *
 * Modal Kiểm Duyệt Bản In Kiểm Tra Chất Lượng (Test Print Proof):
 * - Hiển thị ảnh chụp thực tế của bản in test lưu trên MinIO S3 (Presigned URL) nếu KTV đã tải lên.
 * - Khi chưa có ảnh đính kèm:
 *   + Chế độ `DATA_SOURCE === 'api'` (Clean Slate): Hiển thị Empty State trung thực, không tự bịa dữ liệu.
 *   + Chế độ `DATA_SOURCE === 'mock'`: Hiển thị mẫu Test Pattern mô phỏng trực quan.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  FontAwesomeIcon,
  faPrint,
  faCheck,
  faRotate,
  faXmark,
  faCircleCheck,
  faImage,
} from '../../../../shared/icons';
import { DATA_SOURCE } from '../../../../config/dataSource';
import { taskService } from '../../../../services';
import { Task } from '../../../../types/task';

interface TestPrintReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onApproveAndClose: () => void;
  onRequestRework: (reason: string) => void;
  isAdmin?: boolean;
}

export const TestPrintReviewModal: React.FC<TestPrintReviewModalProps> = ({
  isOpen,
  onClose,
  task,
  onApproveAndClose,
  onRequestRework,
  isAdmin = false,
}) => {
  const [showReworkInput, setShowReworkInput] = useState(false);
  const [reworkReason, setReworkReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProofIdx, setSelectedProofIdx] = useState(0);
  const [resolvedImgUrl, setResolvedImgUrl] = useState<string | null>(null);

  const imageProofs = useMemo(
    () =>
      (task.attachments || []).filter(
        (a) => a.fileType === 'IMAGE' || a.isTestPrintProof
      ),
    [task.attachments]
  );

  const activeProof = imageProofs[selectedProofIdx] || imageProofs[0] || null;

  useEffect(() => {
    if (!isOpen || !activeProof) {
      setResolvedImgUrl(null);
      return;
    }
    if (DATA_SOURCE === 'api') {
      taskService
        .getAttachmentDownloadUrl(task.id, activeProof.id)
        .then((freshUrl) => setResolvedImgUrl(freshUrl || activeProof.fileUrl || null))
        .catch(() => setResolvedImgUrl(activeProof.fileUrl || null));
    } else {
      setResolvedImgUrl(activeProof.fileUrl || null);
    }
  }, [isOpen, activeProof, task.id]);

  if (!isOpen) return null;

  const handleReworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reworkReason.trim()) {
      setErrorMessage('Vui lòng nhập lý do và yêu cầu làm lại cho kỹ thuật viên.');
      return;
    }
    onRequestRework(reworkReason.trim());
    setShowReworkInput(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faPrint} style={{ fontSize: '16px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Bản In Kiểm Tra Chất Lượng (Test Print Proof)
              </h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Lệnh bảo trì: <strong>{task.title}</strong> ({task.id}) • Thiết bị: {task.printerName}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '16px' }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeProof && resolvedImgUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {imageProofs.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {imageProofs.map((proof, idx) => (
                    <button
                      key={proof.id}
                      type="button"
                      onClick={() => setSelectedProofIdx(idx)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: idx === selectedProofIdx ? '1px solid #2563eb' : '1px solid var(--border-color)',
                        backgroundColor: idx === selectedProofIdx ? 'rgba(37,99,235,0.1)' : 'var(--bg-subtle)',
                        color: idx === selectedProofIdx ? '#2563eb' : 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      {proof.fileName}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px' }}>
                <img
                  src={resolvedImgUrl}
                  alt={activeProof.fileName}
                  style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '8px' }}
                />
                <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Tệp: <strong>{activeProof.fileName}</strong> ({activeProof.fileSize}) • Tải lên bởi {activeProof.uploadedBy} lúc {activeProof.uploadedAt}
                </div>
              </div>
            </div>
          ) : DATA_SOURCE === 'api' ? (
            <div style={{ padding: '36px 24px', borderRadius: '14px', border: '1px dashed var(--border-color)', backgroundColor: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
              <FontAwesomeIcon icon={faImage} style={{ fontSize: '28px', color: '#94a3b8' }} />
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Chưa có ảnh bản in kiểm tra nào được tải lên
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', maxWidth: '420px' }}>
                Kỹ thuật viên hiện trường vui lòng chụp ảnh trang in test thực tế sau sửa chữa và tải lên tại mục &ldquo;Tài Liệu &amp; Ảnh Nghiệm Thu&rdquo; để Admin phê duyệt.
              </div>
            </div>
          ) : (
            <div style={{ borderRadius: '12px', border: '2px solid #cbd5e1', backgroundColor: '#ffffff', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div style={{ position: 'absolute', top: '30px', right: '30px', border: '3px solid #16a34a', color: '#16a34a', borderRadius: '8px', padding: '6px 14px', fontWeight: 900, fontSize: '14px', letterSpacing: '1px', transform: 'rotate(-8deg)', opacity: 0.85 }}>
                PASSED • ĐẠT NGHIỆM THU
              </div>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>FLEETMONITOR TEST PATTERN v2.4 (MÔ PHỎNG)</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  KTV: {task.assignee || 'Kỹ sư NOC'} • Máy in: {task.printerName}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <div style={{ height: '32px', backgroundColor: '#00e5ff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#000' }}>CYAN 100%</div>
                <div style={{ height: '32px', backgroundColor: '#f50057', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff' }}>MAGENTA 100%</div>
                <div style={{ height: '32px', backgroundColor: '#ffea00', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#000' }}>YELLOW 100%</div>
                <div style={{ height: '32px', backgroundColor: '#1e293b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff' }}>BLACK 100%</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11.5px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 600 }}>
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px' }} />
                  <span>Độ phủ mực &amp; Không lem màu: ĐẠT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 600 }}>
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px' }} />
                  <span>Cân chỉnh lề &amp; Cuộn nạp giấy: ĐẠT</span>
                </div>
              </div>
            </div>
          )}

          {showReworkInput && (
            <form onSubmit={handleReworkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#d97706' }}>
                Ghi chú lý do yêu cầu kỹ thuật viên làm lại:
              </label>
              <textarea
                rows={3}
                value={reworkReason}
                onChange={(e) => setReworkReason(e.target.value)}
                placeholder="VD: Bản in còn xuất hiện vệt bóng mờ sấy ở góc trái, yêu cầu KTV vệ sinh lại thanh nhiệt fuser..."
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
              />
              {errorMessage && <div style={{ fontSize: '11.5px', color: '#ef4444', fontWeight: 600 }}>{errorMessage}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowReworkInput(false)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'none', fontSize: '11.5px', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '5px 14px', borderRadius: '6px', backgroundColor: '#d97706', color: '#fff', border: 'none', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>Gửi yêu cầu làm lại</button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-subtle)' }}>
          <button type="button" onClick={onClose} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none', fontSize: '12px', cursor: 'pointer' }}>
            Đóng
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isAdmin && (
              <>
                <button type="button" onClick={() => setShowReworkInput(true)} style={{ padding: '7px 16px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #d97706', color: '#d97706', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FontAwesomeIcon icon={faRotate} style={{ fontSize: '12px' }} />
                  <span>Yêu cầu làm lại</span>
                </button>
                <button type="button" onClick={() => { onApproveAndClose(); onClose(); }} style={{ padding: '7px 18px', borderRadius: '8px', backgroundColor: '#16a34a', border: 'none', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)' }}>
                  <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '13px' }} />
                  <span>Phê duyệt nghiệm thu đóng lệnh</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
