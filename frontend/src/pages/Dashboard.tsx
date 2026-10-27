import React, { useState, useMemo, useEffect } from 'react';
import { Printer, Incident, TabType, TimeframeType, ThemeMode } from '../types/printer';
import {
  getFleetStats,
  getAvailabilityTimeline,
  AvailabilityDataPoint,
} from '../services/fleetService';
import { printerService } from '../services/printerService';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardKPIs } from '../components/dashboard/DashboardKPIs';
import { AvailabilityTimelineChart } from '../components/dashboard/AvailabilityTimelineChart';
import { FleetCompositionDonut } from '../components/dashboard/FleetCompositionDonut';
import { FleetSummaryTable } from '../components/dashboard/FleetSummaryTable';
import { VendorBarChart } from '../components/dashboard/VendorBarChart';

interface DashboardProps {
  printers: Printer[];
  incidents: Incident[];
  onNavigateTab: (tab: TabType, filterParam?: string) => void;
  onOpenPrinterModal: (printer: Printer) => void;
  theme: ThemeMode;
  onToggleTheme?: () => void;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

// Coordinated color palettes matching Midnight Dashboard (dark) and High-Contrast Modern Slate (light)
const DARK_PALETTE = {
  cyan: '#38bdf8', // vivid electric cyan
  blue: '#3b82f6', // electric blue
  purple: '#818cf8', // indigo / violet
  indigo: '#6366f1',
  emerald: '#34d399', // soft emerald
  amber: '#fbbf24', // soft amber
  rose: '#f87171', // soft rose
  slate: '#64748b' // muted blue-gray
};

const LIGHT_PALETTE = {
  cyan: '#0284c7', // rich vivid sky-blue
  blue: '#2563eb', // vivid royal blue
  purple: '#7c3aed', // deep vibrant violet
  indigo: '#4f46e5',
  emerald: '#059669', // rich emerald green
  amber: '#d97706', // deep contrast amber
  rose: '#dc2626', // strong alert red
  slate: '#475569' // deep slate
};

export const Dashboard: React.FC<DashboardProps> = ({
  printers,
  incidents,
  onNavigateTab,
  onOpenPrinterModal,
  theme,
  isLoading = false,
  onRefresh,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeType>('24h');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [timelineData, setTimelineData] = useState<AvailabilityDataPoint[]>(() =>
    getAvailabilityTimeline('24h', printers)
  );
  const isLight = theme === 'light';

  // Palette adapts dynamically based on theme mode
  const palette = isLight ? LIGHT_PALETTE : DARK_PALETTE;

  const donutColors = useMemo(() => [
    palette.cyan,
    palette.indigo,
    palette.purple,
    palette.emerald,
    palette.amber,
    palette.rose,
    palette.slate
  ], [palette]);

  // Compute metrics from fleet service single source of truth
  const stats = useMemo(() => getFleetStats(printers, incidents), [printers, incidents]);

  // Compute total lifetime page volume if available
  const totalPageVolume = useMemo(() => {
    let sum = 0;
    let hasCount = false;
    printers.forEach(p => {
      if (typeof p.counters?.total === 'number') {
        sum += p.counters.total;
        hasCount = true;
      }
    });
    return hasCount ? sum : null;
  }, [printers]);

  // Fetch telemetry availability time-series from Zabbix
  useEffect(() => {
    let isMounted = true;

    const fetchTimeline = async () => {
      if (printers.length === 0) {
        setTimelineData([]);
        return;
      }

      try {
        const points = await printerService.getAvailabilityTimeline(timeframe);
        if (!isMounted) return;
        if (points && points.length > 0) {
          setTimelineData(points);
        } else {
          setTimelineData(getAvailabilityTimeline(timeframe, printers));
        }
      } catch {
        if (isMounted) {
          setTimelineData(getAvailabilityTimeline(timeframe, printers));
        }
      }
    };

    fetchTimeline();

    return () => {
      isMounted = false;
    };
  }, [timeframe, printers]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      const points = await printerService.getAvailabilityTimeline(timeframe);
      if (points && points.length > 0) {
        setTimelineData(points);
      }
    } catch (err) {
      console.warn('[Dashboard] Lỗi khi làm mới dữ liệu:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Header Bar */}
      <DashboardHeader
        totalPrinters={stats.totalPrinters}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Row of 5 Compact KPI Cards */}
      <DashboardKPIs
        stats={stats}
        totalPageVolume={totalPageVolume}
        palette={palette}
        onNavigateTab={onNavigateTab}
      />

      {/* Middle Row: Overall Line Chart + Radial/Donut Tasks Breakdown */}
      <div className="dashboard-middle-grid">
        <AvailabilityTimelineChart
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          timelineData={timelineData}
          stats={stats}
          theme={theme}
          isLight={isLight}
          palette={palette}
        />

        <FleetCompositionDonut
          printers={printers}
          stats={stats}
          theme={theme}
          isLight={isLight}
          palette={palette}
          donutColors={donutColors}
        />
      </div>

      {/* Bottom Row: Detailed Fleet Table + Projects Breakdown Bar Chart */}
      <div className="dashboard-bottom-grid">
        <FleetSummaryTable
          printers={printers}
          onOpenPrinterModal={onOpenPrinterModal}
          onNavigateTab={onNavigateTab}
          palette={palette}
        />

        <VendorBarChart
          printers={printers}
          incidents={incidents}
          theme={theme}
          isLight={isLight}
          palette={palette}
        />
      </div>
    </div>
  );
};
