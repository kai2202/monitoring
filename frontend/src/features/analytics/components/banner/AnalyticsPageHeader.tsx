/**
 * Frontend/src/features/analytics/components/banner/AnalyticsPageHeader.tsx
 *
 * Header Phân Hệ Phân Tích (Analytics Page Header Card):
 * - Hàng 1: Tiêu đề + Phụ đề động (bên trái) và Thanh điều hướng Sub-tab (góc phải trên cùng).
 * - Hàng 2: Toolbar tác vụ ngữ cảnh (Chọn Chi nhánh, Khung thời gian 24h/7d/30d, Xuất CSV chi phí).
 * - Đảm bảo bố cục 2 hàng nhất quán trên tất cả 3 sub-tab (Sản lượng / Vật tư / SLA & Chi phí).
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
  const isFieldTech = user?.role === 'FIELD_TECH' || user?.role === 'FIELD_TECHNICIAN';
  const isAssetHr = user?.role === 'ASSET_HR' || user?.role === 'DEPARTMENT_HEAD';

  const allSubTabs = [
    { id: 'overview' as const, label: 'Sản lượng in', icon: faChartLine, badge: null },
    { id: 'supplies' as const, label: isAssetHr ? 'Vật tư D-Day' : 'Vật tư', icon: faBox, badge: suppliesBadgeCount },
    { id: 'sla-cost' as const, label: isAssetHr ? 'Hạch toán chi phí' : 'SLA & Chi phí', icon: faDollarSign, badge: null },
  ];
  const subTabs = isFieldTech ? allSubTabs.filter((t) => t.id !== 'sla-cost') : allSubTabs;

  const timeframes: { id: AnalyticsTimeframe; label: string }[] = [
    { id: 'hourly', label: '24 Giờ qua' },
    { id: '7days', label: '7 Ngày' },
    { id: '30days', label: '30 Ngày' },
  ];

  return (
    <div
      style={{
        padding: '18px 22px',
        borderRadius: 'var(--radius-card, 20px)',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* HÀNG 1: Tiêu Đề Thông Tin (Bên Trái) & Điều Hướng Sub-tab (Góc Phải Trên Cùng) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Khối Thông Tin Tiêu Đề */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-subtle, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary, #0f172a)',
            }}
          >
            <FontAwesomeIcon
              icon={currentTab === 'overview' ? faChartLine : currentTab === 'supplies' ? faBox : faDollarSign}
              style={{ fontSize: '18px' }}
            />
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              {currentTab === 'overview'
                ? 'Phân Tích Sản Lượng Hạm Đội'
                : currentTab === 'supplies'
                ? (isAssetHr ? 'Dự Báo & Kế Hoạch Mua Sắm Vật Tư' : 'Dự Báo Vật Tư & Linh Kiện')
                : (isAssetHr ? 'Hạch Toán Chi Phí Thuê Máy Phòng Ban' : 'Hiệu Suất SLA & Hạch Toán Chi Phí')}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: '3px 0 0 0' }}>
              {currentTab === 'overview'
                ? (isAssetHr ? 'Kiểm soát định mức sản lượng in ấn Mono/Color theo từng phòng ban' : 'Báo cáo xu hướng in ấn Soft Spline, phân bổ tỷ trọng Mono/Color và sàn đối chiếu hạm đội')
                : currentTab === 'supplies'
                ? (isAssetHr ? 'Theo dõi hạn chót cạn kiệt D-Day phục vụ kế hoạch mua sắm và dự trù kho vật tư' : 'Cảnh báo chủ động ngưỡng tồn <15% & <25%, đếm ngược D-Day và mức tiêu hao hộp mực thải')
                : (isAssetHr ? 'Đối soát chi phí thuê máy 180° theo phòng ban và xuất báo cáo đối soát hóa đơn' : 'Phân bổ ngân sách phòng ban 180°, MTTR, tỷ lệ cam kết SLA và ma trận điểm nóng sự cố')}
            </p>
          </div>
        </div>

        {/* Thanh Điều Hướng Sub-tab (Góc Phải Trên Cùng - Chuẩn Ảnh 1) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px',
            backgroundColor: 'var(--bg-subtle, #f1f5f9)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            gap: '3px',
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          {subTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSubTabChange(tab.id)}
                className={`subtab-pill-btn ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '9px',
                  border: isActive ? '1px solid rgba(37, 99, 235, 0.4)' : '1px solid transparent',
                  backgroundColor: isActive ? 'var(--primary-color, #2563eb)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary, #475569)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.28)' : 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transform: isActive ? 'scale(1.02)' : 'none',
                }}
              >
                <FontAwesomeIcon icon={tab.icon} style={{ fontSize: '11px' }} />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(239, 68, 68, 0.12)',
                      color: isActive ? '#ffffff' : '#ef4444',
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* HÀNG 2: Toolbar Tác Vụ Ngữ Cảnh (Căn Lề Trái Dưới) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Bộ chọn Chi nhánh (Hiển thị cho Overview & Supplies) */}
          {onBranchChange && (currentTab === 'overview' || currentTab === 'supplies') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '11px', color: '#2563eb' }} />
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Chi nhánh:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {branches.length > 0 ? (
                  branches.map((b) => {
                    const isSel = selectedBranch === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => onBranchChange(b)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: isSel ? 700 : 500,
                          backgroundColor: isSel ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-subtle)',
                          border: isSel ? '1px solid #2563eb' : '1px solid var(--border-color)',
                          color: isSel ? '#2563eb' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {b}
                      </button>
                    );
                  })
                ) : (
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Chưa có chi nhánh</span>
                )}
              </div>
            </div>
          )}

          {/* Bộ chọn Khung thời gian Timeframe (Chỉ cho Overview) */}
          {currentTab === 'overview' && onTimeframeChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--border-color)', fontSize: '13px' }}>|</span>
              <FontAwesomeIcon icon={faClock} style={{ fontSize: '11px', color: 'var(--text-muted)' }} />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-subtle, #f8fafc)',
                  padding: '2px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  gap: '2px',
                }}
              >
                {timeframes.map((tf) => {
                  const isTfActive = timeframe === tf.id;
                  return (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => onTimeframeChange(tf.id)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: isTfActive ? 700 : 500,
                        backgroundColor: isTfActive ? 'var(--bg-card, #ffffff)' : 'transparent',
                        color: isTfActive ? '#2563eb' : 'var(--text-muted, #64748b)',
                        border: 'none',
                        boxShadow: isTfActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tf.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Nút tác vụ riêng: Xuất CSV chi phí khi ở SLA & Cost */}
        {currentTab === 'sla-cost' && onExportCostCsv && (
          <button
            type="button"
            onClick={onExportCostCsv}
            style={{ padding: '6px 14px', borderRadius: '9999px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', color: 'var(--text-secondary, #475569)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          >
            <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '13px', color: '#16a34a' }} />
            <span>Xuất Báo Cáo Chi Phí (CSV)</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPageHeader;

