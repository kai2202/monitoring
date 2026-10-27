import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Printer, Incident, TabType, ThemeMode } from './types/printer';
import { printerService } from './services/printerService';

import { usePrinterData } from './hooks/usePrinterData';

// Code-splitting: Lazy-load secondary views and heavy modals on-demand
const Printers = lazy(() => import('./pages/Printers').then(m => ({ default: m.Printers })));
const Supplies = lazy(() => import('./pages/Supplies').then(m => ({ default: m.Supplies })));
const Incidents = lazy(() => import('./pages/Incidents').then(m => ({ default: m.Incidents })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const PrinterDetailModal = lazy(() => import('./components/modals').then(m => ({ default: m.PrinterDetailModal })));
const IncidentDetailModal = lazy(() => import('./components/modals').then(m => ({ default: m.IncidentDetailModal })));

export const App: React.FC = () => {
  const {
    printers,
    incidents,
    isLoading,
    refresh,
    setPrinters,
    setIncidents,
  } = usePrinterData(300_000);

  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  
  // Default to dark navy theme matching the dashboard reference design
  const [theme, setTheme] = useState<ThemeMode>('dark');
  // Compact icon-only sidebar minimized by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Filter parameter for when navigating to Printers from Dashboard KPI cards
  const [printersFilterStatus, setPrintersFilterStatus] = useState<string>('all');

  // Modals state
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Sync theme attribute on <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Manual refresh handler passed to Dashboard (calls POST /api/sync)
  const handleManualRefresh = async () => {
    try {
      await printerService.syncPrinters();
      await refresh();
    } catch (err) {
      console.error('[App] Lỗi đồng bộ thủ công:', err);
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleNavigateTab = (tab: TabType, filterParam?: string) => {
    setCurrentTab(tab);
    if (tab === 'printers' && filterParam) {
      setPrintersFilterStatus(filterParam);
    }
  };

  const handleUpdateIncidentStatus = async (incidentId: string, newStatus: 'Active' | 'Resolved') => {
    // Cập nhật lạc quan (optimistic) giao diện ngay lập tức
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === incidentId) {
          const isActive = newStatus === 'Active';
          return {
            ...inc,
            status: newStatus,
            lifecycle: newStatus,
            endTime: isActive ? undefined : (inc.endTime || new Date().toISOString())
          };
        }
        return inc;
      })
    );

    // Gửi yêu cầu cập nhật lên backend
    const result = await printerService.updateIncidentStatus(incidentId, newStatus);
    if (!result.success) {
      alert(result.message);
      const refreshed = await printerService.getIncidents();
      setIncidents(refreshed);
    } else {
      // Cập nhật lại danh sách máy in để làm mới badge sức khỏe nếu sự cố thay đổi
      const refreshedPrinters = await printerService.getPrinters();
      setPrinters(refreshedPrinters);
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    await handleUpdateIncidentStatus(incidentId, 'Resolved');
  };

  const handleUpdatePrinterLocation = async (printerId: string, newLocation: string) => {
    // Cập nhật lạc quan (optimistic)
    setPrinters(prev =>
      prev.map(p => (p.id === printerId ? { ...p, location: newLocation } : p))
    );
    if (selectedPrinter && selectedPrinter.id === printerId) {
      setSelectedPrinter(prev => (prev ? { ...prev, location: newLocation } : null));
    }

    const result = await printerService.updatePrinterLocation(printerId, newLocation);
    if (!result.success) {
      alert(result.message);
      const refreshed = await printerService.getPrinters();
      setPrinters(refreshed);
    }
  };

  // Counts for sidebar badges
  const lowSuppliesCount = printers.filter(p =>
    (typeof p.supplies.yellow === 'number' && p.supplies.yellow < 15) ||
    (typeof p.supplies.black === 'number' && p.supplies.black < 15)
  ).length;

  const activeIncidentsCount = incidents.filter(i => i.status === 'Active').length;

  return (
    <div className="app-container">
      {/* Main Workspace Body - No header bar */}
      <div className="app-body">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setMobileSidebarOpen(false);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          printerCount={printers.length}
          lowSuppliesCount={lowSuppliesCount}
          activeIncidentsCount={activeIncidentsCount}
          mobileOpen={mobileSidebarOpen}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Dynamic Content Views */}
        <main className="main-content">
          {currentTab === 'dashboard' && (
            <Dashboard
              printers={printers}
              incidents={incidents}
              onNavigateTab={handleNavigateTab}
              onOpenPrinterModal={setSelectedPrinter}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              isLoading={isLoading}
              onRefresh={handleManualRefresh}
            />
          )}

          <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-muted)' }}>
              Đang tải dữ liệu trang...
            </div>
          }>
            {currentTab === 'printers' && (
              <Printers
                printers={printers}
                initialFilterStatus={printersFilterStatus}
                onOpenPrinterModal={setSelectedPrinter}
                isLoading={isLoading}
              />
            )}

            {currentTab === 'supplies' && (
              <Supplies
                printers={printers}
                onOpenPrinterModal={setSelectedPrinter}
                isLoading={isLoading}
              />
            )}

            {currentTab === 'incidents' && (
              <Incidents
                incidents={incidents}
                onOpenIncidentModal={setSelectedIncident}
                onResolveIncident={handleResolveIncident}
                onUpdateIncidentStatus={handleUpdateIncidentStatus}
                isLoading={isLoading}
                onRefresh={handleManualRefresh}
              />
            )}

            {currentTab === 'analytics' && (
              <Analytics
                printers={printers}
                theme={theme}
                onOpenPrinterModal={setSelectedPrinter}
                isLoading={isLoading}
              />
            )}
          </Suspense>
        </main>
      </div>

      {/* Detail Modals */}
      <Suspense fallback={null}>
        {selectedPrinter && (
          <PrinterDetailModal
            printer={selectedPrinter}
            onClose={() => setSelectedPrinter(null)}
            onUpdateLocation={handleUpdatePrinterLocation}
          />
        )}

        {selectedIncident && (
          <IncidentDetailModal
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            onResolveIncident={handleResolveIncident}
            onUpdateIncidentStatus={handleUpdateIncidentStatus}
          />
        )}
      </Suspense>
    </div>
  );
};
