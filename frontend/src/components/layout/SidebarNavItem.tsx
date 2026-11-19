/**
 * Frontend/src/components/layout/SidebarNavItem.tsx
 *
 * Menu item phẳng hiện đại (Linear/Vercel style) chuẩn FontAwesome.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, IconProp } from '../../shared/icons';
import { NavTabId } from './Sidebar';

export interface SidebarNavItemProps {
  id: NavTabId;
  label: string;
  icon: IconProp;
  activeTab: NavTabId;
  collapsed: boolean;
  onSelectTab: (tab: NavTabId) => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  id,
  label,
  icon,
  activeTab,
  collapsed,
  onSelectTab,
}) => {
  const isActive = activeTab === id;

  return (
    <button
      type="button"
      onClick={() => onSelectTab(id)}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center rounded-lg text-[13px] transition-colors cursor-pointer border-none ${
        collapsed ? 'justify-center py-2.5 px-0' : 'justify-start gap-3 py-2 px-3'
      } ${
        isActive
          ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
          : 'bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium'
      }`}
    >
      <FontAwesomeIcon
        icon={icon}
        className={`w-4 text-center text-[13.5px] shrink-0 ${
          isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
        }`}
      />
      {!collapsed && <span className="truncate text-left flex-1">{label}</span>}
    </button>
  );
};

export default SidebarNavItem;
