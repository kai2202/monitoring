/**
 * Frontend/src/components/layout/notifications/TaskApprovalNotificationPopover.tsx
 *
 * Popover Bảng Yêu Cầu Xét Duyệt Nghiệm Thu theo thiết kế hiện đại (Image 1):
 * - Header với Segmented Pill Tabs [Tất cả | Chờ duyệt], không có nút đọc hết.
 * - Danh sách item với Avatar tròn + Mini Badge góc dưới + Tên/Thời gian + Nội dung + Nút [Làm lại / Phê duyệt] pill.
 * - Tuân thủ nghiêm ngặt AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RootState } from '@/app/store';
import { FontAwesomeIcon, faClipboardCheck, faRotate, faChevronRight, faCircleCheck } from '@/shared/icons';
import { markTaskNotificationAsRead, removeTaskNotificationByTaskId, addTaskNotification } from '@/app/slices/notificationSlice';
import { taskService } from '@/services';
import { ReworkReasonModal } from '@/features/dashboard/components/workorder/ReworkReasonModal';

interface TaskApprovalNotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export const TaskApprovalNotificationPopover: React.FC<TaskApprovalNotificationPopoverProps> = ({
  isOpen,
  onClose,
  isAdmin,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { taskNotifications } = useSelector((state: RootState) => state.notification);

  const [filterTab, setFilterTab] = useState<'all' | 'pending'>('all');
  const [reworkTaskId, setReworkTaskId] = useState<string | null>(null);

  if (!isOpen) return null;

  const roleNotifications = taskNotifications.filter((n) =>
    isAdmin ? n.type === 'PENDING_APPROVAL' : n.type === 'REWORK_REQUIRED'
  );

  const filteredItems = roleNotifications.filter((n) => {
    if (filterTab === 'pending') return !n.isRead || n.type === 'PENDING_APPROVAL';
    return true;
  });

  const handleApprove = async (e: React.MouseEvent, taskId: string, taskTitle: string) => {
    e.stopPropagation();
    try {
      await taskService.updateTask(taskId, { status: 'Completed', progressPercent: 100, completedDate: new Date().toISOString() });
      dispatch(removeTaskNotificationByTaskId(taskId));
      toast.success(`Đã nghiệm thu và đóng hoàn thành nhiệm vụ ${taskId} (${taskTitle})!`);
    } catch {
      toast.error('Có lỗi xảy ra khi phê duyệt nhiệm vụ.');
    }
  };

  const handleConfirmRework = async (reason: string) => {
    if (!reworkTaskId) return;
    try {
      await taskService.updateTask(reworkTaskId, { status: 'In_Progress', progressPercent: 80 });
      const notifItem = taskNotifications.find((n) => n.taskId === reworkTaskId);
      dispatch(removeTaskNotificationByTaskId(reworkTaskId));

      dispatch(addTaskNotification({
        id: `rework-${Date.now()}`,
        taskId: reworkTaskId,
        taskTitle: notifItem?.taskTitle || `Nhiệm vụ ${reworkTaskId}`,
        printerId: notifItem?.printerId || '—',
        type: 'REWORK_REQUIRED',
        message: reason,
        assigneeName: notifItem?.assigneeName || 'Kỹ thuật viên',
        requestedByName: user?.fullName || 'Quản trị viên',
        reworkReason: reason,
        timestamp: 'Vừa xong',
        isRead: false,
      }));

      toast.warning(`Đã gửi yêu cầu làm lại cho nhiệm vụ ${reworkTaskId}.`);
      setReworkTaskId(null);
    } catch {
      toast.error('Không thể gửi yêu cầu làm lại.');
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase() || 'KT';
  };

  return (
    <>
      <div
        style={{
          position: 'absolute', top: '46px', right: 0, width: '380px', backgroundColor: '#ffffff',
          borderRadius: '24px', boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.18), 0 0 1px rgba(15, 23, 42, 0.12)',
          border: '1px solid var(--border-color, #e2e8f0)', zIndex: 1000, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header với Segmented Pill Tabs (Chuẩn Ảnh 1) */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '15.5px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            {isAdmin ? 'Yêu Cầu Nghiệm Thu' : 'Nhiệm Vụ Của Tôi'}
          </h3>
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
              onClick={() => setFilterTab('pending')}
              style={{
                padding: '4px 12px', fontSize: '11px', fontWeight: filterTab === 'pending' ? 700 : 500, borderRadius: '999px',
                border: 'none', backgroundColor: filterTab === 'pending' ? '#ffffff' : 'transparent', color: filterTab === 'pending' ? '#0f172a' : '#64748b',
                cursor: 'pointer', boxShadow: filterTab === 'pending' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {isAdmin ? 'Chờ duyệt' : 'Chưa đọc'}
            </button>
          </div>
        </div>

        {/* Danh sách Notifications (Layout Ảnh 1) */}
        <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
              <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '24px', color: '#cbd5e1', marginBottom: '8px' }} />
              <div>{isAdmin ? 'Hiện không có phiếu nào cần xét duyệt.' : 'Không có nhiệm vụ nào bị yêu cầu làm lại.'}</div>
            </div>
          ) : (
            filteredItems.map((notif) => (
              <div
                key={notif.id}
                onClick={() => { dispatch(markTaskNotificationAsRead(notif.id)); onClose(); navigate('/printers/timeline'); }}
                style={{
                  padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px', borderBottom: '1px solid #f8fafc',
                  cursor: 'pointer', transition: 'background-color 0.15s ease', backgroundColor: notif.isRead ? '#ffffff' : 'rgba(37, 99, 235, 0.02)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = notif.isRead ? '#ffffff' : 'rgba(37, 99, 235, 0.02)'; }}
              >
                {/* 1. Avatar tròn kèm Icon Badge góc dưới */}
                <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: notif.type === 'REWORK_REQUIRED' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800,
                    }}
                  >
                    {getInitials(notif.assigneeName)}
                  </div>
                  <div
                    style={{
                      position: 'absolute', bottom: '-2px', right: '-2px', width: '18px', height: '18px', borderRadius: '50%',
                      backgroundColor: notif.type === 'REWORK_REQUIRED' ? '#d97706' : '#2563eb', border: '2px solid #ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '9px',
                    }}
                  >
                    <FontAwesomeIcon icon={notif.type === 'REWORK_REQUIRED' ? faRotate : faClipboardCheck} />
                  </div>
                </div>

                {/* 2. Nội dung thông báo */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{notif.assigneeName}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{notif.timestamp}</span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px', lineHeight: 1.35 }}>
                    {notif.type === 'REWORK_REQUIRED' ? <>Yêu cầu làm lại: <strong>{notif.taskTitle}</strong></> : <>Gửi nghiệm thu: <strong>{notif.taskTitle}</strong></>}
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', lineHeight: 1.3 }}>
                    {notif.type === 'REWORK_REQUIRED' ? (
                      <span style={{ color: '#b45309', fontWeight: 600 }}>⚠️ {notif.reworkReason || notif.message}</span>
                    ) : (
                      <span>{notif.printerId} • {notif.message}</span>
                    )}
                  </div>

                  {/* Nút hành động kiểu pill [Từ chối / Phê duyệt] (Chuẩn Item 3 trong Ảnh 1) */}
                  {isAdmin && notif.type === 'PENDING_APPROVAL' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setReworkTaskId(notif.taskId); }}
                        style={{
                          padding: '5px 14px', borderRadius: '999px', border: '1px solid #e2e8f0',
                          backgroundColor: '#f1f5f9', color: '#0f172a', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Yêu cầu làm lại
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleApprove(e, notif.taskId, notif.taskTitle)}
                        style={{
                          padding: '5px 16px', borderRadius: '999px', border: 'none',
                          backgroundColor: '#0f172a', color: '#ffffff', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Phê duyệt
                      </button>
                    </div>
                  )}

                  {!isAdmin && notif.type === 'REWORK_REQUIRED' && (
                    <div style={{ marginTop: '8px' }}>
                      <button type="button" style={{ padding: '4px 14px', borderRadius: '999px', border: 'none', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                        Khắc phục ngay
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Chấm xanh Unread (Chuẩn Ảnh 1) */}
                {!notif.isRead && (
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0, marginTop: '6px', boxShadow: '0 0 4px rgba(34, 197, 94, 0.6)' }} />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer chuyển hướng nhanh */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => { onClose(); navigate(isAdmin ? '/printers/history' : '/printers/timeline'); }}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>{isAdmin ? 'Mở Kho Lịch Sử Nghiệm Thu' : 'Xem Lịch Trình Công Việc'}</span>
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '9px' }} />
          </button>
        </div>
      </div>

      <ReworkReasonModal
        isOpen={Boolean(reworkTaskId)}
        onClose={() => setReworkTaskId(null)}
        taskId={reworkTaskId || ''}
        taskTitle={taskNotifications.find((n) => n.taskId === reworkTaskId)?.taskTitle || ''}
        assigneeName={taskNotifications.find((n) => n.taskId === reworkTaskId)?.assigneeName || ''}
        onConfirm={handleConfirmRework}
      />
    </>
  );
};

export default TaskApprovalNotificationPopover;
