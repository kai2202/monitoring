import { useEffect, RefObject } from 'react';

/**
 * Frontend/src/shared/hooks/useCanvasHiDPI.ts
 *
 * Hook tự động đồng bộ kích thước Canvas với độ phân giải Retina/HiDPI,
 * chống mờ vỡ nét trên màn hình độ phân giải cao.
 */
export function useCanvasHiDPI(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  width: number,
  height: number
): number {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    }
  }, [canvasRef, width, height, dpr]);

  return dpr;
}

