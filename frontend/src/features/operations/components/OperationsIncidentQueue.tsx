/**
 * Frontend/src/features/operations/components/OperationsIncidentQueue.tsx
 *
 * Hàng Đợi Sự Cố Kỹ Thuật (Incident Queue) thu nhận từ Zabbix:
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { Incident } from '../../../../types/printer';

interface OperationsIncidentQueueProps {
  incidents: Incident[];
  activeTab: 'all' | 'critical' | 'warning';
  onTabChange: (tab: 'all' | 'critical' | 'warning') => void;
  onSelectIncident?: (incident: Incident) => void;
}

export const OperationsIncidentQueue: React.FC<OperationsIncidentQueueProps> = ({
  incidents,
  activeTab,
  onTabChange,
  onSelectIncident,
}) => {
  return (
    <div
      style={{
        padding: '20px 24px',
        borderRadius: '20px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} color="#ef4444" />
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            Hàng Đợi Sự Cố Kỹ Thuật Zabbix ({incidents.length})
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          {[
            { id: 'all' as const, label: 'Tất cả' },
            { id: 'critical' as const, label: 'Nguy cấp' },
            { id: 'warning' as const, label: 'Cảnh báo' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'var(--bg-card, #ffffff)' : 'transparent',
                color: activeTab === tab.id ? '#2563eb' : 'var(--text-muted, #64748b)',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {incidents.length === 0 ? (
          <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', padding: '20px', textAlign: 'center' }}>
            Không có sự cố nào trong hàng đợi.
          </span>
        ) : (
          incidents.map((inc) => {
            const isCritical = inc.severity === 'Critical';

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident && onSelectIncident(inc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-subtle, #f8fafc)',
                  border: isCritical ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color, #e2e8f0)',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: 800,
                        backgroundColor: isCritical ? '#fee2e2' : '#fef3c7',
                        color: isCritical ? '#dc2626' : '#d97706',
                      }}
                    >
                      {isCritical ? 'CRITICAL' : 'WARNING'}
                    </span>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}>
                      {inc.printerName}
                    </strong>
                  </div>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-secondary, #475569)' }}>
                    {inc.message}
                  </p>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                    {inc.timestamp ? new Date(inc.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                  </span>
                  <ChevronRight size={14} color="#94a3b8" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

