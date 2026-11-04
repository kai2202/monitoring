import React, { useState, useMemo, useEffect } from 'react';
import { ProductionDistributionBucket, DeviceFloorContributionItem } from '../../../../types/analyticsUI';
import { DeviceExplorerHeader } from './DeviceExplorerHeader';
import { DeviceExplorerFilters } from './DeviceExplorerFilters';
import { DeviceExplorerTable } from './DeviceExplorerTable';
import { DeviceExplorerInspectionModal } from './DeviceExplorerInspectionModal';

export interface ProductionRangeDrawerProps {
  bucket: ProductionDistributionBucket | null;
  isOpen: boolean;
  onClose: () => void;
  pinnedPrinterIds: string[];
  onTogglePinPrinter: (printerId: string) => void;
  onAddMultiplePinnedPrinters?: (printerIds: string[]) => void;
}

export const ProductionRangeDrawer: React.FC<ProductionRangeDrawerProps> = ({
  bucket,
  isOpen,
  onClose,
  pinnedPrinterIds,
  onTogglePinPrinter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<'volume' | 'name' | 'floor' | 'brand' | 'status'>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [inspectingDevice, setInspectingDevice] = useState<DeviceFloorContributionItem | null>(null);

  const availableBrands = useMemo(() => {
    if (!bucket) return [];
    const brands = Array.from(new Set(bucket.devices.map((d) => d.brand).filter(Boolean)));
    return brands.sort((a, b) => a.localeCompare(b));
  }, [bucket]);

  const availableFloors = useMemo(() => {
    if (!bucket) return [];
    const floors = Array.from(new Set(bucket.devices.map((d) => d.floor).filter(Boolean)));
    return floors.sort((a, b) => a.localeCompare(b));
  }, [bucket]);

  const processedDevices = useMemo(() => {
    if (!bucket) return [];
    let list = [...bucket.devices];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (d) =>
          d.printerName.toLowerCase().includes(q) ||
          d.model.toLowerCase().includes(q) ||
          d.brand.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q) ||
          d.floor.toLowerCase().includes(q) ||
          d.printerId.toLowerCase().includes(q) ||
          (d.ip && d.ip.includes(q))
      );
    }

    if (filterBrand !== 'all') {
      list = list.filter((d) => d.brand.toLowerCase() === filterBrand.toLowerCase());
    }

    if (filterFloor !== 'all') {
      list = list.filter((d) => d.floor === filterFloor);
    }

    if (filterStatus !== 'all') {
      list = list.filter((d) => d.status === filterStatus);
    }

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'volume') {
        comparison = a.totalVolume - b.totalVolume;
      } else if (sortField === 'name') {
        comparison = a.printerName.localeCompare(b.printerName);
      } else if (sortField === 'brand') {
        comparison = a.brand.localeCompare(b.brand);
      } else if (sortField === 'floor') {
        comparison = a.floor.localeCompare(b.floor);
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return list;
  }, [bucket, searchTerm, filterBrand, filterFloor, filterStatus, sortField, sortOrder]);

  const dynamicKPIs = useMemo(() => {
    const count = processedDevices.length;
    const totalVol = processedDevices.reduce((sum, d) => sum + d.totalVolume, 0);
    const avgVol = count > 0 ? Math.round(totalVol / count) : 0;
    const pctOfBucket =
      bucket && bucket.deviceCount > 0
        ? Number(((count / bucket.deviceCount) * 100).toFixed(1))
        : 0;

    return { count, totalVol, avgVol, pctOfBucket };
  }, [processedDevices, bucket]);

  const totalPages = Math.max(1, Math.ceil(processedDevices.length / pageSize));
  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedDevices.slice(start, start + pageSize);
  }, [processedDevices, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterBrand('all');
    setFilterFloor('all');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  const isFiltered = searchTerm.trim() !== '' || filterBrand !== 'all' || filterFloor !== 'all' || filterStatus !== 'all';

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectingDevice) {
          setInspectingDevice(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, inspectingDevice]);

  if (!isOpen || !bucket) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        transition: 'opacity 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          height: '100%',
          backgroundColor: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <DeviceExplorerHeader
          bucket={bucket}
          dynamicKPIs={dynamicKPIs}
          onClose={onClose}
        />

        <div style={{ padding: '0 24px' }}>
          <DeviceExplorerFilters
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            pageSize={pageSize}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
            filterBrand={filterBrand}
            onFilterBrandChange={(b) => {
              setFilterBrand(b);
              setCurrentPage(1);
            }}
            filterFloor={filterFloor}
            onFilterFloorChange={(fl) => {
              setFilterFloor(fl);
              setCurrentPage(1);
            }}
            filterStatus={filterStatus}
            onFilterStatusChange={(s) => {
              setFilterStatus(s);
              setCurrentPage(1);
            }}
            availableBrands={availableBrands}
            availableFloors={availableFloors}
            isFiltered={isFiltered}
            onResetFilters={handleResetFilters}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', position: 'relative' }}>
          <DeviceExplorerTable
            paginatedDevices={paginatedDevices}
            processedDevicesCount={processedDevices.length}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={(field) => {
              setSortField(field);
              setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
            }}
            pinnedPrinterIds={pinnedPrinterIds}
            onTogglePinPrinter={onTogglePinPrinter}
            onInspectDevice={setInspectingDevice}
          />

          <DeviceExplorerInspectionModal
            device={inspectingDevice}
            onClose={() => setInspectingDevice(null)}
            isPinned={inspectingDevice ? pinnedPrinterIds.includes(inspectingDevice.printerId) : false}
            onTogglePin={onTogglePinPrinter}
          />
        </div>
      </div>
    </div>
  );
};

