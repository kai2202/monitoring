# FleetMonitor — Bản Đồ Đo Lường SNMP & Quản Lý OIDs (Single Source of Truth)

> **Phân hệ:** Quản Lý Hệ Thống Máy In & Đo Lường SNMP (`docs/snmp-oids/`)  
> **Phiên bản:** 4.2.0 (Toàn diện 100% OID: Mạng, RAM, HDD, Tuổi thọ vật tư & Mã lỗi)  
> **Tuân thủ quy chuẩn:** [AGENTS.md](file:///f:/Code/Github/Monitoring/.agent/rules/AGENTS.md) Rule 1, 5, 6 & Quyết định loại trừ cảnh báo nắp máy và khay giấy.

---

## 1. Sơ Đồ Kiến Trúc Luồng Dữ Liệu Đo Lường

```
┌────────────────────────────────────────────────────────────────────────┐
│              HẠ TẦNG HỆ THỐNG MÁY IN MẠNG NỘI BỘ (LAN-ONLY)            │
│         ~32 vị trí máy in (Ricoh, Canon, HP, Epson, Toshiba, Brother)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SNMP v1/v2c (UDP Port 161) & ICMP Ping
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        ZABBIX SERVER 7.0 LTS                           │
│  • Quản trị Host Groups, Templates, Discovery Rules, Triggers, Events  │
│  • Thu thập OIDs chuẩn (RFC 3805, RFC 2790, RFC 1213) & Vendor MIBs    │
│  • Loại trừ 100% cảnh báo nắp máy và khay giấy/hết giấy (Rule 5.1)     │
└──────────────┬──────────────────────────────────────────▲──────────────┘
               │                                          │
    Zabbix API │ JSON-RPC 2.0 (host.get, item.get,        │ Webhook Push
   (Pull chính)│ history.get, problem.get, trigger.get)   │ (Problem/Recovery)
               ▼                                          │
┌─────────────────────────────────────────────────────────┴──────────────┐
│                    FLEETMONITOR BACKEND (EXPRESS/TS)                   │
│  • ZabbixSyncWorker (Lập lịch đồng bộ chu kỳ 60s)                      │
│  • Khớp mã SC/E-code với bảng ErrorDictionary PostgreSQL               │
│  • Chuẩn hóa dữ liệu Telemetry đa hãng (Null-Safe, MetricValue)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    FLEETMONITOR FRONTEND (REACT 18)                    │
│  • Dashboard Bezier Spline, Sơ đồ tầng Indie Grid, Lệnh bảo trì CMMS   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Bản Đồ Cấu Trúc Thư Mục Tinh Gọn (2 File Tài Liệu + 2 File Dữ Liệu)

| Tên File | Vai Trò Kỹ Thuật | Nội Dung Chi Tiết |
| :--- | :--- | :--- |
| **[README.md](file:///f:/Code/Github/Monitoring/docs/snmp-oids/README.md)** | Cổng điều phối trung tâm | Sơ đồ luồng dữ liệu kiến trúc, bảng tra cứu nhanh OID cốt lõi và hướng dẫn điều hướng. |
| **[snmp_oid_catalog.md](file:///f:/Code/Github/Monitoring/docs/snmp-oids/snmp_oid_catalog.md)** | **Từ điển OID hợp nhất duy nhất** | Gộp toàn bộ RFC 1213/2863/2790/3805, Private MIBs (Ricoh, Canon, HP, Toshiba, Epson, Brother, Olivetti), Bảng lọc Sử dụng vs Loại bỏ và Từ điển ánh xạ lỗi `FM-<SUBSYSTEM>-<INDEX>`. |
| **[printer_fleet_inventory_mapping.md](file:///f:/Code/Github/Monitoring/docs/snmp-oids/printer_fleet_inventory_mapping.md)** | Bản đồ 32 máy in thực tế | Đối soát chi tiết 32 vị trí từ bảng kiểm kê công ty, IP thực tế, Subnet và profile SNMP áp dụng cho từng máy. |
| **[error_dictionary_import.csv](file:///f:/Code/Github/Monitoring/docs/snmp-oids/error_dictionary_import.csv)** | Dữ liệu mã lỗi nạp DB | 75 mã lỗi phần cứng chuẩn hóa (Fuser, Drum, Laser, Power...) sẵn sàng seed vào PostgreSQL. |
| **[zabbix_template_fleetmonitor_snmp.yaml](file:///f:/Code/Github/Monitoring/docs/snmp-oids/zabbix_template_fleetmonitor_snmp.yaml)** | Mẫu Zabbix Template 7.0 | File cấu hình YAML chuẩn hóa chứa Discovery Rules, Items, Triggers để import 1-click vào Zabbix UI. |

---

## 3. Bảng Tra Cứu Nhanh OIDs Cốt Lõi Để Import Hệ Thống

| Nhóm Dữ Liệu | Khóa Item Zabbix (`item.key_`) | OID SNMP v2c | Kiểu Dữ Liệu | Ý Nghĩa Giám Sát |
| :--- | :--- | :--- | :---: | :--- |
| **Trạng Thái Máy** | `printer.device_status` | `1.3.6.1.2.1.25.3.2.1.5.1` | Integer | `2`: Running (Khỏe mạnh), `3`: Warning, `5`: Down (Lỗi nặng) |
| **Địa Chỉ MAC** | `printer.mac_address` | `1.3.6.1.2.1.2.2.1.6.1` | PhysAddress | Nhận diện card mạng phần cứng tĩnh |
| **Gói Mạng Lỗi** | `net.if.in.errors` | `1.3.6.1.2.1.2.2.1.14.1` | Counter32 | Phát hiện cáp LAN hỏng, chập chờn |
| **Bộ Nhớ RAM Máy**| `printer.memory_size` | `1.3.6.1.2.1.25.2.2.0` | Integer32 | Tổng RAM phần cứng (KBytes) |
| **Cờ Lỗi Bo Mạch** | `printer.error_state` | `1.3.6.1.2.1.25.3.5.1.2.1` | Octet String | Bitmask lỗi phần cứng vi điều khiển |
| **Tổng Trang Cả Đời**|`printer.counter_total` | `1.3.6.1.2.1.43.10.2.1.4.1.1` | Counter32 | Marker Life Count trọn đời máy (Slow Polling 1h) |
| **Trang Mono (Ricoh)**|`ricoh.counter_mono` | `1.3.6.1.4.1.367.3.2.1.2.19.1.0` | Counter32 | Bộ đếm đen trắng riêng cho máy photo Ricoh |
| **Trang Màu (Ricoh)** |`ricoh.counter_color` | `1.3.6.1.4.1.367.3.2.1.2.19.2.0` | Counter32 | Bộ đếm màu riêng cho Ricoh C4503, C6004 |
| **Trang In Mạng** | `ricoh.counter_print` | `1.3.6.1.4.1.367.3.2.1.2.19.5.0` | Counter32 | Bản in mạng xuất từ máy tính văn phòng |
| **Trang Photocopy**| `ricoh.counter_copy` | `1.3.6.1.4.1.367.3.2.1.2.19.4.0` | Counter32 | Bản photocopy trực tiếp tại mặt kính |
| **Cuộn Lau Sấy Ricoh**|`ricoh.web_roller` | `1.3.6.1.4.1.367.3.2.1.2.4.2.1` | Integer | Cảnh báo cuộn lau sấy còn ít {30402} |
| **Trang Mono (Canon)**|`canon.counter_mono` | `1.3.6.1.4.1.1602.1.11.1.3.1.4.102` | Counter32 | Bộ đếm đen trắng dòng Canon LBP/MF |
| **Trang Duplex (Canon)**|`canon.counter_duplex`|`1.3.6.1.4.1.1602.1.11.1.3.1.4.106` | Counter32 | Tổng số trang in 2 mặt tiết kiệm giấy |
| **Tuổi Thọ Trống Canon**|`canon.drum_life` | `1.3.6.1.4.1.1602.1.11.1.4.1.1` | Integer | % Tuổi thọ cụm Trống Drum Canon |
| **Mực Đen (Black)**| `printer.toner_black` | Tự động qua Discovery `1.3.6.1.2.1.43.11.1.1` | Integer | % Mực Đen còn lại (`Level / MaxCapacity * 100`) |
| **Mực Màu CMY** | `printer.toner_cmy` | Tự động qua Discovery `1.3.6.1.2.1.43.11.1.1` | Integer | % Mực màu Cyan, Magenta, Yellow (Máy màu) |
| **Hộp Mực Thải** | `printer.waste_toner` | Tự động qua Discovery `1.3.6.1.2.1.43.11.1.1` | Integer | % Hộp mực thải (Cảnh báo khi > 80%, lỗi khi 100%) |
| **Mã Lỗi SC (Ricoh)**|`ricoh.sc_code` | `1.3.6.1.4.1.367.3.2.1.6.1.1.7.1` | Character | Bắt mã lỗi SC (SC541, SC542, SC320...) |
| **Mã Lỗi E (Canon)**| `canon.error_code` | `1.3.6.1.4.1.1602.1.1.1.1.0` | Character | Bắt mã lỗi Canon E-Code (E000, E001, E020...) |
| **Thông Điệp LCD** | `printer.display_text`| `1.3.6.1.2.1.43.16.5.1.2.1.1` | Character | Dòng thông báo hiển thị trên màn hình LCD |

---

## 4. Nguyên Tắc An Toàn Dữ Liệu & Loại Trừ Bắt Buộc ([AGENTS.md](file:///f:/Code/Github/Monitoring/.agent/rules/AGENTS.md) Rule 5.1)

1. **Loại trừ nắp cửa máy (Cover/Door Open):** Không cấu hình item hoặc trigger mở nắp máy. Người dùng tại chỗ tự đóng nắp máy.
2. **Loại trừ khay giấy/hết giấy (Paper Empty):** Không cấu hình trigger báo hết giấy. Người dùng tự nạp giấy khi máy báo đèn tại chỗ.
3. **Null-Safety:** Giá trị không thu thập được phải lưu trữ `null`, không được thay bằng số `0`.
