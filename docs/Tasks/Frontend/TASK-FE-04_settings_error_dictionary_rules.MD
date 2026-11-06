# TASK-FE-04: Quy Tắc Vận Hành NOC, Auto-Closure & Từ Điển Mã Lỗi CSV

> **Phân hệ:** Frontend / Settings & Error Management  
> **Mã nhiệm vụ:** TASK-FE-04  
> **Phiên bản:** 2.6.0  
> **Trạng thái:** ✅ Đã hoàn thành (Chuẩn Bento 4 Sub-tabs, Live Ping, Ngưỡng động, CSV UTF-8)  
> **Tài liệu liên quan:** [Kiến Trúc](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md), [Tổng Quan](file:///f:/Code/Github/Monitoring/docs/Design/00_overview.MD), [API Contract](file:///f:/Code/Github/Monitoring/docs/Build/API_CONTRACT.MD)

---

## 1. Mục Tiêu & Phạm Vi Nghiệp Vụ

Xây dựng phân hệ cài đặt tham số vận hành trung tâm, kiểm tra hạ tầng Zabbix và quản trị từ điển mã lỗi phần cứng đa thương hiệu:
- **Tái Cấu Trúc 4 Sub-tabs Điều Hướng Góc Phải:**
  1. **Gateway & Kết nối (`/settings/gateway`):** Giám sát Zabbix 7.0 LTS, thẻ đo Live Ping độ trễ latency ms trực tiếp, nút kích hoạt đồng bộ Zabbix Poller vào Redux store, thẻ tham số Fast/Slow Polling khóa cố định bởi Backend.
  2. **Người dùng & Phân quyền (`/settings/rbac`):** Quản trị tài khoản RBAC (3 vai trò: `ADMIN`, `FIELD_TECH`, `ASSET_HR`), tìm kiếm tên/email, lọc nhanh theo vai trò, tạm khóa/kích hoạt tài khoản, đặt lại mật khẩu, phân vùng chi nhánh bàn giao.
  3. **Quy tắc & Ngưỡng cảnh báo (`/settings/rules`):** Cấu hình ngưỡng cảnh báo mực in động (Vàng <15%, Đỏ <5%, Dự báo cạn <7 ngày, Max Fuser Temp 215°C) lưu LocalStorage + Quy tắc Safe Window 10m, Critical Protection, Cache TTL 60s.
  4. **Từ điển mã lỗi (`/settings/dictionary`):** Tra cứu SC Ricoh, E Canon, 50-70 HP đa hãng, lọc mức độ Critical/Warning/Info, phân trang 10 dòng/trang, Nạp CSV & Xuất CSV tiện lợi.
- **Tối Ưu Hiệu Năng Tìm Kiếm & Lọc:** Debounce 250ms cho ô tìm kiếm thời gian thực, lọc kết hợp 4 chiều (Từ khóa + Hãng + Mức độ + Khối linh kiện), Bento Empty State trực quan kèm nút 'Xóa bộ lọc'.
- **Chuẩn Hóa Xuất/Nhập CSV:** Định dạng chuẩn UTF-8 BOM (`\uFEFF`), kiểm duyệt Dry-Run 2 bước trước khi lưu, thanh tiến trình nạp tệp (Progress Bar 0-100%), và bảng tổng kết KPI bản ghi thành công/lỗi.

---

## 2. Ranh Giới Kỹ Thuật & Cấu Trúc File

```text
frontend/src/
├── pages/
│   └── SettingsPage.tsx                   # Controller trang Settings (< 150 LOC)
├── features/settings/
│   ├── components/
│   │   ├── SettingsPageHeader.tsx         # Header tích hợp Segmented Sub-tab Switcher
│   │   ├── ZabbixStatusCard.tsx           # Thẻ trạng thái Zabbix Gateway an toàn
│   │   ├── ZabbixLivePingCard.tsx         # Thẻ đo Live Ping Latency ms & Poller Sync
│   │   ├── UserRbacManagerCard.tsx        # Bảng quản trị người dùng RBAC 3 vai trò
│   │   ├── OperationalRulesCard.tsx       # Quy tắc Safe Window 10m & In-memory Cache
│   │   ├── DynamicThresholdsCard.tsx      # Ngưỡng cảnh báo mực in lưu LocalStorage
│   │   ├── ErrorDictionaryCard.tsx        # Thẻ tra cứu từ điển mã lỗi
│   │   ├── ErrorDictionaryTable.tsx       # Bảng hiển thị mã lỗi phân trang
│   │   └── CsvImportModal.tsx             # Modal nạp CSV kiểm duyệt Dry-Run & Progress
│   ├── utils/
│   │   ├── errorDictionaryFilterHelper.ts # Lọc đa tiêu chí & Debounce
│   │   └── errorDictionaryCsvHelper.ts    # Xuất/Nhập CSV UTF-8 BOM & Validation
│   └── index.ts                           # Public API Gate
├── services/
│   └── settingsService.ts                 # Service gọi REST API /api/settings/*
└── types/api.ts                           # Interface PrinterErrorCode chuẩn hóa
```

---

## 3. Tiêu Chí Nghiệm Thu Đã Đạt Chuẩn

- [x] **Data Integrity & Security:** Khóa cứng URL Zabbix Server và Token trong `.env`, không cho phép sửa đổi qua Web UI; hiển thị URL đã che masking.
- [x] **CSV Standardization:** Nạp và xuất tệp CSV mã lỗi chuẩn UTF-8 BOM, không lỗi font tiếng Việt, kiểm duyệt nghiêm ngặt phân hệ linh kiện và mức độ sự cố.
- [x] **File Length:** Mọi file tuân thủ nghiêm ngặt `< 300 LOC`.
- [x] **Hệ thống Icon:** 100% FontAwesome (`@/shared/icons`), nghiêm cấm icon bên ngoài.

