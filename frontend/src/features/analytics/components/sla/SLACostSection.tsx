/**
 * Frontend/src/features/analytics/components/sla/SLACostSection.tsx
 *
 * Tab 3: Hiệu suất SLA & Chi phí (SLA Performance & Cost Analytics):
 * - Hàng 1: 4 Thẻ KPI Bento tinh xảo (Chuẩn góc dưới phải Ảnh 2).
 * - Hàng 2: Lưới Bento 2 Cột Cân Đối Đậm Đặc Thông Tin (Side-by-Side):
 *   - Card 1: Vòng Cung Chi Phí 180° + 5 Thẻ Micro-Cards Phòng Ban (Trang in Mono/Color, % tỷ trọng, M VND).
 *   - Card 2: Đường Sóng Điểm Nóng 1.75px + Bảng Chi Tiết Tuần Đang Chọn & Danh Sách Sự Cố Cụ Thể.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import {
  MOCK_SLA_OVERVIEW_KPIS,
  MOCK_DEPARTMENT_COSTS,
} from '../../../../mocks/mockAnalyticsUIData';
import { SLAKpiCards } from './SLAKpiCards';
import { CostAllocationArcChart } from './CostAllocationArcChart';
import { SLAIncidentHeatmapMatrix } from './SLAIncidentHeatmapMatrix';

export const SLACostSection: React.FC = () => {
  const kpis = MOCK_SLA_OVERVIEW_KPIS;
  const departmentCosts = MOCK_DEPARTMENT_COSTS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%' }}>
      {/* 1. Hàng 1: 4 Thẻ KPI Bento Tinh Xảo */}
      <SLAKpiCards kpis={kpis} />

      {/* 2. Hàng 2: Lưới Bento 2 Cột Đậm Đặc Thông Tin (Không khoảng trắng dư) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '20px',
          alignItems: 'stretch',
        }}
      >
        {/* Card 1: Vòng Cung Bán Nguyệt 180° + 5 Micro-Cards */}
        <div style={{ minWidth: 0, height: '100%' }}>
          <CostAllocationArcChart departments={departmentCosts} />
        </div>

        {/* Card 2: Ma Trận Nhiệt Điểm Nóng Sự Cố 5x7 + Inspector Chi Tiết */}
        <div style={{ minWidth: 0, height: '100%' }}>
          <SLAIncidentHeatmapMatrix />
        </div>
      </div>
    </div>
  );
};

export default SLACostSection;
