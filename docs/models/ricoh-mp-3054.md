# Hồ Sơ Thiết Bị & OID: Ricoh MP 3054 & Aficio MP 5002 (Mono MFP)

> **Vị trí trong dự án:** Thiết bị mở rộng thực tế (**Field Fleet Expansion**)  
> **Trạng thái kiểm chứng:** **VERIFIED** (Đã đo đạc thực tế qua SNMPv2c tại IP `192.168.31.250` - MP 5002 và `192.168.31.249` - MP 3054 - Chi nhánh Đà Nẵng)  
> **Tương thích dòng:** Ricoh MP 2554, MP 3054, MP 3554, MP 5002, MP 4002 (Dòng máy in đa năng đen trắng công nghiệp A3 của Ricoh).

---

## 1. Thông Tin Nhận Diện Phần Cứng

| Thuộc tính | Ricoh MP 3054 (Đà Nẵng 2) | Ricoh Aficio MP 5002 (Đà Nẵng 1) | Trạng thái |
| :--- | :--- | :--- | :---: |
| **Hãng sản xuất** | Ricoh Company, Ltd. | Ricoh Company, Ltd. | `VERIFIED` |
| **Dòng sản phẩm** | Ricoh MP 54 Series (Monochrome MFP) | Ricoh Aficio MP 02 Series (Monochrome MFP) | `VERIFIED` |
| **Model máy in** | Ricoh MP 3054 | Ricoh Aficio MP 5002 | `VERIFIED` |
| **Tốc độ thiết kế** | 30 trang / phút (A4 đơn sắc) | 50 trang / phút (A4 đơn sắc) | `DOCUMENTED` |
| **IP thực tế đo đạc** | `192.168.31.249` | `192.168.31.250` | `VERIFIED` |
| **Giao thức SNMP** | SNMP v2c (Community: `public`, Port 161) | SNMP v2c (Community: `public`, Port 161) | `VERIFIED` |
| **Enterprise OID Root** | `.1.3.6.1.4.1.367` (Ricoh Enterprise MIB) | `.1.3.6.1.4.1.367` (Ricoh Enterprise MIB) | `VERIFIED` |
| **Số Serial khung máy** | `G157L700046` | `W534L800247` | `VERIFIED` |
| **Phiên bản Firmware** | `1.16` | `2.18` | `VERIFIED` |

---

## 2. Đặc Thù Kỹ Thuật Đơn Sắc, Cấu Trúc Khay Giấy & Vật Tư

1. **Hộp mực đơn sắc (Black Toner Duy Nhất):**
   - Chỉ trang bị 1 hộp mực đen (Black Cartridge).
   - Truy xuất tự động qua bảng RFC 3805 `prtMarkerSuppliesTable` (MP 5002: 50%, MP 3054: 100%).
   - Các OID màu khác (Cyan, Magenta, Yellow) không tồn tại trên phần cứng đơn sắc.
2. **Cấu trúc khay nạp giấy 4 tầng (4 Trays + Bypass):**
   - **Tray 1:** Sức chứa 550 tờ, hiện có 165 tờ.
   - **Tray 2, 3, 4:** Sức chứa 550 tờ/khay, hiện đang rỗng giấy (kích hoạt cảnh báo `No Paper: Tray 2/3/4`).
   - **Bypass Tray:** Khay nạp tay đa năng, sức chứa 100 tờ.
3. **Cảm biến nắp máy đa điểm (5 Covers):**
   - Giám sát đồng thời 5 vị trí: `Front Cover`, `Duplex Unit` (khối đảo mặt), `Upper Right Cover`, `Lower Right Cover`, `Auto Document Feeder Cover` (nắp ADF nạp bản gốc).

---

## 3. Danh Mục OID Tiêu Chuẩn & Chuyên Sâu Đã Đo Đạc Thực Tế

### 3.1 Nhận Diện, Trạng Thái & Lỗi Phần Cứng (RFC 1213 & RFC 2790)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Giá trị thực tế đo đạc | Ý nghĩa kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `1.3.6.1.2.1.1.1.0` | `sysDescr` | DisplayString | `RICOH MP 3054 ...` | Tên đầy đủ hệ thống và firmware | `VERIFIED` |
| `1.3.6.1.2.1.1.5.0` | `sysName` | DisplayString | `MP 3054` | Tên định danh thiết bị mạng | `VERIFIED` |
| `1.3.6.1.2.1.1.3.0` | `sysUpTime` | TimeTicks | Uptime máy in | Thời gian máy chạy liên tục | `VERIFIED` |
| `1.3.6.1.2.1.25.3.5.1.1.1` | `hrPrinterStatus` | INTEGER | `3` (`idle`) | Trạng thái máy in: `3`=Sẵn sàng | `VERIFIED` |
| `1.3.6.1.2.1.25.3.5.1.2.1` | `hrPrinterDetectedErrorState` | BITS (Octet) | `0x00` | Bitmask lỗi phần cứng tổng quát | `VERIFIED` |

### 3.2 Khung Máy, Cảm Biến Cửa & Khay Giấy (RFC 3805)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Giá trị thực tế đo đạc | Ý nghĩa kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `1.3.6.1.2.1.43.5.1.1.17.1` | `prtGeneralSerialNumber` | DisplayString | `G157L700046` | Số serial khung máy Ricoh chuẩn quốc tế | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.2.1.1` | `prtCoverDescription.1.1` | DisplayString | `Front Cover` | Cửa nắp trước máy in | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.3.1.1` | `prtCoverStatus.1.1` | INTEGER | `4` (`closed`) | Trạng thái cửa trước (4=Đóng, 3=Mở) | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.2.1.2` | `prtCoverDescription.1.2` | DisplayString | `Duplex Unit Cover` | Cửa cụm đảo mặt | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.3.1.2` | `prtCoverStatus.1.2` | INTEGER | `4` (`closed`) | Trạng thái cửa đảo mặt | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.2.1.5` | `prtCoverDescription.1.5` | DisplayString | `Auto Document Feeder Cover`| Nắp khối quét tài liệu tự động ADF | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.3.1.5` | `prtCoverStatus.1.5` | INTEGER | `4` (`closed`) | Trạng thái nắp ADF | `VERIFIED` |
| `1.3.6.1.2.1.43.8.2.1.13.1.1` | `prtInputName.1.1` | DisplayString | `Tray 1` | Khay giấy số 1 (Sức chứa 550 tờ) | `VERIFIED` |
| `1.3.6.1.2.1.43.8.2.1.10.1.1` | `prtInputCurrentLevel.1.1` | INTEGER | `165` tờ | Số tờ giấy hiện có tại khay 1 | `VERIFIED` |
| `1.3.6.1.2.1.43.8.2.1.13.1.2` | `prtInputName.1.2` | DisplayString | `Tray 2` | Khay giấy số 2 (Đang rỗng giấy: `0`) | `VERIFIED` |
| `1.3.6.1.2.1.43.8.2.1.13.1.5` | `prtInputName.1.5` | DisplayString | `Bypass Tray` | Khay tay đa năng | `VERIFIED` |
| `1.3.6.1.2.1.43.9.2.1.7.1.1` | `prtOutputName.1.1` | DisplayString | `Internal Tray 1` | Khay đón bản in bên trong | `VERIFIED` |

### 3.3 Bộ Đếm Chuyên Sâu & Theo Dõi Thời Gian Sự Cố (Ricoh Private MIB)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Giá trị thực tế đo đạc | Ý nghĩa kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `1.3.6.1.4.1.367.3.2.1.2.19.1.0` | `ricohTotalCounter` | Counter32 | `838358` trang | **Tổng số trang in tích lũy trọn đời** | `VERIFIED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.2.0` | `ricohPrinterModePages` | Counter32 | `734542` trang | Số trang in nhận từ máy tính (Print Driver) | `VERIFIED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.4.0` | `ricohCopierModePages` | Counter32 | `103816` trang | Số trang sao chụp trực tiếp qua kính (Copy) | `VERIFIED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.5.1.9.10` | `ricohDuplexSidesCounter` | Counter32 | `269856` mặt | **Tổng số mặt in đảo 2 mặt (Duplex Sides)** | `VERIFIED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.5.1.9.22` | `ricohLargePaperCounter` | Counter32 | `31005` trang | **Số trang in khổ lớn ($\ge$ A3 / DLT)** | `VERIFIED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.5.1.9.27` | `ricohColorScanCounter` | Counter32 | `11719` lượt | **Số lượt quét tài liệu màu (Color Scan)** | `VERIFIED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.5.1.9.28` | `ricohBwScanCounter` | Counter32 | `2072` lượt | Số lượt quét tài liệu đơn sắc (B&W Scan) | `VERIFIED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.5.1.9.65` | `ricohTimeServiceCall` | Counter32 | `26479` giây | **Tổng thời gian máy bị gián đoạn do lỗi SC** | `VERIFIED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.5.1.9.66` | `ricohTimePaperMisfeed` | Counter32 | `49882` giây | **Tổng thời gian máy bị dừng do kẹt giấy** | `VERIFIED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.5.1.9.68` | `ricohTimeOutOfSupplies` | Counter32 | `32529` giây | **Tổng thời gian máy bị dừng do hết mực/giấy** | `VERIFIED` |
| `1.3.6.1.4.1.367.3.2.1.2.2.20.0` | `ricohMfpErrorSummary` | INTEGER | `0` (Bình thường) | Bitmask lỗi hệ thống Service Call SC | `VERIFIED` |
| `1.3.6.1.4.1.367.3.2.1.2.2.11.0` | `ricohScannerStatus` | INTEGER | `1` (Available) | Trạng thái sẵn sàng của khối Scanner | `VERIFIED` |
