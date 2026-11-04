/**
 * Frontend/src/components/layout/AppShell.tsx
 *
 * Khung cấu trúc giao diện chính (Master Layout Shell) của FleetMonitor.
 * - Sidebar bên trái (có thể thu gọn/mở rộng).
 * - Header cố định trên cùng.
 * - Viewport nội dung chính (hỗ trợ cuộn độc lập, padding thoáng đãng).
 */

import React, { useState } from 'react';
import { Sidebar, NavTabId } from './Sidebar';
import { Header } from './Header';
import { useTheme } from '../../hooks/useTheme';

export interface AppShellProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onSelectTab,
  children,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      {/* Main Content Area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Header
          activeTab={activeTab}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onManualRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
        />

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            position: 'relative',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

