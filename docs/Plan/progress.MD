# FleetMonitor — Báo Cáo Tiến Độ Triển Khai (Progress Tracking)

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Cập nhật gần nhất:** 04/11/2026 (Hiệu chuẩn quy mô hạm đội ~100 máy in, 100% Pure React SVG, Quản trị Bảo trì CMMS, Chuẩn hóa mã lỗi CSV & RBAC Data Scope)  
> **Chiến lược:** **Frontend-First với Mock Data Provider (Lập kế hoạch task chi tiết $\to$ Dựng UI Modern Minimalist Bento Grid $\to$ Tối ưu trải nghiệm Single-Operator $\to$ Nối Backend Zabbix/PostgreSQL)**  
> **Quy định ranh giới mã nguồn:** Dự án **chỉ xoay quanh thư mục `Frontend/` và `Backend/`**. Thư mục `frontend-old/` và `backend-old/` là phiên bản cũ, **tuyệt đối không đụng tới**.  
> **Phong cách UI:** **Modern Minimalist Bento Grid** (Nền phẳng viền mảnh `#e2e8f0`, màu thương hiệu `#2563eb`, font số liệu JetBrains Mono, 100% Pure React SVG sắc nét Retina/HiDPI, loại bỏ ECharts/ECharts-GL WebGL quá tải, biểu tượng duy nhất FontAwesome `@/shared/icons/`).

---

## 1. Hiện Trạng 4 Phân Hệ Hoàn Chỉnh (~100 Máy In)

| Phân hệ | Cấu Trúc Sub-Tabs & Phạm Vi Chức Năng | Hiện trạng Frontend (`Frontend/`) | Kế hoạch Backend (`Backend/`) | Task Liên Quan |
| :--- | :--- | :---: | :---: | :--- |
| **1. Tổng quan (`/dashboard`)** | 4 Thẻ KPI Bento động (`${onlineCount}/${totalPrinters}` Trực tuyến), Biểu đồ Khả dụng 24h Pure React SVG (stroke 2.25px), Biểu đồ Cung tròn trạng thái 3 dải màu, Bảng Thiết bị cần xử lý (5 dòng/trang, tách bạch Mất mạng vs Lỗi phần cứng, nút [Chẩn đoán] & [+ Lập lệnh]). | ✅ **Hoàn thành 100%** (Chuẩn Bento Minimalist, SVG sắc nét Retina) | ⏳ Sẵn sàng nối API | **TASK-FE-01 (FE) & TASK-BE-01 (BE)** |
| **2. Máy in (`/printers`)** | Gồm 3 Sub-tabs chuyên trách + Drawer Chẩn đoán:<br>• **Danh sách (`/printers/list`):** Bảng danh mục thiết bị, phân trang thu gọn 10–25 dòng, lọc theo Tầng (T1–T5), Hãng, Trạng thái.<br>• **Lịch trình (`/printers/timeline`):** Gantt Calendar dải 7/14/30 ngày, tự động nới rộng ô có việc (240px), tự động xóa task khỏi Gantt khi hoàn thành chuyển sang lịch sử.<br>• **Bảo trì (`/printers/history`):** Quản lý toàn bộ lệnh bảo trì CMMS phân loại Đang xử lý vs Đã hoàn thành.<br>• **Drawer Chẩn đoán:** Tab 1 CMYK OID meters; Tab 2 Lệnh bảo trì & Tiến độ SOP (Dynamic Stepper % chạy tự động, Accordion Kho lịch sử, lưu liên hệ hãng & chi phí vật tư). | ✅ **Hoàn thành 100%** (Gantt nới ô 240px & tự xóa task hoàn thành, Drawer Accordion) | ⏳ Sẵn sàng nối API | **TASK-FE-02 (FE) & TASK-BE-02/03 (BE)** |
| **3. Phân tích (`/analytics`)** | Gồm 3 Sub-tabs chuyên biệt (100% Pure React SVG):<br>• **Sản lượng in (`/analytics/overview`):** Xu hướng Soft Spline 2.25px kèm viên nang đỉnh tải, Biểu đồ Cột Ngang tỷ trọng Mono/Color, Khung Ghim Đối Chiếu (Pinned Comparison Sandbox) cùng thang đo, Slide-over so sánh 1:1.<br>• **Vật tư (`/analytics/supplies`):** Thống kê Khẩn cấp/Lưu ý/Cạn kiệt sớm nhất, Huy hiệu đếm ngược D-Day `[D-4]`/`[D-7]`/`[D-25]`, phân biệt máy đơn sắc (1 chấm ⚫) vs máy in màu (4 vạch CMYK), Pill theo dõi Hộp mực thải (Bình thường, Sắp đầy ⚠️, Đầy 🛑), nút tạo lệnh cấp phát vật tư.<br>• **SLA & Chi phí (`/analytics/sla-cost`):** 4 thẻ KPI Bento, Vòng cung bán nguyệt 180° chi phí phòng ban, Ma trận nhiệt Điểm nóng sự cố (5 tầng x 7 tuần). | ✅ **Hoàn thành 100%** (100% Pure React SVG, Cột Ngang Sandbox, D-Day & Hộp mực thải) | ⏳ Sẵn sàng nối API | **TASK-FE-03 (FE) & TASK-BE-04 (BE)** |
| **4. Cấu hình (`/settings`)** | Quy tắc Safe Window 10m, Critical Protection, Cache TTL 60s, Single-Operator NOC & Quản lý từ điển mã lỗi đa hãng qua Import/Export CSV. | ✅ **Hoàn thành 100%** (Chuẩn NOC, CSV Audit Trail) | ⏳ Sẵn sàng nối API | **TASK-FE-04 (FE) & TASK-BE-05 (BE)** |

---

## 2. Bảng Danh Mục Task Chuẩn Hóa (Master Task Registry)

### 🎨 Phân Hệ Frontend (Đã Hoàn Thành & Nghiệm Thu UI)

| Mã Task | Phân hệ | Tên Nhiệm Vụ & Tài Liệu | Trạng thái | Tiêu Chí Nghiệm Thu Đã Đạt Chuẩn |
| :--- | :--- | :--- | :---: | :--- |
| **TASK-FE-01** | Dashboard | [Dashboard Tổng Quan & Thước Đo Vận Hành NOC](file:///f:/Code/Github/Monitoring/docs/Tasks/Dashboard/TASK-FE-01_dashboard_overview.MD) | ✅ Hoàn thành | KPI Bento động, Pure SVG Spline 24h, Cung tròn trạng thái thiết bị, Bảng Thiết bị cần xử lý phân trang 5 dòng, tách bạch Offline vs Hardware Error |
| **TASK-FE-02** | Printers | [Danh Mục Thiết Bị, Lịch Trình Gantt & Lệnh Bảo Trì](file:///f:/Code/Github/Monitoring/docs/Tasks/Printers/TASK-FE-02_printers_diagnostics_and_tasks.MD) | ✅ Hoàn thành | Bảng danh sách 100 máy in phân trang 10-25 dòng lọc Tầng T1-T5, Gantt Timeline nới ô 240px tự xóa task khi hoàn thành, Bảng Lệnh bảo trì CMMS, Drawer 2 tab (OID CMYK, Dynamic Stepper tự tính %, Accordion Kho lịch sử, lưu liên hệ hãng & chi phí) |
| **TASK-FE-03** | Analytics | [Biểu Đồ Sản Lượng, Dự Báo Vật Tư & SLA Chi Phí](file:///f:/Code/Github/Monitoring/docs/Tasks/Analytics/TASK-FE-03_analytics_charts_and_rankings.MD) | ✅ Hoàn thành | 100% Pure React SVG, Soft Spline 2.25px đỉnh tải, Cột Ngang Mono/Color kèm Pinned Comparison Sandbox cùng thang đo, Slide-over so sánh 1:1, Bảng Dự báo vật tư D-Day viên nang `[D-4]` & theo dõi Hộp mực thải, Vòng cung chi phí 180°, Ma trận nhiệt sự cố 5 tầng x 7 tuần |
| **TASK-FE-04** | Settings | [Quy Tắc Vận Hành NOC, Auto-Closure & Từ Điển Mã Lỗi CSV](file:///f:/Code/Github/Monitoring/docs/Tasks/Settings/TASK-FE-04_settings_error_dictionary_rules.MD) | ✅ Hoàn thành | Quy tắc Safe Window 10m, Critical Protection, Cache TTL 60s, Single-Operator NOC, Tra cứu & nạp CSV từ điển mã lỗi phần cứng 6 hãng kèm Audit Trail |
| **TASK-FE-05** | Auth & RBAC | [Xác Thực Người Dùng & Phân Quyền 3 Vai Trò UI](file:///f:/Code/Github/Monitoring/docs/Design/rbac_roles_and_ui_permissions_spec.md) | ✅ Hoàn thành | Trang Login Bento, 3 Thẻ 1-Click Role Login, Lọc Sidebar theo quyền (Admin IT/NOC, Field Tech, HR Kiểm kê tài sản), Route Guard ProtectedRoute, Role Switcher tại chân Sidebar |

---

### ⚙️ Phân Hệ Backend & 4 Hạng Mục Trọng Tâm (~100 Máy In — Giai Đoạn Nối Dữ Liệu Thật)

| Mã Task | Phân hệ | Tên Nhiệm Vụ & Tài Liệu | Trạng thái | Phạm Vi Kỹ Thuật Đặc Tả Cho ~100 Thiết Bị |
| :--- | :--- | :--- | :---: | :--- |
| **TASK-BE-01** | Gateway | [Zabbix 7.0 JSON-RPC Client & SNMP Collector Gateway](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-01_zabbix_gateway.MD) | ⏳ Sẵn sàng | Polling 2 chu kỳ: Fast Polling 30s (~3.3 req/s) cho ICMP Ping & Triggers; Slow Polling 1h cho Bộ đếm counter & Mức vật tư; Safe Window 10m chống flapping |
| **TASK-BE-02** | Core | [In-Memory Caching 60s & Hardware Error Classification Engine](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-02_cache_and_error_classification.MD) | ⏳ Sẵn sàng | Lưu đệm in-memory TTL 60s (RAM < 10MB, UI < 5ms), xử lý Stale khi Zabbix ngắt kết nối (không mock ngầm), bộ phân loại lỗi fallback `FM-UNK-01` & `needs_mapping_review: true` |
| **TASK-BE-03** | Operations | [Maintenance Management: Ticket, Task, Work Log & MinIO Storage](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-03_maintenance_cmms.MD) | ⏳ Sẵn sàng | Quản lý vòng đời 3 tầng (Ticket -> Task -> Work Log), chi phí vật tư & nhân công VNĐ, lưu ảnh MinIO S3 qua Presigned URLs, tái sử dụng tri thức giải pháp |
| **TASK-BE-04** | Telemetry | [Printer Analytics (~100 máy) & Rollup Aggregator API](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-04_analytics_rollup_engine.MD) | ⏳ Sẵn sàng | Bảng Rollup giờ/ngày (~36.5k rows/năm, ~5MB/năm), thuật toán 3 trạng thái tính delta (bắt rollover 32-bit/reset), D-Day trượt 7 ngày, cung cấp API cho Pure SVG Charts |
| **TASK-BE-05** | Settings | [Error Code Standardization (6 Hãng) & CSV Import Engine](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-05_error_dictionary_csv.MD) | ⏳ Sẵn sàng | Nạp CSV từ điển mã lỗi qua giao diện Settings, kiểm duyệt Dry-Run 2 bước & commit nguyên tử, ánh xạ 6 hãng sang `FM-...`, hàng đợi duyệt mã chưa ánh xạ (Unmapped Queue) |
| **TASK-BE-06** | Security | [Multi-User RBAC 4 Cấp & Data Scope Middleware](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-06_rbac_data_scope.MD) | ⏳ Sẵn sàng | Phân quyền 4 vai trò (Fleet Manager, NOC, Field Tech, HR), tự động tiêm lọc SQL theo Tầng/Phòng ban, lưu cấu hình widget và máy in ghim so sánh |

---

## 3. Lộ Trình Triển Khai: Frontend-First $\to$ Nghiệm Thu UI $\to$ Backend Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: MODERN MINIMALIST FRONTEND (ĐÃ HOÀN TẤT 100%)                  │
│ [x] 100% Pure React SVG Charts (Spline 2.25px, Cột Ngang, Arc 180°, Heatmap)│
│ [x] Khung Ghim Đối Chiếu (Pinned Comparison Sandbox) cùng thang đo chuẩn hóa│
│ [x] Dự báo vật tư D-Day viên nang ([D-4], [D-7], [D-25]) & Hộp mực thải     │
│ [x] Gantt Timeline nới ô 240px & tự động xóa task hoàn thành sang Lịch sử   │
│ [x] Drawer chẩn đoán 2 tab phẳng: Dynamic Stepper %, Accordion Kho lịch sử  │
│ [x] Toàn bộ file mã nguồn tuân thủ nghiêm ngặt Rule 7.1 (< 300 LOC)         │
│ [x] 100% FontAwesome Icons duy nhất, loại bỏ hoàn toàn icon ngoài           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: KẾT NỐI BACKEND GATEWAY & POSTGRESQL (TIẾP THEO)               │
│ [ ] TASK-BE-01: Zabbix 7.0 JSON-RPC Gateway & SNMP Poller (~100 hosts)      │
│ [ ] TASK-BE-02: In-Memory Cache (TTL 60s) & Bộ Phân Loại Mã Lỗi             │
│ [ ] TASK-BE-03: Prisma Database (Printers, Incidents, Tasks & History)      │
│ [ ] TASK-BE-04: API Endpoint Telemetry Rollup & Delta Counter               │
│ [ ] TASK-BE-05: CSV Import Engine & Bảng Ánh Xạ Mã Lỗi                      │
│ [ ] TASK-BE-06: RBAC 4 Cấp & Data Scope Middleware                          │
│                                                                             │
│ ── BỘ 6 CỔNG KIỂM SOÁT NGHIỆM THU (CUTOVER GATES) TRƯỚC KHI XÓA MOCK ──     │
│ [ ] Cổng 1: Schema Prisma PostgreSQL 16 hoàn tất migration                  │
│ [ ] Cổng 2: Nạp CSV từ điển 6 hãng + Test mã unmapped fallback FM-UNK-01    │
│ [ ] Cổng 3: Zabbix Poller 30s/1h + Test Rollover 32-bit & Reset bo mạch     │
│ [ ] Cổng 4: Cache TTL 60s + Xử lý Stale khi Zabbix ngắt (không mock ngầm)   │
│ [ ] Cổng 5: Khớp 100% Type Contracts (MetricValue = number | null, no actionGuidance)│
│ [ ] Cổng 6: Test E2E thành công -> Bật DATA_SOURCE='api' & Archive Mock Data│
│     * Xem đặc tả OIDs: docs/Design/frontend_mock_to_oid_mapping.md          │
└─────────────────────────────────────────────────────────────────────────────┘
```
