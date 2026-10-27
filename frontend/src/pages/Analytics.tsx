import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Printer, ThemeMode, PrinterTelemetryResponse } from '../types/printer';
import { printerService } from '../services/printerService';
import {
  AnalyticsHeader,
  AnalyticsKPIs,
  AnalyticsLoadCurves,
  AnalyticsRankingChart,
  AnalyticsTable,
} from '../components/analytics';

interface AnalyticsProps {
  printers: Printer[];
  theme: ThemeMode;
  onOpenPrinterModal?: (printer: Printer) => void;
  isLoading?: boolean;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  printers,
  theme,
  onOpenPrinterModal,
}) => {
  // Timeframe filter: 24h (hourly), 7d (daily), 30d (weekly)
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [telemetryData, setTelemetryData] = useState<PrinterTelemetryResponse[]>([]);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState<boolean>(false);
  
  // Ranking chart controls
  const [rankingMetric, setRankingMetric] = useState<'30day' | 'lifetime'>('30day');
  const [rankingLimit, setRankingLimit] = useState<5 | 10>(10);

  const isLight = theme === 'light';

  // KPI 1: Lifetime Total Counter (Hardware odometer)
  const totalLifetimePages = useMemo(() => {
    return printers.reduce((acc, p) => {
      return typeof p.counters.total === 'number' ? acc + p.counters.total : acc;
    }, 0);
  }, [printers]);

  // KPI 2: 30-Day Period Scraped Volume (Delta)
  const total30DayVolume = useMemo(() => {
    return printers.reduce((acc, p) => {
      return typeof p.thirtyDayVolume === 'number' ? acc + p.thirtyDayVolume : acc;
    }, 0);
  }, [printers]);

  const hasValid30DayData = useMemo(() => {
    return printers.some(p => typeof p.thirtyDayVolume === 'number');
  }, [printers]);

  // KPI 3: Average Daily Volume
  const avgDailyVolume = Math.round(total30DayVolume / 30);

  // KPI 4: Telemetry Coverage
  const validTelemetryPrinters = useMemo(() => {
    return printers.filter(p => typeof p.thirtyDayVolume === 'number' && p.thirtyDayVolume >= 0);
  }, [printers]);

  const telemetryCoveragePercent = printers.length > 0
    ? ((validTelemetryPrinters.length / printers.length) * 100).toFixed(1)
    : '—';

  // Ranked printers for Horizontal Bar Chart
  const rankedPrinters = useMemo(() => {
    if (rankingMetric === '30day') {
      const filtered = printers.filter(p => typeof p.thirtyDayVolume === 'number');
      const list = filtered.length > 0 ? filtered : printers;
      return [...list]
        .sort((a, b) => {
          const valB = typeof b.thirtyDayVolume === 'number' ? b.thirtyDayVolume : (b.counters.total ?? 0);
          const valA = typeof a.thirtyDayVolume === 'number' ? a.thirtyDayVolume : (a.counters.total ?? 0);
          const diff = valB - valA;
          return diff !== 0 ? diff : a.id.localeCompare(b.id);
        })
        .slice(0, rankingLimit);
    } else {
      return [...printers]
        .filter(p => typeof p.counters.total === 'number')
        .sort((a, b) => {
          const diff = (b.counters.total as number) - (a.counters.total as number);
          return diff !== 0 ? diff : a.id.localeCompare(b.id);
        })
        .slice(0, rankingLimit);
    }
  }, [printers, rankingMetric, rankingLimit]);

  // Fetch real historical print volume telemetry from Zabbix
  useEffect(() => {
    let isCancelled = false;
    const fetchTelemetry = async () => {
      setIsLoadingTelemetry(true);
      try {
        const data = await printerService.getPrintVolumeTelemetry(timeframe);
        if (!isCancelled) {
          setTelemetryData(data);
        }
      } catch (err) {
        console.error('Failed to load telemetry print volume:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingTelemetry(false);
        }
      }
    };

    fetchTelemetry();
    return () => {
      isCancelled = true;
    };
  }, [timeframe, printers]);

  // Check if we have valid telemetry series from Zabbix History
  const hasTelemetryData = useMemo(() => {
    return (
      telemetryData.length > 0 &&
      telemetryData.some(d => Array.isArray(d.buckets) && d.buckets.some(b => b.pagesPrinted !== null))
    );
  }, [telemetryData]);

  const generateTelemetryPoints = useCallback(
    (printer: Printer, _tf: '24h' | '7d' | '30d'): (number | null)[] => {
      const printerTelem = telemetryData.find(d => d.printerId === printer.id);
      if (!printerTelem || !Array.isArray(printerTelem.buckets)) return [];
      return printerTelem.buckets.map(b => b.pagesPrinted);
    },
    [telemetryData]
  );

  // Export CSV with comprehensive telemetry & counter audit data
  const handleExportCSV = () => {
    const headers = [
      'Printer ID',
      'Printer Name',
      'IP Address',
      'Manufacturer',
      'Model',
      'Device Type',
      'Color Capability',
      'Connection Status',
      'Monitoring Protocol',
      'Lifetime Total Pages',
      '30-Day Scraped Volume',
      'Copier Counter',
      'Fax Counter',
      'Scanner Counter',
      'Telemetry Status',
      'Last Successful Scrape',
      'Anomaly & Audit Note'
    ];

    const csvRows = [
      headers.join(','),
      ...printers.map(p => {
        let telemetryStatus = 'Verified';
        if (p.anomalyNote) telemetryStatus = `Anomaly: ${p.anomalyNote}`;
        else if (p.thirtyDayVolume === null) telemetryStatus = 'Data Unavailable (OID Unsupported)';
        else if (p.connectionStatus === 'Offline') telemetryStatus = 'Host Offline';

        return [
          p.id,
          `"${p.name}"`,
          p.ip,
          `"${p.mfr}"`,
          `"${p.model}"`,
          `"${p.deviceType}"`,
          `"${p.colorCapability || 'Monochrome'}"`,
          p.connectionStatus,
          `"${p.monitoringStatus}"`,
          p.counters.total,
          p.thirtyDayVolume,
          p.counters.copier,
          p.counters.fax,
          p.counters.scanner,
          `"${telemetryStatus}"`,
          `"${p.lastSuccessfulScrape}"`,
          `"${p.anomalyNote || ''}"`
        ].join(',');
      })
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `enterprise_printer_telemetry_analytics_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Actions Bar */}
      <AnalyticsHeader
        printers={printers}
        onExportCSV={handleExportCSV}
      />

      {/* KPI Cards & Counter Audit Panel */}
      <AnalyticsKPIs
        printers={printers}
        totalLifetimePages={totalLifetimePages}
        total30DayVolume={total30DayVolume}
        hasValid30DayData={hasValid30DayData}
        avgDailyVolume={avgDailyVolume}
        telemetryCoveragePercent={telemetryCoveragePercent}
        validTelemetryCount={validTelemetryPrinters.length}
        isLight={isLight}
      />

      {/* Biểu Đồ Sản Lượng In Theo Thời Gian */}
      <AnalyticsLoadCurves
        printers={printers}
        theme={theme}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        telemetryData={telemetryData}
        isLoadingTelemetry={isLoadingTelemetry}
        hasTelemetryData={hasTelemetryData}
        generateTelemetryPoints={generateTelemetryPoints}
        isLight={isLight}
      />

      {/* Horizontal Bar Chart: Usage by Printer */}
      <AnalyticsRankingChart
        printers={printers}
        rankedPrinters={rankedPrinters}
        rankingMetric={rankingMetric}
        setRankingMetric={setRankingMetric}
        rankingLimit={rankingLimit}
        setRankingLimit={setRankingLimit}
        theme={theme}
        isLight={isLight}
      />

      {/* Ranked Detailed Usage Table */}
      <AnalyticsTable
        printers={printers}
        onOpenPrinterModal={onOpenPrinterModal}
        isLight={isLight}
      />
    </div>
  );
};
