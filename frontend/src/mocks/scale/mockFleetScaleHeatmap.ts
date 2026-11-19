import {
  TimeGranularity,
  FleetHeatmapResponse,
  HeatmapPrinterRow,
  HeatmapCell,
  RankingScope,
  PrinterRankingItem,
} from '../../types/analytics';
import {
  mockFleetPrinters,
  getPrinterDailyVolume,
} from './mockFleetScaleBase';

// =========================================================================
// 1. HEATMAP FLEET OVERVIEW
// =========================================================================
export function generateFleetHeatmap(
  granularity: TimeGranularity = 'daily',
  brand?: string,
  department?: string,
  search?: string,
  limit = 50
): FleetHeatmapResponse {
  // Lọc máy in
  let filtered = [...mockFleetPrinters];

  if (brand && brand !== 'all') {
    filtered = filtered.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }
  if (department && department !== 'all') {
    filtered = filtered.filter(p => p.department === department);
  }
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      p =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q)
    );
  }

  // Giới hạn để UI render mượt mà
  const selectedPrinters = filtered.slice(0, limit);

  // Tạo các mốc thời gian theo granularity
  const timeColumns: { key: string; label: string }[] = [];
  const now = new Date();

  if (granularity === 'daily') {
    // 30 ngày qua
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const key = d.toISOString().split('T')[0];
      const day = d.getDate();
      const month = d.getMonth() + 1;
      timeColumns.push({ key, label: `${day}/${month}` });
    }
  } else if (granularity === 'weekly') {
    // 12 tuần qua
    for (let i = 11; i >= 0; i--) {
      const key = `W-${12 - i}`;
      timeColumns.push({ key, label: `Tuần ${12 - i}` });
    }
  } else {
    // 12 tháng qua
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `M-${d.getFullYear()}-${d.getMonth() + 1}`;
      timeColumns.push({ key, label: `Th${d.getMonth() + 1}` });
    }
  }

  // Tính sản lượng cho từng máy
  let maxVolume = 1;
  const rows: HeatmapPrinterRow[] = selectedPrinters.map(printer => {
    const dailyRecords = getPrinterDailyVolume(printer);
    const cells: HeatmapCell[] = [];
    let totalPeriodPages = 0;

    if (granularity === 'daily') {
      timeColumns.forEach((col, idx) => {
        const rec = dailyRecords[idx] || { total: 0, color: 0, mono: 0 };
        totalPeriodPages += rec.total;
        if (rec.total > maxVolume) maxVolume = rec.total;

        cells.push({
          periodKey: col.key,
          periodLabel: col.label,
          pages: rec.total,
          colorPages: rec.color,
          monoPages: rec.mono,
          intensity: 0, // sẽ tính sau khi có maxVolume
          isAbnormal: rec.total > (printer.baseCapacity / 30) * 1.8,
        });
      });
    } else {
      // Aggregate theo tuần hoặc tháng
      const chunkCount = timeColumns.length;
      timeColumns.forEach((col, colIdx) => {
        const start = Math.floor((colIdx * 30) / chunkCount);
        const end = Math.floor(((colIdx + 1) * 30) / chunkCount);
        const slice = dailyRecords.slice(start, end);
        const sumTotal = slice.reduce((s, r) => s + r.total, 0);
        const sumColor = slice.reduce((s, r) => s + r.color, 0);
        const sumMono = slice.reduce((s, r) => s + r.mono, 0);

        totalPeriodPages += sumTotal;
        if (sumTotal > maxVolume) maxVolume = sumTotal;

        cells.push({
          periodKey: col.key,
          periodLabel: col.label,
          pages: sumTotal,
          colorPages: sumColor,
          monoPages: sumMono,
          intensity: 0,
          isAbnormal: false,
        });
      });
    }

    return {
      printerId: printer.id,
      printerName: printer.name,
      model: printer.model,
      brand: printer.brand,
      department: printer.department,
      totalPeriodPages,
      cells,
    };
  });

  // Gán intensity (0..1)
  rows.forEach(r => {
    r.cells.forEach(c => {
      c.intensity = maxVolume > 0 && c.pages ? Number((c.pages / maxVolume).toFixed(2)) : 0;
    });
  });

  return {
    granularity,
    timeColumns,
    maxVolumeInCell: maxVolume,
    totalPrinters: filtered.length,
    rows,
  };
}

// =========================================================================
// 2. RANKED BAR CHART DATA
// =========================================================================
export function generatePrinterRankings(
  scope: RankingScope = 'top10',
  periodDays = 30,
  search?: string,
  brand?: string
): PrinterRankingItem[] {
  let list = mockFleetPrinters.map(p => {
    const daily = getPrinterDailyVolume(p).slice(-periodDays);
    const totalPages = daily.reduce((s, d) => s + d.total, 0);
    const colorPages = daily.reduce((s, d) => s + d.color, 0);
    const monoPages = daily.reduce((s, d) => s + d.mono, 0);

    return {
      printerId: p.id,
      printerName: p.name,
      model: p.model,
      brand: p.brand,
      department: p.department,
      totalPages,
      colorPages,
      monoPages,
      sharePercent: 0,
    };
  });

  // Lọc theo search & brand
  if (brand && brand !== 'all') {
    list = list.filter(item => item.brand.toLowerCase() === brand.toLowerCase());
  }
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      item =>
        item.printerId.toLowerCase().includes(q) ||
        item.printerName.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q)
    );
  }

  // Sắp xếp giảm dần theo totalPages
  list.sort((a, b) => (b.totalPages || 0) - (a.totalPages || 0));

  const totalFleetVolume = list.reduce((s, item) => s + (item.totalPages || 0), 0) || 1;

  // Cắt theo scope
  let sliced: typeof list = [];
  if (scope === 'top10') sliced = list.slice(0, 10);
  else if (scope === 'top20') sliced = list.slice(0, 20);
  else if (scope === 'top50') sliced = list.slice(0, 50);
  else if (scope === 'top100') sliced = list.slice(0, 100);
  else if (scope === 'bottom10') sliced = list.slice(-10).reverse();

  return sliced.map((item, idx) => ({
    ...item,
    rank: scope === 'bottom10' ? list.length - idx : idx + 1,
    sharePercent: Number((((item.totalPages || 0) / totalFleetVolume) * 100).toFixed(1)),
  }));
}

