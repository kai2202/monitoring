# FleetMonitor — Danh Mục Nhiệm Vụ Kỹ Thuật (Master Task Registry)

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Tài liệu:** Sổ bộ phân loại và theo dõi nhiệm vụ phát triển (Tasks Master Index)  
> **Quy chuẩn:** Tuân thủ cấu trúc [task_template.MD](file:///f:/Code/Github/Monitoring/docs/Tasks/task_template.MD) và nguyên tắc AGENTS.md

---

## 1. Cấu Trúc Phân Cấp Thư Mục Tasks

Mọi tài liệu nhiệm vụ kỹ thuật của dự án FleetMonitor được quản lý tập trung và phân định ranh giới rõ ràng:

```text
docs/Tasks/
├── README.md                                      # Tài liệu này: Danh mục tổng hợp toàn bộ Tasks
├── task_template.MD                               # Bản mẫu chuẩn cho mọi task mới
├── Frontend/                                      # 4 Nhiệm vụ Frontend đã hoàn thành 100%
│   ├── TASK-FE-01_dashboard_overview.MD           # Dashboard Tổng Quan & Thước Đo Vận Hành NOC
│   ├── TASK-FE-02_printers_diagnostics_and_tasks.MD # Danh Mục Thiết Bị, Lịch Trình Gantt & Lệnh Bảo Trì
│   ├── TASK-FE-03_analytics_charts_and_rankings.MD # Biểu Đồ Sản Lượng, Dự Báo Vật Tư & SLA Chi Phí
│   └── TASK-FE-04_settings_error_dictionary_rules.MD # Quy Tắc Vận Hành NOC, Auto-Closure & Từ Điển CSV
└── Backend/                                       # 6 Nhiệm vụ Backend sẵn sàng triển khai
    ├── TASK-BE-01_zabbix_gateway.MD               # Zabbix 7.0 JSON-RPC Client & SNMP Collector
    ├── TASK-BE-02_cache_and_error_classification.MD # In-Memory Cache (TTL 60s) & Hardware Error Fallback
    ├── TASK-BE-03_maintenance_cmms.MD             # Maintenance Operations CMMS & MinIO S3
    ├── TASK-BE-04_analytics_rollup_engine.MD      # Printer Analytics & Rollup Aggregator
    ├── TASK-BE-05_error_dictionary_csv.MD         # Error Code Standardization (6 Hãng) & CSV Engine
    └── TASK-BE-06_rbac_data_scope.MD              # Multi-User RBAC (3 Roles) & Data Scope Middleware
```

---

## 2. Bảng Theo Dõi Tiến Độ Chi Tiết (Master Status Matrix)

### Phân Hệ Frontend (Frontend-First — Đã Hoàn Thành & Nghiệm Thu)

| Mã Task | Phân Hệ | Tài Liệu Chi Tiết | Trạng Thái | Tiêu Chuẩn Nghiệm Thu |
| :--- | :--- | :--- | :---: | :--- |
| **TASK-FE-01** | Dashboard | [TASK-FE-01.MD](file:///f:/Code/Github/Monitoring/docs/Tasks/Frontend/TASK-FE-01_dashboard_overview.MD) | ✅ Hoàn thành | KPI Bento động, Pure SVG Spline 24h, Bảng thiết bị phân trang 5 dòng. |
| **TASK-FE-02** | Printers | [TASK-FE-02.MD](file:///f:/Code/Github/Monitoring/docs/Tasks/Frontend/TASK-FE-02_printers_diagnostics_and_tasks.MD) | ✅ Hoàn thành | FleetHealthBar 4 phân đoạn, Gantt nới ô 240px, Modals quản trị Admin, Drawer 2 tab. |
| **TASK-FE-03** | Analytics | [TASK-FE-03.MD](file:///f:/Code/Github/Monitoring/docs/Tasks/Frontend/TASK-FE-03_analytics_charts_and_rankings.MD) | ✅ Hoàn thành | Single Source of Truth, Cột Ngang 100%, Pinned Sandbox, D-Day `[D-4]`, Arc 180°. |
| **TASK-FE-04** | Settings | [TASK-FE-04.MD](file:///f:/Code/Github/Monitoring/docs/Tasks/Frontend/TASK-FE-04_settings_error_dictionary_rules.MD) | ✅ Hoàn thành | 4 Sub-tabs điều hướng, Live Ping Latency, RBAC 3 vai trò, Từ điển CSV UTF-8. |

### Phân Hệ Backend (Chuẩn Bị Tích Hợp Cơ Sở Dữ Liệu & Zabbix)

| Mã Task | Phân Hệ | Tài Liệu Chi Tiết | Trạng Thái | Tiêu Chuẩn Kỹ Thuật |
| :--- | :--- | :--- | :---: | :--- |
| **TASK-BE-01** | Gateway | [TASK-BE-01.MD](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-01_zabbix_gateway.MD) | ⏳ Sẵn sàng | Fast Polling 30s ICMP/Triggers, Slow Polling 1h Counters, Safe Window 10m. |
| **TASK-BE-02** | Core | [TASK-BE-02.MD](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-02_cache_and_error_classification.MD) | ⏳ Sẵn sàng | In-Memory Cache TTL 60s (<10MB RAM, <5ms UI), Fallback `FM-UNK-01`. |
| **TASK-BE-03** | Operations | [TASK-BE-03.MD](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-03_maintenance_cmms.MD) | ⏳ Sẵn sàng | CMMS 3 tầng (Ticket -> Task -> Work Log), MinIO S3 Presigned URLs, Chi phí VNĐ. |
| **TASK-BE-04** | Telemetry | [TASK-BE-04.MD](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-04_analytics_rollup_engine.MD) | ⏳ Sẵn sàng | Rollup giờ/ngày, Thuật toán 3 trạng thái tính delta (32-bit rollover), D-Day trượt 7 ngày. |
| **TASK-BE-05** | Settings | [TASK-BE-05.MD](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-05_error_dictionary_csv.MD) | ⏳ Sẵn sàng | Nạp CSV 6 hãng, kiểm duyệt Dry-Run 2 bước & Giao dịch nguyên tử (Atomic Commit). |
| **TASK-BE-06** | Security | [TASK-BE-06.MD](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-06_rbac_data_scope.MD) | ⏳ Sẵn sàng | Multi-User RBAC (3 Roles: `ADMIN`, `FIELD_TECH`, `ASSET_HR`), Tiêm SQL Data Scope. |

