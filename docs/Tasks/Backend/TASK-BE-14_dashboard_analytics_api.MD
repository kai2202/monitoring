# TASK-BE-14: Executive Dashboard & Telemetry Analytics API

> **Phân hệ:** Backend / Analytics & Reporting API  
> **Mã nhiệm vụ:** TASK-BE-14 (Giai đoạn 14 / 18 trong Master Roadmap)  
> **Phiên bản:** 2.0.0 (Tối ưu hóa cho 100% Pure React SVG Charts, Role-Based Bento Dashboard)  
> **Trạng thái:** ✅ Hoàn thành  
> **Tài liệu liên quan:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [API_CONTRACT.MD](file:///f:/Code/Github/Monitoring/docs/Build/API_CONTRACT.MD)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Xây dựng bộ API phân tích và tổng hợp số liệu đo lường hiệu năng cao, tối ưu hóa để cung cấp dữ liệu cho các biểu đồ **100% Pure React SVG** trên giao diện:

1. **Chuỗi Thời Gian Sản Lượng (Soft Spline Analytics API):**
   - Endpoint: `GET /api/v1/analytics/trend?timeframe=24h|7d|30d&floor=T1`.
   - Tính toán chuỗi điểm dữ liệu thời gian thực kèm đối chiếu kỳ trước (`previousPeriod`) để hiển thị đường cong Cubic Bézier Spline 2.25px và vùng bóng mờ Gradient.
   - Tự động gắn mốc đỉnh tải (Peak Pill) chỉ ra giờ hoặc ngày có lượng in ấn cao nhất.
2. **Phân Bố Sản Lượng & Phân Tách Mono / Color (Stacked Bar API):**
   - Endpoint: `GET /api/v1/analytics/distribution?floor=T1`.
   - Tổng hợp số trang in Đen Trắng và Màu của từng thiết bị, phục vụ biểu đồ cột ngang xếp chồng và nút ghim đối chiếu 📌.
3. **Giám Sát Mức Vật Tư & Đếm Ngược D-Day (Radial Gauge & Supplies API):**
   - Endpoint: `GET /api/v1/analytics/supplies?floor=T1`.
   - Cung cấp tỷ lệ phần trăm CMYK cho đồng hồ đo hình bán nguyệt Arc 180° và danh sách huy hiệu đếm ngược `[D-4]`, `[D-7]` kèm tình trạng Hộp mực thải (Bình thường, Sắp đầy, Đầy).
4. **Đối Chiếu Trực Diện Sandbox 1:1 (Direct Comparison API):**
   - Endpoint: `GET /api/v1/analytics/compare?deviceIds=id1,id2`.
   - Chuẩn hóa hai chuỗi dữ liệu về cùng một thang đo và khoảng thời gian để Frontend render chồng hai đường cong SVG trực quan.
5. **Ma Trận Nhiệt Sự Cố & SLA Chi Phí (Heatmap & SLA API):**
   - Endpoint: `GET /api/v1/analytics/sla-cost?timeframe=30d`.
   - Phân tích mật độ hỏng hóc theo giờ trong tuần (7 ngày x 24 giờ) và tính toán tỷ lệ tuân thủ cam kết SLA xử lý sự cố.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Thời gian phản hồi của toàn bộ các API phân tích đạt $< 50\text{ms}$ khi truy vấn CSDL PostgreSQL.
- [x] Định dạng JSON trả về khớp hoàn hảo với các kiểu dữ liệu của Frontend Pure SVG Charts (`Frontend/src/types/analytics.ts`).
- [x] Tôn trọng phân quyền dữ liệu (Role-Based Bento Dashboard): Ẩn các trường chi phí tiền tệ đối với vai trò `FIELD_TECH`.

