import React from 'react';
import { FontAwesomeIcon, faShieldCheck } from '../../../shared/icons';

export const OperationalRulesCard: React.FC = () => {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--status-online-bg)',
              border: '1px solid var(--status-online-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-online)',
              boxShadow: 'var(--status-online-glow)',
            }}
          >
            <FontAwesomeIcon icon={faShieldCheck} style={{ fontSize: '18px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Quy Tắc Vận Hành &amp; Tự Động Đóng Sự Cố (Auto-Closure Rules)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Cơ chế lọc nhiễu tín hiệu Zabbix Trigger, tránh hiện tượng đóng mở sự cố chập chờn (flapping alerts)
            </p>
          </div>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: 'var(--status-online-bg)',
            color: 'var(--status-online)',
            border: '1px solid var(--status-online-border)',
            boxShadow: 'var(--status-online-glow)',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-online)' }} />
          Chế độ Bảo vệ Kỹ thuật Đang Hoạt động
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
              THỜI GIAN XÁC MINH (SAFE WINDOW)
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--status-info)',
                backgroundColor: 'var(--status-info-bg)',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid var(--status-info-border)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              10 Phút
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Yêu cầu thiết bị duy trì trạng thái SNMP bình thường liên tục qua nhiều chu kỳ scrape trước khi trigger tự động đóng sự cố.
          </p>
        </div>

        <div
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
              BẢO VỆ SỰ CỐ NGUY CẤP (CRITICAL)
            </span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: 'var(--status-online)',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'var(--status-online-bg)',
                border: '1px solid var(--status-online-border)',
              }}
            >
              BẮT BUỘC NGHIỆM THU
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Không bao giờ tự động đóng sự cố phần cứng cấp Critical. Bắt buộc người vận hành xác nhận và lập biên bản kiểm tra thực tế.
          </p>
        </div>

        <div
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
              IN-MEMORY CACHE (TTL)
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              60 Giây
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Cache dữ liệu scrape tạm thời trong RAM backend, giảm 90% tải truy vấn dồn dập vào Zabbix API.
          </p>
        </div>
      </div>
    </div>
  );
};
