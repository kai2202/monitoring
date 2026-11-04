import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  toastMessage: string | null;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('fleetmonitor-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return 'dark'; // Default Matte Onyx Dark
};

const initialState: UIState = {
  theme: getInitialTheme(),
  sidebarCollapsed: false,
  toastMessage: null,
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
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;

