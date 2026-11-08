# FleetMonitor — Lộ Trình 18 Giai Đoạn Backend & Master Task Registry

> **Căn cứ kiến trúc:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD) & [docs/Design/architecture.md](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md)  
> **Mô hình triển khai:** **On-Premises (LAN-Only)** tại máy chủ Ubuntu Server nội bộ (không Public IP, không Cloud, không VPN ngoài).  
> **Ranh giới cốt lõi:**  
> - **Zabbix 7.0 LTS:** Nền tảng duy nhất giao tiếp SNMP/ICMP với máy in đa hãng (Ricoh, Canon, HP, Brother, Epson, Xerox).  
> - **Backend Express/TypeScript:** Trung tâm xử lý nghiệp vụ, gọi Zabbix API (Pull định kỳ + Webhook Push bổ trợ), chuẩn hóa dữ liệu, quản trị PostgreSQL & MinIO S3, cung cấp REST API cho Frontend.  
> - **Frontend React 18:** Giao diện người dùng kết nối qua REST API Backend (không gọi trực tiếp Zabbix).  
> - **Hệ thống phân quyền:** Đúng **3 vai trò chuẩn hoá** (`ADMIN`, `FIELD_TECH`, `ASSET_HR`). Tuyệt đối không tự ý thêm vai trò thứ tư.

---

## Bảng Tổng Hợp 18 Giai Đoạn Backend (BE-01 đến BE-18)

| Giai Đoạn | Mã Nhiệm Vụ | Phân Hệ Nghiệp Vụ & Tên Task | Trạng Thái Hiện Tại | Minh Chứng Thực Tế Trong Codebase |
| :---: | :--- | :--- | :---: | :--- |
| **1** | [TASK-BE-01](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-01_backend_foundation.MD) | Backend Foundation & Modular Architecture | **HOÀN THÀNH (✅)** | Express TypeScript, Helmet, RateLimiter, Module routers `/api/v1/...` |
| **2** | [TASK-BE-02](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-02_database_architecture.MD) | Database Architecture & Prisma Data Management | **HOÀN THÀNH (✅)** | PostgreSQL 16 schema (`Backend/prisma/schema.prisma`), migrations, seed script, loại bỏ hoàn toàn Branch |
| **3** | [TASK-BE-03](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-03_auth_and_rbac.MD) | Authentication & RBAC Dual-Token (3 Roles) | **HOÀN THÀNH (✅)** | JWT Access Token (15m) + HttpOnly Refresh Cookie, bcrypt, 3 roles (`ADMIN`, `FIELD_TECH`, `ASSET_HR`) |
| **4** | [TASK-BE-04](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-04_zabbix_api_integration.MD) | Zabbix 7.0 JSON-RPC Client & Gateway | **HOÀN THÀNH (✅)** | `zabbixApiClient.ts`, fastPollingWorker (30s), slowPollingWorker (1h), Safe Window (10m), Webhook integration |
| **5** | [TASK-BE-05](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-05_telemetry_sync_normalization.MD) | Telemetry Synchronization & Multi-Vendor Normalization | **HOÀN THÀNH (✅)** | Chuẩn hóa counter OID RFC 3805, 3-state delta counter chống tràn 32-bit (`computeSafeCounterDelta`), D-Day trượt 7 ngày |
| **6** | [TASK-BE-06](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-06_printer_asset_management.MD) | Printer & Physical Asset Management | **HOÀN THÀNH (✅)** | CRUD máy in, lưu kho/giám sát lại, phân vùng vị trí tầng T1-T5/phòng ban, kiểm kê serial/MAC |
| **7** | [TASK-BE-07](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-07_error_dictionary_incidents.MD) | Error Code Standardization (6 Hãng) & Incidents | **HOÀN THÀNH (✅)** | Ánh xạ mã lỗi chuẩn `FM-...`, Fallback `FM-UNK-01`, nạp/xuất CSV Dry-Run 2 bước, khóa Critical Incident |
| **8** | [TASK-BE-08](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-08_cmms_maintenance_lifecycle.MD) | CMMS & Maintenance Lifecycle (Ticket -> Task -> Work Log) | **HOÀN THÀNH (✅)** | Quản lý vòng đời bảo trì 3 tầng, MinIO S3 Presigned URLs, phân quyền Assignee & Rework |
| **9** | [TASK-BE-09](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-09_inventory_warehouse.MD) | Consumables Inventory & Warehouse Management | **HOÀN THÀNH (✅)** | `InventoryItem`, `InventoryTransaction`, trừ kho tự động khi KTV thay vật tư, cảnh báo chạm ngưỡng tồn an toàn |
| **10** | [TASK-BE-10](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-10_procurement_management.MD) | Supplies Procurement & Replacement Requests | **HOÀN THÀNH (✅)** | `ProcurementRequest`, `PurchaseOrder`, tiếp nhận đề xuất KTV & D-Day, tự động nhập kho nghiệm thu PO |
| **11** | [TASK-BE-11](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-11_vendor_management.MD) | Vendor Management & Support Log | **HOÀN THÀNH (✅)** | `Vendor`, `VendorCommunicationLog` tích hợp trong Task bảo trì, lưu Ticket RMA và số hotline hãng |
| **12** | [TASK-BE-12](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-12_financial_budget_contract.MD) | Operating Cost, Budget Allocation & Lease Contracts | **HOÀN THÀNH (✅)** | `DepartmentBudget`, `PrinterContract`, `MonthlyExpenseSummary`, hạch toán TCO Mono/Color, bảo mật ẩn giá VNĐ với KTV |
| **13** | [TASK-BE-13](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-13_approval_workflow.MD) | Enterprise Multi-Tier Approval Workflow | **HOÀN THÀNH (✅)** | `ApprovalAction`, phê duyệt đóng lệnh nghiệm thu, xử lý trả về làm lại kèm lý do, phân định quyền hạn |
| **14** | [TASK-BE-14](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-14_dashboard_analytics_api.MD) | Executive Dashboard & Telemetry Analytics API | **HOÀN THÀNH (✅)** | Cung cấp REST API dữ liệu tổng hợp cho Pure SVG Charts (Spline 24h, Cột Ngang, Arc 180°, Heatmap) |
| **15** | [TASK-BE-15](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-15_notification_background_processing.MD) | Central Notification & Background Worker Engine | **HOÀN THÀNH (✅)** | Chuông thông báo mã lỗi chưa gán, thông báo task chờ duyệt nghiệm thu, background cron jobs |
| **16** | [TASK-BE-16](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-16_performance_inmemory_caching.MD) | In-Memory Caching (60s TTL) & High Performance | **HOÀN THÀNH (✅)** | `fleetMemoryCache.ts` TTL 60s, RAM < 10MB, UI phản hồi < 5ms, Stale Policy trung thực |
| **17** | [TASK-BE-17](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-17_security_audit_compliance.MD) | LAN-Only Security, Audit Logging & Tamper Resistance | **HOÀN THÀNH (✅)** | Ghi nhận `AuditLog`, bảo vệ chứng từ nghiệm thu không bị sửa đổi, bảo mật LAN nội bộ |
| **18** | [TASK-BE-18](file:///f:/Code/Github/Monitoring/docs/Tasks/Backend/TASK-BE-18_system_integration_acceptance.MD) | System Integration & Enterprise Acceptance Testing | **HOÀN THÀNH (✅)** | Vitest unit/integration test suites (cache, delta counter 32-bit rollover, error classification, RBAC), typecheck 100% |

---

## Ranh Giới Kỹ Thuật Bắt Buộc (Mandatory Technical Guardrails)

1. **Kiến trúc mạng:** **LAN-Only On-Premises**. Không phụ thuộc Cloud Server, không gửi dữ liệu ra ngoài Internet, truy cập qua IP nội bộ Ubuntu Server.
2. **Nền tảng giám sát:** **Zabbix 7.0 LTS** là thành phần duy nhất giao tiếp SNMP/ICMP với máy in. Backend không tự chạy SNMP poller trực tiếp tới thiết bị.
3. **Phân quyền 3 vai trò:** 
   - `ADMIN`: Quản trị viên IT & NOC.
   - `FIELD_TECH`: Kỹ thuật viên bảo trì hiện trường.
   - `ASSET_HR`: Chuyên viên Quản trị Tài sản & Chi phí in ấn.
   - *Tuyệt đối không tự ý thêm vai trò thứ 4.*
4. **Chuẩn hóa mã nguồn:** Mỗi tệp `.ts`/`.tsx` dưới 300 LOC (Rule 7.1), 100% FontAwesome (Rule 7.1), xử lý dữ liệu trung thực `MetricValue = number | null` (Rule 5), không thêm trường cấm `actionGuidance` (Rule 6).
