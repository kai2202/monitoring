/**
 * Frontend/src/components/analytics/SLACostSection.tsx
 *
 * Tab 3: Hiệu suất SLA & Chi phí (SLA Performance & Cost Allocation):
 * - Clean architecture, tách nhỏ các sub-component chuyên biệt (< 300 LOC/file).
 * - Kết nối SLAKpiCards, SLADualAxisComboChart, DepartmentCostBreakdown.
 * - Khoảng cách thoáng đãng (Generous Spacing), chuẩn UI Enterprise Dribbble/Behance.
 * - Tuân thủ AGENTS.md Rule 7.1.
 */

import React from 'react';
import {
  MOCK_SLA_OVERVIEW_KPIS,
  MOCK_SLA_COMBO_SERIES,
  MOCK_DEPARTMENT_COSTS,
} from '../../mocks/mockAnalyticsUIData';
import {
  SLAKpiCards,
  SLADualAxisComboChart,
  DepartmentCostBreakdown,
} from '../../features/analytics/components/sla';

export const SLACostSection: React.FC = () => {
  const kpis = MOCK_SLA_OVERVIEW_KPIS;
  const comboSeries = MOCK_SLA_COMBO_SERIES;
  const departmentCosts = MOCK_DEPARTMENT_COSTS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 1. 4 Thẻ KPI Hiệu suất SLA & Đơn giá CPP */}
      <SLAKpiCards kpis={kpis} />

      {/* 2. Biểu đồ Dual-Axis Combo Chart: MTBF/MTTR vs Tỷ lệ lỗi vặt */}
      <SLADualAxisComboChart series={comboSeries} />

      {/* 3. Phân bổ Chi phí In ấn theo Phòng ban (Donut Chart & Micro-cards) */}
      <DepartmentCostBreakdown departments={departmentCosts} />
    </div>
  );
};

export default SLACostSection;
