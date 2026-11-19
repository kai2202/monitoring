import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ComparisonState {
  pinnedPrinterIds: string[];
  isComparisonModalOpen: boolean;
}

const STORAGE_KEY = 'fleet_pinned_printers';

const getInitialPinnedIds = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[ComparisonSlice] Không thể đọc localStorage:', err);
  }
  return []; // Mặc định không bị niêm cứng máy nào, bắt đầu trống
};

const saveToStorage = (ids: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn('[ComparisonSlice] Không thể ghi localStorage:', err);
  }
};

const initialState: ComparisonState = {
  pinnedPrinterIds: getInitialPinnedIds(),
  isComparisonModalOpen: false,
};

export const comparisonSlice = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    togglePinPrinter: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.pinnedPrinterIds.includes(id)) {
        state.pinnedPrinterIds = state.pinnedPrinterIds.filter((p) => p !== id);
      } else {
        state.pinnedPrinterIds.push(id);
      }
      saveToStorage(state.pinnedPrinterIds);
    },
    addPinnedPrinter: (state, action: PayloadAction<string>) => {
      if (!state.pinnedPrinterIds.includes(action.payload)) {
        state.pinnedPrinterIds.push(action.payload);
        saveToStorage(state.pinnedPrinterIds);
      }
    },
    removePinnedPrinter: (state, action: PayloadAction<string>) => {
      state.pinnedPrinterIds = state.pinnedPrinterIds.filter((id) => id !== action.payload);
      saveToStorage(state.pinnedPrinterIds);
    },
    clearAllPinned: (state) => {
      state.pinnedPrinterIds = [];
      saveToStorage([]);
    },
    setComparisonModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isComparisonModalOpen = action.payload;
    },
  },
});

export const {
  togglePinPrinter,
  addPinnedPrinter,
  removePinnedPrinter,
  clearAllPinned,
  setComparisonModalOpen,
} = comparisonSlice.actions;

export default comparisonSlice.reducer;
