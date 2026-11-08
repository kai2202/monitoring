# TASK-BE-12: Operating Cost, Budget Allocation & Lease Contracts

> **Phân hệ:** Backend / Financial, Budget & Contract Management  
> **Mã nhiệm vụ:** TASK-BE-12 (Giai đoạn 12 / 18)  
> **Trạng thái:** ✅ Hoàn thành (Completed)  
> **Căn cứ kiến trúc:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [docs/hr.MD](file:///f:/Code/Github/Monitoring/docs/hr.MD)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Xây dựng hệ thống quản lý chi phí vận hành máy in (TCO), phân bổ định mức ngân sách phòng ban và theo dõi hợp đồng thuê máy in:

1. **Hạch toán chi phí in ấn (Operating Cost):**
   - Tính toán chi phí trang in Mono và Color dựa trên sản lượng thực tế (Rollup Daily Volume).
   - Tự động cộng dồn chi phí linh kiện thay thế từ Work Log của KTV và chi phí thuê máy cố định hàng tháng.
2. **Quản trị định mức ngân sách (Budget Quota Allocation):**
   - Thiết lập hạn mức chi phí hoặc số trang in cho từng phòng ban (Kế toán, Kinh doanh, Nhân sự, R&D).
   - Phát cảnh báo khi phòng ban sử dụng chạm ngưỡng 80% hoặc vượt 100% định mức tháng.
3. **Quản lý hợp đồng thuê và bảo hành thiết bị (Contracts):**
   - Theo dõi ngày bắt đầu, ngày kết thúc hợp đồng thuê máy in và điều khoản cam kết SLA.
   - Nhắc nhở trước 30 ngày khi máy in sắp hết hạn hợp đồng thuê để HR đàm phán gia hạn.

---

## 2. Thiết Kế Hợp Đồng API & Dữ Liệu

- `GET /api/v1/finance/costs/breakdown`: Bóc tách chi phí vận hành theo phòng ban và theo dòng máy in.
- `GET /api/v1/finance/budgets`: Danh sách định mức ngân sách phân bổ theo phòng ban/chi nhánh.
- `POST /api/v1/finance/budgets`: Thiết lập hoặc điều chỉnh định mức ngân sách in ấn.
- `GET /api/v1/contracts`: Danh mục hợp đồng thuê máy in và bảo dưỡng kỹ thuật.

---

## 3. Tiêu Chí Nghiệm Thu Chi Tiết

- [x] CSDL Prisma lưu trữ bảng `DepartmentBudget`, `PrinterContract` và `MonthlyExpenseSummary`.
- [x] Dữ liệu kết nối liền mạch với Biểu đồ Vòng cung chi phí 180° (`/analytics/sla-cost`) và ẩn giá VNĐ với KTV.
- [x] Tuân thủ Rule 7.1 (< 300 LOC/file) và RBAC 3 vai trò.

