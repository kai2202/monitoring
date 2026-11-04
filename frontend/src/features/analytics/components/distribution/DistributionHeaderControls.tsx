import React from 'react';
import { FontAwesomeIcon, faBolt, faSliders } from '../../../../shared/icons';
import { FleetScaleMode, FloorTabId } from '../../../../types/analyticsUI';

interface DistributionHeaderControlsProps {
  fleetScale: FleetScaleMode;
  onFleetScaleChange: (mode: FleetScaleMode) => void;
  activeFloorTab: FloorTabId;
  onSelectFloorTab: (tabId: FloorTabId) => void;
  bucketsCount: number;
  hasCustomThresholds: boolean;
  onOpenSettings: () => void;
}

export const DistributionHeaderControls: React.FC<DistributionHeaderControlsProps> = ({
  fleetScale,
  onFleetScaleChange,
  activeFloorTab,
  onSelectFloorTab,
  bucketsCount,
  hasCustomThresholds,
  onOpenSettings,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              boxShadow: '0 0 8px rgba(37, 99, 235, 0.5)',
            }}
          />
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Phân Bố Sản Lượng In &amp; Đóng Góp Hạm Đội
          </h2>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Trực quan hóa dạng cột con nhộng (Capsule Stats) • Tự do tùy biến số cột và dải sản lượng
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        {/* Scale: 1000 vs 30 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-subtle)',
            padding: '3px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => onFleetScaleChange('1000')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: '11.5px',
              fontWeight: fleetScale === '1000' ? 800 : 500,
              backgroundColor: fleetScale === '1000' ? '#2563eb' : 'transparent',
              color: fleetScale === '1000' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Kích hoạt mô phỏng hạm đội 1.000 máy in"
          >
            <FontAwesomeIcon icon={faBolt} style={{ fontSize: '11px' }} />
            <span>1.000 Máy In</span>
          </button>

          <button
            type="button"
            onClick={() => onFleetScaleChange('30')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: '11.5px',
              fontWeight: fleetScale === '30' ? 800 : 500,
              backgroundColor: fleetScale === '30' ? '#2563eb' : 'transparent',
              color: fleetScale === '30' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Chuyển về 30 máy in mẫu tiêu chuẩn"
          >
            <span>30 Máy Mẫu</span>
          </button>
        </div>

        {/* Floor Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-subtle)',
            padding: '3px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)',
          }}
        >
          {[
            { id: 'all' as FloorTabId, label: 'Tất cả các tầng' },
            { id: 'floor-1' as FloorTabId, label: 'Tầng 1' },
            { id: 'floor-2' as FloorTabId, label: 'Tầng 2' },
            { id: 'floor-3' as FloorTabId, label: 'Tầng 3' },
            { id: 'floor-4' as FloorTabId, label: 'Tầng 4' },
            { id: 'floor-5' as FloorTabId, label: 'Tầng 5' },
          ].map((tab) => {
            const isActive = activeFloorTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectFloorTab(tab.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '11.5px',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                  color: isActive ? '#2563eb' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Cài đặt dải */}
        <button
          type="button"
          onClick={onOpenSettings}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: hasCustomThresholds ? '#eff6ff' : 'var(--bg-subtle)',
            color: hasCustomThresholds ? '#2563eb' : 'var(--text-primary)',
            border: hasCustomThresholds ? '1px solid #bfdbfe' : '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Tùy chỉnh số lượng cột và khoảng bước nhảy mỗi dải"
        >
          <FontAwesomeIcon icon={faSliders} style={{ fontSize: '12px' }} />
          <span>Cài đặt dải ({bucketsCount} cột)</span>
          {hasCustomThresholds && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
              }}
            />
          )}
        </button>
      </div>
    </div>
  );
};

