import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnalyticsTimeframe, FloorTabId } from '../../types/analyticsUI';
import { DATA_SOURCE } from '../../config/dataSource';

export interface UIState {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  toastMessage: string | null;
  selectedBranch: string;
  selectedTimeframe: AnalyticsTimeframe;
  selectedFloor: FloorTabId;
  isSyncingZabbix: boolean;
  lastSyncTime: string | null;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('fleetmonitor-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return 'dark'; // Default Matte Onyx Dark
};

const getInitialBranch = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('fleetmonitor-selected-branch');
    if (saved) return saved;
  }
  return DATA_SOURCE === 'mock' ? 'Trụ sở chính (HQ)' : '';
};

const initialState: UIState = {
  theme: getInitialTheme(),
  sidebarCollapsed: false,
  toastMessage: null,
  selectedBranch: getInitialBranch(),
  selectedTimeframe: '30days',
  selectedFloor: 'all',
  isSyncingZabbix: false,
  lastSyncTime: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('fleetmonitor-theme', state.theme);
        if (state.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('fleetmonitor-theme', state.theme);
      }
    },
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapse: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setSelectedBranch: (state, action: PayloadAction<string>) => {
      state.selectedBranch = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('fleetmonitor-selected-branch', action.payload);
      }
    },
    setSelectedTimeframe: (state, action: PayloadAction<AnalyticsTimeframe>) => {
      state.selectedTimeframe = action.payload;
    },
    setSelectedFloor: (state, action: PayloadAction<FloorTabId>) => {
      state.selectedFloor = action.payload;
    },
    startZabbixSync: (state) => {
      state.isSyncingZabbix = true;
    },
    finishZabbixSync: (state) => {
      state.isSyncingZabbix = false;
      state.lastSyncTime = new Date().toLocaleTimeString('vi-VN');
    },
    showToast: (state, action: PayloadAction<string>) => {
      state.toastMessage = action.payload;
    },
    clearToast: (state) => {
      state.toastMessage = null;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebarCollapse,
  setSidebarCollapse,
  setSelectedBranch,
  setSelectedTimeframe,
  setSelectedFloor,
  startZabbixSync,
  finishZabbixSync,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;
