# Hồ Sơ Thiết Bị & OID: Dòng Ricoh Aficio (MP 4002, MP 5002 & Generic)

> **Vị trí trong dự án:** Dữ liệu tham chiếu các dòng máy in Ricoh đơn sắc thế hệ trước (**Legacy Reference Models**)  
> **Trạng thái kiểm chứng:** **VERIFIED & TESTED** thực tế trên máy in IP `192.168.93.7` (Aficio MP 4002)  
> **Mục đích:** Lưu trữ đầy đủ kết quả đo đạc SNMP, OID private và đặc thù của dòng đơn sắc (Mono MFP) để phục vụ mở rộng trong tương lai.

---

## 1. Thông Tin Nhận Diện Phần Cứng

| Thuộc tính | Ricoh Aficio MP 4002 | Ricoh Aficio MP 5002 | Generic Aficio |
| :--- | :--- | :--- | :--- |
| **Hãng sản xuất** | Ricoh Company, Ltd. | Ricoh Company, Ltd. | Ricoh Company, Ltd. |
| **Dòng sản phẩm** | Aficio MP Series (Mono MFP) | Aficio MP Series (Mono MFP) | Aficio Gen 4/5 |
| **Tốc độ thiết kế** | 40 trang / phút (A4 đơn sắc) | 50 trang / phút (A4 đơn sắc) | 25–50 trang / phút |
| **IP thực nghiệm** | `192.168.93.7` (Lab Draw Room) | Khảo sát cấu hình Zabbix | Chung cho Aficio |
| **Phiên bản SNMP** | SNMP v2c (Read-Only) | SNMP v2c (Read-Only) | SNMP v2c |
| **Phiên bản Firmware**| `2.24` (`VERIFIED`) | `2.x` | `1.x - 2.x` |
| **Khung máy Serial** | `W533LB00080` (`VERIFIED`) | Theo thiết bị thực tế | `prtGeneralSerialNumber` |
| **Số khay nạp giấy** | 5 khay (Tray 1-4: 550, Bypass: 100) | 5 khay tương tự | 2–5 khay nạp |

---

## 2. Đặc Thù Của Dòng Máy In Đơn Sắc (Mono MFP)

1. **Chỉ có 1 hộp mực đen (Black Toner)**:
   - Cung cấp mức mực đen qua `prtMarkerSuppliesLevel` và OID private `1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.1` (**VERIFIED: 40%**).
   - OID mực màu Cyan, Magenta, Yellow (`...5.2..4`) trả về lỗi `No such name/oid` và được hệ thống đánh dấu là **`UNSUPPORTED`**.
2. **Cảnh báo vật tư thực tế đã ghi nhận**:
   - `Replace Cleaning Web {30402}` (Cuộn lau sấy) — Warning.
   - `Replace Fusing Unit {30405}` (Cụm sấy) — Warning.
   - Cờ lỗi sao chụp `ricohCopyErrorSummary` (`1.3.6.1.4.1.367.3.2.1.2.2.22.0`) = `1` phản ánh cảnh báo này.

---

## 3. Bảng Tra Cứu OID Private Dòng Ricoh Aficio

Nhánh Enterprise OID: `.1.3.6.1.4.1.367` (`iso.org.dod.internet.private.enterprises.ricoh`)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Ý nghĩa kỹ thuật | Trạng thái | Giá trị thực nghiệm |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `1.3.6.1.4.1.367.3.2.1.1.1.1.0` | `ricohPrinterModel` | DisplayString | Tên định danh model máy in Ricoh | **VERIFIED** | `Aficio MP 4002` |
| `1.3.6.1.4.1.367.3.2.1.1.1.2.0` | `ricohFirmwareVersion` | DisplayString | Phiên bản firmware điều khiển hệ thống | **VERIFIED** | `2.24` |
| `1.3.6.1.4.1.367.3.2.1.2.1.4.0` | `ricohEngineSerialNumber` | DisplayString | Số serial phần cứng khung máy động cơ | **VERIFIED** | `W533LB00080` |
| `1.3.6.1.4.1.367.3.2.1.2.2.11.0` | `ricohScannerShareStatus` | INTEGER | Trạng thái sẵn sàng của khối quét Scanner | **VERIFIED** | `1` (1=Available / Sẵn sàng) |
| `1.3.6.1.4.1.367.3.2.1.2.2.12.0` | `ricohScannerGlassPaperStatus` | INTEGER | Cảm biến phát hiện giấy trên mặt kính | **VERIFIED** | `1` (1=Không có giấy, 2=Có bản gốc) |
| `1.3.6.1.4.1.367.3.2.1.2.2.13.0` | `ricohScannerErrorStatus` | INTEGER | Trạng thái lỗi phần cứng Scanner/ADF | **VERIFIED** | `0` (0=Bình thường) |
| `1.3.6.1.4.1.367.3.2.1.2.2.18.0` | `ricohScannerErrorSummary` | INTEGER | Bitmask cảnh báo ứng dụng quét Scanner | **VERIFIED** | `0` (0=Không có cảnh báo) |
| `1.3.6.1.4.1.367.3.2.1.2.15.1.0` | `ricohAdfType` | INTEGER | Định danh chủng loại khay nạp bản gốc ADF | **VERIFIED** | `4` (ARDF Type 4) |
| `1.3.6.1.4.1.367.3.2.1.2.2.20.0` | `ricohMfpErrorSummary` | INTEGER | Bitmask lỗi hệ thống nền tảng MFP | **VERIFIED** | `0` (0=Sạch, không lỗi SC) |
| `1.3.6.1.4.1.367.3.2.1.2.2.22.0` | `ricohCopyErrorSummary` | INTEGER | Bitmask cảnh báo ứng dụng sao chụp Copier | **VERIFIED** | `1` (Cảnh báo Web/Fusing) |
| `1.3.6.1.4.1.367.3.2.1.2.19.1.0` | `ricohTotalCopies` | Counter32 | Tổng số bản copy/in lũy kế trọn đời | **VERIFIED** | `853193` trang |
| `1.3.6.1.4.1.367.3.2.1.2.19.2.0` | `ricohPrinterModeCopies` | Counter32 | Bộ đếm trang in qua mạng (Print driver) | **VERIFIED** | `427014` trang |
| `1.3.6.1.4.1.367.3.2.1.2.19.3.0` | `ricohFaxModeCopies` | Counter32 | Bộ đếm trang in từ bản fax nhận được | **VERIFIED** | `22113` trang |
| `1.3.6.1.4.1.367.3.2.1.2.19.4.0` | `ricohCopierModeCopies` | Counter32 | Bộ đếm trang sao chụp trực tiếp qua kính | **VERIFIED** | `404050` trang |
| `1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.1` | `ricohBlackTonerPercent` | INTEGER | Mức mực đen Ricoh Private (% thực tế) | **VERIFIED** | `40` (40% Black Toner) |
| `1.3.6.1.2.1.43.11.1.1.9.1.2` | `wasteTonerLevel` (RFC 3805) | INTEGER | Cảm biến hộp mực thải | **VERIFIED** | `100` (Max: 100) |
