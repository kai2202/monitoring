/**
 * Frontend/src/shared/components/ScrambleNumber.tsx
 *
 * Hiệu ứng Matrix Scramble / Text Decryption:
 * - Khi giá trị thay đổi hoặc khi component mount: các con số và ký tự đảo xoay ngẫu nhiên
 *   trong 450ms rồi khóa lại (lock-in) từng ký tự từ trái qua phải thành số/chữ chính xác.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useEffect, useState, useRef } from 'react';

export interface ScrambleNumberProps {
  value: number | string | null | undefined;
  durationMs?: number;
  className?: string;
  style?: React.CSSProperties;
  formatter?: (val: number | string) => string;
}

const CHARS = '0123456789';

export const ScrambleNumber: React.FC<ScrambleNumberProps> = ({
  value,
  durationMs = 260,
  className = '',
  style = {},
  formatter,
}) => {
  const targetText =
    value === null || value === undefined
      ? '—'
      : formatter
      ? formatter(value)
      : typeof value === 'number'
      ? value.toLocaleString('vi-VN')
      : String(value);

  const [displayText, setDisplayText] = useState(targetText);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Không chạy animation ở lần render đầu tiên, khi giá trị là '—', hoặc khi bật giảm chuyển động
    if (isFirstRender.current || prefersReducedMotion || targetText === '—' || targetText === '') {
      isFirstRender.current = false;
      setDisplayText(targetText);
      return;
    }

    let frameId: number;
    const startTime = performance.now();
    const length = targetText.length;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Số ký tự đã được giải mã chính xác (khóa từ trái qua phải)
      const lockedCharsCount = Math.floor(progress * length);

      let result = '';
      for (let i = 0; i < length; i++) {
        const char = targetText[i];
        // Giữ nguyên dấu phân cách '.', ',', '%', ' '
        if (char === '.' || char === ',' || char === '%' || char === ' ' || char === '/') {
          result += char;
        } else if (i < lockedCharsCount) {
          result += char;
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      setDisplayText(result);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayText(targetText);
      }
    };

    frameId = requestAnimationFrame(animate);
    isFirstRender.current = false;

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [targetText, durationMs]);

  return (
    <span className={className} style={{ display: 'inline-block', fontVariantNumeric: 'tabular-nums', ...style }}>
      {displayText}
    </span>
  );
};

export default ScrambleNumber;

