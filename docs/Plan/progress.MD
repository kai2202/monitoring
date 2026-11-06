# FleetMonitor — Báo Cáo Tiến Độ Triển Khai (Progress Tracking)

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Cập nhật gần nhất:** 06/11/2026 (Hoàn tất 100% Nhóm A & Vòng đời CSV Từ điển mã lỗi: [1] Hiển thị trực quan thời điểm nạp bộ CSV đang áp dụng, hỗ trợ gỡ tháo hoàn toàn mã lỗi CSV khỏi PostgreSQL khi cần cập nhật mới, và tự động liệt kê/tự ẩn thông báo các mã lỗi phát sinh chưa tích hợp vào CSV ngay khi nạp CSV tương thích; [2] Hợp nhất 3 Zabbix Workers áp dụng Safe Window động, ngưỡng mực động & đối chiếu trực tiếp bảng `ErrorDictionary` trong CSDL; [3] Bổ sung đầy đủ `/api/v1/supplies` & `/api/v1/telemetry` mở rộng; [4] Chuẩn hóa `locationService.getDepartments()`, rút gọn `BranchFloorManagerModal`/`CsvImportModal`/`seed.ts` đạt 100% `< 300 LOC`, và bổ sung bộ Seed vận hành thực tế 14 ngày; 100% Typecheck/Build/Vitest Pass)  
> **Chiến lược:** **Frontend-First với Mock Data Provider (Lập kế hoạch task chi tiết $\to$ Dựng UI Modern Minimalist Bento Grid $\to$ Tối ưu trải nghiệm Single-Operator $\to$ Nối Backend Zabbix/PostgreSQL)**  
> **Quy định ranh giới mã nguồn:** Dự án **chỉ xoay quanh thư mục `Frontend/` và `Backend/`**. Thư mục `frontend-old/` và `backend-old/` là phiên bản cũ, **tuyệt đối không đụng tới**.  
> **Phong cách UI:** **Modern Minimalist Bento Grid** (Nền phẳng viền mảnh `#e2e8f0`, màu thương hiệu `#2563eb`, font số liệu JetBrains Mono, 100% Pure React SVG sắc nét Retina/HiDPI, loại bỏ ECharts/ECharts-GL WebGL quá tải, biểu tượng duy nhất FontAwesome `@/shared/icons/`).

---

## 1. Hiện Trạng 4 Phân Hệ Hoàn Chỉnh (~100 Máy In)

| Phân hệ                         | Cấu Trúc Sub-Tabs & Phạm Vi Chức Năng                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                                       Hiện trạng Frontend (`Frontend/`)                                       | Kế hoạch Backend (`Backend/`) | Task Liên Quan                           |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-----------------------------------------------------------------------------------------------------------: | :---------------------------: | :--------------------------------------- |
| **1. Tổng quan (`/dashboard`)** | 4 Thẻ KPI Bento động (`${onlineCount}/${totalPrinters}` Trực tuyến), Biểu đồ Khả dụng 24h Pure React SVG (stroke 2.25px), Biểu đồ Cung tròn trạng thái 3 dải màu, Bảng Thiết bị cần xử lý (5 dòng/trang, tách bạch Mất mạng vs Lỗi phần cứng, nút [Chẩn đoán] & [+ Lập lệnh]).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |                      ✅ **Hoàn thành 100%** (Chuẩn Bento Minimalist, SVG sắc nét Retina)                      |      ⏳ Sẵn sàng nối API      | **TASK-FE-01 (FE) & TASK-BE-01 (BE)**    |
| **2. Máy in (`/printers`)**     | Gồm 3 Sub-tabs chuyên trách + Drawer Chẩn đoán:<br>• **Danh sách (`/printers/list`):** Bảng danh mục thiết bị, phân trang thu gọn 10–25 dòng, lọc theo Tầng (T1–T5), Hãng, Trạng thái.<br>• **Lịch trình (`/printers/timeline`):** Gantt Calendar dải 7/14/30 ngày, tự động nới rộng ô có việc (240px), tự động xóa task khỏi Gantt khi hoàn thành chuyển sang lịch sử.<br>• **Bảo trì (`/printers/history`):** Quản lý toàn bộ lệnh bảo trì CMMS phân loại Đang xử lý vs Đã hoàn thành.<br>• **Drawer Chẩn đoán:** Tab 1 CMYK OID meters; Tab 2 Lệnh bảo trì & Tiến độ SOP (Dynamic Stepper % chạy tự động, Accordion Kho lịch sử, lưu liên hệ hãng & chi phí vật tư).                                                                                                                                                                                                                                                                           |             ✅ **Hoàn thành 100%** (Gantt nới ô 240px & tự xóa task hoàn thành, Drawer Accordion)             |      ⏳ Sẵn sàng nối API      | **TASK-FE-02 (FE) & TASK-BE-02/03 (BE)** |
| **3. Phân tích (`/analytics`)** | Gồm 3 Sub-tabs chuyên biệt (100% Pure React SVG):<br>• **Sản lượng in (`/analytics/overview`):** Xu hướng Soft Spline 2.25px kèm viên nang đỉnh tải, Biểu đồ Cột Ngang tỷ trọng Mono/Color mở rộng 100% toàn màn hình kèm nút toggle sàn đối chiếu [Đối chiếu thiết bị], Khung Ghim Đối Chiếu (Pinned Comparison Sandbox) Collapsible Split-View cùng thang đo tự mở khi ghim 📌 và tự thu gọn khi hết máy ghim, Slide-over so sánh 1:1.<br>• **Vật tư (`/analytics/supplies`):** Thống kê Khẩn cấp/Lưu ý/Cạn kiệt sớm nhất, Huy hiệu đếm ngược D-Day `[D-4]`/`[D-7]`/`[D-25]`, phân biệt máy đơn sắc (1 chấm ⚫) vs máy in màu (4 vạch CMYK), Pill theo dõi Hộp mực thải (Bình thường, Sắp đầy ⚠️, Đầy 🛑), nút tạo lệnh cấp phát vật tư.<br>• **SLA & Chi phí (`/analytics/sla-cost`):** 4 thẻ KPI Bento, Vòng cung bán nguyệt 180° chi phí phòng ban, Ma trận nhiệt Điểm nóng sự cố (5 tầng x 7 tuần).                                         |      ✅ **Hoàn thành 100%** (100% Pure React SVG, Collapsible Split-View Sandbox, D-Day & Hộp mực thải)       |      ⏳ Sẵn sàng nối API      | **TASK-FE-03 (FE) & TASK-BE-04 (BE)**    |
| **4. Cấu hình (`/settings`)**   | Chuẩn hóa 4 Sub-tabs điều hướng góc phải trên cùng (SettingsPageHeader):<br>• **Gateway & Kết nối (`/settings/gateway`):** Giám sát Zabbix 7.0 LTS, Live Ping đo độ trễ latency ms, kiểm tra kết nối 200 OK, nút kích hoạt đồng bộ Zabbix Poller trực tiếp vào Redux store, thẻ tham số Fast/Slow polling khóa cố định bởi Backend.<br>• **Người dùng & Phân quyền (`/settings/rbac`):** Quản trị RBAC, tìm kiếm tên/email, lọc nhanh theo Vai trò (Admin, Tech, HR), Tạm khóa/Kích hoạt tài khoản, đổi mật khẩu, gán chi nhánh.<br>• **Quy tắc & Ngưỡng (`/settings/rules`):** Ngưỡng cảnh báo Mực in động (Vàng <15%, Đỏ <5%, Dự báo cạn <7 ngày, Max Fuser Temp 215°C) lưu LocalStorage + Quy tắc Safe Window 10m, Critical Protection, Cache TTL 60s.<br>• **Từ điển mã lỗi (`/settings/dictionary`):** Tra cứu SC Ricoh, E Canon, 50-70 HP đa hãng, lọc mức độ Critical/Warning/Info, phân trang 10 dòng/trang, Nạp CSV & Xuất CSV tiện lợi. | ✅ **Hoàn thành 100%** (Chuẩn Bento 4 Sub-tabs, Live Ping, Ngưỡng động, 100% FontAwesome, Rule 7.1 < 300 LOC) |      ⏳ Sẵn sàng nối API      | **TASK-FE-04 (FE) & TASK-BE-05 (BE)**    |

---

## 2. Bảng Danh Mục Task Chuẩn Hóa (Master Task Registry)

### 🎨 Phân Hệ Frontend (Đã Hoàn Thành & Nghiệm Thu UI)

| Mã Task        | Phân hệ     | Tên Nhiệm Vụ & Tài Liệu                                                                                                                                        |  Trạng thái   | Tiêu Chí Nghiệm Thu Đã Đạt Chuẩn                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| :------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TASK-FE-01** | Dashboard   | [Dashboard Tổng Quan & Thước Đo Vận Hành NOC](file:///f:/Code/Github/Monitoring/docs/Tasks/Frontend/TASK-FE-01_dashboard_overview.MD)                          | ✅ Hoàn thành | KPI Bento động (MetricValue = number \| null, hiển thị '—' khi chưa có data), Pure SVG Spline 24h Skeleton & Empty State 'Chưa có dữ liệu Zabbix', Cung tròn trạng thái thiết bị, Bảng Thiết bị cần xử lý phân trang 5 dòng, tách bạch Offline vs Hardware Error                                                                                                                                                                                                                                                                                                                                                                                                  |
| **TASK-FE-02** | Printers    | [Danh Mục Thiết Bị, Lịch Trình Gantt & Lệnh Bảo Trì](file:///f:/Code/Github/Monitoring/docs/Tasks/Frontend/TASK-FE-02_printers_diagnostics_and_tasks.MD)       | ✅ Hoàn thành | Thanh phân bổ trạng thái hạm đội (FleetHealthBar 4 phân đoạn + Quick Filter), Segmented Sub-tab Switcher trực quan tích hợp bộ đếm tại Header, Tinh gọn thanh lọc PrinterFilterToolbar một hàng tránh lặp trạng thái, Tách dòng PrinterTableRow & tinh gọn nút thao tác Admin (Icon-only), Bảng danh sách 100 máy in phân trang 15/25/50/tất cả, lọc Tầng T1-T7 & Chi nhánh, Khai báo máy in mới (PrinterCreateModal), Sửa cấu hình (PrinterEditModal), Xuất CSV kiểm kê tài sản (exportPrintersToCsv), Huy hiệu Lưu kho/Thanh lý, Ngưng giám sát an toàn, Điều phối KTV, Hủy lệnh CMMS, Gantt Timeline nới ô 240px, Bảng CMMS lọc Chi nhánh & Tầng, Drawer 2 tab |
| **TASK-FE-03** | Analytics   | [Biểu Đồ Sản Lượng, Dự Báo Vật Tư & SLA Chi Phí](file:///f:/Code/Github/Monitoring/docs/Tasks/Frontend/TASK-FE-03_analytics_charts_and_rankings.MD)            | ✅ Hoàn thành | Header Card 2 hàng (AnalyticsPageHeader) tích hợp Segmented Sub-tab Switcher góc phải trên cùng (Ảnh 1), Bộ chọn Chi nhánh & Timeframe tập trung, 100% Pure React SVG, Soft Spline 2.25px đỉnh tải, Cột Ngang Mono/Color mở rộng 100% kèm Pinned Comparison Sandbox Collapsible Split-View (loại bỏ dock nổi dư thừa, kết nối ô tìm kiếm), Bảng Dự báo vật tư D-Day viên nang `[D-4]` & theo dõi Hộp mực thải đồng bộ Chi nhánh, Vòng cung chi phí 180°, Ma trận nhiệt sự cố, Nút Xuất Báo Cáo Chi Phí CSV tại Header                                                                                                                                             |
| **TASK-FE-04** | Settings    | [Quy Tắc Vận Hành NOC, Auto-Closure & Từ Điển Mã Lỗi CSV](file:///f:/Code/Github/Monitoring/docs/Tasks/Frontend/TASK-FE-04_settings_error_dictionary_rules.MD) | ✅ Hoàn thành | Tái cấu trúc chuẩn 4 Sub-tabs điều hướng góc phải trên cùng (SettingsPageHeader), Thẻ đo Ping Latency ms & Đồng bộ Zabbix Poller trực tiếp (ZabbixLivePingCard), Thẻ trạng thái Zabbix Gateway an toàn, Quản trị RBAC lọc vai trò & tìm kiếm (UserRbacManagerCard, UserCreateModal tạo tài khoản, đổi mật khẩu, gán Chi nhánh), Cấu hình ngưỡng cảnh báo mực in & an toàn nhiệt độ lưu LocalStorage (DynamicThresholdsCard), Quy tắc Safe Window 10m & In-memory Cache 60s (OperationalRulesCard), Từ điển mã lỗi đa hãng phân trang 10 dòng & Nạp/Xuất CSV (ErrorDictionaryCard, CsvImportModal)                                                                 |
| **TASK-FE-05** | Auth & RBAC | [Xác Thực Người Dùng & Phân Quyền 3 Vai Trò UI](file:///f:/Code/Github/Monitoring/docs/Design/rbac_roles_and_ui_permissions_spec.md)                           | ✅ Hoàn thành | Trang Login Bento, 3 Thẻ 1-Click Role Login, Lọc Sidebar theo quyền, Route Guard ProtectedRoute, Role Switcher tại chân Sidebar, Quản lý vị trí & Tầng (BranchFloorManagerModal - Admin only), Khai báo & Sửa máy in (PrinterCreateModal, PrinterEditModal - Admin only), Điều chuyển vị trí máy in (PrinterRelocateModal - Admin only), Điều phối KTV & Hủy lệnh CMMS (Admin only), Phê duyệt nghiệm thu đóng lệnh & Yêu cầu làm lại ảnh in test (TestPrintReviewModal - Admin only)                                                                                                                                                                             |

---

### ⚙️ Phân Hệ Backend & 4 Hạng Mục Trọng Tâm (~100 Máy In — Giai Đoạn Nối Dữ Liệu Thật)

| Mã Task        | Phân hệ    | Tên Nhiệm Vụ & Tài Liệu                                                                                                                                           | Trạng thái  | Phạm Vi Kỹ Thuật Đặc Tả Cho ~100 Thiết Bị                                                                                                                                     |
| :------------- | :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TASK-BE-01** | Gateway    | [Zabbix 7.0 JSON-RPC Client & SNMP Collector Gateway](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-01_zabbix_gateway.MD)                          | ⏳ Sẵn sàng | Polling 2 chu kỳ: Fast Polling 30s (~3.3 req/s) cho ICMP Ping & Triggers; Slow Polling 1h cho Bộ đếm counter & Mức vật tư; Safe Window 10m chống flapping                     |
| **TASK-BE-02** | Core       | [In-Memory Caching 60s & Hardware Error Classification Engine](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-02_cache_and_error_classification.MD) | ⏳ Sẵn sàng | Lưu đệm in-memory TTL 60s (RAM < 10MB, UI < 5ms), xử lý Stale khi Zabbix ngắt kết nối (không mock ngầm), bộ phân loại lỗi fallback `FM-UNK-01` & `needs_mapping_review: true` |
| **TASK-BE-03** | Operations | [Maintenance Management: Ticket, Task, Work Log & MinIO Storage](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-03_maintenance_cmms.MD)             | ⏳ Sẵn sàng | Quản lý vòng đời 3 tầng (Ticket -> Task -> Work Log), chi phí vật tư & nhân công VNĐ, lưu ảnh MinIO S3 qua Presigned URLs, tái sử dụng tri thức giải pháp                     |
| **TASK-BE-04** | Telemetry  | [Printer Analytics (~100 máy) & Rollup Aggregator API](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-04_analytics_rollup_engine.MD)                | ⏳ Sẵn sàng | Bảng Rollup giờ/ngày (~36.5k rows/năm, ~5MB/năm), thuật toán 3 trạng thái tính delta (bắt rollover 32-bit/reset), D-Day trượt 7 ngày, cung cấp API cho Pure SVG Charts        |
| **TASK-BE-05** | Settings   | [Error Code Standardization (6 Hãng) & CSV Import Engine](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-05_error_dictionary_csv.MD)                | ⏳ Sẵn sàng | Nạp CSV từ điển mã lỗi qua giao diện Settings, kiểm duyệt Dry-Run 2 bước & commit nguyên tử, ánh xạ 6 hãng sang `FM-...`, hàng đợi duyệt mã chưa ánh xạ (Unmapped Queue)      |
| **TASK-BE-06** | Security   | [Multi-User RBAC 4 Cấp & Data Scope Middleware](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-06_rbac_data_scope.MD)                               | ⏳ Sẵn sàng | Phân quyền 4 vai trò (Fleet Manager, NOC, Field Tech, HR), tự động tiêm lọc SQL theo Tầng/Phòng ban, lưu cấu hình widget và máy in ghim so sánh                               |

---

## 3. Lộ Trình Triển Khai: Frontend-First $\to$ Nghiệm Thu UI $\to$ Backend Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: MODERN MINIMALIST FRONTEND (ĐÃ HOÀN TẤT 100%)                  │
│ [x] 100% Pure React SVG Charts (Spline 2.25px, Cột Ngang, Arc 180°, Heatmap)│
│ [x] Khung Ghim Đối Chiếu (Pinned Comparison Sandbox) cùng thang đo chuẩn hóa│
│ [x] Dự báo vật tư D-Day viên nang ([D-4], [D-7], [D-25]) & Hộp mực thải     │
│ [x] Gantt Timeline nới ô 240px & tự động xóa task hoàn thành sang Lịch sử   │
│ [x] Tối ưu hóa phân hệ Kỹ thuật viên (FIELD_TECH): Home đích Gantt, Lọc việc│
│     của tôi 1-click, ẩn nút lập lệnh Admin, ẩn tab chi phí, action SOP rõ ràng│
│ [x] Tối ưu hóa phân hệ HR / Kiểm kê Tài sản (ASSET_HR): Sidebar đối soát KPI,│
│     tìm kiếm & hiển thị Serial Number, nhãn kiểm kê tài sản, hạch toán chi phí│
│ [x] Rà soát và khắc phục triệt để lỗi giao diện khi thu gọn Sidebar (72px)   │
│     và co giãn màn hình Responsive (Mobile, Tablet, Desktop, Ultrawide):     │
│     Flexbox/Grid chuẩn xác (minmax min(100%)), triệt tiêu khe hở Gantt table │
│ [x] Chuẩn hóa toàn bộ Layout Form & Modal hiện có theo 4 Thiết Kế Mẫu:       │
│     • Auth & Input Box: Floating Nested Labels, bo góc 14px (Ảnh 4)          │
│     • Access Cards & RBAC: Thẻ thành viên, squircle icon, chip quyền (Ảnh 2) │
│     • Task & SOP Builder: Checklist động, kéo thả bước kiểm tra (Ảnh 1 & 3)  │
│     • File & Attachments: Thẻ thư mục vàng, download pill trực quan (Ảnh 3)   │
│ [x] Rà soát 100% nút bấm & hành động UI: loại bỏ toàn bộ alert() dummy,      │
│     thay bằng Sonner toast logic & Blob file proof download                  │
│ [x] Bổ sung UI Micro-Interactions & Polish toàn diện trên tất cả các tab:    │
│     • Thanh cuộn tuỳ chỉnh siêu mảnh (.custom-scrollbar) cho WebKit/Firefox  │
│     • Phản hồi xúc giác (Tactile push scale 0.975), Hover lift & Focus-ring  │
│     • Hiệu ứng chuyển động Pill Sub-Tab Header, bóng đổ & viền sáng Dark Mode│
│     • Chấm định vị phát sáng 'Hôm nay' trên Timeline Gantt Calendar          │
│     • Thanh tìm kiếm Header bo tròn mở rộng mượt mà khi Focus                │
│ [x] Chuẩn hóa toàn diện Dữ liệu Xuất/Nhập CSV Từ điển mã lỗi đa hãng:       │
│     • Định dạng chuẩn UTF-8 BOM (\uFEFF) hiển thị hoàn hảo dấu tiếng Việt    │
│     • Đồng nhất 100% tên cột (vendor, errorCode, errorName, subsystem...)    │
│     • Validation Engine kiểm tra chặt chẽ mã lỗi, hãng, mức độ, mô tả        │
│     • Thanh tiến trình (Progress Bar 0-100%) khi nạp tệp CSV                 │
│     • Bảng tổng kết chi tiết KPI: Tổng số, Hợp lệ, Lỗi từ chối, Cập nhật     │
│ [x] Tối ưu hóa hiệu năng tìm kiếm & lọc đa tiêu chí cho Từ điển mã lỗi:      │
│     • Tích hợp Debounce (250ms) cho ô tìm kiếm thời gian thực                │
│     • Xử lý chuẩn xác logic đa từ khóa (AND giữa các từ, OR giữa các trường) │
│     • Lọc kết hợp 4 chiều: Tìm kiếm + Hãng + Mức độ + Khối linh kiện phần cứng│
│     • Phân trang động (10, 25, 50, 100, Tất cả) kèm điều hướng trang thông minh│
│     • Bento Empty State trực quan kèm nút 'Xóa bộ lọc và xem tất cả' 1-click │
│     • Huy hiệu đếm số bộ lọc đang kích hoạt [Đặt lại (X)] trên Toolbar       │
│ [x] Đấu nối REST API Endpoints Backend Controllers & Routes chuẩn hóa:       │
│     • /api/printers (CRUD, sync, update location)                            │
│     • /api/tasks (CRUD, reassign, reschedule, notes, progress)               │
│     • /api/settings (settings, live ping Zabbix 7.0 LTS, error dictionary)   │
│ [x] Drawer chẩn đoán 2 tab phẳng: Dynamic Stepper %, Accordion Kho lịch sử  │
│ [x] Loại bỏ toàn bộ Mock Data & Fix Cứng trong Components & Charts:          │
│     • Định nghĩa chuẩn hóa TypeScript API Interfaces (frontend/src/types/api.ts)│
│     • Thiết lập Single Source of Truth qua Redux UI Slice & IAnalyticsService │
│     • Hook useAnalyticsData đồng bộ hóa Bộ lọc Chi nhánh, Timeframe, Trend,   │
│       Floor Distribution, Supplies Alerts và SLA Costs từ nguồn duy nhất      │
│ [x] Toàn bộ file mã nguồn tuân thủ nghiêm ngặt Rule 7.1 (< 300 LOC)         │
│ [x] 100% FontAwesome Icons duy nhất, loại bỏ hoàn toàn icon ngoài           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: KẾT NỐI BACKEND GATEWAY & POSTGRESQL (TIẾP THEO)               │
│ [x] Khởi tạo Hạ tầng database/ (Docker Compose PostgreSQL 16 + MinIO S3)   │
│ [x] Bổ sung bộ thư viện Enterprise (JWT, bcryptjs, cookie-parser, multer...) │
│ [x] Hoàn thiện backend/prisma/schema.prisma (RBAC 3 vai trò, CMMS & MinIO)  │
│ [x] Khởi tạo Backend REST API Controllers & Routes (/printers, /tasks, ...)  │
│ [x] Tài liệu Kiến trúc CSDL & Lưu trữ: storage_and_database_architecture.md │
│ [x] Zero-Mock Cutover Runtime (`VITE_DATA_SOURCE=api`, Enterprise Login,     │
│     bỏ Demo Role Switcher, khóa `authenticateToken` & RBAC toàn Backend)     │
│ [x] TASK-BE-02/03/05/06 (Codebase): Prisma CRUD Printers/Incidents/Tasks,    │
│     MinIO Presigned URLs, CSV Import DB, RBAC Users bcrypt, Cache TTL 60s    │
│ [x] TASK-BE-04 (Codebase & Unit Test): Rollup Counter32 32-bit rollover/reset │
│ [ ] TASK-BE-01/04 (Live Hardware): Kết nối máy chủ Zabbix 7.0 & máy in vật lý │
│                                                                             │
│ ── BỘ 6 CỔNG KIỂM SOÁT NGHIỆM THU (CUTOVER GATES) HOÀN TẤT 100% ────────────│
│ [x] Cổng 1: Schema Prisma PostgreSQL 16 hoàn tất migration                  │
│ [x] Cổng 2: Nạp CSV từ điển 6 hãng + Test mã unmapped fallback FM-UNK-01    │
│ [x] Cổng 3: Zabbix Poller 30s/1h + Test Rollover 32-bit & Reset bo mạch     │
│ [x] Cổng 4: Cache TTL 60s + Xử lý Stale khi Zabbix ngắt (không mock ngầm)   │
│ [x] Cổng 5: Khớp 100% Type Contracts (MetricValue = number | null, no actionGuidance)│
│ [x] Cổng 6: CSDL Docker + Prisma Push + Seed thành công -> DATA_SOURCE='api' │
│     * Xem đặc tả OIDs: docs/Design/frontend_mock_to_oid_mapping.md          │
└─────────────────────────────────────────────────────────────────────────────┘
```
