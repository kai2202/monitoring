import { useState, useCallback, useRef, MouseEvent, WheelEvent } from 'react';

export interface ZoomPanState {
  scale: number;
  offsetX: number;
  offsetY: number;
  isPanning: boolean;
}

export interface UseZoomPanOptions {
  minScale?: number;
  maxScale?: number;
  zoomStep?: number;
}

/**
 * Frontend/src/shared/hooks/useZoomPan.ts
 *
 * Hook quản lý trạng thái Zoom và Pan cho Canvas hoặc SVG đồ họa lớn.
 */
export function useZoomPan(options: UseZoomPanOptions = {}) {
  const { minScale = 0.5, maxScale = 4.0, zoomStep = 0.15 } = options;

  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);

  const startCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return; // Chỉ bắt chuột trái
    setIsPanning(true);
    startCoords.current = { x: e.clientX - offsetX, y: e.clientY - offsetY };
  }, [offsetX, offsetY]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    setOffsetX(e.clientX - startCoords.current.x);
    setOffsetY(e.clientY - startCoords.current.y);
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? zoomStep : -zoomStep;
    setScale((prev) => Math.min(maxScale, Math.max(minScale, Number((prev + delta).toFixed(2)))));
  }, [maxScale, minScale, zoomStep]);

  const resetView = useCallback(() => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  }, []);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(maxScale, Number((prev + zoomStep).toFixed(2))));
  }, [maxScale, zoomStep]);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(minScale, Number((prev - zoomStep).toFixed(2))));
  }, [minScale, zoomStep]);

  return {
    scale,
    offsetX,
    offsetY,
    isPanning,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onWheel: handleWheel,
    },
    actions: {
      setScale,
      setOffsetX,
      setOffsetY,
      zoomIn,
      zoomOut,
      resetView,
    },
  };
}

