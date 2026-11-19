/**
 * Frontend/src/features/analytics/components/supplies/SuppliesDispatchModal.tsx
 *
 * Modal Shell Lập Phiếu Cấp Phát & Thay Thế Vật Tư:
 * - Backdrop, phím tắt Escape, Header, Success screen.
 * - Tích hợp SuppliesDispatchForm.
 * - Tuân thủ AGENTS.md Rule 7.1: FontAwesome duy nhất, < 300 LOC.
 */

import React, { useState, useEffect } from 'react';
import { ModalPortal } from '@/shared/modals';
import { FontAwesomeIcon, faXmark, faWrench, faCircleCheck } from '../../../../shared/icons';
import { ConsumableAlertItem } from '../../../../types/analyticsUI';
import { SuppliesDispatchForm } from './SuppliesDispatchForm';

interface SuppliesDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertItem: ConsumableAlertItem | null;
  onConfirmDispatch: (payload: {
    alertItem: ConsumableAlertItem;
    priority: 'urgent' | 'normal';
    quantity: number;
    technician: string;
    notes: string;
  }) => void;
}

export const SuppliesDispatchModal: React.FC<SuppliesDispatchModalProps> = ({
  isOpen,
  onClose,
  alertItem,
  onConfirmDispatch,
}) => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (alertItem) {
      setIsSuccess(false);
    }
  }, [alertItem]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !alertItem) return null;

  const handleFormSubmit = (payload: {
    alertItem: ConsumableAlertItem;
    priority: 'urgent' | 'normal';
    quantity: number;
    technician: string;
    notes: string;
  }) => {
    onConfirmDispatch(payload);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FontAwesomeIcon icon={faWrench} className="text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold m-0 text-slate-900 dark:text-slate-100">
                Lập Lệnh Cấp Phát &amp; Xuất Kho Vật Tư
              </h3>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
                Phiếu điều phối vật tư thay thế chủ động
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Content Form or Success */}
        {isSuccess ? (
          <div className="px-6 py-10 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCircleCheck} className="text-2xl" />
            </div>
            <strong className="text-base text-slate-900 dark:text-slate-100">
              Đã lập lệnh cấp phát thành công!
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              Thông tin đã được đồng bộ sang hệ thống Quản lý vật tư &amp; Lệnh bảo trì.
            </p>
          </div>
        ) : (
          <SuppliesDispatchForm
            alertItem={alertItem}
            onSubmit={handleFormSubmit}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
    </ModalPortal>
  );
};
