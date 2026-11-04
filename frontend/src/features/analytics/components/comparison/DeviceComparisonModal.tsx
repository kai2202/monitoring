import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon, faScaleBalanced } from '../../../../shared/icons';
import { ComparisonMetricKey } from '../../../../types/analyticsUI';
import { getMockComparisonKPIs } from '../../../../mocks/mockAnalyticsUIData';
import { ComparisonDevicePicker } from './ComparisonDevicePicker';
import { ComparisonKpiCards } from './ComparisonKpiCards';
import { ComparisonBarSection, COMPARISON_TABS } from './ComparisonBarSection';
import { ComparisonDetailedTable } from './ComparisonDetailedTable';

export interface DeviceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPrinterIds: string[];
  onAddPrinter: (id: string) => void;
  onRemovePrinter: (id: string) => void;
}

export const DeviceComparisonModal: React.FC<DeviceComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedPrinterIds,
  onAddPrinter,
  onRemovePrinter,
}) => {
  const [activeMetricKey, setActiveMetricKey] = useState<ComparisonMetricKey>('totalPages');

  const devicesKPIs = useMemo(() => {
    return getMockComparisonKPIs(selectedPrinterIds);
  }, [selectedPrinterIds]);

  const currentTab = useMemo(() => {
    return COMPARISON_TABS.find((t) => t.key === activeMetricKey) || COMPARISON_TABS[0];
  }, [activeMetricKey]);

  const maxMetricValue = useMemo(() => {
    const vals = devicesKPIs
      .map((d) => d[activeMetricKey])
      .filter((v): v is number => typeof v === 'number');
    if (vals.length === 0) return 100;
    return Math.max(...vals);
  }, [devicesKPIs, activeMetricKey]);

  // Phím tắt Esc để đóng modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, overflow: 'hidden' }}>
      {/* Backdrop mờ */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          transition: 'opacity 0.2s ease',
        }}
        onClick={onClose}
      />

      {/* Slide-over Modal: Chiếm 70% chiều rộng màn hình từ phải sang trái */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '70vw',
          maxWidth: '1280px',
          minWidth: '360px',
          backgroundColor: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 65,
          boxSizing: 'border-box',
        }}
      >
        {/* KHU VỰC 1: HEADER & DEVICE SELECTION */}
        <ComparisonDevicePicker
          devicesKPIs={devicesKPIs}
          selectedPrinterIds={selectedPrinterIds}
          onAddPrinter={onAddPrinter}
          onRemovePrinter={onRemovePrinter}
          onClose={onClose}
        />

        {/* NỘI DUNG CUỘN CHÍNH */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {devicesKPIs.length < 2 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                textAlign: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                <FontAwesomeIcon icon={faScaleBalanced} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Cần ít nhất 2 thiết bị để đối chiếu
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '420px', margin: 0 }}>
                Hiện tại bạn đang chọn {devicesKPIs.length} máy in. Vui lòng bấm <strong>"+ Thêm thiết bị đối chiếu"</strong> ở trên để đưa thêm máy in vào bảng so sánh.
              </p>
            </div>
          ) : (
            <>
              {/* KHU VỰC 2: PERFORMANCE OVERVIEW (6 KPI CARDS) */}
              <ComparisonKpiCards devicesKPIs={devicesKPIs} />

              {/* KHU VỰC 3: VISUAL COMPARISON (GROUPED BAR CHART VỚI TABS) */}
              <ComparisonBarSection
                devicesKPIs={devicesKPIs}
                activeMetricKey={activeMetricKey}
                onSelectMetric={setActiveMetricKey}
                maxMetricValue={maxMetricValue}
                currentTab={currentTab}
              />

              {/* KHU VỰC 4: DETAILED COMPARISON TABLE (5 NHÓM THÔNG SỐ) */}
              <ComparisonDetailedTable devicesKPIs={devicesKPIs} />
            </>
          )}
        </div>

        {/* Footer Slide-over */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Dữ liệu đối chiếu thu thập từ counter phần cứng SNMP &amp; Zabbix API
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Đóng bảng
          </button>
        </div>
      </div>
    </div>
  );
};

