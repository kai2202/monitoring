/**
 * Frontend/src/features/dashboard/components/overview/RefinedFleetDonut.tsx
 *
 * Biểu Đồ Vành Khăn Phân Bổ Trạng Thái Hạm Đội theo Layout Chuẩn Ảnh 1:
 * - Cột Trái: Donut Chart sắc nét với tâm hiển thị tỷ lệ khả dụng & số lượng máy.
 * - Cột Phải: Danh sách nhóm trạng thái dạng chấm màu + tên + số liệu nổi bật.
 * - Đáy: Thanh Fleet Health Bar tổng thể thể hiện trực quan tỷ lệ 4 nhóm màu.
 * - Footer: Nút chuyển hướng [Xem Danh Sách Thiết Bị Chi Tiết >] sang phân hệ Printers.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer } from '@/types/printer';
import { FleetHealthDistribution } from '@/types/dashboardTelemetry';
import { FontAwesomeIcon, faRotate, faChevronRight, faChartPie } from '@/shared/icons';

export interface RefinedFleetDonutProps {
  printers: Printer[];
  distribution?: FleetHealthDistribution | null;
  onSelectHealthGroup?: (health: string) => void;
  selectedHealth?: string | null;
  isLoading?: boolean;
}

export const RefinedFleetDonut: React.FC<RefinedFleetDonutProps> = ({
  printers,
  distribution,
  onSelectHealthGroup,
  selectedHealth,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Thống kê chuẩn 4 nhóm độc lập (Rule 5 & 6)
  const stats = useMemo(() => {
    const total = distribution ? distribution.totalCount : printers.length;
    let healthy = 0;
    let warning = 0;
    let critical = 0;
    let offline = 0;

    if (distribution) {
      healthy = distribution.healthyCount;
      warning = distribution.warningCount;
      critical = distribution.criticalCount;
      offline = distribution.offlineCount + (distribution.storageCount || 0);
    } else {
      printers.forEach((p) => {
        if (p.connectionStatus === 'Offline' || p.monitoringStatus === 'Storage') {
          offline++;
        } else if (p.healthStatus === 'Error' || p.activeIncidentCount > 0) {
          critical++;
        } else if (p.healthStatus === 'Warning') {
          warning++;
        } else {
          healthy++;
        }
      });
    }

    const availableCount = total - offline;
    const availabilityRate = total > 0 ? (availableCount / total) * 100 : null;

    return { total, healthy, warning, critical, offline, availableCount, availabilityRate };
  }, [printers, distribution]);

  const segments = useMemo(() => {
    return [
      { key: 'healthy', label: 'Tốt / Ổn định', count: stats.healthy, color: '#10b981' },
      { key: 'warning', label: 'Cảnh báo vật tư', count: stats.warning, color: '#f59e0b' },
      { key: 'critical', label: 'Sự cố phần cứng', count: stats.critical, color: '#f43f5e' },
      { key: 'offline', label: 'Ngoại tuyến / Kho', count: stats.offline, color: '#94a3b8' },
    ];
  }, [stats]);

  const size = 180;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Tọa độ phân đoạn Donut
  const renderedSegments = useMemo(() => {
    if (stats.total === 0) return [];
    let accumulatedAngle = -90;

    return segments.map((seg) => {
      const percentage = (seg.count / stats.total) * 100;
      const strokeDashoffset = circumference - (percentage / 100) * circumference;
      const rotation = accumulatedAngle;
      accumulatedAngle += (percentage / 100) * 360;

      return {
        ...seg,
        percentage,
        strokeDashoffset,
        rotation,
      };
    });
  }, [segments, stats.total, circumference]);

  const activeHoverSegment = useMemo(() => {
    return segments.find((s) => s.key === hoveredKey) || null;
  }, [segments, hoveredKey]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
      {/* 1. Header Bar theo phong cách Widget Ảnh 1 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faChartPie} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Phân Bổ Trạng Thái Hạm Đội
          </h3>
        </div>

        {selectedHealth ? (
          <button
            type="button"
            onClick={() => onSelectHealthGroup && onSelectHealthGroup('')}
            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FontAwesomeIcon icon={faRotate} className="text-[10px]" />
            Bỏ lọc
          </button>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faRotate} />
          </div>
        )}
      </div>

      {/* 2. Middle Section: Donut bên trái + Danh mục bên phải (Chuẩn Ảnh 1) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 flex-1">
        {/* SVG Donut Circle */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform">
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              className="dark:stroke-slate-800"
              strokeWidth={strokeWidth}
            />

            {/* Colored Segments */}
            {renderedSegments.map((seg) => {
              const isSelected = selectedHealth === seg.key;
              const isHovered = hoveredKey === seg.key;
              const isDimmed = (selectedHealth && !isSelected) || (hoveredKey && !isHovered);

              return (
                <circle
                  key={seg.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isSelected || isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(${seg.rotation} ${size / 2} ${size / 2})`}
                  className="transition-all duration-300 cursor-pointer"
                  style={{ opacity: isDimmed ? 0.45 : 1 }}
                  onMouseEnter={() => setHoveredKey(seg.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => onSelectHealthGroup && onSelectHealthGroup(isSelected ? '' : seg.key)}
                />
              );
            })}
          </svg>

          {/* Center Text Hole (Chuẩn Ảnh 1) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
            {activeHoverSegment ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1" style={{ color: activeHoverSegment.color }}>
                  {activeHoverSegment.label}
                </span>
                <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeHoverSegment.count}
                </span>
                <span className="text-[10.5px] font-mono text-slate-400">
                  {stats.total > 0 ? ((activeHoverSegment.count / stats.total) * 100).toFixed(0) : 0}% hạm đội
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Khả Dụng
                </span>
                <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100 my-0.5">
                  {stats.availabilityRate !== null ? `${stats.availabilityRate.toFixed(0)}%` : '—'}
                </span>
                <span className="text-[10.5px] text-slate-400 font-mono">
                  {stats.availableCount}/{stats.total} máy
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách danh mục kiểu Ảnh 1: Chấm màu + Tên mục + Số lượng/Tỷ lệ bên dưới */}
        <div className="flex flex-col justify-center gap-3 w-full sm:max-w-[190px]">
          {segments.map((s) => {
            const isSelected = selectedHealth === s.key;
            const isHovered = hoveredKey === s.key;
            return (
              <div
                key={s.key}
                onClick={() => onSelectHealthGroup && onSelectHealthGroup(isSelected ? '' : s.key)}
                onMouseEnter={() => setHoveredKey(s.key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={`flex items-start gap-2.5 p-1.5 rounded-xl cursor-pointer transition-all ${
                  isSelected || isHovered
                    ? 'bg-slate-100/90 dark:bg-slate-800/90 font-bold shadow-xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1 shadow-xs"
                  style={{ backgroundColor: s.color }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11.5px] font-medium text-slate-600 dark:text-slate-300 truncate">
                    {s.label}
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                    {s.count} máy{' '}
                    <span className="text-[10.5px] font-normal text-slate-400">
                      ({stats.total > 0 ? ((s.count / stats.total) * 100).toFixed(0) : 0}%)
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Đáy: Thanh Fleet Health Bar tổng thể thể hiện trực quan tỷ lệ 4 nhóm màu (Theo Grill-me) */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>Phân bổ hạm đội tổng thể:</span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
            {stats.availableCount}/{stats.total} máy hoạt động
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden gap-0.5 p-0.5">
          {segments.map((seg) => {
            const pct = stats.total > 0 ? (seg.count / stats.total) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={seg.key}
                style={{ width: `${pct}%`, backgroundColor: seg.color }}
                className="h-full rounded-full transition-all"
                title={`${seg.label}: ${seg.count} máy (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* 4. Footer: Nút chuyển hướng [Xem Danh Sách Thiết Bị Chi Tiết >] (Chuẩn Nút Full Stats Ảnh 1) */}
      <button
        type="button"
        onClick={() => navigate('/printers')}
        className="mt-3.5 w-full py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all shadow-xs hover:border-slate-300"
      >
        <span>Xem Danh Sách Thiết Bị Chi Tiết</span>
        <FontAwesomeIcon icon={faChevronRight} className="text-[10px] text-slate-400" />
      </button>
    </div>
  );
};

export default RefinedFleetDonut;
