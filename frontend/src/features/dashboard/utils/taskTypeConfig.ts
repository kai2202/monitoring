/**
 * Frontend/src/features/dashboard/utils/taskTypeConfig.ts
 *
 * Cấu hình UI động cho 4 danh mục công việc (TaskType):
 * - SUPPLY_REPLENISHMENT: Thay thế vật tư (nhanh, trọng tâm vật tư).
 * - CORRECTIVE_REPAIR: Sửa chữa sự cố (đầy đủ SOP, lịch sử, vật tư, hãng).
 * - PREVENTIVE_MAINTENANCE: Bảo trì định kỳ (trọng tâm checklist định kỳ).
 * - HARDWARE_INSPECTION: Kiểm tra hiện trường (khảo sát, worklog, ảnh).
 */

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBox, faWrench } from '../../../shared/icons';
import { TaskType } from '../../../types/task';

export interface TaskTypeMeta {
  type: TaskType;
  label: string;
  shortDesc: string;
  icon: IconDefinition;
  accentColor: string;
  activeCls: string;
  defaultSopSteps: string[];
  showSopOnCreate: boolean;
  showMaterialsOnCreate: boolean;
  materialsOptionalOnCreate: boolean;
  prioritizeMaterialsInDrawer: boolean;
  titlePlaceholder: string;
}

export const TASK_TYPE_CONFIGS: TaskTypeMeta[] = [
  {
    type: 'SUPPLY_REPLENISHMENT',
    label: 'Thay thế vật tư',
    shortDesc: 'Mực in, Drum, Hộp thải',
    icon: faBox,
    accentColor: '#2563eb',
    activeCls: 'border-blue-600 bg-blue-50/90 text-blue-700 ring-1 ring-blue-500/20',
    defaultSopSteps: [],
    showSopOnCreate: false,
    showMaterialsOnCreate: true,
    materialsOptionalOnCreate: false,
    prioritizeMaterialsInDrawer: true,
    titlePlaceholder: 'VD: Thay hộp mực đen Ricoh MP C6004',
  },
  {
    type: 'CORRECTIVE_REPAIR',
    label: 'Sửa chữa sự cố',
    shortDesc: 'Lỗi phần cứng, sự cố kỹ thuật',
    icon: faWrench,
    accentColor: '#dc2626',
    activeCls: 'border-rose-600 bg-rose-50/90 text-rose-700 ring-1 ring-rose-500/20',
    defaultSopSteps: [
      'Kiểm tra hiện trường & đọc mã lỗi SNMP',
      'Thực hiện sửa chữa / thay thế linh kiện',
      'In bản test kiểm tra chất lượng & bàn giao',
    ],
    showSopOnCreate: true,
    showMaterialsOnCreate: false,
    materialsOptionalOnCreate: false,
    prioritizeMaterialsInDrawer: false,
    titlePlaceholder: 'VD: Khắc phục lỗi cụm sấy SC541 & kiểm tra sensor',
  },
];

export function getTaskTypeMeta(type?: TaskType): TaskTypeMeta {
  return TASK_TYPE_CONFIGS.find((c) => c.type === type) || TASK_TYPE_CONFIGS[1];
}

export function formatSupplyShortLabel(rawName: string): { label: string; dotColor?: string } {
  const lower = rawName.toLowerCase();
  if (lower.includes('black') || lower.includes('đen')) return { label: 'Hộp mực Đen (Black)', dotColor: '#1e293b' };
  if (lower.includes('cyan') || lower.includes('xanh')) return { label: 'Hộp mực Xanh (Cyan)', dotColor: '#06b6d4' };
  if (lower.includes('magenta') || lower.includes('đỏ') || lower.includes('hồng')) return { label: 'Hộp mực Đỏ (Magenta)', dotColor: '#ec4899' };
  if (lower.includes('yellow') || lower.includes('vàng')) return { label: 'Hộp mực Vàng (Yellow)', dotColor: '#eab308' };
  if (lower.includes('thải') || lower.includes('waste')) return { label: 'Hộp mực thải', dotColor: '#64748b' };
  if (lower.includes('drum') || lower.includes('trống')) return { label: 'Cụm trống (Drum)', dotColor: '#6366f1' };
  if (lower.includes('sấy') || lower.includes('fuser')) return { label: 'Cụm sấy (Fuser)', dotColor: '#f97316' };
  return { label: rawName };
}
