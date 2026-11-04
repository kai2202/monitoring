import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon, faSliders, faRotate, faCheck, faXmark } from '../../../../shared/icons';
import { DistributionThresholdDef } from '../../../../types/analyticsUI';

interface DistributionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialThresholds: DistributionThresholdDef[];
  onSave: (thresholds: DistributionThresholdDef[]) => void;
  onReset: () => void;
}

function generateEqualStepThresholds(columnCount: number, stepSize: number): DistributionThresholdDef[] {
  const result: DistributionThresholdDef[] = [];
  for (let i = 0; i < columnCount; i++) {
    const isFirst = i === 0;
    const isLast = i === columnCount - 1;
    const min = isFirst ? 0 : i * stepSize + 1;
    const max = isLast ? Infinity : (i + 1) * stepSize;
    const rangeLabel = isLast
      ? `> ${(i * stepSize).toLocaleString('vi-VN')}`
      : `${min.toLocaleString('vi-VN')} – ${max.toLocaleString('vi-VN')}`;

    result.push({ id: `custom-b${i + 1}`, rangeLabel, min, max });
  }
  return result;
}

export const DistributionSettingsModal: React.FC<DistributionSettingsModalProps> = ({
  isOpen,
  onClose,
  initialThresholds,
  onSave,
  onReset,
}) => {
  const [tempColumnCount, setTempColumnCount] = useState<number>(initialThresholds.length);
  const [tempStepSize, setTempStepSize] = useState<number>(1000);
  const [editableRows, setEditableRows] = useState<DistributionThresholdDef[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTempColumnCount(initialThresholds.length);
      setEditableRows(JSON.parse(JSON.stringify(initialThresholds)));
    }
  }, [isOpen, initialThresholds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleApplyPresetStep = (cols: number, step: number) => {
    setTempColumnCount(cols);
    setTempStepSize(step);
    setEditableRows(generateEqualStepThresholds(cols, step));
  };

  const handleUpdateRow = (index: number, field: keyof DistributionThresholdDef, value: any) => {
    setEditableRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-[9999] flex items-center justify-center p-5">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-[640px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faSliders} className="text-blue-600 text-sm" />
            <h3 className="m-0 text-base font-extrabold text-[var(--text-primary)]">
              Cài Đặt Dải Phân Bố Sản Lượng
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer p-1"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">
              1. Số lượng cột hiển thị
            </label>
            <div className="flex flex-wrap gap-2">
              {[4, 6, 8, 10, 12].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleApplyPresetStep(cnt, tempStepSize)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs border border-[var(--border-color)] cursor-pointer transition-colors ${
                    tempColumnCount === cnt
                      ? 'font-extrabold bg-blue-600 text-white'
                      : 'font-medium bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {cnt} cột
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">
              2. Khoảng bước nhảy nhanh (trang in / dải)
            </label>
            <div className="flex flex-wrap gap-2">
              {[500, 1000, 1500, 2000, 3000].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => handleApplyPresetStep(tempColumnCount, step)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs border border-[var(--border-color)] cursor-pointer transition-colors ${
                    tempStepSize === step
                      ? 'font-extrabold bg-cyan-600 text-white'
                      : 'font-medium bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {step.toLocaleString('vi-VN')} trang
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">
              3. Chi tiết dải sản lượng ({editableRows.length} dải)
            </label>
            <div className="max-h-[220px] overflow-y-auto border border-[var(--border-color)] rounded-xl bg-[var(--bg-subtle)]">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-left text-[var(--text-muted)]">
                    <th className="p-2.5">Dải</th>
                    <th className="p-2.5">Tên nhãn</th>
                    <th className="p-2.5">Min</th>
                    <th className="p-2.5">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {editableRows.map((row, idx) => (
                    <tr key={row.id} className="border-b border-[var(--border-color)]">
                      <td className="p-2.5 font-bold text-blue-600">Cột {idx + 1}</td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={row.rangeLabel}
                          onChange={(e) => handleUpdateRow(idx, 'rangeLabel', e.target.value)}
                          className="w-full px-2 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={row.min}
                          onChange={(e) => handleUpdateRow(idx, 'min', Number(e.target.value))}
                          className="w-20 px-2 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={row.max === Infinity ? 'Infinity' : row.max}
                          onChange={(e) =>
                            handleUpdateRow(
                              idx,
                              'max',
                              e.target.value === 'Infinity' ? Infinity : Number(e.target.value)
                            )
                          }
                          className="w-20 px-2 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-subtle)]">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-transparent text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <FontAwesomeIcon icon={faRotate} className="text-xs" />
            <span>Khôi phục mặc định</span>
          </button>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => onSave(editableRows)}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white border-none cursor-pointer shadow-md hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>Áp dụng cấu hình</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
