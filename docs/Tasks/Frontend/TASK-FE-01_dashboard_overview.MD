# TASK-FE-01: Dashboard Tổng Quan & Thước Đo Vận Hành NOC

> **Phân hệ:** Frontend / Dashboard NOC  
> **Mã nhiệm vụ:** TASK-FE-01  
> **Phiên bản:** 2.6.0  
> **Trạng thái:** ✅ Đã hoàn thành (100% Bento Minimalist, Pure React SVG, Rule 5 Data Integrity)  
> **Tài liệu liên quan:** [Kiến Trúc](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md), [Tổng Quan](file:///f:/Code/Github/Monitoring/docs/Design/00_overview.MD), [API Contract](file:///f:/Code/Github/Monitoring/docs/Build/API_CONTRACT.MD)

---

## 1. Mục Tiêu & Phạm Vi Nghiệp Vụ

Xây dựng trung tâm điều hành giám sát vận hành NOC (Network Operations Center) dành cho quản trị viên IT và kỹ sư vận hành với giao diện Bento Grid hiện đại:
- **4 Thẻ KPI Bento Động:** Hiển thị số lượng máy in trực tuyến (`${onlineCount}/${totalPrinters}`), ngoại tuyến, cảnh báo khẩn cấp (Hardware Error), và cảnh báo vật tư.
- **Biểu Đồ Khả Dụng 24h (Pure React SVG):** Vẽ đường cong mượt mà stroke 2.25px thể hiện tỷ lệ sẵn sàng hạm đội theo từng giờ, sắc nét Retina/HiDPI, không dùng ECharts/WebGL.
- **Biểu Đồ Tròn Trạng Thái 3 Dải Màu (RefinedFleetDonut):** Phân bổ Trực tuyến (Xanh lá), Ngoại tuyến (Đỏ/Xám), Cần chú ý (Vàng cam).
- **Bảng Thiết Bị Cần Xử Lý (AttentionDevicesTable):** Phân trang 5 dòng/trang, tách bạch rõ ràng giữa Mất mạng (Offline ICMP) và Lỗi phần cứng (Hardware Error), tích hợp nút [Chẩn đoán] mở Slide-over Drawer và nút [+ Lập lệnh].

---

## 2. Ranh Giới Kỹ Thuật & Cấu Trúc File

```text
frontend/src/
├── pages/
│   └── DashboardPage.tsx                  # Controller trang Dashboard (< 270 LOC)
├── components/dashboard/
│   ├── FleetKpiCards.tsx                  # 4 Thẻ KPI Bento tương tác in-place filter
│   ├── AvailabilitySplineChart.tsx        # Pure React SVG Spline 24h
│   ├── RefinedFleetDonut.tsx              # Donut trạng thái hạm đội
│   ├── AttentionDevicesTable.tsx          # Bảng thiết bị cần chú ý phân trang 5 dòng
│   └── index.ts                           # Public API Gate
└── services/
    ├── dashboardService.ts                # Service tổng hợp KPI
    └── telemetryService.ts                # Service chuỗi thời gian 24h
```

---

## 3. Tiêu Chí Nghiệm Thu Đã Đạt Chuẩn

- [x] **Data Integrity (Rule 5):** `MetricValue = number | null`. Khi chưa có dữ liệu hoặc Zabbix mất kết nối, hiển thị dấu `—` hoặc `Chưa có dữ liệu`, tuyệt đối không thay bằng số 0.
- [x] **Zero WebGL Overhead:** 100% Pure React SVG Retina-ready, phản hồi tương tác mượt mà dưới 16ms (60fps).
- [x] **Slide-over Drawer:** Mở ngăn chẩn đoán chi tiết thiết bị 960px hỗ trợ phím tắt Esc và j/k.
- [x] **File Length:** Mọi file tuân thủ nghiêm ngặt `< 300 LOC`.
- [x] **Hệ thống Icon:** 100% FontAwesome (`@/shared/icons`), không sử dụng thư viện icon ngoài.

