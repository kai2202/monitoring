/**
 * Frontend/src/features/dashboard/components/overview/FleetKpiCards.tsx
 *
 * 4 Thẻ KPI Hạm Đội Dashboard theo chuẩn Card Inventory:
 * - Thiết kế đối xứng ngang: Thông tin bên trái (Tiêu đề chữ hoa, Số lớn font Mono, Chú thích)
 *   kết hợp khối Icon bo tròn có màu nền pastel đặc trưng bên phải.
 * - Giải quyết triệt để lỗi tràn chữ và mất ký tự đầu dòng.
 * - Tuân thủ AGENTS.md Rule 5: MetricValue = number | null, hiển thị '—' khi null.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faPrint,
  faWifi,
  faTriangleExclamation,
  faBox,
} from '@/shared/icons';
import { NavTabId } from '@/components/layout/Sidebar';
import { MetricValue } from '@/types/dashboardTelemetry';

export type KpiFilterType = 'all' | 'offline' | 'critical' | 'low_supplies' | null;

export interface FleetKpiData {
  totalPrinters: number;
  onlineCount: MetricValue;
  offlineCount: MetricValue;
  unknownCount: MetricValue;
  onlineRate: MetricValue;
  activeAlertsCount: MetricValue;
  criticalAlertsCount: MetricValue;
  warningAlertsCount: MetricValue;
  lowSuppliesCount: MetricValue;
}

export interface FleetKpiCardsProps {
  data: FleetKpiData;
  activeFilter: KpiFilterType;
  onSelectFilter: (filter: KpiFilterType) => void;
  onNavigateModule: (tab: NavTabId) => void;
}

export const FleetKpiCards: React.FC<FleetKpiCardsProps> = ({
  data,
  activeFilter,
  onSelectFilter,
}) => {
  const cards = [
    {
      id: 'all' as KpiFilterType,
      title: 'TỔNG QUY MÔ HẠM ĐỘI',
      value: data.totalPrinters,
      unit: 'máy',
      subtext: data.onlineRate !== null ? `${data.onlineRate.toFixed(1)}% trực tuyến` : '—',
      icon: faPrint,
      color: '#0284c7',
      bgLight: '#f0f9ff',
      isAlert: false,
    },
    {
      id: 'offline' as KpiFilterType,
      title: 'MẤT KẾT NỐI (ICMP/SNMP)',
      value: data.offlineCount !== null ? data.offlineCount : '—',
      unit: 'máy',
      subtext: data.offlineCount === 0 ? 'Toàn bộ trực tuyến' : 'Cần kiểm tra mạng',
      icon: faWifi,
      color: data.offlineCount && data.offlineCount > 0 ? '#f59e0b' : '#10b981',
      bgLight: data.offlineCount && data.offlineCount > 0 ? '#fffbeb' : '#ecfdf5',
      isAlert: Boolean(data.offlineCount && data.offlineCount > 0),
    },
    {
      id: 'critical' as KpiFilterType,
      title: 'SỰ CỐ CẤP THIẾT',
      value: data.criticalAlertsCount !== null ? data.criticalAlertsCount : '—',
      unit: 'sự cố',
      subtext: data.activeAlertsCount !== null ? `${data.activeAlertsCount} cảnh báo tổng thể` : '—',
      icon: faTriangleExclamation,
      color: data.criticalAlertsCount && data.criticalAlertsCount > 0 ? '#ef4444' : '#10b981',
      bgLight: data.criticalAlertsCount && data.criticalAlertsCount > 0 ? '#fef2f2' : '#ecfdf5',
      isAlert: Boolean(data.criticalAlertsCount && data.criticalAlertsCount > 0),
    },
    {
      id: 'low_supplies' as KpiFilterType,
      title: 'VẬT TƯ MỰC DƯỚI 15%',
      value: data.lowSuppliesCount !== null ? data.lowSuppliesCount : '—',
      unit: 'bình/hộp',
      subtext: 'Cần lập phiếu cấp phát',
      icon: faBox,
      color: '#10b981',
      bgLight: '#ecfdf5',
      isAlert: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((c) => {
        const isSelected = activeFilter === c.id;
        return (
          <div
            key={c.id}
            onClick={() => onSelectFilter(isSelected ? null : c.id)}
            className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm flex items-center justify-between transition-all hover:shadow-md cursor-pointer select-none ${
              isSelected
                ? 'border-indigo-600 ring-2 ring-indigo-500/30 dark:border-indigo-500 shadow-md'
                : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col min-w-0 pr-2">
              <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {c.title}
              </div>
              <div
                className={`text-2xl font-black mt-1.5 font-mono ${
                  c.isAlert ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {c.value}{' '}
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
                  {c.unit}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                {isSelected ? (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">• Đang lọc danh sách</span>
                ) : (
                  c.subtext
                )}
              </div>
            </div>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: c.bgLight, color: c.color }}
            >
              <FontAwesomeIcon icon={c.icon} className="text-lg" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FleetKpiCards;
