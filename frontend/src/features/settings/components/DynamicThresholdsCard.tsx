/**
 * Frontend/src/features/settings/components/DynamicThresholdsCard.tsx
 *
 * Thẻ Cấu Hình Ngưỡng Cảnh Báo Động (Dynamic Alert Thresholds):
 * - Cho phép Admin thiết lập ngưỡng cảnh báo Mực in, Dự báo ngày cạn, Nhiệt độ sấy và Tỷ lệ kẹt giấy.
 * - Lưu trữ cấu hình an toàn vào LocalStorage, phát thông báo phản hồi qua sonner toast.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  FontAwesomeIcon,
  faFloppyDisk,
  faRotate,
  faFire,
  faTriangleExclamation,
  faBox,
  faCheck,
} from '../../../shared/icons';
import { settingsService } from '../../../services';
import { DynamicThresholds } from '../../../types/settings';

const DEFAULT_THRESHOLDS: DynamicThresholds = {
  tonerWarningPercent: 15,
  tonerCriticalPercent: 5,
  daysUntilEmptyWarning: 7,
  maxFuserTempCelsius: 215,
  maxJamRatePercent: 1.5,
};

const STORAGE_KEY = 'fleetmonitor_dynamic_thresholds';

export interface DynamicThresholdsCardProps {
  initialThresholds?: DynamicThresholds;
}

export const DynamicThresholdsCard: React.FC<DynamicThresholdsCardProps> = ({ initialThresholds }) => {
  const [thresholds, setThresholds] = useState<DynamicThresholds>(() => {
    if (initialThresholds) return initialThresholds;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_THRESHOLDS;
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialThresholds) {
      setThresholds(initialThresholds);
    }
  }, [initialThresholds]);

  const handleSave = async () => {
    try {
      await settingsService.updateSettings({ thresholds });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(thresholds));
      setIsSaved(true);
      toast.success('Đã lưu cấu hình ngưỡng cảnh báo lên máy chủ!', {
        description: `Mực thấp: <${thresholds.tonerWarningPercent}% • Nguy cấp: <${thresholds.tonerCriticalPercent}%`,
      });
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu cấu hình ngưỡng cảnh báo lên máy chủ');
    }
  };

  const handleReset = async () => {
    setThresholds(DEFAULT_THRESHOLDS);
    try {
      await settingsService.updateSettings({ thresholds: DEFAULT_THRESHOLDS });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_THRESHOLDS));
      toast.info('Đã khôi phục các ngưỡng cảnh báo về mặc định của nhà sản xuất.');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể khôi phục cấu hình mặc định trên máy chủ');
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
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
            }}
          >
            <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
              Ngưỡng Cảnh Báo Động &amp; Dự Báo Tiêu Hao
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0' }}>
              Quy định điều kiện kích hoạt cảnh báo vàng/đỏ cho vật tư tiêu hao và an toàn phần cứng
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-subtle, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              color: 'var(--text-secondary, #475569)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <FontAwesomeIcon icon={faRotate} style={{ fontSize: '11px' }} />
            <span>Mặc định</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              backgroundColor: isSaved ? '#16a34a' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <FontAwesomeIcon icon={isSaved ? faCheck : faFloppyDisk} style={{ fontSize: '11px' }} />
            <span>{isSaved ? 'Đã lưu' : 'Lưu cấu hình'}</span>
          </button>
        </div>
      </div>

      {/* 2. Grid thiết lập ngưỡng */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Ngưỡng 1: Mực thấp (Warning) */}
        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FontAwesomeIcon icon={faBox} style={{ color: '#f59e0b', fontSize: '12px' }} />
              <span>Cảnh báo Mực Thấp (Vàng):</span>
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#d97706' }}>
              &lt; {thresholds.tonerWarningPercent}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="30"
            step="1"
            value={thresholds.tonerWarningPercent}
            onChange={(e) => setThresholds({ ...thresholds, tonerWarningPercent: Number(e.target.value) })}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#f59e0b' }}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
            Kích hoạt trạng thái cần đặt hàng vật tư bổ sung khi dung lượng mực giảm xuống dưới ngưỡng.
          </div>
        </div>

        {/* Ngưỡng 2: Mực nguy cấp (Critical) */}
        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#ef4444', fontSize: '12px' }} />
              <span>Cảnh báo Nguy Cấp (Đỏ):</span>
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#ef4444' }}>
              &lt; {thresholds.tonerCriticalPercent}%
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="10"
            step="1"
            value={thresholds.tonerCriticalPercent}
            onChange={(e) => setThresholds({ ...thresholds, tonerCriticalPercent: Number(e.target.value) })}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#ef4444' }}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
            Đẩy cảnh báo đỏ lên Dashboard và kích hoạt lệnh thay mực khẩn cấp cho kỹ thuật viên.
          </div>
        </div>

        {/* Ngưỡng 3: Dự báo ngày cạn */}
        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
              Dự Báo Số Ngày Cạn Mực:
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#2563eb' }}>
              &lt; {thresholds.daysUntilEmptyWarning} ngày
            </span>
          </div>
          <input
            type="range"
            min="3"
            max="21"
            step="1"
            value={thresholds.daysUntilEmptyWarning}
            onChange={(e) => setThresholds({ ...thresholds, daysUntilEmptyWarning: Number(e.target.value) })}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
            Cảnh báo trước để nhân viên hành chính chuẩn bị hộp mực dự phòng trước khi máy dừng in.
          </div>
        </div>

        {/* Ngưỡng 4: Nhiệt độ cụm sấy tối đa */}
        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FontAwesomeIcon icon={faFire} style={{ color: '#ef4444', fontSize: '12px' }} />
              <span>Nhiệt Độ Cụm Sấy Tối Đa:</span>
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#ef4444' }}>
              {thresholds.maxFuserTempCelsius}°C
            </span>
          </div>
          <input
            type="range"
            min="190"
            max="235"
            step="1"
            value={thresholds.maxFuserTempCelsius}
            onChange={(e) => setThresholds({ ...thresholds, maxFuserTempCelsius: Number(e.target.value) })}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#ef4444' }}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
            Ngưỡng an toàn chống cháy nổ rơ-le nhiệt (Fuser Overheat Protection).
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicThresholdsCard;

