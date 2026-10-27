import React, { useState, useMemo } from 'react';
import { Printer } from '../types/printer';
import {
  SuppliesHeader,
  SuppliesChart,
  SuppliesAlertCards,
  SuppliesFilters,
  SuppliesTable,
  ConsumableKey
} from '../components/supplies';

interface SuppliesProps {
  printers: Printer[];
  onOpenPrinterModal: (printer: Printer) => void;
  isLoading?: boolean;
}

export const Supplies: React.FC<SuppliesProps> = ({
  printers,
  onOpenPrinterModal,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mfrFilter, setMfrFilter] = useState<string>('all');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('all');
  const [chartConsumable, setChartConsumable] = useState<ConsumableKey>('black');

  // Extract unique manufacturers
  const manufacturers = useMemo(() => {
    const set = new Set<string>();
    printers.forEach(p => {
      if (p.mfr) set.add(p.mfr);
    });
    return Array.from(set).sort();
  }, [printers]);

  // Filter low consumables (< 15% toner OR >= 85% waste toner)
  const lowPrinters = useMemo(() => {
    return printers.filter(p => {
      const s = p.supplies;
      const isBlackLow = typeof s.black === 'number' && s.black < 15;
      const isCyanLow = typeof s.cyan === 'number' && s.cyan < 15;
      const isMagentaLow = typeof s.magenta === 'number' && s.magenta < 15;
      const isYellowLow = typeof s.yellow === 'number' && s.yellow < 15;
      const isWasteFull = (typeof s.waste === 'number' && s.waste >= 85) || s.waste === 100;
      return isBlackLow || isCyanLow || isMagentaLow || isYellowLow || isWasteFull;
    });
  }, [printers]);

  // Filter table
  const filteredPrinters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return printers.filter(p => {
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.mfr.toLowerCase().includes(q) ||
        p.ip.includes(q) ||
        p.location.toLowerCase().includes(q);

      const matchMfr = mfrFilter === 'all' || p.mfr === mfrFilter;

      let matchStatus = true;
      const s = p.supplies;
      const isWasteFull = (typeof s.waste === 'number' && s.waste >= 85) || s.waste === 100;
      const hasAnyLow =
        (typeof s.black === 'number' && s.black < 15) ||
        (typeof s.cyan === 'number' && s.cyan < 15) ||
        (typeof s.magenta === 'number' && s.magenta < 15) ||
        (typeof s.yellow === 'number' && s.yellow < 15) ||
        isWasteFull;

      if (statusFilter === 'low') {
        matchStatus = hasAnyLow;
      } else if (statusFilter === 'normal') {
        matchStatus = !hasAnyLow && p.connectionStatus === 'Online';
      } else if (statusFilter === 'waste_full') {
        matchStatus = isWasteFull;
      } else if (statusFilter === 'unavailable') {
        matchStatus = p.supplies.black === null || p.connectionStatus === 'Offline';
      } else if (statusFilter === 'unknown') {
        matchStatus = p.supplies.black === null && p.connectionStatus === 'Online';
      } else if (statusFilter === 'monochrome') {
        matchStatus = p.colorCapability === 'Monochrome' || p.supplies.cyan === null;
      }

      const matchDeviceType = deviceTypeFilter === 'all' || p.deviceType === deviceTypeFilter;

      return matchQuery && matchMfr && matchStatus && matchDeviceType;
    });
  }, [printers, searchQuery, mfrFilter, statusFilter, deviceTypeFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setMfrFilter('all');
    setDeviceTypeFilter('all');
    setStatusFilter('all');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <SuppliesHeader
        totalCount={printers.length}
        hasPrinters={printers.length > 0}
      />

      {/* Horizontal Bar Chart: Compare Consumable Levels Across Printers */}
      <SuppliesChart
        printers={printers}
        chartConsumable={chartConsumable}
        onSelectConsumable={setChartConsumable}
      />

      {/* Low Supplies Attention Cards */}
      <SuppliesAlertCards
        lowPrinters={lowPrinters}
        onOpenPrinterModal={onOpenPrinterModal}
      />

      {/* Search & Filter Toolbar */}
      <SuppliesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        mfrFilter={mfrFilter}
        onMfrChange={setMfrFilter}
        manufacturers={manufacturers}
        deviceTypeFilter={deviceTypeFilter}
        onDeviceTypeChange={setDeviceTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onReset={handleResetFilters}
      />

      {/* Supplies Table */}
      <SuppliesTable
        printers={printers}
        filteredPrinters={filteredPrinters}
        onOpenPrinterModal={onOpenPrinterModal}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};
