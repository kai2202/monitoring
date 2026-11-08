# TASK-BE-02: Database Architecture & Prisma Data Management

> **Phân hệ:** Backend / Database & Persistence Layer  
> **Mã nhiệm vụ:** TASK-BE-02 (Giai đoạn 2 / 18 trong Master Roadmap)  
> **Phiên bản:** 2.0.0 (PostgreSQL 16, Prisma ORM, Enterprise Audit Trail)  
> **Trạng thái:** ✅ Hoàn thành  
> **Tài liệu liên quan:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [storage_and_database_architecture.md](file:///f:/Code/Github/Monitoring/docs/Design/storage_and_database_architecture.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Thiết kế và chuẩn hóa lược đồ Cơ sở dữ liệu quan hệ **PostgreSQL 16** thông qua **Prisma ORM**, phục vụ toàn bộ các phân hệ giám sát kỹ thuật và quản trị nghiệp vụ:

1. **Ranh Giới Dữ Liệu Với Zabbix:**
   - Không sao chép nguyên trạng toàn bộ bảng History khổng lồ của Zabbix vào PostgreSQL.
   - Chỉ lưu trữ các bản ghi Snapshot gần nhất (`TelemetrySnapshot`) và dữ liệu tổng hợp theo chu kỳ (`DailyRollup`) phục vụ báo cáo biểu đồ Pure SVG.
2. **Các Mô Hình Dữ Liệu Cốt Lõi (Core Entities):**
   - **Tài khoản & Phân quyền:** `User` (Đúng 3 vai trò: `ADMIN`, `FIELD_TECH`, `ASSET_HR`), `RefreshToken`.
   - **Quản trị Tài sản & Thiết bị:** `Printer` (IP, MAC, Serial, Brand, Model, Building, Floor, Department, ZabbixHostId, Status).  
   - *Chuẩn hóa vị trí (LAN-Only):* Loại bỏ hoàn toàn thực thể `Branch` (Chi nhánh) để tránh nhầm lẫn mô hình đa chi nhánh. Hệ thống quản lý vị trí thuần túy theo cấu trúc một địa điểm duy nhất: `Building (Tòa nhà) -> Floor (Tầng 1 đến Tầng 5) -> Department (Phòng ban)`.
   - **Đo Lường & Sản Lượng:** `TelemetrySnapshot`, `DailyRollup` (LifeCount, MonoDelta, ColorDelta, DDayForecast).
   - **Từ Điển Mã Lỗi & Sự Cố:** `ErrorCodeMapping` (raw_vendor_code, internal_code `FM-...`, subsystem), `Incident` (severity, auto_closed, source).
   - **Bảo Trì CMMS Vòng Đời 3 Tầng:** `MaintenanceTicket`, `WorkOrderTask` (assigneeId, reworkReason, status), `WorkLog` (SOP steps, costVnd, proofImageUrl).
   - **Kho, Mua Sắm & Hợp Đồng:** `InventoryItem`, `WarehouseTransaction`, `Vendor`, `PurchaseOrder`, `LeaseContract`.
   - **Nhật Ký Kiểm Toán:** `AuditLog` (action, userId, entity, payload, ipAddress, timestamp).
3. **Chỉ Mục (Indexes) & Tính Toàn Vẹn:**
   - Đánh chỉ mục B-Tree trên các trường tìm kiếm và lọc thường xuyên: `(floor, department)`, `(printerId, recordedAt)`, `(status, assignedToId)`.
   - Ràng buộc khóa ngoại nghiêm ngặt, sử dụng `onDelete: Restrict` đối với các bảng tài chính và nghiệm thu để chống xóa nhầm chứng từ.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Lược đồ `prisma/schema.prisma` biên dịch thành công qua `npx prisma validate`.
- [x] Bản di chuyển dữ liệu (Prisma Migrations) thực thi mượt mà trên PostgreSQL 16.
- [x] Script nạp dữ liệu mẫu `seed.ts` khởi tạo đầy đủ 3 tài khoản mẫu chuẩn đại diện cho 3 vai trò, danh mục ~100 máy in phân bổ theo tầng và từ điển mã lỗi chuẩn.

