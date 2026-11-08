/**
 * Frontend/src/features/analytics/components/sla/CostAllocationArcChart.tsx
 *
 * Card Hạch Toán Chi Phí In Ấn Theo Phòng Ban (Department Cost Stacked Bar Card - Slim Edition):
 * - Thiết kế thanh mảnh, tinh tế, tiết kiệm không gian (Slim & Sleek Layout).
 * - Trục Y hiển thị tên đầy đủ phòng ban (không cụt, không xoay dọc).
 * - Thanh ngang chồng dạng Capsule mỏng nét (h-3.5 / h-4): In Đơn sắc (Indigo) & In Màu (Cyan).
 * - Triệt tiêu lỗi tràn/cụt chữ bên trong bar, tooltip chi tiết từng phân khúc.
 * - Bảng đối soát hạch toán chi tiết (Reconciliation Table) đồng bộ tương tác ở chân card.
 * - Tuân thủ AGENTS.md: FontAwesome, MetricValue = number | null, < 300 LOC.
 */

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon, faRotate } from '../../../../shared/icons';
import { DepartmentCostAllocationItem } from '../../../../types/analyticsUI';

interface CostAllocationArcChartProps {
  departments?: DepartmentCostAllocationItem[];
}

export const CostAllocationArcChart: React.FC<CostAllocationArcChartProps> = ({
  departments = [],
}) => {
  const [hoveredDeptId, setHoveredDeptId] = useState<string | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  const safeList = useMemo(() => departments || [], [departments]);
  const maxDeptCost = useMemo(() => Math.max(...safeList.map((d) => d?.totalCost || 0), 1), [safeList]);

  const activeDeptId = hoveredDeptId || selectedDeptId;

  const handleToggleSelect = (deptId: string) => {
    setSelectedDeptId((prev) => (prev === deptId ? null : deptId));
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4 sm:gap-5 w-full box-border">
      {/* 1. Header Card & Chú Thích Nhận Diện */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 m-0">
              Phân Bổ Chi Phí In Ấn Theo Phòng Ban
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
            Hạch toán phân rã chi phí Đơn sắc (Mono) &amp; Màu (Color) theo từng phòng ban
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedDeptId && (
            <button
              type="button"
              onClick={() => setSelectedDeptId(null)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faRotate} className="text-[9px]" />
              <span>Xem tất cả</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Đơn sắc (150đ/tr)</span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Màu (650đ/tr)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Thanh Ngang Chồng (Horizontal Stacked Bars) Bản Siêu Mỏng & Tinh Gọn */}
      {safeList.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
          Chưa có dữ liệu hạch toán chi phí phòng ban.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {safeList.map((dept) => {
            const isCurrentActive = activeDeptId === dept.departmentId;
            const isDimmed = activeDeptId !== null && !isCurrentActive;
            const widthRatio = Math.max(14, (dept.totalCost / maxDeptCost) * 100);
            const monoPct = dept.totalCost > 0 ? (dept.monoCost / dept.totalCost) * 100 : 0;
            const colorPct = dept.totalCost > 0 ? (dept.colorCost / dept.totalCost) * 100 : 0;

            return (
              <div
                key={dept.departmentId}
                onClick={() => handleToggleSelect(dept.departmentId)}
                onMouseEnter={() => setHoveredDeptId(dept.departmentId)}
                onMouseLeave={() => setHoveredDeptId(null)}
                className={`group flex items-center gap-2.5 sm:gap-3 py-1.5 sm:py-2 px-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isCurrentActive
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                } ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
              >
                {/* Trục Y: Tên Phòng Ban & Số Máy (Gọn gàng, không bị cụt hay xoay dọc) */}
                <div className="w-44 sm:w-52 shrink-0 flex items-center justify-between pr-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: dept.color || '#6366f1' }}
                    />
                    <span
                      className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate"
                      title={dept.departmentName}
                    >
                      {dept.departmentName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-1">
                    {dept.deviceCount} máy
                  </span>
                </div>

                {/* Thanh Ngang Chồng (Capsule Bar Mỏng Nét h-3.5 / h-4) */}
                <div className="flex-1 h-3.5 sm:h-4 rounded-full bg-slate-200/70 dark:bg-slate-800 p-0.5 flex items-center overflow-hidden">
                  <div
                    style={{ width: `${widthRatio}%` }}
                    className="h-full flex items-center gap-0.5 transition-all duration-300"
                  >
                    {/* Phân khúc Mono (Indigo) */}
                    {monoPct > 0 && (
                      <div
                        style={{ width: `${monoPct}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-xs transition-all duration-300 hover:brightness-110"
                        title={`In Đơn sắc: ${dept.monoCost.toLocaleString('vi-VN')} ₫ (${monoPct.toFixed(0)}% • ${dept.monoPages.toLocaleString('vi-VN')} trang)`}
                      />
                    )}

                    {/* Phân khúc Color (Cyan) */}
                    {colorPct > 0 && (
                      <div
                        style={{ width: `${colorPct}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-xs transition-all duration-300 hover:brightness-110"
                        title={`In Màu: ${dept.colorCost.toLocaleString('vi-VN')} ₫ (${colorPct.toFixed(0)}% • ${dept.colorPages.toLocaleString('vi-VN')} trang)`}
                      />
                    )}
                  </div>
                </div>

                {/* Tổng chi phí & Tỷ trọng (%) bên phải */}
                <div className="w-28 sm:w-32 shrink-0 flex items-center justify-end gap-1.5 text-right">
                  <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100">
                    {dept.totalCost.toLocaleString('vi-VN')} ₫
                  </span>
                  <span className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                    {dept.percentageShare.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Bảng Đối Soát Hạch Toán Chi Tiết (Chân Widget theo Ảnh tham chiếu 2) */}
      <div className="mt-1 pt-3.5 border-t border-slate-200/70 dark:border-slate-800">
        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
          <span>BẢNG ĐỐI SOÁT HẠCH TOÁN CHI PHÍ THEO PHÒNG BAN</span>
          <span className="text-[10px] font-normal text-slate-400">Đơn vị: VNĐ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
                <th className="py-1.5 pr-2 font-medium">Phòng Ban</th>
                <th className="py-1.5 px-2 font-medium">In Đơn Sắc (Trang &bull; Chi phí)</th>
                <th className="py-1.5 px-2 font-medium">In Màu (Trang &bull; Chi phí)</th>
                <th className="py-1.5 pl-2 font-medium text-right">Tổng Chi Phí</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-mono">
              {safeList.map((dept) => {
                const isCurrentActive = activeDeptId === dept.departmentId;
                const isDimmed = activeDeptId !== null && !isCurrentActive;

                return (
                  <tr
                    key={dept.departmentId}
                    onClick={() => handleToggleSelect(dept.departmentId)}
                    onMouseEnter={() => setHoveredDeptId(dept.departmentId)}
                    onMouseLeave={() => setHoveredDeptId(null)}
                    className={`transition-colors cursor-pointer text-xs ${
                      isCurrentActive
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    } ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
                  >
                    <td className="py-2 pr-2 font-sans font-medium text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dept.color }} />
                        <span>{dept.departmentName}</span>
                        <span className="font-normal text-[10px] text-slate-400">({dept.deviceCount} máy)</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-indigo-700 dark:text-indigo-400">
                      {dept.monoPages.toLocaleString('vi-VN')} tr &bull; {dept.monoCost.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2 px-2 text-cyan-700 dark:text-cyan-400">
                      {dept.colorPages.toLocaleString('vi-VN')} tr &bull; {dept.colorCost.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2 pl-2 text-right font-bold text-slate-800 dark:text-slate-100">
                      {dept.totalCost.toLocaleString('vi-VN')} ₫
                      <span className="ml-1 text-[9.5px] font-sans font-bold px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {dept.percentageShare}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CostAllocationArcChart;
