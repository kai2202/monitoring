# TASK-BE-11: Vendor Management & Support Communication Log

> **Phân hệ:** Backend / Vendor Management  
> **Mã nhiệm vụ:** TASK-BE-11 (Giai đoạn 11 / 18)  
> **Trạng thái:** ✅ Hoàn thành (Completed)  
> **Căn cứ kiến trúc:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [docs/hr.MD](file:///f:/Code/Github/Monitoring/docs/hr.MD)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Quản lý thông tin nhà cung cấp máy in và lưu trữ nhật ký trao đổi kỹ thuật với hãng (Vendor Communication Log):

1. **Danh bạ nhà phân phối & trung tâm bảo hành:**
   - Quản lý thông tin đối tác cung cấp thiết bị và dịch vụ (Ricoh Việt Nam, Canon An Khang, HP Partner, Xerox VN).
   - Hotline hỗ trợ kỹ thuật, email tiếp nhận ticket, kỹ sư phụ trách tài khoản.
2. **Nhật ký trao đổi hỗ trợ kỹ thuật (Vendor Communication Log):**
   - Đã tích hợp giao diện tại `WorkOrderVendorAndAttachments.tsx`.
   - Backend hỗ trợ lưu trữ chi tiết: Giờ gọi, người liên hệ của hãng, nội dung trao đổi, mã số Ticket/RMA của hãng.
3. **Đánh giá chất lượng dịch vụ đối tác:**
   - Đo lường thời gian đáp ứng (Response Time) và thời gian xử lý sự cố (MTTR) khi có sự tham gia của đối tác bên ngoài.

---

## 2. Thiết Kế Hợp Đồng API & Dữ Liệu

- `GET /api/v1/vendors`: Danh sách các nhà cung ứng & trung tâm dịch vụ.
- `POST /api/v1/vendors`: Khai báo nhà cung cấp mới.
- `GET /api/v1/vendors/:id/communications`: Toàn bộ lịch sử hỗ trợ kỹ thuật theo nhà cung cấp.
- `POST /api/v1/tasks/:taskId/vendor-logs`: Ghi nhận phiên trao đổi với hãng trong lệnh bảo trì.

---

## 3. Tiêu Chí Nghiệm Thu Chi Tiết

- [x] CSDL Prisma lưu trữ bảng `Vendor` và `VendorCommunicationLog`.
- [x] Kết nối chặt chẽ với Task CMMS và hồ sơ đối soát tài sản của HR.
- [x] Tuân thủ Rule 7.1 (< 300 LOC/file) và RBAC 3 vai trò.

