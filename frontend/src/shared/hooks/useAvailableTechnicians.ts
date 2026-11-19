/**
 * Frontend/src/shared/hooks/useAvailableTechnicians.ts
 *
 * Custom Hook dùng chung nạp danh sách Kỹ thuật viên khả dụng từ CSDL qua settingsService.getTechnicians().
 * Phục vụ các Modal Lập phiếu bảo trì & Điều phối KTV mà không cần tạo liên kết chéo giữa các feature.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { useState, useEffect } from 'react';
import { settingsService } from '../../services';
import { TechnicianOption } from '../../services/interfaces/ISettingsService';

export interface UseAvailableTechniciansOptions {
  enabled: boolean;
  excludeName?: string;
  fallbackName?: string;
}

export function useAvailableTechnicians({
  enabled,
  excludeName,
  fallbackName = '',
}: UseAvailableTechniciansOptions) {
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [assignee, setAssignee] = useState<string>(fallbackName);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    settingsService
      .getTechnicians()
      .then((list) => {
        if (!mounted) return;
        setTechnicians(list);
        const preferred =
          (excludeName ? list.find((t) => t.name !== excludeName) : list.find((t) => t.role === 'FIELD_TECH')) ||
          list[0];
        if (preferred) {
          setAssigneeId(preferred.id);
          setAssignee(preferred.name);
        }
      })
      .catch(() => {
        if (mounted) setTechnicians([]);
      });
    return () => {
      mounted = false;
    };
  }, [enabled, excludeName]);

  const selectTechnicianById = (id: string) => {
    setAssigneeId(id);
    const chosen = technicians.find((t) => t.id === id);
    if (chosen) setAssignee(chosen.name);
  };

  return {
    technicians,
    assigneeId,
    assignee,
    setAssignee,
    selectTechnicianById,
  };
}

