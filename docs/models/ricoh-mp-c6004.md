# Hồ Sơ Thiết Bị & OID: Ricoh MP C6004

> **Vị trí trong dự án:** Thiết bị tham chiếu chính (**Primary Reference Device - Phase 1**)  
> **Trạng thái kiểm chứng:** **VERIFIED & TESTED** trên thiết bị vật lý thực tế qua SNMP  
> **Áp dụng:** Cấu hình Zabbix Template (`template_ricoh_mp_c6004_snmp.yaml`), Backend API Diagnostic Catalog và Frontend Dashboard.

---

## 1. Thông Tin Nhận Diện Phần Cứng (Hardware Identification)

| Thuộc tính | Giá trị ghi nhận thực nghiệm | Nguồn gốc / Phương thức xác minh |
| :--- | :--- | :--- |
| **Hãng sản xuất** | Ricoh Company, Ltd. | `sysDescr` (`VERIFIED`) |
| **Dòng sản phẩm** | Aficio / MP Series (Gen 6) | Tài liệu kỹ thuật Ricoh (`DOCUMENTED`) |
| **Model máy in** | MP C6004 | OID `1.3.6.1.4.1.367.3.2.1.1.1.1.0` (`VERIFIED`) |
| **Phân loại thiết bị** | Color Multifunction Printer (Color MFP) | Kiểm tra trực quan thiết bị vật lý (`VERIFIED`) |
| **Địa chỉ IP thử nghiệm** | `10.48.3.252` | Mạng LAN nội bộ doanh nghiệp (`VERIFIED`) |
| **Phiên bản SNMP** | SNMP v2c (Read-Only) | Kiểm tra qua `snmpwalk` (`VERIFIED`) |
| **SNMP Port** | UDP 161 (Polling), UDP 162 (Traps) | Cổng tiêu chuẩn |
| **Phiên bản Firmware** | `1.43` (Build G179-1120) | OID `1.3.6.1.4.1.367.3.2.1.1.1.2.0` (`VERIFIED`) |
| **Số serial khung máy** | `G736M860609` | OID `1.3.6.1.4.1.367.3.2.1.2.1.4.0` (`VERIFIED`) — trước đó ghi nhận `W537M700142` |
| **Khay nạp bản gốc ADF** | ARDF (Type 3) | OID `1.3.6.1.4.1.367.3.2.1.2.15.1.0` (`VERIFIED`) |

---

## 2. Khả Năng Giám Sát & Tính Năng Nổi Bật

1. **Phát hiện cảnh báo lỗi phần cứng**:
   - Hỗ trợ đầy đủ bảng `prtAlertTable` (RFC 3805). Đã ghi nhận thực nghiệm cảnh báo hết giấy Khay 3 (`No Paper: Tray 3 {13400}`, mã lỗi `808`).
   - Cung cấp bitmask lỗi hệ thống tổng thể `ricohMfpErrorSummary` (bắt mã lỗi SC).
2. **Theo dõi bộ quét Scanner & khay ADF**:
   - Cảm biến giấy trên mặt kính quang học (`ricohScannerGlassPaperStatus`).
   - Cờ báo lỗi phần cứng Scanner/ADF riêng biệt (`ricohScannerErrorStatus`).
3. **Mực in & Bộ đếm sản lượng**:
   - Mực 4 màu K, C, M, Y theo tỷ lệ phần trăm qua `prtMarkerSuppliesLevel`.
   - Hộp mực thải báo cáo giá trị `100` (quy ước dự án: 100 = Full).
   - Bóc tách đầy đủ 4 bộ đếm: Tổng bản in (`758869`), In mạng (`640301`), Copy (`116304`), Fax (`2264`).

---

## 3. Bảng Tra Cứu OID Private Chuyên Biệt Ricoh

Nhánh Enterprise OID: `.1.3.6.1.4.1.367` (`iso.org.dod.internet.private.enterprises.ricoh`)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Ý nghĩa kỹ thuật | Trạng thái | Ghi chú & Giá trị mẫu |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `1.3.6.1.4.1.367.3.2.1.1.1.1.0` | `ricohPrinterModel` | DisplayString | Tên định danh model máy in Ricoh | **VERIFIED** | Trả về `MP C6004` |
| `1.3.6.1.4.1.367.3.2.1.1.1.2.0` | `ricohFirmwareVersion` | DisplayString | Phiên bản firmware điều khiển hệ thống | **VERIFIED** | Trả về `1.43` |
| `1.3.6.1.4.1.367.3.2.1.2.1.4.0` | `ricohEngineSerialNumber` | DisplayString | Số serial phần cứng khung máy động cơ | **VERIFIED** | Trả về `G736M860609` |
| `1.3.6.1.4.1.367.3.2.1.2.2.11.0` | `ricohScannerShareStatus` | INTEGER | Trạng thái sẵn sàng của khối quét Scanner | **VERIFIED** | 1=Available, 2=Busy, >2=Offline (Thực tế: `1`) |
| `1.3.6.1.4.1.367.3.2.1.2.2.12.0` | `ricohScannerGlassPaperStatus`| INTEGER | Cảm biến phát hiện giấy trên mặt kính | **VERIFIED** | 1=Không có giấy, 2=Có bản gốc (Thực tế: `2`) |
| `1.3.6.1.4.1.367.3.2.1.2.2.13.0` | `ricohScannerErrorStatus` | INTEGER | Trạng thái lỗi phần cứng Scanner/ADF | **VERIFIED** | 0 hoặc 1=Bình thường, >1=Lỗi (Thực tế: `0`) |
| `1.3.6.1.4.1.367.3.2.1.2.2.18.0` | `ricohScannerErrorSummary` | INTEGER | Bitmask cảnh báo ứng dụng quét | **VERIFIED** | 0=Sạch, >0=Có cảnh báo (Thực tế: `0`) |
| `1.3.6.1.4.1.367.3.2.1.2.15.1.0` | `ricohAdfType` | INTEGER | Định danh chủng loại khay nạp bản gốc ADF | **VERIFIED** | Trả về `3` (ARDF/SPDF) |
| `1.3.6.1.4.1.367.3.2.1.2.15.2.0` | `ricohAdfModelName` | DisplayString | Tên model khay nạp bản gốc ADF | **OBSERVED** | Trả về chuỗi rỗng `""` trên model này |
| `1.3.6.1.4.1.367.3.2.1.2.2.20.0` | `ricohMfpErrorSummary` | INTEGER | Bitmask lỗi hệ thống nền tảng MFP | **VERIFIED** | Ưu tiên số 1: 0=Sạch, >0=Lỗi hệ thống (Thực tế: `0`) |
| `1.3.6.1.4.1.367.3.2.1.2.2.22.0` | `ricohCopyErrorSummary` | INTEGER | Bitmask cảnh báo ứng dụng sao chụp Copier | **VERIFIED** | 0=Sạch, >0=Cảnh báo Copier (Thực tế: `1`) |
| `1.3.6.1.4.1.367.3.2.1.2.20.3.2.1.6.2.1` | `ricohFinisherStatus` | INTEGER | Trạng thái khối hoàn thiện đầu ra Internal Tray 1 | **VERIFIED** | Raw finisher subunit status (Thực tế: `0`) |
| `1.3.6.1.4.1.367.3.2.1.2.19.1.0` | `ricohTotalCopies` | Counter32 | Tổng số bản copy/in lũy kế trọn đời | **VERIFIED** | Khớp với `prtMarkerLifeCount` (`759671`) |
| `1.3.6.1.4.1.367.3.2.1.2.19.2.0` | `ricohPrinterModeCopies` | Counter32 | Bộ đếm trang in qua mạng (Print driver) | **VERIFIED** | Ghi nhận thực tế: `641064` |
| `1.3.6.1.4.1.367.3.2.1.2.19.3.0` | `ricohFaxModeCopies` | Counter32 | Bộ đếm trang in từ bản fax nhận được | **VERIFIED** | Ghi nhận thực tế: `2264` |
| `1.3.6.1.4.1.367.3.2.1.2.19.4.0` | `ricohCopierModeCopies` | Counter32 | Bộ đếm trang sao chụp trực tiếp qua kính | **VERIFIED** | Ghi nhận thực tế: `116343` |
| `1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.1` | `ricohBlackTonerPercent` | INTEGER | Mức mực đen Ricoh Private (% thực) | **VERIFIED** | Khớp với RFC 3805: `80%` |
| `1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.2` | `ricohCyanTonerPercent` | INTEGER | Mức mực xanh Ricoh Private (% thực) | **VERIFIED** | Khớp với RFC 3805: `90%` |
| `1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.3` | `ricohMagentaTonerPercent` | INTEGER | Mức mực hồng Ricoh Private (% thực) | **VERIFIED** | Khớp với RFC 3805: `80%` |
| `1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.4` | `ricohYellowTonerPercent` | INTEGER | Mức mực vàng Ricoh Private (% thực) | **VERIFIED** | Khớp với RFC 3805: `40%` |
| `1.3.6.1.2.1.43.11.1.1.9.1.2` | `wasteTonerLevel` (RFC 3805) | INTEGER | Cảm biến hộp mực thải đầy | **VERIFIED** | Ghi nhận `100` (Max `100`, Type `4=wasteToner`) |

---

## 4. Từ Điển Ánh Xạ Mã Lỗi Kỹ Thuật (Ricoh SC Error Code Catalog)

### 4.1 Nhóm Lỗi Bo Mạch Điều Khiển, CPU, Ổ Cứng HDD (Dãy SC6xx, SC8xx, SC9xx)
| Mã lỗi | Tên lỗi kỹ thuật | Tên kỹ thuật chuẩn Ricoh | Phân hệ / Linh kiện | Mức độ |
| :--- | :--- | :--- | :--- | :---: |
| **SC670** | Lỗi khởi động kết nối bo mạch động cơ | Engine Startup Error | Bo điều khiển chính (Controller Board), Bo động cơ (Engine Board) | **Critical** |
| **SC672** | Mất giao tiếp Bo điều khiển và Màn hình cảm ứng | Controller-to-Operation Panel Communication Error | Cáp màn hình USB/TTL, Màn hình thông minh (Smart Panel), Bo Controller | **Critical** |
| **SC819** | Sập nhân hệ điều hành / Tràn bộ nhớ Kernel | OS / Kernel Watchdog Crash | Chip CPU, Bộ nhớ RAM hệ thống, Phần mềm điều khiển (Firmware) | **Critical** |
| **SC820** | Lỗi tự chẩn đoán chip xử lý Modem/CPU | Self-Diagnostic Error: CPU | Bo mạch điều khiển chính (Controller Board) | **Critical** |
| **SC824** | Lỗi chip nhớ cấu hình tĩnh (NVRAM) | NVRAM Error | Chip NVRAM, Pin CMOS lưu trữ | **Critical** |
| **SC860** | Lỗi khởi động ổ cứng (HDD không quay/không nhận) | HDD Startup Error | Ổ cứng HDD (Hard Disk), Cáp dữ liệu SATA, Cáp nguồn HDD | **Critical** |
| **SC861** | Lỗi ổ cứng không chuyển trạng thái sẵn sàng | HDD Not Ready Error | Ổ cứng HDD, Cáp SATA | **Critical** |
| **SC863** | Lỗi đọc phân vùng dữ liệu ổ cứng | HDD Data Read Error | Ổ cứng HDD (Bad Sector), Phân vùng Document Server | **Critical** |
| **SC865** | Lỗi định dạng ổ cứng / Phân vùng hệ thống lỗi | HDD Format Error | Ổ cứng HDD | **Critical** |
| **SC870** | Lỗi dữ liệu danh bạ người dùng | Address Book Data Error | Dữ liệu Address Book trên HDD / Flash ROM | **Warning** |
| **SC876** | Lỗi mạch truyền dữ liệu mạng / Log hệ thống | Network Data Transmission / Log Error | Chip điều khiển mạng (NIC), Phân vùng Log trên HDD | **Warning** |
| **SC899** | Lỗi lặp vô tận lệnh in mạng (PostScript/PCL Crash) | Software Spooler Error | Hàng đợi in mạng, Trình điều khiển in (Print Driver) | **Warning** |

### 4.2 Nhóm Lỗi Khối Quét Scanner & Khay Nạp ADF (Dãy SC1xx)
| Mã lỗi | Tên lỗi kỹ thuật | Tên kỹ thuật chuẩn Ricoh | Phân hệ / Linh kiện | Mức độ |
| :--- | :--- | :--- | :--- | :---: |
| **SC101** | Lỗi đèn quét phơi sáng bản gốc | Exposure Lamp Error | Đèn quét Scanner LED, Bo cao áp đèn quét, Dây cáp quang | **Critical** |
| **SC120** | Lỗi vị trí gốc dàn gương quét (Home Position) | Scanner Home Position Error | Cảm biến Home Position, Dây curoa dàn quét, Motor quét | **Critical** |
| **SC141** | Lỗi hiệu chuẩn mức sáng trắng tự động (White Level) | SBU White Level Correction Error | Băng chuẩn trắng dưới mép kính, Thấu kính CCD, Bo SBU | **Warning** |
| **SC161** | Lỗi bo mạch xử lý hình ảnh khối quét | IPU Error | Bo mạch xử lý hình ảnh IPU, Bo Scanner | **Critical** |
| **SC195** | Lỗi giao tiếp khối nạp tự động ADF | ADF Connection Error | Khay nạp bản gốc ADF (ARDF DF3090), Cáp tín hiệu ADF | **Warning** |

### 4.3 Nhóm Lỗi Cụm Tạo Ảnh, Hộp Laser & Trống Drum (Dãy SC2xx, SC3xx)
| Mã lỗi | Tên lỗi kỹ thuật | Tên kỹ thuật chuẩn Ricoh | Phân hệ / Linh kiện | Mức độ |
| :--- | :--- | :--- | :--- | :---: |
| **SC202** | Lỗi motor gương đa giác cụm Laser | Polygon Mirror Motor Error | Động cơ gương đa giác Polygon Motor, Cụm Laser | **Critical** |
| **SC220** | Lỗi tín hiệu đồng bộ Laser (Laser Synch Error) | Laser Synchronization Error | Bo dò đồng bộ Laser, Cáp quang Laser | **Critical** |
| **SC300** | Lỗi điện áp nạp trống (Charge Roller / Bias) | Charge Roller High Voltage Error | Cụm trống Drum, Trục cao su nạp sạc, Bo nguồn cao áp | **Critical** |
| **SC360** | Lỗi cảm biến cấp mực TD (Toner Density Sensor) | TD Sensor Output Error | Cảm biến nồng độ mực từ (TD Sensor), Hộp từ (Development Unit) | **Warning** |

### 4.4 Nhóm Lỗi Cụm Băng Tải, Băng Trung Gian & Hộp Mực Thải (Dãy SC4xx)
| Mã lỗi | Tên lỗi kỹ thuật | Tên kỹ thuật chuẩn Ricoh | Phân hệ / Linh kiện | Mức độ |
| :--- | :--- | :--- | :--- | :---: |
| **SC400** | Lỗi cảm biến căn chỉnh màu tự động (ID Sensor) | ID Sensor Error | Cảm biến mật độ hình ảnh ID Sensor, Băng tải ITB | **Warning** |
| **SC441** | Lỗi động cơ hộp mực thải hoặc kẹt đường ống mực | Waste Toner Motor Lock Error | Motor hút mực thải, Hộp mực thải (Waste Toner Box) | **Critical** |

### 4.5 Nhóm Lỗi Cụm Sấy & Cảm Biến Nhiệt (Fuser Unit) (Dãy SC5xx)
| Mã lỗi | Tên lỗi kỹ thuật | Tên kỹ thuật chuẩn Ricoh | Phân hệ / Linh kiện | Mức độ |
| :--- | :--- | :--- | :--- | :---: |
| **SC541** | Lỗi đứt cảm biến nhiệt độ cụm sấy (Thermistor) | Fusing Thermistor Open | Cảm biến nhiệt sấy (Thermistor / NC Sensor) | **Critical** |
| **SC542** | Cụm sấy không đạt nhiệt độ khởi động đúng thời hạn | Fusing Warm-up Error | Đèn sấy sưởi ấm (Halogen Lamp/IH Coil), Bo cấp nguồn sấy | **Critical** |
| **SC554** | Cụm sấy quá nhiệt độ an toàn | Fusing Overheat Error | Cầu chì nhiệt (Thermostat), Cảm biến nhiệt, Triac bo nguồn | **Critical** |
| **SC569** | Lỗi motor ép cụm sấy | Pressure Roller Motor Error | Động cơ ép trục sấy (Pressure Roller Motor), Cảm biến vị trí ép | **Critical** |
