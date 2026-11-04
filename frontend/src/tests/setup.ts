/**
 * Frontend/src/tests/setup.ts
 *
 * Thiết lập môi trường kiểm thử cho Vitest + Testing Library.
 */

import '@testing-library/react';

// Mock localStorage nếu chưa có trong môi trường test
if (typeof window !== 'undefined' && !window.localStorage) {
  const store: Record<string, string> = {};
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const key in store) {
          delete store[key];
        }
      },
    },
    writable: true,
  });
}

