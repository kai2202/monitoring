# TASK-BE-05: Telemetry Synchronization & Multi-Vendor Normalization

> **Phân hệ:** Backend / Telemetry Processing Engine  
> **Mã nhiệm vụ:** TASK-BE-05 (Giai đoạn 5 / 18 trong Master Roadmap)  
> **Phiên bản:** 2.0.0 (Thuật toán Delta Counter 3 trạng thái, D-Day trượt 7 ngày, Null-Safe)  
> **Trạng thái:** ✅ Hoàn thành  
> **Tài liệu liên quan:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [rfc3805_printer_mib.md](file:///f:/Code/Github/Monitoring/docs/snmp-oids/rfc3805_printer_mib.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Xây dựng bộ máy **Chuẩn hóa Số liệu Telemetry** tiếp nhận dữ liệu kỹ thuật từ Zabbix Gateway (TASK-BE-04) và quy đổi sang lược đồ thống nhất cho 6 thương hiệu máy in:

1. **Chuẩn Hóa Mức Vật Tư Tiêu Hao (Toner & Supplies Normalization):**
   - Phân tích bảng Zabbix Items theo chuẩn RFC 3805 (`prtMarkerSuppliesTable`).
   - Xử lý các giá trị đặc thù:
     - Giá trị $\ge 0$: Tính phần trăm $\text{Remaining} = \frac{\text{Level}}{\text{MaxCapacity}} \times 100\%$.
     - `-1`: Dung lượng không giới hạn / hoạt động bình thường $\to 100\%$.
     - `-2`: Mức không rõ (Unknown) $\to \text{null}$ (hiển thị `—`).
     - `-3`: Còn lại một ít (Some remaining) $\to 10\%$ kèm cảnh báo.
   - Hộp mực thải (Waste Toner Box): Chuẩn hóa về 3 mức hiển thị (`OK`, `WARNING` $\ge 80\%$, `CRITICAL_FULL` $100\%$).
2. **Thuật Toán Tính Sản Lượng Delta Chống Tràn 32-bit (3-State Delta Counter):**
   - Bộ đếm `prtMarkerLifeCount` chuẩn RFC 3805 sử dụng kiểu `Counter32` (giới hạn $2^{32}-1 \approx 4.29$ tỷ trang).
   - Áp dụng thuật toán 3 trạng thái:
     1. $\text{Current} \ge \text{Previous}$: $\Delta = \text{Current} - \text{Previous}$.
     2. $\text{Current} < \text{Previous}$ (Tràn số đếm hoặc thay thế bo Formatter): $\Delta = \text{Current}$ (ghi log cảnh báo reset counter).
     3. Khởi động lại / mất kết nối: Giữ nguyên số đếm tích lũy trước đó, không ghi đè giá trị rỗng.
3. **Thuật Toán Dự Báo Cạn Kiệt D-Day (Sliding 7-Day Window):**
   - Tính tốc độ tiêu hao trung bình ngày $V_{\text{daily}}$ của từng hộp mực dựa trên dữ liệu sản lượng và tỷ lệ hao hụt trong 7 ngày gần nhất.
   - Ước tính số ngày còn lại: $\text{D-Day} = \text{Round}\left(\frac{\text{Current Level}}{V_{\text{daily}}}\right)$.
   - Tạo huy hiệu cảnh báo trực quan: `[D-3]`, `[D-7]`, `[D-25]` phục vụ công tác lập kế hoạch mua sắm vật tư (TASK-BE-10).
4. **Tuân Thủ Tuyệt Đối AGENTS.md Rule 5 (Null-Safety):**
   - Giá trị thiếu từ Zabbix bắt buộc giữ là `null`, cấm thay bằng số `0`.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Tính toán chính xác phần trăm mực in của 6 hãng máy in qua các trường hợp biên.
- [x] Không xảy ra tình trạng sản lượng bị âm khi bộ đếm bị reset hoặc máy in thay linh kiện.
- [x] Huy hiệu D-Day được tính toán tự động sau mỗi chu kỳ Slow Polling 1 giờ.

