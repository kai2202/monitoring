# TASK-BE-15: Central Notification & Background Worker Engine

> **Phân hệ:** Backend / Notifications & Background Task Processing  
> **Mã nhiệm vụ:** TASK-BE-15 (Giai đoạn 15 / 18 trong Master Roadmap)  
> **Phiên bản:** 2.0.0 (Chuông thông báo nội bộ In-App, Background Cron Jobs)  
> **Trạng thái:** ✅ Hoàn thành  
> **Tài liệu liên quan:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [architecture.md](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Xây dựng hệ thống Thông báo tập trung và Động cơ xử lý tác vụ nền (Background Worker Engine) phục vụ hoạt động vận hành liên tục 24/7:

1. **Hệ Thống Thông Báo Nội Bộ In-App (Notification Bell Pipeline):**
   - Cung cấp API `GET /api/v1/notifications` và `PATCH /api/v1/notifications/:id/read` cho biểu tượng chuông thông báo trên Header.
   - Các kịch bản phát thông báo tự động theo vai trò:
     - **Admin IT/NOC:** Nhận thông báo khi xuất hiện mã lỗi mới chưa có trong từ điển (`FM-UNK-01`), khi KTV nộp hồ sơ xin nghiệm thu lệnh bảo trì, hoặc khi phát hiện máy in rớt mạng quá 10 phút.
     - **Field Tech:** Nhận thông báo khi được phân công lệnh bảo trì mới (`WorkOrderTask`), hoặc khi Admin từ chối nghiệm thu và yêu cầu làm lại (`Rework Required`).
     - **Asset HR:** Nhận thông báo khi vật tư chạm ngưỡng nguy cấp (`[D-3]`) hoặc hộp mực thải sắp đầy.
2. **Động Cơ Xử Lý Tác Vụ Nền Định Kỳ (Background Worker Engine):**
   - **Fast Polling Worker (Chu kỳ 30s):** Thu thập trạng thái sống ICMP và Active Problems từ Zabbix Server.
   - **Slow Polling Worker (Chu kỳ 1h):** Thu thập số đếm tích lũy Life Count và mức tiêu hao vật tư.
   - **Midnight Rollup Worker (Chạy lúc 00:05 mỗi đêm):** Tổng hợp delta sản lượng in ấn của ngày hôm trước cho toàn bộ ~100 máy in, ghi vào bảng `DailyRollup` (~36.500 dòng/năm) để giải phóng tải tính toán tức thì.
   - **D-Day Estimation Worker (Chạy mỗi 6 giờ):** Cập nhật lại tốc độ tiêu hao trượt 7 ngày và ước tính số ngày cạn kiệt cho từng hộp mực.
3. **Cơ Chế Phục Hồi & Quản Lý Lỗi Worker:**
   - Mỗi worker chạy độc lập trong tiến trình Node.js (In-Process Worker) với cơ chế bọc lỗi `try/catch` có cấu trúc; lỗi của một worker tuyệt đối không làm dừng tiến trình chính hoặc ảnh hưởng đến các worker khác.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Các thông báo nghiệp vụ được tạo tức thời và phân phối đúng đối tượng theo vai trò RBAC.
- [x] Worker tổng hợp sản lượng đêm (Midnight Rollup) hoàn thành trong $< 1$ giây cho ~100 máy in.
- [x] Tài nguyên CPU của hệ thống worker nền duy trì $< 3\%$ trên môi trường máy ảo.

