/**
 * Frontend/src/features/inventory/components/InventoryStatsCards.tsx
 *
 * 4 Thẻ KPI Bento Thống Kê Kho Vật Tư:
 * - Tuân thủ AGENTS.md Rule 7 & Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React from 'react';
import { FontAwesomeIcon, faBox, faTriangleExclamation, faPrint, faWrench } from '../../../shared/icons';
import { InventoryItem } from '../types';

interface InventoryStatsCardsProps {
  items: InventoryItem[];
  isLoading?: boolean;
}

export const InventoryStatsCards: React.FC<InventoryStatsCardsProps> = ({ items, isLoading = false }) => {
  const totalSkus = items.length;
  const lowStockCount = items.filter((it) => it.currentStock <= it.safetyStock).length;
  const totalTonerCount = items
    .filter((it) => it.category.toUpperCase() === 'TONER')
    .reduce((sum, it) => sum + it.currentStock, 0);
  const partsCount = items
    .filter((it) => ['DRUM', 'FUSER', 'ROLLER', 'WASTE_BOX'].includes(it.category.toUpperCase()))
    .reduce((sum, it) => sum + it.currentStock, 0);

  const cards = [
    {
      title: 'TỔNG DANH MỤC SKU',
      value: isLoading ? '—' : totalSkus,
      subtext: 'Mặt hàng quản lý',
      icon: faBox,
      color: '#0284c7',
      bgLight: '#f0f9ff',
      isAlert: false,
    },
    {
      title: 'CHẠM NGƯỠNG AN TOÀN',
      value: isLoading ? '—' : lowStockCount,
      subtext: lowStockCount > 0 ? 'Cần lập đơn mua bù' : 'Tồn kho ổn định',
      icon: faTriangleExclamation,
      color: lowStockCount > 0 ? '#ef4444' : '#10b981',
      bgLight: lowStockCount > 0 ? '#fef2f2' : '#ecfdf5',
      isAlert: lowStockCount > 0,
    },
    {
      title: 'MỰC IN TỒN KHO',
      value: isLoading ? '—' : `${totalTonerCount} hộp`,
      subtext: 'Đen trắng & Màu CMYK',
      icon: faPrint,
      color: '#2563eb',
      bgLight: '#eff6ff',
      isAlert: false,
    },
    {
      title: 'LINH KIỆN & TRỐNG TỪ',
      value: isLoading ? '—' : `${partsCount} chiếc`,
      subtext: 'Drum, Fuser, Hộp mực thải',
      icon: faWrench,
      color: '#8b5cf6',
      bgLight: '#f5f3ff',
      isAlert: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((c, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
        >
          <div>
            <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">{c.title}</div>
            <div
              className={`text-2xl font-black mt-1.5 ${c.isAlert ? 'text-red-600' : 'text-slate-900'}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {c.value}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">{c.subtext}</div>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: c.bgLight, color: c.color }}
          >
            <FontAwesomeIcon icon={c.icon} className="text-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryStatsCards;

