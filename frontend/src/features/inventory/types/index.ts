/**
 * Frontend/src/features/inventory/types/index.ts
 *
 * Kiểu dữ liệu Phân hệ Quản lý Kho vật tư (Inventory Types):
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'TONER' | 'DRUM' | 'FUSER' | 'WASTE_BOX' | 'ROLLER' | string;
  compatibleModels: string[];
  currentStock: number;
  safetyStock: number;
  unit: string;
  unitCost: number;
  location: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: 'IMPORT' | 'EXPORT' | 'RETURN' | 'ADJUSTMENT' | string;
  quantity: number;
  balanceAfter: number;
  taskId?: string | null;
  performedById?: string | null;
  performedByName?: string | null;
  performedBy?: { id?: string; fullName: string; role?: string } | null;
  task?: { id: string; title: string } | null;
  note?: string | null;
  createdAt: string;
  item?: Partial<InventoryItem>;
}

export interface CreateStockTransactionDto {
  itemId: string;
  type: 'IMPORT' | 'EXPORT' | 'ADJUSTMENT';
  quantity: number;
  taskId?: string;
  note?: string;
}

