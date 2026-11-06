/**
 * Frontend/src/pages/SettingsPage.tsx
 *
 * Phân hệ Cấu Hình Hệ Thống & Quản Trị Vận Hành (Settings & Rules):
 * - Tái cấu trúc chuẩn 4 Sub-tabs điều hướng góc phải trên cùng (Ảnh 1):
 *   1. Gateway & Kết nối: ZabbixLivePingCard + ZabbixStatusCard
 *   2. Người dùng & Phân quyền: UserRbacManagerCard
 *   3. Quy tắc & Ngưỡng cảnh báo: DynamicThresholdsCard + OperationalRulesCard
 *   4. Từ điển mã lỗi: ErrorDictionaryCard
 * - Tương thích URL deep-link qua React Router v6 (/settings/:subTab).
 * - Tuân thủ AGENTS.md Rule 7.1: FontAwesome duy nhất, < 300 LOC.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { settingsService } from '../services';
import { SystemSettings } from '../services/interfaces/ISettingsService';
import { PrinterErrorCode } from '../types/api';
import { NavTabId } from '../components/layout/Sidebar';
import { SettingsSubTab } from '../types/settings';
import {
  SettingsPageHeader,
  ZabbixStatusCard,
  ZabbixLivePingCard,
  UserRbacManagerCard,
  OperationalRulesCard,
  DynamicThresholdsCard,
  ErrorDictionaryCard,
} from '../features/settings/components';

export interface SettingsPageProps {
  activeSubTab?: SettingsSubTab;
  onSubTabChange?: (tab: SettingsSubTab) => void;
  onNavigateModule?: (tab: NavTabId) => void;
}

const VALID_TABS: SettingsSubTab[] = ['gateway', 'rbac', 'rules', 'dictionary'];

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
    return 'gateway';
  };

  const [activeTab, setActiveTab] = useState<SettingsSubTab>(getInitialTab);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
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
      const [settingsData, errData] = await Promise.all([
        settingsService.getSettings(),
        settingsService.getErrorDictionary(),
      ]);
      setSystemSettings(settingsData);
      setErrorDict(errData);
    } catch (err) {
      toast.error('Lỗi khi nạp dữ liệu cấu hình hệ thống từ máy chủ');
      console.error('Lỗi khi nạp dữ liệu cấu hình hệ thống:', err);
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
      {activeTab === 'gateway' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ZabbixLivePingCard
            zabbixConfig={systemSettings?.zabbix}
            onSyncComplete={loadSettingsData}
          />
          <ZabbixStatusCard
            apiUrl={systemSettings?.zabbix.apiUrl}
            fastPollInterval={
              systemSettings?.zabbix.fastPollIntervalSeconds ??
              systemSettings?.zabbix.pollIntervalSeconds ??
              60
            }
            slowPollInterval={(systemSettings?.zabbix.slowPollIntervalHours ?? 1) * 3600}
            isConnected={systemSettings?.zabbix.connectionStatus === 'Connected'}
          />
        </div>
      )}

      {activeTab === 'rbac' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <UserRbacManagerCard />
        </div>
      )}

      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <DynamicThresholdsCard initialThresholds={systemSettings?.thresholds} />
          <OperationalRulesCard />
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
