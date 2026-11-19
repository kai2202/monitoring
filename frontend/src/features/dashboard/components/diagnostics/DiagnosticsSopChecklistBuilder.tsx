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
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Các bước kiểm tra quy chuẩn (SOP)
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            ({sopSteps.length} bước)
          </span>
        </div>
        {onLoadKnowledgeReuse && (
          <button
            type="button"
            onClick={onLoadKnowledgeReuse}
            disabled={isLoadingKnowledge}
            className="text-[11px] font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
            title="Tự động tra cứu và nạp các bước sửa chữa từ tri thức lịch sử"
          >
            <FontAwesomeIcon icon={faBolt} className="text-[10px]" />
            <span>{isLoadingKnowledge ? 'Đang nạp...' : 'Gợi ý từ lịch sử'}</span>
          </button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-950/40 divide-y divide-slate-200/70 dark:divide-slate-800 overflow-hidden">
        {sopSteps.length === 0 ? (
          <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
            Chưa có bước kiểm tra nào. Thêm bước bên dưới hoặc dùng gợi ý từ lịch sử.
          </div>
        ) : (
          sopSteps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2.5 px-3 py-2 bg-white dark:bg-slate-900/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-200 truncate">{step}</span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveStep(idx)}
                className="w-6 h-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Xóa bước này"
                aria-label={`Xóa bước ${idx + 1}`}
              >
                <FontAwesomeIcon icon={faTrashCan} className="text-[11px]" />
              </button>
            </div>
          ))
        )}

        <div className="flex items-center gap-2 px-2.5 py-2 bg-slate-50/80 dark:bg-slate-900/60">
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
            className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-colors"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
            <span>Thêm</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsSopChecklistBuilder;
