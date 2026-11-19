/**
 * Frontend/src/features/procurement/components/ProcurementStatsCards.tsx
 *
 * 4 Thẻ KPI Bento Thống Kê Mua Sắm & Đơn Hàng PO:
 * - Tuân thủ AGENTS.md Rule 7 & Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React from 'react';
import { FontAwesomeIcon, faFileLines, faClock, faCircleCheck, faDollarSign } from '../../../shared/icons';
import { PurchaseOrder } from '../types';

interface ProcurementStatsCardsProps {
  orders: PurchaseOrder[];
  isLoading?: boolean;
}

export const ProcurementStatsCards: React.FC<ProcurementStatsCardsProps> = ({ orders, isLoading = false }) => {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'PENDING_APPROVAL' || o.status === 'DRAFT').length;
  const receivedOrders = orders.filter((o) => o.status === 'RECEIVED').length;
  const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const cards = [
    {
      title: 'TỔNG ĐƠN MUA HÀNG (PO)',
      value: isLoading ? '—' : totalOrders,
      subtext: 'Đơn hàng phát sinh',
      icon: faFileLines,
      color: '#0284c7',
      bgLight: '#f0f9ff',
    },
    {
      title: 'ĐANG CHỜ PHÊ DUYỆT',
      value: isLoading ? '—' : pendingOrders,
      subtext: pendingOrders > 0 ? 'Cần Quản trị viên duyệt' : 'Không có tồn đọng',
      icon: faClock,
      color: pendingOrders > 0 ? '#f59e0b' : '#64748b',
      bgLight: pendingOrders > 0 ? '#fffbeb' : '#f8fafc',
    },
    {
      title: 'ĐÃ NGHIỆM THU NHẬP KHO',
      value: isLoading ? '—' : receivedOrders,
      subtext: 'Vật tư đã vào kho',
      icon: faCircleCheck,
      color: '#10b981',
      bgLight: '#ecfdf5',
    },
    {
      title: 'TỔNG DỰ TOÁN NGÂN SÁCH',
      value: isLoading ? '—' : `${(totalAmount / 1_000_000).toFixed(1)} tr`,
      subtext: `${totalAmount.toLocaleString('vi-VN')} đ`,
      icon: faDollarSign,
      color: '#8b5cf6',
      bgLight: '#f5f3ff',
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
              className="text-2xl font-black mt-1.5 text-slate-900"
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

export default ProcurementStatsCards;

