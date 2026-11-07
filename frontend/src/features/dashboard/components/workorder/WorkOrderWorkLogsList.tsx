/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderWorkLogsList.tsx
 *
 * Nhật Ký Công Việc & Thao Tác Kỹ Thuật (Work Logs List):
 * - Ghi nhận công việc theo từng bước tiến trình, kỹ thuật viên thực hiện, kết quả.
 * - Hỗ trợ lọc theo bước đã chọn và gắn log vào đúng sub-task.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon, faFileLines } from '../../../../shared/icons';
import { WorkLogEntry, TaskStepItem } from '../../../../types/task';

interface WorkOrderWorkLogsListProps {
  workLogs: WorkLogEntry[];
  steps?: TaskStepItem[];
  selectedStepIdFilter?: string | null;
  assigneeName?: string;
  isReadOnly?: boolean;
  onClearStepFilter?: () => void;
  onAddWorkLog?: (log: Partial<WorkLogEntry>) => void;
}

export const WorkOrderWorkLogsList: React.FC<WorkOrderWorkLogsListProps> = ({
  workLogs,
  steps = [],
  selectedStepIdFilter,
  assigneeName,
  isReadOnly = false,
  onClearStepFilter,
  onAddWorkLog,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [chosenStepId, setChosenStepId] = useState<string>(selectedStepIdFilter || '');
  const [stepTitle, setStepTitle] = useState('');
  const [actions, setActions] = useState('');
  const [resultStatus, setResultStatus] = useState<'SUCCESS' | 'WAITING_PARTS' | 'FOLLOWUP_NEEDED'>('SUCCESS');

  useEffect(() => {
    if (selectedStepIdFilter) setChosenStepId(selectedStepIdFilter);
  }, [selectedStepIdFilter]);

  const filteredLogs = selectedStepIdFilter
    ? workLogs.filter((l) => l.stepId === selectedStepIdFilter)
    : workLogs;

  const currentFilteredStep = selectedStepIdFilter
    ? steps.find((s) => s.id === selectedStepIdFilter)
    : null;

  const resolvedPerformer = assigneeName?.trim() || 'Người phụ trách';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actions.trim() || isReadOnly) return;

    const matchedStep = steps.find((s) => s.id === chosenStepId);
    const resolvedStepTitle = matchedStep ? matchedStep.title : stepTitle.trim() || 'Thao tác kỹ thuật chung';
    const avatar = resolvedPerformer.split(' ').map((w) => w[0]).filter(Boolean).slice(-2).join('').toUpperCase() || 'KT';

    if (onAddWorkLog) {
      onAddWorkLog({
        id: `wl-${Date.now()}`,
        stepId: chosenStepId || undefined,
        stepTitle: resolvedStepTitle,
        stepNumber: matchedStep ? matchedStep.stepNumber : 0,
        actionsTaken: actions.trim(),
        performerName: resolvedPerformer,
        performerAvatar: avatar,
        resultStatus,
        createdAt: `${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString('vi-VN')}`,
      });
    }
    setActions('');
    setStepTitle('');
    setIsAdding(false);
  };

  return (
    <div style={{ padding: '16px 18px', borderRadius: '16px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FontAwesomeIcon icon={faFileLines} style={{ fontSize: '15px', color: '#0891b2' }} />
          <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            Nhật Ký Thực Hiện ({filteredLogs.length} bản ghi)
          </h4>
        </div>
        {isReadOnly ? (
          <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
            🔒 Hồ sơ đóng (Chỉ đọc)
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (!isAdding && selectedStepIdFilter) setChosenStepId(selectedStepIdFilter);
              setIsAdding(!isAdding);
            }}
            style={{ fontSize: '11px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            {isAdding ? 'Đóng' : '+ Ghi nhận thao tác'}
          </button>
        )}
      </div>

      {/* Banner lọc theo tiến trình */}
      {selectedStepIdFilter && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid #bfdbfe' }}>
          <span style={{ fontSize: '11px', color: '#1d4ed8' }}>
            Đang lọc: <strong>{currentFilteredStep ? currentFilteredStep.title : 'Bước đã chọn'}</strong> ({filteredLogs.length} nhật ký)
          </span>
          {onClearStepFilter && (
            <button type="button" onClick={onClearStepFilter} style={{ fontSize: '10.5px', color: '#2563eb', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>
              Xem tất cả
            </button>
          )}
        </div>
      )}

      {isAdding && !isReadOnly && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', backgroundColor: 'var(--bg-subtle, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>Gắn với tiến trình:</label>
            <select
              value={chosenStepId}
              onChange={(e) => setChosenStepId(e.target.value)}
              style={{ padding: '6px 8px', fontSize: '11.5px', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)' }}
            >
              <option value="">— Thao tác chung (không gắn bước) —</option>
              {steps.map((s, idx) => (
                <option key={s.id} value={s.id}>Bước {idx + 1}: {s.title}</option>
              ))}
            </select>
          </div>

          {!chosenStepId && (
            <input
              type="text"
              placeholder="Tên bước / thao tác kỹ thuật..."
              value={stepTitle}
              onChange={(e) => setStepTitle(e.target.value)}
              style={{ padding: '6px 8px', fontSize: '11.5px', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)' }}
            />
          )}

          <textarea
            rows={2}
            placeholder="Chi tiết công việc đã thực hiện..."
            value={actions}
            onChange={(e) => setActions(e.target.value)}
            style={{ padding: '6px 8px', fontSize: '11.5px', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary, #475569)' }}>
              Người thực hiện: <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{resolvedPerformer}</strong>
            </span>
            <select
              value={resultStatus}
              onChange={(e) => setResultStatus(e.target.value as 'SUCCESS' | 'WAITING_PARTS' | 'FOLLOWUP_NEEDED')}
              style={{ padding: '5px 8px', fontSize: '11.5px', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)' }}
            >
              <option value="SUCCESS">Thành công</option>
              <option value="WAITING_PARTS">Chờ linh kiện</option>
              <option value="FOLLOWUP_NEEDED">Cần theo dõi</option>
            </select>
          </div>

          <button
            type="submit"
            style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '11.5px', fontWeight: 700, border: 'none', cursor: 'pointer', alignSelf: 'flex-end' }}
          >
            Lưu nhật ký
          </button>
        </form>
      )}

      {/* Logs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredLogs.length === 0 ? (
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', textAlign: 'center', padding: '12px' }}>
            {selectedStepIdFilter ? 'Chưa có nhật ký nào cho bước này. Hãy bấm "+ Ghi nhận thao tác" ở trên.' : 'Chưa có ghi nhận thao tác nào.'}
          </span>
        ) : (
          filteredLogs.map((log) => {
            const stepNum = log.stepNumber || (steps.findIndex((s) => s.id === log.stepId) + 1);
            return (
              <div key={log.id} style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {log.stepId && (
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                        Bước {stepNum > 0 ? stepNum : '•'}
                      </span>
                    )}
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary, #0f172a)' }}>{log.stepTitle}</strong>
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '9999px',
                    backgroundColor: log.resultStatus === 'SUCCESS' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: log.resultStatus === 'SUCCESS' ? '#16a34a' : '#f59e0b',
                  }}>
                    {log.resultStatus === 'SUCCESS' ? 'Thành công' : log.resultStatus === 'WAITING_PARTS' ? 'Chờ vật tư' : 'Cần theo dõi'}
                  </span>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary, #475569)', margin: 0 }}>{log.actionsTaken}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
                  <span>Thực hiện: <strong>{log.performerName || 'Kỹ sư NOC'}</strong></span>
                  <span>{log.createdAt || log.startTime || ''}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
