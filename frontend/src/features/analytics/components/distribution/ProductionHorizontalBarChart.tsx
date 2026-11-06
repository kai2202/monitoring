/**
 * Frontend/src/features/analytics/components/distribution/ProductionHorizontalBarChart.tsx
 *
 * Biểu đồ Cột Ngang Phân Bố Sản Lượng Thiết Bị (Fleet Horizontal Bar Chart):
 * - Dữ liệu thiết bị nhận trực tiếp từ Service/API thông qua props devices.
 * - Loại bỏ hoàn toàn dữ liệu mẫu và giá trị fix cứng (No mock imports).
 * - Hỗ trợ sắp xếp đa tiêu chí: Sản lượng cao nhất, Sản lượng thấp nhất, Tỷ lệ in Màu cao nhất (% Color).
 * - Trục tung (Y-axis): Tên/model máy in, vị trí tầng & phòng ban.
 * - Thanh ngang: Chia màu tỷ trọng Mono (#2563eb) và Color (#ec4899).
 * - Nút toggle gập/mở sàn đối chiếu thiết bị [Đối chiếu thiết bị].
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon, faThumbtack, faMagnifyingGlass, faSort } from '../../../../shared/icons';
import { AnalyticsTimeframe, FloorTabId } from '../../../../types/analyticsUI';
import { DeviceProductionItem } from '../../../../types/api';
import { DeviceHorizontalBarRow, ProcessedPrinterItem } from './DeviceHorizontalBarRow';

export type ProductionSortMode = 'volume_desc' | 'volume_asc' | 'color_desc';

export interface ProductionHorizontalBarChartProps {
  timeframe: AnalyticsTimeframe;
  activeFloorTab: FloorTabId;
  onSelectFloorTab: (floor: FloorTabId) => void;
  pinnedPrinterIds: string[];
  onTogglePinPrinter: (printerId: string) => void;
  isComparisonOpen?: boolean;
  onToggleComparisonView?: () => void;
  searchQuery?: string;
  devices?: DeviceProductionItem[];
}

export const ProductionHorizontalBarChart: React.FC<ProductionHorizontalBarChartProps> = ({
  timeframe: _timeframe,
  activeFloorTab,
  onSelectFloorTab,
  pinnedPrinterIds,
  onTogglePinPrinter,
  isComparisonOpen = false,
  onToggleComparisonView,
  searchQuery: externalSearchQuery,
  devices = [],
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<ProductionSortMode>('volume_desc');
  const [showAll, setShowAll] = useState(false);

  const activeSearch = externalSearchQuery !== undefined && externalSearchQuery !== '' ? externalSearchQuery : internalSearchQuery;

  const floorTabs = useMemo(() => {
    const set = new Set<string>();
    devices.forEach((p) => {
      if (p.floorId) set.add(p.floorId);
    });
    const ids = Array.from(set).sort();
    return [
      { id: 'all' as FloorTabId, label: 'Tất cả' },
      ...ids.map((id) => ({
        id: id as FloorTabId,
        label: `T${id.replace('floor-', '')}`,
      })),
    ];
  }, [devices]);

  const processedPrinters = useMemo<ProcessedPrinterItem[]>(() => {
    let list = [...devices];
    if (activeFloorTab !== 'all') {
      list = list.filter((p) => p.floorId === activeFloorTab);
    }
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase().trim();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) || p.department.toLowerCase().includes(q)
      );
    }

    const mapped: ProcessedPrinterItem[] = list.map((p) => ({
      id: p.id,
      name: p.name,
      model: p.model,
      floorName: p.floorName,
      department: p.department,
      totalVol: p.totalVol,
      monoVol: p.monoVol,
      colorVol: p.colorVol,
      monoPercent: p.monoPercent,
      colorPercent: p.colorPercent,
    }));

    mapped.sort((a, b) => {
      if (sortMode === 'color_desc') {
        return b.colorPercent !== a.colorPercent ? b.colorPercent - a.colorPercent : b.totalVol - a.totalVol;
      }
      return sortMode === 'volume_desc' ? b.totalVol - a.totalVol : a.totalVol - b.totalVol;
    });

    return mapped;
  }, [devices, activeFloorTab, activeSearch, sortMode]);

  const maxVolume = useMemo(() => {
    if (processedPrinters.length === 0) return 100;
    return Math.max(...processedPrinters.map((p) => p.totalVol), 100);
  }, [processedPrinters]);

  const displayedPrinters = showAll ? processedPrinters : processedPrinters.slice(0, 7);

  const cycleSortMode = () => {
    setSortMode((prev) => {
      if (prev === 'volume_desc') return 'volume_asc';
      if (prev === 'volume_asc') return 'color_desc';
      return 'volume_desc';
    });
  };

  const sortLabel = sortMode === 'volume_desc' ? 'Sản lượng: Cao nhất' : sortMode === 'volume_asc' ? 'Sản lượng: Thấp nhất' : 'Tỷ lệ Màu cao nhất';

  return (
    <div
      style={{
        padding: '22px 24px',
        borderRadius: '24px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header Khối & Tìm kiếm */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
            <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              Sản lượng theo thiết bị
            </h3>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0' }}>
            Tỷ lệ in Đen trắng &amp; Màu, ghim đối chiếu nhanh
          </p>
        </div>

        {/* Nút Đối Chiếu & Ô Tìm kiếm & Nút Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onToggleComparisonView && (
            <button
              type="button"
              onClick={onToggleComparisonView}
              title={isComparisonOpen ? 'Thu gọn sàn đối chiếu thiết bị' : 'Mở sàn đối chiếu thiết bị'}
              style={{
                padding: '5px 12px',
                borderRadius: '9999px',
                border: isComparisonOpen ? '1px solid #2563eb' : '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: isComparisonOpen ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-subtle, #f8fafc)',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight: 600,
                color: isComparisonOpen ? '#2563eb' : 'var(--text-secondary, #475569)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <FontAwesomeIcon icon={faThumbtack} style={{ fontSize: '10.5px' }} />
              <span>{isComparisonOpen ? 'Thu gọn đối chiếu' : 'Đối chiếu thiết bị'}</span>
              {pinnedPrinterIds.length > 0 && (
                <span style={{ padding: '0 6px', borderRadius: '9999px', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '10px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  {pinnedPrinterIds.length}
                </span>
              )}
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }} />
            <input
              type="text"
              placeholder="Tìm máy in..."
              value={internalSearchQuery}
              onChange={(e) => setInternalSearchQuery(e.target.value)}
              style={{ paddingLeft: '28px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px', fontSize: '11.5px', borderRadius: '9999px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', width: '130px', outline: 'none' }}
            />
          </div>

          <button
            type="button"
            onClick={cycleSortMode}
            title="Bấm để đổi chế độ sắp xếp"
            style={{ padding: '5px 12px', borderRadius: '9999px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: sortMode === 'color_desc' ? 'rgba(236, 72, 153, 0.08)' : 'var(--bg-subtle, #f8fafc)', cursor: 'pointer', fontSize: '11px', color: sortMode === 'color_desc' ? '#ec4899' : 'var(--text-secondary, #475569)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
          >
            <FontAwesomeIcon icon={faSort} />
            <span>{sortLabel}</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh Chọn Tầng (Floor Pills) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px', borderRadius: '9999px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', width: 'fit-content' }}>
        {floorTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectFloorTab(tab.id)}
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: activeFloorTab === tab.id ? '#ffffff' : 'transparent',
              color: activeFloorTab === tab.id ? '#0f172a' : 'var(--text-muted, #64748b)',
              fontSize: '11px',
              fontWeight: activeFloorTab === tab.id ? 800 : 500,
              cursor: 'pointer',
              boxShadow: activeFloorTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Danh Sách Cột Ngang Các Thiết Bị */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: '260px' }}>
        {displayedPrinters.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted, #94a3b8)', fontSize: '12px' }}>
            Không tìm thấy máy in nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          displayedPrinters.map((p, idx) => (
            <DeviceHorizontalBarRow
              key={p.id}
              printer={p}
              idx={idx}
              maxVolume={maxVolume}
              isPinned={pinnedPrinterIds.includes(p.id)}
              onTogglePinPrinter={onTogglePinPrinter}
            />
          ))
        )}
      </div>

      {/* 4. Footer & Chú Giải Màu Sắc */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '10px', fontSize: '11px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
            <span style={{ color: 'var(--text-secondary, #475569)' }}>Bản in Đen trắng (Mono)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#ec4899' }} />
            <span style={{ color: 'var(--text-secondary, #475569)' }}>Bản in Màu (Color)</span>
          </div>
        </div>

        {processedPrinters.length > 7 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '11px' }}
          >
            {showAll ? 'Thu gọn (Top 7)' : `Xem thêm (${processedPrinters.length} máy)`}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductionHorizontalBarChart;
