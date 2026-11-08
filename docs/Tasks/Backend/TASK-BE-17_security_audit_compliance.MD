# TASK-BE-17: LAN-Only Security, Audit Logging & Tamper Resistance

> **Phân hệ:** Backend / Security, Compliance & Audit Trail  
> **Mã nhiệm vụ:** TASK-BE-17 (Giai đoạn 17 / 18 trong Master Roadmap)  
> **Phiên bản:** 2.0.0 (Bảo mật mạng LAN nội bộ, Sổ cái Audit Log chống sửa đổi)  
> **Trạng thái:** ✅ Hoàn thành  
> **Tài liệu liên quan:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [AGENTS.md Rule 4 & 10](file:///f:/Code/Github/Monitoring/.agent/rules/AGENTS.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Thiết lập cơ chế bảo mật nghiêm ngặt cho mô hình **On-Premises (LAN-Only)** và xây dựng hệ thống lưu vết kiểm toán (Audit Trail) chống làm sai lệch hồ sơ bảo trì:

1. **Bảo Mật Hệ Thống Trong Mạng LAN Nội Bộ:**
   - Hệ thống không sử dụng VPN ngoài, không cấp phát Public IP và không gửi bất kỳ dữ liệu nào lên Cloud Server bên thứ ba.
   - Giới hạn quyền truy cập cổng mạng: Chỉ mở cổng HTTP/HTTPS qua Reverse Proxy Nginx nội bộ; cổng PostgreSQL (5432), MinIO (9000), Zabbix (10051) chỉ cho phép truy cập cục bộ từ Docker Network hoặc localhost.
   - Kiểm duyệt đầu vào (Input Sanitization) bằng `zod` schema để triệt tiêu nguy cơ SQL Injection, Command Injection hoặc XSS nội bộ.
2. **Sổ Cái Nhật Ký Kiểm Toán Chống Can Thiệp (Tamper-Resistant Audit Trail):**
   - Mọi thao tác trọng yếu trên hệ thống bắt buộc được tự động ghi nhận vào bảng `AuditLog`:
     - Phê duyệt đóng lệnh bảo trì hoặc yêu cầu làm lại (Admin Review / Rework).
     - Điều chuyển vị trí máy in hoặc thay đổi thông số cấu hình.
     - Nạp mới hoặc sửa đổi từ điển mã lỗi phần cứng CSV.
     - Xuất kho phụ tùng hoặc tạo đơn yêu cầu mua sắm vật tư.
   - Cấu trúc bản ghi Audit Log: `(id, userId, role, action, entity, entityId, payloadBefore, payloadAfter, ipAddress, userAgent, createdAt)`.
   - **Quy tắc Bất Biến (Append-Only):** Bảng `AuditLog` chỉ hỗ trợ thao tác ghi thêm (`INSERT`), tuyệt đối cấm các câu lệnh sửa (`UPDATE`) hoặc xóa (`DELETE`) từ bất kỳ API hoặc vai trò người dùng nào.
3. **Bảo Vệ Tính Toàn Vẹn Của Chứng Từ Nghiệm Thu:**
   - Hình ảnh biên bản in test PASSED lưu trên MinIO S3 được gắn mã băm SHA-256 đối soát. KTV hoặc Admin không thể tự ý thay thế ảnh sau khi lệnh công tác đã được duyệt hoàn thành (`COMPLETED`).

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Thao tác duyệt hoặc yêu cầu làm lại Work Order sinh bản ghi `AuditLog` đầy đủ thông tin đối soát.
- [x] Không có bất kỳ endpoint API nào cho phép sửa đổi hoặc xóa các dòng trong bảng `AuditLog`.
- [x] Quét bảo mật mã nguồn không phát hiện lỗ hổng rò rỉ thông tin đăng nhập hoặc thông số Zabbix Token (AGENTS.md Rule 4).

