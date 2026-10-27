import { useState, useEffect, useCallback, useRef } from 'react';
import { Printer, Incident } from '../types/printer';
import { printerService } from '../services/printerService';

/**
 * usePrinterData
 *
 * Custom hook that fetches printers and incidents from the backend API and
 * re-fetches on a configurable polling interval.
 *
 * Returns empty arrays when the backend is unavailable — callers must handle
 * the empty-array / isLoading / error states explicitly in the UI.
 *
 * @param pollingIntervalMs - Interval in milliseconds between auto-refreshes.
 *   Set to 0 to disable automatic polling (fetch on mount only).
 *   Default: 60 000 ms (60 seconds).
 */
export interface UsePrinterDataResult {
  printers: Printer[];
  incidents: Incident[];
  isLoading: boolean;
  /** ISO 8601 timestamp of the last successful fetch, or null if never fetched. */
  lastFetchedAt: string | null;
  /** Human-readable error message if the last fetch failed, or null on success. */
  error: string | null;
  /** Manually trigger an immediate re-fetch outside the polling cycle. */
  refresh: () => Promise<void>;
  /** Optimistic update setters */
  setPrinters: React.Dispatch<React.SetStateAction<Printer[]>>;
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
}

const DEFAULT_POLLING_INTERVAL_MS = 60_000;

export function usePrinterData(
  pollingIntervalMs = DEFAULT_POLLING_INTERVAL_MS
): UsePrinterDataResult {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track mount state to avoid setState on unmounted component
  const isMountedRef = useRef<boolean>(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedPrinters, fetchedIncidents] = await Promise.all([
        printerService.getPrinters(),
        printerService.getIncidents(),
      ]);
      if (!isMountedRef.current) return;
      setPrinters(fetchedPrinters);
      setIncidents(fetchedIncidents);
      setLastFetchedAt(new Date().toISOString());
    } catch (err) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Unknown error fetching printer data';
      setError(message);
      console.warn('[usePrinterData] Fetch failed:', message);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling interval
  useEffect(() => {
    if (pollingIntervalMs <= 0) return;
    const intervalId = setInterval(fetchData, pollingIntervalMs);
    return () => clearInterval(intervalId);
  }, [fetchData, pollingIntervalMs]);

  return {
    printers,
    incidents,
    isLoading,
    lastFetchedAt,
    error,
    refresh: fetchData,
    setPrinters,
    setIncidents,
  };
}
