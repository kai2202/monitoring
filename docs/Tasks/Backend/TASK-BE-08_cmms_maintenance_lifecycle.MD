# TASK-BE-08: CMMS & Maintenance Lifecycle (Ticket -> Task -> Work Log)

> **Phân hệ:** Backend / CMMS & Maintenance Lifecycle  
> **Mã nhiệm vụ:** TASK-BE-08 (Giai đoạn 8 / 18 trong Master Roadmap)  
> **Phiên bản:** 2.0.0 (Vòng đời 3 tầng, MinIO Presigned URLs, Quy trình Rework & Phân quyền Assignee)  
> **Trạng thái:** ✅ Hoàn thành  
> **Tài liệu liên quan:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [maintenance_lifecycle.md](file:///f:/Code/Github/Monitoring/docs/Plan/workflow/maintenance_lifecycle.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Xây dựng hệ thống Quản lý Bảo trì Thiết bị Máy in (Computerized Maintenance Management System - CMMS) khép kín chuẩn doanh nghiệp:

1. **Khép Kín Vòng Đời Bảo Trì 3 Tầng (3-Tier Maintenance Lifecycle):**
   - **Tầng 1 - Phiếu Báo Sự Cố (`MaintenanceTicket`):** Khởi tạo tự động từ Incident phần cứng hoặc do Admin/Người dùng tạo thủ công khi phát hiện bản in bị mờ, kẹt giấy.
   - **Tầng 2 - Lệnh Công Tác Hiện Trường (`WorkOrderTask`):** Admin phê duyệt Ticket và tạo Task, chỉ định Kỹ thuật viên phụ trách (`assignedToId`), độ ưu tiên và thời hạn xử lý (SLA).
   - **Tầng 3 - Nhật Ký & Chứng Từ Nghiệm Thu (`WorkLog`):** KTV thực thi các bước SOP, ghi nhận mã linh kiện thay thế, hạch toán chi phí và tải chứng từ nghiệm thu.
2. **Lưu Trữ Chứng Từ Hiện Trường Lên MinIO S3 (Presigned URLs):**
   - Backend không nhận upload file nhị phân trực tiếp để tránh chiếm dụng RAM và CPU.
   - Cung cấp API `POST /api/v1/tasks/:id/proof-upload` tạo URL ký trước (Presigned PUT URL, hết hạn sau 15 phút) để Frontend tải thẳng ảnh chụp bản in test PASSED lên MinIO S3 nội bộ.
   - Lưu trữ đường dẫn ảnh an toàn vào bảng `WorkLog` làm căn cứ để Admin nghiệm thu.
3. **Phân Quyền Thao Tác & Xử Lý Yêu Cầu Làm Lại (Assignee Scope & Rework Engine):**
   - **Quyền thao tác Assignee:** Chỉ Admin và KTV được phân công mới có quyền hoàn thành các bước SOP hoặc nộp hồ sơ nghiệm thu; các người dùng khác chỉ có quyền xem (Read-Only) và gửi bình luận trong Activity Stream.
   - **Quy trình Yêu cầu Làm lại (Rework Workflow):**
     - Khi Admin từ chối nghiệm thu, bắt buộc nhập lý do (`reworkReason`).
     - Hệ thống tự động thêm bước làm lại `[Làm lại]: <Lý do>` ở trạng thái Pending.
     - Trạng thái Task chuyển thành "Cần làm lại" và thanh tiến độ tự động tụt xuống theo tỷ lệ bước chưa hoàn thành.
     - KTV bắt buộc hoàn thành bước làm lại này mới được bấm "Gửi duyệt nghiệm thu lại".

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Tạo thành công vòng đời 3 tầng từ Ticket $\to$ Task $\to$ Work Log với ràng buộc khóa ngoại chặt chẽ.
- [x] Presigned URL MinIO S3 tạo đúng thời hạn, hỗ trợ upload ảnh hiện trường mượt mà trong mạng LAN.
- [x] Quy trình Rework hoạt động chuẩn xác: tự động gán bước, giảm thanh tiến độ và khóa nút gửi duyệt cho đến khi KTV hoàn thành việc làm lại.

