import React, { useState, useMemo, useEffect } from 'react';
import { Printer } from '../types/printer';
import {
  PrintersHeader,
  PrinterPills,
  PrinterFilters,
  PrinterTable,
} from '../components/printers';

interface PrintersProps {
  printers: Printer[];
  initialFilterStatus?: string;
  onOpenPrinterModal: (printer: Printer) => void;
  isLoading?: boolean;
}

export const Printers: React.FC<PrintersProps> = ({
  printers,
  initialFilterStatus = 'all',
  onOpenPrinterModal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<string>(initialFilterStatus);
  const [mfrFilter, setMfrFilter] = useState<string>('all');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('severity');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Synchronize when initialFilterStatus changes from parent (e.g. clicking KPI card on Dashboard)
  useEffect(() => {
    if (initialFilterStatus) {
      setQuickFilter(initialFilterStatus);
      setCurrentPage(1);
    }
  }, [initialFilterStatus]);

  // Extract unique manufacturers & device types
  const manufacturers = useMemo(() => {
    const set = new Set<string>();
    printers.forEach(p => {
      if (p.mfr) set.add(p.mfr);
    });
    return Array.from(set).sort();
  }, [printers]);

  const deviceTypes = useMemo(() => {
    const set = new Set<string>();
    printers.forEach(p => {
      if (p.deviceType) set.add(p.deviceType);
    });
    return Array.from(set).sort();
  }, [printers]);

  // Counts for header
  const counts = useMemo(() => {
    return {
      total: printers.length,
      online: printers.filter(p => p.connectionStatus === 'Online').length,
      offline: printers.filter(p => p.connectionStatus === 'Offline').length,
      attention: printers.filter(p => p.connectionStatus === 'Offline' || p.alertSeverity === 'critical' || p.alertSeverity === 'warning' || p.isStale).length,
    };
  }, [printers]);

  // Filter & sort
  const filteredPrinters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result = printers.filter(p => {
      // 1. Text Search across supported fields
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.ip.includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.mfr.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.deviceType && p.deviceType.toLowerCase().includes(q)) ||
        (p.serial && p.serial.toLowerCase().includes(q));

      // 2. Quick status filter
      let matchQuick = true;
      if (quickFilter === 'Online') matchQuick = p.connectionStatus === 'Online';
      else if (quickFilter === 'Offline') matchQuick = p.connectionStatus === 'Offline';
      else if (quickFilter === 'Unknown') matchQuick = p.connectionStatus === 'Unknown';
      else if (quickFilter === 'Critical') matchQuick = p.alertSeverity === 'critical' || p.connectionStatus === 'Offline';
      else if (quickFilter === 'Warning') matchQuick = p.alertSeverity === 'warning';
      else if (quickFilter === 'Stale') matchQuick = !!p.isStale;
      else if (quickFilter === 'Attention') {
        matchQuick = p.connectionStatus === 'Offline' || p.alertSeverity === 'critical' || p.alertSeverity === 'warning' || !!p.isStale;
      }

      // 3. Manufacturer filter
      const matchMfr = mfrFilter === 'all' || p.mfr === mfrFilter;

      // 4. Device Type filter
      const matchType = deviceTypeFilter === 'all' || p.deviceType === deviceTypeFilter;

      return matchSearch && matchQuick && matchMfr && matchType;
    });

    // 5. Predictable Sorting
    const sorted = [...result];
    sorted.sort((a, b) => {
      if (sortBy === 'severity') {
        const order: Record<string, number> = { critical: 4, warning: 3, unknown: 2, clear: 1 };
        const aSev = a.connectionStatus === 'Offline' ? 4 : (order[a.alertSeverity] || 1);
        const bSev = b.connectionStatus === 'Offline' ? 4 : (order[b.alertSeverity] || 1);
        const diff = bSev - aSev;
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'downtime') {
        const parseMinutes = (p: Printer) => {
          if (p.connectionStatus !== 'Offline' || !p.downtimeDuration) return 0;
          let mins = 0;
          const matchH = p.downtimeDuration.match(/(\d+)h/);
          const matchM = p.downtimeDuration.match(/(\d+)m/);
          if (matchH) mins += parseInt(matchH[1], 10) * 60;
          if (matchM) mins += parseInt(matchM[1], 10);
          return mins;
        };
        return parseMinutes(b) - parseMinutes(a);
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'id') return a.id.localeCompare(b.id);
      if (sortBy === 'ip') return a.ip.localeCompare(b.ip);
      if (sortBy === 'mfr') return a.mfr.localeCompare(b.mfr);
      if (sortBy === 'type') return (a.deviceType || '').localeCompare(b.deviceType || '');
      return 0;
    });

    return sorted;
  }, [printers, searchQuery, quickFilter, mfrFilter, deviceTypeFilter, sortBy]);

  // Pagination calculation
  const totalItems = filteredPrinters.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedPrinters = filteredPrinters.slice(startIndex, startIndex + pageSize);

  const handleResetFilters = () => {
    setSearchQuery('');
    setQuickFilter('all');
    setMfrFilter('all');
    setDeviceTypeFilter('all');
    setSortBy('severity');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    quickFilter !== 'all' ||
    mfrFilter !== 'all' ||
    deviceTypeFilter !== 'all' ||
    sortBy !== 'severity'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title & Segmented Status Controls */}
      <PrintersHeader
        totalCount={printers.length}
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
        onResetPage={() => setCurrentPage(1)}
        counts={counts}
      />

      {/* Quick Filter Pills */}
      <PrinterPills
        printers={printers}
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
        onResetPage={() => setCurrentPage(1)}
      />

      {/* Filter Toolbar */}
      <PrinterFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        deviceTypeFilter={deviceTypeFilter}
        setDeviceTypeFilter={setDeviceTypeFilter}
        deviceTypes={deviceTypes}
        mfrFilter={mfrFilter}
        setMfrFilter={setMfrFilter}
        manufacturers={manufacturers}
        sortBy={sortBy}
        setSortBy={setSortBy}
        pageSize={pageSize}
        setPageSize={setPageSize}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        onResetPage={() => setCurrentPage(1)}
      />

      {/* Printers Data Table & Pagination */}
      <PrinterTable
        printers={printers}
        filteredPrinters={filteredPrinters}
        paginatedPrinters={paginatedPrinters}
        currentPage={safeCurrentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
        mfrFilter={mfrFilter}
        setMfrFilter={setMfrFilter}
        deviceTypeFilter={deviceTypeFilter}
        setDeviceTypeFilter={setDeviceTypeFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onResetFilters={handleResetFilters}
        onOpenPrinterModal={onOpenPrinterModal}
      />
    </div>
  );
};
