# DATA_SOURCES.md — Danh Mục Nguồn Dữ Liệu & Quy Tắc Kiểm Chứng SNMP

> **Hệ Thống Giám Sát Máy In Tập Trung (Printer Monitoring System)**  
> Sổ tay kỹ thuật đăng ký OID, trạng thái kiểm chứng và ánh xạ telemetry  
> Cập nhật lần cuối: Tháng 10/2026 | Phiên bản: 1.0.0

---

## 1. Mục Đích & Nguyên Tắc Cốt Lõi

Tài liệu này là **sổ đăng ký kỹ thuật chính thức** (Technical Data Registry) ghi nhận toàn bộ nguồn dữ liệu được sử dụng bởi Hệ thống Giám sát Máy In. 

Tài liệu quản lý:
- Các metric SNMP và bảng mã OID khả dụng.
- Nguồn gốc, ý nghĩa kỹ thuật và đơn vị đo của từng giá trị.
- Các cảnh báo lỗi phần cứng thực tế và hành vi phục hồi khi sự cố được khắc phục.
- Trạng thái kiểm chứng (Verification Status) và các giới hạn kỹ thuật đã biết.
- Mối liên hệ đối chiếu giữa dữ liệu SNMP/Zabbix và các trường hiển thị trên Web Frontend.

> [!NOTE]  
> Bản checklist chi tiết ánh xạ từng thành phần giao diện (UI Components: Header, Sidebar, Dashboard, Printers, Supplies, Incidents, Analytics, Modals) với OID cụ thể được lưu trữ và duy trì tại: [docs/PRINTER_DATA_REQUIREMENTS.md](file:///f:/Code/Github/Monitoring/docs/PRINTER_DATA_REQUIREMENTS.md).

### Nguyên tắc dữ liệu bắt buộc (Core Rules)
1. **Tuyệt đối không tự bịa đặt OID, tên metric, mã lỗi hoặc tính năng của thiết bị** khi chưa có căn cứ từ MIB hoặc `snmpwalk` thực tế.
2. **"Quan sát được" (`OBSERVED`) khác với "Đã kiểm chứng" (`VERIFIED`)**: Một metric trả về số liệu không đồng nghĩa với việc ta đã hiểu đúng ngữ nghĩa hoặc hành vi phần cứng của nó.
3. **Ghi nhận minh bạch các kết quả không hỗ trợ (`UNSUPPORTED`) hoặc chưa có kết luận (`INCONCLUSIVE`)**.
4. **Tách biệt dữ liệu kiểm thử/mô phỏng với dữ liệu giám sát thực tế**: Không dùng dữ liệu tĩnh để giả lập trạng thái thiết bị đang hoạt động.
5. **Kiểm tra tính tương thích theo từng dòng máy (model-specific)** trước khi tái sử dụng một OID cho model hoặc nhà sản xuất khác.

---

## 2. Bối Cảnh Thu Thập Dữ Liệu & Thiết Bị Thử Nghiệm

### 2.1 Thiết bị tham chiếu & Kiểm chứng thực tế (Reference & Verified Devices)
- **Thiết bị 1 (Reference Device - Color MFP)**:
  - Hãng sản xuất: Ricoh
  - Dòng máy: Ricoh MP C6004 (Color MFP)
  - Địa chỉ IP giám sát: `10.48.3.252`
  - Phiên bản SNMP: SNMP v2c
- **Thiết bị 2 (Verified Device - Mono MFP)**:
  - Hãng sản xuất: Ricoh
  - Dòng máy: Ricoh Aficio MP 4002 (Mono MFP)
  - Địa chỉ IP giám sát: `192.168.93.7`
  - Vị trí: `Lab Draw Room`
  - Phiên bản SNMP: SNMP v2c (Community: `public`)
- **Community String**: Lưu trữ an toàn trong file `.env` tại thư mục gốc (biến `SNMP_COMMUNITY`), không commit lên repository.

### 2.2 Kiến trúc thu thập & Luồng dữ liệu chuẩn
```
Printer (10.48.3.252) 
   │  SNMP v2c (UDP 161)
   ▼
Zabbix Server 7.0 LTS (Docker / Ubuntu Server VM)
   │  Items, Triggers, LLD Discovery, History & Trends
   ▼
Backend API Gateway (Node.js + Express + Prisma)
   │  REST API /api/* (In-memory cache TTL 60s, Stale-while-revalidate)
   ▼
React Frontend Web Dashboard (Port 3000)
```

- **Chu kỳ cào dữ liệu (Polling Interval)**: Ban đầu từ 1–5 phút tùy theo mức độ quan trọng của metric (trạng thái kết nối: 30s; cảnh báo lỗi: 1 phút; mức mực/bộ đếm: 5–15 phút).
- **Lưu trữ dữ liệu lịch sử**: Zabbix Server và cơ sở dữ liệu PostgreSQL lưu trữ raw history tối thiểu 90 ngày và dữ liệu xu hướng (trends) 365 ngày.
- **Truy cập dữ liệu**: Frontend chỉ giao tiếp với Backend API trung gian; mã nguồn chạy trong trình duyệt tuyệt đối không chứa thông tin đăng nhập hoặc Token của Zabbix API.

---

## 3. Định Nghĩa Trạng Thái Kiểm Chứng (Verification Status)

Mọi metric, OID hoặc cảnh báo lỗi được khảo sát phải được gán một trạng thái kiểm chứng minh bạch:

| Trạng thái | Ký hiệu | Ý nghĩa kỹ thuật |
| :--- | :---: | :--- |
| **VERIFIED** | ✅ | Ý nghĩa, đơn vị đo lường, biên độ giá trị và hành vi khi phát sinh/khắc phục lỗi đã được kiểm chứng bằng bằng chứng thực nghiệm rõ ràng trên thiết bị vật lý. |
| **OBSERVED** | 🔍 | Giá trị đã được lấy về từ thiết bị mẫu (Ricoh MP C6004 qua `snmpwalk`), nhưng ngữ nghĩa, đơn vị hoặc cơ chế phục hồi cần tiếp tục thử nghiệm thêm. |
| **TODO** | ⏳ | Metric đã được xác định trong yêu cầu hoặc tài liệu hãng nhưng chưa tiến hành khảo sát thực tế. |
| **IN PROGRESS** | 🔄 | Đang trong quá trình khảo sát, bắt gói tin hoặc thử nghiệm kịch bản lỗi. |
| **UNSUPPORTED** | 🚫 | Thiết bị phần cứng hoặc giao thức MIB của dòng máy đó không hỗ trợ tính năng này (dựa trên bằng chứng kiểm tra đầy đủ). |
| **INCONCLUSIVE** | ❓ | Dữ liệu thu thập được có sự mâu thuẫn hoặc chưa đủ bằng chứng kỹ thuật để kết luận. |

> [!CAUTION]  
> Tuyệt đối không đánh dấu `VERIFIED` cho một metric chỉ vì nó hiển thị được trên Zabbix hay màn hình web. Phải kiểm chứng nguồn gốc OID, ngữ nghĩa đơn vị và phản ứng khi máy in thay đổi trạng thái thực tế.

---

## 4. Sổ Đăng Ký Metric Quan Sát Thực Tế (Ricoh MP C6004)

Bảng dưới đây ghi nhận các metric và OID trích xuất trực tiếp từ bản `snmpwalk` thực tế của máy in Ricoh MP C6004 (`10.48.3.252`).

| Metric / Tên OID | OID Chuẩn / Private OID | Ý nghĩa kỹ thuật | Giá trị quan sát thực nghiệm | Trạng thái | Ghi chú & Đơn vị |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `sysDescr` | `.1.3.6.1.2.1.1.1.0` | Mô tả hệ thống thiết bị | `RICOH Network Printer/Scanner Controller...` | **VERIFIED** | Chuỗi định danh thiết bị |
| `sysName` | `.1.3.6.1.2.1.1.5.0` | Tên hệ thống (NetBIOS/Host) | `MP C6004` | **VERIFIED** | Định danh mạng |
| `sysUpTime` | `.1.3.6.1.2.1.1.3.0` | Thời gian máy chạy liên tục | Timeticks (hàng chục triệu tick) | **VERIFIED** | 1 tick = 0.01 giây |
| `ricohPrinterModel` | `.1.3.6.1.4.1.367.3.2.1.2.1.4.0` | Model máy in chuyên biệt | `MP C6004` | **VERIFIED** | Ricoh Private MIB |
| `ricohFirmwareVersion` | `.1.3.6.1.4.1.367.3.2.1.2.1.5.0` | Phiên bản firmware điều khiển | `1.43` | **VERIFIED** | Phiên bản phần mềm máy |
| `prtMarkerLifeCount` | `.1.3.6.1.2.1.43.10.2.1.4.1.1` | Bộ đếm trang in trọn đời động cơ | `758869` | **VERIFIED** | RFC 3805 Printer-MIB (Trang) |
| `ricohTotalCopies` | `.1.3.6.1.4.1.367.3.2.1.2.19.1.0` | Tổng số bản copy/in (Ricoh) | `758869` | **OBSERVED** | Trùng giá trị với `prtMarkerLifeCount` |
| `ricohPrinterModeCopies` | `.1.3.6.1.4.1.367.3.2.1.2.19.2.0` | Số trang in từ máy tính qua mạng | `640301` | **OBSERVED** | Bản in qua driver (PCL/PS) |
| `ricohCopierModeCopies` | `.1.3.6.1.4.1.367.3.2.1.2.19.3.0` | Số trang sao chụp qua mặt kính | `116304` | **OBSERVED** | Bản photocopy trực tiếp |
| `ricohFaxModeCopies` | `.1.3.6.1.4.1.367.3.2.1.2.19.4.0` | Số trang fax gửi/nhận | `2264` | **OBSERVED** | Bản fax |
| `prtAlertDescription` | `.1.3.6.1.2.1.43.18.1.1.8.1.1` | Chuỗi mô tả cảnh báo lỗi | `No Paper: Tray 3 {13400}` | **VERIFIED** | Báo hết giấy Khay 3 |
| `prtAlertCode` | `.1.3.6.1.2.1.43.18.1.1.7.1.1` | Mã số cảnh báo chuẩn | `808` | **OBSERVED** | Tra cứu RFC 3805 `PrtAlertCodeTC` |
| `prtAlertSeverityLevel` | `.1.3.6.1.2.1.43.18.1.1.2.1.1` | Mức độ nghiêm trọng cảnh báo | `4` (Warning) / `3` (Critical) | **OBSERVED** | Cần ánh xạ với trigger Zabbix |
| `prtMarkerSuppliesLevel` | `.1.3.6.1.2.1.43.11.1.1.9.1.*` | Mức vật tư tiêu hao | Black, Cyan, Magenta, Waste | **OBSERVED** | Index 1: Black, 2: Cyan, ... |
| `ricohWasteTonerFull` | `.1.3.6.1.4.1.367.3.2.1.2.4.1.1.*` | Cảm biến hộp mực thải đầy | `100` | **OBSERVED** | Quy ước dự án: 100 = Full |

### 4.2 Sổ Đăng Ký Metric Kiểm Chứng Thực Tế: Ricoh Aficio MP 4002 (`192.168.93.7`)

Dữ liệu thu thập và kiểm chứng trực tiếp qua SNMP v2c trên máy in vật lý Ricoh Aficio MP 4002 tại phòng Lab (`Lab Draw Room`):

| Metric / Tên OID | OID Chuẩn / Private OID | Ý nghĩa kỹ thuật | Giá trị quan sát thực nghiệm | Trạng thái | Ghi chú & Đơn vị |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `sysDescr` | `.1.3.6.1.2.1.1.1.0` | Mô tả hệ thống thiết bị | `RICOH Aficio MP 4002 2.24...` | **VERIFIED** | Dòng Mono MFP 40 ppm |
| `sysName` | `.1.3.6.1.2.1.1.5.0` | Tên hệ thống máy in | `Aficio MP 4002` | **VERIFIED** | Hostname thiết bị |
| `sysLocation` | `.1.3.6.1.2.1.1.6.0` | Vị trí lắp đặt phần cứng | `Lab Draw Room` | **VERIFIED** | Trích xuất trực tiếp từ SNMP |
| `sysUpTime` | `.1.3.6.1.2.1.1.3.0` | Thời gian chạy liên tục | `2 days, 6:24:22` | **VERIFIED** | Uptime thiết bị |
| `ricohPrinterModel` | `.1.3.6.1.4.1.367.3.2.1.1.1.1.0` | Model máy in chuyên biệt | `Aficio MP 4002` | **VERIFIED** | Ricoh Private MIB |
| `ricohFirmwareVersion` | `.1.3.6.1.4.1.367.3.2.1.1.1.2.0` | Phiên bản firmware điều khiển | `2.24` | **VERIFIED** | Phiên bản firmware |
| `prtGeneralSerialNumber` | `.1.3.6.1.2.1.43.5.1.1.17.1` | Số serial phần cứng khung máy | `W533LB00080` | **VERIFIED** | Khớp với `ricohEngineSerialNumber` |
| `prtMarkerLifeCount` | `.1.3.6.1.2.1.43.10.2.1.4.1.1` | Tổng số trang in trọn đời động cơ | `853193` | **VERIFIED** | RFC 3805 Printer-MIB (Trang) |
| `ricohTotalCopies` | `.1.3.6.1.4.1.367.3.2.1.2.19.1.0` | Tổng số bản copy/in lũy kế (Ricoh) | `853193` | **VERIFIED** | Khớp với `prtMarkerLifeCount` |
| `ricohPrinterModeCopies` | `.1.3.6.1.4.1.367.3.2.1.2.19.2.0` | Số trang in mạng từ máy tính | `427014` | **VERIFIED** | Bản in qua mạng LAN |
| `ricohCopierModeCopies` | `.1.3.6.1.4.1.367.3.2.1.2.19.4.0` | Số trang sao chụp trực tiếp | `404050` | **VERIFIED** | Bản photocopy mặt kính |
| `ricohFaxModeCopies` | `.1.3.6.1.4.1.367.3.2.1.2.19.3.0` | Số trang in từ bản fax nhận được | `22113` | **VERIFIED** | Bản fax |
| `ricohBlackTonerPercent` | `.1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.1` | Mức mực đen Black % | `40` | **VERIFIED** | Còn lại 40% |
| `ricohColorToners` | `.1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.2..4` | Mức mực màu C, M, Y | `No such name/oid` | **UNSUPPORTED** | Thiết bị đơn sắc không có mực màu |
| `prtMarkerSuppliesWasteToner` | `.1.3.6.1.2.1.43.11.1.1.9.1.2` | Mức hộp mực thải | `100` | **VERIFIED** | Max: 100, Level: 100 |
| `prtAlertDescription.3` | `.1.3.6.1.2.1.43.18.1.1.8.1.3` | Cảnh báo cuộn lau sấy | `Replace Cleaning Web {30402}` | **VERIFIED** | Cảnh báo cuộn lau dầu sấy hết |
| `prtAlertDescription.4` | `.1.3.6.1.2.1.43.18.1.1.8.1.4` | Cảnh báo bảo dưỡng cụm sấy | `Replace Fusing Unit {30405}` | **VERIFIED** | Cảnh báo bảo dưỡng cụm sấy |
| `prtConsoleDisplay` | `.1.3.6.1.2.1.43.16.5.1.2.1.1` | Dòng chữ màn hình máy in LCD | `Replace Cleaning Web` | **VERIFIED** | Hiển thị cảnh báo trực tiếp trên máy |
| `ricohScannerShareStatus` | `.1.3.6.1.4.1.367.3.2.1.2.2.11.0` | Trạng thái khối quét Scanner | `1` (Available) | **VERIFIED** | Scanner rảnh / sẵn sàng |
| `ricohAdfType` | `.1.3.6.1.4.1.367.3.2.1.2.15.1.0` | Chủng loại khay nạp ADF | `4` (ARDF) | **VERIFIED** | Khay nạp bản gốc tự động |

---

## 5. Khảo Sát & Bóc Tách Lỗi Phần Cứng (Hardware Error Investigation)

Phát hiện lỗi phần cứng là **nhiệm vụ ưu tiên cao nhất** của hệ thống giám sát. Mục tiêu là bóc tách chính xác nguyên nhân lỗi phần cứng và phân loại theo từng phân hệ.

### 5.1 Cảnh báo lỗi mẫu đã ghi nhận trên thực tế
- **Dòng máy**: Ricoh MP C6004
- **Mô tả cảnh báo trả về**: `No Paper: Tray 3 {13400}`
- **Mã lỗi (Alert Code)**: `808` (PrtAlertCode: `inputMediaSupplyEmpty`)
- **Mức độ (Severity Level)**: `4` (Warning)
- **Ý nghĩa kỹ thuật**: Khay giấy số 3 bị hết giấy, thiết bị tạm dừng lệnh in yêu cầu nạp thêm giấy.
- **Trạng thái kiểm chứng**: `VERIFIED` về khả năng thu thập chuỗi mô tả thực tế.

### 5.2 Các phân hệ phần cứng trọng yếu cần điều tra
| Phân hệ cần khảo sát | Mục tiêu điều tra kỹ thuật | OID dự kiến (Ricoh Enterprise) | Trạng thái hiện tại |
| :--- | :--- | :--- | :---: |
| **MFP Platform Error** | Lỗi bo điều khiển trung tâm, lỗi động cơ, mã lỗi dịch vụ SC (Service Call: SC542 sấy, SC396 motor). | `.1.3.6.1.4.1.367.3.2.1.6.1.1.3.1` (`ricohMfpErrorSummary`) | ⏳ TODO (Ưu tiên 1) |
| **Scanner Error** | Lỗi thấu kính, đèn quét quang học, lỗi motor cụm scan. | `.1.3.6.1.4.1.367.3.2.1.6.1.1.4.1` (`ricohScannerErrorStatus`) | ⏳ TODO (Ưu tiên 2) |
| **ADF Error** | Kẹt giấy cụm nạp bản gốc tự động, mở nắp ADF khi đang quét. | `.1.3.6.1.4.1.367.3.2.1.6.1.1.5.1` (`ricohAdfErrorStatus`) | ⏳ TODO (Ưu tiên 3) |
| **Copier Error** | Lỗi cụm sao chụp, cụm gương phản xạ, bộ xử lý hình ảnh độc lập. | `.1.3.6.1.4.1.367.3.2.1.6.1.1.6.1` (`ricohCopyErrorSummary`) | ⏳ TODO (Ưu tiên 4) |

### 5.3 Quy trình kiểm chứng cảnh báo phần cứng an toàn
1. Chỉ thực hiện các kịch bản thử nghiệm vật lý **an toàn và không gây hại thiết bị**:
   - Thử nghiệm rút hết giấy khỏi Khay 1 hoặc Khay 2.
   - Thử nghiệm mở nắp cửa trước (Front Cover Open).
   - Thử nghiệm tháo tạm khay mực thải hoặc cụm drum (nếu kỹ thuật viên cho phép).
2. Quan sát bản tin `snmpwalk` trên bảng `prtAlertTable` và biến bitmask lỗi của Ricoh.
3. Đóng nắp/nạp giấy lại để kiểm chứng chu kỳ tự xóa lỗi (`clear event`) trên Zabbix trigger.

---

## 6. Khảo Sát Mực In & Hộp Mực Thải (Supplies & Waste Toner)

### 6.1 Mực in màu (Toner Cartridges)
- Metric chuẩn `prtMarkerSuppliesLevel` kết hợp với `prtMarkerSuppliesMaxCapacity` trong bảng `prtMarkerSuppliesTable`.
- Công thức tính phần trăm:
  $$\text{Level \%} = \frac{\text{prtMarkerSuppliesLevel}}{\text{prtMarkerSuppliesMaxCapacity}} \times 100$$
- Ngưỡng cảnh báo:
  - `< 15%`: Mức cảnh báo sắp hết mực (Warning / Cần đặt hàng dự phòng).
  - `<= 0%`: Hết mực hoàn toàn (Critical / Máy dừng in).

### 6.2 Hộp chứa mực thải (Waste Toner Container)
- Thực nghiệm trên Ricoh MP C6004 ghi nhận giá trị: `100`.
- **Quy ước hiển thị của dự án**: `100 = Full` (Đầy/Cần thay thế).
- **Giới hạn kỹ thuật**: Đây là quy ước hiển thị nội bộ dự án, cần tiếp tục kiểm chứng vật lý với hộp mực thải rỗng hoặc hộp mực thải đầy để xác định xem giá trị `100` là phần trăm đầy hay mã bit trạng thái boolean.

---

## 7. Bảng Đối Chiếu Dữ Liệu Frontend & Nguồn SNMP / Zabbix

| Trường hiển thị trên Web UI | Thuộc tính TypeScript | Nguồn dữ liệu đích (Zabbix Item / OID / Backend) | Trạng thái tích hợp |
| :--- | :--- | :--- | :---: |
| **Trạng thái kết nối** | `connectionStatus` | `icmpping` (Zabbix Simple Check ICMP Ping) | ✅ VERIFIED |
| **Tên thiết bị** | `name` | Zabbix Host Name hoặc Danh bạ Quản trị viên gán | ✅ VERIFIED |
| **Model máy in** | `model` | OID `ricohPrinterModel` / `sysDescr` | ✅ VERIFIED |
| **Hãng sản xuất** | `mfr` | Metadata quản lý hoặc parse từ `sysDescr` | ✅ VERIFIED |
| **Địa chỉ IP** | `ip` | Zabbix Host Interface IP (`10.48.3.252`) | ✅ VERIFIED |
| **Phiên bản Firmware** | `firmware` | OID `ricohFirmwareVersion` (`1.43`) | ✅ VERIFIED |
| **Mô tả cảnh báo lỗi** | `alertText` | Zabbix Problem Name / `prtAlertDescription` | ✅ VERIFIED |
| **Mã lỗi phần cứng** | `alertCode` | OID `prtAlertCode` (`808`) | 🔍 OBSERVED |
| **Mức độ nghiêm trọng** | `alertSeverity` | Zabbix Trigger Priority (3=Critical, 2=Warning) | 🔍 OBSERVED |
| **Mực Đen (K)** | `supplies.black` | `prtMarkerSuppliesLevel.1.1` | 🔍 OBSERVED |
| **Mực Xanh (C)** | `supplies.cyan` | `prtMarkerSuppliesLevel.1.2` | 🔍 OBSERVED |
| **Mực Đỏ (M)** | `supplies.magenta` | `prtMarkerSuppliesLevel.1.3` | 🔍 OBSERVED |
| **Mực Vàng (Y)** | `supplies.yellow` | `prtMarkerSuppliesLevel.1.4` | 🔍 OBSERVED |
| **Hộp mực thải** | `supplies.waste` | OID Waste Toner Ricoh (Quy ước: 100 = Đầy) | 🔍 OBSERVED |
| **Bộ đếm tổng trọn đời** | `counters.total` | OID `prtMarkerLifeCount` (`758869`) | ✅ VERIFIED |
| **Bộ đếm photocopy** | `counters.copier` | OID `ricohCopierModeCopies` (`116304`) | 🔍 OBSERVED |
| **Bộ đếm in máy tính** | `counters.printer`| OID `ricohPrinterModeCopies` (`640301`) | 🔍 OBSERVED |
| **Bộ đếm fax** | `counters.fax` | OID `ricohFaxModeCopies` (`2264`) | 🔍 OBSERVED |
| **Sản lượng 30 ngày** | `thirtyDayVolume` | Backend delta calculation từ Zabbix History | ⏳ TBD |
| **Sức khỏe thiết bị** | `health` | Backend derivation rule (`fleetService.ts`) | ✅ VERIFIED |

---

## 8. Mẫu Biểu Ghi Nhận Kiểm Chứng Metric (Metric Verification Template)

Khi khảo sát một OID mới hoặc kiểm chứng trên model máy in mới (Canon, HP, Epson), kỹ thuật viên phải ghi nhận theo mẫu sau vào nhật ký kiểm thử:

```markdown
### Hồ Sơ Kiểm Chứng Metric: [Tên Metric / OID]
- **Dòng máy in thử nghiệm**: [Ví dụ: Canon imageRUNNER ADVANCE C5535i]
- **Địa chỉ IP**: [Ví dụ: 10.48.3.250]
- **Trường hiển thị trên UI**: [Ví dụ: supplies.black]
- **Mã OID số**: [Ví dụ: .1.3.6.1.2.1.43.11.1.1.9.1.1]
- **Tên MIB nguồn**: [Ví dụ: Printer-MIB (RFC 3805)]
- **Giá trị thô trả về (Raw Value)**: [Ví dụ: 85]
- **Đơn vị đo lường**: [Ví dụ: % hoặc sheets hoặc ticks]
- **Ý nghĩa kỹ thuật**: [Mô tả chi tiết ý nghĩa của giá trị]
- **Kịch bản thực nghiệm**: [Mô tả cách tạo lỗi hoặc kiểm chứng giá trị vật lý]
- **Hành vi khi có lỗi**: [Mô tả phản ứng của Zabbix trigger]
- **Hành vi khi hết lỗi**: [Mô tả cách trigger tự xóa và thời gian phục hồi]
- **Trạng thái kiểm chứng**: [VERIFIED / OBSERVED / UNSUPPORTED / INCONCLUSIVE]
- **Người thực hiện & Ngày kiểm chứng**: [Tên / Ngày]
```

---
*Tài liệu được bảo trì và tuân thủ nghiêm ngặt các quy tắc trong [docs/AGENTS.md](file:///f:/Code/Github/Monitoring/docs/AGENTS.md).*
