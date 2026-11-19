/**
 * Frontend/src/features/printers/components/modals/DeleteFloorBranchConfirmModal.tsx
 *
 * Modal Nhỏ Xác Nhận An Toàn Khi Xóa Tầng & Trụ Sở:
 * - Cảnh báo rõ ràng tác động dữ liệu (máy in đang gán, bản vẽ sơ đồ mặt bằng).
 * - Tự động giải phóng máy in về kho (Chưa gán vị trí) khi xác nhận xóa.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon, faTriangleExclamation, faTrashCan, faXmark, faBoxesStacked } from '@/shared/icons';

export interface DeleteConfirmTarget {
  type: 'floor' | 'branch';
  id: string;
  name: string;
  count: number;
  desksCount?: number;
  hasWalls?: boolean;
}

export interface DeleteFloorBranchConfirmModalProps {
  isOpen: boolean;
  target: DeleteConfirmTarget | null;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteFloorBranchConfirmModal: React.FC<DeleteFloorBranchConfirmModalProps> = ({
  isOpen,
  target,
  isSubmitting = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !target) return null;

  const isFloor = target.type === 'floor';
  const typeLabel = isFloor ? 'Tầng' : 'Trụ sở';
  const hasPrinters = target.count > 0;
  const hasBlueprint = Boolean(target.desksCount && target.desksCount > 0) || Boolean(target.hasWalls);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: hasPrinters ? '#fef2f2' : '#fffbeb',
                color: hasPrinters ? '#dc2626' : '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
              }}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Xác nhận xóa {typeLabel} [{target.name}]
              </h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                Hành động này sẽ tác động tới sơ đồ vận hành thiết bị
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Nội dung cảnh báo tác động dữ liệu */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {hasPrinters ? (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                fontSize: '12px',
                color: '#991b1b',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FontAwesomeIcon icon={faBoxesStacked} style={{ color: '#dc2626' }} />
                <span>Đang có {target.count} máy in được gán cho {typeLabel.toLowerCase()} này:</span>
              </div>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                <li>Toàn bộ <strong>{target.count} máy in</strong> sẽ tự động được giải phóng vị trí ô sàn và chuyển về danh mục <strong>Lưu kho (Chưa gán vị trí)</strong>.</li>
                {hasBlueprint && (
                  <li>Bản vẽ mặt bằng sơ đồ ({target.desksCount || 0} bàn làm việc, hệ vách tường) sẽ được dọn dẹp sạch.</li>
                )}
              </ul>
            </div>
          ) : hasBlueprint ? (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                fontSize: '12px',
                color: '#92400e',
                lineHeight: 1.5,
              }}
            >
              <strong>Lưu ý:</strong> {typeLabel} này đã có bản vẽ sơ đồ mặt bằng ({target.desksCount || 0} bàn làm việc và vách tường). Khi xóa, toàn bộ thiết kế sơ đồ sẽ bị xóa theo.
            </div>
          ) : (
            <p style={{ fontSize: '12.5px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn xóa {typeLabel.toLowerCase()} <strong>{target.name}</strong> không? Thao tác này không thể hoàn tác.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '12px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(220, 38, 38, 0.25)',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <FontAwesomeIcon icon={faTrashCan} style={{ fontSize: '11px' }} />
            <span>{isSubmitting ? 'Đang xử lý...' : `Xóa ${typeLabel}`}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteFloorBranchConfirmModal;
