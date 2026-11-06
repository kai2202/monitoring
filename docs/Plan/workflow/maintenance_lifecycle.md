# FleetMonitor — Vòng Đời Bảo Trì Khép Kín (CMMS Maintenance Lifecycle)

> **Phân hệ:** Operations / Maintenance CMMS  
> **Áp dụng cho:** `ADMIN`, `FIELD_TECH`, `ASSET_HR`  
> **Tham chiếu kỹ thuật:** `TASK-FE-02`, `TASK-BE-03`, `docs/Design/storage_and_database_architecture.md`

---

## 1. Vòng Đời 3 Tầng Chuẩn CMMS (3-Tier Maintenance Lifecycle)

FleetMonitor phân định ranh giới nghiêm ngặt giữa **Tín hiệu cảnh báo kỹ thuật (Alert)**, **Vấn đề theo dõi (Incident/Ticket)** và **Công việc bảo trì khắc phục (Task/Work Order)**:

```text
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│     1. TICKET / INCIDENT │ ───>  │     2. TASK CMMS        │ ───>  │      3. WORK LOG        │
│   • Sự cố phát sinh     │       │   • Lệnh giao việc      │       │   • Nhật ký thực địa    │
│   • Mã lỗi SNMP / Vendor│       │   • Kỹ thuật viên phụ   │       │   • Các bước SOP %      │
│   • Thiết bị, vị trí    │       │     trách, hạn chót     │       │   • Phụ tùng linh kiện  │
│   • Thời điểm phát hiện │       │   • Lịch trình Gantt    │       │   • Ảnh in test PASSED  │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
```

---

## 2. Các Bước Vận Hành Chi Tiết

### Bước 1: Phát sinh Lệnh Bảo Trì (Task Creation)
- **Người thực hiện:** Duy nhất người dùng có vai trò `ADMIN` (Trưởng phòng IT / Kỹ sư NOC) có quyền tạo Task.
- **Nguồn tạo:**
  1. *Tự động (Zabbix Trigger):* Khi máy in gặp lỗi phần cứng nghiêm trọng (`Critical`) vượt ngưỡng Safe Window 10 phút.
  2. *Thủ công:* Admin bấm nút `[+ Lập lệnh]` từ Bảng Thiết bị cần xử lý (`AttentionDevicesTable`) hoặc từ Drawer Chẩn đoán.
- **Dữ liệu bắt buộc:** Thiết bị, tiêu đề sự cố, mức độ ưu tiên (`Urgent`, `High`, `Medium`, `Low`), Kỹ thuật viên được chỉ định (`assignedTo`), và hạn chót hoàn thành (`dueDate`).

### Bước 2: Hiển Thị Lịch Trình Gantt (Timeline Orchestration)
- Lệnh bảo trì tự động xuất hiện trên biểu đồ Gantt Timeline (`/printers/timeline`).
- **Nới rộng ô 240px:** Các ô ngày có công việc tự động nới rộng chiều rộng để hiển thị đầy đủ thẻ công việc mà không bị cắt chữ.
- **Chấm định vị phát sáng 'Hôm nay':** Đánh dấu trực quan ngày hiện tại trên thước đo thời gian.

### Bước 3: Kỹ Thuật Viên Thực Thi Quy Trình (Technician Execution)
- Kỹ thuật viên (`FIELD_TECH`) đăng nhập hệ thống, chọn nút `[Việc của tôi]` 1-click để lọc danh sách lệnh được giao.
- Mở Drawer Chẩn đoán, chuyển sang tab **Lệnh bảo trì**:
  1. *Dynamic Stepper:* Bấm chọn từng bước kiểm tra theo quy trình chuẩn SOP. Hệ thống tự động tính toán % hoàn thành (0% -> 25% -> 50% -> 75% -> 100%).
  2. *Ghi nhận phụ tùng:* Nhập danh mục phụ tùng thay thế (Cụm sấy, Băng tải cao su, Cò sấy, Rơ-le kéo giấy).
  3. *Tải bằng chứng in test (Test Print Proof):* Kỹ thuật viên chụp ảnh bản in test thực tế và tải lên. Ảnh được chuyển trực tiếp vào bucket `fleetmonitor-proofs` trên MinIO S3 thông qua Presigned URL bảo mật 15 phút.

### Bước 4: Nghiệm Thu & Đóng Lệnh (Review & Closure)
- Sau khi KTV hoàn tất 100% các bước SOP và tải ảnh in test, Task chuyển sang trạng thái chờ duyệt.
- Admin kiểm tra chất lượng ảnh in test trên modal `TestPrintReviewModal`:
  - **Chấp thuận (Approve):** Đánh dấu hoàn thành (`COMPLETED`).
  - **Yêu cầu làm lại (Reject):** Yêu cầu KTV kiểm tra lại cụm linh kiện kèm ghi chú kỹ thuật.
- Khi Task chuyển sang `COMPLETED`:
  - **Tự động chuyển vào Kho Lịch Sử (History Accordion).**
  - **Tự động xóa khỏi biểu đồ Gantt Timeline** để giữ lịch trình luôn tinh gọn, sạch sẽ.

### Bước 5: Đối Soát Hiệu Suất Nhân Sự (HR & Management Audit)
- Chuyên viên quản lý tài sản (`ASSET_HR`) truy cập phân hệ Bảo trì (`/printers/history`).
- Đối soát các chỉ số KPI: Thời gian trung bình khắc phục lỗi (MTTR), Tỷ lệ hoàn thành đúng hạn (SLA %), và tỷ lệ ảnh nghiệm thu đạt chuẩn ngay lần đầu.

