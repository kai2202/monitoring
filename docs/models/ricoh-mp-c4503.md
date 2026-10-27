# Hồ Sơ Thiết Bị & OID: Ricoh MP C4503 (Color MFP)

> **Vị trí trong dự án:** Thiết bị mở rộng thực tế (**Field Fleet Expansion**)  
> **Trạng thái kiểm chứng:** **DOCUMENTED & OBSERVED** (Đã ping thực tế tại IP `10.48.90.77` - AB1 Tầng 6)  
> **Tương thích dòng:** Ricoh MP C3003, MP C3503, MP C4503, MP C5503, MP C6003 (Gen 3 Color MFP Series).

---

## 1. Thông Tin Nhận Diện Phần Cứng

| Thuộc tính | Giá trị quy ước / Đặc tả | Trạng thái |
| :--- | :--- | :---: |
| **Hãng sản xuất** | Ricoh Company, Ltd. | `DOCUMENTED` |
| **Dòng sản phẩm** | Aficio MP C Series (Color Multifunction Printer) | `DOCUMENTED` |
| **Model máy in** | Ricoh MP C4503 | `DOCUMENTED` |
| **Tốc độ thiết kế** | 45 trang / phút (A4 Màu & Đơn sắc) | `DOCUMENTED` |
| **IP thực tế đo đạc** | `10.48.90.77` (AB1 Tầng 6) | `OBSERVED` |
| **Giao thức SNMP** | SNMP v2c (Community: `public`) | `DOCUMENTED` |
| **Cổng kết nối** | UDP 161 (SNMP Polling), UDP 162 (SNMP Traps) | `DOCUMENTED` |
| **Enterprise OID Root** | `.1.3.6.1.4.1.367` (Ricoh Enterprise MIB) | `DOCUMENTED` |

---

## 2. Đặc Điểm Kỹ Thuật & Cấu Trúc Bộ Đếm & Vật Tư

1. **Hệ thống vật tư tiêu hao (4 màu mực + Mực thải):**
   - Đầy đủ 4 màu mực: Black (K), Cyan (C), Magenta (M), Yellow (Y).
   - Truy xuất trực tiếp qua nhánh Private Ricoh hoặc MIB tiêu chuẩn RFC 3805 `prtMarkerSuppliesTable`.
   - Cảm biến mực thải (Waste Toner Box) báo đầy trước khi tràn cụm sấy/băng tải.
2. **Bộ đếm số trang trọn đời (Counters):**
   - Đếm tách biệt: Tổng số trang (Total), Chế độ in mạng (Print), Sao chụp mặt kính (Copy), Nhận Fax.
3. **Từ điển mã lỗi phần cứng SC (Service Call):**
   - Dùng chung hệ thống mã SC thế hệ Ricoh SmartSDK / GW+ Architecture:
     - `SC1xx`: Cụm quét Scanner / Nạp bản gốc tự động ADF.
     - `SC2xx`: Khối laser đa giác (Polygon Motor / Laser Diode).
     - `SC3xx`: Trống từ và nồng độ mực (Drum / Developer).
     - `SC4xx`: Cụm truyền ảnh, băng tải trung gian (ITB Belt).
     - `SC5xx`: Cụm sấy sấy nhiệt (Fuser Unit, Thermistor, Fusing Roller).
     - `SC6xx / SC8xx`: Bo điều khiển trung tâm (Controller, NVRAM, Network Engine).

---

## 3. Bảng Tra Cứu OID Private Ricoh MP C4503

Nhánh Enterprise OID: `.1.3.6.1.4.1.367` (`iso.org.dod.internet.private.enterprises.ricoh`)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Ý nghĩa kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `1.3.6.1.4.1.367.3.2.1.1.1.1.0` | `ricohPrinterModel` | DisplayString | Tên định danh model máy in Ricoh | `DOCUMENTED` |
| `1.3.6.1.4.1.367.3.2.1.1.1.2.0` | `ricohFirmwareVersion` | DisplayString | Phiên bản firmware điều khiển hệ thống | `DOCUMENTED` |
| `1.3.6.1.4.1.367.3.2.1.2.1.4.0` | `ricohEngineSerialNumber` | DisplayString | Số serial phần cứng khung máy động cơ | `DOCUMENTED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.1.0` | `ricohTotalCounter` | Counter32 | Tổng số bản copy/in lũy kế trọn đời | `DOCUMENTED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.2.0` | `ricohPrinterModePages` | Counter32 | Bộ đếm trang in qua mạng (Print Driver) | `DOCUMENTED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.3.0` | `ricohFaxModePages` | Counter32 | Bộ đếm trang in bản fax nhận được | `DOCUMENTED` |
| `1.3.6.1.4.1.367.3.2.1.2.19.4.0` | `ricohCopierModePages` | Counter32 | Bộ đếm trang sao chụp qua mặt kính | `DOCUMENTED` |
| `1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.1` | `ricohBlackTonerPercent` | INTEGER | Mức mực đen (Black Toner %) | `DOCUMENTED` |
| `1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.2` | `ricohCyanTonerPercent` | INTEGER | Mức mực xanh (Cyan Toner %) | `DOCUMENTED` |
| `1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.3` | `ricohMagentaTonerPercent`| INTEGER | Mức mực đỏ (Magenta Toner %) | `DOCUMENTED` |
| `1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.4` | `ricohYellowTonerPercent` | INTEGER | Mức mực vàng (Yellow Toner %) | `DOCUMENTED` |
| `1.3.6.1.2.1.43.11.1.1.9.1.5` | `ricohWasteTonerLevel` | INTEGER | Cảm biến hộp mực thải (Waste Toner Level) | `DOCUMENTED` |
| `1.3.6.1.4.1.367.3.2.1.2.2.20.0` | `ricohMfpErrorSummary` | INTEGER | Cờ cảnh báo lỗi phần cứng MFP tổng quát | `DOCUMENTED` |
