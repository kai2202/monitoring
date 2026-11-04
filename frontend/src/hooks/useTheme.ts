/**
 * Frontend/src/hooks/useTheme.ts
 *
 * Hook quản lý chế độ giao diện Tối / Sáng của FleetMonitor.
 * - Mặc định là 'dark' (Midnight Dark Navy).
 * - Tự động đồng bộ với localStorage và thuộc tính data-theme trên thẻ <html>.
 */

import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'fleetmonitor_theme';

export function useTheme(): {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
} {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    }
    return 'light'; // Mặc định Soft Modern Pastel theo thiết kế mẫu Dribbble/Figma
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };
}

