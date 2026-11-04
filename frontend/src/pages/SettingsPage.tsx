/**
 * Frontend/src/pages/SettingsPage.tsx
 *
 * Phân hệ Cấu hình Hệ thống & Quy tắc Vận hành (Settings & Rules):
 * - Tách nhỏ thành các component con dưới 300 dòng:
 *   1. ZabbixConfigForm (React Hook Form + Zod validation)
 *   2. OperationalRulesCard (Quy tắc Safe Window, Critical Protection, Cache TTL)
 *   3. ErrorDictionaryCard (Từ điển tra cứu mã lỗi phần cứng đa hãng)
 * - Tuân thủ AGENTS.md Rule 7.1: FontAwesome duy nhất, < 300 LOC.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon, faGear, faRotate } from '../shared/icons';
import { settingsService } from '../services';
import { MockErrorCode } from '../mocks/mockSettings';
import { NavTabId } from '../components/layout/Sidebar';
import { OperationalRulesCard } from '../features/settings/components/OperationalRulesCard';
import { ErrorDictionaryCard } from '../features/settings/components/ErrorDictionaryCard';
import { ZabbixConfigForm } from '../features/settings/components/ZabbixConfigForm';

export interface SettingsPageProps {
  onNavigateModule?: (tab: NavTabId) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = () => {
  const [errorDict, setErrorDict] = useState<MockErrorCode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSettingsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const errData = await settingsService.getErrorDictionary();
      setErrorDict(errData);
    } catch (err) {
      console.error('Lỗi khi nạp dữ liệu từ điển lỗi:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header Card */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <FontAwesomeIcon icon={faGear} style={{ fontSize: '18px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Cấu Hình Hệ Thống &amp; Từ Điển Mã Lỗi
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Quản lý kết nối Zabbix, quy tắc tự động đóng sự cố NOC và tra cứu mã lỗi đa thương hiệu
            </p>
          </div>
        </div>

        <button
          onClick={loadSettingsData}
          disabled={isLoading}
          style={{
            padding: '7px 16px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <FontAwesomeIcon icon={faRotate} style={{ fontSize: '12px', animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* 2. Form Cấu Hình Zabbix API (React Hook Form + Zod) */}
      <ZabbixConfigForm onSave={(data) => console.log('Saved Zabbix Config:', data)} />

      {/* 3. Quy Tắc Vận Hành & Tự Động Đóng Sự Cố */}
      <OperationalRulesCard />

      {/* 4. Từ Điển Mã Lỗi Phần Cứng Đa Hãng */}
      <ErrorDictionaryCard errorDict={errorDict} isLoading={isLoading} />
    </div>
  );
};

export default SettingsPage;
