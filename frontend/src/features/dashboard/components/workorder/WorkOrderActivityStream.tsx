/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderActivityStream.tsx
 *
 * Dòng Hoạt Động & Thảo Luận Kỹ Thuật (Activity Stream):
 * - Hiển thị feed thảo luận theo thời gian thực và ô gửi ghi chú mới.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faCommentDots, faPaperPlane } from '../../../../shared/icons';
import { TaskActivityFeedItem } from '../../../../types/task';

interface WorkOrderActivityStreamProps {
  activityFeed: TaskActivityFeedItem[];
  onAddNote?: (note: string) => void;
}

export const WorkOrderActivityStream: React.FC<WorkOrderActivityStreamProps> = ({
  activityFeed,
  onAddNote,
}) => {
  const [noteInput, setNoteInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    if (onAddNote) {
      onAddNote(noteInput.trim());
    }
    setNoteInput('');
  };

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FontAwesomeIcon icon={faCommentDots} style={{ fontSize: '15px', color: '#2563eb' }} />
        <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
          Thảo Luận &amp; Nhật Ký Hoạt Động ({activityFeed.length})
        </h4>
      </div>

      {/* Feed Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
        {activityFeed.length === 0 ? (
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', padding: '10px', textAlign: 'center' }}>
            Chưa có ghi chú nào. Hãy bắt đầu thảo luận bên dưới.
          </span>
        ) : (
          activityFeed.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-subtle, #f8fafc)',
                fontSize: '12px',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.avatarText || 'KT'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '11.5px', color: 'var(--text-primary, #0f172a)' }}>
                    {item.author}
                  </strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>
                    {item.timestamp}
                  </span>
                </div>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary, #475569)', lineHeight: 1.4 }}>
                  {item.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Send Note Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Nhập ghi chú hoặc ý kiến kỹ thuật..."
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          style={{
            flex: 1,
            padding: '7px 12px',
            fontSize: '12px',
            borderRadius: '10px',
            border: '1px solid var(--border-color, #e2e8f0)',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
          }}
        />
        <button
          type="submit"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '10px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: '11.5px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: '12px' }} />
          <span>Gửi</span>
        </button>
      </form>
    </div>
  );
};

