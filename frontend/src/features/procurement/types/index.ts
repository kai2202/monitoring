/**
 * Frontend/src/features/procurement/types/index.ts
 *
 * Kiểu dữ liệu Phân hệ Mua sắm & Đề xuất vật tư (Procurement Types):
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

export interface ProcurementRequest {
  id: string;
  requestedById: string;
  requestedBy?: { id: string; fullName: string; role: string };
  printerId?: string | null;
  printer?: { id: string; name: string; location: string; floor: string } | null;
  sku?: string | null;
  itemName: string;
  quantity: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ORDERED' | string;
  urgency: 'NORMAL' | 'URGENT' | 'CRITICAL' | string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId?: string | null;
  vendor?: { id: string; name: string; code: string; phone?: string } | null;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'ORDERED' | 'RECEIVED' | 'CANCELLED' | string;
  totalAmount: number;
  itemsJson: PurchaseOrderItem[] | any;
  createdById: string;
  createdBy?: { id: string; fullName: string; role: string };
  approvedById?: string | null;
  approvedBy?: { id: string; fullName: string } | null;
  orderedAt?: string | null;
  receivedAt?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface CreatePurchaseOrderDto {
  poNumber: string;
  vendorId?: string;
  items: PurchaseOrderItem[];
  note?: string;
}

export interface CreateProcurementRequestDto {
  printerId?: string;
  sku?: string;
  itemName: string;
  quantity: number;
  reason: string;
  urgency?: 'NORMAL' | 'URGENT' | 'CRITICAL';
}

