/**
 * Frontend/src/features/dashboard/components/workorder/TimeDurationPicker.tsx
 *
 * Cặp ô nhập [Giờ] + [Phút] kèm các nút bấm nhanh (+15p, +30p, +45p, +1h, ↺ 0):
 * - Hỗ trợ nhập độc lập giờ và phút cho kỹ thuật viên.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';

export function formatDurationVi(hours: number | null | undefined): string {
  if (hours == null || isNaN(hours)) return '—';
  if (hours === 0) return '0p';
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}p`;
  if (h > 0) return `${h}h`;
  return `${m}p`;
}

export interface TimeDurationPickerProps {
  label?: string;
  hours: number;
  minutes: number;
  onChangeHours: (h: number) => void;
  onChangeMinutes: (m: number) => void;
  compact?: boolean;
}

export const TimeDurationPicker: React.FC<TimeDurationPickerProps> = ({
  label,
  hours,
  minutes,
  onChangeHours,
  onChangeMinutes,
  compact = false,
}) => {
  const quickAdd = (addMins: number) => {
    const total = Math.max(0, (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes) + addMins);
    onChangeHours(Math.floor(total / 60));
    onChangeMinutes(total % 60);
  };

  const resetZero = () => {
    onChangeHours(0);
    onChangeMinutes(0);
  };

  const handleBlur = () => {
    const total = Math.max(0, (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes));
    onChangeHours(Math.floor(total / 60));
    onChangeMinutes(total % 60);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      {label && (
        <span style={{ fontSize: compact ? '10px' : '11px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
          {label}
        </span>
      )}

      {/* Cặp ô nhập [Giờ] + [Phút] */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1 }}>
          <input
            type="number"
            min="0"
            value={hours === 0 ? '0' : hours}
            onChange={(e) => onChangeHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
            onBlur={handleBlur}
            style={{
              width: '100%',
              minWidth: '40px',
              padding: compact ? '4px 6px' : '5px 8px',
              fontSize: compact ? '11.5px' : '12.5px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              borderRadius: '6px',
              border: '1px solid var(--border-color, #e2e8f0)',
              backgroundColor: 'var(--bg-card, #ffffff)',
              color: 'var(--text-primary, #0f172a)',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary, #475569)', fontWeight: 600 }}>giờ</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1 }}>
          <input
            type="number"
            min="0"
            value={minutes === 0 ? '0' : minutes}
            onChange={(e) => onChangeMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
            onBlur={handleBlur}
            style={{
              width: '100%',
              minWidth: '40px',
              padding: compact ? '4px 6px' : '5px 8px',
              fontSize: compact ? '11.5px' : '12.5px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              borderRadius: '6px',
              border: '1px solid var(--border-color, #e2e8f0)',
              backgroundColor: 'var(--bg-card, #ffffff)',
              color: 'var(--text-primary, #0f172a)',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary, #475569)', fontWeight: 600 }}>phút</span>
        </div>
      </div>

      {/* Hàng nút bấm chọn nhanh (+15p, +30p, +45p, +1h, ↺ 0) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap', marginTop: '2px' }}>
        {[
          { label: '+15p', mins: 15 },
          { label: '+30p', mins: 30 },
          { label: '+45p', mins: 45 },
          { label: '+1h', mins: 60 },
        ].map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={() => quickAdd(btn.mins)}
            style={{
              padding: '1px 5px',
              fontSize: '10px',
              fontWeight: 600,
              borderRadius: '4px',
              backgroundColor: 'var(--bg-subtle, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              color: 'var(--text-secondary, #475569)',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
            title={`Cộng dồn ${btn.label}`}
          >
            {btn.label}
          </button>
        ))}
        <button
          type="button"
          onClick={resetZero}
          style={{
            padding: '1px 5px',
            fontSize: '10px',
            fontWeight: 600,
            borderRadius: '4px',
            backgroundColor: 'transparent',
            border: '1px dashed var(--border-color, #e2e8f0)',
            color: 'var(--text-muted, #64748b)',
            cursor: 'pointer',
          }}
          title="Đặt lại về 0"
        >
          ↺ 0
        </button>
      </div>
    </div>
  );
};

