/**
 * Frontend/src/components/layout/HeaderNotifications.tsx
 *
 * Cụm 2 Chuông Thông Báo Độc Lập Trên Header:
 * 1. Chuông 1 (faTriangleExclamation): Cảnh báo mã lỗi phần cứng chưa gán vào Từ Điển CSV.
 * 2. Chuông 2 (faClipboardCheck): Quản lý nghiệm thu nhiệm vụ (Admin: chờ duyệt | KTV: làm lại).
 *
 * Tích hợp Popovers hiện đại (Chuẩn Image 1) qua phân hệ ./notifications.
 * Tuân thủ nghiêm ngặt AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { FontAwesomeIcon, faTriangleExclamation, faClipboardCheck } from '../../shared/icons';
import { setUnmappedErrors } from '../../app/slices/notificationSlice';
import { settingsService } from '../../services';
import {
  TaskApprovalNotificationPopover,
  UnmappedErrorsNotificationPopover,
} from './notifications';

export const HeaderNotifications: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unmappedErrors, taskNotifications } = useSelector((state: RootState) => state.notification);

  const isAdmin = user?.role === 'ADMIN';

  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tự động đồng bộ các mã lỗi phát sinh mới nhất từ hệ thống giám sát khi khởi động
  useEffect(() => {
    let isMounted = true;
    settingsService
      .getErrorDictionaryStatus()
      .then((status) => {
        if (isMounted && status?.unmappedCodes) {
          dispatch(setUnmappedErrors(status.unmappedCodes));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsErrorOpen(false);
        setIsTaskOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleTaskNotifications = taskNotifications.filter((n) =>
    isAdmin ? n.type === 'PENDING_APPROVAL' : n.type === 'REWORK_REQUIRED'
  );

  const unreadTaskCount = roleTaskNotifications.filter((n) => !n.isRead).length;
  const unmappedCount = unmappedErrors.length;

  return (
    <div ref={containerRef} style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
      {/* =========================================================================
       * CHUÔNG 1: CẢNH BÁO MÃ LỖI CHƯA GÁN TỪ ĐIỂN (MÀU HỔ PHÁCH / CAM)
       * ========================================================================= */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => {
            setIsErrorOpen(!isErrorOpen);
            setIsTaskOpen(false);
          }}
          title={unmappedCount > 0 ? `Có ${unmappedCount} mã lỗi phần cứng chưa có trong từ điển CSV` : 'Không có mã lỗi mới'}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: isErrorOpen ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-subtle, rgba(0, 0, 0, 0.04))',
            border: isErrorOpen ? '1px solid #f59e0b' : '1px solid var(--border-color, #e2e8f0)',
            color: unmappedCount > 0 ? '#d97706' : 'var(--text-muted, #94a3b8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            position: 'relative',
          }}
        >
          <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: '13px' }} />
          {unmappedCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                borderRadius: '9999px',
                backgroundColor: '#d97706',
                color: '#ffffff',
                fontSize: '9.5px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 6px rgba(217, 119, 6, 0.5)',
              }}
            >
              {unmappedCount}
            </span>
          )}
        </button>

        <UnmappedErrorsNotificationPopover
          isOpen={isErrorOpen}
          onClose={() => setIsErrorOpen(false)}
        />
      </div>

      {/* =========================================================================
       * CHUÔNG 2: PHÊ DUYỆT & NHIỆM VỤ (ADMIN: CHỜ DUYỆT | KTV: LÀM LẠI)
       * ========================================================================= */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => {
            setIsTaskOpen(!isTaskOpen);
            setIsErrorOpen(false);
          }}
          title={
            isAdmin
              ? `Có ${unreadTaskCount} nhiệm vụ chờ xét duyệt nghiệm thu`
              : `Có ${unreadTaskCount} nhiệm vụ yêu cầu làm lại`
          }
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: isTaskOpen ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-subtle, rgba(0, 0, 0, 0.04))',
            border: isTaskOpen ? '1px solid #2563eb' : '1px solid var(--border-color, #e2e8f0)',
            color: unreadTaskCount > 0 ? (isAdmin ? '#2563eb' : '#ef4444') : 'var(--text-muted, #94a3b8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            position: 'relative',
          }}
        >
          <FontAwesomeIcon icon={faClipboardCheck} style={{ fontSize: '13px' }} />
          {unreadTaskCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                borderRadius: '9999px',
                backgroundColor: isAdmin ? '#2563eb' : '#ef4444',
                color: '#ffffff',
                fontSize: '9.5px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isAdmin ? '0 0 6px rgba(37, 99, 235, 0.5)' : '0 0 6px rgba(239, 68, 68, 0.5)',
              }}
            >
              {unreadTaskCount}
            </span>
          )}
        </button>

        <TaskApprovalNotificationPopover
          isOpen={isTaskOpen}
          onClose={() => setIsTaskOpen(false)}
          isAdmin={Boolean(isAdmin)}
        />
      </div>
    </div>
  );
};

export default HeaderNotifications;
