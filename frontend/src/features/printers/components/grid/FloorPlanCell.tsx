/**
 * Frontend/src/features/printers/components/grid/FloorPlanCell.tsx
 *
 * Ô Lưới Mặt Bằng Bản Vẽ Kỹ Thuật AutoCAD (AutoCAD White Blueprint Cell):
 * - Kích thước cố định 38px x 38px chuẩn bản vẽ pixel không xô lệch layout.
 * - Lớp TƯỜNG CAO NHẤT (zIndex: 40): Nét tường 3px dính liền mạch 100%, không bị hở khe, đè lên viền bàn.
 * - Viền nét đứt của bàn làm việc (zIndex: 2) nằm hoàn toàn bên dưới lớp tường.
 * - Cửa mở chuẩn CAD (zIndex: 41): Gắn sát tường, mở vào phòng, đối lập đối xứng khi đặt cạnh nhau.
 * - Hỗ trợ đặt máy in trên Bàn hoặc trực tiếp trên Mặt sàn trống.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon, faXmark, faPlus } from '@/shared/icons';
import { Printer, FloorObstacle } from '@/types/printer';
import { getTeamStyle } from '../../utils/teamColors';
import { getPrinterSizeMeta } from '../../utils/deviceSize';

export interface FloorPlanCellProps {
  cellKey: string;
  gridX: number;
  gridY: number;
  printer?: Printer;
  obstacle?: FloorObstacle;
  isHighlighted?: boolean;
  isHovered?: boolean;
  isMatched?: boolean;
  isDimmed?: boolean;
  isSelected?: boolean;
  isDesignMode?: boolean;
  activeTeamFilter?: string | null;
  onEditPrinter: (p: Printer) => void;
  onOpenDrawer?: (p: Printer, tab: 'diag' | 'tasks' | 'counters' | 'history') => void;
  onRemovePrinter: (p: Printer) => void;
  onEmptyCellClick: (x: number, y: number) => void;
  onCellMouseDown?: (x: number, y: number, e: React.MouseEvent) => void;
  onCellMouseEnter?: (x: number, y: number) => void;
  neighbors?: {
    top?: FloorObstacle;
    bottom?: FloorObstacle;
    left?: FloorObstacle;
    right?: FloorObstacle;
  };
}

export const FloorPlanCell: React.FC<FloorPlanCellProps> = ({
  gridX, gridY, printer: p, obstacle, isHighlighted, isHovered, isMatched,
  isDimmed, isSelected, isDesignMode, activeTeamFilter, onEditPrinter, onOpenDrawer, onRemovePrinter,
  onEmptyCellClick, onCellMouseDown, onCellMouseEnter, neighbors,
}) => {
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((isHighlighted || isHovered) && cellRef.current) {
      cellRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [isHighlighted, isHovered]);

  const obsType = obstacle?.type;
  const isWall = obsType === 'wall';
  const isDoor = obsType === 'door';
  const isDesk = obsType === 'desk';
  const isWalkway = obsType === 'walkway';
  const isPillar = obsType === 'pillar';

  const wallEdges: ('top' | 'bottom' | 'left' | 'right')[] = obstacle?.wallEdges || (isWall ? ['top', 'bottom'] : []);

  // Xác định hướng cửa gắn tường chuẩn AutoCAD (ngang hoặc dọc)
  const isVerticalDoor = isDoor && (
    neighbors?.top?.wallEdges?.includes('right')
    || neighbors?.bottom?.wallEdges?.includes('right')
    || neighbors?.top?.wallEdges?.includes('left')
    || neighbors?.bottom?.wallEdges?.includes('left')
  );
  const isUpperRoomDoor = neighbors?.bottom?.type === 'walkway' || gridY < 4;
  const hasLeftDoor = isDoor && !isVerticalDoor && neighbors?.left?.type === 'door';
  const hasRightDoor = isDoor && !isVerticalDoor && neighbors?.right?.type === 'door';

  const hasTopDesk = isDesk && neighbors?.top?.type === 'desk' && neighbors?.top?.team === obstacle?.team;
  const hasBottomDesk = isDesk && neighbors?.bottom?.type === 'desk' && neighbors?.bottom?.team === obstacle?.team;
  const hasLeftDesk = isDesk && neighbors?.left?.type === 'desk' && neighbors?.left?.team === obstacle?.team;
  const hasRightDesk = isDesk && neighbors?.right?.type === 'desk' && neighbors?.right?.team === obstacle?.team;

  const deskTeamStyle = isDesk ? getTeamStyle(obstacle?.team) : null;
  const printerTeamStyle = p ? getTeamStyle(p.managingTeam) : null;
  const printerSizeMeta = p ? getPrinterSizeMeta(p.deviceType) : null;
  const isTeamHighlighted = Boolean(
    activeTeamFilter && ((isDesk && obstacle?.team === activeTeamFilter) || (p && p.managingTeam === activeTeamFilter))
  );
  const isTeamDimmed = Boolean(activeTeamFilter && !isTeamHighlighted && (isDesk || p));

  const handleClick = () => {
    if (isDesignMode) { onEmptyCellClick(gridX, gridY); return; }
    if (p) {
      onEditPrinter(p);
    } else {
      onEmptyCellClick(gridX, gridY);
    }
  };

  const isOnline = p?.status === 'Online' || p?.connectionStatus === 'Online';
  const isErr = p?.health === 'Critical' || p?.alertSeverity === 'critical' || p?.status === 'Offline';
  const isWarn = p?.health === 'Warning' || p?.alertSeverity === 'warning';
  const dotColor = isErr ? '#ef4444' : isWarn ? '#f59e0b' : isOnline ? '#10b981' : '#94a3b8';

  return (
    <div
      ref={cellRef}
      onClick={handleClick}
      onMouseDown={(e) => { if (isDesignMode && onCellMouseDown) { e.preventDefault(); onCellMouseDown(gridX, gridY, e); } }}
      onMouseEnter={() => { if (isDesignMode && onCellMouseEnter) onCellMouseEnter(gridX, gridY); }}
      style={{
        width: '38px', height: '38px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box', backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.15)' : isHovered ? 'rgba(37, 99, 235, 0.08)' : '#ffffff',
        cursor: p ? 'pointer' : isDesignMode ? 'pointer' : (!isPillar && !isDoor ? 'pointer' : 'not-allowed'),
        opacity: (isDimmed || isTeamDimmed) ? 0.3 : 1,
        ...(isSelected && { outline: '2px solid #2563eb', outlineOffset: '-1px', zIndex: 20 }),
        ...(isWalkway && { backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.2)' : '#f1f5f9' }),
        ...(isPillar && {
          backgroundColor: '#334155', border: '1.5px solid #0f172a',
          backgroundImage: 'repeating-linear-gradient(45deg, #475569, #475569 2.5px, #1e293b 2.5px, #1e293b 5px)',
          zIndex: 3,
        }),
        ...(!obstacle && !isSelected && { border: '0.5px solid #f1f5f9' }),
      }}
      title={
        p ? `${p.name} (${p.model})\nLoại: ${printerSizeMeta?.label || p.deviceType}\nIP: ${p.ip}${p.managingTeam ? `\nTeam: ${p.managingTeam}` : ''}${p.custodianName ? `\nPhụ trách: ${p.custodianName}` : ''}`
        : isPillar ? `Cột chịu lực [${gridX + 1}, ${gridY + 1}] (Không thể đặt máy in)`
        : isDoor ? `Cửa mở [${gridX + 1}, ${gridY + 1}] (Không thể đặt máy in)`
        : isDesk ? `${obstacle?.label || 'Bàn làm việc'}${obstacle?.team ? ` • ${obstacle.team}` : ''} [${gridX + 1}, ${gridY + 1}] • Click để đặt máy in`
        : obstacle ? (obstacle.label || obsType)
        : `Mặt sàn trống [${gridX + 1}, ${gridY + 1}] • Click để đặt máy in`
      }
    >
      {/* 1. LỚP BÀN LÀM VIỆC (zIndex: 2) - Nằm bên dưới lớp tường */}
      {isDesk && deskTeamStyle && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: isTeamHighlighted ? `${deskTeamStyle.color}26` : deskTeamStyle.bg,
            borderTop: hasTopDesk ? `1px dashed ${deskTeamStyle.border}` : `1.5px solid ${isTeamHighlighted ? deskTeamStyle.color : deskTeamStyle.border}`,
            borderBottom: hasBottomDesk ? `1px dashed ${deskTeamStyle.border}` : `1.5px solid ${isTeamHighlighted ? deskTeamStyle.color : deskTeamStyle.border}`,
            borderLeft: hasLeftDesk ? `1px dashed ${deskTeamStyle.border}` : `1.5px solid ${isTeamHighlighted ? deskTeamStyle.color : deskTeamStyle.border}`,
            borderRight: hasRightDesk ? `1px dashed ${deskTeamStyle.border}` : `1.5px solid ${isTeamHighlighted ? deskTeamStyle.color : deskTeamStyle.border}`,
            boxShadow: isTeamHighlighted ? `inset 0 0 0 1px ${deskTeamStyle.color}55` : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: isTeamHighlighted ? 4 : 2,
            pointerEvents: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ position: 'absolute', bottom: '3px', left: '3px', right: '3px', height: '1.5px', backgroundColor: `${deskTeamStyle.color}30` }} />
          {!p && (
            <span style={{ fontSize: '7px', fontWeight: 800, color: deskTeamStyle.color, letterSpacing: '0.04em', opacity: 0.85 }}>
              BÀN
            </span>
          )}
        </div>
      )}

      {/* 2. LỚP TƯỜNG CAO NHẤT (zIndex: 40) - Đè lên bàn và viền nét đứt, dính liền 100% không gãy khúc */}
      {wallEdges.includes('top') && (
        <div style={{ position: 'absolute', top: 0, left: '-1px', right: '-1px', height: '3px', backgroundColor: '#0f172a', zIndex: 40, pointerEvents: 'none' }} />
      )}
      {wallEdges.includes('bottom') && (
        <div style={{ position: 'absolute', bottom: 0, left: '-1px', right: '-1px', height: '3px', backgroundColor: '#0f172a', zIndex: 40, pointerEvents: 'none' }} />
      )}
      {wallEdges.includes('left') && (
        <div style={{ position: 'absolute', top: '-1px', bottom: '-1px', left: 0, width: '3px', backgroundColor: '#0f172a', zIndex: 40, pointerEvents: 'none' }} />
      )}
      {wallEdges.includes('right') && (
        <div style={{ position: 'absolute', top: '-1px', bottom: '-1px', right: 0, width: '3px', backgroundColor: '#0f172a', zIndex: 40, pointerEvents: 'none' }} />
      )}

      {/* 3. LỚP CỬA (zIndex: 41) - Đi liền với tường, cung xoay nét đứt hướng vào trong phòng chuẩn xác */}
      {isDoor && (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" style={{ position: 'absolute', inset: 0, zIndex: 41, pointerEvents: 'none' }}>
          {isVerticalDoor ? (
            // Cửa trên vách ngăn dọc (mép phải x=38), cánh cửa mở ngang sang trái vào phòng
            <>
              <rect x="35" y="0" width="3" height="4" fill="#0f172a" />
              <rect x="35" y="34" width="3" height="4" fill="#0f172a" />
              <path d="M 38 34 A 34 34 0 0 1 4 0" stroke="#ea580c" strokeWidth="1.3" strokeDasharray="2.5 2" />
              <line x1="38" y1="0" x2="4" y2="0" stroke="#0f172a" strokeWidth="2.2" />
              <circle cx="38" cy="0" r="1.5" fill="#0f172a" />
            </>
          ) : isUpperRoomDoor ? (
            // Cửa phòng trên: Tường nằm ở mép dưới (y=38), cánh cửa mở lên trên vào phòng
            hasRightDoor ? (
              // Cánh trái của cửa đôi
              <>
                <rect x="0" y="35" width="4" height="3" fill="#0f172a" />
                <path d="M 38 38 A 38 38 0 0 0 0 0" stroke="#ea580c" strokeWidth="1.3" strokeDasharray="2.5 2" />
                <line x1="0" y1="38" x2="0" y2="0" stroke="#0f172a" strokeWidth="2.2" />
                <circle cx="0" cy="38" r="1.5" fill="#0f172a" />
              </>
            ) : hasLeftDoor ? (
              // Cánh phải của cửa đôi (đối xứng)
              <>
                <rect x="34" y="35" width="4" height="3" fill="#0f172a" />
                <path d="M 0 38 A 38 38 0 0 1 38 0" stroke="#ea580c" strokeWidth="1.3" strokeDasharray="2.5 2" />
                <line x1="38" y1="38" x2="38" y2="0" stroke="#0f172a" strokeWidth="2.2" />
                <circle cx="38" cy="38" r="1.5" fill="#0f172a" />
              </>
            ) : (
              // Cửa đơn phòng trên
              <>
                <rect x="0" y="35" width="4" height="3" fill="#0f172a" />
                <rect x="34" y="35" width="4" height="3" fill="#0f172a" />
                <path d="M 34 38 A 34 34 0 0 0 0 4" stroke="#ea580c" strokeWidth="1.3" strokeDasharray="2.5 2" />
                <line x1="0" y1="38" x2="0" y2="4" stroke="#0f172a" strokeWidth="2" />
                <circle cx="0" cy="38" r="1.5" fill="#0f172a" />
              </>
            )
          ) : (
            // Cửa phòng dưới: Tường nằm ở mép trên (y=0), cánh cửa mở xuống dưới vào phòng
            hasRightDoor ? (
              // Cánh trái của cửa đôi
              <>
                <rect x="0" y="0" width="4" height="3" fill="#0f172a" />
                <path d="M 38 0 A 38 38 0 0 1 0 38" stroke="#ea580c" strokeWidth="1.3" strokeDasharray="2.5 2" />
                <line x1="0" y1="0" x2="0" y2="38" stroke="#0f172a" strokeWidth="2.2" />
                <circle cx="0" cy="0" r="1.5" fill="#0f172a" />
              </>
            ) : hasLeftDoor ? (
              // Cánh phải của cửa đôi (đối xứng)
              <>
                <rect x="34" y="0" width="4" height="3" fill="#0f172a" />
                <path d="M 0 0 A 38 38 0 0 0 38 38" stroke="#ea580c" strokeWidth="1.3" strokeDasharray="2.5 2" />
                <line x1="38" y1="0" x2="38" y2="38" stroke="#0f172a" strokeWidth="2.2" />
                <circle cx="38" cy="0" r="1.5" fill="#0f172a" />
              </>
            ) : (
              // Cửa đơn phòng dưới
              <>
                <rect x="0" y="0" width="4" height="3" fill="#0f172a" />
                <rect x="34" y="0" width="4" height="3" fill="#0f172a" />
                <path d="M 34 0 A 34 34 0 0 1 0 34" stroke="#ea580c" strokeWidth="1.3" strokeDasharray="2.5 2" />
                <line x1="0" y1="0" x2="0" y2="34" stroke="#0f172a" strokeWidth="2" />
                <circle cx="0" cy="0" r="1.5" fill="#0f172a" />
              </>
            )
          )}
        </svg>
      )}

      {/* 4. MÁY IN (zIndex: 50) */}
      {p && (
        <div
          style={{
            width: '26px', height: '24px', borderRadius: '4px', backgroundColor: '#ffffff',
            border: (isHighlighted || isHovered) ? '2px solid #2563eb' : isMatched ? '2px solid #0284c7' : `1.5px solid ${printerTeamStyle?.color || '#2563eb'}`,
            boxShadow: (isHighlighted || isHovered)
              ? '0 0 0 3px rgba(37, 99, 235, 0.5), 0 0 10px rgba(37, 99, 235, 0.4)'
              : isTeamHighlighted
                ? `0 0 0 3px ${printerTeamStyle?.color || '#2563eb'}44`
                : '0 1px 3px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 50, transition: 'all 0.15s ease',
          }}
        >
          <FontAwesomeIcon icon={printerSizeMeta!.icon} style={{ fontSize: '11px', color: printerTeamStyle?.color || '#1d4ed8' }} />
          <span
            style={{
              position: 'absolute', top: '-2.5px', right: '-2.5px', width: '6.5px', height: '6.5px', borderRadius: '50%',
              backgroundColor: dotColor, border: '1.5px solid #ffffff', boxShadow: `0 0 4px ${dotColor}`,
            }}
            title={isErr ? 'Lỗi NOC' : isWarn ? 'Cảnh báo' : isOnline ? 'Sẵn sàng' : 'Chưa có dữ liệu'}
          />
          {isDesignMode && (
            <button
              type="button" onClick={(e) => { e.stopPropagation(); onRemovePrinter(p); }} title="Gỡ máy in"
              style={{
                position: 'absolute', top: '-5px', left: '-5px', width: '13px', height: '13px', borderRadius: '50%',
                backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', fontSize: '8px', zIndex: 51,
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>
      )}

      {/* 5. Dấu cộng hiển thị chế độ thiết kế */}
      {isDesignMode && !p && !obstacle && (
        <FontAwesomeIcon icon={faPlus} style={{ fontSize: '8px', color: '#94a3b8', opacity: 0.5 }} />
      )}
    </div>
  );
};

export default FloorPlanCell;
