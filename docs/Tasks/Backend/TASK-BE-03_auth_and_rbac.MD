# TASK-BE-03: Authentication & RBAC Dual-Token (3 Roles)

> **Phân hệ:** Backend / Identity & Access Management (IAM)  
> **Mã nhiệm vụ:** TASK-BE-03 (Giai đoạn 3 / 18 trong Master Roadmap)  
> **Phiên bản:** 2.0.0 (Dual-Token JWT & HttpOnly Cookie, 3 Vai Trò Bắt Buộc)  
> **Trạng thái:** ✅ Hoàn thành  
> **Tài liệu liên quan:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [rbac_roles_and_ui_permissions_spec.md](file:///f:/Code/Github/Monitoring/docs/Design/rbac_roles_and_ui_permissions_spec.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Xây dựng hệ thống Xác thực người dùng và Kiểm soát truy cập dựa trên vai trò (Role-Based Access Control) đáp ứng tiêu chuẩn an toàn nội bộ:

1. **Cơ Chế Token Kép (Dual-Token Architecture):**
   - **Access Token:** Ký số JWT với thời hạn sống ngắn ($15\text{ phút}$), truyền qua tiêu đề `Authorization: Bearer <token>`.
   - **Refresh Token:** Lưu trữ trong cookie `HttpOnly`, `SameSite: Strict`, thời hạn sống $7\text{ ngày}$. Ngăn chặn hoàn toàn các cuộc tấn công đánh cắp token qua XSS.
   - Băm mật khẩu bằng thuật toán `bcrypt` an toàn với Salt Rounds = 10.
2. **Khóa Cứng 3 Vai Trò Chuẩn Hóa (Mandatory 3 Roles Guardrail):**
   - Hệ thống chỉ hỗ trợ đúng 3 vai trò:
     1. `ADMIN`: Quản trị viên IT & NOC — Toàn quyền cấu hình, duyệt nghiệm thu, điều chuyển thiết bị và quản lý người dùng.
     2. `FIELD_TECH`: Kỹ thuật viên bảo trì hiện trường — Tiếp nhận task được gán, thực hiện SOP, nạp ảnh test MinIO, không thấy số liệu chi phí tiền tệ.
     3. `ASSET_HR`: Chuyên viên Quản trị Tài sản & Chi phí — Quản lý kho vật tư, xem báo cáo sản lượng, hạch toán ngân sách phòng ban.
   - *Quy tắc tối cao: Tuyệt đối không tự ý bổ sung vai trò thứ tư.*
3. **Phân Quyền Thao Tác Lệnh Bảo Trì (Work Order Assignee Enforcement):**
   - Áp dụng middleware kiểm soát quyền sở hữu: Chỉ `ADMIN` và đúng KTV được phân công (`assignedToId === user.id`) mới có quyền bấm hoàn thành các bước SOP, tải ảnh nghiệm thu hoặc cập nhật trạng thái.
   - Các tài khoản KTV khác hoặc ASSET_HR khi mở chi tiết task chỉ có quyền xem (Read-Only) và ghi chú thảo luận tại mục "Thảo Luận & Nhật Ký Hoạt Động".
   - Khi Admin yêu cầu làm lại (Rework), cờ `reworkReason` được kích hoạt, task chuyển sang trạng thái "Cần làm lại" và chỉ Assignee mới được hoàn thành bước làm lại để gửi duyệt lại.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Đăng nhập trả về Access Token hợp lệ và set cookie `refreshToken` an toàn.
- [x] Endpoint `POST /api/v1/auth/refresh` cấp mới Access Token thành công khi cookie hợp lệ.
- [x] Middleware `requireRoles(['ADMIN'])` chặn các yêu cầu trái phép với mã lỗi 403 `FORBIDDEN`.
- [x] KTV không thể sửa task của KTV khác (chặn ở mức middleware backend).

