/**
 * Frontend/src/features/dashboard/components/diagnostics/DiagnosticsSopChecklistBuilder.tsx
 *
 * Khung Xây Dựng Danh Sách Kiểm Tra Quy Chuẩn (SOP Checklist Builder):
 * - Hỗ trợ thêm/xóa bước kỹ thuật động.
 * - Hỗ trợ nạp nhanh từ Động cơ Tri thức Lịch sử (Knowledge Reuse Engine).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faPlus, faTrashCan, faBolt } from '../../../../shared/icons';

interface DiagnosticsSopChecklistBuilderProps {
  sopSteps: string[];
  onAddStep: (step: string) => void;
  onRemoveStep: (index: number) => void;
  onLoadKnowledgeReuse?: () => void;
  isLoadingKnowledge?: boolean;
}

export const DiagnosticsSopChecklistBuilder: React.FC<DiagnosticsSopChecklistBuilderProps> = ({
  sopSteps,
  onAddStep,
  onRemoveStep,
  onLoadKnowledgeReuse,
  isLoadingKnowledge = false,
}) => {
  const [newStepText, setNewStepText] = useState('');

  const handleAdd = () => {
    if (!newStepText.trim()) return;
    onAddStep(newStepText.trim());
    setNewStepText('');
  };

  return (
    <div className="rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 p-3.5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Các Bước Kiểm Tra Quy Chuẩn (SOP Checklist)
        </span>
        <div className="flex items-center gap-2">
          {onLoadKnowledgeReuse && (
            <button
              type="button"
              onClick={onLoadKnowledgeReuse}
              disabled={isLoadingKnowledge}
              className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
              title="Tự động tra cứu và nạp các bước sửa chữa từ tri thức lịch sử"
            >
              <FontAwesomeIcon icon={faBolt} className="text-[10px]" />
              <span>{isLoadingKnowledge ? 'Đang nạp...' : 'Gợi ý từ lịch sử'}</span>
            </button>
          )}
          <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
            ({sopSteps.length} bước)
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {sopSteps.map((step, idx) => (
          <div
            key={idx}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-xs shadow-xs"
          >
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium min-w-0 pr-2">
              <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10.5px] font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="truncate">{step}</span>
            </div>
            <button
              type="button"
              onClick={() => onRemoveStep(idx)}
              className="text-slate-400 hover:text-rose-500 p-1 transition-colors shrink-0"
              title="Xóa bước này"
            >
              <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-1">
        <input
          type="text"
          placeholder="+ Thêm bước kiểm tra quy chuẩn..."
          value={newStepText}
          onChange={(e) => setNewStepText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xs" />
          <span>Thêm</span>
        </button>
      </div>
    </div>
  );
};

export default DiagnosticsSopChecklistBuilder;
