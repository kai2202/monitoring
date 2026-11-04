/**
 * Frontend/src/features/analytics/components/supplies/SuppliesDispatchForm.tsx
 *
 * Biểu mẫu nhập liệu Lập Phiếu Cấp Phát & Điều Động Vật Tư:
 * - Pre-filled box thông tin máy in & vật tư cảnh báo.
 * - Form nhập: Mức độ ưu tiên, Số lượng, Kỹ thuật viên, Ghi chú.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { ConsumableAlertItem } from '../../../../types/analyticsUI';

interface SuppliesDispatchFormProps {
  alertItem: ConsumableAlertItem;
  onSubmit: (payload: {
    alertItem: ConsumableAlertItem;
    priority: 'urgent' | 'normal';
    quantity: number;
    technician: string;
    notes: string;
  }) => void;
  onCancel: () => void;
}

export const SuppliesDispatchForm: React.FC<SuppliesDispatchFormProps> = ({
  alertItem,
  onSubmit,
  onCancel,
}) => {
  const [priority, setPriority] = useState<'urgent' | 'normal'>(
    alertItem.currentPercent < 15 ? 'urgent' : 'normal'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [technician, setTechnician] = useState<string>('Nguyễn Văn Tuấn (KTV Ca 1)');
  const [notes, setNotes] = useState<string>('Cấp phát thay thế định kỳ theo cảnh báo Days-to-Empty');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      alertItem,
      priority,
      quantity,
      technician,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Pre-filled Device Box */}
      <div
        style={{
          padding: '14px 16px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-subtle, #f8fafc)',
          border: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <strong style={{ fontSize: '13.5px', color: 'var(--text-primary, #0f172a)' }}>
            {alertItem.printerName}
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700 }}>
            {alertItem.model}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary, #475569)' }}>
          Vị trí: <strong>{alertItem.floor}</strong> ({alertItem.department})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '12px' }}>
          <span>Vật tư: <strong>{alertItem.itemName}</strong></span>
          <span style={{ color: alertItem.currentPercent < 15 ? '#ef4444' : '#f59e0b', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
            Còn {alertItem.currentPercent}% (~{alertItem.daysRemaining} ngày)
          </span>
        </div>
      </div>

      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>
            Mức độ ưu tiên
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-color, #e2e8f0)',
              fontSize: '12px',
              backgroundColor: 'var(--bg-card, #ffffff)',
            }}
          >
            <option value="urgent">Khẩn cấp (&lt; 15%)</option>
            <option value="normal">Tiêu chuẩn</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>
            Số lượng xuất
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-color, #e2e8f0)',
              fontSize: '12px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>
          Kỹ thuật viên phụ trách
        </label>
        <input
          type="text"
          value={technician}
          onChange={(e) => setTechnician(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border-color, #e2e8f0)',
            fontSize: '12px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary, #475569)', marginBottom: '4px' }}>
          Ghi chú xuất kho &amp; điều động
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border-color, #e2e8f0)',
            fontSize: '12px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color, #e2e8f0)',
            color: 'var(--text-muted, #64748b)',
            cursor: 'pointer',
          }}
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          style={{
            padding: '8px 18px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
          }}
        >
          Xác nhận tạo lệnh cấp phát
        </button>
      </div>
    </form>
  );
};

