/**
 * Frontend/src/tests/reduxSlices.test.ts
 *
 * Kiểm thử đơn vị cho Redux Slices (comparisonSlice & uiSlice):
 * - Kiểm tra logic Ghim đối chiếu máy in (toggle, add, remove, clearAll).
 * - Kiểm tra quản lý trạng thái UI (theme, selectedBranch, selectedTimeframe).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  comparisonSlice,
  togglePinPrinter,
  addPinnedPrinter,
  removePinnedPrinter,
  clearAllPinned,
  setComparisonModalOpen,
} from '../app/slices/comparisonSlice';
import {
  uiSlice,
  toggleTheme,
  setSelectedBranch,
  setSelectedTimeframe,
  setSelectedFloor,
} from '../app/slices/uiSlice';

describe('comparisonSlice', () => {
  let initialState: ReturnType<typeof comparisonSlice.getInitialState>;

  beforeEach(() => {
    initialState = {
      pinnedPrinterIds: [],
      isComparisonModalOpen: false,
    };
  });

  it('phải thêm máy in khi ghim lần đầu và xóa bỏ khi ghim lần hai (togglePinPrinter)', () => {
    // Lần 1: Thêm vào danh sách ghim
    const state1 = comparisonSlice.reducer(initialState, togglePinPrinter('PRN-001'));
    expect(state1.pinnedPrinterIds).toContain('PRN-001');

    // Lần 2: Bỏ ghim
    const state2 = comparisonSlice.reducer(state1, togglePinPrinter('PRN-001'));
    expect(state2.pinnedPrinterIds).not.toContain('PRN-001');
  });

  it('phải thêm máy in không trùng lặp (addPinnedPrinter)', () => {
    const state1 = comparisonSlice.reducer(initialState, addPinnedPrinter('PRN-002'));
    expect(state1.pinnedPrinterIds).toEqual(['PRN-002']);

    const state2 = comparisonSlice.reducer(state1, addPinnedPrinter('PRN-002'));
    expect(state2.pinnedPrinterIds).toEqual(['PRN-002']); // Không bị lặp phần tử
  });

  it('phải xóa máy in được chọn (removePinnedPrinter)', () => {
    const populatedState = {
      pinnedPrinterIds: ['PRN-001', 'PRN-002', 'PRN-003'],
      isComparisonModalOpen: false,
    };

    const nextState = comparisonSlice.reducer(populatedState, removePinnedPrinter('PRN-002'));
    expect(nextState.pinnedPrinterIds).toEqual(['PRN-001', 'PRN-003']);
  });

  it('phải xóa toàn bộ danh sách ghim (clearAllPinned)', () => {
    const populatedState = {
      pinnedPrinterIds: ['PRN-001', 'PRN-002'],
      isComparisonModalOpen: true,
    };

    const nextState = comparisonSlice.reducer(populatedState, clearAllPinned());
    expect(nextState.pinnedPrinterIds).toEqual([]);
  });

  it('phải cập nhật trạng thái mở modal đối chiếu (setComparisonModalOpen)', () => {
    const nextState = comparisonSlice.reducer(initialState, setComparisonModalOpen(true));
    expect(nextState.isComparisonModalOpen).toBe(true);
  });
});

describe('uiSlice', () => {
  it('phải đổi qua lại giữa dark và light theme khi gọi toggleTheme', () => {
    const stateDark = {
      theme: 'dark' as const,
      sidebarCollapsed: false,
      toastMessage: null,
      selectedBranch: 'Trụ sở chính (HQ)',
      selectedTimeframe: '30days' as const,
      selectedFloor: 'all' as const,
      isSyncingZabbix: false,
      lastSyncTime: null,
    };

    const stateLight = uiSlice.reducer(stateDark, toggleTheme());
    expect(stateLight.theme).toBe('light');

    const stateDarkAgain = uiSlice.reducer(stateLight, toggleTheme());
    expect(stateDarkAgain.theme).toBe('dark');
  });

  it('phải cập nhật chi nhánh, timeframe và tầng đúng giá trị truyền vào', () => {
    const initial = uiSlice.getInitialState();

    const s1 = uiSlice.reducer(initial, setSelectedBranch('Chi nhánh Miền Nam'));
    expect(s1.selectedBranch).toBe('Chi nhánh Miền Nam');

    const s2 = uiSlice.reducer(s1, setSelectedTimeframe('7days'));
    expect(s2.selectedTimeframe).toBe('7days');

    const s3 = uiSlice.reducer(s2, setSelectedFloor('floor-3'));
    expect(s3.selectedFloor).toBe('floor-3');
  });
});
