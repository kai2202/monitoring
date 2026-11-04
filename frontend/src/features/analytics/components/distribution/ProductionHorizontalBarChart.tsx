/**
 * Frontend/src/features/analytics/components/distribution/ProductionHorizontalBarChart.tsx
 *
 * Biểu đồ Cột Ngang Phân Bố Sản Lượng Thiết Bị (Fleet Horizontal Bar Chart):
 * - Trục tung (Y-axis): Tên/model máy in, vị trí tầng & phòng ban.
 * - Thanh ngang: Chia màu tỷ trọng Mono (#2563eb) và Color (#ec4899).
 * - Nút ghim nhanh 📌 (Pin Icon) ở cuối mỗi thanh ngang để đưa vào đối chiếu.
 * - Bộ lọc Tầng (Tất cả, T1 - T5) và ô tìm kiếm nhanh.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon, faThumbtack, faMagnifyingGlass, faSort } from '../../../../shared/icons';
import { AnalyticsTimeframe, FloorTabId } from '../../../../types/analyticsUI';
import { MOCK_PRINTER_DEFINITIONS, MockFleetDeviceDefinition } from '../../../../mocks/mockAnalyticsUIData';

export interface ProductionHorizontalBarChartProps {
  timeframe: AnalyticsTimeframe;
  activeFloorTab: FloorTabId;
  onSelectFloorTab: (floor: FloorTabId) => void;
  pinnedPrinterIds: string[];
  onTogglePinPrinter: (printerId: string) => void;
}

export const ProductionHorizontalBarChart: React.FC<ProductionHorizontalBarChartProps> = ({
  timeframe,
  activeFloorTab,
  onSelectFloorTab,
  pinnedPrinterIds,
  onTogglePinPrinter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const getDeviceVol = (p: MockFleetDeviceDefinition) => {
    const arr = timeframe === 'hourly' ? p.baseHourly : timeframe === '7days' ? p.base7Days : p.base30Days;
    return arr.reduce((sum, v) => sum + (v || 0), 0);
  };

  const processedPrinters = useMemo(() => {
    let list = [...MOCK_PRINTER_DEFINITIONS];
    if (activeFloorTab !== 'all') {
      list = list.filter((p) => p.floorId === activeFloorTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) || p.department.toLowerCase().includes(q)
      );
    }
    const mapped = list.map((p) => {
      const totalVol = getDeviceVol(p);
      const monoVol = Math.round(totalVol * (p.monoRatio ?? 1));
      const colorVol = totalVol - monoVol;
      return {
        ...p,
        totalVol,
        monoVol,
        colorVol,
        monoPercent: totalVol > 0 ? Math.round((monoVol / totalVol) * 100) : 100,
        colorPercent: totalVol > 0 ? Math.round((colorVol / totalVol) * 100) : 0,
      };
    });
    mapped.sort((a, b) => (sortDesc ? b.totalVol - a.totalVol : a.totalVol - b.totalVol));
    return mapped;
  }, [activeFloorTab, searchQuery, sortDesc, timeframe]);

  const maxVolume = useMemo(() => {
    if (processedPrinters.length === 0) return 100;
    return Math.max(...processedPrinters.map((p) => p.totalVol), 100);
  }, [processedPrinters]);

  const displayedPrinters = showAll ? processedPrinters : processedPrinters.slice(0, 7);

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

        {/* Ô Tìm kiếm & Nút Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }} />
            <input
              type="text"
              placeholder="Tìm máy in..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '28px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px', fontSize: '11.5px', borderRadius: '9999px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', width: '130px', outline: 'none' }}
            />
          </div>
          <button
            type="button"
            onClick={() => setSortDesc(!sortDesc)}
            title={sortDesc ? 'Sắp xếp: Giảm dần' : 'Sắp xếp: Tăng dần'}
            style={{ padding: '5px 10px', borderRadius: '9999px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', cursor: 'pointer', fontSize: '11px', color: 'var(--text-secondary, #475569)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <FontAwesomeIcon icon={faSort} />
            <span>{sortDesc ? 'Cao nhất' : 'Thấp nhất'}</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh Chọn Tầng (Floor Pills) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px', borderRadius: '9999px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', width: 'fit-content' }}>
        {[
          { id: 'all' as FloorTabId, label: 'Tất cả' },
          { id: 'floor-1' as FloorTabId, label: 'T1' },
          { id: 'floor-2' as FloorTabId, label: 'T2' },
          { id: 'floor-3' as FloorTabId, label: 'T3' },
          { id: 'floor-4' as FloorTabId, label: 'T4' },
          { id: 'floor-5' as FloorTabId, label: 'T5' },
        ].map((tab) => {
          const isActive = activeFloorTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectFloorTab(tab.id)}
              style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'var(--bg-card, #ffffff)' : 'transparent',
                color: isActive ? '#2563eb' : 'var(--text-muted, #64748b)',
                border: 'none',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Danh Sách Cột Ngang (Horizontal Bars) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: '240px' }}>
        {displayedPrinters.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted, #94a3b8)', fontSize: '12px' }}>
            Không tìm thấy thiết bị nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          displayedPrinters.map((p, idx) => {
            const isPinned = pinnedPrinterIds.includes(p.id);
            const barWidthPercent = maxVolume > 0 ? (p.totalVol / maxVolume) * 100 : 0;

            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '6px 8px',
                  borderRadius: '12px',
                  backgroundColor: isPinned ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                  border: isPinned ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Trục Tung Y-Axis: Thứ hạng & Tên máy */}
                <div style={{ width: '150px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: idx < 3 ? '#2563eb' : 'var(--text-muted, #94a3b8)', fontFamily: "'JetBrains Mono', monospace", width: '16px' }}>
                      #{idx + 1}
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>
                      {p.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)', paddingLeft: '22px' }}>
                    {p.floorName} • {p.department.split('&')[0]}
                  </div>
                </div>

                {/* Thanh Ngang (Horizontal Bar): Stacked Mono & Color */}
                <div style={{ flex: 1, position: 'relative', height: '18px', backgroundColor: 'var(--bg-subtle, #f1f5f9)', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                  <div
                    style={{ width: `${(barWidthPercent * p.monoPercent) / 100}%`, height: '100%', backgroundColor: '#2563eb', transition: 'width 0.3s ease' }}
                    title={`Mono: ${p.monoVol.toLocaleString('vi-VN')} trang (${p.monoPercent}%)`}
                  />
                  <div
                    style={{ width: `${(barWidthPercent * p.colorPercent) / 100}%`, height: '100%', backgroundColor: '#ec4899', transition: 'width 0.3s ease' }}
                    title={`Color: ${p.colorVol.toLocaleString('vi-VN')} trang (${p.colorPercent}%)`}
                  />
                </div>

                {/* Số Liệu Sản Lượng */}
                <div style={{ width: '90px', textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#0f172a' }}>
                    {p.totalVol.toLocaleString('vi-VN')}
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-muted, #64748b)' }}>
                    trang ({p.monoPercent}% M)
                  </div>
                </div>

                {/* Nút Ghim Nhanh 📌 */}
                <button
                  type="button"
                  onClick={() => onTogglePinPrinter(p.id)}
                  title={isPinned ? 'Bỏ ghim khỏi khung đối chiếu' : 'Ghim vào khung đối chiếu'}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    border: isPinned ? '1px solid #2563eb' : '1px solid var(--border-color, #e2e8f0)',
                    backgroundColor: isPinned ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-subtle, #f8fafc)',
                    color: isPinned ? '#2563eb' : 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FontAwesomeIcon icon={faThumbtack} />
                </button>
              </div>
            );
          })
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
            {showAll ? 'Thu gọn' : `Xem thêm (${processedPrinters.length - 7} máy)`}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductionHorizontalBarChart;
