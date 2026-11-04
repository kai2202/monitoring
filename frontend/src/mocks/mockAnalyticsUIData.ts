/**
 * Frontend/src/mocks/mockAnalyticsUIData.ts
 *
 * Mock data chuyên sâu phục vụ giao diện Analytics Modern SaaS:
 * Phân rã thành các module < 300 LOC theo AGENTS.md Rule 7.1:
 * - mockAnalyticsDefinitions (Types & Printer Definitions)
 * - mockAnalyticsTimeSeries (Chuỗi thời gian & Xu hướng theo tầng)
 * - mockAnalyticsFloorStats (Đóng góp sản lượng theo tầng)
 * - mockAnalyticsComparisonKPIs (Chỉ số so sánh thiết bị)
 * - mockAnalyticsDistribution (Phân bổ sản lượng & Quy mô hạm đội)
 * - mockAnalyticsSuppliesAndSLA (Vật tư, Days-to-Empty, SLA & Hạch toán chi phí)
 */

export * from './analytics/mockAnalyticsDefinitions';
export * from './analytics/mockAnalyticsTimeSeries';
export * from './analytics/mockAnalyticsFloorStats';
export * from './analytics/mockAnalyticsComparisonKPIs';
export * from './analytics/mockAnalyticsDistribution';
export * from './analytics/mockAnalyticsSuppliesAndSLA';
