/**
 * Frontend/src/features/analytics/components/sla/SLAIncidentHeatmapMatrix.tsx
 *
 * Ma Trận Nhiệt Điểm Nóng Sự Cố & Vận Hành (Incident Hotspot Matrix Heatmap):
 * - Ma trận nhiệt Khu vực x Tuần trực quan hóa mật độ sự cố hạm đội.
 * - Tương tác 2 chiều: Hover/click bất kỳ ô ma trận nào -> Bảng inspector cập nhật chi tiết tức thì.
 * - Clean Slate Architecture: Hiển thị Empty State khi chưa có dữ liệu tầng/sự cố.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import { setSelectedBranch } from '../../../../app/slices/uiSlice';
import { FontAwesomeIcon, faFire } from '../../../../shared/icons';
import { locationService } from '../../../../services';
import { SLACostAnalyticsResponse } from '../../../../types/api';
import {
  DEFAULT_HEATMAP_WEEKS,
  getDynamicHeatmapFloors,
  getHeatmapCellVisual,
  generateCellIncidentsFallback,
  MatrixCellData,
} from './slaHeatmapData';
import { SLAIncidentInspectorCard } from './SLAIncidentInspectorCard';

export interface SLAIncidentHeatmapMatrixProps {
  heatmapData?: SLACostAnalyticsResponse['incidentHeatmap'];
}

export const SLAIncidentHeatmapMatrix: React.FC<SLAIncidentHeatmapMatrixProps> = ({
  heatmapData,
}) => {
  const dispatch = useDispatch();
  const globalBranch = useSelector((state: RootState) => state.ui.selectedBranch);
  const activeBranch = globalBranch || 'Trụ sở chính (HQ)';

  const [selectedCell, setSelectedCell] = useState<{ floorIdx: number; weekIdx: number }>({
    floorIdx: 0,
    weekIdx: 0,
  });
  const [hoveredCell, setHoveredCell] = useState<{ floorIdx: number; weekIdx: number } | null>(null);

  const branches = useMemo(() => locationService.getBranchNames().slice(0, 3), []);
  const currentFloors = useMemo(() => {
    if (heatmapData?.floors && heatmapData.floors.length > 0) {
      return heatmapData.floors;
    }
    return getDynamicHeatmapFloors(activeBranch);
  }, [heatmapData, activeBranch]);

  const weeksList = useMemo(() => heatmapData?.weeks || DEFAULT_HEATMAP_WEEKS, [heatmapData]);
  const matrixCounts = useMemo(() => heatmapData?.matrix || [], [heatmapData]);

  const rawActive = hoveredCell || selectedCell;
  const safeFloorIdx = Math.min(rawActive.floorIdx, Math.max(0, currentFloors.length - 1));
  const safeWeekIdx = Math.min(rawActive.weekIdx, Math.max(0, weeksList.length - 1));

  const currentDetail = useMemo<MatrixCellData>(() => {
    const floor = currentFloors[safeFloorIdx] || { id: 'f1', name: 'Tầng 1', shortName: 'T1', room: 'Khu vực làm việc' };
    const weekLabel = weeksList[safeWeekIdx] || 'Tuần 1';
    const count = matrixCounts[safeFloorIdx]?.[safeWeekIdx] ?? 0;
    const key = `${floor.id}_${safeWeekIdx}`;
    let incidents = heatmapData?.details?.[key] || [];

    if (count > 0 && incidents.length === 0) {
      incidents = generateCellIncidentsFallback(floor, count);
    }

    const mtbf = count === 0 ? 540 : Math.max(45, 540 - count * 45);
    const jamRate = count === 0 ? 0.4 : Number((0.8 + count * 0.4).toFixed(1));

    return {
      floorId: floor.id,
      floorLabel: `${floor.name} (${floor.room})`,
      weekLabel,
      incidentCount: count,
      mtbfHours: mtbf,
      jamRatePercent: jamRate,
      incidents,
    };
  }, [safeFloorIdx, safeWeekIdx, currentFloors, weeksList, matrixCounts, heatmapData]);

  const tierCounts = useMemo(() => {
    let safe = 0;
    let warning = 0;
    let hotspot = 0;
    currentFloors.forEach((_, fIdx) => {
      weeksList.forEach((_, wIdx) => {
        const c = matrixCounts[fIdx]?.[wIdx] ?? 0;
        if (c >= 2) hotspot++;
        else if (c === 1) warning++;
        else safe++;
      });
    });
    return { safe, warning, hotspot };
  }, [currentFloors, weeksList, matrixCounts]);

  const weekTotals = useMemo(() => {
    return weeksList.map((_, wIdx) =>
      currentFloors.reduce((sum, _, fIdx) => sum + (matrixCounts[fIdx]?.[wIdx] || 0), 0)
    );
  }, [currentFloors, weeksList, matrixCounts]);

  return (
    <div
      style={{
        padding: '22px 24px',
        borderRadius: '24px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header Khối */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e11d48', boxShadow: '0 0 8px rgba(225, 29, 72, 0.5)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
            Điểm nóng sự cố
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {branches.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px', borderRadius: '9999px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)' }}>
              {branches.map((br) => (
                <button
                  key={br}
                  type="button"
                  onClick={() => dispatch(setSelectedBranch(br))}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: activeBranch === br ? '#2563eb' : 'transparent',
                    color: activeBranch === br ? '#ffffff' : 'var(--text-muted, #64748b)',
                    fontSize: '11px',
                    fontWeight: activeBranch === br ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {br.replace('Chi nhánh ', '').replace(' (HQ)', '')}
                </button>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>Chưa có chi nhánh</span>
          )}

          {currentFloors.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
              <span>An toàn ({tierCounts.safe})</span>
              <span style={{ color: '#b45309' }}>Chú ý ({tierCounts.warning})</span>
              <span style={{ color: '#e11d48', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <FontAwesomeIcon icon={faFire} /> Điểm nóng ({tierCounts.hotspot})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Lưới Ma Trận Nhiệt hoặc Trạng Thái Rỗng (Clean Slate) */}
      {currentFloors.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-muted, #64748b)',
            fontSize: '13px',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
            borderRadius: '16px',
            border: '1px dashed var(--border-color, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            Chưa có dữ liệu ma trận sự cố
          </span>
          <span style={{ fontSize: '12px' }}>
            Vui lòng thêm thiết bị vào hệ thống hoặc cấu hình sơ đồ tầng chi nhánh để kích hoạt ma trận nhiệt.
          </span>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '6px', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '70px', padding: '4px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                    Khu vực
                  </th>
                  {weeksList.map((w, wIdx) => (
                    <th key={w} style={{ padding: '4px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                      {w.replace('Tuần ', 'W')}
                      <div style={{ fontSize: '9.5px', fontWeight: 500, color: 'var(--text-muted, #94a3b8)', marginTop: '1px' }}>
                        {weekTotals[wIdx]} vụ
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentFloors.map((floor, fIdx) => (
                  <tr key={floor.id}>
                    <td style={{ padding: '6px 4px', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap' }} title={`${floor.name} - ${floor.room}`}>
                      {floor.shortName}
                    </td>
                    {weeksList.map((_, wIdx) => {
                      const count = matrixCounts[fIdx]?.[wIdx] ?? 0;
                      const isSelected = selectedCell.floorIdx === fIdx && selectedCell.weekIdx === wIdx;
                      const visual = getHeatmapCellVisual(count, isSelected);

                      return (
                        <td key={wIdx} style={{ padding: 0 }}>
                          <button
                            type="button"
                            onClick={() => setSelectedCell({ floorIdx: fIdx, weekIdx: wIdx })}
                            onMouseEnter={() => setHoveredCell({ floorIdx: fIdx, weekIdx: wIdx })}
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{
                              width: '100%',
                              height: '36px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: count > 0 ? 800 : 500,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              ...visual,
                            }}
                          >
                            {count > 0 ? count : '—'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. Thẻ Inspector Xem Chi Tiết Ô Đang Chọn */}
          <SLAIncidentInspectorCard detail={currentDetail} />
        </>
      )}
    </div>
  );
};

export default SLAIncidentHeatmapMatrix;
