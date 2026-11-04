/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderTimeCostCard.tsx
 *
 * Khối Bảng Thống Kê & Dự Toán Thời Gian, Chi Phí (Time & Cost Table):
 * - Hỗ trợ xem thực tế và chỉnh sửa trực tiếp.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faClock } from '../../../../shared/icons';
import { TimeAndCostSummary } from '../../../../types/task';
import { TimeDurationPicker, formatDurationVi } from './TimeDurationPicker';

interface WorkOrderTimeCostCardProps {
  timeAndCost: TimeAndCostSummary;
  estimatedTimeAndCost?: TimeAndCostSummary;
  onSaveTimeCost?: (updated: TimeAndCostSummary) => void;
}

export const WorkOrderTimeCostCard: React.FC<WorkOrderTimeCostCardProps> = ({
  timeAndCost,
  estimatedTimeAndCost,
  onSaveTimeCost,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // States khi chỉnh sửa
  const [editRepairH, setEditRepairH] = useState(() =>
    timeAndCost.repairTimeHours != null ? Math.floor(timeAndCost.repairTimeHours) : 0
  );
  const [editRepairM, setEditRepairM] = useState(() =>
    timeAndCost.repairTimeHours != null ? Math.round((timeAndCost.repairTimeHours % 1) * 60) : 0
  );
  const [editWaitH, setEditWaitH] = useState(() =>
    timeAndCost.waitingTimeHours != null ? Math.floor(timeAndCost.waitingTimeHours) : 0
  );
  const [editWaitM, setEditWaitM] = useState(() =>
    timeAndCost.waitingTimeHours != null ? Math.round((timeAndCost.waitingTimeHours % 1) * 60) : 0
  );
  const [editLaborCost, setEditLaborCost] = useState(() =>
    timeAndCost.laborCostVnd != null ? String(timeAndCost.laborCostVnd) : ''
  );
  const [editPartsCost, setEditPartsCost] = useState(() =>
    timeAndCost.partsCostVnd != null ? String(timeAndCost.partsCostVnd) : ''
  );

  const handleSave = () => {
    const totalRepairHours = editRepairH + editRepairM / 60;
    const totalWaitHours = editWaitH + editWaitM / 60;
    const labor = editLaborCost ? parseFloat(editLaborCost) || null : null;
    const parts = editPartsCost ? parseFloat(editPartsCost) || null : null;
    const totalCost = (labor || 0) + (parts || 0) || null;

    if (onSaveTimeCost) {
      onSaveTimeCost({
        repairTimeHours: totalRepairHours > 0 ? Number(totalRepairHours.toFixed(2)) : null,
        waitingTimeHours: totalWaitHours > 0 ? Number(totalWaitHours.toFixed(2)) : null,
        downtimeHours: Number((totalRepairHours + totalWaitHours).toFixed(2)) || null,
        laborCostVnd: labor,
        partsCostVnd: parts,
        totalCostVnd: totalCost,
      });
    }
    setIsEditing(false);
  };

  const rows = [
    {
      label: 'Thời gian sửa chữa (Repair)',
      val: formatDurationVi(timeAndCost.repairTimeHours),
      est: formatDurationVi(estimatedTimeAndCost?.repairTimeHours),
      color: '#2563eb',
    },
    {
      label: 'Thời gian chờ (Waiting)',
      val: formatDurationVi(timeAndCost.waitingTimeHours),
      est: formatDurationVi(estimatedTimeAndCost?.waitingTimeHours),
      color: '#f59e0b',
    },
    {
      label: 'Tổng dừng máy (Downtime)',
      val: formatDurationVi(timeAndCost.downtimeHours),
      est: formatDurationVi(estimatedTimeAndCost?.downtimeHours),
      color: '#ef4444',
      isBold: true,
    },
    {
      label: 'Chi phí nhân công',
      val: timeAndCost.laborCostVnd != null ? `${timeAndCost.laborCostVnd.toLocaleString('vi-VN')} đ` : '—',
      est: estimatedTimeAndCost?.laborCostVnd != null ? `${estimatedTimeAndCost.laborCostVnd.toLocaleString('vi-VN')} đ` : '—',
      color: '#0891b2',
    },
    {
      label: 'Chi phí linh kiện thay thế',
      val: timeAndCost.partsCostVnd != null ? `${timeAndCost.partsCostVnd.toLocaleString('vi-VN')} đ` : '—',
      est: estimatedTimeAndCost?.partsCostVnd != null ? `${estimatedTimeAndCost.partsCostVnd.toLocaleString('vi-VN')} đ` : '—',
      color: '#8b5cf6',
    },
    {
      label: 'Tổng chi phí thực tế',
      val: timeAndCost.totalCostVnd != null ? `${timeAndCost.totalCostVnd.toLocaleString('vi-VN')} đ` : '—',
      est: estimatedTimeAndCost?.totalCostVnd != null ? `${estimatedTimeAndCost.totalCostVnd.toLocaleString('vi-VN')} đ` : '—',
      color: '#16a34a',
      isBold: true,
    },
  ];

  return (
    <div
      style={{
        padding: '16px 18px',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FontAwesomeIcon icon={faClock} style={{ fontSize: '15px', color: '#2563eb' }} />
          <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            Hạch Toán Thời Gian &amp; Chi Phí Bảo Trì
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          style={{
            fontSize: '11px',
            color: '#2563eb',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {isEditing ? 'Đóng' : 'Chỉnh sửa'}
        </button>
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <TimeDurationPicker
            label="Thời gian sửa chữa:"
            hours={editRepairH}
            minutes={editRepairM}
            onChangeHours={setEditRepairH}
            onChangeMinutes={setEditRepairM}
            compact
          />
          <TimeDurationPicker
            label="Thời gian chờ linh kiện:"
            hours={editWaitH}
            minutes={editWaitM}
            onChangeHours={setEditWaitH}
            onChangeMinutes={setEditWaitM}
            compact
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Chi phí nhân công (VNĐ):</label>
              <input
                type="number"
                value={editLaborCost}
                onChange={(e) => setEditLaborCost(e.target.value)}
                style={{ width: '100%', padding: '5px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Chi phí linh kiện (VNĐ):</label>
              <input
                type="number"
                value={editPartsCost}
                onChange={(e) => setEditPartsCost(e.target.value)}
                style={{ width: '100%', padding: '5px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)' }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              marginTop: '4px',
            }}
          >
            Lưu cập nhật chi phí
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rows.map((r) => (
            <div
              key={r.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                padding: '4px 0',
                borderBottom: '1px solid rgba(0,0,0,0.03)',
              }}
            >
              <span style={{ color: 'var(--text-secondary, #475569)', fontWeight: r.isBold ? 700 : 500 }}>
                {r.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                {r.est !== '—' && (
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)' }} title="Dự toán">
                    (Dự kiến: {r.est})
                  </span>
                )}
                <strong style={{ color: r.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: r.isBold ? 800 : 600 }}>
                  {r.val}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

