# Hồ Sơ Thiết Bị & OID: Toshiba e-STUDIO 5018A (Mono MFP)

> **Vị trí trong dự án:** Thiết bị mở rộng thực tế (**Field Fleet Expansion**)  
> **Trạng thái kiểm chứng:** **VERIFIED** (Đã đo đạc thực tế qua SNMPv2c tại IP `192.168.131.48` - Chi nhánh JPC)  
> **Tương thích dòng:** Toshiba e-STUDIO 2518A, 3018A, 3518A, 4518A, 5018A (Dòng máy in đa năng đen trắng công nghiệp A3 của Toshiba).

---

## 1. Thông Tin Nhận Diện Phần Cứng

| Thuộc tính | Giá trị quy ước / Đặc tả | Trạng thái |
| :--- | :--- | :---: |
| **Hãng sản xuất** | Toshiba Tec Corporation | `VERIFIED` |
| **Dòng sản phẩm** | e-STUDIO 18A Series (Monochrome Multifunction Printer) | `VERIFIED` |
| **Model máy in** | Toshiba e-STUDIO 5018A | `VERIFIED` |
| **Tốc độ thiết kế** | 50 trang / phút (A4 đơn sắc) | `DOCUMENTED` |
| **IP thực tế đo đạc** | `192.168.131.48` (JPC) | `VERIFIED` |
| **Giao thức SNMP** | SNMP v2c (Community: `public`, Port 161) | `VERIFIED` |
| **Enterprise OID Root** | `.1.3.6.1.4.1.1129` (Toshiba Enterprise MIB) | `VERIFIED` |
| **Bo điều khiển (Controller CPU)** | Intel(R) Atom(TM) CPU E3825 @ 1.33GHz | `VERIFIED` |
| **Phiên bản Firmware** | `V22.3.0.681.08` (Engine: `V0.352.8.0`) | `VERIFIED` |

---

## 2. Đặc Thù Kỹ Thuật & Cấu Trúc Khay Giấy & Vật Tư

1. **Hệ thống mực in & mực thải:**
   - Hộp mực đen dung lượng lớn T-5018P (`Black Toner`): hiện đo đạc `1%` (đang có cảnh báo sắp hết mực).
   - Hộp chứa mực thải riêng biệt (`Waste Toner`): hiện đo đạc `-3` (bình thường, chưa đầy).
2. **Cấu trúc khay nạp giấy & Module hoàn thiện (Finisher):**
   - **Drawer 1 & Drawer 2:** Khay nạp tự động, sức chứa lớn. Drawer 2 hiện đang rỗng giấy (đo đạc thực tế kích hoạt cảnh báo `Paper Empty in Drawer2`).
   - **Bypass Tray:** Khay nạp tay đa năng.
   - **INNER TRAY:** Khay giấy ra tích hợp bên trong thân máy.
   - **FINISHER BIN 1 & BIN 2:** Bộ hoàn thiện đóng ghim / phân trang công nghiệp (`FIN-015`), sức chứa 100 và 500 tờ.
3. **Hệ thống cảm biến nắp máy (Covers):**
   - Đầy đủ cảm biến cho từng cửa máy: `FRONT COVER`, `ADU COVER`, `FEED COVER`, `SIDE COVER`, `WASTE TONER BOX COVER`.

---

## 3. Danh Mục OID Tiêu Chuẩn & Chuyên Sâu Đã Đo Đạc Thực Tế

### 3.1 Nhận Diện, Trạng Thái & Lỗi Phần Cứng (RFC 1213 & RFC 2790)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Giá trị thực tế đo đạc | Ý nghĩa kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `1.3.6.1.2.1.1.1.0` | `sysDescr` | DisplayString | `TOSHIBA e-STUDIO5018A` | Tên model máy in chuẩn MIB-II | `VERIFIED` |
| `1.3.6.1.2.1.1.5.0` | `sysName` | DisplayString | `TOSHIBA e-STUDIO5018A` | Tên định danh thiết bị mạng | `VERIFIED` |
| `1.3.6.1.2.1.1.3.0` | `sysUpTime` | TimeTicks | Uptime máy in | Thời gian máy chạy liên tục từ lần bật | `VERIFIED` |
| `1.3.6.1.2.1.25.3.5.1.1.1` | `hrPrinterStatus` | INTEGER | `1` (`other`) | Trạng thái máy in tổng thể | `VERIFIED` |
| `1.3.6.1.2.1.25.3.5.1.2.1` | `hrPrinterDetectedErrorState` | BITS (Octet) | `0xc0` (`lowToner + noPaper`) | Bitmask lỗi: chip máy báo trực tiếp sắp hết mực và hết giấy | `VERIFIED` |

### 3.2 Khung Máy, Cảm Biến Nắp & Khay Giấy (RFC 3805 Printer-MIB)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Giá trị thực tế đo đạc | Ý nghĩa kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `1.3.6.1.2.1.43.5.1.1.17.1` | `prtGeneralSerialNumber` | DisplayString | `CZHL31691` | Số serial khung máy Toshiba | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.2.1.1` | `prtCoverDescription.1.1` | DisplayString | `FRONT COVER` | Cửa trước máy in | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.3.1.1` | `prtCoverStatus.1.1` | INTEGER | `4` (`closed`) | Trạng thái cửa trước (4=Đóng, 3=Mở) | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.2.1.2` | `prtCoverDescription.1.2` | DisplayString | `ADU COVER` | Cửa khối đảo mặt tự động | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.3.1.2` | `prtCoverStatus.1.2` | INTEGER | `4` (`closed`) | Trạng thái cửa đảo mặt | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.2.1.21` | `prtCoverDescription.1.21` | DisplayString | `WASTE TONER BOX COVER` | Nắp đậy hộp mực thải | `VERIFIED` |
| `1.3.6.1.2.1.43.6.1.1.3.1.21` | `prtCoverStatus.1.21` | INTEGER | `4` (`closed`) | Trạng thái nắp đậy hộp mực thải | `VERIFIED` |
| `1.3.6.1.2.1.43.9.2.1.7.1.1` | `prtOutputName.1.1` | DisplayString | `INNER TRAY` | Khay giấy ra bên trong | `VERIFIED` |
| `1.3.6.1.2.1.43.9.2.1.7.1.6` | `prtOutputName.1.6` | DisplayString | `FINISHER BIN1` | Khay ra bộ hoàn thiện 1 (Sức chứa 100 tờ) | `VERIFIED` |
| `1.3.6.1.2.1.43.9.2.1.7.1.7` | `prtOutputName.1.7` | DisplayString | `FINISHER BIN2` | Khay ra bộ hoàn thiện 2 (Sức chứa 500 tờ) | `VERIFIED` |

### 3.3 Vật Tư, Bộ Đếm Trang & Cảnh Báo Lỗi (RFC 3805 & Toshiba Private MIB)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Giá trị thực tế đo đạc | Ý nghĩa kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `1.3.6.1.2.1.43.10.2.1.4.1.1` | `prtMarkerLifeCount` | Counter32 | `48007` trang | **Tổng số trang in/copy lũy kế trọn đời** | `VERIFIED` |
| `1.3.6.1.2.1.43.10.2.1.5.1.1` | `prtMarkerPowerOnCount` | Counter32 | `1715` trang | Số trang in từ lần bật máy gần nhất | `VERIFIED` |
| `1.3.6.1.2.1.43.11.1.1.6.1.1` | `prtMarkerSuppliesDescr.1` | DisplayString | `Black Toner` | Hộp mực đen chính | `VERIFIED` |
| `1.3.6.1.2.1.43.11.1.1.9.1.1` | `prtMarkerSuppliesLevel.1` | INTEGER | `1` (%) | **Mức mực đen còn lại (Đang báo Low Toner)** | `VERIFIED` |
| `1.3.6.1.2.1.43.11.1.1.6.1.5` | `prtMarkerSuppliesDescr.5` | DisplayString | `Waste Toner` | Hộp mực thải | `VERIFIED` |
| `1.3.6.1.2.1.43.11.1.1.9.1.5` | `prtMarkerSuppliesLevel.5` | INTEGER | `-3` (Bình thường) | Mức hộp mực thải (`-3` = Chưa đầy) | `VERIFIED` |
| `1.3.6.1.2.1.43.18.1.1.8.1.1` | `prtAlertDescription.1` | DisplayString | `Paper Empty in Drawer2` | Cảnh báo sự cố hết giấy tại Khay số 2 | `VERIFIED` |
| `1.3.6.1.2.1.43.18.1.1.8.1.2` | `prtAlertDescription.2` | DisplayString | `Black Toner Cartridge Low` | Cảnh báo mực đen sắp cạn | `VERIFIED` |
| `1.3.6.1.4.1.1129.2.3.50.1.2.3.1.4.1.1` | `toshibaFirmwareVersion` | DisplayString | `V22.3.0.681.08` | Phiên bản Firmware hệ điều hành Toshiba | `VERIFIED` |
| `1.3.6.1.4.1.1129.2.3.50.1.2.3.1.7.1.1` | `toshibaControllerCpu` | DisplayString | `Intel(R) Atom(TM) CPU E3825` | Chip xử lý trung tâm của máy in | `VERIFIED` |
| `1.3.6.1.4.1.1129.2.3.50.1.2.4.1.28.1.1` | `toshibaEngineSerial` | DisplayString | `CZHL31691` | Số serial động cơ từ nhánh Private Toshiba | `VERIFIED` |
| `1.3.6.1.4.1.1129.2.3.50.1.2.4.1.19.1.1` | `toshibaDocFeederUnit` | DisplayString | `DF-13` | Mã module khay nạp bản gốc tự động | `VERIFIED` |
| `1.3.6.1.4.1.1129.2.3.50.1.2.4.1.20.1.1` | `toshibaFinisherUnit` | DisplayString | `FIN-015` | Mã module dập ghim / phân trang Finisher | `VERIFIED` |
