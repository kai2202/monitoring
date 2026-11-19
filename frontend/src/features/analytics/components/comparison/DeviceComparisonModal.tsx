/**
 * Frontend/src/features/analytics/components/comparison/DeviceComparisonModal.tsx
 *
 * Drawer So Sánh Chi Tiết Thiết Bị (2 Phần Tinh Gọn):
 * 1. Header thẻ máy đối chiếu & bộ chọn thêm/xóa (ComparisonDevicePicker).
 * 2. Bộ 2 Tab chuyển đổi nhanh: "Biểu đồ đối chiếu" | "Bảng thông số chi tiết".
 * - Render qua React Portal vào document.body với zIndex: 1100 để không bị Header đè.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ModalPortal } from '@/shared/modals';
import { FontAwesomeIcon, faScaleBalanced, faChartColumn, faTableColumns } from '../../../../shared/icons';
import { ComparisonMetricKey, ComparisonDeviceKPIs } from '../../../../types/analyticsUI';
import { analyticsService } from '../../../../services';
import { ComparisonDevicePicker } from './ComparisonDevicePicker';
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
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');
  const [activeMetricKey, setActiveMetricKey] = useState<ComparisonMetricKey>('totalPages');
  const [devicesKPIs, setDevicesKPIs] = useState<ComparisonDeviceKPIs[]>([]);

  useEffect(() => {
    if (!isOpen || selectedPrinterIds.length === 0) {
      setDevicesKPIs([]);
      return;
    }
    let isMounted = true;
    analyticsService.getComparisonKPIs(selectedPrinterIds).then((res) => {
      if (isMounted) setDevicesKPIs(res);
    });
    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedPrinterIds]);

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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, overflow: 'hidden' }}>
      {/* Backdrop mờ */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 w-[72vw] max-w-6xl min-w-[360px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
        style={{ zIndex: 1105 }}
      >
        {/* PHẦN 1: HEADER & THẺ MÁY ĐỐI CHIẾU */}
        <ComparisonDevicePicker
          devicesKPIs={devicesKPIs}
          selectedPrinterIds={selectedPrinterIds}
          onAddPrinter={onAddPrinter}
          onRemovePrinter={onRemovePrinter}
          onClose={onClose}
        />

        {/* PHẦN 2: 2 TAB CHUYỂN ĐỔI & NỘI DUNG */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {devicesKPIs.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <FontAwesomeIcon icon={faScaleBalanced} className="text-xl" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Cần ít nhất 2 thiết bị để đối chiếu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Hiện tại bạn đang chọn {devicesKPIs.length} máy in. Hãy bấm nút &ldquo;+ Thêm máy đối chiếu&rdquo; ở trên để chọn thêm thiết bị.
              </p>
            </div>
          ) : (
            <>
              {/* 2-Tab Switcher */}
              <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 self-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('chart')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'chart'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faChartColumn} className="text-[11px]" />
                  <span>Biểu đồ đối chiếu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'table'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faTableColumns} className="text-[11px]" />
                  <span>Bảng thông số chi tiết</span>
                </button>
              </div>

              {activeTab === 'chart' ? (
                <ComparisonBarSection
                  devicesKPIs={devicesKPIs}
                  activeMetricKey={activeMetricKey}
                  onSelectMetric={setActiveMetricKey}
                  maxMetricValue={maxMetricValue}
                  currentTab={currentTab}
                />
              ) : (
                <ComparisonDetailedTable devicesKPIs={devicesKPIs} />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Dữ liệu đối chiếu được tổng hợp từ SNMP &amp; Zabbix API
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Đóng bảng
          </button>
        </div>
      </div>
    </div>
  );

  return <ModalPortal>{modalContent}</ModalPortal>;
};

export default DeviceComparisonModal;
