/**
 * Frontend/src/features/inventory/index.ts
 *
 * Public API Gate cho Phân hệ Quản lý Kho vật tư (Feature Inventory Gate):
 * - Tuân thủ AGENTS.md Rule 7.1.
 */

export * from './types';
export * from './slices/inventoryApiSlice';
export * from './components/InventoryStatsCards';
export * from './components/InventoryTable';
export * from './components/StockTransactionModal';
export * from './pages/InventoryPage';

