/**
 * Frontend/src/tests/ProductionDistribution.test.tsx
 *
 * Unit tests cho:
 * 1. Hàm tính toán 10 dải phân bố sản lượng (getProductionDistributionBuckets & getFleet1000Devices)
 * 2. Component ProductionDistributionSection (Khối chính 10 cột, Toggle quy mô 1.000 / 30 máy, Filter tầng)
 * 3. Component ProductionRangeDrawer (Large Side Drawer 740px, Chart View, Table View, Quick Inspection Popover)
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  getProductionDistributionBuckets,
  getFleet1000Devices,
} from '../mocks/mockAnalyticsUIData';
import { ProductionDistributionSection } from '../components/analytics/ProductionDistributionSection';
import { ProductionRangeDrawer } from '../components/analytics/ProductionRangeDrawer';
import { ProductionDistributionBucket } from '../types/analyticsUI';

describe('1. Production Distribution Data Calculation', () => {
  it('generates 1.000 deterministic devices across 5 floors', () => {
    const devices = getFleet1000Devices('30days', []);
    expect(devices.length).toBe(1000);

    // Verify 5 floors coverage (~200 devices per floor)
    const floor1Count = devices.filter((d) => d.floor.includes('Tầng 1')).length;
    const floor2Count = devices.filter((d) => d.floor.includes('Tầng 2')).length;
    expect(floor1Count).toBe(200);
    expect(floor2Count).toBe(200);

    // Verify reasonable volume distribution
    const minVol = Math.min(...devices.map((d) => d.totalVolume));
    const maxVol = Math.max(...devices.map((d) => d.totalVolume));
    expect(minVol).toBeGreaterThanOrEqual(100);
    expect(maxVol).toBeLessThanOrEqual(25000);
  });

  it('calculates exactly 10 production distribution buckets with 100% total coverage', () => {
    const result = getProductionDistributionBuckets('30days', 'all', '1000', []);
    expect(result.buckets.length).toBe(10);
    expect(result.totalDevices).toBe(1000);

    const sumDevicesInBuckets = result.buckets.reduce((acc, b) => acc + b.deviceCount, 0);
    expect(sumDevicesInBuckets).toBe(1000);

    // Total percentage should be ~100%
    const sumPercentage = result.buckets.reduce((acc, b) => acc + b.percentageShare, 0);
    expect(Math.round(sumPercentage)).toBe(100);

    // Dominant bucket should exist
    expect(result.dominantBucket).not.toBeNull();
  });

  it('filters correctly by individual floor', () => {
    const resultFloor3 = getProductionDistributionBuckets('30days', 'floor-3', '1000', []);
    expect(resultFloor3.totalDevices).toBe(200);

    resultFloor3.buckets.forEach((bucket) => {
      bucket.devices.forEach((d) => {
        expect(d.floor).toContain('Tầng 3');
      });
    });
  });
});

describe('2. ProductionDistributionSection Component', () => {
  it('renders title, KPI cards, and 10 vertical distribution columns', () => {
    const handleTogglePin = vi.fn();

    render(
      <ProductionDistributionSection
        timeframe="30days"
        pinnedPrinterIds={['PRN-0001']}
        onTogglePinPrinter={handleTogglePin}
      />
    );

    // Title and subtitle
    expect(screen.getByText(/Phân Bố Sản Lượng In & Đóng Góp Hạm Đội/i)).toBeDefined();

    // Fleet scale toggle buttons
    expect(screen.getByText('1.000 Máy In')).toBeDefined();
    expect(screen.getByText('30 Máy Mẫu')).toBeDefined();

    // 10 distribution range labels
    expect(screen.getByTitle('0 – 500')).toBeDefined();
    expect(screen.getByTitle('2.001 – 3.000')).toBeDefined();
    expect(screen.getByTitle('> 15.000')).toBeDefined();
  });

  it('switches fleet scale between 1.000 devices and 30 sample devices', () => {
    const handleTogglePin = vi.fn();

    render(
      <ProductionDistributionSection
        timeframe="30days"
        pinnedPrinterIds={[]}
        onTogglePinPrinter={handleTogglePin}
      />
    );

    // Default: 1.000 devices
    expect(screen.getByText('1.000')).toBeDefined();

    // Switch to 30 sample devices
    const btn30 = screen.getByText('30 Máy Mẫu');
    fireEvent.click(btn30);

    expect(screen.getByText('30')).toBeDefined();
  });

  it('opens range settings modal, customizes column count, and applies settings', () => {
    const handleTogglePin = vi.fn();

    render(
      <ProductionDistributionSection
        timeframe="30days"
        pinnedPrinterIds={[]}
        onTogglePinPrinter={handleTogglePin}
      />
    );

    // Click "Cài đặt dải (10 cột)"
    const settingsBtn = screen.getByText(/Cài đặt dải/i);
    fireEvent.click(settingsBtn);

    // Modal opens
    expect(screen.getByText('Cài Đặt Dải Phân Bố Sản Lượng')).toBeDefined();

    // Select 6 columns preset
    const btn6Cols = screen.getByText('6 cột');
    fireEvent.click(btn6Cols);

    // Apply settings
    const applyBtn = screen.getByText('Áp dụng cấu hình');
    fireEvent.click(applyBtn);

    // Modal closes and button now indicates 6 columns
    expect(screen.getByText(/Cài đặt dải \(6 cột\)/i)).toBeDefined();
  });
});

describe('3. ProductionRangeDrawer Component', () => {
  const sampleBucket: ProductionDistributionBucket = {
    id: 'b4',
    rangeLabel: '2.001 – 3.000',
    minVolume: 2001,
    maxVolume: 3000,
    deviceCount: 245,
    percentageShare: 24.5,
    totalVolume: 612500,
    avgVolume: 2500,
    devices: [
      {
        printerId: 'PRN-0042',
        printerName: 'Canon iR-ADV C5560i #0042',
        model: 'iR-ADV C5560i III',
        brand: 'Canon',
        floor: 'Tầng 1',
        department: 'Phòng Kinh doanh & Sales',
        totalVolume: 2850,
        colorVolume: 1200,
        monoVolume: 1650,
        percentageInFloor: 1.4,
        percentageInFleet: 0.28,
        isPinned: false,
        ip: '192.168.10.42',
        serial: 'CA20260042',
        status: 'Online',
        health: 'Healthy',
        tonerK: 85,
        drumLife: 90,
      },
      {
        printerId: 'PRN-0105',
        printerName: 'HP LaserJet Managed #0105',
        model: 'LaserJet E82650',
        brand: 'HP',
        floor: 'Tầng 2',
        department: 'Phòng Kế toán & Tài chính',
        totalVolume: 2600,
        colorVolume: 0,
        monoVolume: 2600,
        percentageInFloor: 1.3,
        percentageInFleet: 0.26,
        isPinned: true,
        ip: '192.168.20.105',
        serial: 'HP20260105',
        status: 'Online',
        health: 'Healthy',
        tonerK: 60,
        drumLife: 75,
      },
    ],
  };

  it('renders Device Explorer table, dropdown filters and dynamic KPIs', () => {
    const handleClose = vi.fn();
    const handleTogglePin = vi.fn();
    const handleBulkPin = vi.fn();

    render(
      <ProductionRangeDrawer
        bucket={sampleBucket}
        isOpen={true}
        onClose={handleClose}
        pinnedPrinterIds={['PRN-0105']}
        onTogglePinPrinter={handleTogglePin}
        onAddMultiplePinnedPrinters={handleBulkPin}
      />
    );

    // Header badge & title
    expect(screen.getByText('Dải 2.001 – 3.000 trang')).toBeDefined();
    expect(screen.getByText(/Device Explorer — Danh Sách Thiết Bị Trong Dải/i)).toBeDefined();

    // 4 Dynamic KPI Summary cards
    expect(screen.getByText('2')).toBeDefined(); // processed count (2 sample devices)
    expect(screen.getByText('5.450')).toBeDefined(); // totalVolume of filtered (2850 + 2600)
    expect(screen.getByText('2.725')).toBeDefined(); // avgVolume of filtered
    expect(screen.getByText('24.5%')).toBeDefined(); // percentageShare of bucket in fleet

    // Verify Dropdown filter exists
    expect(screen.getByText(/Tất cả thương hiệu/i)).toBeDefined();
    expect(screen.getByText(/Tất cả các tầng/i)).toBeDefined();
    expect(screen.getByText(/Tất cả trạng thái/i)).toBeDefined();

    // Verify table columns exist
    expect(screen.getByText('Hãng & Thiết bị (Model)')).toBeDefined();
    expect(screen.getByText('Vị trí & Phòng ban')).toBeDefined();
    expect(screen.getByText('Trạng thái & Mực in')).toBeDefined();
    expect(screen.getByText('Sản lượng in')).toBeDefined();

    // Verify devices exist in table
    expect(screen.getByText('Canon iR-ADV C5560i #0042')).toBeDefined();
    expect(screen.getByText('HP LaserJet Managed #0105')).toBeDefined();

    // Verify Pin button renders clean text without icons
    expect(screen.getByText('Đã ghim')).toBeDefined(); // PRN-0105 is pinned
    expect(screen.getByText('Ghim')).toBeDefined(); // PRN-0042 is unpinned
  });

  it('opens Quick Inspection Popover when clicking on a device', () => {
    const handleClose = vi.fn();
    const handleTogglePin = vi.fn();
    const handleBulkPin = vi.fn();

    render(
      <ProductionRangeDrawer
        bucket={sampleBucket}
        isOpen={true}
        onClose={handleClose}
        pinnedPrinterIds={[]}
        onTogglePinPrinter={handleTogglePin}
        onAddMultiplePinnedPrinters={handleBulkPin}
      />
    );

    // Click on the device row in Table View
    const deviceRow = screen.getByText('Canon iR-ADV C5560i #0042');
    fireEvent.click(deviceRow);

    // Popover should appear with IP, Serial and Supplies
    expect(screen.getByText('192.168.10.42')).toBeDefined();
    expect(screen.getByText('CA20260042')).toBeDefined();
    expect(screen.getByText('Mực in & Tuổi thọ trống (Toner & Drum)')).toBeDefined();
  });
});

