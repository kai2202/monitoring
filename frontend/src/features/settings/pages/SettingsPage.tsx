/**
 * Frontend/src/features/settings/pages/SettingsPage.tsx
 *
 * Phân hệ Cấu Hình Hệ Thống & Quản Trị Vận Hành (Settings):
 * - Tinh gọn 2 Sub-tabs điều hướng góc phải trên cùng:
 *   1. Người dùng & Phân quyền (RBAC): UserRbacManagerCard (Mặc định)
 *   2. Từ điển mã lỗi: ErrorDictionaryCard
 * - Tương thích URL deep-link qua React Router v6 (/settings/:subTab).
 * - Tuân thủ AGENTS.md Rule 7.1: FontAwesome duy nhất, < 300 LOC.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { settingsService } from '@/services';
import { PrinterErrorCode } from '@/types/api';
import { NavTabId } from '@/components/layout/Sidebar';
import { SettingsSubTab } from '@/types/settings';
import {
  SettingsPageHeader,
  UserRbacManagerCard,
  ErrorDictionaryCard,
} from '../components';

export interface SettingsPageProps {
  activeSubTab?: SettingsSubTab;
  onSubTabChange?: (tab: SettingsSubTab) => void;
  onNavigateModule?: (tab: NavTabId) => void;
}

const VALID_TABS: SettingsSubTab[] = ['rbac', 'dictionary'];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  activeSubTab: externalSubTab,
  onSubTabChange,
}) => {
  const { subTab: urlSubTab } = useParams<{ subTab?: string }>();
  const navigate = useNavigate();

  const getInitialTab = (): SettingsSubTab => {
    if (urlSubTab && VALID_TABS.includes(urlSubTab as SettingsSubTab)) {
      return urlSubTab as SettingsSubTab;
    }
    if (externalSubTab && VALID_TABS.includes(externalSubTab)) {
      return externalSubTab;
    }
    return 'rbac';
  };

  const [activeTab, setActiveTab] = useState<SettingsSubTab>(getInitialTab);
  const [errorDict, setErrorDict] = useState<PrinterErrorCode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Đồng bộ khi URL param thay đổi
  useEffect(() => {
    if (urlSubTab && VALID_TABS.includes(urlSubTab as SettingsSubTab)) {
      setActiveTab(urlSubTab as SettingsSubTab);
    }
  }, [urlSubTab]);

  const handleTabChange = useCallback(
    (tab: SettingsSubTab) => {
      setActiveTab(tab);
      navigate(`/settings/${tab}`);
      if (onSubTabChange) onSubTabChange(tab);
    },
    [navigate, onSubTabChange]
  );

  const loadSettingsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const errData = await settingsService.getErrorDictionary();
      setErrorDict(errData);
    } catch (err) {
      toast.error('Lỗi khi nạp dữ liệu từ điển mã lỗi từ máy chủ');
      console.error('Lỗi khi nạp dữ liệu từ điển mã lỗi:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  const handleRefresh = async () => {
    await loadSettingsData();
    toast.success('Đã làm mới toàn bộ dữ liệu cấu hình hệ thống');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* 1. Header chuẩn 2 hàng với Sub-tab Navigation (Góc Phải Trên Cùng) */}
      <SettingsPageHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {/* 2. Nội dung phân hệ chuyển đổi theo Sub-tab (Bento Density) */}
      {activeTab === 'rbac' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <UserRbacManagerCard />
        </div>
      )}

      {activeTab === 'dictionary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ErrorDictionaryCard
            errorDict={errorDict}
            isLoading={isLoading}
            onReloadDictionary={loadSettingsData}
          />
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
