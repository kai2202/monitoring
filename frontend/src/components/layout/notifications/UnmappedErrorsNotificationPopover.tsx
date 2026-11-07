/**
 * Frontend/src/components/layout/notifications/UnmappedErrorsNotificationPopover.tsx
 *
 * Popover Bảng Cảnh Báo Mã Lỗi Phần Cứng Chưa Gán theo thiết kế hiện đại (Image 1):
 * - Header với Segmented Pill Tabs [Tất cả | Nghiêm trọng], KHÔNG CÓ nút đọc hết.
 * - Danh sách item với Avatar thương hiệu + Mini Badge faTriangleExclamation + Mã lỗi/Thời gian.
 * - KHÔNG CÓ nút "Bỏ qua" hay "Gán ngay" (mã lỗi chỉ mất đi khi nạp file CSV tương ứng).
 * - Tuân thủ nghiêm ngặt AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/app/store';
import {
  FontAwesomeIcon,
  faTriangleExclamation,
  faCircleCheck,
  faChevronRight,
  faMicrochip,
} from '@/shared/icons';

interface UnmappedErrorsNotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnmappedErrorsNotificationPopover: React.FC<UnmappedErrorsNotificationPopoverProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { unmappedErrors } = useSelector((state: RootState) => state.notification);
  const [filterTab, setFilterTab] = useState<'all' | 'critical'>('all');

  if (!isOpen) return null;

  const filteredItems = unmappedErrors.filter((err) => {
    if (filterTab === 'critical') return err.severity === 'Critical';
    return true;
  });

  const getVendorBadgeStyle = (vendor: string) => {
    const v = (vendor || '').toLowerCase();
    if (v.includes('ricoh')) {
      return { bg: 'linear-gradient(135deg, #ea580c, #c2410c)', code: 'RC' };
    }
    if (v.includes('canon')) {
      return { bg: 'linear-gradient(135deg, #dc2626, #b91c1c)', code: 'CN' };
    }
    if (v.includes('hp')) {
      return { bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)', code: 'HP' };
    }
    if (v.includes('fuji') || v.includes('xerox')) {
      return { bg: 'linear-gradient(135deg, #0284c7, #0369a1)', code: 'FX' };
    }
    return { bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', code: (vendor || 'FM').slice(0, 2).toUpperCase() };
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '46px',
        right: 0,
        width: '380px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.18), 0 0 1px rgba(15, 23, 42, 0.12)',
        border: '1px solid var(--border-color, #e2e8f0)',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Header với Segmented Pill Tabs (Chuẩn thiết kế Ảnh 1 - KHÔNG CÓ nút đọc hết) */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '15.5px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Mã Lỗi Chưa Gán
          </h3>
          {unmappedErrors.length > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
              {unmappedErrors.length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '999px', padding: '3px', gap: '2px' }}>
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            style={{
              padding: '4px 12px', fontSize: '11px', fontWeight: filterTab === 'all' ? 700 : 500, borderRadius: '999px',
              border: 'none', backgroundColor: filterTab === 'all' ? '#ffffff' : 'transparent', color: filterTab === 'all' ? '#0f172a' : '#64748b',
              cursor: 'pointer', boxShadow: filterTab === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('critical')}
            style={{
              padding: '4px 12px', fontSize: '11px', fontWeight: filterTab === 'critical' ? 700 : 500, borderRadius: '999px',
              border: 'none', backgroundColor: filterTab === 'critical' ? '#ffffff' : 'transparent', color: filterTab === 'critical' ? '#0f172a' : '#64748b',
              cursor: 'pointer', boxShadow: filterTab === 'critical' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Nghiêm trọng
          </button>
        </div>
      </div>

      {/* 2. Danh sách Thông báo Lỗi Chưa Gán (Chuẩn Layout Ảnh 1) */}
      <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
        {filteredItems.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
            <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '24px', color: '#10b981', marginBottom: '8px' }} />
            <div style={{ fontWeight: 600, color: '#334155' }}>Toàn bộ mã lỗi đã được định danh</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Không có mã lỗi mới chưa tích hợp từ điển CSV</div>
          </div>
        ) : (
          filteredItems.map((err) => {
            const badge = getVendorBadgeStyle(err.vendor);
            return (
              <div
                key={`${err.vendor}-${err.errorCode}`}
                style={{
                  padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px', borderBottom: '1px solid #f8fafc',
                  transition: 'background-color 0.15s ease', backgroundColor: '#ffffff',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                {/* Avatar Tròn Thương Hiệu + Mini Badge faTriangleExclamation */}
                <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: badge.bg, color: '#ffffff', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800,
                    }}
                  >
                    {badge.code}
                  </div>
                  <div
                    style={{
                      position: 'absolute', bottom: '-2px', right: '-2px', width: '18px', height: '18px', borderRadius: '50%',
                      backgroundColor: err.severity === 'Critical' ? '#ef4444' : '#f59e0b', border: '2px solid #ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '9px',
                    }}
                  >
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                  </div>
                </div>

                {/* Nội dung chi tiết lỗi (Không có nút Bỏ qua / Gán ngay) */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                      {err.vendor} • {err.errorCode}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{err.lastDetectedAt}</span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px', lineHeight: 1.35, fontWeight: 500 }}>
                    {err.sampleTitle}
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#d97706', fontWeight: 600 }}>
                      Phát hiện trên {err.affectedPrinters.length} máy in
                    </span>
                    <span>•</span>
                    <span>Phân hệ: <strong>{err.suggestedSubsystem}</strong></span>
                  </div>
                </div>

                {/* Chấm tròn cam/đỏ Unread (Chuẩn Ảnh 1) */}
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: err.severity === 'Critical' ? '#ef4444' : '#f59e0b',
                    flexShrink: 0,
                    marginTop: '6px',
                    boxShadow: err.severity === 'Critical' ? '0 0 4px rgba(239, 68, 68, 0.6)' : '0 0 4px rgba(245, 158, 11, 0.6)',
                  }}
                />
              </div>
            );
          })
        )}
      </div>

      {/* 3. Footer Ghi chú & Liên kết Quản trị từ điển */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '10.5px', color: '#64748b', lineHeight: 1.35 }}>
          Thông báo sẽ tự động biến mất khi nạp file CSV từ điển chứa mã lỗi tương ứng.
        </p>
        <div>
          <button
            type="button"
            onClick={() => { onClose(); navigate('/settings'); }}
            style={{
              background: 'none', border: 'none', color: '#2563eb', fontSize: '11.5px',
              fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
            }}
          >
            <FontAwesomeIcon icon={faMicrochip} style={{ fontSize: '11px' }} />
            <span>Mở Quản Trị Từ Điển Mã Lỗi</span>
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '9px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnmappedErrorsNotificationPopover;

