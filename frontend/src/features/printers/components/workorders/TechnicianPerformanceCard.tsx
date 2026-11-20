/**
 * Frontend/src/features/printers/components/workorders/TechnicianPerformanceCard.tsx
 *
 * Thanh Đối Chiếu Hiệu Suất Kỹ Thuật Viên (KPI & SLA Strip):
 * - Thiết kế phẳng 1 hàng tinh gọn: Header + 4 ô chỉ số chia cột bằng đường kẻ mảnh.
 * - Tuân thủ AGENTS.md Rule 5.1 (không bịa số liệu) & Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import { Task } from '../../../../types/task';
import {
  FontAwesomeIcon,
  faUserCheck,
  faShieldCheck,
  faFileLines,
  faWrench,
} from '../../../../shared/icons';

interface TechnicianPerformanceCardProps {
  tasks: Task[];
}

export const TechnicianPerformanceCard: React.FC<TechnicianPerformanceCardProps> = ({ tasks = [] }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedTech, setSelectedTech] = useState<string>('all');

  const isTechRole = user?.role === 'FIELD_TECH';

  const technicians = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.assignee) set.add(t.assignee);
    });
    return Array.from(set);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (isTechRole) {
      const userName = (user?.fullName || '').toLowerCase().trim();
      return tasks.filter(
        (t) => (user?.id && t.assigneeId === user.id) || (userName && (t.assignee || '').toLowerCase().includes(userName))
      );
    }
    if (selectedTech === 'all') return tasks;
    return tasks.filter((t) => t.assignee === selectedTech);
  }, [tasks, selectedTech, isTechRole, user]);

  const stats = useMemo(() => {
    const activeAndCompleted = filteredTasks.filter((t) => t.status !== 'Cancelled');
    const total = activeAndCompleted.length;
    const completedList = activeAndCompleted.filter((t) => t.status === 'Completed');
    const completed = completedList.length;
    const inProgress = activeAndCompleted.filter(
      (t) => t.status === 'In_Progress' || t.status === 'Planned' || t.status === 'Pending_Verification'
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const slaEligible = completedList.filter((t) => Boolean(t.dueDate && t.completedDate));
    const slaOnTime = slaEligible.filter((t) => String(t.completedDate).slice(0, 10) <= String(t.dueDate).slice(0, 10)).length;
    const slaRate: number | null = slaEligible.length > 0 ? Number(((slaOnTime / slaEligible.length) * 100).toFixed(1)) : null;

    const grade =
      slaRate === null
        ? { label: 'Chưa đủ dữ liệu SLA', cls: 'bg-slate-100 text-slate-600' }
        : slaRate >= 90
        ? { label: 'Hạng A (Xuất sắc)', cls: 'bg-emerald-50 text-emerald-700' }
        : slaRate >= 75
        ? { label: 'Hạng B (Đạt chuẩn)', cls: 'bg-blue-50 text-blue-700' }
        : { label: 'Cần cải thiện', cls: 'bg-amber-50 text-amber-700' };

    return { total, completed, inProgress, completionRate, slaRate, grade };
  }, [filteredTasks]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header gọn */}
      <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <FontAwesomeIcon
            icon={isTechRole ? faUserCheck : faShieldCheck}
            className={`text-sm ${isTechRole ? 'text-amber-600' : 'text-blue-600'}`}
          />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 m-0">
            {isTechRole ? 'Năng Suất Cá Nhân (KPI & SLA)' : 'Hiệu Suất Xử Lý & Tuân Thủ SLA'}
          </h3>
          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${stats.grade.cls}`}>
            {stats.grade.label}
          </span>
        </div>

        {!isTechRole && technicians.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">KTV:</span>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Toàn bộ ({technicians.length})</option>
              {technicians.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4 ô chỉ số ngang hàng */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Tổng số lệnh</div>
            <div className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">{stats.total}</div>
          </div>
          <FontAwesomeIcon icon={faFileLines} className="text-slate-300 text-base" />
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Đã hoàn tất</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-extrabold font-mono text-emerald-600">{stats.completed}</span>
              <span className="text-[11px] font-semibold text-emerald-600">({stats.completionRate}%)</span>
            </div>
          </div>
          <FontAwesomeIcon icon={faShieldCheck} className="text-emerald-200 text-base" />
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Đang xử lý</div>
            <div className="text-base font-extrabold font-mono text-amber-600 mt-0.5">{stats.inProgress}</div>
          </div>
          <FontAwesomeIcon icon={faWrench} className="text-amber-200 text-base" />
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Đúng hạn SLA</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100">
                {stats.slaRate !== null ? `${stats.slaRate}%` : '—'}
              </span>
              <span className="text-[10.5px] text-slate-400">(Mục tiêu ≥ 90%)</span>
            </div>
          </div>
          <FontAwesomeIcon icon={faUserCheck} className="text-blue-200 text-base" />
        </div>
      </div>
    </div>
  );
};

export default TechnicianPerformanceCard;
