# TASK-FE-02: Danh Mục Thiết Bị, Lịch Trình Gantt & Lệnh Bảo Trì

> **Phân hệ:** Frontend / Printers & CMMS  
> **Mã nhiệm vụ:** TASK-FE-02  
> **Phiên bản:** 2.6.0  
> **Trạng thái:** ✅ Đã hoàn thành (Gantt nới ô 240px, Drawer 2 Tab, FleetHealthBar 4 phân đoạn)  
> **Tài liệu liên quan:** [Kiến Trúc](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md), [Tổng Quan](file:///f:/Code/Github/Monitoring/docs/Design/00_overview.MD), [API Contract](file:///f:/Code/Github/Monitoring/docs/Build/API_CONTRACT.MD)

---

## 1. Mục Tiêu & Phạm Vi Nghiệp Vụ

Xây dựng phân hệ quản trị danh mục ~100 thiết bị in ấn, theo dõi tiến độ bảo trì trên lịch trình trực quan và vận hành hệ thống lệnh công việc CMMS:
- **Thanh Phân Bổ Sức Khỏe Hạm Đội (FleetHealthBar):** 4 phân đoạn trực quan (Tốt, Cảnh báo mực, Lỗi phần cứng, Ngoại tuyến) tích hợp Quick Filter 1-click.
- **Sub-tab Danh Sách (`/printers/list`):** Bảng danh mục 100 máy in phân trang linh hoạt 15/25/50/tất cả, lọc theo Tầng (T1–T7), Chi nhánh, Hãng (Canon, Ricoh, HP, v.v.), Chức năng (Đơn sắc, Màu, Đa chức năng MFP).
- **Thao Tác Quản Trị Phân Quyền (Admin Only):** Khai báo máy in mới (`PrinterCreateModal`), chỉnh sửa thông số (`PrinterEditModal`), điều chuyển vị trí (`PrinterRelocateModal`), quản lý cơ cấu Chi nhánh & Tầng (`BranchFloorManagerModal`), xuất file CSV kiểm kê tài sản (`exportPrintersToCsv`).
- **Sub-tab Lịch Trình Gantt (`/printers/timeline`):** Lịch công việc dải 7/14/30 ngày, tự động nới rộng ô có việc (240px) để hiển thị chi tiết, tự động xóa task hoàn thành sang Kho Lịch Sử.
- **Sub-tab Bảo Trì (`/printers/history`):** Quản lý lệnh bảo trì CMMS phân loại Đang xử lý vs Đã hoàn thành, lọc theo Chi nhánh, Tầng và Đánh giá hiệu suất kỹ thuật viên (MTTR, SLA).
- **Drawer Chẩn Đoán Chi Tiết (Slide-over Drawer):** Tab 1 Đồng hồ đo mức OID CMYK & bộ đếm counter; Tab 2 Lệnh bảo trì & Tiến độ SOP (Dynamic Stepper % hoàn thành, Accordion Kho lịch sử, lưu liên hệ hãng & chi phí vật tư).

---

## 2. Ranh Giới Kỹ Thuật & Cấu Trúc File

```text
frontend/src/
├── pages/
│   └── PrintersPage.tsx                   # Controller trang Printers (< 295 LOC)
├── features/printers/
│   ├── components/
│   │   ├── FleetHealthBar.tsx             # Thanh phân bổ trạng thái hạm đội
│   │   ├── PrintersPageHeader.tsx         # Header tích hợp Segmented Sub-tab Switcher
│   │   ├── PrinterFilterToolbar.tsx       # Thanh lọc 1 hàng tinh gọn
│   │   ├── PrinterTableView.tsx           # Bảng danh mục 100 máy in
│   │   ├── PrinterTableRow.tsx            # Dòng thiết bị kèm menu thao tác Admin
│   │   ├── modals/                        # Modals: Create, Edit, Relocate, BranchFloor
│   │   └── workorders/                    # Bảng lệnh bảo trì CMMS WorkOrdersTable
│   ├── utils/printerCsvExport.ts          # Tiện ích xuất CSV kiểm kê tài sản UTF-8 BOM
│   └── index.ts                           # Public API Gate
├── features/dashboard/components/
│   ├── diagnostics/PrinterDiagnosticsDrawer.tsx # Drawer chẩn đoán 2 tab phẳng
│   └── timeline/TaskTimelineCalendar.tsx        # Biểu đồ Gantt nới ô 240px
└── services/
    ├── printerService.ts                  # Service quản lý máy in
    ├── taskService.ts                     # Service quản lý lệnh bảo trì
    └── locationService.ts                 # Service vị trí Chi nhánh & Tầng
```

---

## 3. Tiêu Chí Nghiệm Thu Đã Đạt Chuẩn

- [x] **Single Source of Truth:** Đồng bộ vị trí, trạng thái thiết bị và danh sách việc bảo trì trên toàn bộ các Sub-tabs.
- [x] **RBAC Enforcement:** Quyền điều chuyển máy in, tạo lệnh và sửa cấu hình chỉ dành cho `ADMIN`. Kỹ thuật viên (`FIELD_TECH`) chỉ thấy lệnh được giao và bị ẩn trường chi phí VNĐ.
- [x] **File Length:** Mọi file tuân thủ nghiêm ngặt `< 300 LOC`.
- [x] **Hệ thống Icon:** 100% FontAwesome (`@/shared/icons`), nghiêm cấm icon bên ngoài.

