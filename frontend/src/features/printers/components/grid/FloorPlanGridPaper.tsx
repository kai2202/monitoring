/**
 * Frontend/src/features/printers/components/grid/FloorPlanGridPaper.tsx
 *
 * Sơ Đồ Tầng Phong Cách Pixel Tilemap 2D (Connected Modular Grid Blueprint):
 * - Kích thước ô cố định chuẩn 38px, cuộn tự động. Chặn tuyệt đối máy in trên Cột/Cửa.
 * - Multi-layer: Tường đè lên bàn, Xóa Tường giữ Bàn, Xóa Bàn giữ Tường.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Printer, FloorObstacle, FloorObstacleType } from '@/types/printer';
import { printerService } from '@/services';
import { getFloorObstacles, saveFloorObstacles, resetFloorObstacles, getFloorDimensions, saveFloorDimensions } from '../../utils/floorObstacles';
import { getTeamStyle } from '../../utils/teamColors';
import { getPrinterSizeCategory } from '../../utils/deviceSize';
import { FloorPlanToolbar } from './FloorPlanToolbar';
import { FloorPlanCell } from './FloorPlanCell';
import { FloorPlanSelectionBar } from './FloorPlanSelectionBar';
import { FloorPlanDeleteConfirmModal } from './FloorPlanDeleteConfirmModal';

export interface FloorPlanGridPaperProps {
  printers: Printer[]; branches?: string[]; selectedBranch?: string; onBranchChange?: (branch: string) => void;
  floorList?: string[]; selectedFloor?: string; onFloorChange?: (floor: string) => void;
  onEditPrinter: (printer: Printer) => void; onOpenDrawer?: (printer: Printer, tab: 'diag' | 'tasks' | 'counters' | 'history') => void;
  onRemoveFromGrid: (printer: Printer) => void; onAssignCell: (floor: string, gridX: number, gridY: number, deskTeam?: string, isDesk?: boolean) => void;
  searchQuery?: string; placementFilter?: 'all' | 'assigned' | 'unassigned';
  sizeFilter?: 'all' | 'desktop' | 'large';
  highlightPrinterId?: string | null; hoveredPrinterId?: string | null;
  selectedTeamFilter?: string | null; onSelectTeamFilter?: (team: string | null) => void;
  onOpenBranchManager?: () => void; isAssignModalOpen?: boolean; onPrintersChanged?: () => void;
}

type Range = { minX: number; maxX: number; minY: number; maxY: number };

export const FloorPlanGridPaper: React.FC<FloorPlanGridPaperProps> = ({
  printers, branches = [], selectedBranch, onBranchChange, floorList: propFloorList,
  selectedFloor: propFloor, onFloorChange, onEditPrinter, onOpenDrawer, onRemoveFromGrid, onAssignCell, searchQuery = '', placementFilter = 'all', sizeFilter = 'all', highlightPrinterId = null, hoveredPrinterId = null, selectedTeamFilter: propTeamFilter, onSelectTeamFilter, onOpenBranchManager, isAssignModalOpen = false, onPrintersChanged,
}) => {
  const [internalFloor, setInternalFloor] = useState('Tầng trệt');
  const activeFloor = propFloor || internalFloor;
  const [internalTeamFilter, setInternalTeamFilter] = useState<string | null>(null);
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);
  const selectedTeamFilter = propTeamFilter !== undefined ? propTeamFilter : internalTeamFilter;
  const setTeamFilter = onSelectTeamFilter || setInternalTeamFilter;
  const activeTeamHighlight = hoveredTeam || selectedTeamFilter;
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [designSubMode, setDesignSubMode] = useState<'create' | 'delete'>('create');
  const [obstacles, setObstacles] = useState<FloorObstacle[]>([]);

  const initialSnapshotRef = useRef<FloorObstacle[]>([]);
  const initialDimsRef = useRef<{ rows: number; cols: number }>({ rows: 10, cols: 20 });
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [currentDims, setCurrentDims] = useState<{ rows: number; cols: number }>({ rows: 10, cols: 20 });

  useEffect(() => {
    setObstacles(getFloorObstacles(activeFloor, selectedBranch));
    setCurrentDims(getFloorDimensions(activeFloor, selectedBranch));
  }, [activeFloor, selectedBranch]);

  const floorList = useMemo(() => {
    if (propFloorList && propFloorList.length > 0) return propFloorList;
    const set = new Set<string>(['Tầng trệt', 'Tầng 1', 'Tầng 2']);
    printers.forEach((p) => { if (p.floor) set.add(p.floor); });
    return Array.from(set);
  }, [propFloorList, printers]);

  const floorPrinters = useMemo(
    () => printers.filter((p) => p.monitoringStatus !== 'Storage' && p.monitoringStatus !== 'Decommissioned' && (p.floor || 'Tầng trệt') === activeFloor && (!selectedBranch || !p.branch || p.branch === selectedBranch)),
    [printers, activeFloor, selectedBranch]
  );
  const desksCount = useMemo(() => obstacles.filter((o) => o.type === 'desk').length, [obstacles]);
  const floorTeamStats = useMemo(() => {
    const map = new Map<string, { team: string; desks: number; printers: number }>();
    obstacles.forEach((o) => {
      if (o.type === 'desk' && o.team) {
        const cur = map.get(o.team) || { team: o.team, desks: 0, printers: 0 };
        cur.desks += 1;
        map.set(o.team, cur);
      }
    });
    floorPrinters.forEach((p) => {
      if (p.managingTeam) {
        const cur = map.get(p.managingTeam) || { team: p.managingTeam, desks: 0, printers: 0 };
        cur.printers += 1;
        map.set(p.managingTeam, cur);
      }
    });
    return Array.from(map.values());
  }, [obstacles, floorPrinters]);

  // Bảo toàn tính toàn vẹn dữ liệu: Không bao giờ cho phép máy in nằm trên Cột hoặc Cửa
  useEffect(() => {
    const forbidden = new Set(obstacles.filter((o) => o.type === 'pillar' || o.type === 'door').map((o) => `${o.gridX},${o.gridY}`));
    const misplaced = floorPrinters.filter((p) => p.gridX != null && p.gridY != null && forbidden.has(`${p.gridX},${p.gridY}`));
    if (misplaced.length > 0) Promise.all(misplaced.map((p) => printerService.updatePrinter(p.id, { gridX: null, gridY: null }))).then(() => onPrintersChanged?.());
  }, [obstacles, floorPrinters, onPrintersChanged]);

  const confirmLeaveDesign = () => {
    if (!isDesignMode) return true;
    if (!window.confirm('Bạn đang trong chế độ Thiết kế chưa lưu. Hủy các thay đổi hiện tại?')) return false;
    setObstacles(initialSnapshotRef.current); saveFloorObstacles(activeFloor, initialSnapshotRef.current, selectedBranch);
    setCurrentDims(initialDimsRef.current); saveFloorDimensions(activeFloor, initialDimsRef.current, selectedBranch);
    setIsDesignMode(false); setSelectedRange(null); return true;
  };

  const handleFloorSelect = (fl: string) => { if (!confirmLeaveDesign()) return; setInternalFloor(fl); onFloorChange?.(fl); setSelectedRange(null); };
  const handleBranchSelect = (br: string) => { if (!confirmLeaveDesign()) return; onBranchChange?.(br); setSelectedRange(null); };
  const handleAddRow = () => { const next = { rows: currentDims.rows + 1, cols: currentDims.cols }; setCurrentDims(next); saveFloorDimensions(activeFloor, next, selectedBranch); };
  const handleAddCol = () => { const next = { rows: currentDims.rows, cols: currentDims.cols + 1 }; setCurrentDims(next); saveFloorDimensions(activeFloor, next, selectedBranch); };

  const handleDeleteRow = (rowIdx: number) => {
    if (currentDims.rows <= 5) return;
    const affected = floorPrinters.filter((p) => p.gridY === rowIdx);
    if (affected.length > 0) return toast.error(`Hàng ${rowIdx + 1} đang có ${affected.length} máy in (${affected.map((p) => p.name).join(', ')}). Hãy di dời máy in trước.`);
    setHistoryStack((prev) => [...prev.slice(-15), obstacles]);
    const next = obstacles.filter((o) => o.gridY !== rowIdx).map((o) => (o.gridY > rowIdx ? { ...o, gridY: o.gridY - 1 } : o));
    const shifted = floorPrinters.filter((p) => p.gridY != null && p.gridY > rowIdx);
    if (shifted.length > 0) Promise.all(shifted.map((p) => printerService.updatePrinter(p.id, { gridY: p.gridY! - 1 }))).then(() => onPrintersChanged?.());
    const nextDims = { rows: currentDims.rows - 1, cols: currentDims.cols };
    setCurrentDims(nextDims); saveFloorDimensions(activeFloor, nextDims, selectedBranch);
    persistObstacles(next); setSelectedRange(null); toast.success(`Đã xóa Hàng ${rowIdx + 1} và dồn các hàng phía dưới lên.`);
  };

  const handleDeleteCol = (colIdx: number) => {
    if (currentDims.cols <= 5) return;
    const affected = floorPrinters.filter((p) => p.gridX === colIdx);
    if (affected.length > 0) return toast.error(`Cột ${colIdx + 1} đang có ${affected.length} máy in (${affected.map((p) => p.name).join(', ')}). Hãy di dời máy in trước.`);
    setHistoryStack((prev) => [...prev.slice(-15), obstacles]);
    const next = obstacles.filter((o) => o.gridX !== colIdx).map((o) => (o.gridX > colIdx ? { ...o, gridX: o.gridX - 1 } : o));
    const shifted = floorPrinters.filter((p) => p.gridX != null && p.gridX > colIdx);
    if (shifted.length > 0) Promise.all(shifted.map((p) => printerService.updatePrinter(p.id, { gridX: p.gridX! - 1 }))).then(() => onPrintersChanged?.());
    const nextDims = { rows: currentDims.rows, cols: currentDims.cols - 1 };
    setCurrentDims(nextDims); saveFloorDimensions(activeFloor, nextDims, selectedBranch);
    persistObstacles(next); setSelectedRange(null); toast.success(`Đã xóa Cột ${colIdx + 1} và dồn các cột bên phải sang.`);
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [historyStack, setHistoryStack] = useState<FloorObstacle[][]>([]);
  const [deleteConfirmData, setDeleteConfirmData] = useState<{ range: Range; printers: Printer[] } | null>(null);

  const persistObstacles = (next: FloorObstacle[]) => { setObstacles(next); saveFloorObstacles(activeFloor, next, selectedBranch); };
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const prev = historyStack[historyStack.length - 1];
    setHistoryStack((s) => s.slice(0, -1)); persistObstacles(prev); toast.success('Đã hoàn tác.');
  };

  useEffect(() => {
    const handleUp = () => { if (isDragging) setIsDragging(false); };
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && isDesignMode) { e.preventDefault(); handleUndo(); }
      if (e.key === 'Escape') setSelectedRange(null);
    };
    window.addEventListener('mouseup', handleUp); window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('mouseup', handleUp); window.removeEventListener('keydown', handleKey); };
  }, [isDragging, isDesignMode, historyStack]);

  const handleCellMouseDown = (x: number, y: number) => { if (isDesignMode) { setIsDragging(true); setDragStart({ x, y }); setSelectedRange({ minX: x, maxX: x, minY: y, maxY: y }); } };
  const handleCellMouseEnter = (x: number, y: number) => { if (isDragging && dragStart) setSelectedRange({ minX: Math.min(dragStart.x, x), maxX: Math.max(dragStart.x, x), minY: Math.min(dragStart.y, y), maxY: Math.max(dragStart.y, y) }); };
  const handleGridMouseUp = () => { if (isDragging) setIsDragging(false); };
  const handleEnterDesignMode = () => { initialSnapshotRef.current = [...obstacles]; initialDimsRef.current = { ...currentDims }; setIsDesignMode(true); toast.info('Click hoặc kéo chọn ô để cấu hình.'); };
  const handleSaveDesignMode = () => { saveFloorObstacles(activeFloor, obstacles, selectedBranch); saveFloorDimensions(activeFloor, currentDims, selectedBranch); setIsDesignMode(false); setSelectedRange(null); toast.success('Đã lưu sơ đồ tầng!'); };
  const handleCancelDesignMode = () => { persistObstacles(initialSnapshotRef.current); setCurrentDims(initialDimsRef.current); saveFloorDimensions(activeFloor, initialDimsRef.current, selectedBranch); setIsDesignMode(false); setSelectedRange(null); toast.info('Đã hủy thay đổi.'); };
  const handleResetDefault = () => {
    if (!window.confirm('Khôi phục lại sơ đồ mẫu chuẩn AutoCAD cho tầng này?')) return;
    setHistoryStack((prev) => [...prev.slice(-15), obstacles]); setObstacles(resetFloorObstacles(activeFloor, selectedBranch)); setCurrentDims({ rows: 10, cols: 20 }); setSelectedRange(null); toast.success('Đã khôi phục sơ đồ mẫu chuẩn!');
  };

  const handleEmptyCellClick = (x: number, y: number) => {
    if (!isDesignMode) {
      const obs = obstacleMap.get(`${x},${y}`);
      if (obs?.type === 'pillar') return toast.error('Cột chịu lực: Không thể bố trí máy in tại đây!');
      if (obs?.type === 'door') return toast.error('Khu vực cửa: Không thể bố trí máy in chắn lối đi!');
      setSelectedRange(null); onAssignCell(activeFloor, x, y, obs?.team, obs?.type === 'desk');
    } else setSelectedRange({ minX: x, maxX: x, minY: y, maxY: y });
  };

  const applyWalls = (range: Range, edges: ('top' | 'bottom' | 'left' | 'right')[], label: string) => {
    setHistoryStack((prev) => [...prev.slice(-15), obstacles]);
    const result = [...obstacles];
    const isBox = (range.minX !== range.maxX) && (range.minY !== range.maxY) && edges.length === 4;
    for (let y = range.minY; y <= range.maxY; y++) {
      for (let x = range.minX; x <= range.maxX; x++) {
        let cellEdges = edges;
        if (isBox) {
          cellEdges = [];
          if (y === range.minY) cellEdges.push('top');
          if (y === range.maxY) cellEdges.push('bottom');
          if (x === range.minX) cellEdges.push('left');
          if (x === range.maxX) cellEdges.push('right');
          if (cellEdges.length === 0) continue;
        }
        const idx = result.findIndex((o) => o.gridX === x && o.gridY === y);
        if (idx >= 0) result[idx] = { ...result[idx], wallEdges: Array.from(new Set([...(result[idx].wallEdges || []), ...cellEdges])) };
        else result.push({ id: `wall-${x}-${y}-${Date.now()}`, floor: activeFloor, gridX: x, gridY: y, type: 'wall', wallEdges: cellEdges, label });
      }
    }
    persistObstacles(result); setSelectedRange(null);
    toast.success(`Đã dựng ${label}.`, { action: { label: 'Hoàn tác', onClick: handleUndo } });
  };

  const applyFurniture = (range: Range, type: FloorObstacleType, label: string, team?: string) => {
    if (type === 'pillar' || type === 'door') {
      const affected = floorPrinters.filter((p) => p.gridX != null && p.gridY != null && p.gridX >= range.minX && p.gridX <= range.maxX && p.gridY >= range.minY && p.gridY <= range.maxY);
      if (affected.length > 0) return toast.error(`Vị trí chọn có ${affected.length} máy in. Không thể đặt Cột/Cửa đè lên máy in!`);
    }
    setHistoryStack((prev) => [...prev.slice(-15), obstacles]);
    let result = [...obstacles];
    for (let y = range.minY; y <= range.maxY; y++) {
      for (let x = range.minX; x <= range.maxX; x++) {
        const existing = result.find((o) => o.gridX === x && o.gridY === y);
        result = result.filter((o) => !(o.gridX === x && o.gridY === y));
        result.push({ id: `${type}-${x}-${y}-${Date.now()}`, floor: activeFloor, gridX: x, gridY: y, type, wallEdges: existing?.wallEdges, label, ...(team ? { team } : {}) });
      }
    }
    persistObstacles(result); setSelectedRange(null);
    toast.success(`Đã đặt ${label}.`, { action: { label: 'Hoàn tác', onClick: handleUndo } });
  };

  const updateDeskTeam = (range: Range, team: string) => {
    setHistoryStack((prev) => [...prev.slice(-15), obstacles]);
    const shortName = getTeamStyle(team).shortName;
    const result = obstacles.map((o) => {
      if (o.type === 'desk' && o.gridX >= range.minX && o.gridX <= range.maxX && o.gridY >= range.minY && o.gridY <= range.maxY) {
        return { ...o, team, label: `Bàn ${shortName}` };
      }
      return o;
    });
    persistObstacles(result);
    toast.success(`Đã gán dãy bàn cho ${shortName}.`, { action: { label: 'Hoàn tác', onClick: handleUndo } });
  };

  const clearWalls = (range: Range) => {
    setHistoryStack((prev) => [...prev.slice(-15), obstacles]);
    let result = [...obstacles];
    for (let y = range.minY; y <= range.maxY; y++) {
      for (let x = range.minX; x <= range.maxX; x++) {
        const idx = result.findIndex((o) => o.gridX === x && o.gridY === y);
        if (idx >= 0) {
          if (result[idx].type === 'wall') result = result.filter((o) => !(o.gridX === x && o.gridY === y));
          else result[idx] = { ...result[idx], wallEdges: undefined };
        }
      }
    }
    persistObstacles(result); setSelectedRange(null); toast.success('Đã xóa nét tường (giữ nguyên bàn/máy in).', { action: { label: 'Hoàn tác', onClick: handleUndo } });
  };

  const clearDesks = (range: Range) => {
    setHistoryStack((prev) => [...prev.slice(-15), obstacles]);
    let result = [...obstacles];
    for (let y = range.minY; y <= range.maxY; y++) {
      for (let x = range.minX; x <= range.maxX; x++) {
        const idx = result.findIndex((o) => o.gridX === x && o.gridY === y);
        if (idx >= 0 && result[idx].type === 'desk') {
          if (result[idx].wallEdges && result[idx].wallEdges!.length > 0) result[idx] = { ...result[idx], type: 'wall' };
          else result = result.filter((o) => !(o.gridX === x && o.gridY === y));
        }
      }
    }
    persistObstacles(result); setSelectedRange(null); toast.success('Đã xóa bàn (giữ nguyên tường bao).', { action: { label: 'Hoàn tác', onClick: handleUndo } });
  };

  const handleRequestClear = (range: Range) => {
    const affected = floorPrinters.filter((p) => p.gridX != null && p.gridY != null && p.gridX >= range.minX && p.gridX <= range.maxX && p.gridY >= range.minY && p.gridY <= range.maxY);
    if (affected.length > 0) return setDeleteConfirmData({ range, printers: affected });
    setHistoryStack((prev) => [...prev.slice(-15), obstacles]);
    const result = obstacles.filter((o) => !(o.gridX >= range.minX && o.gridX <= range.maxX && o.gridY >= range.minY && o.gridY <= range.maxY));
    persistObstacles(result); setSelectedRange(null); toast.success('Đã xóa toàn bộ ô trong vùng.', { action: { label: 'Hoàn tác', onClick: handleUndo } });
  };

  const handleConfirmDeletePrinters = () => {
    if (!deleteConfirmData) return;
    deleteConfirmData.printers.forEach((p) => onRemoveFromGrid(p));
    setHistoryStack((prev) => [...prev.slice(-15), obstacles]);
    const result = obstacles.filter((o) => !(o.gridX >= deleteConfirmData.range.minX && o.gridX <= deleteConfirmData.range.maxX && o.gridY >= deleteConfirmData.range.minY && o.gridY <= deleteConfirmData.range.maxY));
    persistObstacles(result); setDeleteConfirmData(null); setSelectedRange(null);
  };

  const cellMap = useMemo(() => { const m = new Map<string, Printer>(); floorPrinters.forEach((p) => { if (p.gridX != null && p.gridY != null) m.set(`${p.gridX},${p.gridY}`, p); }); return m; }, [floorPrinters]);
  const obstacleMap = useMemo(() => { const m = new Map<string, FloorObstacle>(); obstacles.forEach((o) => m.set(`${o.gridX},${o.gridY}`, o)); return m; }, [obstacles]);

  const isSingleCellSelected = Boolean(selectedRange && selectedRange.minX === selectedRange.maxX && selectedRange.minY === selectedRange.maxY);
  const hasSelectedDesks = Boolean(
    selectedRange && obstacles.some((o) => o.type === 'desk' && o.gridX >= selectedRange.minX && o.gridX <= selectedRange.maxX && o.gridY >= selectedRange.minY && o.gridY <= selectedRange.maxY)
  );
  const selectedObstacle = isSingleCellSelected ? obstacleMap.get(`${selectedRange!.minX},${selectedRange!.minY}`) : undefined;
  const canAssignPrinter = isSingleCellSelected && !cellMap.get(`${selectedRange!.minX},${selectedRange!.minY}`) && selectedObstacle?.type !== 'pillar' && selectedObstacle?.type !== 'door';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', minWidth: 0 }}>
      <FloorPlanToolbar
        branches={branches} activeBranch={selectedBranch} onBranchSelect={handleBranchSelect}
        floorList={floorList} activeFloor={activeFloor} printers={printers} currentDims={currentDims} isDesignMode={isDesignMode} designSubMode={designSubMode}
        onSubModeChange={setDesignSubMode} canUndo={historyStack.length > 0} onUndo={handleUndo} onFloorSelect={handleFloorSelect}
        onAddRow={handleAddRow} onRemoveRow={() => handleDeleteRow(currentDims.rows - 1)} onAddCol={handleAddCol} onRemoveCol={() => handleDeleteCol(currentDims.cols - 1)}
        onResetDefault={handleResetDefault} desksCount={desksCount} onEnterDesignMode={handleEnterDesignMode} onSaveDesignMode={handleSaveDesignMode} onCancelDesignMode={handleCancelDesignMode} onOpenBranchManager={onOpenBranchManager}
      />

      {/* Dải khung tên màu Team theo tầng (Click hoặc rê chuột để highlight dãy bàn & máy in) */}
      {floorTeamItems(floorTeamStats, selectedTeamFilter, setTeamFilter, setHoveredTeam)}

      <div onMouseUp={handleGridMouseUp} style={{ position: 'relative', padding: '24px 20px', borderRadius: '16px', border: isDesignMode ? '2px dashed #3b82f6' : '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)', backgroundSize: '19px 19px', height: '620px', maxHeight: '620px', overflow: 'auto', maxWidth: '100%', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.03)', userSelect: isDesignMode ? 'none' : 'auto' }}>
        <div ref={gridContainerRef} style={{ position: 'relative', width: `${currentDims.cols * 38}px`, margin: '0 auto' }}>
          {isDesignMode && selectedRange && !deleteConfirmData && !isAssignModalOpen && (
            <FloorPlanSelectionBar
              range={selectedRange} gridRef={gridContainerRef} mode={designSubMode} canAssignPrinter={canAssignPrinter}
              hasSelectedDesks={hasSelectedDesks} onUpdateDeskTeam={(team) => updateDeskTeam(selectedRange, team)}
              onApplyWall={(edges, label) => applyWalls(selectedRange, edges, label)} onApplyFurniture={(type, label, team) => applyFurniture(selectedRange, type, label, team)}
              onDeleteRow={handleDeleteRow} onDeleteCol={handleDeleteCol} onClearWalls={() => clearWalls(selectedRange)} onClearDesks={() => clearDesks(selectedRange)} onClearAll={() => handleRequestClear(selectedRange)}
              onAssignPrinter={(x, y) => {
                const obs = obstacleMap.get(`${x},${y}`);
                if (obs?.type === 'pillar') return toast.error('Cột chịu lực: Không thể bố trí máy in tại đây!');
                if (obs?.type === 'door') return toast.error('Khu vực cửa: Không thể bố trí máy in chắn lối đi!');
                setSelectedRange(null); onAssignCell(activeFloor, x, y, obs?.team, obs?.type === 'desk');
              }}
              onClose={() => setSelectedRange(null)}
            />
          )}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${currentDims.cols}, 38px)`, gap: 0, width: `${currentDims.cols * 38}px`, border: '1.5px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {Array.from({ length: currentDims.rows }).map((_, rIdx) => Array.from({ length: currentDims.cols }).map((_, cIdx) => {
              const cellKey = `${cIdx},${rIdx}`;
              const printer = cellMap.get(cellKey);
              const isMatched = Boolean(searchQuery.trim() && printer && (printer.name.toLowerCase().includes(searchQuery.toLowerCase()) || printer.ip.includes(searchQuery) || printer.custodianName?.toLowerCase().includes(searchQuery.toLowerCase())));
              return (
                <FloorPlanCell
                  key={cellKey} cellKey={cellKey} gridX={cIdx} gridY={rIdx} printer={printer} obstacle={obstacleMap.get(cellKey)}
                  neighbors={{ top: obstacleMap.get(`${cIdx},${rIdx - 1}`), bottom: obstacleMap.get(`${cIdx},${rIdx + 1}`), left: obstacleMap.get(`${cIdx - 1},${rIdx}`), right: obstacleMap.get(`${cIdx + 1},${rIdx}`) }}
                  isHighlighted={highlightPrinterId ? printer?.id === highlightPrinterId : false} isHovered={Boolean(hoveredPrinterId && printer?.id === hoveredPrinterId)} isMatched={isMatched}
                  isDimmed={Boolean(printer && ((searchQuery.trim() && !isMatched) || placementFilter === 'unassigned' || (sizeFilter !== 'all' && getPrinterSizeCategory(printer.deviceType) !== sizeFilter)))}
                  isSelected={Boolean(selectedRange && cIdx >= selectedRange.minX && cIdx <= selectedRange.maxX && rIdx >= selectedRange.minY && rIdx <= selectedRange.maxY)} isDesignMode={isDesignMode}
                  activeTeamFilter={activeTeamHighlight}
                  onEditPrinter={onEditPrinter} onOpenDrawer={onOpenDrawer} onRemovePrinter={onRemoveFromGrid}
                  onEmptyCellClick={handleEmptyCellClick} onCellMouseDown={handleCellMouseDown} onCellMouseEnter={handleCellMouseEnter}
                />
              );
            }))}
          </div>
        </div>
      </div>
      <FloorPlanDeleteConfirmModal isOpen={Boolean(deleteConfirmData)} printers={deleteConfirmData?.printers || []} range={deleteConfirmData?.range || null} onConfirm={handleConfirmDeletePrinters} onClose={() => setDeleteConfirmData(null)} />
    </div>
  );
};

function floorTeamItems(
  stats: { team: string; desks: number; printers: number }[],
  selectedTeam: string | null,
  onSelectTeam: (t: string | null) => void,
  onHoverTeam: (t: string | null) => void
) {
  if (stats.length === 0) return null;
  return (
    <div className="flex items-center flex-wrap gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mr-1">Khu vực Team:</span>
      {stats.map((item) => {
        const st = getTeamStyle(item.team);
        const isActive = selectedTeam === item.team;
        return (
          <button
            key={item.team}
            type="button"
            onClick={() => onSelectTeam(isActive ? null : item.team)}
            onMouseEnter={() => onHoverTeam(item.team)}
            onMouseLeave={() => onHoverTeam(null)}
            title={`${item.team} (${item.desks} bàn, ${item.printers} máy in) — Bấm để lọc & làm nổi bật`}
            style={{
              borderColor: isActive ? st.color : st.border,
              backgroundColor: isActive ? st.color : st.bg,
              color: isActive ? '#ffffff' : st.color,
            }}
            className="px-2.5 py-1 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isActive ? '#ffffff' : st.color, flexShrink: 0 }} />
            <span>{st.shortName}</span>
            <span style={{ opacity: 0.8, fontSize: '10px', fontWeight: 600 }}>
              ({item.desks} bàn{item.printers > 0 ? ` • ${item.printers} máy` : ''})
            </span>
          </button>
        );
      })}
      {selectedTeam && (
        <button
          type="button"
          onClick={() => onSelectTeam(null)}
          className="ml-auto text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md border-none cursor-pointer"
        >
          Hiện tất cả
        </button>
      )}
    </div>
  );
}

export default FloorPlanGridPaper;
