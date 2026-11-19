/**
 * Frontend/src/features/settings/components/SettingsPageHeader.tsx
 *
 * Header Phân Hệ Cấu Hình & Quản Trị theo chuẩn Kho Vật Tư & Mua Sắm:
 * - Eyebrow Category Uppercase + Tiêu đề lớn kèm chấm xanh + Subtitle rõ ràng.
 * - Thanh Sub-tab Pill hiện đại ở góc phải trên cùng.
 * - Toolbar tác vụ ngữ cảnh dạng Pill bo tròn.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faUserShield,
  faMicrochip,
  faRotate,
} from '../../../shared/icons';
import { SettingsSubTab } from '../../../types/settings';

export interface SettingsPageHeaderProps {
  activeTab: SettingsSubTab;
  onTabChange: (tab: SettingsSubTab) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const SettingsPageHeader: React.FC<SettingsPageHeaderProps> = ({
  activeTab,
  onTabChange,
  isLoading,
  onRefresh,
}) => {
  const subTabs = [
    { id: 'rbac' as const, label: 'Người dùng & Phân quyền', icon: faUserShield },
    { id: 'dictionary' as const, label: 'Từ điển mã lỗi', icon: faMicrochip },
  ];

  const getSubTitle = () => {
    switch (activeTab) {
      case 'rbac':
        return 'Quản trị danh sách người dùng đa vai trò và trạng thái truy cập hệ thống.';
      case 'dictionary':
        return 'Bảng tra cứu mã lỗi phần cứng chuẩn hóa đa thương hiệu phục vụ công tác chẩn đoán hiện trường.';
      default:
        return 'Quản lý toàn diện cấu hình hệ thống, bảo vệ an toàn vận hành hệ thống máy in.';
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
      {/* Trái: Underline Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto max-w-full">
        {subTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold transition-colors whitespace-nowrap border-0 border-b-2 border-solid bg-transparent cursor-pointer -mb-px ${
                isActive
                  ? 'border-b-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-b-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-[11px]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Phải: Trạng thái + Làm mới */}
      <div className="flex items-center gap-3 pb-2 sm:pb-1.5 shrink-0">
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gateway ổn định</span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <FontAwesomeIcon icon={faRotate} spin={isLoading} className="text-[11px] text-slate-400" />
          <span>Làm mới</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPageHeader;
