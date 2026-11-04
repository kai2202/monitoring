import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon, faMagnifyingGlass, faMicrochip } from '../../../shared/icons';
import { MockErrorCode } from '../../../mocks/mockSettings';

interface ErrorDictionaryCardProps {
  errorDict: MockErrorCode[];
  isLoading: boolean;
}

export const ErrorDictionaryCard: React.FC<ErrorDictionaryCardProps> = ({ errorDict, isLoading }) => {
  const [errorSearch, setErrorSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');

  const filteredErrors = useMemo(() => {
    const q = errorSearch.toLowerCase().trim();
    return errorDict.filter((item) => {
      const matchSearch =
        !q ||
        item.code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.subsystem.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (vendorFilter !== 'all' && item.vendor !== vendorFilter) return false;
      return true;
    });
  }, [errorDict, errorSearch, vendorFilter]);

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--status-info-bg)',
              border: '1px solid var(--status-info-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-info)',
            }}
          >
            <FontAwesomeIcon icon={faMicrochip} style={{ fontSize: '16px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Từ Điển Mã Lỗi Phần Cứng Đa Thương Hiệu
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Bảng tra cứu chuẩn hóa mã SC (Ricoh), mã E (Canon), mã 50-70 (HP) phục vụ chẩn đoán
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '12px' }} />
            <input
              type="text"
              placeholder="Tìm theo mã lỗi, khối linh kiện..."
              value={errorSearch}
              onChange={(e) => setErrorSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 34px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả hãng sản xuất</option>
            <option value="Ricoh">Ricoh</option>
            <option value="Canon">Canon</option>
            <option value="HP">HP</option>
            <option value="Konica Minolta">Konica Minolta</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 16px' }}>Hãng</th>
              <th style={{ padding: '10px 16px' }}>Mã Lỗi</th>
              <th style={{ padding: '10px 16px' }}>Khối Linh Kiện</th>
              <th style={{ padding: '10px 16px' }}>Mức Độ</th>
              <th style={{ padding: '10px 16px' }}>Mô Tả Chi Tiết</th>
            </tr>
          </thead>
          <tbody>
            {filteredErrors.slice(0, 8).map((err) => (
              <tr key={err.code} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px 16px', fontWeight: 600 }}>{err.vendor}</td>
                <td style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#2563eb' }}>
                  {err.code}
                </td>
                <td style={{ padding: '10px 16px' }}>{err.subsystem}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '10.5px', fontWeight: 700, backgroundColor: err.severity === 'Critical' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)', color: err.severity === 'Critical' ? '#ef4444' : '#f59e0b' }}>
                    {err.severity}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{err.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
