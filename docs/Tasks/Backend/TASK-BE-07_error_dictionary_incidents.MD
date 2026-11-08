# TASK-BE-07: Error Code Standardization (6 Hãng) & Incidents

> **Phân hệ:** Backend / Diagnostics & Incident Management  
> **Mã nhiệm vụ:** TASK-BE-07 (Giai đoạn 7 / 18 trong Master Roadmap)  
> **Phiên bản:** 2.0.0 (Chuẩn hóa mã lỗi 10 phân hệ, CSV Dry-Run 2 bước, Khóa Auto-Close)  
> **Trạng thái:** ✅ Hoàn thành  
> **Tài liệu liên quan:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [alert_and_incident_flow.md](file:///f:/Code/Github/Monitoring/docs/Plan/workflow/alert_and_incident_flow.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Thiết lập hệ thống Chuẩn hóa Mã lỗi phần cứng và Quản lý Sự cố kỹ thuật cho 6 thương hiệu máy in (Ricoh, Canon, HP, Brother, Epson, Xerox):

1. **Chuẩn Hóa Bộ Mã Lỗi Nội Bộ (`FM-<SUBSYSTEM>-<INDEX>`):**
   - Ánh xạ mã lỗi thô của hãng (`raw_vendor_code`) sang 10 phân hệ cơ điện tử:
     - `FM-FUS-xx`: Cụm sấy (Fuser Roller, Đèn sấy, Cảm biến nhiệt Thermistor).
     - `FM-OPT-xx`: Khối quang học & Laser (Polygon Mirror Motor, Laser Diode).
     - `FM-DRM-xx`: Khối tạo ảnh & Trống (Drum Unit, Thanh gạt mực thải).
     - `FM-DEV-xx`: Khối từ & Cụm mực (Developer Unit, Cảm biến nồng độ từ).
     - `FM-PPR-xx`: Cơ cấu kéo nạp giấy (Paper Feed Roller, Khay nâng giấy).
     - `FM-TRS-xx`: Băng tải trung gian & Cao áp tách (Transfer Belt, Transfer Roller).
     - `FM-SCN-xx`: Khối quét hình ảnh & Khay nạp ADF (Scanner Flatbed, ADF).
     - `FM-PWR-xx`: Khối cấp nguồn & Bo mạch chính (Power Supply Unit, Mainboard).
     - `FM-FIN-xx`: Bộ dập ghim & Hoàn thiện bản in (Finisher, Stapler, Duplex).
     - `FM-NET-xx`: Cổng mạng & Giao tiếp (NIC, Cáp mạng LAN, Controller).
2. **Cơ Chế Fallback An Toàn Tuyệt Đối (`FM-UNK-01`):**
   - Khi gặp mã lỗi chưa được định nghĩa trong từ điển CSDL, Backend tuyệt đối không tự ý suy diễn hoặc bịa đặt mô tả lỗi (tuân thủ **AGENTS.md Rule 5 & 6**).
   - Tự động gán mã `FM-UNK-01` ("Lỗi phần cứng chưa được định nghĩa"), bảo toàn nguyên chuỗi `raw_vendor_code` và đặt cờ `needs_mapping_review: true` đẩy vào hàng đợi Unmapped Queue.
3. **Quản Lý Từ Điển Bằng CSV Dry-Run 2 Bước:**
   - Cung cấp API `POST /api/v1/settings/error-dictionary/import-csv` với cơ chế kiểm duyệt 2 bước:
     - **Bước 1 (Dry-Run):** Phân tích file CSV, kiểm tra cú pháp, báo cáo số dòng hợp lệ, số dòng trùng lặp và các lỗi định dạng mà chưa ghi vào CSDL.
     - **Bước 2 (Commit):** Chỉ sau khi Admin bấm xác nhận trên giao diện, dữ liệu mới được cập nhật vào PostgreSQL.
4. **Khóa Cứng An Toàn Tự Động Đóng Sự Cố (Auto-Closure Safety Guardrail):**
   - Sự cố phần cứng nghiêm trọng (`Critical`) tuyệt đối cấm Auto-Close. Khi Zabbix Trigger chuyển sang `OK`, Incident vẫn giữ trạng thái `IN_PROGRESS` cho đến khi KTV nạp ảnh in test và Admin duyệt đóng lệnh.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Ánh xạ chính xác các mã lỗi phổ biến (Ricoh SC541, Canon E000, HP 50.1) về đúng phân hệ `FM-FUS-...`.
- [x] Endpoint nhập CSV Dry-Run phát hiện lỗi cú pháp và trả về báo cáo chi tiết.
- [x] Tuyệt đối không sinh trường cấm `actionGuidance` trong API trả về (AGENTS.md Rule 6).

