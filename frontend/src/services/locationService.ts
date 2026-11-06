/**
 * Frontend/src/services/locationService.ts
 *
 * Dịch vụ quản trị tập trung danh mục Trụ sở (Chi nhánh) và Sơ đồ Tầng:
 * - Clean Slate Architecture:
 *   + Khi `DATA_SOURCE === 'mock'`: Nạp dữ liệu mô phỏng từ `MockDataProvider`.
 *   + Khi `DATA_SOURCE === 'api'`: Khởi tạo mảng rỗng `[]` và đồng bộ / lưu trữ thực tế
 *     xuống bảng `Branch` & `Floor` trên PostgreSQL qua `/api/settings/branches`.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { DATA_SOURCE } from '../config/dataSource';
import { MockDataProvider } from '../mocks/MockDataProvider';
import { requestApi } from './providers/api/apiClient';

export interface BranchLocation {
  id: string;
  name: string;
  code: string;
  address?: string;
  isHq?: boolean;
  floors: string[];
}

class LocationService {
  private branches: BranchLocation[] =
    DATA_SOURCE === 'mock' ? (MockDataProvider.getBranches() as BranchLocation[]) : [];
  private listeners: Array<() => void> = [];

  public getBranches(): BranchLocation[] {
    return [...this.branches];
  }

  public getBranchNames(): string[] {
    return this.branches.map((b) => b.name);
  }

  public getDepartments(): string[] {
    if (DATA_SOURCE === 'mock') {
      return MockDataProvider.getDepartments();
    }
    return [];
  }

  public getFloorsByBranch(branchName?: string): string[] {
    if (this.branches.length === 0) return [];
    if (!branchName || branchName === 'all') {
      const set = new Set<string>();
      this.branches.forEach((b) => b.floors.forEach((f) => set.add(f)));
      return Array.from(set);
    }
    const found = this.branches.find(
      (b) => b.name.toLowerCase() === branchName.toLowerCase()
    );
    return found ? [...found.floors] : [];
  }

  public setBranches(newBranches: BranchLocation[]): void {
    this.branches = [...newBranches];
    this.notify();
  }

  public async fetchBranches(): Promise<BranchLocation[]> {
    if (DATA_SOURCE === 'mock') {
      return this.getBranches();
    }
    try {
      const remoteBranches = await requestApi<BranchLocation[]>('/settings/branches');
      if (Array.isArray(remoteBranches)) {
        this.branches = remoteBranches;
        this.notify();
      }
      return [...this.branches];
    } catch {
      return [...this.branches];
    }
  }

  public async createBranchAsync(
    name: string,
    code: string,
    address?: string,
    initialFloors: string[] = ['Tầng 1']
  ): Promise<BranchLocation> {
    if (DATA_SOURCE === 'api') {
      const created = await requestApi<BranchLocation>('/settings/branches', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase() || undefined,
          address: address?.trim(),
          floors: initialFloors.length > 0 ? initialFloors : ['Tầng 1'],
        }),
      });
      this.branches.push(created);
      this.notify();
      return created;
    }
    return this.addBranch(name, code, address, initialFloors);
  }

  public async addFloorAsync(branchId: string, floorName: string): Promise<{ success: boolean; message?: string }> {
    const cleanFloor = floorName.trim();
    if (!cleanFloor) return { success: false, message: 'Tên tầng không được để trống.' };

    if (DATA_SOURCE === 'api') {
      try {
        const updated = await requestApi<BranchLocation>(
          `/settings/branches/${encodeURIComponent(branchId)}/floors`,
          {
            method: 'POST',
            body: JSON.stringify({ name: cleanFloor }),
          }
        );
        this.branches = this.branches.map((b) => (b.id === updated.id ? updated : b));
        this.notify();
        return { success: true };
      } catch (err: any) {
        return { success: false, message: err?.message || 'Không thể thêm tầng mới.' };
      }
    }

    const ok = this.addFloor(branchId, cleanFloor);
    return ok ? { success: true } : { success: false, message: `Tầng '${cleanFloor}' đã tồn tại.` };
  }

  public async removeFloorAsync(
    branchId: string,
    floorName: string,
    activePrinterCount: number
  ): Promise<{ success: boolean; message?: string }> {
    if (DATA_SOURCE === 'api') {
      try {
        await requestApi(
          `/settings/branches/${encodeURIComponent(branchId)}/floors/${encodeURIComponent(floorName)}`,
          { method: 'DELETE' }
        );
        const branch = this.branches.find((b) => b.id === branchId || b.name === branchId);
        if (branch) {
          branch.floors = branch.floors.filter((f) => f !== floorName);
          this.notify();
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, message: err?.message || 'Không thể xóa tầng này.' };
      }
    }
    return this.removeFloor(branchId, floorName, activePrinterCount);
  }

  public async removeBranchAsync(
    branchId: string,
    activePrinterCount: number
  ): Promise<{ success: boolean; message?: string }> {
    if (DATA_SOURCE === 'api') {
      try {
        await requestApi(`/settings/branches/${encodeURIComponent(branchId)}`, {
          method: 'DELETE',
        });
        this.branches = this.branches.filter((b) => b.id !== branchId);
        this.notify();
        return { success: true };
      } catch (err: any) {
        return { success: false, message: err?.message || 'Không thể xóa trụ sở này.' };
      }
    }
    return this.removeBranch(branchId, activePrinterCount);
  }

  public addBranch(
    name: string,
    code: string,
    address?: string,
    initialFloors: string[] = ['Tầng 1']
  ): BranchLocation {
    const newBranch: BranchLocation = {
      id: `br-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      address: address?.trim(),
      isHq: this.branches.length === 0,
      floors: initialFloors.length > 0 ? initialFloors : ['Tầng 1'],
    };
    this.branches.push(newBranch);
    this.notify();
    return newBranch;
  }

  public addFloor(branchId: string, floorName: string): boolean {
    const branch = this.branches.find((b) => b.id === branchId || b.name === branchId);
    if (!branch) return false;
    const cleanFloor = floorName.trim();
    if (!cleanFloor || branch.floors.includes(cleanFloor)) return false;
    branch.floors.push(cleanFloor);
    this.notify();
    return true;
  }

  public removeFloor(
    branchId: string,
    floorName: string,
    activePrinterCount: number
  ): { success: boolean; message?: string } {
    if (activePrinterCount > 0) {
      return {
        success: false,
        message: `Không thể xóa '${floorName}' vì đang có ${activePrinterCount} máy in hoạt động. Vui lòng điều chuyển máy in trước!`,
      };
    }
    const branch = this.branches.find((b) => b.id === branchId || b.name === branchId);
    if (!branch) return { success: false, message: 'Không tìm thấy chi nhánh tương ứng.' };
    branch.floors = branch.floors.filter((f) => f !== floorName);
    this.notify();
    return { success: true };
  }

  public removeBranch(
    branchId: string,
    activePrinterCount: number
  ): { success: boolean; message?: string } {
    if (activePrinterCount > 0) {
      return {
        success: false,
        message: `Không thể xóa trụ sở/chi nhánh này vì đang có ${activePrinterCount} máy in hoạt động. Vui lòng điều chuyển máy in trước!`,
      };
    }
    const branch = this.branches.find((b) => b.id === branchId);
    if (branch?.isHq && this.branches.length > 1) {
      return { success: false, message: 'Không thể xóa Trụ sở chính (HQ) của hệ thống khi còn chi nhánh khác.' };
    }
    this.branches = this.branches.filter((b) => b.id !== branchId);
    this.notify();
    return { success: true };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const locationService = new LocationService();
