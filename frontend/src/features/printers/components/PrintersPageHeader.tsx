/**
 * Frontend/src/features/printers/components/PrintersPageHeader.tsx
 *
 * Header Phân Hệ Máy In (Printers Page Header Card):
 * - Hàng trên: Tiêu đề + Phụ đề động (bên trái) và Thanh điều hướng Sub-tab (góc phải trên cùng).
 * - Hàng dưới: Nhóm nút chức năng Admin & Tác vụ ([+ Khai báo máy in], [Quản lý Vị trí & Tầng], [Xuất CSV], [Làm mới]).
 * - Đảm bảo bố cục 2 hàng nhất quán trên tất cả các sub-tab (Danh sách / Lịch trình Gantt / Lịch sử bảo trì).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import {
  FontAwesomeIcon,
  faPrint,
  faCalendarDays,
  faWrench,
  faRotate,
  faBuilding,
  faPlus,
  faFileCsv,
} from '../../../shared/icons';

export interface PrintersPageHeaderProps {
  mainTab?: 'printers' | 'timeline' | 'history';
  activeTab?: 'printers' | 'timeline' | 'history';
  onTabChange?: (tab: 'printers' | 'timeline' | 'history') => void;
  roleNameVi?: string;
  isAdmin: boolean;
  totalPrinters: number;
  totalTasks: number;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenCreatePrinter: () => void;
  onOpenBranchManager: () => void;
  onExportCsv?: () => void;
}

export const PrintersPageHeader: React.FC<PrintersPageHeaderProps> = ({
  mainTab,
  activeTab,
  onTabChange,
  roleNameVi,
  isAdmin,
  totalPrinters,
  totalTasks,
  isLoading,
  onRefresh,
  onOpenCreatePrinter,
  onOpenBranchManager,
  onExportCsv,
}) => {
  const currentTab = activeTab || mainTab || 'printers';
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role;
  const isFieldTech = role === 'FIELD_TECH' || role === 'FIELD_TECHNICIAN';
  const isAssetHr = role === 'ASSET_HR' || role === 'DEPARTMENT_HEAD';

  const subTabs = isFieldTech
    ? [
        { id: 'timeline' as const, label: 'Lịch trình Gantt', icon: faCalendarDays, count: null },
        { id: 'history' as const, label: 'Lệnh bảo trì', icon: faWrench, count: totalTasks },
        { id: 'printers' as const, label: 'Danh sách máy', icon: faPrint, count: totalPrinters },
      ]
    : isAssetHr
    ? [
        { id: 'printers' as const, label: 'Danh mục tài sản', icon: faPrint, count: totalPrinters },
        { id: 'history' as const, label: 'Đối soát KPI', icon: faWrench, count: totalTasks },
        { id: 'timeline' as const, label: 'Lịch bảo dưỡng', icon: faCalendarDays, count: null },
      ]
    : [
        { id: 'printers' as const, label: 'Danh sách', icon: faPrint, count: totalPrinters },
        { id: 'timeline' as const, label: 'Lịch trình Gantt', icon: faCalendarDays, count: null },
        { id: 'history' as const, label: 'Lịch sử bảo trì', icon: faWrench, count: totalTasks },
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
              icon={currentTab === 'printers' ? faPrint : currentTab === 'timeline' ? faCalendarDays : faWrench}
              style={{ fontSize: '18px' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                {currentTab === 'printers'
                  ? (isAssetHr ? 'Danh Mục Tài Sản Máy In' : 'Danh Sách Máy In')
                  : currentTab === 'timeline'
                  ? (isAssetHr ? 'Lịch Bảo Dưỡng Hạm Đội' : 'Lịch Trình Bảo Trì')
                  : (isAssetHr ? 'Đối Soát Hiệu Suất KTV & Bảo Trì' : 'Xử Lý Kỹ Thuật')}
              </h1>
              {roleNameVi && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: isAdmin ? 'rgba(37, 99, 235, 0.1)' : isAssetHr ? 'rgba(2, 132, 199, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: isAdmin ? '#2563eb' : isAssetHr ? '#0284c7' : '#d97706',
                  }}
                >
                  {roleNameVi}
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: '3px 0 0 0' }}>
              {currentTab === 'printers'
                ? (isAssetHr ? `Kiểm kê định danh ${totalPrinters} máy in, số serial và vị trí phòng ban` : `Quản lý toàn diện ${totalPrinters} thiết bị đa chi nhánh và 7 tầng`)
                : currentTab === 'timeline'
                ? (isAssetHr ? 'Theo dõi lịch bảo dưỡng định kỳ để thông báo phối hợp các phòng ban' : 'Quan sát hạn hoàn thành và tiến độ công việc')
                : (isAssetHr ? `Đối soát ${totalTasks} lệnh bảo trì, kiểm tra ảnh in test và đánh giá KPI` : `Theo dõi ${totalTasks} lệnh bảo trì kỹ thuật`)}
            </p>
          </div>
        </div>

        {/* Thanh Điều Hướng Sub-tab (Góc Phải Trên Cùng) */}
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
                onClick={() => onTabChange?.(tab.id)}
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
                {tab.count !== null && (
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(100, 116, 139, 0.12)',
                      color: isActive ? '#ffffff' : 'var(--text-muted, #64748b)',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* HÀNG 2: Nhóm Nút Hành Động Admin & Tác Vụ (Căn Lề Trái Dưới) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {isAdmin ? (
          <>
            <button
              type="button"
              onClick={onOpenCreatePrinter}
              style={{ padding: '7px 14px', borderRadius: '9999px', backgroundColor: '#2563eb', border: 'none', color: '#ffffff', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
            >
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: '11px' }} />
              <span>Khai báo máy in</span>
            </button>
            <button
              type="button"
              onClick={onOpenBranchManager}
              style={{ padding: '7px 14px', borderRadius: '9999px', backgroundColor: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.25)', color: '#2563eb', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '12px' }} />
              <span>Quản lý Vị trí &amp; Tầng</span>
            </button>
          </>
        ) : isAssetHr ? (
          <div
            style={{ padding: '6px 12px', borderRadius: '9999px', backgroundColor: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', color: '#0284c7', fontSize: '11.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '11px' }} />
            <span>Chế độ Quản lý Tài sản: Kiểm kê &amp; Đối soát hợp đồng</span>
          </div>
        ) : (
          <div
            style={{ padding: '6px 12px', borderRadius: '9999px', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#d97706', fontSize: '11.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FontAwesomeIcon icon={faWrench} style={{ fontSize: '11px' }} />
            <span>Chế độ Hiện trường: Tiếp nhận &amp; Nghiệm thu SOP</span>
          </div>
        )}

        {onExportCsv && currentTab === 'printers' && (
          <button
            type="button"
            onClick={onExportCsv}
            title="Xuất file CSV kiểm kê danh mục máy in"
            style={{ padding: '7px 14px', borderRadius: '9999px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', color: 'var(--text-secondary, #475569)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '13px', color: '#16a34a' }} />
            <span>Xuất CSV</span>
          </button>
        )}

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          style={{ padding: '7px 14px', borderRadius: '9999px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', color: 'var(--text-secondary, #475569)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faRotate} spin={isLoading} style={{ fontSize: '13px' }} />
          <span>Làm mới</span>
        </button>
      </div>
    </div>
  );
};

export default PrintersPageHeader;
