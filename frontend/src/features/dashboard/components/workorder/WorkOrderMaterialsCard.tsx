/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderMaterialsCard.tsx
 *
 * Quản lý Vật tư Dự kiến vs Thực xuất / Báo hỏng ngay trong Lệnh bảo trì:
 * - Hiển thị tên vật tư gọn theo màu sắc/linh kiện (formatSupplyShortLabel).
 * - Nút "+ Lấy thêm vật tư" mở danh sách chọn nhanh (ẩn thanh dropdown thô mặc định).
 * - Cho phép KTV điều chỉnh số lượng dùng tốt & hư/lỗi kèm lý do phát sinh.
 * - Tự động khóa chỉnh sửa khi Task đã hoàn thành (Completed).
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faBox, faPlus, faMinus, faXmark, faLock } from '../../../../shared/icons';
import { Task, TaskMaterialUsage } from '../../../../types/task';
import { useGetInventoryItemsQuery } from '../../../inventory/slices/inventoryApiSlice';
import { formatSupplyShortLabel } from '../../utils/taskTypeConfig';

interface WorkOrderMaterialsCardProps {
  task: Task;
  readOnly: boolean;
  onUpdateMaterials: (materials: TaskMaterialUsage[]) => void;
}

const QUICK_ADJUST_REASONS = [
  'Hộp đầu bị hư/lỗi, lấy thêm hộp mới',
  'Phát sinh thay thêm linh kiện tại hiện trường',
];

export const WorkOrderMaterialsCard: React.FC<WorkOrderMaterialsCardProps> = ({
  task,
  readOnly,
  onUpdateMaterials,
}) => {
  const materials = task.plannedMaterials || [];
  const { data: invResponse } = useGetInventoryItemsQuery(undefined, { skip: readOnly });
  const inventoryItems = invResponse?.data || [];
  const [showAddPicker, setShowAddPicker] = useState(false);

  const handleAddExtraItem = (item: (typeof inventoryItems)[number]) => {
    const existing = materials.find((m) => m.inventoryItemId === item.id);
    if (existing) {
      onUpdateMaterials(
        materials.map((m) =>
          m.id === existing.id ? { ...m, actualUsedQty: m.actualUsedQty + 1 } : m
        )
      );
    } else {
      onUpdateMaterials([
        ...materials,
        {
          id: `mat-${Date.now()}-${item.id}`,
          inventoryItemId: item.id,
          itemName: item.name,
          sku: item.sku,
          unit: item.unit,
          plannedQty: 0,
          actualUsedQty: 1,
          defectiveQty: 0,
          adjustmentReason: 'Phát sinh lấy thêm vật tư trong quá trình xử lý',
        },
      ]);
    }
    setShowAddPicker(false);
  };

  const updateRow = (id: string, patch: Partial<TaskMaterialUsage>) => {
    onUpdateMaterials(materials.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faBox} className="text-xs text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 m-0">
            Vật tư &amp; Xuất kho ({materials.length})
          </h4>
          {task.status === 'Completed' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FontAwesomeIcon icon={faLock} className="text-[9px]" />
              <span>Đã chốt xuất kho</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowAddPicker((v) => !v)}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <FontAwesomeIcon icon={showAddPicker ? faXmark : faPlus} className="text-[10px]" />
              <span>{showAddPicker ? 'Đóng' : 'Lấy thêm vật tư'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Bộ chọn nhanh chỉ hiện khi bấm "+ Lấy thêm vật tư" */}
      {!readOnly && showAddPicker && (
        <div className="p-2 rounded-xl border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col gap-1 max-h-[160px] overflow-y-auto">
          {inventoryItems.length === 0 ? (
            <div className="py-2 text-center text-xs text-slate-400">Đang tải kho...</div>
          ) : (
            inventoryItems.map((it) => {
              const meta = formatSupplyShortLabel(it.name);
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => handleAddExtraItem(it)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-blue-50 border border-slate-200/80 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {meta.dotColor && (
                      <span style={{ backgroundColor: meta.dotColor }} className="w-2 h-2 rounded-full shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {meta.label}
                    </span>
                  </span>
                  <span className="text-[10.5px] text-slate-500 shrink-0">
                    Tồn: <strong>{it.currentStock}</strong> {it.unit}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}

      {materials.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-400 bg-slate-50/60 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
          Chưa có vật tư nào gắn với lệnh này. {!readOnly && 'Bấm "+ Lấy thêm vật tư" nếu cần xuất kho.'}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {materials.map((m) => {
            const totalExport = m.actualUsedQty + m.defectiveQty;
            const hasDiff = totalExport !== m.plannedQty;
            const supplyMeta = formatSupplyShortLabel(m.itemName);
            return (
              <div
                key={m.id}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {supplyMeta.dotColor && (
                      <span
                        style={{ backgroundColor: supplyMeta.dotColor }}
                        className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-slate-200/70"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {supplyMeta.label}
                      </div>
                      <div className="text-[10.5px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Dự kiến: <strong>{m.plannedQty}</strong> {m.unit}</span>
                        <span>•</span>
                        <span className={hasDiff ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                          Tổng xuất: {totalExport} {m.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!readOnly && m.plannedQty === 0 && (
                    <button
                      type="button"
                      onClick={() => onUpdateMaterials(materials.filter((x) => x.id !== m.id))}
                      className="w-6 h-6 rounded text-rose-500 hover:bg-rose-50 border-none bg-transparent cursor-pointer flex items-center justify-center"
                      title="Xóa vật tư phát sinh"
                    >
                      <FontAwesomeIcon icon={faXmark} className="text-xs" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Dùng tốt</span>
                    <div className="flex items-center gap-1.5">
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => updateRow(m.id, { actualUsedQty: Math.max(0, m.actualUsedQty - 1) })}
                          className="w-5 h-5 rounded border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faMinus} className="text-[9px]" />
                        </button>
                      )}
                      <span className="text-xs font-mono font-bold w-5 text-center">{m.actualUsedQty}</span>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => updateRow(m.id, { actualUsedQty: m.actualUsedQty + 1 })}
                          className="w-5 h-5 rounded border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-200/70 dark:border-rose-900/50">
                    <span className="text-[11px] font-semibold text-rose-600">Hư / Lỗi</span>
                    <div className="flex items-center gap-1.5">
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => updateRow(m.id, { defectiveQty: Math.max(0, m.defectiveQty - 1) })}
                          className="w-5 h-5 rounded border border-rose-200 bg-rose-50 text-rose-600 flex items-center justify-center cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faMinus} className="text-[9px]" />
                        </button>
                      )}
                      <span className="text-xs font-mono font-bold w-5 text-center text-rose-600">{m.defectiveQty}</span>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => updateRow(m.id, { defectiveQty: m.defectiveQty + 1 })}
                          className="w-5 h-5 rounded border border-rose-200 bg-rose-50 text-rose-600 flex items-center justify-center cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {hasDiff && (
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      readOnly={readOnly}
                      value={m.adjustmentReason || ''}
                      onChange={(e) => updateRow(m.id, { adjustmentReason: e.target.value })}
                      placeholder="Nhập lý do chênh lệch so với dự kiến..."
                      className="w-full rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 px-2.5 py-1.5 text-[11px] text-slate-800 dark:text-slate-100 outline-none"
                    />
                    {!readOnly && (
                      <div className="flex flex-wrap gap-1">
                        {QUICK_ADJUST_REASONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => updateRow(m.id, { adjustmentReason: r })}
                            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkOrderMaterialsCard;
