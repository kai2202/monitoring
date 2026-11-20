/**
 * Frontend/src/features/analytics/components/banner/AnalyticsPageHeader.tsx
 *
 * Header Phân Hệ Phân Tích theo chuẩn Kho Vật Tư & Mua Sắm:
 * - Eyebrow Category Uppercase + Tiêu đề lớn kèm chấm xanh + Subtitle rõ ràng.
 * - Thanh Sub-tab Pill hiện đại ở góc phải trên cùng.
 * - Toolbar tác vụ ngữ cảnh dạng Pill (Chọn Chi nhánh, Timeframe, Xuất CSV).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import {
  FontAwesomeIcon,
  faChartLine,
  faBox,
  faDollarSign,
  faBuilding,
  faClock,
  faFileCsv,
} from '@/shared/icons';
import { AnalyticsSubTab, AnalyticsTimeframe } from '@/types/analyticsUI';

export interface AnalyticsPageHeaderProps {
  currentTab: AnalyticsSubTab;
  onSubTabChange: (tab: AnalyticsSubTab) => void;
  branches?: string[];
  selectedBranch?: string;
  onBranchChange?: (b: string) => void;
  timeframe?: AnalyticsTimeframe;
  onTimeframeChange?: (tf: AnalyticsTimeframe) => void;
  suppliesBadgeCount?: number;
  onExportCostCsv?: () => void;
}

export const AnalyticsPageHeader: React.FC<AnalyticsPageHeaderProps> = ({
  currentTab,
  onSubTabChange,
  branches = [],
  selectedBranch,
  onBranchChange,
  timeframe = '30days',
  onTimeframeChange,
  suppliesBadgeCount = 4,
  onExportCostCsv,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isFieldTech = user?.role === 'FIELD_TECH';

  const allSubTabs = [
    { id: 'overview' as const, label: 'Sản lượng in', icon: faChartLine, badge: null },
    { id: 'sla-cost' as const, label: 'SLA & Chi phí', icon: faDollarSign, badge: null },
  ];
  const subTabs = isFieldTech ? allSubTabs.filter((t) => t.id !== 'sla-cost') : allSubTabs;

  const timeframes: { id: AnalyticsTimeframe; label: string }[] = [
    { id: 'hourly', label: '24 Giờ qua' },
    { id: '7days', label: '7 Ngày' },
    { id: '30days', label: '30 Ngày' },
  ];

  const getEyebrow = () => {
    switch (currentTab) {
      case 'sla-cost':
        return 'HIỆU SUẤT VẬN HÀNH & HẠCH TOÁN CHI PHÍ';
      default:
        return 'SẢN LƯỢNG IN ẤN & BÁO CÁO TỶ TRỌNG';
    }
  };

  const getTitle = () => {
    switch (currentTab) {
      case 'sla-cost':
        return 'Hiệu Suất Vận Hành & SLA';
      default:
        return 'Phân Tích Sản Lượng Máy In';
    }
  };

  const getSubtitle = () => {
    switch (currentTab) {
      case 'sla-cost':
        return 'Chỉ số Uptime, MTBF, MTTR, ma trận điểm nóng sự cố và phân tích thiết bị cần chú ý.';
      default:
        return 'Báo cáo xu hướng in ấn Soft Spline, phân bổ tỷ trọng Mono/Color và sàn đối chiếu máy in.';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Minimalist Split Bar: Tab gạch chân bên trái & Tác vụ xuất CSV bên phải */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto max-w-full">
          {subTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSubTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold transition-colors whitespace-nowrap border-0 border-b-2 border-solid bg-transparent cursor-pointer -mb-px ${
                  isActive
                    ? 'border-b-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-b-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="text-[11px]" />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {currentTab === 'sla-cost' && onExportCostCsv && (
          <div className="pb-2 sm:pb-1.5 shrink-0">
            <button
              type="button"
              onClick={onExportCostCsv}
              className="px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FontAwesomeIcon icon={faFileCsv} className="text-[11.5px] text-emerald-600" />
              <span>Xuất Báo Cáo Chi Phí (CSV)</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Hàng Bộ lọc Ngữ cảnh gọn nhẹ */}
      {(onBranchChange && (currentTab === 'overview' || currentTab === 'sla-cost')) || (currentTab === 'overview' && onTimeframeChange) ? (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {onBranchChange && (currentTab === 'overview' || currentTab === 'sla-cost') && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faBuilding} className="text-blue-600 text-[11px]" />
                  <span>Chi nhánh:</span>
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {branches.length > 0 ? (
                    branches.map((b) => {
                      const isSel = selectedBranch === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => onBranchChange(b)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60'
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-400">Chưa có chi nhánh</span>
                  )}
                </div>
              </div>
            )}

            {currentTab === 'overview' && onTimeframeChange && (
              <div className="flex items-center gap-2">
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700/70 gap-0.5">
                  <FontAwesomeIcon icon={faClock} className="text-[11px] text-slate-400 ml-1.5" />
                  {timeframes.map((tf) => {
                    const isTfActive = timeframe === tf.id;
                    return (
                      <button
                        key={tf.id}
                        type="button"
                        onClick={() => onTimeframeChange(tf.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border ${
                          isTfActive
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border-slate-200/60 dark:border-slate-700'
                            : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent'
                        }`}
                      >
                        {tf.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AnalyticsPageHeader;
