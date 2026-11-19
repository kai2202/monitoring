/**
 * Frontend/src/features/printers/components/grid/FloorPlanDeleteConfirmModal.tsx
 *
 * Hộp Thoại Cảnh Báo An Toàn Khi Xóa Vùng Có Máy In:
 * - Hiển thị danh sách các máy in đang đặt trên bàn trong vùng chọn.
 * - Yêu cầu xác nhận rõ ràng trước khi gỡ vị trí tọa độ của thiết bị.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { Printer } from '@/types/printer';
import {
  FontAwesomeIcon,
  faTriangleExclamation,
  faPrint,
  faTrashCan,
  faXmark,
} from '@/shared/icons';

export interface FloorPlanDeleteConfirmModalProps {
  isOpen: boolean;
  printers: Printer[];
  range: { minX: number; maxX: number; minY: number; maxY: number } | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const FloorPlanDeleteConfirmModal: React.FC<FloorPlanDeleteConfirmModalProps> = ({
  isOpen,
  printers,
  range,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !range || printers.length === 0) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #fee2e2',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cảnh báo */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#fef2f2',
            borderBottom: '1px solid #fee2e2',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#991b1b' }}>
              Xác Nhận Xóa Vùng Có Máy In
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#b91c1c' }}>
              Phát hiện {printers.length} máy in đang được bố trí tại khu vực bạn muốn xóa.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Danh sách máy in bị ảnh hưởng */}
        <div style={{ padding: '20px 24px', maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Danh sách thiết bị sẽ bị gỡ vị trí sơ đồ:
          </div>
          {printers.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                }}
              >
                <FontAwesomeIcon icon={faPrint} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {p.model} • IP: {p.ip} • Ô [{p.gridX! + 1}, {p.gridY! + 1}]
                </div>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                }}
              >
                Sẽ gỡ vị trí
              </span>
            </div>
          ))}
        </div>

        {/* Lưu ý hành vi */}
        <div style={{ padding: '0 24px 16px 24px', fontSize: '11.5px', color: '#64748b', lineHeight: 1.5 }}>
          Lưu ý: Các máy in trên sẽ chuyển về trạng thái <strong>Chưa gán vị trí</strong> trên tầng này (không bị xóa khỏi hệ thống). Toàn bộ bàn và vật thể trong vùng [{range.minX + 1}, {range.minY + 1}] → [{range.maxX + 1}, {range.maxY + 1}] sẽ được dọn về ô trống.
        </div>

        {/* Footer Hành Động */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
            }}
          >
            <FontAwesomeIcon icon={faTrashCan} />
            <span>Xác Nhận Gỡ &amp; Xóa Vùng</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FloorPlanDeleteConfirmModal;
