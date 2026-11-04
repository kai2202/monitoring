/**
 * Frontend/src/features/dashboard/components/diagnostics/DiagnosticsCmykTab.tsx
 *
 * Tab Chẩn Đoán & Vật Tư CMYK trong Diagnostics Drawer:
 * - Thước đo mực CMYK, hộp mực thải, thông số phần cứng SNMP.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faBox,
  faChartLine,
  faTriangleExclamation,
  faShieldCheck,
} from '../../../../shared/icons';
import { Printer } from '../../../../types/printer';

interface DiagnosticsCmykTabProps {
  printer: Printer;
}

export const DiagnosticsCmykTab: React.FC<DiagnosticsCmykTabProps> = ({ printer }) => {
  const supplies = printer.supplies || { cyan: null, magenta: null, yellow: null, black: null, waste: null };

  const cmykTracks = [
    { label: 'Cyan (Xanh)', val: supplies.cyan, color: '#06b6d4' },
    { label: 'Magenta (Hồng)', val: supplies.magenta, color: '#ec4899' },
    { label: 'Yellow (Vàng)', val: supplies.yellow, color: '#eab308' },
    { label: 'Black (Đen)', val: supplies.black, color: '#0f172a' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 24px' }}>
      {/* 1. CMYK Meter Gauges */}
      <div
        style={{
          padding: '18px 20px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FontAwesomeIcon icon={faBox} style={{ fontSize: '15px', color: '#2563eb' }} />
          <h4 style={{ fontSize: '13.5px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            Mức Vật Tư &amp; Hộp Mực (Toner Levels)
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {cmykTracks.map((t) => {
            const hasVal = t.val !== null;
            const pct = hasVal ? Math.max(0, Math.min(100, t.val!)) : 0;
            const isLow = hasVal && pct < 15;

            return (
              <div key={t.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary, #475569)' }}>{t.label}</span>
                  <strong style={{ color: isLow ? '#ef4444' : 'var(--text-primary, #0f172a)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {hasVal ? `${pct}%` : '—'}
                  </strong>
                </div>
                <div style={{ height: '8px', borderRadius: '9999px', backgroundColor: 'var(--bg-subtle, #f8fafc)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: isLow ? '#ef4444' : t.color,
                      borderRadius: '9999px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Waste box */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle, #f8fafc)', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary, #475569)' }}>Hộp mực thải (Waste Toner Box):</span>
          <strong style={{ color: supplies.waste && supplies.waste > 85 ? '#ef4444' : '#16a34a' }}>
            {supplies.waste != null ? `${supplies.waste}%` : 'OK'}
          </strong>
        </div>
      </div>

      {/* 2. Active Alerts or Error */}
      <div
        style={{
          padding: '18px 20px',
          borderRadius: '16px',
          backgroundColor: printer.alertMessage ? 'rgba(254, 242, 242, 0.45)' : 'var(--bg-card, #ffffff)',
          border: printer.alertMessage ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {printer.alertMessage ? (
            <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: '15px', color: '#ef4444' }} />
          ) : (
            <FontAwesomeIcon icon={faShieldCheck} style={{ fontSize: '15px', color: '#16a34a' }} />
          )}
          <h4 style={{ fontSize: '13.5px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            Trạng Thái Lỗi Phần Cứng (Hardware Status)
          </h4>
        </div>
        <p style={{ fontSize: '12px', color: printer.alertMessage ? '#dc2626' : 'var(--text-muted, #64748b)', margin: 0 }}>
          {printer.alertMessage || 'Không phát hiện mã lỗi phần cứng nào từ Zabbix.'}
        </p>
      </div>

      {/* 3. Hardware Specs */}
      <div
        style={{
          padding: '18px 20px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FontAwesomeIcon icon={faChartLine} style={{ fontSize: '15px', color: '#0891b2' }} />
          <h4 style={{ fontSize: '13.5px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            Thông Số Thiết Bị (Device Specifications)
          </h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
          <div>Hãng: <strong>{printer.mfr || 'HP'}</strong></div>
          <div>Dòng máy: <strong>{printer.model}</strong></div>
          <div>Serial: <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{printer.serial || '—'}</strong></div>
          <div>Loại in: <strong>{printer.colorCapability || 'Đa sắc'}</strong></div>
          <div>Tổng số trang in: <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{printer.pageCounter ? printer.pageCounter.toLocaleString('vi-VN') : '—'}</strong></div>
          <div>Lần quét cuối: <strong>{printer.lastScrape ? new Date(printer.lastScrape).toLocaleTimeString('vi-VN') : 'Vừa xong'}</strong></div>
        </div>
      </div>
    </div>
  );
};

