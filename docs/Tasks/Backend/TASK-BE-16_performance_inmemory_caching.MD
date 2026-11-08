# TASK-BE-16: In-Memory Caching (60s TTL) & High Performance

> **Phân hệ:** Backend / High Performance & Caching Layer  
> **Mã nhiệm vụ:** TASK-BE-16 (Giai đoạn 16 / 18 trong Master Roadmap)  
> **Phiên bản:** 2.0.0 (TTL 60s, RAM < 10MB, Phản hồi UI < 5ms, Stale Policy Trung Thực)  
> **Trạng thái:** ✅ Hoàn thành  
> **Tài liệu liên quan:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [AGENTS.md Rule 5 & 7](file:///f:/Code/Github/Monitoring/.agent/rules/AGENTS.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Thiết lập tầng bộ nhớ đệm nội bộ (In-Memory Cache Engine) nằm ngay trong tiến trình Backend Node.js, triệt tiêu gánh nặng gọi Zabbix API và truy vấn CSDL PostgreSQL lặp lại:

1. **Thông Số Vận Hành Tối Ưu Hóa (Key Metrics):**
   - **Thời gian sống mặc định (TTL):** Đúng **60 giây** theo quy chuẩn kiến trúc AGENTS.md Rule 7.
   - **Thời gian phản hồi giao diện:** Đạt tốc độ cực nhanh $< 5\text{ms}$ đối với danh sách thiết bị và KPI Dashboard khi nạp từ Cache.
   - **Dung lượng bộ nhớ tiêu thụ:** Chiếm dụng RAM $< 10\text{MB}$ cho toàn bộ hạm đội ~100 máy in.
2. **Chiến Lược Khóa & Hủy Bộ Đệm (Cache Invalidation & Tagging):**
   - Phân cấp khóa lưu trữ:
     - `printers:fleet_summary`: Danh mục tóm tắt ~100 máy in kèm trạng thái ICMP và mực in.
     - `printer:detail:<id>`: Chi tiết một máy in, OID telemetry và lịch sử 24h.
     - `dashboard:kpis`: Bộ chỉ số tổng hợp sản lượng, tỷ lệ in màu và máy in cảnh báo.
   - Cơ chế vô hiệu hóa chủ động (Active Invalidation): Khi có sự kiện Zabbix Webhook báo lỗi hoặc khi Admin tạo/sửa thông tin máy in, các khóa liên quan lập tức bị xóa để ép nạp dữ liệu mới.
3. **Chính Sách Dữ Liệu Đã Cũ Trung Thực (Stale Data Policy - AGENTS.md Rule 5 & 7):**
   - Khi kết nối tới Zabbix Server hoặc PostgreSQL gặp sự cố, Backend không làm sập ứng dụng mà kích hoạt chế độ **Serve Stale**: Trả về dữ liệu trong cache gần nhất kèm cờ `isStale: true`.
   - Frontend nhận cờ `isStale: true` và hiển thị huy hiệu màu hổ phách **Dữ liệu đã cũ** trên góc màn hình.
   - *Ranh giới bảo vệ:* Dữ liệu cũ không đồng nghĩa với máy in bị tắt nguồn (Offline); sự cố kết nối Zabbix không chứng minh thiết bị hỏng hóc.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Endpoint `GET /api/v1/printers` phản hồi $< 5\text{ms}$ ở lần gọi thứ hai (Cache Hit).
- [x] Dữ liệu trong Cache tự động hết hạn và làm mới sau đúng 60 giây.
- [x] Cờ `isStale: true` xuất hiện minh bạch khi giả lập mất kết nối với Zabbix Server.

