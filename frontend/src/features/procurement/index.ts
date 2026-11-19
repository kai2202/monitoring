/**
 * Frontend/src/features/procurement/index.ts
 *
 * Public API Gate cho Phân hệ Mua sắm & Đơn hàng PO (Feature Procurement Gate):
 * - Tuân thủ AGENTS.md Rule 7.1.
 */

export * from './types';
export * from './slices/procurementApiSlice';
export * from './components/ProcurementStatsCards';
export * from './components/PurchaseOrderTable';
export * from './components/CreatePurchaseOrderModal';
export * from './pages/ProcurementPage';

