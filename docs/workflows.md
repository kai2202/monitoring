# FleetMonitor — Quy Trình Vận Hành Cốt Lõi (Core Workflows)

> **Áp dụng cho:** `ADMIN`, `FIELD_TECH`, `ASSET_HR`  
> **Tuân thủ:** `AGENTS.md` Rule 5 & Rule 6

---

## Phần 1: Luồng Cảnh Báo & Xử Lý Sự Cố Phần Cứng (Alert & Incident Flow)

### 1.1 Cơ Chế Thu Thập Kép (Hybrid Ingestion)
- **Zabbix Webhook Push:** Tiếp nhận `Problem` & `Recovery` tức thời tại `POST /api/v1/integrations/zabbix-webhook`.
- **Fast Polling (30s):** Đối soát Triggers/ICMP (`problem.get`, `trigger.get`, `host.get`).
- **Slow Polling (1h):** Thu thập Life Count, Mực CMYK, Hộp mực thải (`item.get`, `history.get`).

### 1.2 Cửa Sổ An Toàn (Safe Window 10 Phút)
1. **Mất gói ICMP lần đầu:** Đánh dấu cảnh báo mềm `is_transient: true`, chưa tạo sự cố.
2. **Khôi phục trước 10 phút:** Tự động reset bộ đếm, giữ nguyên `Online`.
3. **Mất kết nối liên tục ≥ 10 phút:** Chuyển `Offline`, tạo Incident trong PostgreSQL và gửi thông báo.

### 1.3 Chuẩn Hóa Mã Lỗi & Loại Trừ Bắt Buộc
- Ánh xạ mã lỗi hãng (Ricoh SC, Canon E-code, HP Numeric...) sang mã nội bộ `FM-<SUBSYSTEM>-<INDEX>`, bảo toàn `raw_vendor_code`. Mã chưa có trong từ điển được gắn `FM-UNK-01` và cờ `needs_mapping_review: true`.
- **Loại trừ bắt buộc (`AGENTS.md` Rule 5.1):** Không tạo item, trigger hay incident cho trạng thái mở nắp cửa máy (`Cover/Door Open`) và khay giấy/hết giấy (`Paper Empty`).

---

## Phần 2: Vòng Đời Bảo Trì Khép Kín (CMMS Maintenance Lifecycle)

### 2.1 Mô Hình 3 Tầng
`1. Ticket / Incident (Sự cố phát sinh)` $\to$ `2. Task CMMS (Lệnh bảo trì & Gantt)` $\to$ `3. Work Log (Nhật ký thực địa, SOP, Vật tư & Chi phí VNĐ)`

### 2.2 Các Bước Vận Hành
1. **Phát sinh Task (`ADMIN`):** Tạo từ sự cố Zabbix hoặc thủ công từ Dashboard/Drawer (`Urgent`, `High`, `Medium`, `Low`, người phụ trách, hạn chót).
2. **Điều phối Gantt (`/printers/timeline`):** Task tự động xuất hiện trên lịch trình Gantt (ô có việc mở rộng `240px`).
3. **Thực thi (`FIELD_TECH`):** Lọc `[Việc của tôi]`, tick quy trình SOP, ghi nhận phụ tùng thay thế và tải ảnh hiện trường lên MinIO S3 (Presigned URL 15 phút).
4. **Nghiệm thu & Đóng lệnh (`ADMIN`):** Duyệt hoàn thành (`COMPLETED`) hoặc yêu cầu làm lại kèm lý do. Khi `COMPLETED`, task tự động chuyển sang **Kho Lịch Sử** và rời khỏi Gantt.
5. **Đối soát chi phí & tài sản (`ASSET_HR`):** Kiểm kê thiết bị, đối soát chi phí sửa chữa, vật tư và chi phí khác theo Tầng & Người quản lý đại diện.
