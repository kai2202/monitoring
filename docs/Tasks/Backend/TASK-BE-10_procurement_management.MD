# TASK-BE-10: Supplies Procurement & Replacement Requests

> **Phân hệ:** Backend / Procurement Management  
> **Mã nhiệm vụ:** TASK-BE-10 (Giai đoạn 10 / 18)  
> **Trạng thái:** ✅ Hoàn thành (Completed)  
> **Căn cứ kiến trúc:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [docs/hr.MD](file:///f:/Code/Github/Monitoring/docs/hr.MD)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Triển khai quy trình tiếp nhận và quản lý nhu cầu mua sắm vật tư tiêu hao phát sinh từ thực tế vận hành máy in:

1. **Tiếp nhận yêu cầu vật tư từ hiện trường:**
   - Kỹ thuật viên (KTV) khi thực hiện bảo trì có thể đề xuất cấp phát hoặc mua mới vật tư đặc thù.
   - Thuật toán D-Day trượt 7 ngày tự động tổng hợp danh sách các hộp mực sắp cạn kiệt (`[D-4]`, `[D-7]`) để chuyển thành danh mục đề xuất mua sắm định kỳ.
2. **Quản lý đơn mua hàng (Purchase Order - PO):**
   - Tạo phiếu mua hàng gửi nhà cung cấp/phân phối chính hãng.
   - Theo dõi trạng thái đơn mua (`DRAFT` -> `PENDING_APPROVAL` -> `ORDERED` -> `RECEIVED`).
   - Cập nhật tự động vào kho khi nghiệm thu bàn giao vật tư.

---

## 2. Thiết Kế Hợp Đồng API & Dữ Liệu

- `GET /api/v1/procurement/requests`: Danh sách yêu cầu cấp phát & mua vật tư đang chờ xử lý.
- `POST /api/v1/procurement/requests`: KTV hoặc Admin tạo yêu cầu mua sắm mới.
- `POST /api/v1/procurement/orders`: Lập đơn đặt hàng PO gửi đối tác.
- `POST /api/v1/procurement/orders/:id/receive`: Xác nhận hàng đã nhập kho và đối chiếu thực nhận.

---

## 3. Tiêu Chí Nghiệm Thu Chi Tiết

- [x] CSDL Prisma lưu trữ bảng `ProcurementRequest` và `PurchaseOrder`.
- [x] Tích hợp cảnh báo D-Day vào danh mục vật tư đề xuất mua và tự động nhập kho khi nhận hàng.
- [x] Tuân thủ Rule 7.1 (< 300 LOC/file) và RBAC 3 vai trò.

