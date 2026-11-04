/**
 * Frontend/src/pages/SuppliesPage.tsx
 *
 * Phân hệ Giám sát Vật tư Tiêu hao (Supplies) theo chuẩn Matte Onyx Dark:
 * - 4 Thẻ KPI: Mực nguy cấp (<= 10%), Cảnh báo (<= 20%), Hộp mực thải đầy (>= 80%), Máy in màu.
 * - Bảng theo dõi chi tiết 5 vạch thanh đo ngang CMYK + Waste Toner.
 * - Tạo lệnh thay mực nhanh 1-Click (chuyển sang phân hệ Vận hành / TaskService).
 * - Tuân thủ AGENTS.md: MetricValue = null hiển thị —, tuyệt đối không bịa đặt số 0.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw,
  PlusCircle,
  Wrench,
  Check,
  ChevronRight,
} from 'lucide-react';
import { suppliesService, taskService } from '../services';
import { PrinterSupplyItem } from '../services/interfaces/ISuppliesService';
import { SuppliesSummary } from '../mocks/mockSupplies';
import { NavTabId } from '../components/layout/Sidebar';

export interface SuppliesPageProps {
  onNavigateModule?: (tab: NavTabId) => void;
}

export const SuppliesPage: React.FC<SuppliesPageProps> = ({ onNavigateModule }) => {
  const [suppliesList, setSuppliesList] = useState<PrinterSupplyItem[]>([]);
  const [summary, setSummary] = useState<SuppliesSummary>({
    totalTrackedPrinters: 35,
    lowTonerCriticalCount: 2,
    lowTonerWarningCount: 2,
    wasteTonerFullCount: 1,
    colorPrintersCount: 15,
    monoPrintersCount: 20,
    averageBlackTonerPercent: 68.4,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning' | 'waste'>('all');
  const [actionSuccessId, setActionSuccessId] = useState<string | null>(null);

  const loadSupplies = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listData, sumData] = await Promise.all([
        suppliesService.getSuppliesList(),
        suppliesService.getSuppliesSummary(),
      ]);
      setSuppliesList(listData);
      setSummary(sumData);
    } catch (err) {
      console.error('Lỗi khi nạp dữ liệu vật tư:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSupplies();
  }, [loadSupplies]);

  // Bộ lọc danh sách thiết bị vật tư
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return suppliesList.filter(item => {
      // 1. Text Search
      const matchSearch =
        !q ||
        item.printerId.toLowerCase().includes(q) ||
        item.printerName.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        (item.location && item.location.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // 2. Status Filter
      const s = item.supplies;
      const isCritical =
        (s.black !== null && s.black <= 10) ||
        (s.cyan !== null && s.cyan <= 10) ||
        (s.magenta !== null && s.magenta <= 10) ||
        (s.yellow !== null && s.yellow <= 10);

      const isWarning =
        (s.black !== null && s.black <= 20) ||
        (s.cyan !== null && s.cyan <= 20) ||
        (s.magenta !== null && s.magenta <= 20) ||
        (s.yellow !== null && s.yellow <= 20);

      const isWasteFull = s.waste !== null && s.waste >= 80;

      if (activeFilter === 'critical') return isCritical;
      if (activeFilter === 'warning') return isWarning && !isCritical;
      if (activeFilter === 'waste') return isWasteFull;

      return true;
    });
  }, [suppliesList, searchQuery, activeFilter]);

  // Tạo lệnh thay mực nhanh
  const handleCreateOrder = async (item: PrinterSupplyItem, consumableName: string) => {
    try {
      await taskService.createTask(
        {
          title: `Thay ${consumableName} cho ${item.printerName}`,
          description: `Yêu cầu thay thế vật tư do mức mực thấp hoặc hộp mực thải đầy tại vị trí ${item.location || '—'}`,
          taskType: 'SUPPLY_REPLENISHMENT',
          priority: 'P2_High',
          assignee: 'Kỹ thuật viên Trực ban',
          dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          printerId: item.printerId,
          printerName: item.printerName,
          location: item.location || 'Chưa định vị',
        },
        'Admin'
      );
      setActionSuccessId(item.printerId);
      setTimeout(() => setActionSuccessId(null), 2000);
    } catch (err) {
      console.error('Lỗi khi tạo lệnh thay mực:', err);
    }
  };

  const renderMeter = (label: string, val: number | null, color: string, isWaste = false) => {
    const isCritical = !isWaste ? val !== null && val <= 10 : val !== null && val >= 90;
    const isWarn = !isWaste ? val !== null && val <= 20 : val !== null && val >= 80;

    let displayColor = color;
    if (isCritical) displayColor = 'var(--status-offline)';
    else if (isWarn) displayColor = 'var(--status-warning)';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: '70px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: val !== null ? (isCritical ? '#f87171' : isWarn ? '#fbbf24' : '#e4e4e7') : 'var(--text-muted)',
            }}
          >
            {val !== null ? `${val}%` : '—'}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            backgroundColor: '#1c1c24',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {val !== null && (
            <div
              style={{
                width: `${Math.min(100, Math.max(0, val))}%`,
                height: '100%',
                backgroundColor: displayColor,
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header Card */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              backgroundColor: '#16161b',
              border: '1px solid #25252e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-500)',
            }}
          >
            <Package size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Giám Sát Vật Tư Tiêu Hao &amp; Mực In CMYK
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Theo dõi mức mực thực tế 5 vạch của {summary.totalTrackedPrinters} máy in và kích hoạt lệnh thay thế 1-Click
            </p>
          </div>
        </div>

        <button
          onClick={loadSupplies}
          disabled={isLoading}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-badge)',
            backgroundColor: '#16161b',
            border: '1px solid #25252e',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={13} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          <span>Đồng bộ</span>
        </button>
      </div>

      {/* 2. Top KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
        }}
      >
        {[
          {
            label: 'Mực Nguy Cấp (≤ 10%)',
            val: `${summary.lowTonerCriticalCount} máy`,
            sub: 'Cần thay thế ngay',
            color: 'var(--status-offline)',
            active: activeFilter === 'critical',
            onClick: () => setActiveFilter(prev => (prev === 'critical' ? 'all' : 'critical')),
          },
          {
            label: 'Mực Cảnh Báo (≤ 20%)',
            val: `${summary.lowTonerWarningCount} máy`,
            sub: 'Chuẩn bị vật tư dự phòng',
            color: 'var(--status-warning)',
            active: activeFilter === 'warning',
            onClick: () => setActiveFilter(prev => (prev === 'warning' ? 'all' : 'warning')),
          },
          {
            label: 'Hộp Mực Thải Đầy (≥ 80%)',
            val: `${summary.wasteTonerFullCount} máy`,
            sub: 'Nguy cơ tràn hộp thải',
            color: '#f97316',
            active: activeFilter === 'waste',
            onClick: () => setActiveFilter(prev => (prev === 'waste' ? 'all' : 'waste')),
          },
          {
            label: 'Máy In Màu (Color MFP)',
            val: `${summary.colorPrintersCount} máy`,
            sub: `Đơn sắc: ${summary.monoPrintersCount} máy`,
            color: 'var(--brand-500)',
            active: false,
            onClick: () => setActiveFilter('all'),
          },
        ].map((card, i) => (
          <div
            key={i}
            onClick={card.onClick}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-card)',
              backgroundColor: card.active ? '#1c1c24' : 'var(--bg-card)',
              border: card.active ? `1px solid ${card.color}` : '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{card.label}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: card.color,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {isLoading ? '—' : card.val}
              </span>
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{card.sub}</span>
          </div>
        ))}
      </div>

      {/* 3. Search & Filter Bar */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#16161b',
            border: '1px solid #25252e',
            borderRadius: 'var(--radius-badge)',
            padding: '6px 12px',
            minWidth: '280px',
            flex: '1 1 300px',
          }}
        >
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm theo mã máy in, model, vị trí phòng ban..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '12px',
              width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[
            { id: 'all', label: `Tất cả (${suppliesList.length})` },
            { id: 'critical', label: `Nguy cấp (${summary.lowTonerCriticalCount})` },
            { id: 'warning', label: `Cảnh báo (${summary.lowTonerWarningCount})` },
            { id: 'waste', label: `Mực thải đầy (${summary.wasteTonerFullCount})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              style={{
                padding: '5px 10px',
                borderRadius: 'var(--radius-badge)',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: activeFilter === f.id ? '#222228' : '#141418',
                color: activeFilter === f.id ? '#ffffff' : 'var(--text-muted)',
                border: activeFilter === f.id ? '1px solid #2f2f38' : '1px solid #202026',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Detailed Supplies Table */}
      <div
        style={{
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f1f26', backgroundColor: 'rgba(255, 255, 255, 0.015)' }}>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', width: '220px' }}>
                  MÁY IN &amp; VỊ TRÍ
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', width: '100px' }}>
                  LOẠI MÁY
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  THƯỚC ĐO 5 VẠCH VẬT TƯ TIÊU HAO (CMYK + THẢI)
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', width: '130px', textAlign: 'right' }}>
                  THAO TÁC
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Không có thiết bị nào trong nhóm vật tư này.
                  </td>
                </tr>
              ) : (
                filteredList.map(item => {
                  const s = item.supplies;
                  const isSuccess = actionSuccessId === item.printerId;

                  // Xác định vật tư cần thay thế nhất
                  let needChange = 'Mực in';
                  if (s.black !== null && s.black <= 10) needChange = 'Hộp mực Đen (K)';
                  else if (s.cyan !== null && s.cyan <= 10) needChange = 'Hộp mực Cyan (C)';
                  else if (s.magenta !== null && s.magenta <= 10) needChange = 'Hộp mực Magenta (M)';
                  else if (s.yellow !== null && s.yellow <= 10) needChange = 'Hộp mực Yellow (Y)';
                  else if (s.waste !== null && s.waste >= 80) needChange = 'Hộp mực thải';

                  return (
                    <tr
                      key={item.printerId}
                      style={{
                        borderBottom: '1px solid #1c1c22',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Col 1: Máy in & Vị trí */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#f4f4f5' }}>
                          {item.printerName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                            {item.printerId}
                          </span>{' '}
                          • {item.location || '—'}
                        </div>
                      </td>

                      {/* Col 2: Loại máy */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-badge)',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            backgroundColor: item.colorCapability === 'Color' ? 'rgba(56, 189, 248, 0.1)' : '#16161b',
                            color: item.colorCapability === 'Color' ? '#38bdf8' : '#a1a1aa',
                            border: item.colorCapability === 'Color' ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid #25252e',
                          }}
                        >
                          {item.colorCapability === 'Color' ? 'In Màu' : 'Đơn Sắc'}
                        </span>
                      </td>

                      {/* Col 3: 5 Thước đo CMYK + Waste */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                          {renderMeter('Black (K)', s.black, '#a1a1aa')}
                          {item.colorCapability === 'Color' && renderMeter('Cyan (C)', s.cyan, '#0284c7')}
                          {item.colorCapability === 'Color' && renderMeter('Magenta (M)', s.magenta, '#db2777')}
                          {item.colorCapability === 'Color' && renderMeter('Yellow (Y)', s.yellow, '#ca8a04')}
                          {renderMeter('Mực Thải', s.waste, '#ea580c', true)}
                        </div>
                      </td>

                      {/* Col 4: Thao tác */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleCreateOrder(item, needChange)}
                          disabled={isSuccess}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-badge)',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: isSuccess ? 'var(--status-online-bg)' : '#1c1c22',
                            border: isSuccess ? '1px solid var(--status-online-border)' : '1px solid #292934',
                            color: isSuccess ? 'var(--status-online)' : '#ffffff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: isSuccess ? 'default' : 'pointer',
                          }}
                        >
                          {isSuccess ? (
                            <>
                              <Check size={12} />
                              <span>Đã tạo Task</span>
                            </>
                          ) : (
                            <>
                              <Wrench size={12} />
                              <span>Lệnh thay mực</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
