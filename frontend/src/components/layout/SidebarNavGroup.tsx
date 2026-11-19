/**
 * Frontend/src/components/layout/SidebarNavGroup.tsx
 *
 * Nhóm Menu có danh sách con dạng đường dẫn dọc mảnh (Vertical Indent Guide):
 * - Bỏ squircle icon badge lồng nhau và pixel math phức tạp.
 * - Khi active/mở rộng: Đường dẫn dọc mảnh bên trái + sub-items rounded-lg gọn gàng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React from 'react';
import { FontAwesomeIcon, IconProp, faCaretDown, faCaretRight } from '../../shared/icons';
import { NavTabId } from './Sidebar';

export interface SubItemConfig {
  id: NavTabId;
  label: string;
}

export interface SidebarNavGroupProps {
  label: string;
  icon: IconProp;
  isOpen: boolean;
  onToggleOpen: () => void;
  collapsed: boolean;
  activeTab: NavTabId;
  subItems: SubItemConfig[];
  onSelectTab: (tab: NavTabId) => void;
}

export const SidebarNavGroup: React.FC<SidebarNavGroupProps> = ({
  label,
  icon,
  isOpen,
  onToggleOpen,
  collapsed,
  activeTab,
  subItems,
  onSelectTab,
}) => {
  const isGroupActive = subItems.some((s) => s.id === activeTab);

  return (
    <div className="flex flex-col gap-0.5">
      {/* Parent Button */}
      <button
        type="button"
        onClick={() => {
          if (collapsed && subItems.length > 0) {
            onSelectTab(subItems[0].id);
          } else {
            onToggleOpen();
          }
        }}
        title={collapsed ? label : undefined}
        className={`w-full flex items-center rounded-lg text-[13px] transition-colors cursor-pointer border-none ${
          collapsed ? 'justify-center py-2.5 px-0' : 'justify-between py-2 px-3'
        } ${
          isGroupActive
            ? 'bg-blue-50/50 dark:bg-blue-950/30 text-slate-900 dark:text-slate-100 font-semibold'
            : 'bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium'
        }`}
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
          <FontAwesomeIcon
            icon={icon}
            className={`w-4 text-center text-[13.5px] shrink-0 ${
              isGroupActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          {!collapsed && <span className="truncate">{label}</span>}
        </div>

        {!collapsed && (
          <FontAwesomeIcon
            icon={isOpen ? faCaretDown : faCaretRight}
            className="text-[11px] text-slate-400 shrink-0"
          />
        )}
      </button>

      {/* Sub-items with clean vertical indent border */}
      {!collapsed && isOpen && (
        <div className="ml-5 pl-2.5 border-l border-slate-200 dark:border-slate-700/80 flex flex-col gap-0.5 my-0.5">
          {subItems.map((sub) => {
            const isSubActive = sub.id === activeTab;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectTab(sub.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-[12.5px] transition-colors cursor-pointer border-none truncate ${
                  isSubActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarNavGroup;
