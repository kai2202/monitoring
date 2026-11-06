/**
 * Frontend/src/features/settings/components/ZabbixLivePingCard.tsx
 *
 * Thẻ Kiểm Tra Kết Nối Trực Tiếp & Đồng Bộ Zabbix (Live Ping & Sync):
 * - Đo độ trễ thời gian thực (Ping Latency ms) và phiên bản máy chủ Zabbix 7.0 LTS.
 * - Tích hợp nút kích hoạt đồng bộ Zabbix Poller đồng bộ trực tiếp vào Redux Store.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  FontAwesomeIcon,
  faBolt,
  faRotate,
  faCircleCheck,
  faTriangleExclamation,
  faWifi,
  faCheck,
} from '../../../shared/icons';
import { settingsService, printerService } from '../../../services';
import { SystemSettings } from '../../../services/interfaces/ISettingsService';
import { startZabbixSync, finishZabbixSync } from '../../../app/slices/uiSlice';
import { RootState } from '../../../app/store';

export interface ZabbixLivePingCardProps {
  zabbixConfig?: SystemSettings['zabbix'];
  onSyncComplete?: () => void;
}

export const ZabbixLivePingCard: React.FC<ZabbixLivePingCardProps> = ({
  zabbixConfig,
  onSyncComplete,
}) => {
  const dispatch = useDispatch();
  const isSyncingZabbix = useSelector((state: RootState) => state.ui.isSyncingZabbix);
  const reduxLastSync = useSelector((state: RootState) => state.ui.lastSyncTime);

  const [isTesting, setIsTesting] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [zabbixVersion, setZabbixVersion] = useState<string | null>(zabbixConfig?.zabbixVersion ?? null);
  const [discoveredCount, setDiscoveredCount] = useState<number | null>(
    zabbixConfig?.discoveredHostsCount ?? null
  );
  const [isConnected, setIsConnected] = useState<boolean>(
    zabbixConfig?.connectionStatus === 'Connected'
  );
  const [testMessage, setTestMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!zabbixConfig) return;
    if (zabbixConfig.zabbixVersion !== undefined) setZabbixVersion(zabbixConfig.zabbixVersion);
    if (zabbixConfig.discoveredHostsCount !== undefined) {
      setDiscoveredCount(zabbixConfig.discoveredHostsCount);
    }
    setIsConnected(zabbixConfig.connectionStatus === 'Connected');
  }, [zabbixConfig]);

  const effectiveLastSync = reduxLastSync || zabbixConfig?.lastSyncTime || null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await settingsService.testZabbixConnection();
      setIsConnected(Boolean(res.success));
      setLatencyMs(typeof res.latencyMs === 'number' ? res.latencyMs : null);
      if (res.zabbixVersion !== undefined) setZabbixVersion(res.zabbixVersion ?? null);
      if (typeof res.discoveredHostsCount === 'number') {
        setDiscoveredCount(res.discoveredHostsCount);
      }
      setTestMessage(res.message);
      if (res.success) {
        toast.success('Kiểm tra kết nối Zabbix thành công!', {
          description: `Độ trễ: ${res.latencyMs ?? '—'}ms • Phiên bản: ${res.zabbixVersion || '—'}`,
        });
      } else {
        toast.error('Chưa thể xác thực kết nối Zabbix', {
          description: res.message,
        });
      }
    } catch (err: any) {
      setIsConnected(false);
      setLatencyMs(null);
      toast.error(err?.message || 'Lỗi khi kiểm tra kết nối tới máy chủ Zabbix');
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualSync = async () => {
    if (isSyncingZabbix) return;
    dispatch(startZabbixSync());
    try {
      const res = await printerService.syncPrinters();
      setDiscoveredCount(res.syncedCount);
      if (onSyncComplete) onSyncComplete();
      toast.success('Đã đồng bộ dữ liệu từ Zabbix Gateway!', {
        description: `Cập nhật thành công ${res.syncedCount} máy in lúc ${new Date(res.timestamp).toLocaleTimeString('vi-VN')}.`,
      });
    } catch (err: any) {
      toast.error(err?.message || 'Đồng bộ dữ liệu Zabbix thất bại');
    } finally {
      dispatch(finishZabbixSync());
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-card, 20px)',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      }}
    >
      {/* 1. Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}
          >
            <FontAwesomeIcon icon={faWifi} style={{ fontSize: '18px' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
                Chẩn Đoán Kết Nối &amp; Đồng Bộ Thời Gian Thực
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: isConnected ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.12)',
                  color: isConnected ? '#16a34a' : '#d97706',
                }}
              >
                <FontAwesomeIcon icon={isConnected ? faCircleCheck : faTriangleExclamation} style={{ fontSize: '11px' }} />
                <span>{isConnected ? '200 OK' : 'Chưa xác minh'}</span>
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0' }}>
              Đo độ trễ phản hồi JSON-RPC và kích hoạt cào dữ liệu SNMP thủ công tức thì
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-subtle, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: isTesting ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FontAwesomeIcon icon={faBolt} style={{ fontSize: '12px', color: '#2563eb' }} />
            <span>{isTesting ? 'Đang đo ping...' : 'Kiểm tra Ping'}</span>
          </button>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncingZabbix}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              backgroundColor: isSyncingZabbix ? '#94a3b8' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: isSyncingZabbix ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
            }}
          >
            <FontAwesomeIcon
              icon={faRotate}
              style={{
                fontSize: '11px',
                animation: isSyncingZabbix ? 'spin 1s linear infinite' : 'none',
              }}
            />
            <span>{isSyncingZabbix ? 'Đang đồng bộ...' : 'Đồng bộ Zabbix ngay'}</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics 4 ô */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Độ Trễ Phản Hồi (Ping)</div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: latencyMs === null ? 'var(--text-muted, #64748b)' : latencyMs < 60 ? '#16a34a' : '#d97706', marginTop: '4px' }}>
            {latencyMs !== null ? `${latencyMs} ms` : '—'}
          </div>
          <div style={{ fontSize: '10.5px', color: latencyMs === null ? 'var(--text-muted, #64748b)' : '#16a34a', marginTop: '2px', fontWeight: 600 }}>
            {latencyMs === null ? 'Bấm Kiểm tra Ping để đo' : latencyMs < 60 ? 'Phản hồi nhanh (LAN)' : 'Độ trễ mạng trung bình'}
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Phiên Bản Zabbix</div>
          <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary, #0f172a)', marginTop: '4px' }}>
            {zabbixVersion || '—'}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
            {zabbixVersion ? 'JSON-RPC Đã xác thực' : 'Chưa có dữ liệu'}
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Thiết Bị Trong Danh Bạ</div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: '#2563eb', marginTop: '4px' }}>
            {discoveredCount !== null ? `${discoveredCount} máy in` : '—'}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)', marginTop: '2px', fontWeight: 600 }}>
            {discoveredCount !== null ? 'Đồng bộ cơ sở dữ liệu' : 'Chưa có dữ liệu'}
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Đồng Bộ Lần Cuối</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '8px' }}>
            {effectiveLastSync ? new Date(effectiveLastSync).toLocaleTimeString('vi-VN') : 'Chưa đồng bộ'}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
            Chu kỳ tự động {zabbixConfig?.pollIntervalSeconds || 60}s
          </div>
        </div>
      </div>

      {testMessage && (
        <div style={{ fontSize: '12px', color: 'var(--text-secondary, #475569)', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FontAwesomeIcon icon={isConnected ? faCheck : faTriangleExclamation} style={{ color: isConnected ? '#16a34a' : '#d97706', fontSize: '12px' }} />
          <span>{testMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ZabbixLivePingCard;

