# TASK-BE-01: Backend Foundation & Modular Architecture

> **Phân hệ:** Backend / Architecture Foundation  
> **Mã nhiệm vụ:** TASK-BE-01 (Giai đoạn 1 / 18 trong Master Roadmap)  
> **Phiên bản:** 2.0.0 (Modular Monolith, On-Premises LAN-Only)  
> **Trạng thái:** ✅ Hoàn thành  
> **Tài liệu liên quan:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [Kiến Trúc Hệ Thống](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Thiết lập nền móng kiến trúc Backend vững chắc theo chuẩn **Modular Monolith**, tối ưu hóa cho mô hình triển khai **On-Premises (LAN-Only)** trên máy chủ Ubuntu Server nội bộ:

1. **Khung Công Nghệ Lõi:** Node.js (LTS), Express 4.x, TypeScript 5.x với cấu hình `strict: true`.
2. **Bảo Mật Tầng Mạng Nội Bộ:**
   - Cấu hình `helmet` bảo vệ HTTP headers.
   - Giới hạn tần suất gọi API với `express-rate-limit` (100 req/min cho IP nội bộ).
   - Thiết lập CORS chỉ cho phép Origin từ Frontend React nội bộ (cổng Nginx hoặc port 3000/5173).
3. **Cấu Trúc Điều Hướng Phi Tập Trung (Modular Routing):**
   - Đặt tiền tố API chuẩn: `/api/v1/...`.
   - Phân tách router độc lập theo domain nghiệp vụ:
     - `/api/v1/auth`: Xác thực và cấp mới token.
     - `/api/v1/printers`: Danh mục máy in và vị trí tầng/phòng ban.
     - `/api/v1/telemetry`: Dữ liệu đo lường chuẩn hóa từ Zabbix.
     - `/api/v1/tasks`: Quản trị vòng đời bảo trì CMMS.
     - `/api/v1/analytics`: Báo cáo sản lượng SVG, D-Day và chi phí.
     - `/api/v1/settings`: Quản trị từ điển mã lỗi và trạng thái Zabbix.
     - `/api/v1/integrations`: Endpoint tiếp nhận Zabbix Webhook.
4. **Quản Lý Cấu Hình & Biến Môi Trường:**
   - Thư viện `dotenv` kết hợp kiểm duyệt schema bằng `zod` (`config/envConfig.ts`).
   - Tự động ngắt khởi động và báo lỗi chi tiết nếu thiếu các biến môi trường bắt buộc (`PORT`, `DATABASE_URL`, `JWT_SECRET`, `ZABBIX_URL`, `ZABBIX_API_TOKEN`).
5. **Ghi Log Có Cấu Trúc & Vòng Đời Tắt An Toàn (Graceful Shutdown):**
   - Logging chuẩn JSON với `winston` / `pino` (hỗ trợ phân tách log error, access, zabbix-sync).
   - Lắng nghe tín hiệu `SIGTERM` và `SIGINT` để ngắt kết nối an toàn với PostgreSQL, dừng các Polling Workers trước khi thoát tiến trình.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Khởi chạy máy chủ Express TypeScript không có lỗi biên dịch `tsc`.
- [x] Endpoint kiểm tra sức khỏe `GET /health` trả về `{ status: "OK", uptime: ..., timestamp: ... }`.
- [x] Mọi yêu cầu không khớp route trả về chuẩn `ApiErrorResponse` mã `NOT_FOUND` kèm thông điệp tiếng Việt.
- [x] File mã nguồn tuân thủ giới hạn $< 300$ LOC theo AGENTS.md Rule 7.1.

