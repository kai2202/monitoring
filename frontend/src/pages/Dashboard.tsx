import React, { useState, useMemo } from 'react';
import { Printer, Incident, TabType, TimeframeType, ThemeMode } from '../types/printer';
import {
  getFleetStats,
  getAvailabilityTimeline,
} from '../services/fleetService';
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

// Coordinated color palette matching the darker Midnight Dashboard aesthetic
export const PALETTE = {
  cyan: '#38bdf8', // vivid electric cyan
  blue: '#3b82f6', // electric blue
  purple: '#818cf8', // indigo / violet
  indigo: '#6366f1',
  emerald: '#34d399', // soft emerald
  amber: '#fbbf24', // soft amber
  rose: '#f87171', // soft rose
  slate: '#64748b' // muted blue-gray
};

export const DONUT_COLORS = [
  PALETTE.cyan,
  PALETTE.indigo,
  PALETTE.purple,
  PALETTE.emerald,
  PALETTE.amber,
  PALETTE.rose,
  PALETTE.slate
];

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
  const isLight = theme === 'light';

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

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.warn('[Dashboard] Lỗi khi làm mới dữ liệu:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const timelineData = useMemo(() => {
    return getAvailabilityTimeline(timeframe, printers);
  }, [timeframe, printers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
        palette={PALETTE}
        onNavigateTab={onNavigateTab}
      />

      {/* Middle Row: Overall Line Chart + Radial/Donut Tasks Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1rem'
        }}
        className="dashboard-middle-grid"
      >
        <AvailabilityTimelineChart
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          timelineData={timelineData}
          stats={stats}
          theme={theme}
          isLight={isLight}
          palette={PALETTE}
        />

        <FleetCompositionDonut
          printers={printers}
          stats={stats}
          theme={theme}
          isLight={isLight}
          palette={PALETTE}
          donutColors={DONUT_COLORS}
        />
      </div>

      {/* Bottom Row: Detailed Fleet Table + Projects Breakdown Bar Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1rem'
        }}
        className="dashboard-bottom-grid"
      >
        <FleetSummaryTable
          printers={printers}
          onOpenPrinterModal={onOpenPrinterModal}
          onNavigateTab={onNavigateTab}
          palette={PALETTE}
        />

        <VendorBarChart
          printers={printers}
          incidents={incidents}
          theme={theme}
          isLight={isLight}
          palette={PALETTE}
        />
      </div>
    </div>
  );
};
