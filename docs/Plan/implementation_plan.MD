# Implementation Plan: Lộ Trình Triển Khai Toàn Diện Hệ Thống FleetMonitor

> **Dự án:** FleetMonitor — Enterprise Printer Monitoring & Management System  
> **Tài liệu:** Kế hoạch Triển khai & Phân rã Công việc (Implementation Plan & Task Breakdown)  
> **Chiến lược cốt lõi:** **Frontend-First với Mock Data Provider (Hoàn thiện Giao diện & Tương tác Trước, Triển khai Backend Sau)**

---

## 1. Tổng Quan & Chiến Lược Triển Khai Cốt Lõi

FleetMonitor áp dụng chiến lược phát triển **Frontend-First với Mock Data Provider**, phân định rạch ròi 3 nhóm công việc để tối ưu hóa tốc độ kiểm chứng giao diện người dùng và triệt tiêu rủi ro phụ thuộc:

### 1.1 Phân Định Rõ 3 Loại Task Từ Đầu
1. **Task Mock & Data:** Định nghĩa sẵn cấu trúc dữ liệu mẫu bám sát 100% nghiệp vụ thực tế (35 máy in đa hãng, sự cố phần cứng SC/E-codes, công việc Notion 4 views, vật tư CMYK, đo lường Telemetry 30 ngày).
2. **Task Frontend:** Tập trung 100% vào việc dựng giao diện, thiết kế components, bố cục (layout), tương tác kéo thả (Kanban, Timeline) chạy trực tiếp trên Mock Data qua Service Layer, hoàn toàn không bị phụ thuộc hay bị chặn bởi Backend.
3. **Task Backend:** Xây dựng cơ sở dữ liệu PostgreSQL (Prisma), các API endpoints và kết nối Zabbix 7.0 theo đúng hợp đồng dữ liệu ([`docs/Build/API_CONTRACT.MD`](file:///f:/Code/Github/Monitoring/docs/Build/API_CONTRACT.MD)).

### 1.2 Dựng Frontend Trực Quan Với Mock Data Trước
- Khi chưa có Backend, Frontend vẫn có đầy đủ dữ liệu phong phú để render lên màn hình.
- Người dùng và chuyên gia nghiệp vụ có thể kiểm tra trực quan ngay lập tức:
  - Máy in hiển thị thế nào khi bị lỗi cụm sấy (Fuser SC541 / E000).
  - Cảnh báo đổi màu ra sao khi mực in $\le 10\%$ hoặc hộp mực thải $\ge 80\%$.
  - Nhận diện trực quan công việc bị quá hạn (Overdue), sắp đến hạn (Due Soon).
  - Tương tác kéo thả thẻ Kanban đổi trạng thái có mượt mà không (60fps, không layout shift).

### 1.3 Chuyển Sang Backend Thật Cực Kỳ Nhẹ Nhàng (Không Lo Đập Đi Xây Lại)
Nhờ kiến trúc **Service Provider Layer** (được thiết kế chuẩn tại `TASK-013`):
- Toàn bộ Component chỉ gọi qua tầng Service (ví dụ: `taskService.getTasks()`, `printerService.getPrinters()`), tuyệt đối không truy cập trực tiếp vào `mocks/`.
- **Giai đoạn 1 (Làm UI):** Service lấy từ `mocks/`. Hoàn thiện toàn bộ giao diện và tương tác.
- **Giai đoạn 2 (Backend sẵn sàng):** Chỉ cần đổi một tham số duy nhất `DATA_SOURCE = "api"`, toàn bộ code Component (JSX, CSS, State giao diện) được giữ nguyên 100%, không phải sửa lại logic hiển thị.

### 1.4 Quy Định Ranh Giới Thư Mục Mã Nguồn (Codebase Boundaries)
- **Hai Thư Mục Trung Tâm Duy Nhất Của Dự Án:**
  - `Frontend/` (hoặc `frontend/`): Chứa toàn bộ mã nguồn giao diện người dùng mới, components, hooks, styles, services và mock data (`src/mocks/`).
  - `Backend/` (hoặc `backend/`): Chứa toàn bộ mã nguồn máy chủ mới, Express REST API, Prisma models, migrations và Zabbix client.
- **Thư Mục Cũ Tuyệt Đối Không Đụng Tới (`frontend-old/` và `backend-old/`):**
  - Là mã nguồn cũ chỉ giữ lại để **đọc tham khảo** (Read-Only Reference).
  - Tuyệt đối **không đụng tới**, không sửa, không xóa, không tạo thêm bất kỳ file nào trong 2 thư mục này.
  - **Mọi thay đổi mới BẮT BUỘC phải được tạo trong `Frontend/` và `Backend/`.**

---

## 2. Quyết Định Kiến Trúc Trọng Tâm (Architecture Decisions)

1. **Nguồn Dữ liệu Thẩm quyền (SSoT):**
   - **PostgreSQL 16 (via Prisma):** Là SSoT cho dữ liệu nghiệp vụ: vị trí máy in (`location`), vòng đời sự cố (`Incident`), phiếu công việc bảo trì (`Task / Work Order`), lịch sử thao tác (`TaskActivityLog`) và từ điển mã lỗi (`ErrorDictionary`).
   - **Zabbix 7.0 LTS (via JSON-RPC):** Là SSoT cho dữ liệu kỹ thuật: ICMP ping, SNMP availability, bộ đếm trang thời gian thực, mức vật tư và triggers lỗi phần cứng.
2. **Quy tắc Đồng bộ Vị trí 2 Bước (Location Sync Policy):**
   - Cập nhật vị trí ghi thành công vào PostgreSQL $\to$ phản hồi `200 OK` cho Frontend ngay.
   - Đồng bộ sang Zabbix Host Inventory là bước phụ trợ (best-effort). Thất bại không rollback DB.
3. **Quy tắc Tự động Đóng Sự cố (Unified Auto-Closure):**
   - Chỉ tự động đóng sự cố mức Warning/Info sau 5 - 10 phút khi trigger clear và SNMP xác nhận máy Online.
   - Không tự động đóng sự cố Critical hoặc sự cố do người dùng báo cáo chưa được xác minh.
4. **Không Gian Làm Việc Quản Lý Công Việc Phong Cách Notion:**
   - 4 chế độ xem đồng bộ dữ liệu: Table, Board (Kanban), Calendar, Timeline (Gantt).
   - Lập lịch có ràng buộc: dời lịch bắt buộc có lý do; mọi thay đổi trạng thái/phân công ghi vết bất biến vào `TaskActivityLog`.
5. **Ràng Buộc Kỹ Thuật Bắt Buộc:**
   - Tuyệt đối không có trường `actionGuidance` trong toàn bộ hệ thống.
   - Dữ liệu đo lường số tuân thủ `MetricValue = number | null` (không thay null bằng 0).

---

## 3. Sơ Đồ Phụ Thuộc (Dependency Graph)

```text
Kho Mock Data (mocks/ — 35 máy in, Incidents, Tasks, Telemetry)
    │
    ├── Service Provider Layer (DATA_SOURCE = "mock" | "api")
    │       │
    │       ├── Frontend UI Components (Dashboard, Printers, Notion Workspace, Supplies, Charts)
    │       │       │
    │       │       └── [🏁 CHECKPOINT 1: NGƯỜI DÙNG DUYỆT GIAO DIỆN & TƯƠNG TÁC]
    │       │
    │       └── Backend API Providers (Khi người dùng xác nhận đạt yêu cầu)
    │               │
    │               ├── Express REST API Routes (tuân theo API_CONTRACT.MD)
    │               ├── Prisma PostgreSQL Database Models & Transactions
    │               └── Zabbix 7.0 API Client & In-Memory Cache (TTL 60s)
```

---

## 4. Lộ Trình Triển Khai Tuần Tự (Frontend $\to$ Mock $\to$ Nhìn trực quan ổn $\to$ Nối Backend)

```text
+-----------------------------------------------------------------------------------------+
| BƯỚC 1: DỰNG FRONTEND (Giao diện UI, layout, components, form, tương tác kéo thả)       |
+-----------------------------------------------------------------------------------------+
                                           │
                                           ▼
+-----------------------------------------------------------------------------------------+
| BƯỚC 2: NẠP MOCK DATA (Kết nối Mock Provider qua Service Layer, dữ liệu đa dạng)        |
+-----------------------------------------------------------------------------------------+
                                           │
                                           ▼
+-----------------------------------------------------------------------------------------+
| BƯỚC 3: NHÌN ĐƯỢC TRỰC QUAN ỔN (Visual Verification: người dùng xem trực quan thực tế)   |
+-----------------------------------------------------------------------------------------+
                                           │
                    [🏁 NGƯỜI DÙNG XEM UI THẤY ỔN MỚI KÊU GẮN BACKEND]
                                           ▼
+-----------------------------------------------------------------------------------------+
| BƯỚC 4: NỐI BACKEND (Xây PostgreSQL, Prisma, REST API, Zabbix & đổi DATA_SOURCE="api")  |
+-----------------------------------------------------------------------------------------+
```

---

### GIAI ĐOẠN 1: DỰNG FRONTEND $\to$ NẠP MOCK $\to$ NHÌN TRỰC QUAN ỔN

#### Bước 1: Nền tảng Dữ liệu Mẫu & Service Provider Layer
- [ ] **Task 1.0 (`TASK-000` — Nền tảng):** Khởi tạo Scaffolding cho `Frontend/` (Vite, TS, theme Sáng/Tối, App Shell Sidebar + Header) và `Backend/` (Express, TS) ([`docs/Tasks/Settings/TASK-000_workspace_scaffolding.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Settings/TASK-000_workspace_scaffolding.MD)).
- [ ] **Task 1.1 (`TASK-013` — Mock & Data):** Xây dựng kho Mock Data tại `Frontend/src/mocks/`, cấu hình chuyển đổi nguồn dữ liệu `DATA_SOURCE = "mock" | "api"` và Service Provider Layer ([`docs/Tasks/Settings/TASK-013_mock_data_provider_layer.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Settings/TASK-013_mock_data_provider_layer.MD)).

#### Bước 2: Hoàn thiện Giao diện & Tương tác 6 Phân hệ (Frontend Tasks)
- [ ] **Task 1.2 (`TASK-012` — Frontend):** Hoàn thiện Dashboard tổng quan với thẻ KPI click-to-filter và widget thiết bị cần chú ý ([`docs/Tasks/Dashboard/TASK-012_frontend_dashboard_overview.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Dashboard/TASK-012_frontend_dashboard_overview.MD)).
- [ ] **Task 1.3 (`TASK-004` — Frontend):** Hoàn thiện giao diện chi tiết máy in 4 tab chẩn đoán (`Diagnostics`, `Supplies`, `Counters`, `History`) và modal đổi vị trí ([`docs/Tasks/Printers/TASK-004_frontend_printer_diagnostics.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Printers/TASK-004_frontend_printer_diagnostics.MD)).
- [ ] **Task 1.4 (`TASK-006` — Frontend):** Hoàn thiện giao diện giám sát vật tư, thanh đo mực CMYK chuẩn tỷ lệ và nút 1-click tạo Task thay mực ([`docs/Tasks/Supplies/TASK-006_frontend_supplies_monitoring.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Supplies/TASK-006_frontend_supplies_monitoring.MD)).
- [ ] **Task 1.5 (`TASK-014` — Frontend):** Hoàn thiện giao diện Hàng đợi sự cố (Incident Queue), Drawer điều tra lỗi và modal tạm hoãn chờ linh kiện/hãng ([`docs/Tasks/Operations/TASK-014_frontend_incident_queue.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Operations/TASK-014_frontend_incident_queue.MD)).
- [ ] **Task 1.6 (`TASK-001` — Frontend):** Hoàn thiện phân hệ Operations Notion Workspace với 4 chế độ xem (Table, Board kéo thả, Calendar, Timeline Gantt) và Drawer chi tiết ([`docs/Tasks/Operations/TASK-001_notion_tasks_workspace.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Operations/TASK-001_notion_tasks_workspace.MD)).
- [ ] **Task 1.7 (`TASK-008` — Frontend):** Hoàn thiện biểu đồ xu hướng sản lượng in 30 ngày, biểu đồ tính khả dụng và bảng danh sách Lemon Devices ([`docs/Tasks/Analytics/TASK-008_frontend_analytics_charts.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Analytics/TASK-008_frontend_analytics_charts.MD)).
- [ ] **Task 1.8 (`TASK-010` — Frontend):** Hoàn thiện giao diện cấu hình hệ thống, form kiểm tra Zabbix và bảng Từ điển mã lỗi ([`docs/Tasks/Settings/TASK-010_frontend_settings_ui.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Settings/TASK-010_frontend_settings_ui.MD)).

#### 🏁 Checkpoint: Nhìn Được Trực Quan UI Ổn Mới Kêu Gắn Backend
- [ ] Toàn bộ 6 phân hệ chạy trơn tru với `DATA_SOURCE = "mock"`.
- [ ] Người dùng trực tiếp thử nghiệm: kéo thả Kanban đổi trạng thái, xem biểu đồ, kiểm tra các ca lỗi phần cứng SC541, E000, kiểm tra trạng thái quá hạn, thao tác tạm hoãn sự cố.
- [ ] **Điều kiện tiên quyết:** **Chỉ khi người dùng nhìn thấy trực quan UI ổn thì mới yêu cầu gắn Backend.** Tuyệt đối không tự ý nối Backend khi chưa có xác nhận từ người dùng.

---

### GIAI ĐOẠN 2: NỐI BACKEND THẬT (CHỈ THỰC HIỆN KHI NGƯỜI DÙNG DUYỆT UI)

#### Bước 3: Phát triển Backend API & Cơ sở dữ liệu PostgreSQL (Backend Tasks)
- [ ] **Task 2.1 (`TASK-011` — Backend):** Dịch vụ tổng hợp số liệu Dashboard và cache in-memory 60s ([`docs/Tasks/Dashboard/TASK-011_backend_dashboard_summary.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Dashboard/TASK-011_backend_dashboard_summary.MD)).
- [ ] **Task 2.2 (`TASK-003` — Backend):** Xây dựng dịch vụ máy in, chính sách đồng bộ vị trí 2 bước và API chẩn đoán ([`docs/Tasks/Printers/TASK-003_backend_printer_service.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Printers/TASK-003_backend_printer_service.MD)).
- [ ] **Task 2.3 (`TASK-005` — Backend):** Xây dựng backend vật tư, chuẩn hóa % CMYK đa hãng và đánh giá ngưỡng cảnh báo ([`docs/Tasks/Supplies/TASK-005_backend_supplies_service.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Supplies/TASK-005_backend_supplies_service.MD)).
- [ ] **Task 2.4 (`TASK-015` — Backend):** Xây dựng mô hình Prisma `Incident`, `IncidentLog`, động cơ khử trùng lặp và chính sách Auto-Closure an toàn ([`docs/Tasks/Operations/TASK-015_backend_incident_lifecycle.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Operations/TASK-015_backend_incident_lifecycle.MD)).
- [ ] **Task 2.5 (`TASK-002` — Backend):** Xây dựng model Prisma `Task`, `TaskActivityLog`, service xử lý CRUD, dời lịch, ghi chú và REST API ([`docs/Tasks/Operations/TASK-002_backend_task_api.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Operations/TASK-002_backend_task_api.MD)).
- [ ] **Task 2.6 (`TASK-007` — Backend):** Động cơ Telemetry chênh lệch bộ đếm, tính downtime/availability/MTBF và thuật toán Lemon Devices ([`docs/Tasks/Analytics/TASK-007_backend_telemetry_engine.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Analytics/TASK-007_backend_telemetry_engine.MD)).
- [ ] **Task 2.7 (`TASK-009` — Backend):** Backend cấu hình Settings, lệnh test Zabbix `apiinfo.version` và Từ điển mã lỗi ([`docs/Tasks/Settings/TASK-009_backend_settings_error_dictionary.MD`](file:///f:/Code/Github/Monitoring/docs/Tasks/Settings/TASK-009_backend_settings_error_dictionary.MD)).

#### Bước 4: Chuyển Đổi Sang API Thật & Tích Hợp Toàn Diện
- [ ] Đổi cấu hình `DATA_SOURCE = "api"`.
- [ ] Xác nhận toàn bộ component UI kết nối API thật mượt mà, **không phải sửa đổi bất kỳ component nào**.
- [ ] Chạy kiểm thử tích hợp (Integration Tests) và đo lường hiệu năng theo [`docs/Test/PERFORMANCE_TESTS.MD`](file:///f:/Code/Github/Monitoring/docs/Test/PERFORMANCE_TESTS.MD).

---

## 5. Ma Trận Quản Trị Rủi Ro (Risks & Mitigations)

| Rủi ro kỹ thuật / nghiệp vụ | Mức độ ảnh hưởng | Chiến lược giảm thiểu rủi ro |
| :--- | :---: | :--- |
| **Giao diện không đúng ý người dùng sau khi đã code xong Backend** | Rất cao | **Đã triệt tiêu hoàn toàn** bằng chiến lược Frontend-First với Mock Data: nghiệm thu UI xong mới làm Backend. |
| **Xung đột kiểu dữ liệu giữa Mock và API thật** | Cao | Sử dụng chung một hợp đồng giao diện [`docs/Build/API_CONTRACT.MD`](file:///f:/Code/Github/Monitoring/docs/Build/API_CONTRACT.MD) và chung các TypeScript interfaces. |
| **Zabbix API gián đoạn kết nối hoặc quá tải** | Cao | Sử dụng In-memory Cache TTL 60s, hiển thị trạng thái `Stale` thay vì báo lỗi toàn trang. |
