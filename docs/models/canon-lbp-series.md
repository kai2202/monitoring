# Hồ Sơ Thiết Bị & OID: Dòng Canon imageCLASS (LBP223dw & MF241d)

> **Vị trí trong dự án:** Thiết bị in văn phòng phổ biến (**Desktop Workgroup Fleet**)  
> **Trạng thái kiểm chứng:** **VERIFIED** (Đã đo đạc thực tế qua SNMPv1 tại các IP `10.48.90.221`, `10.48.90.69`, `10.48.90.129`, `10.48.90.40`, `192.168.2.100`, `10.48.91.165` - Canon LBP 223dw)  
> **Áp dụng:** Dòng máy in laser đen trắng để bàn và máy in đa chức năng nhỏ gọn của Canon.

---

## 1. Thông Tin Nhận Diện Phần Cứng

| Thuộc tính | Canon imageCLASS LBP223dw | Canon imageCLASS MF241d | Trạng thái |
| :--- | :--- | :--- | :---: |
| **Hãng sản xuất** | Canon Inc. | Canon Inc. | `VERIFIED` |
| **Dòng sản phẩm** | imageCLASS LBP Series (Laser Single Function) | imageCLASS MF Series (Laser Multi-Function) | `VERIFIED` |
| **Model máy in** | LBP223dw / LBP220 Series (`sysDescr: Canon LBP223 /P`) | MF241d / MF240 Series | `VERIFIED` |
| **Tốc độ thiết kế** | 33 trang / phút (A4) | 27 trang / phút (A4) | `DOCUMENTED` |
| **Khả năng in** | Đơn sắc (Monochrome), In 2 mặt tự động (Duplex) | Đơn sắc, In/Scan/Copy 2 mặt | `VERIFIED` |
| **IP thực tế đo đạc** | `10.48.90.221`, `10.48.90.69`, `10.48.90.129`, `10.48.90.40`, `192.168.2.100`, `10.48.91.165` | `10.48.50.66` (AB1 Tầng 5) | `VERIFIED` |
| **Giao thức SNMP** | **SNMP v1** (Community: `public`, Port 161) — *Lưu ý: Thiết bị chỉ phản hồi qua SNMPv1* | SNMP v1 / v2c (Community: `public`) | `VERIFIED` |
| **Enterprise OID Root**| `.1.3.6.1.4.1.1602` (Canon Enterprise MIB) | `.1.3.6.1.4.1.1602` (Canon Enterprise MIB) | `VERIFIED` |

---

## 2. Đặc Thù Kỹ Thuật & Cấu Trúc Vật Tư

1. **Hộp mực tích hợp All-in-One (Cartridge 057):**
   - Sử dụng hộp mực All-in-One tích hợp trống Drum và mực in trong cùng cartridge (Canon 057/057H).
   - Không có hộp mực thải riêng biệt (mực thải tự thu hồi bên trong hộp mực).
   - Mức mực in được thông báo qua `prtMarkerSuppliesTable` và trực tiếp qua thông điệp cảnh báo `prtAlertTable`.
2. **Khay nạp giấy kép (Dual Input Trays):**
   - **Multi-Purpose Tray (Khay đa năng / khay tay):** Sức chứa 100 tờ, chỉ số level `0` (hết giấy) hoặc `100`.
   - **Tray 1 (Khay gầm chính / Cassette):** Sức chứa 250 tờ, chỉ số level `-3` (bình thường còn giấy).
3. **Cảm biến nắp máy (Printer Cover Sensor):**
   - Cảm biến cơ điện tử giám sát nắp máy in chính `Printer Cover`: trạng thái `4` (đóng) và `3` (mở nắp).

---

## 3. Danh Mục OID Tiêu Chuẩn & Chuyên Sâu Đã Đo Đạc Thực Tế

### 3.1 Nhận Diện & Trạng Thái Hệ Thống (RFC 1213 & RFC 2790)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Giá trị thực tế đo đạc | Ý nghĩa kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `1.3.6.1.2.1.1.1.0` | `sysDescr` | DisplayString | `Canon LBP223 /P` | Tên định danh firmware hệ điều hành máy in | `VERIFIED` |
| `1.3.6.1.2.1.1.5.0` | `sysName` | DisplayString | Tên máy in mạng | Tên gán quản trị mạng của thiết bị | `VERIFIED` |
| `1.3.6.1.2.1.1.3.0` | `sysUpTime` | TimeTicks | Uptime máy in | Thời gian hoạt động liên tục từ lần bật nguồn | `VERIFIED` |
| `1.3.6.1.2.1.25.3.2.1.3.1` | `hrDeviceDescr` | DisplayString | `Canon LBP223` | Mô tả thiết bị phần cứng từ Host-Resources MIB | `VERIFIED` |
| `1.3.6.1.2.1.25.3.5.1.1.1` | `hrPrinterStatus` | INTEGER | `3` (`idle`) | Trạng thái hoạt động: `1`=Other, `2`=Unknown, `3`=Idle, `4`=Printing, `5`=Warmup | `VERIFIED` |
| `1.3.6.1.2.1.25.3.5.1.2.1` | `hrPrinterDetectedErrorState` | BITS (Octet) | `0x0000` | Bitmask lỗi phần cứng: kẹt giấy, nắp mở, hết giấy, lỗi service | `VERIFIED` |

### 3.2 Khung Máy, Cảm Biến Nắp & Khay Giấy (RFC 3805 Printer-MIB)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Giá trị thực tế đo đạc | Ý nghĩa kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `1.3.6.1.2.1.43.5.1.1.16.1` | `prtGeneralPrinterName` | DisplayString | `LBP223` | Tên dòng máy in chuẩn Printer-MIB | `VERIFIED` |
| `1.3.6.1.2.1.43.5.1.1.17.1` | `prtGeneralSerialNumber` | DisplayString | `NQGA086819` | Số serial khung máy vật lý dập nổi trên thân máy | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.2.1.1` | `prtCoverDescription.1.1` | DisplayString | `Printer Cover` | Tên nắp máy in chính | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.3.1.1` | `prtCoverStatus.1.1` | INTEGER | `4` (`closed`) | Trạng thái nắp máy: `3`=Mở nắp, `4`=Đóng nắp, `5`=Interlock mở | `VERIFIED` |
| `1.3.6.1.2.1.43.8.2.1.13.1.1` | `prtInputName.1.1` | DisplayString | `Multi-Purpose Tray` | Tên khay đa năng / khay tay | `VERIFIED` |
| `1.3.6.1.2.1.43.8.2.1.9.1.1` | `prtInputMaxCapacity.1.1` | INTEGER | `100` tờ | Sức chứa tối đa của khay nạp đa năng | `VERIFIED` |
| `1.3.6.1.2.1.43.8.2.1.10.1.1` | `prtInputCurrentLevel.1.1` | INTEGER | `0` (Hết giấy) | Lượng giấy hiện có trong khay đa năng | `VERIFIED` |
| `1.3.6.1.2.1.43.8.2.1.13.1.2` | `prtInputName.1.2` | DisplayString | `Tray 1` | Tên khay gầm chính (Cassette 1) | `VERIFIED` |
| `1.3.6.1.2.1.43.8.2.1.9.1.2` | `prtInputMaxCapacity.1.2` | INTEGER | `250` tờ | Sức chứa tối đa khay gầm chính | `VERIFIED` |
| `1.3.6.1.2.1.43.8.2.1.10.1.2` | `prtInputCurrentLevel.1.2` | INTEGER | `-3` (Bình thường) | Mức giấy khay chính (`-3` = Còn giấy, `0` = Hết giấy) | `VERIFIED` |
| `1.3.6.1.2.1.43.9.2.1.4.1.1` | `prtOutputMaxCapacity.1.1` | INTEGER | `150` tờ | Sức chứa khay đón giấy ra | `VERIFIED` |
| `1.3.6.1.2.1.43.9.2.1.5.1.1` | `prtOutputRemainingCapacity` | INTEGER | `150` tờ | Sức chứa còn trống của khay đón giấy ra | `VERIFIED` |

### 3.3 Vật Tư, Bộ Đếm Trang & Cảnh Báo Lỗi (RFC 3805 & Canon Private MIB)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Giá trị thực tế đo đạc | Ý nghĩa kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `1.3.6.1.2.1.43.10.2.1.4.1.1` | `prtMarkerLifeCount` | Counter32 | `177752` trang | **Tổng số trang in tích lũy trọn đời** | `VERIFIED` |
| `1.3.6.1.2.1.43.10.2.1.5.1.1` | `prtMarkerPowerOnCount` | Counter32 | `176` trang | Số trang in tính từ lần bật nguồn gần nhất | `VERIFIED` |
| `1.3.6.1.2.1.43.11.1.1.6.1.1` | `prtMarkerSuppliesDescr` | DisplayString | `Canon Cartridge 057 Black Toner` | Tên định danh chính xác hộp mực chính hãng | `VERIFIED` |
| `1.3.6.1.2.1.43.18.1.1.8.1.2` | `prtAlertDescription.2` | DisplayString | `toner cartridge needs to be checked (black).` | Mô tả sự cố phần cứng trực tiếp từ máy in | `VERIFIED` |
| `1.3.6.1.2.1.43.18.1.1.2.1.2` | `prtAlertSeverityLevel.2` | INTEGER | `4` (`Warning`) | Mức độ nghiêm trọng của sự cố | `VERIFIED` |
| `1.3.6.1.4.1.1602.1.11.2.1.1.3.1` | `canonTotalCounter1` | Counter32 | `177750` trang | Bộ đếm tổng trang in từ MIB Canon Private | `VERIFIED` |
| `1.3.6.1.4.1.1602.1.11.2.1.1.3.10` | `canonDuplex2SidedCounter` | Counter32 | `54355` trang | **Bộ đếm số trang in đảo 2 mặt (Duplex)** | `VERIFIED` |
| `1.3.6.1.4.1.1602.1.11.2.1.1.3.25` | `canonPrintJobCounter` | Counter32 | `177750` trang | Bộ đếm trang in nhận qua lệnh in từ máy tính | `VERIFIED` |
| `1.3.6.1.4.1.1602.1.5.5.3.1.1.5.1.2` | `canonAlertMessage` | DisplayString | `toner cartridge needs to be checked (black).` | Chuỗi thông báo lỗi độc quyền trên chip Canon | `VERIFIED` |
