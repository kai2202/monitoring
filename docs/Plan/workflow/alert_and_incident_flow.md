# FleetMonitor — Luồng Cảnh Báo & Xử Lý Sự Cố Phần Cứng (Alert & Incident Flow)

> **Phân hệ:** Monitoring & Diagnostics Layer  
> **Tham chiếu kỹ thuật:** `TASK-BE-01`, `TASK-BE-02`, `AGENTS.md Rule 5 & 6`

---

## 1. Cơ Chế Thu Thập & Lọc Nhiễu Mạng (Safe Window 10 Phút)

Trong môi trường mạng doanh nghiệp phân tán (Trụ sở chính 7 tầng và các chi nhánh kết nối qua VPN), hiện tượng chập chờn sóng WiFi hoặc ngắt kết nối tạm thời diễn ra phổ biến. FleetMonitor áp dụng **Cơ chế Cửa Sổ An Toàn (Safe Window 10m)** để triệt tiêu báo động giả:

```text
       Mất gói ICMP lần đầu
                 │
                 ▼
       ┌───────────────────┐        Phục hồi trong < 10 phút
       │  Bắt đầu bấm giờ  │ ──────────────────────────────────> HỦY CẢNH BÁO
       │  Safe Window 10m  │                                      (Trạng thái vẫn Online)
       └─────────┬─────────┘
                 │
                 ▼ Mất kết nối liên tục >= 10 phút
       ┌───────────────────┐
       │   XÁC NHẬN OFFLINE │ ──────────────────────────────────> Kích hoạt Incident & Thông báo NOC
       └───────────────────┘
```

---

## 2. Quy Trình Phân Loại Lỗi Phần Cứng (Hardware Error Classification Engine)

Khi Zabbix nhận được Trap cảnh báo hoặc OID mã lỗi, bộ phân loại Backend tự động xử lý:

### 2.1 Bóc tách mã lỗi hãng (Raw Vendor Code Extraction)
- Firmware máy in trả về chuỗi mã lỗi kỹ thuật (Ví dụ: Ricoh `SC541`, Canon `E000`, HP `50.1`).
- Hệ thống luôn bảo toàn nguyên vẹn mã gốc trong trường `raw_vendor_code` để phục vụ công tác chẩn đoán sâu.

### 2.2 Ánh xạ sang 10 Phân Hệ Cơ Điện Tử Lõi
- **`FM-FUS-xx`**: Cụm sấy (Fuser Roller, Đèn sấy, Cảm biến nhiệt Thermistor).
- **`FM-OPT-xx`**: Khối quang học & Laser (Polygon Mirror Motor, Laser Diode, Thấu kính).
- **`FM-DRM-xx`**: Khối tạo ảnh & Trống (Drum Unit, Thanh gạt mực thải, Cao áp sạc).
- **`FM-DEV-xx`**: Khối từ & Cụm mực (Developer Unit, Cảm biến nồng độ từ TD Sensor).
- **`FM-PPR-xx`**: Cơ cấu kéo nạp giấy (Paper Feed Roller, Khay nâng giấy, Rơ-le tách giấy).
- **`FM-TRS-xx`**: Băng tải trung gian & Cao áp tách (Transfer Belt, Transfer Roller).
- **`FM-SCN-xx`**: Khối quét hình ảnh & Khay nạp bản gốc tự động (Scanner Flatbed, ADF).
- **`FM-PWR-xx`**: Khối cấp nguồn & Bo mạch chính (Power Supply Unit, Mainboard, Quạt tản nhiệt).
- **`FM-FIN-xx`**: Bộ dập ghim & Hoàn thiện bản in (Finisher, Stapler, Khay đảo mặt Duplex).
- **`FM-NET-xx`**: Cổng mạng & Giao tiếp (NIC, Cáp mạng LAN, Controller).

### 2.3 Cơ chế Fallback an toàn (`FM-UNK-01`)
- Nếu mã lỗi chưa có trong từ điển CSV, hệ thống **tuyệt đối không bịa đặt mô tả lỗi**.
- Gán mã nội bộ `FM-UNK-01` ("Lỗi phần cứng chưa được định nghĩa").
- Đặt cờ `needs_mapping_review: true` và tự động đẩy vào hàng đợi kiểm duyệt Unmapped Queue để Quản trị viên IT cập nhật từ điển qua giao diện `/settings/dictionary`.

---

## 3. Quy Tắc Khóa Cứng Tự Động Đóng Sự Cố (Auto-Closure Safety Policy)

Theo quy định bắt buộc tại **AGENTS.md Rule 6**, hệ thống thiết lập hàng rào bảo vệ tuyệt đối:

| Loại Sự Cố | Có Được Tự Động Đóng (Auto-Close)? | Điều Kiện Đóng Sự Cố |
| :--- | :---: | :--- |
| **Sự cố Phần Cứng Nghiêm Trọng (`Critical`)**<br>(Ví dụ: Cháy cụm sấy, vỡ bánh răng, hỏng bo nguồn) | 🛑 **TUYỆT ĐỐI CẤM** | Bắt buộc phải có Kỹ thuật viên hiện trường đến kiểm tra, thực thi SOP, tải ảnh in test và được Admin IT bấm duyệt nghiệm thu. Một trigger Zabbix tự tắt KHÔNG chứng minh máy in đã hết hỏng. |
| **Sự cố Do Người Dùng Báo Cáo (`User-Reported`)**<br>(Ví dụ: Bản in bị vệt đen mờ, kẹt giấy liên tục) | 🛑 **TUYỆT ĐỐI CẤM** | Cần sự xác nhận trực tiếp của người sử dụng hoặc KTV bảo trì. |
| **Sự cố Tự Phục Hồi Nhẹ (`Operational Recoverable`)**<br>(Ví dụ: Đóng lại nắp máy in, nạp thêm giấy vào khay rỗng) | ✅ **Cho phép Auto-Close** | Tự động đóng sau khi cảm biến trạng thái trả về bình thường liên tục trong 5 phút. |

