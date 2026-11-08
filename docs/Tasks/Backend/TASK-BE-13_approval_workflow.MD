# TASK-BE-13: Enterprise Multi-Tier Approval Workflow

> **Phân hệ:** Backend / Approval Workflow Engine  
> **Mã nhiệm vụ:** TASK-BE-13 (Giai đoạn 13 / 18)  
> **Trạng thái:** ✅ Hoàn thành (Completed)  
> **Căn cứ kiến trúc:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [docs/hr.MD](file:///f:/Code/Github/Monitoring/docs/hr.MD)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Thiết lập cơ chế phê duyệt các quyết định vận hành và bảo trì trong FleetMonitor, bảo đảm phân định rõ trách nhiệm (Segregation of Duties):

1. **Phê duyệt đóng lệnh bảo trì (Task Acceptance Closure):**
   - Đã chuẩn hóa logic giao diện tại `WorkOrderDetailView.tsx`:
     + Khi task chưa hoàn tất: ẩn nút duyệt.
     + Khi KTV hoàn thành và gửi nghiệm thu: hiển thị nút "Phê duyệt đóng lệnh" và "Yêu cầu làm lại" cho Admin.
     + Khi Admin yêu cầu làm lại: tự động sinh bước SOP `[Làm lại]`, lùi tiến độ về 80%, KTV phải tick hoàn tất mới được gửi duyệt lại.
2. **Phê duyệt đề xuất mua vật tư / cấp phát phụ tùng:**
   - Admin hoặc HR phê duyệt các phiếu xuất kho linh kiện có giá trị cao trước khi KTV tiến hành thay thế.
3. **Nguyên tắc kiểm soát quyền lực:**
   - Người tạo lệnh hoặc KTV thực hiện không được phép tự đóng lệnh nghiệm thu.
   - Bắt buộc lưu vết lịch sử người duyệt (`approvedBy`), thời gian (`approvedAt`) và lý do nếu từ chối (`reworkReason`).

---

## 2. Thiết Kế Hợp Đồng API & Dữ Liệu

- `GET /api/v1/approvals/pending`: Danh sách các lệnh chờ nghiệm thu hoặc đơn xuất kho chờ duyệt.
- `POST /api/v1/tasks/:taskId/approve`: Quản trị viên/HR chấp thuận nghiệm thu đóng lệnh.
- `POST /api/v1/tasks/:taskId/rework`: Yêu cầu KTV làm lại kèm lý do bắt buộc.
- `GET /api/v1/approvals/history`: Lịch sử kiểm toán các quyết định phê duyệt.

---

## 3. Tiêu Chí Nghiệm Thu Chi Tiết

- [x] CSDL Prisma lưu trữ bảng `ApprovalAction` và cập nhật trạng thái `Task`.
- [x] Tích hợp đồng bộ với Notification Center trên giao diện và luồng Rework có lý do bắt buộc.
- [x] Tuân thủ Rule 7.1 (< 300 LOC/file) và RBAC 3 vai trò.

