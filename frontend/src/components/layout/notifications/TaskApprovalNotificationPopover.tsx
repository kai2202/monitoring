/**
 * Frontend/src/components/layout/notifications/TaskApprovalNotificationPopover.tsx
 *
 * Popover Yêu Cầu Nghiệm Thu / Nhiệm Vụ:
 * - Thiết kế phẳng Tailwind + Dark Mode chuẩn hệ thống (rounded-2xl, divide-y, nút rounded-lg gọn).
 * - Bỏ lặp tên KTV 2 lần; giữ bố cục Tiêu đề phiếu -> Máy in · KTV · Thời gian -> Nút hành động.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RootState } from '@/app/store';
import { FontAwesomeIcon, faChevronRight, faCircleCheck } from '@/shared/icons';
import {
  markTaskNotificationAsRead,
  addTaskNotification,
  transitionTaskNotification,
} from '@/app/slices/notificationSlice';
import { taskService } from '@/services';
import { ReworkReasonModal } from '@/features/dashboard/components/workorder';

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
    isAdmin
      ? n.type === 'PENDING_APPROVAL' || n.type === 'REWORK_REQUESTED' || n.type === 'APPROVED'
      : n.type === 'REWORK_REQUIRED'
  );

  const filteredItems = roleNotifications.filter((n) => {
    if (filterTab === 'pending') {
      return isAdmin ? n.type === 'PENDING_APPROVAL' : !n.isRead;
    }
    return true;
  });

  const handleApprove = async (e: React.MouseEvent, taskId: string, taskTitle: string) => {
    e.stopPropagation();
    try {
      await taskService.approveTask(taskId);
      dispatch(
        transitionTaskNotification({
          taskId,
          toType: 'APPROVED',
          message: 'Đã nghiệm thu và hoàn tất đóng lệnh',
        })
      );
      toast.success(`Đã nghiệm thu và đóng hoàn thành nhiệm vụ ${taskId} (${taskTitle})!`);
    } catch {
      toast.error('Có lỗi xảy ra khi phê duyệt nhiệm vụ.');
    }
  };

  const handleConfirmRework = async (reason: string) => {
    if (!reworkTaskId) return;
    try {
      await taskService.reworkTask(reworkTaskId, reason);
      const notifItem = taskNotifications.find((n) => n.taskId === reworkTaskId);

      dispatch(
        transitionTaskNotification({
          taskId: reworkTaskId,
          toType: 'REWORK_REQUESTED',
          reworkReason: reason,
          message: `Đã yêu cầu làm lại: ${reason}`,
        })
      );

      dispatch(
        addTaskNotification({
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
        })
      );

      toast.warning(`Đã gửi yêu cầu làm lại cho nhiệm vụ ${reworkTaskId}.`);
      setReworkTaskId(null);
    } catch {
      toast.error('Không thể gửi yêu cầu làm lại.');
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase() || 'KT';
  };

  return (
    <>
      <div className="absolute top-[46px] right-0 w-[380px] max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl z-[1000] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 m-0">
              {isAdmin ? 'Yêu Cầu Nghiệm Thu' : 'Nhiệm Vụ Của Tôi'}
            </h3>
          </div>

          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 gap-0.5">
            {[
              { id: 'all' as const, label: 'Tất cả' },
              { id: 'pending' as const, label: isAdmin ? 'Chờ duyệt' : 'Chưa đọc' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold border-none cursor-pointer transition-all ${
                  filterTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                    : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[340px] overflow-y-auto custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-9 px-5 text-center flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <FontAwesomeIcon icon={faCircleCheck} className="text-sm" />
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {isAdmin
                  ? 'Hiện không có phiếu nào cần xét duyệt'
                  : 'Không có nhiệm vụ nào bị yêu cầu làm lại'}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredItems.map((notif) => {
                const isRework =
                  notif.type === 'REWORK_REQUIRED' || notif.type === 'REWORK_REQUESTED';
                const avatarCls = isRework
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  : notif.type === 'APPROVED'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300';

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      dispatch(markTaskNotificationAsRead(notif.id));
                      onClose();
                      navigate(isAdmin ? '/printers/history' : '/printers/timeline');
                    }}
                    className={`px-4 py-3 flex items-start gap-2.5 cursor-pointer transition-colors ${
                      notif.isRead
                        ? 'bg-transparent hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        : 'bg-blue-50/30 dark:bg-blue-950/15 hover:bg-blue-50/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Avatar chữ cái gọn 32px */}
                    <div
                      className={`w-8 h-8 rounded-lg font-mono font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5 ${avatarCls}`}
                    >
                      {getInitials(notif.assigneeName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {notif.taskTitle}
                        </div>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                          {notif.printerId}
                        </span>
                        <span>·</span>
                        <span>{notif.assigneeName}</span>
                        <span>·</span>
                        <span>{notif.timestamp}</span>
                      </div>

                      {isRework && (notif.reworkReason || notif.message) && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-1">
                          Lý do: {notif.reworkReason || notif.message}
                        </div>
                      )}

                      {isAdmin && notif.type === 'PENDING_APPROVAL' && (
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReworkTaskId(notif.taskId);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold cursor-pointer transition-colors"
                          >
                            Làm lại
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleApprove(e, notif.taskId, notif.taskTitle)}
                            className="px-3 py-1 rounded-lg border-none bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Phê duyệt
                          </button>
                        </div>
                      )}

                      {isAdmin && notif.type === 'REWORK_REQUESTED' && (
                        <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold">
                          Đang chờ KTV làm lại
                        </span>
                      )}

                      {isAdmin && notif.type === 'APPROVED' && (
                        <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                          Đã hoàn tất đóng lệnh
                        </span>
                      )}

                      {!isAdmin && notif.type === 'REWORK_REQUIRED' && (
                        <div className="mt-2">
                          <button
                            type="button"
                            className="px-3 py-1 rounded-lg border-none bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Khắc phục ngay
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(isAdmin ? '/printers/history' : '/printers/timeline');
            }}
            className="bg-transparent border-none text-blue-600 dark:text-blue-400 hover:underline text-[11.5px] font-bold cursor-pointer inline-flex items-center gap-1"
          >
            <span>{isAdmin ? 'Mở Kho Lịch Sử Nghiệm Thu' : 'Xem Lịch Trình Công Việc'}</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
          </button>
        </div>
      </div>

      <ReworkReasonModal
        isOpen={Boolean(reworkTaskId)}
        onClose={() => setReworkTaskId(null)}
        taskId={reworkTaskId || ''}
        onSubmit={handleConfirmRework}
        taskTitle={taskNotifications.find((n) => n.taskId === reworkTaskId)?.taskTitle || ''}
      />
    </>
  );
};

export default TaskApprovalNotificationPopover;
