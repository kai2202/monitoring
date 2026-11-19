/**
 * Frontend/src/features/printers/components/inventory/GeneralAffairsInventoryHub.tsx
 *
 * Trung Tâm Kiểm Kê & Quản Trị Mặt Bằng Thiết Bị (Floor Plan & Asset Audit Hub):
 * - Strip KPI phẳng 4 ô tương tác (Toàn cty, Tại tầng, Lưu kho, Chưa gán vị trí).
 * - Split Screen: Sơ đồ tầng AutoCAD (Trái) & Danh sách phân bổ phẳng divide-y (Phải).
 * - Tuân thủ AGENTS.md Rule 5, Rule 7.1 (< 300 LOC) & Rule 7.4 (FontAwesome 100%, zero emojis).
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  FontAwesomeIcon, faPrint, faBoxesStacked, faLocationDot, faClock, faXmark,
  faCircleCheck, faMagnifyingGlass, faDownload, faPenToSquare, faLayerGroup,
} from '@/shared/icons';
import { Printer } from '@/types/printer';
import { printerService, locationService } from '@/services';
import { getTeamStyle } from '../../utils/teamColors';
import { getPrinterSizeCategory, getPrinterSizeMeta } from '../../utils/deviceSize';
import { FloorPlanGridPaper } from '../grid/FloorPlanGridPaper';
import { FloorPlanAssignPrinterModal } from '../grid/FloorPlanAssignPrinterModal';

export interface GeneralAffairsInventoryHubProps {
  printers: Printer[];
  onRefresh: () => void;
  onEditPrinter: (printer: Printer) => void;
  onOpenDrawer?: (printer: Printer, tab: 'diag' | 'tasks' | 'counters' | 'history') => void;
  onOpenBranchManager?: () => void;
}

export const GeneralAffairsInventoryHub: React.FC<GeneralAffairsInventoryHubProps> = ({
  printers, onRefresh, onEditPrinter, onOpenDrawer, onOpenBranchManager,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const branchParam = searchParams.get('branch');
  const floorParam = searchParams.get('floor');
  const highlightParam = searchParams.get('highlight');
  const sizeParam = searchParams.get('size');

  const [branches, setBranches] = useState(() => locationService.getBranches());
  useEffect(() => locationService.subscribe(() => setBranches(locationService.getBranches())), []);

  const branchNames = useMemo(() => branches.map((b) => b.name), [branches]);
  const [selectedBranch, setSelectedBranch] = useState(branchParam || branchNames[0] || '');
  const branchFloors = useMemo(() => locationService.getFloorsByBranch(selectedBranch), [branches, selectedBranch]);
  const [selectedFloor, setSelectedFloor] = useState(floorParam || branchFloors[0] || 'Tầng trệt');

  useEffect(() => {
    if (branchNames.length > 0 && !branchNames.includes(selectedBranch)) setSelectedBranch(branchNames[0]);
  }, [branchNames, selectedBranch]);

  useEffect(() => {
    if (branchFloors.length > 0 && !branchFloors.includes(selectedFloor)) setSelectedFloor(branchFloors[0]);
  }, [branchFloors, selectedFloor]);

  useEffect(() => {
    if (branchParam && branchParam !== selectedBranch) setSelectedBranch(branchParam);
    if (floorParam && floorParam !== selectedFloor) setSelectedFloor(floorParam);
  }, [branchParam, floorParam]);

  const [kpiView, setKpiView] = useState<'floor' | 'all' | 'storage' | 'unassigned'>('floor');
  const [searchQuery, setSearchQuery] = useState('');
  const [placementFilter, setPlacementFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [sizeFilter, setSizeFilter] = useState<'all' | 'desktop' | 'large'>(() => (sizeParam === 'desktop' || sizeParam === 'large' ? sizeParam : 'all'));
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string | null>(null);

  useEffect(() => {
    if (sizeParam === 'desktop' || sizeParam === 'large') setSizeFilter(sizeParam);
  }, [sizeParam]);
  const [assignCell, setAssignCell] = useState<{ floor: string; x: number; y: number; deskTeam?: string; isDesk?: boolean } | null>(null);
  const [hoveredPrinterId, setHoveredPrinterId] = useState<string | null>(null);

  const floorPrinters = useMemo(
    () => printers.filter((p) => p.monitoringStatus !== 'Storage' && p.monitoringStatus !== 'Decommissioned' && (p.floor || 'Tầng trệt') === selectedFloor && (!selectedBranch || !p.branch || p.branch === selectedBranch)),
    [printers, selectedFloor, selectedBranch]
  );
  const storagePrinters = useMemo(() => printers.filter((p) => p.monitoringStatus === 'Storage'), [printers]);
  const unassignedPrinters = useMemo(
    () => printers.filter((p) => (p.gridX == null || p.gridY == null) && p.monitoringStatus !== 'Storage' && p.monitoringStatus !== 'Decommissioned'),
    [printers]
  );

  const assignedCount = useMemo(() => floorPrinters.filter((p) => p.gridX != null && p.gridY != null).length, [floorPrinters]);
  const unassignedInFloorCount = floorPrinters.length - assignedCount;

  const baseList = kpiView === 'all' ? printers : kpiView === 'storage' ? storagePrinters : kpiView === 'unassigned' ? unassignedPrinters : floorPrinters;

  const displayedFloorPrinters = useMemo(() => {
    return baseList.filter((p) => {
      if (selectedTeamFilter && p.managingTeam !== selectedTeamFilter) return false;
      if (sizeFilter !== 'all' && getPrinterSizeCategory(p.deviceType) !== sizeFilter) return false;
      if (kpiView === 'floor') {
        const isAssigned = p.gridX != null && p.gridY != null;
        if (placementFilter === 'assigned' && !isAssigned) return false;
        if (placementFilter === 'unassigned' && isAssigned) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.ip.includes(q) || (p.custodianName && p.custodianName.toLowerCase().includes(q)) || (p.managingTeam && p.managingTeam.toLowerCase().includes(q));
    });
  }, [baseList, kpiView, searchQuery, placementFilter, selectedTeamFilter, sizeFilter]);

  const handleRemoveFromGrid = async (printer: Printer) => {
    if (!window.confirm(`Gỡ máy in [${printer.name}] khỏi vị trí trên sơ đồ tầng?`)) return;
    try {
      await printerService.updatePrinter(printer.id, { gridX: null, gridY: null });
      toast.success('Đã giải phóng vị trí ô trên sơ đồ.');
      onRefresh();
    } catch { toast.error('Lỗi khi xóa vị trí.'); }
  };

  const handleExportSheet = () => {
    const csvHeader = 'Mã máy in,Tên máy,IP,Trụ sở,Tầng,Tọa độ sơ đồ,Người đại diện,Ban quản lý,Trạng thái\n';
    const csvRows = displayedFloorPrinters
      .map((p) => `"${p.id}","${p.name}","${p.ip}","${p.branch || selectedBranch}","${p.floor || selectedFloor}","${p.gridX != null && p.gridY != null ? `Ô [${p.gridX + 1}, ${p.gridY + 1}]` : 'Chưa gán ô'}","${p.custodianName || 'Chưa có'}","${p.managingTeam || 'Tổng vụ'}","${p.monitoringStatus}"`)
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Phan_Bo_Thiet_Bi_${(kpiView === 'floor' ? selectedFloor : kpiView).replace(/\s+/g, '_')}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất danh sách phân bổ (${displayedFloorPrinters.length} thiết bị)!`);
  };

  const kpiItems = [
    { key: 'all' as const, icon: faPrint, label: 'Tổng máy toàn CTY', val: printers.length, iconCls: 'text-blue-600', activeCls: 'bg-blue-50/70 border-b-2 border-b-blue-600' },
    { key: 'floor' as const, icon: faCircleCheck, label: `Đang tại ${selectedFloor}`, val: floorPrinters.length, iconCls: 'text-emerald-600', activeCls: 'bg-emerald-50/70 border-b-2 border-b-emerald-600' },
    { key: 'storage' as const, icon: faBoxesStacked, label: 'Đang lưu kho', val: storagePrinters.length, iconCls: 'text-amber-600', activeCls: 'bg-amber-50/70 border-b-2 border-b-amber-600' },
    { key: 'unassigned' as const, icon: faClock, label: 'Chưa gán vị trí', val: unassignedPrinters.length, iconCls: 'text-violet-600', activeCls: 'bg-violet-50/70 border-b-2 border-b-violet-600' },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Strip KPI Phẳng 4 Ô Ngang */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {kpiItems.map((kpi) => {
          const isActive = kpiView === kpi.key;
          return (
            <button
              key={kpi.key}
              type="button"
              onClick={() => setKpiView(isActive && kpi.key !== 'floor' ? 'floor' : kpi.key)}
              className={`px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer border-none ${
                isActive ? kpi.activeCls : 'bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FontAwesomeIcon icon={kpi.icon} className={`text-sm shrink-0 ${kpi.iconCls}`} />
                <span className={`text-xs truncate ${isActive ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                  {kpi.label}
                </span>
              </div>
              <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-slate-100 shrink-0">{kpi.val}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Split Screen: Sơ đồ tầng AutoCAD (Trái) & Danh sách phân bổ phẳng (Phải) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-7 min-w-0">
          <FloorPlanGridPaper
            printers={printers} branches={branchNames} selectedBranch={selectedBranch}
            onBranchChange={(b) => { setSelectedBranch(b); setSelectedTeamFilter(null); const f = locationService.getFloorsByBranch(b); if (f[0]) setSelectedFloor(f[0]); }}
            floorList={branchFloors} selectedFloor={selectedFloor} onFloorChange={(fl) => { setSelectedFloor(fl); setSelectedTeamFilter(null); setKpiView('floor'); }}
            onEditPrinter={onEditPrinter} onOpenDrawer={onOpenDrawer} onRemoveFromGrid={handleRemoveFromGrid}
            onAssignCell={(floor, x, y, deskTeam, isDesk) => setAssignCell({ floor, x, y, deskTeam, isDesk })} searchQuery={searchQuery}
            placementFilter={placementFilter} sizeFilter={sizeFilter} highlightPrinterId={highlightParam} hoveredPrinterId={hoveredPrinterId}
            selectedTeamFilter={selectedTeamFilter} onSelectTeamFilter={setSelectedTeamFilter}
            onOpenBranchManager={onOpenBranchManager} isAssignModalOpen={Boolean(assignCell)} onPrintersChanged={onRefresh}
          />
        </div>

        {/* Khối Phải: Panel Phân Bổ Thiết Bị Tầng (Dribbble Linear / Modern SaaS Style) */}
        <div className="xl:col-span-5 relative min-h-[480px]">
          <div className="xl:absolute xl:inset-0 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-extrabold tracking-tight text-slate-900 dark:text-slate-100 m-0">
                  Phân Bổ Thiết Bị
                </h3>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {kpiView === 'all' ? 'Toàn CTY' : kpiView === 'storage' ? 'Lưu kho' : kpiView === 'unassigned' ? 'Chưa gán ô' : selectedFloor}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 m-0 mt-0.5">Rê chuột lên thẻ để định vị nhanh trên sơ đồ</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => navigate(`/printers${sizeFilter !== 'all' ? `?size=${sizeFilter}` : ''}`)}
                title="Mở danh sách bảng thiết bị (giữ nguyên bộ lọc kích thước)"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 text-[11px] font-semibold cursor-pointer"
              >
                Xem bảng →
              </button>
              <button
                type="button"
                onClick={handleExportSheet}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                title="Xuất danh sách phân bổ CSV"
              >
                <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Search & Unified Single-Row Filter Bar */}
          <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 bg-slate-50/90 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 focus-within:border-blue-400 focus-within:bg-white transition-colors">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[11px] text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên máy, IP, người đại diện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none bg-transparent outline-none text-xs text-slate-900 dark:text-slate-100"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="border-none bg-transparent cursor-pointer text-slate-400 hover:text-slate-600 p-0">
                  <FontAwesomeIcon icon={faXmark} className="text-[10.5px]" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              {kpiView === 'floor' ? (
                <div className="flex items-center gap-1">
                  {[
                    { id: 'all', label: `Tất cả (${floorPrinters.length})` },
                    { id: 'assigned', label: `Trên sơ đồ (${assignedCount})` },
                    { id: 'unassigned', label: `Chưa gán (${unassignedInFloorCount})` },
                  ].map((f) => {
                    const isAct = placementFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPlacementFilter(f.id as 'all' | 'assigned' | 'unassigned')}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold border-none cursor-pointer transition-colors ${
                          isAct ? 'bg-blue-50 text-blue-700' : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">{displayedFloorPrinters.length} thiết bị</span>
              )}

              <div className="p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 inline-flex items-center gap-0.5">
                {[
                  { id: 'all' as const, label: 'Mọi cỡ', icon: null },
                  { id: 'desktop' as const, label: 'Để bàn', icon: faPrint },
                  { id: 'large' as const, label: 'Cỡ lớn', icon: faLayerGroup },
                ].map((s) => {
                  const isAct = sizeFilter === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSizeFilter(s.id)}
                      className={`py-1 px-2 rounded-md text-[10.5px] font-semibold border-none cursor-pointer transition-all inline-flex items-center gap-1 ${
                        isAct ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'bg-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {s.icon && <FontAwesomeIcon icon={s.icon} className="text-[9.5px]" />}
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Danh sách thẻ nổi tối giản (Dribbble Floating Cards) */}
          <div className="p-3 flex flex-col gap-2.5 overflow-y-auto flex-1 bg-slate-50/70 dark:bg-slate-950/40">
            {displayedFloorPrinters.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-slate-400">
                Không tìm thấy máy in nào phù hợp bộ lọc hiện tại.
              </div>
            ) : (
              displayedFloorPrinters.map((p) => {
                const isHovered = hoveredPrinterId === p.id;
                const isAssigned = p.gridX != null && p.gridY != null;
                const sizeMeta = getPrinterSizeMeta(p.deviceType);
                const teamStyle = getTeamStyle(p.managingTeam);
                const initials = (p.custodianName || '').trim().split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase() || '?';

                return (
                  <div
                    key={p.id}
                    onMouseEnter={() => setHoveredPrinterId(p.id)}
                    onMouseLeave={() => setHoveredPrinterId(null)}
                    onClick={() => {
                      setHoveredPrinterId(p.id);
                      onOpenDrawer?.(p, 'diag');
                    }}
                    style={{ borderLeftWidth: '3px', borderLeftColor: teamStyle.color }}
                    className={`group rounded-xl border p-3 flex flex-col gap-2.5 cursor-pointer transition-all bg-white dark:bg-slate-900 ${
                      isHovered
                        ? 'border-blue-300 shadow-md ring-1 ring-blue-500/15'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Hàng 1: Icon + Tên máy + IP + Quick Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            sizeMeta.category === 'large' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600'
                          }`}
                          title={sizeMeta.label}
                        >
                          <FontAwesomeIcon icon={sizeMeta.icon} className="text-[12px]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12.5px] font-bold text-slate-900 dark:text-slate-100 truncate">{p.name}</span>
                            <span className="text-[9.5px] font-semibold text-slate-400 shrink-0">• {sizeMeta.shortLabel}</span>
                          </div>
                          <div className="text-[10.5px] font-mono text-slate-400">{p.ip}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPrinter(p);
                          }}
                          title="Hồ sơ & điều chuyển"
                          className="w-7 h-7 rounded-lg border border-slate-200/80 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-600 text-[11px] flex items-center justify-center cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        {isAssigned && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromGrid(p);
                            }}
                            title="Gỡ máy khỏi ô sơ đồ"
                            className="w-7 h-7 rounded-lg border border-rose-200/80 bg-rose-50/70 hover:bg-rose-100 text-rose-600 text-[11px] flex items-center justify-center cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Hàng 2: Avatar người đại diện + Team + Tọa độ */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          style={{ backgroundColor: teamStyle.badgeBg, color: teamStyle.color }}
                          className="w-5 h-5 rounded-full text-[9px] font-extrabold flex items-center justify-center shrink-0"
                        >
                          {initials}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                          {p.custodianName || 'Chưa gán đại diện'}
                        </span>
                        <span className="text-[10.5px] font-bold shrink-0" style={{ color: teamStyle.color }}>
                          • {teamStyle.shortName}
                        </span>
                      </div>

                      {isAssigned ? (
                        <span className="text-[10.5px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                          <FontAwesomeIcon icon={faLocationDot} className="text-[9px]" />
                          <span>[{p.gridX! + 1}, {p.gridY! + 1}]</span>
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-semibold text-violet-700 bg-violet-50 border border-violet-200/70 px-2 py-0.5 rounded-full shrink-0">
                          Chưa gán ô
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          </div>
        </div>
      </div>

      <FloorPlanAssignPrinterModal
        isOpen={Boolean(assignCell)}
        branch={selectedBranch}
        cell={assignCell}
        defaultTeam={assignCell?.deskTeam}
        isDeskCell={assignCell?.isDesk}
        printers={printers}
        onClose={() => setAssignCell(null)}
        onAssignSuccess={async (printerId, updates) => {
          if (!assignCell) return;
          try {
            await printerService.updatePrinter(printerId, {
              branch: updates.branch, floor: updates.floor, department: updates.department, managingTeam: updates.managingTeam,
              gridX: assignCell.x, gridY: assignCell.y, location: updates.location, custodianName: updates.custodianName,
              ...(updates.monitoringStatus ? { monitoringStatus: updates.monitoringStatus } : {}),
              handoverReason: updates.handoverReason,
            });
            toast.success(`Đã bố trí máy in vào vị trí [${assignCell.x + 1}, ${assignCell.y + 1}] thành công!`);
            onRefresh();
          } catch { toast.error('Lỗi khi gán vị trí máy in.'); }
        }}
      />
    </div>
  );
};

export default GeneralAffairsInventoryHub;
