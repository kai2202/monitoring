/**
 * Frontend/src/features/dashboard/components/diagnostics/DiagnosticsLocationTab.tsx
 *
 * Tab Xem Vị Trí & Sơ Đồ Tầng trong Diagnostics Drawer:
 * - Hiển thị sơ đồ mặt bằng tĩnh chuẩn AutoCAD Blueprint (đồng bộ 100% với sơ đồ tầng).
 * - Hiển thị toàn bộ các máy in đang hoạt động trên cùng tầng để người dùng thấy các thiết bị lân cận.
 * - Làm nổi bật (phát sáng) vị trí máy in hiện tại đang xem.
 * - Tuân thủ AGENTS.md Rule 5 (MetricValue) & Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useMemo, useEffect, useState } from 'react';
import {
  FontAwesomeIcon,
  faBuilding,
  faLocationDot,
  faUser,
  faCircleInfo,
  faGear,
  faPrint,
} from '../../../../shared/icons';
import { Printer, FloorObstacle } from '../../../../types/printer';
import { printerService } from '../../../../services';
import { getFloorObstacles, getFloorDimensions } from '../../../printers/utils/floorObstacles';
import { getTeamStyle } from '../../../printers/utils/teamColors';
import { FloorPlanCell } from '../../../printers/components/grid/FloorPlanCell';

export interface DiagnosticsLocationTabProps {
  printer: Printer;
  allPrinters?: Printer[];
  onOpenEdit?: (printer: Printer) => void;
  isAdmin?: boolean;
}

export const DiagnosticsLocationTab: React.FC<DiagnosticsLocationTabProps> = ({
  printer,
  allPrinters,
  onOpenEdit,
  isAdmin = false,
}) => {
  const [fetchedPrinters, setFetchedPrinters] = useState<Printer[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);
  const activeTeamHighlight = hoveredTeam || selectedTeam;

  // Fallback tự nạp danh sách máy in nếu component cha chưa truyền allPrinters
  useEffect(() => {
    if (allPrinters && allPrinters.length > 0) return;
    let active = true;
    printerService
      .getPrinters()
      .then((list) => {
        if (active) setFetchedPrinters(list);
      })
      .catch((err) => {
        console.error('Không thể nạp danh sách máy in lân cận cho sơ đồ tầng:', err);
      });
    return () => {
      active = false;
    };
  }, [allPrinters]);

  const sourcePrinters = allPrinters && allPrinters.length > 0 ? allPrinters : fetchedPrinters;
  const currentFloor = printer.floor || 'Tầng 1';
  const obstacles = useMemo(() => getFloorObstacles(currentFloor, printer.branch), [currentFloor, printer.branch]);
  const { cols, rows } = useMemo(() => getFloorDimensions(currentFloor, printer.branch), [currentFloor, printer.branch]);

  const hasGridPos =
    printer.gridX !== null &&
    printer.gridX !== undefined &&
    printer.gridY !== null &&
    printer.gridY !== undefined;

  const obstacleMap = useMemo(() => {
    const map = new Map<string, FloorObstacle>();
    obstacles.forEach((o) => {
      map.set(`${o.gridX},${o.gridY}`, o);
    });
    return map;
  }, [obstacles]);

  // Lọc và map tất cả các máy in hoạt động trên cùng tầng & chi nhánh
  const { printerMap, nearbyCount } = useMemo(() => {
    const map = new Map<string, Printer>();
    let others = 0;

    sourcePrinters.forEach((p) => {
      if (p.monitoringStatus === 'Storage' || p.monitoringStatus === 'Decommissioned') return;
      const pFloor = p.floor || 'Tầng 1';
      if (pFloor !== currentFloor) return;
      if (printer.branch && p.branch && p.branch !== printer.branch) return;
      if (p.gridX === null || p.gridX === undefined || p.gridY === null || p.gridY === undefined) return;

      map.set(`${p.gridX},${p.gridY}`, p);
      if (p.id !== printer.id) others += 1;
    });

    // Luôn đảm bảo máy in chính đang xem nằm đúng tọa độ hiện tại
    if (hasGridPos) {
      map.set(`${printer.gridX},${printer.gridY}`, printer);
    }

    return { printerMap: map, nearbyCount: others };
  }, [sourcePrinters, currentFloor, printer, hasGridPos]);

  // Thống kê màu bàn & máy in theo Team/Nhóm trên tầng hiện tại (đồng bộ với tab Sơ đồ tầng)
  const floorTeamStats = useMemo(() => {
    const map = new Map<string, { team: string; desks: number; printers: number }>();
    obstacles.forEach((o) => {
      if (o.type === 'desk' && o.team) {
        const cur = map.get(o.team) || { team: o.team, desks: 0, printers: 0 };
        cur.desks += 1;
        map.set(o.team, cur);
      }
    });
    printerMap.forEach((p) => {
      if (p.managingTeam) {
        const cur = map.get(p.managingTeam) || { team: p.managingTeam, desks: 0, printers: 0 };
        cur.printers += 1;
        map.set(p.managingTeam, cur);
      }
    });
    return Array.from(map.values());
  }, [obstacles, printerMap]);

  return (
    <div className="p-5 flex flex-col gap-4">
      {/* Thanh Thông Tin Vị Trí & Bàn Giao Phẳng Hiện Đại */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Thông tin vị trí &amp; bàn giao hiện tại
          </span>
          {isAdmin && onOpenEdit && (
            <button
              type="button"
              onClick={() => onOpenEdit(printer)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/70 text-[11px] font-semibold transition-colors cursor-pointer"
              title="Cập nhật cấu hình, điều chuyển vị trí hoặc trạng thái giám sát"
            >
              <FontAwesomeIcon icon={faGear} className="text-[10px]" />
              <span>Cập Nhật Hồ Sơ &amp; Vị Trí</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
          <div className="px-4 py-3 flex items-center gap-3">
            <FontAwesomeIcon icon={faLocationDot} className="text-blue-600 text-sm shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Tầng &amp; Phòng Ban</div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {currentFloor} • {printer.department || printer.location || 'Phòng làm việc'}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 flex items-center gap-3">
            <FontAwesomeIcon icon={faBuilding} className="text-emerald-600 text-sm shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Tọa Độ Ô Sơ Đồ</div>
              <div
                className={`text-xs font-bold font-mono ${hasGridPos ? 'text-emerald-600' : 'text-amber-600'}`}
              >
                {hasGridPos ? `Cột ${(printer.gridX ?? 0) + 1}, Hàng ${(printer.gridY ?? 0) + 1}` : 'Chưa định vị ô'}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 flex items-center gap-3">
            <FontAwesomeIcon icon={faUser} className="text-violet-600 text-sm shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Người Đại Diện</div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {printer.custodianName || 'Chưa phân công'} ({printer.managingTeam || 'Tổng vụ'})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thông báo nếu chưa gán tọa độ */}
      {!hasGridPos && (
        <div className="px-3.5 py-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 border-l-4 border-l-amber-500 flex items-center gap-2.5 text-xs text-amber-900">
          <FontAwesomeIcon icon={faCircleInfo} className="text-amber-600 shrink-0" />
          <span>Máy in này đang thuộc {printer.location} nhưng chưa được xếp tọa độ cụ thể trên sơ đồ mặt bằng tầng.</span>
        </div>
      )}

      {/* Sơ Đồ Mặt Bằng Tĩnh Xem Nhanh */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="text-[13px] font-bold text-slate-900 dark:text-slate-100 m-0">
            Mặt Bằng Bố Trí Phòng &amp; Thiết Bị Lân Cận ({currentFloor})
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.75)] inline-block" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Máy đang xem</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FontAwesomeIcon icon={faPrint} className="text-[10px] text-blue-600" />
              <span>Máy in khác cùng tầng ({nearbyCount})</span>
            </span>
          </div>
        </div>

        {/* Chú giải màu Bàn & Máy in theo Team/Nhóm (Hover / Click làm nổi bật) */}
        {floorTeamStats.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap py-1">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">Nhóm / Bàn:</span>
            {floorTeamStats.map((stat) => {
              const style = getTeamStyle(stat.team);
              const isActive = selectedTeam === stat.team;
              return (
                <button
                  key={stat.team}
                  type="button"
                  onMouseEnter={() => setHoveredTeam(stat.team)}
                  onMouseLeave={() => setHoveredTeam(null)}
                  onClick={() => setSelectedTeam(isActive ? null : stat.team)}
                  title={`Bấm hoặc rê chuột để làm nổi bật bàn & máy in của ${stat.team}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? style.border : style.bg,
                    color: isActive ? '#ffffff' : style.color,
                    border: `1px solid ${style.border}`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isActive ? '#ffffff' : style.border }}
                  />
                  <span>{style.shortName}</span>
                  <span className="opacity-75 font-mono text-[10px]">
                    ({stat.desks} bàn{stat.printers > 0 ? ` • ${stat.printers} máy` : ''})
                  </span>
                </button>
              );
            })}
            {selectedTeam && (
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="text-[11px] font-semibold text-blue-600 hover:underline px-1.5 bg-transparent border-0 cursor-pointer"
              >
                Tất cả
              </button>
            )}
          </div>
        )}

        <div
          className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 overflow-x-auto"
          style={{
            backgroundColor: '#f8fafc',
            backgroundImage: 'radial-gradient(#cbd5e1 1.1px, transparent 1.1px)',
            backgroundSize: '19px 19px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 38px)`,
              gap: 0,
              width: `${cols * 38}px`,
              margin: '0 auto',
              border: '1.5px solid #cbd5e1',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
            }}
          >
            {Array.from({ length: rows }).map((_, rIdx) =>
              Array.from({ length: cols }).map((_, cIdx) => {
                const cellKey = `${cIdx},${rIdx}`;
                const cellPrinter = printerMap.get(cellKey);
                const isTarget = Boolean(cellPrinter && cellPrinter.id === printer.id);
                const obs = obstacleMap.get(cellKey);

                return (
                  <FloorPlanCell
                    key={cellKey}
                    cellKey={cellKey}
                    gridX={cIdx}
                    gridY={rIdx}
                    printer={cellPrinter}
                    obstacle={obs}
                    neighbors={{
                      top: obstacleMap.get(`${cIdx},${rIdx - 1}`),
                      bottom: obstacleMap.get(`${cIdx},${rIdx + 1}`),
                      left: obstacleMap.get(`${cIdx - 1},${rIdx}`),
                      right: obstacleMap.get(`${cIdx + 1},${rIdx}`),
                    }}
                    isHighlighted={isTarget}
                    isSelected={isTarget}
                    activeTeamFilter={activeTeamHighlight}
                    isDimmed={Boolean(
                      activeTeamHighlight &&
                        obs?.team !== activeTeamHighlight &&
                        cellPrinter?.managingTeam !== activeTeamHighlight
                    )}
                    isDesignMode={false}
                    onEditPrinter={(clicked) => onOpenEdit?.(clicked)}
                    onRemovePrinter={() => {}}
                    onEmptyCellClick={() => {}}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsLocationTab;
