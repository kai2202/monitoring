/**
 * Frontend/src/components/layout/AppShell.tsx
 *
 * Khung cấu trúc giao diện chính (Master Layout Shell) của FleetMonitor.
 * - Sidebar bên trái (có thể thu gọn/mở rộng).
 * - Header cố định trên cùng.
 * - Viewport nội dung chính (hỗ trợ cuộn độc lập, padding thoáng đãng).
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../../app/store';
import { startZabbixSync, finishZabbixSync } from '../../app/slices/uiSlice';
import { Sidebar, NavTabId } from './Sidebar';
import { Header } from './Header';
import { useTheme } from '../../hooks/useTheme';
import { printerService } from '../../services';

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
  const dispatch = useDispatch();
  const { isSyncingZabbix, lastSyncTime } = useSelector((state: RootState) => state.ui);
  const { isDark, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleManualRefresh = async () => {
    dispatch(startZabbixSync());
    try {
      const res = await printerService.syncPrinters();
      if (res.success) {
        toast.success(`Đã đồng bộ dữ liệu ${res.syncedCount} máy in từ Zabbix Gateway`);
      } else {
        toast.error('Chưa thể đồng bộ dữ liệu từ máy chủ Zabbix');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi kết nối khi đồng bộ dữ liệu Zabbix');
    } finally {
      dispatch(finishZabbixSync());
    }
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
          isRefreshing={isSyncingZabbix}
          lastSyncTime={lastSyncTime}
        />

        <main
          className="custom-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: 'clamp(12px, 1.8vw, 24px)',
            position: 'relative',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

