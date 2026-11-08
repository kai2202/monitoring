# TASK-BE-18: System Integration & Enterprise Acceptance Testing

> **Phân hệ:** Backend / Testing & System Acceptance  
> **Mã nhiệm vụ:** TASK-BE-18 (Giai đoạn 18 / 18)  
> **Trạng thái:** ✅ Hoàn thành (Completed)  
> **Căn cứ kiến trúc:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Thực hiện kiểm thử tích hợp toàn diện hệ thống FleetMonitor trên môi trường máy chủ **Ubuntu Server 26.04 LTS (LAN-Only)** nội bộ:

1. **Môi trường vận hành LAN nội bộ:**
   - Kiểm tra toàn bộ dịch vụ (Nginx, Express Backend, PostgreSQL, MinIO, Zabbix Server) chạy trơn tru trong mạng nội bộ công ty.
   - Không có bất kỳ request nào gửi ra ngoài Internet hoặc Cloud Server.
   - Truy cập giao diện thông qua IP nội bộ và port tiêu chuẩn.
2. **Kiểm thử tích hợp Zabbix Poller & Máy in thật:**
   - Kết nối với máy chủ Zabbix 7.0 LTS qua JSON-RPC API.
   - Xác minh Fast Polling 30s (ICMP, Triggers) và Slow Polling 1h (Counters, Supplies) với hạm đội ~100 máy in đa thương hiệu.
   - Xác minh cơ chế Safe Window 10m chống flapping trạng thái mạng.
3. **Kiểm thử nghiệm thu 3 vai trò (ADMIN, FIELD_TECH, ASSET_HR):**
   - Đăng nhập, kiểm tra Data Scope, quyền hạn giao diện và quyền truy cập API của từng vai trò theo đúng ma trận RBAC.

---

## 2. Tiêu Chí Nghiệm Thu Chi Tiết

- [x] Toàn bộ test suite Backend (Vitest) pass 100% không có lỗi.
- [x] Không có lỗ hổng bảo mật rò rỉ dữ liệu tài chính sang vai trò KTV.
- [x] Hệ thống hoạt động độc lập và ổn định trong mạng LAN nội bộ (Typecheck 0 lỗi).

