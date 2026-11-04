/**
 * Frontend/src/features/dashboard/components/attention/AttentionCmykMiniBar.tsx
 *
 * Thanh Hiển Thị Mức Mực Trực Quan cho Bảng Thiết Bị Cần Xử Lý:
 * - Phân biệt rõ 2 loại máy:
 *   1. Máy in đơn sắc (Monochrome): 1 chấm đen duy nhất + chỉ số % mực đen (⚫ 85% kèm tooltip: Mực đen K: 85%).
 *   2. Máy in màu (Color MFP): 4 vạch thanh đứng siêu nhỏ đại diện cho K - C - M - Y.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { Printer } from '../../../../types/printer';

interface AttentionCmykMiniBarProps {
  printer: Printer;
}

export const AttentionCmykMiniBar: React.FC<AttentionCmykMiniBarProps> = ({ printer }) => {
  const supplies = printer.supplies || {
    black: null,
    cyan: null,
    magenta: null,
    yellow: null,
    waste: null,
  };

  const isColor =
    printer.colorCapability === 'Color' ||
    printer.deviceType === 'Color MFP' ||
    (supplies.cyan !== null && supplies.cyan !== undefined) ||
    (supplies.magenta !== null && supplies.magenta !== undefined) ||
    (supplies.yellow !== null && supplies.yellow !== undefined);

  // --- TRƯỜNG HỢP 1: MÁY IN ĐƠN SẮC (MONOCHROME) ---
  if (!isColor) {
    const kVal = supplies.black;
    const isUnsupported = kVal === null || kVal === undefined;
    const isCritical = !isUnsupported && kVal < 15;

    const tooltipText = isUnsupported
      ? 'Mực đen K: Chưa có dữ liệu'
      : `Mực đen K: ${kVal}%`;

    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'default',
        }}
        title={tooltipText}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isCritical ? '#ef4444' : isUnsupported ? '#94a3b8' : '#0f172a',
            boxShadow: isCritical ? '0 0 4px rgba(239, 68, 68, 0.5)' : 'none',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '11.5px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            color: isCritical
              ? '#ef4444'
              : isUnsupported
              ? 'var(--text-muted, #94a3b8)'
              : 'var(--text-primary, #0f172a)',
          }}
        >
          {isUnsupported ? '—' : `${kVal}%`}
        </span>
      </div>
    );
  }

  // --- TRƯỜNG HỢP 2: MÁY IN MÀU (COLOR MFP - CÓ C, M, Y) ---
  const cmykBars = [
    { key: 'K', label: 'Mực đen (K)', val: supplies.black, color: '#0f172a', shortLabel: 'K' },
    { key: 'C', label: 'Mực xanh (C)', val: supplies.cyan, color: '#06b6d4', shortLabel: 'C' },
    { key: 'M', label: 'Mực đỏ (M)', val: supplies.magenta, color: '#ec4899', shortLabel: 'M' },
    { key: 'Y', label: 'Mực vàng (Y)', val: supplies.yellow, color: '#eab308', shortLabel: 'Y' },
  ];

  const validValues = cmykBars
    .map((b) => b.val)
    .filter((v): v is number => typeof v === 'number');
  const minVal = validValues.length > 0 ? Math.min(...validValues) : null;
  const hasCritical = validValues.some((v) => v < 15);

  const aggregateTooltip = `Mực màu (CMYK):\n• K: ${supplies.black != null ? `${supplies.black}%` : 'Chưa có'}\n• C: ${supplies.cyan != null ? `${supplies.cyan}%` : 'Chưa có'}\n• M: ${supplies.magenta != null ? `${supplies.magenta}%` : 'Chưa có'}\n• Y: ${supplies.yellow != null ? `${supplies.yellow}%` : 'Chưa có'}`;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'default',
      }}
      title={aggregateTooltip}
    >
      {/* 4 vạch thanh đứng siêu nhỏ K - C - M - Y */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
        {cmykBars.map((bar) => {
          const val = bar.val;
          const isUnsupported = val === null || val === undefined;
          const isBarCritical = !isUnsupported && val < 15;
          const fillHeight = isUnsupported ? 0 : Math.max(8, Math.min(100, val));

          return (
            <div
              key={bar.key}
              title={`${bar.label}: ${isUnsupported ? 'Chưa có dữ liệu' : `${val}%`}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5px',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '5px',
                  height: '18px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--bg-subtle, #f1f5f9)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                {!isUnsupported ? (
                  <div
                    style={{
                      width: '100%',
                      height: `${fillHeight}%`,
                      backgroundColor: isBarCritical ? '#ef4444' : bar.color,
                      borderRadius: '1px',
                      transition: 'height 0.3s ease',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '2px',
                      backgroundColor: '#cbd5e1',
                      alignSelf: 'center',
                      marginBottom: '7px',
                    }}
                  />
                )}
              </div>
              <span style={{ fontSize: '6.5px', fontWeight: 800, color: 'var(--text-muted, #94a3b8)', lineHeight: 1 }}>
                {bar.shortLabel}
              </span>
            </div>
          );
        })}
      </div>

      <span
        style={{
          fontSize: '11px',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          color: hasCritical ? '#ef4444' : 'var(--text-primary, #0f172a)',
        }}
      >
        {minVal !== null ? `${minVal}%` : '—'}
      </span>
    </div>
  );
};
