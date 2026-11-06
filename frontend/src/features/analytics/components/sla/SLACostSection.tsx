/**
 * Frontend/src/features/analytics/components/sla/SLACostSection.tsx
 *
 * Tab 3: Hiệu suất SLA & Chi phí (SLA Performance & Cost Analytics):
 * - Hỗ trợ hideHeader khi được bọc bởi AnalyticsPageHeader.
 * - Hàng 1: 4 Thẻ KPI Bento tinh xảo.
 * - Hàng 2: Lưới Bento 2 Cột Cân Đối (Vòng cung chi phí 180° & Ma trận nhiệt sự cố).
 * - Dữ liệu SLA & Chi phí lấy từ props slaCostData (Single Source of Truth), loại bỏ mock imports.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useMemo } from 'react';
import { FontAwesomeIcon, faFileCsv } from '@/shared/icons';
import { SLACostAnalyticsResponse } from '@/types/api';
import { SLAKpiCards } from './SLAKpiCards';
import { CostAllocationArcChart } from './CostAllocationArcChart';
import { SLAIncidentHeatmapMatrix } from './SLAIncidentHeatmapMatrix';
import { exportCostAllocationToCsv } from '../../utils/costCsvExport';

export interface SLACostSectionProps {
  hideHeader?: boolean;
  slaCostData?: SLACostAnalyticsResponse | null;
}

export const SLACostSection: React.FC<SLACostSectionProps> = ({
  hideHeader = false,
  slaCostData,
}) => {
  const kpis = slaCostData?.kpis;
  const departmentCosts = useMemo(() => slaCostData?.departmentCosts || [], [slaCostData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header bar độc lập (chỉ hiển thị khi không có Header tổng) */}
      {!hideHeader && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Hiệu Suất SLA &amp; Hạch Toán Chi Phí Hạm Đội
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Phân bổ ngân sách vật tư, chi phí nhân công kỹ thuật và ma trận nhiệt điểm nóng sự cố
            </p>
          </div>

          <button
            type="button"
            onClick={() => exportCostAllocationToCsv(departmentCosts)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.15s ease',
            }}
          >
            <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '13px', color: '#16a34a' }} />
            <span>Xuất Báo Cáo Chi Phí (CSV)</span>
          </button>
        </div>
      )}

      {/* 1. Hàng 1: 4 Thẻ KPI Bento */}
      <SLAKpiCards kpis={kpis} />

      {/* 2. Các Khối Dữ Liệu Chi Tiết Full-Width 100% (Không chia đôi 50-50, triệt tiêu khoảng trắng thừa) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', minWidth: 0 }}>
        {/* Khối 1: Phân Bổ Chi Phí Theo Phòng Ban (Full Width 100%) */}
        <div style={{ width: '100%', minWidth: 0 }}>
          <CostAllocationArcChart departments={departmentCosts} />
        </div>

        {/* Khối 2: Ma Trận Nhiệt Điểm Nóng Sự Cố & Chi Tiết Vận Hành (Full Width 100%) */}
        <div style={{ width: '100%', minWidth: 0 }}>
          <SLAIncidentHeatmapMatrix heatmapData={slaCostData?.incidentHeatmap} />
        </div>
      </div>
    </div>
  );
};

export default SLACostSection;
