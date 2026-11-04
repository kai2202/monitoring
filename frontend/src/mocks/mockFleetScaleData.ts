/**
 * Frontend/src/mocks/mockFleetScaleData.ts
 *
 * Large-Scale Fleet Simulator (100 - 1.000 máy in)
 * Phân rã thành các module < 300 LOC theo AGENTS.md Rule 7.1:
 * - mockFleetScaleBase: Metadata, danh sách thiết bị và daily volume cache
 * - mockFleetScaleHeatmap: Ma trận nhiệt Heatmap & Xếp hạng sản lượng
 * - mockFleetScaleInventoryTrends: Bảng kiểm kê phân trang, so sánh chi tiết và xu hướng sản lượng
 */

export * from './scale/mockFleetScaleBase';
export * from './scale/mockFleetScaleHeatmap';
export * from './scale/mockFleetScaleInventoryTrends';
