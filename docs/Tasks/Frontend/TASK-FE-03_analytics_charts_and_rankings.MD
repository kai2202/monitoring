# TASK-FE-03: Biểu Đồ Sản Lượng, Dự Báo Vật Tư & SLA Chi Phí

> **Phân hệ:** Frontend / Analytics & Reporting  
> **Mã nhiệm vụ:** TASK-FE-03  
> **Phiên bản:** 2.6.0  
> **Trạng thái:** ✅ Đã hoàn thành (100% Pure React SVG, Single Source of Truth, D-Day & Hộp mực thải)  
> **Tài liệu liên quan:** [Kiến Trúc](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md), [Tổng Quan](file:///f:/Code/Github/Monitoring/docs/Design/00_overview.MD), [API Contract](file:///f:/Code/Github/Monitoring/docs/Build/API_CONTRACT.MD)

---

## 1. Mục Tiêu & Phạm Vi Nghiệp Vụ

Xây dựng trung tâm phân tích dữ liệu sản lượng, quản trị định mức vật tư tiêu hao và đối soát chi phí vận hành SLA hạm đội máy in:
- **Header Card Tập Trung (AnalyticsPageHeader):** Bộ chọn Chi nhánh & Khoảng thời gian tập trung (`30days`, `7days`, `hourly`), Segmented Sub-tab Switcher góc phải trên cùng (`/analytics/overview`, `/analytics/supplies`, `/analytics/sla-cost`).
- **Sub-tab Sản Lượng In (`/analytics/overview`):**
  - Biểu đồ xu hướng Soft Spline 2.25px kèm viên nang đỉnh tải và so sánh kỳ trước.
  - Biểu đồ Cột Ngang tỷ trọng Mono/Color mở rộng 100% toàn màn hình kèm nút toggle sàn đối chiếu [Đối chiếu thiết bị].
  - Khung Ghim Đối Chiếu (Pinned Comparison Sandbox) Collapsible Split-View trên cùng thang đo tự mở khi có máy ghim 📌 và tự thu gọn khi hết máy ghim.
  - Slide-over so sánh đối đầu 1:1 (`DeviceComparisonModal`).
- **Sub-tab Vật Tư Tiêu Hao (`/analytics/supplies`):**
  - Thống kê Khẩn cấp, Lưu ý và Cạn kiệt sớm nhất.
  - Huy hiệu đếm ngược D-Day `[D-4]`, `[D-7]`, `[D-25]` theo tốc độ tiêu hao trượt 7 ngày.
  - Phân biệt máy đơn sắc (1 chấm ⚫) vs máy in màu (4 vạch CMYK).
  - Pill theo dõi Hộp mực thải (Bình thường, Sắp đầy ⚠️, Đầy 🛑).
  - Nút lập lệnh cấp phát vật tư 1-click.
- **Sub-tab SLA & Chi Phí (`/analytics/sla-cost`):**
  - 4 thẻ KPI Bento tổng quan chi phí, trang in trung bình, tỷ lệ hoàn thành SLA.
  - Vòng cung bán nguyệt 180° phân bổ chi phí phòng ban kèm micro-cards.
  - Ma trận nhiệt Điểm nóng sự cố (Dynamic Heatmap theo Chi nhánh/Tầng $\times$ 7 tuần).
  - Nút xuất báo cáo chi phí CSV UTF-8 BOM (`exportCostAllocationToCsv`).

---

## 2. Ranh Giới Kỹ Thuật & Cấu Trúc File

```text
frontend/src/
├── pages/
│   └── AnalyticsPage.tsx                  # Controller trang Analytics (< 230 LOC)
├── features/analytics/
│   ├── components/
│   │   ├── banner/                        # AnalyticsPageHeader, HeaderBanner
│   │   ├── linechart/                     # Soft Spline Line Chart, Filter Modal
│   │   ├── distribution/                  # Horizontal Bar Chart, Pinned Sandbox
│   │   ├── supplies/                      # SuppliesForecastingSection, D-Day pills
│   │   ├── sla/                           # SLACostSection, Arc 180°, Heatmap Matrix
│   │   └── comparison/                    # DeviceComparisonModal, Picker
│   ├── hooks/useAnalyticsData.ts          # Hook Single Source of Truth
│   ├── utils/costCsvExport.ts             # Xuất CSV chi phí UTF-8 BOM
│   ├── utils/analyticsFloorHelper.ts      # Tính tỷ trọng sản lượng từng tầng
│   └── index.ts                           # Public API Gate
├── services/
│   ├── interfaces/IAnalyticsService.ts    # Interface trừu tượng Analytics
│   ├── providers/api/ApiAnalyticsProvider.ts
│   ├── providers/mock/MockAnalyticsProvider.ts
│   └── analyticsService.ts                # Singleton Factory Provider
└── types/api.ts                           # Hợp đồng API chuẩn hóa
```

---

## 3. Tiêu Chí Nghiệm Thu Đã Đạt Chuẩn

- [x] **Zero Mock Import in UI:** Loại bỏ 100% việc import mock data tĩnh trong components và biểu đồ. Tất cả dữ liệu chạy qua `useAnalyticsData()` và `IAnalyticsService`.
- [x] **Single Source of Truth:** Lọc Chi nhánh tại Header tự động cập nhật đồng thời Banner KPI, Biểu đồ Spline, Biểu đồ Cột Ngang, Cảnh báo D-Day và Chi phí phòng ban.
- [x] **Pure SVG Retina-ready:** 100% Pure React SVG, không sử dụng thư viện biểu đồ nặng nề (ECharts/WebGL).
- [x] **File Length:** Mọi file tuân thủ nghiêm ngặt `< 300 LOC`.
- [x] **Hệ thống Icon:** 100% FontAwesome (`@/shared/icons`), nghiêm cấm icon bên ngoài.

