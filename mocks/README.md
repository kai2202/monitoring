# Thư Mục Dữ Liệu Mock Doanh Nghiệp (Enterprise Printer Mock Dataset)

Thư mục này chứa bộ dữ liệu mock chuẩn hóa gồm **24 máy in mạng doanh nghiệp**, được xây dựng dựa trên 100% hồ sơ kỹ thuật phần cứng thực tế trong thư mục [`docs/models/`](file:///f:/Code/Github/Monitoring/docs/models).

Bộ dữ liệu này phục vụ cho việc:
- **Kiểm thử giao diện (Frontend Testing & Offline Demo):** Cho phép kiểm tra dashboard, bản đồ vật tư, biểu đồ phụ tải và quản lý sự cố mà không cần kết nối máy in thật hay máy chủ Zabbix.
- **Unit & Integration Tests:** Cung cấp các trường hợp kiểm thử biên (Edge Cases: máy ngoại tuyến, mã lỗi SC, hộp mực không có cảm biến analog, máy chủ in Windows).
- **Phát triển tính năng mới:** Đảm bảo tính tuân thủ quy chuẩn dữ liệu `MetricValue = number | null` theo bản tuyên ngôn kỹ thuật [`AGENTS.md`](file:///f:/Code/Github/Monitoring/.agent/rules/AGENTS.md).

---

## 1. Cấu Trúc Thư Mục `mocks/`

```
mocks/
├── printers.json     # 24 máy in với đầy đủ thuộc tính theo chuẩn PrinterResponse
├── incidents.json    # Danh sách các sự cố đang diễn ra (Active) và lịch sử (Resolved)
├── telemetry.json    # Chuỗi dữ liệu sản lượng in theo thời gian (chu kỳ 30 phút trong 6 giờ)
├── index.ts          # Module TypeScript xuất typed constants & helper getMockFleetStats()
└── README.md         # Tài liệu đặc tả và hướng dẫn sử dụng
```

---

## 2. Phân Bổ Kịch Bản & Trạng Thái 24 Máy In

Bộ dữ liệu 24 máy in được chia thành 4 nhóm kịch bản thực tế:

| Nhóm | Số lượng | Mô tả kỹ thuật | Dòng máy đại diện |
| :--- | :---: | :--- | :--- |
| **Nhóm 1: Hoạt động tốt (Healthy)** | 10 | Đầy đủ telemetry, ICMP ping < 50ms, vật tư trên 20%, không có lỗi phần cứng. | Ricoh MP C6004, Ricoh Aficio MP 5002, Ricoh MP 3054, Canon C5535i, Toshiba 5018A |
| **Nhóm 2: Cảnh báo vật tư (Supplies Warning)** | 4 | Mực in < 15% hoặc Hộp mực thải $\ge 85\%$ đầy (quy tắc đảo ngược RFC 3805: raw capacity $\le 15$). | Ricoh MP C4503, Ricoh MP C6004, Toshiba 5018A (Mực đen 1%), Ricoh Aficio MP 5002 |
| **Nhóm 3: Lỗi phần cứng vật lý (Critical SC/Alarm)** | 4 | Trích xuất chuẩn mã lỗi từ từ điển kỹ thuật: SC542 (Sấy Ricoh), SC202 (Laser Ricoh), E000-0001 (Sấy Canon), C400 (Cảm biến sấy Toshiba). | Ricoh MP C6004, Ricoh Aficio MP 5002, Canon C5535i, Toshiba 5018A |
| **Nhóm 4: Không lấy được dữ liệu / Unknown / Offline** | 6 | Bao gồm máy in dùng Cartridge 057 (-2 Unknown), Máy chủ in Windows chia sẻ qua USB, và máy Ngoại tuyến. | Canon LBP 223dw (Cartridge 057), Windows Print Server (Epson/HP), Ricoh Offline |

---

## 3. Danh Sách Chi Tiết 24 Thiết Bị & Bản Đồ Model

| ID | Tên Thiết Bị & IP | Model Máy In | Loại Thiết Bị | Mực In (K / C / M / Y / Thải) | Trạng Thái Hệ Thống |
| :---: | :--- | :--- | :--- | :---: | :---: |
| `10001` | `AB1_Tang_2_RDD (10.48.3.252)` | Ricoh MP C6004 | Color MFP | 70% / 80% / 70% / 20% / 0% đầy | **Healthy** (Online) |
| `10002` | `AB1_Tang_3_Marcom (10.48.3.250)` | Ricoh MP C6004 | Color MFP | 85% / 60% / 65% / 90% / 10% đầy | **Healthy** (Online) |
| `10003` | `Da_Nang_Ricoh_1 (192.168.31.250)` | Ricoh Aficio MP 5002 | Mono MFP | 50% / — / — / — / 0% đầy | **Healthy** (Online) |
| `10004` | `Da_Nang_Ricoh_2 (192.168.31.249)` | Ricoh MP 3054 | Mono MFP | 100% / — / — / — / 0% đầy | **Healthy** (Online) |
| `10005` | `AB1_Tang_2_Kaizen (10.48.3.253)` | Ricoh Aficio MP 5002 | Mono MFP | 45% / — / — / — / 15% đầy | **Healthy** (Online) |
| `10006` | `AB1_Tang_5_Ricoh (10.48.50.86)` | Ricoh Aficio MP 5002 | Mono MFP | 60% / — / — / — / 0% đầy | **Healthy** (Online) |
| `10007` | `AC_Kaizen (192.168.93.7)` | Ricoh Aficio MP 4002 | Mono MFP | 55% / — / — / — / 0% đầy | **Healthy** (Online) |
| `10008` | `Ha_Noi_C5535i_Main (10.48.10.15)` | Canon iR-ADV C5535i | Color MFP | 90% / 75% / 80% / 85% / 5% đầy | **Healthy** (Online) |
| `10009` | `Ha_Noi_C5535i_Sales (10.48.10.16)` | Canon iR-ADV C5535i | Color MFP | 65% / 70% / 50% / 60% / 10% đầy | **Healthy** (Online) |
| `10010` | `JPC_Toshiba_Office (192.168.131.50)` | Toshiba e-STUDIO 5018A | Mono MFP | 75% / — / — / — / 5% đầy | **Healthy** (Online) |
| `10011` | `JPC_Toshiba_Warehouse (192.168.131.48)` | Toshiba e-STUDIO 5018A | Mono MFP | **1% (Sắp hết)** / — / — / — / 10% đầy | **Warning** (Mực K thấp) |
| `10012` | `AB1_Tang_4_Design (10.48.4.101)` | Ricoh MP C4503 | Color MFP | **8%** / **12%** / 55% / 40% / 30% đầy | **Warning** (Mực K & C thấp) |
| `10013` | `AB2_Tang_3_Ricoh (10.48.91.50)` | Ricoh MP C6004 | Color MFP | 60% / 70% / 65% / 80% / **90% đầy** | **Warning** (Thải gần đầy) |
| `10014` | `AC_Van_Phong_Ricoh (192.168.93.8)` | Ricoh Aficio MP 5002 | Mono MFP | **10%** / — / — / — / **88% đầy** | **Warning** (Mực K & Thải) |
| `10015` | `AB1_Tang_6_Ricoh_Fuser (10.48.6.200)` | Ricoh MP C6004 | Color MFP | 40% / 50% / 50% / 30% / 20% đầy | **Critical** (`SC542-00` Sấy) |
| `10016` | `Da_Nang_Ricoh_Polygon (192.168.31.251)`| Ricoh Aficio MP 5002 | Mono MFP | 70% / — / — / — / 5% đầy | **Critical** (`SC202` Laser) |
| `10017` | `Ha_Noi_Canon_Fuser (10.48.10.18)` | Canon iR-ADV C5535i | Color MFP | 80% / 65% / 70% / 75% / 10% đầy | **Critical** (`E000-0001` Sấy) |
| `10018` | `JPC_Toshiba_Thermistor (192.168.131.55)`| Toshiba e-STUDIO 5018A| Mono MFP | 60% / — / — / — / 20% đầy | **Critical** (`C400` Cảm biến sấy) |
| `10019` | `AB1_Tang_tret_le_tan (10.48.90.221)` | Canon LBP223 | Mono Laser | `null` (Báo Cartridge Check) | **Warning** (Hộp mực 057) |
| `10020` | `AB1_Tang_2_JPC (10.48.90.69)` | Canon LBP223 | Mono Laser | `null` (Hộp mực 057 bình thường) | **Healthy** (Không hỗ trợ %) |
| `10021` | `AB1_Tang_5_Koka (10.48.90.40)` | Canon LBP 223 | Mono Laser | `null` (Hộp mực 057 bình thường) | **Healthy** (Không hỗ trợ %) |
| `10022` | `AB1_Tang_2_giao_vu_Epson (10.48.3.55)` | Windows Print Server | Mono Laser | `null` / `null` / `null` / `null` / `null` | **Unknown** (Máy chủ in PC) |
| `10023` | `AB1_Tang_6_ke_toan (192.168.2.6)` | Windows Print Server | Mono Laser | `null` / `null` / `null` / `null` / `null` | **Unknown** (Máy chủ in PC) |
| `10024` | `Au_Co_ESUTECH_Ricoh (10.10.47.104)` | Ricoh Aficio MP 5002 | Mono MFP | `null` / `null` / `null` / `null` / `null` | **Offline** (Mất kết nối 18h) |

---

## 4. Giải Thích Kỹ Thuật Các Trường "Unknown" và "Null"

Theo quy chuẩn kỹ thuật `AGENTS.md` và chuẩn quốc tế **RFC 3805 / RFC 2790**:

1. **Canon LBP 223dw (`id: 10019, 10020, 10021`):**
   - Hộp mực **Canon Cartridge 057** là cụm All-in-One (tích hợp mực + trống drum + buồng chứa mực thải).
   - Thiết bị không có cảm biến analog đo % liên tục, trả về mã `-2` (`unknown`) theo RFC 3805. Do đó `supplies.black = null`.
   - Các cột mực màu `cyan`, `magenta`, `yellow` bằng `null` vì đây là máy in đơn sắc. Cột `waste = null` vì mực thải tích hợp sẵn trong hộp mực.
2. **Máy Chủ In Windows (`id: 10022, 10023`):**
   - Là máy tính PC Windows chia sẻ máy in qua cổng USB.
   - SNMP chỉ hỗ trợ RFC 1213 MIB-II (Uptime, CPU, RAM) và không có SNMP Proxy cho RFC 3805 Printer-MIB.
   - Tất cả các trường `supplies`, `counters`, `sevenDayVolume` đều bằng `null`.
3. **Máy Ngoại Tuyến (`id: 10024`):**
   - Không phản hồi ICMP ping (`connectionStatus: 'Offline'`).
   - Có trường `downtimeDuration: '18h 45m'`, `health: 'Offline'`, `isStale: true`.

---

## 5. Hướng Dẫn Sử Dụng Trong Mã Nguồn

### Nhập dữ liệu trong TypeScript:
```typescript
import { mockPrinters, mockIncidents, mockTelemetry, getMockFleetStats } from '../mocks';

// Lấy danh sách 24 máy in
console.log(mockPrinters.length); // 24

// Lấy thống kê toàn hệ thống
const stats = getMockFleetStats(mockPrinters);
console.log(`Tổng máy: ${stats.total}, Trực tuyến: ${stats.online}, Lỗi: ${stats.critical}`);
```

### Nhập file JSON trực tiếp:
```typescript
import printersData from '../mocks/printers.json';
import incidentsData from '../mocks/incidents.json';
import telemetryData from '../mocks/telemetry.json';
```
