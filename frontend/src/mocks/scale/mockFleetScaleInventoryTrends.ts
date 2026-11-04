import {
  TimeGranularity,
  PrinterInventoryItem,
  InventoryTableResponse,
  PrinterComparisonDetail,
  ProductionTrendResponse,
  ProductionTrendPoint,
  Printer3DScatterPoint,
} from '../../types/analytics';
import {
  mockFleetPrinters,
  getPrinterDailyVolume,
} from './mockFleetScaleBase';

// =========================================================================
// 3. INVENTORY TABLE ANALYTICS (PAGINATION, SORT, FILTER)
// =========================================================================
export function generateInventoryTable(
  page = 1,
  pageSize = 10,
  search?: string,
  brand?: string,
  department?: string,
  sortBy: 'rank' | 'currentPeriodPages' | 'growthRatePercent' | 'printerName' = 'currentPeriodPages',
  sortOrder: 'asc' | 'desc' = 'desc'
): InventoryTableResponse {
  // Tính toán sản lượng kỳ này (30 ngày) và kỳ trước (30 ngày trước đó)
  let allItems: PrinterInventoryItem[] = mockFleetPrinters.map(p => {
    const daily = getPrinterDailyVolume(p);
    const currentDaily = daily.slice(-30);
    const currentPeriodPages = currentDaily.reduce((s, d) => s + d.total, 0);
    const currentColorPages = currentDaily.reduce((s, d) => s + d.color, 0);

    // Giả lập kỳ trước có dao động ±15%
    const seed = parseInt(p.id.slice(4) || '1', 10);
    const factor = 0.85 + (seed % 30) * 0.01;
    const previousPeriodPages = Math.round(currentPeriodPages * factor);

    const growthRatePercent =
      previousPeriodPages > 0
        ? Number((((currentPeriodPages - previousPeriodPages) / previousPeriodPages) * 100).toFixed(1))
        : 0;

    const colorRatioPercent =
      currentPeriodPages > 0
        ? Number(((currentColorPages / currentPeriodPages) * 100).toFixed(1))
        : 0;

    return {
      rank: 0,
      printerId: p.id,
      printerName: p.name,
      model: p.model,
      brand: p.brand,
      department: p.department,
      currentPeriodPages,
      previousPeriodPages,
      growthRatePercent,
      colorRatioPercent,
      uptimePercent: p.uptimePercent,
      incidentCount: p.incidentCount,
    };
  });

  // Xếp hạng tổng thể
  allItems.sort((a, b) => (b.currentPeriodPages || 0) - (a.currentPeriodPages || 0));
  allItems.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  // Lọc
  if (brand && brand !== 'all') {
    allItems = allItems.filter(i => i.brand.toLowerCase() === brand.toLowerCase());
  }
  if (department && department !== 'all') {
    allItems = allItems.filter(i => i.department === department);
  }
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    allItems = allItems.filter(
      i =>
        i.printerId.toLowerCase().includes(q) ||
        i.printerName.toLowerCase().includes(q) ||
        i.model.toLowerCase().includes(q) ||
        i.department.toLowerCase().includes(q)
    );
  }

  // Sắp xếp
  allItems.sort((a, b) => {
    let diff = 0;
    if (sortBy === 'currentPeriodPages') {
      diff = (a.currentPeriodPages || 0) - (b.currentPeriodPages || 0);
    } else if (sortBy === 'growthRatePercent') {
      diff = (a.growthRatePercent || 0) - (b.growthRatePercent || 0);
    } else if (sortBy === 'printerName') {
      diff = a.printerName.localeCompare(b.printerName);
    } else {
      diff = a.rank - b.rank;
    }
    return sortOrder === 'desc' ? -diff : diff;
  });

  const totalCount = allItems.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const items = allItems.slice(startIndex, startIndex + pageSize);

  return {
    items,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

// =========================================================================
// 4. PRINTER COMPARISON DETAIL (BẤT KỲ P001 - P1000)
// =========================================================================
export function generatePrinterComparison(printerIds: string[], periodDays = 30): PrinterComparisonDetail[] {
  return printerIds
    .map(id => {
      const printer = mockFleetPrinters.find(p => p.id === id);
      if (!printer) return null;

      const daily = getPrinterDailyVolume(printer).slice(-periodDays);
      const currentVolume = daily.reduce((s, d) => s + d.total, 0);
      const colorVolume = daily.reduce((s, d) => s + d.color, 0);
      const monoVolume = daily.reduce((s, d) => s + d.mono, 0);

      const seed = parseInt(printer.id.slice(4) || '1', 10);
      const factor = 0.88 + (seed % 25) * 0.01;
      const previousVolume = Math.round(currentVolume * factor);

      const growthRatePercent =
        previousVolume > 0
          ? Number((((currentVolume - previousVolume) / previousVolume) * 100).toFixed(1))
          : 0;

      const colorRatioPercent =
        currentVolume > 0 ? Number(((colorVolume / currentVolume) * 100).toFixed(1)) : 0;

      const averageDailyPages = Math.round(currentVolume / Math.max(1, periodDays));

      return {
        printerId: printer.id,
        printerName: printer.name,
        model: printer.model,
        brand: printer.brand,
        department: printer.department,
        connectionStatus: printer.connectionStatus,
        currentVolume,
        previousVolume,
        growthRatePercent,
        colorVolume,
        monoVolume,
        colorRatioPercent,
        uptimePercent: printer.uptimePercent,
        incidentCount: printer.incidentCount,
        averageDailyPages,
        dailyTrend: daily.map(d => ({
          date: d.date,
          totalPages: d.total,
          colorPages: d.color,
          monoPages: d.mono,
        })),
      };
    })
    .filter((p): p is PrinterComparisonDetail => p !== null);
}

// =========================================================================
// 5. PRODUCTION TREND ADVANCED (FLEET AGGREGATE + OPTIONAL OVERLAYS)
// =========================================================================
const PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export function generateProductionTrendAdvanced(
  granularity: TimeGranularity = 'daily',
  days = 30,
  selectedPrinterIds: string[] = []
): ProductionTrendResponse {
  const now = new Date();
  const trendPoints: ProductionTrendPoint[] = [];

  // Metadata cho các máy được chọn
  const selectedPrintersMetadata = selectedPrinterIds
    .map((id, idx) => {
      const p = mockFleetPrinters.find(item => item.id === id);
      return p ? { printerId: p.id, name: p.name, color: PALETTE[idx % PALETTE.length] } : null;
    })
    .filter((m): m is { printerId: string; name: string; color: string } => m !== null);

  if (granularity === 'daily') {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const dateKey = d.toISOString().split('T')[0];
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

      // Tổng sản lượng máy in 120 máy
      const baseDailyTotal = isWeekend ? 4500 : 28500;
      const variance = ((i * 137) % 3500);
      const totalFleetPages = baseDailyTotal + variance;
      const totalFleetColorPages = Math.round(totalFleetPages * 0.38);
      const totalFleetMonoPages = totalFleetPages - totalFleetColorPages;

      // Sản lượng của từng máy được chọn
      const selectedPrinters: Record<string, number | null> = {};
      selectedPrinterIds.forEach(id => {
        const p = mockFleetPrinters.find(item => item.id === id);
        if (p) {
          const pDaily = getPrinterDailyVolume(p);
          const rec = pDaily.find(r => r.date === dateKey);
          selectedPrinters[id] = rec ? rec.total : 0;
        }
      });

      const day = d.getDate();
      const month = d.getMonth() + 1;

      trendPoints.push({
        dateKey,
        label: `${day}/${month}`,
        totalFleetPages,
        totalFleetColorPages,
        totalFleetMonoPages,
        selectedPrinters,
      });
    }
  } else if (granularity === 'weekly') {
    for (let i = 11; i >= 0; i--) {
      const dateKey = `W-${12 - i}`;
      const totalFleetPages = 175000 + ((i * 4500) % 25000);
      const totalFleetColorPages = Math.round(totalFleetPages * 0.38);
      const totalFleetMonoPages = totalFleetPages - totalFleetColorPages;

      const selectedPrinters: Record<string, number | null> = {};
      selectedPrinterIds.forEach(id => {
        const p = mockFleetPrinters.find(item => item.id === id);
        if (p) {
          selectedPrinters[id] = Math.round((p.baseCapacity / 4) * (0.85 + (i % 4) * 0.08));
        }
      });

      trendPoints.push({
        dateKey,
        label: `Tuần ${12 - i}`,
        totalFleetPages,
        totalFleetColorPages,
        totalFleetMonoPages,
        selectedPrinters,
      });
    }
  } else {
    // monthly
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dateKey = `M-${d.getFullYear()}-${d.getMonth() + 1}`;
      const totalFleetPages = 750000 + ((i * 35000) % 90000);
      const totalFleetColorPages = Math.round(totalFleetPages * 0.39);
      const totalFleetMonoPages = totalFleetPages - totalFleetColorPages;

      const selectedPrinters: Record<string, number | null> = {};
      selectedPrinterIds.forEach(id => {
        const p = mockFleetPrinters.find(item => item.id === id);
        if (p) {
          selectedPrinters[id] = Math.round(p.baseCapacity * (0.88 + (i % 5) * 0.06));
        }
      });

      trendPoints.push({
        dateKey,
        label: `Tháng ${d.getMonth() + 1}`,
        totalFleetPages,
        totalFleetColorPages,
        totalFleetMonoPages,
        selectedPrinters,
      });
    }
  }

  return {
    granularity,
    trendPoints,
    selectedPrintersMetadata,
  };
}

// =========================================================================
// 6. LAYER 3: 3D SCATTER PLOT DATA (VOLUME vs MAINTENANCE COST vs ERROR FREQ)
// =========================================================================
export function generate3DScatterData(brand?: string, department?: string): Printer3DScatterPoint[] {
  let list = [...mockFleetPrinters];

  if (brand && brand !== 'all') {
    list = list.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }
  if (department && department !== 'all') {
    list = list.filter(p => p.department === department);
  }

  return list.map(p => {
    const daily = getPrinterDailyVolume(p);
    const monthlyVolume = daily.reduce((s, d) => s + d.total, 0);
    const currentColor = daily.reduce((s, d) => s + d.color, 0);
    const colorRatioPercent = monthlyVolume > 0 ? Number(((currentColor / monthlyVolume) * 100).toFixed(1)) : 0;

    const numId = parseInt(p.id.slice(4) || '1', 10);
    let maintenanceCost: number | null = null;
    if (numId % 3 === 0 || p.incidentCount >= 3) {
      maintenanceCost = Number((1.5 + (p.incidentCount * 1.8) + (numId % 5) * 0.4).toFixed(1));
    }

    const health: 'Healthy' | 'Warning' | 'Critical' =
      p.incidentCount >= 5 || p.connectionStatus === 'Offline'
        ? 'Critical'
        : p.incidentCount >= 2
        ? 'Warning'
        : 'Healthy';

    return {
      printerId: p.id,
      printerName: p.name,
      model: p.model,
      brand: p.brand,
      department: p.department,
      monthlyVolume,
      maintenanceCost,
      errorFrequency: p.incidentCount,
      health,
      connectionStatus: p.connectionStatus,
      colorRatioPercent,
    };
  });
}

