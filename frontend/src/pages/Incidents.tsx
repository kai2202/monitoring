import React, { useState, useMemo } from 'react';
import { Incident } from '../types/printer';
import {
  IncidentsHeader,
  IncidentsKPIs,
  IncidentSeverityChart,
  IncidentFilters,
  IncidentTable,
} from '../components/incidents';

interface IncidentsProps {
  incidents: Incident[];
  onOpenIncidentModal: (incident: Incident) => void;
  onResolveIncident?: (incidentId: string) => void;
  onUpdateIncidentStatus?: (incidentId: string, status: 'Active' | 'Resolved') => void;
  isLoading?: boolean;
}

export const Incidents: React.FC<IncidentsProps> = ({
  incidents,
  onOpenIncidentModal,
  onUpdateIncidentStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [printerFilter, setPrinterFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Derived counts
  const totalCount = incidents.length;
  const activeCount = useMemo(() => incidents.filter(i => i.status === 'Active').length, [incidents]);
  const resolvedCount = useMemo(() => incidents.filter(i => i.status === 'Resolved').length, [incidents]);
  const criticalCount = useMemo(() => incidents.filter(i => i.severity === 'Critical').length, [incidents]);
  const warningCount = useMemo(() => incidents.filter(i => i.severity === 'Warning').length, [incidents]);
  const infoCount = useMemo(() => incidents.filter(i => i.severity === 'Info').length, [incidents]);

  // Unique printers & categories for filters
  const uniquePrinters = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach(i => {
      if (i.printer) set.add(i.printer);
    });
    return Array.from(set).sort();
  }, [incidents]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach(i => set.add(i.type));
    return Array.from(set).sort();
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && inc.status === 'Active') ||
        (filterStatus === 'resolved' && inc.status === 'Resolved');

      const matchSeverity = severityFilter === 'all' || inc.severity === severityFilter;
      const matchPrinter = printerFilter === 'all' || inc.printer === printerFilter;
      const matchCategory = categoryFilter === 'all' || inc.type === categoryFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (inc.printer && inc.printer.toLowerCase().includes(q)) ||
        inc.id.toLowerCase().includes(q) ||
        inc.type.toLowerCase().includes(q) ||
        inc.desc.toLowerCase().includes(q) ||
        (inc.diagnostic?.errorName && inc.diagnostic.errorName.toLowerCase().includes(q)) ||
        (inc.diagnostic?.rawCode && inc.diagnostic.rawCode.toLowerCase().includes(q));

      return matchStatus && matchSeverity && matchPrinter && matchCategory && matchQuery;
    });
  }, [incidents, filterStatus, severityFilter, printerFilter, categoryFilter, searchQuery]);

  const handleResetFilters = () => {
    setFilterStatus('active');
    setSearchQuery('');
    setSeverityFilter('all');
    setPrinterFilter('all');
    setCategoryFilter('all');
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    severityFilter !== 'all' ||
    printerFilter !== 'all' ||
    categoryFilter !== 'all'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title & Status Controls */}
      <IncidentsHeader
        totalCount={totalCount}
        activeCount={activeCount}
        resolvedCount={resolvedCount}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* TOP SECTION: KPI Summary Cards + Severity Bar Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <IncidentsKPIs
          totalCount={totalCount}
          activeCount={activeCount}
          criticalCount={criticalCount}
          resolvedCount={resolvedCount}
        />

        <IncidentSeverityChart
          totalIncidents={totalCount}
          criticalCount={criticalCount}
          warningCount={warningCount}
          infoCount={infoCount}
        />
      </div>

      {/* Search & Filters Toolbar */}
      <IncidentFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        printerFilter={printerFilter}
        setPrinterFilter={setPrinterFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        uniquePrinters={uniquePrinters}
        uniqueCategories={uniqueCategories}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Incidents Data Table */}
      <IncidentTable
        incidents={incidents}
        filteredIncidents={filteredIncidents}
        onOpenIncidentModal={onOpenIncidentModal}
        onUpdateIncidentStatus={onUpdateIncidentStatus}
      />
    </div>
  );
};
