import { useState, useEffect } from 'react';

/**
 * Frontend/src/shared/hooks/useDebounce.ts
 *
 * Hook trì hoãn cập nhật giá trị (thường dùng cho ô tìm kiếm và slider trượt).
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

