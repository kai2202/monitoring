/**
 * Frontend/src/features/analytics/components/supplies/FleetSuppliesPillCards.tsx
 *
 * Biểu đồ Mức Vật Tư Hạm Đội với Pill Progress Indicators (Segmented Pills):
 * - Thay thế thanh ngang cũ bằng các thanh nhộng gọn gàng cho từng thành phần (CMYK, Drum, Fuser).
 * - Làm mềm các góc bo (rounded-2xl/rounded-xl), tối ưu hóa whitespace và màu sắc dịu mắt.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { PrinterConsumablesOverview } from '../../../../types/analyticsUI';

interface FleetSuppliesPillCardsProps {
  printers: PrinterConsumablesOverview[];
}

interface SupplyTrack {
  key: string;
  label: string;
  value: number;
  color: string;
}

export const FleetSuppliesPillCards: React.FC<FleetSuppliesPillCardsProps> = ({ printers }) => {
  return (
    <div
      style={{
        padding: '24px 26px',
        borderRadius: '24px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header & Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                boxShadow: '0 0 8px rgba(37, 99, 235, 0.5)',
              }}
            />
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              Mức Vật Tư Hạm Đội Máy Tải Cao (Segmented Pill Indicators)
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0' }}>
            Chỉ số dạng thanh nhộng chuẩn xác cho 6 thành phần: Mực CMYK, Trống (Drum), Cụm sấy (Fuser)
          </p>
        </div>

        {/* Chú giải */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '11.5px' }}>
          {[
            { label: 'K', color: '#0f172a' },
            { label: 'C', color: '#06b6d4' },
            { label: 'M', color: '#ec4899' },
            { label: 'Y', color: '#eab308' },
            { label: 'Drum', color: '#8b5cf6' },
            { label: 'Fuser', color: '#f97316' },
          ].map((c) => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: c.color }} />
              <span style={{ color: 'var(--text-secondary, #475569)', fontWeight: 600 }}>{c.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span style={{ color: '#ef4444', fontWeight: 700 }}>&lt; 15%</span>
          </div>
        </div>
      </div>

      {/* Grid danh sách máy in với Pill Progress Indicators */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
        }}
      >
        {printers.map((printer) => {
          const tracks: SupplyTrack[] = [
            { key: 'K', label: 'Toner K', value: printer.tonerK, color: '#0f172a' },
            { key: 'C', label: 'Toner C', value: printer.tonerC, color: '#06b6d4' },
            { key: 'M', label: 'Toner M', value: printer.tonerM, color: '#ec4899' },
            { key: 'Y', label: 'Toner Y', value: printer.tonerY, color: '#eab308' },
            { key: 'Drum', label: 'Drum', value: printer.drumLife, color: '#8b5cf6' },
            { key: 'Fuser', label: 'Fuser', value: printer.fuserLife, color: '#f97316' },
          ];

          return (
            <div
              key={printer.printerId}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px 18px',
                borderRadius: '18px',
                backgroundColor: 'var(--bg-subtle, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.18s ease',
              }}
            >
              {/* Header Máy in */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}>
                    {printer.printerName}
                  </strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
                    {printer.model} • {printer.floor} ({printer.department})
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {printer.totalMonthlyVolume.toLocaleString('vi-VN')} trang
                </span>
              </div>

              {/* 6 Pill Indicators in 2 columns */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                {tracks.map((t) => {
                  const isCritical = t.value < 15;
                  const isWarning = t.value >= 15 && t.value < 25;

                  return (
                    <div
                      key={t.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        padding: '8px 10px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-card, #ffffff)',
                        border: isCritical
                          ? '1px solid rgba(239, 68, 68, 0.4)'
                          : isWarning
                          ? '1px solid rgba(245, 158, 11, 0.3)'
                          : '1px solid var(--border-color, #e2e8f0)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '2px',
                              backgroundColor: t.color,
                            }}
                          />
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #475569)' }}>
                            {t.label}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: isCritical ? '#ef4444' : isWarning ? '#d97706' : 'var(--text-primary, #0f172a)',
                          }}
                        >
                          {t.value}%
                        </span>
                      </div>

                      {/* Pill Progress Bar Capsule */}
                      <div
                        style={{
                          height: '6px',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          overflow: 'hidden',
                          width: '100%',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.max(3, Math.min(100, t.value))}%`,
                            height: '100%',
                            backgroundColor: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : t.color,
                            borderRadius: '9999px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

