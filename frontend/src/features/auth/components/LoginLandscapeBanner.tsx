/**
 * Frontend/src/features/auth/components/LoginLandscapeBanner.tsx
 *
 * Khối Banner Phong Cảnh Hồ Núi & Đường Cong Lượn Sóng Hữu Cơ (Organic S-Curve Wave):
 * - Tái hiện chuẩn xác thiết kế ảnh mẫu (Sample Design UI).
 * - Sử dụng đường cắt SVG mềm mại ngăn cách giữa form trắng và ảnh thiên nhiên.
 * - Đường nét đứt (dashed guideline) uốn lượn song song tạo chiều sâu thị giác.
 * - Monogram tối giản góc dưới phải.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';

// Ảnh phong cảnh hồ nước trong vắt phản chiếu núi tuyết và rừng thông (Lake Moraine style)
const ALPINE_LAKE_IMAGE =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';

export const LoginLandscapeBanner: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '580px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      {/* 1. Lớp Ảnh Phong Cảnh Thiên Nhiên Cắt Theo Đường Cong Hữu Cơ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          // Clip-path dạng đường cong S-Curve hữu cơ chuẩn hóa theo tỷ lệ (0,0) -> (1,1)
          clipPath:
            'polygon(35% 0%, 26% 8%, 23% 18%, 26% 28%, 34% 38%, 42% 48%, 43% 58%, 38% 68%, 28% 78%, 22% 88%, 18% 100%, 100% 100%, 100% 0%)',
          WebkitClipPath:
            'polygon(35% 0%, 26% 8%, 23% 18%, 26% 28%, 34% 38%, 42% 48%, 43% 58%, 38% 68%, 28% 78%, 22% 88%, 18% 100%, 100% 100%, 100% 0%)',
          overflow: 'hidden',
        }}
      >
        <img
          src={ALPINE_LAKE_IMAGE}
          alt="FleetMonitor Serene Landscape"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            display: 'block',
          }}
        />

        {/* Lớp phủ sáng nhẹ tạo độ hòa quyện với phong cách Minimalist */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(14, 165, 233, 0.05) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* 2. SVG Vector Curve & Đường Nét Đứt Uốn Lượn Song Song (Dashed Contour) */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {/* Đường cong viền trắng mượt mà ôm sát mép ảnh */}
        <path
          d="M 35 0 C 24 10, 21 22, 28 32 C 37 44, 46 52, 41 64 C 35 76, 21 86, 18 100"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />

        {/* Đường nét đứt tinh tế chạy song song cách mép cong ~8-12% */}
        <path
          d="M 26 0 C 14 12, 10 24, 18 34 C 27 46, 36 54, 30 66 C 24 78, 11 88, 7 100"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="0.5"
          strokeDasharray="1.2, 1.4"
          opacity="0.85"
        />
      </svg>

      {/* 3. Monogram Badge Minimalist Tại Góc Dưới Phải (Tương tự ảnh mẫu) */}
      <div
        style={{
          position: 'absolute',
          bottom: '36px',
          right: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: 0.92,
          zIndex: 3,
        }}
      >
        {/* Dấu chấm tròn trái */}
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          }}
        />
        {/* Ký tự Monogram FM cách điệu */}
        <span
          style={{
            fontSize: '26px',
            fontWeight: 900,
            color: '#ffffff',
            fontFamily: "'JetBrains Mono', 'Segoe UI', sans-serif",
            letterSpacing: '-2px',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          .AW
        </span>
        {/* Dấu chấm tròn phải */}
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          }}
        />
      </div>
    </div>
  );
};

export default LoginLandscapeBanner;

