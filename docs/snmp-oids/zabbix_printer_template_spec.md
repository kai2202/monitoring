# Đặc tả Chuẩn Zabbix Template cho FleetMonitor (Zabbix 7.0 LTS)

Tài liệu này thống nhất toàn bộ **Items, OID, Preprocessing, LLD, Triggers, Host Groups và Webhook** cần có khi dựng hoặc import Template máy in trên Zabbix Server để đồng bộ 100% với Backend FleetMonitor (quy mô ~24 Site, ≤ 50 máy in).

**File đi kèm sẵn sàng để Import ngay (cùng thư mục):**

- **Template Zabbix 7.0 LTS (YAML):** [`zabbix_template_fleetmonitor_snmp.yaml`](./zabbix_template_fleetmonitor_snmp.yaml) _(Tên Template: `Template FleetMonitor SNMP Printer`)_
- **Từ điển Mã lỗi (CSV Import):** [`error_dictionary_import.csv`](./error_dictionary_import.csv)

---

## 1. Quy ước chung & Kết nối (ICMP + SNMP)

| Thành phần           | Cấu hình chuẩn trên Zabbix              | Mục đích trên FleetMonitor                            |
| :------------------- | :-------------------------------------- | :---------------------------------------------------- |
| **Interface**        | SNMP v2c (hoặc v3), port `161`          | Quét thông số Printer-MIB & nhận biết `SNMP:OK / Lỗi` |
| **ICMP Ping**        | Item key: `icmpping` (chu kỳ `30s–60s`) | Tách biệt `ICMP:OK / Lỗi` với `SNMP`                  |
| **Trigger mất mạng** | `max(/host/icmpping,#3)=0`              | Tránh báo Offline giả khi VPN chập chờn               |

### 1.1. Quy ước YAML Zabbix 7.0 LTS (Metadata, Chu kỳ & Lưu trữ)

Để file [`zabbix_template_fleetmonitor_snmp.yaml`](./zabbix_template_fleetmonitor_snmp.yaml) import mượt và không làm phình DB Zabbix:

| Nhóm Item | `value_type` | `delay` khuyến nghị | `history` | `trends` | Preprocessing khuyến nghị |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ICMP / Trạng thái / Mã lỗi** | `UNSIGNED` / `CHAR` | `30s` – `1m` | `7d` – `14d` | `365d` (hoặc `'0'` nếu `CHAR`) | `Discard unchanged with heartbeat: 1h` cho chuỗi lỗi |
| **Mực & Vật tư (LLD)** | `INTEGER` | `5m` | `14d` | `365d` | Giữ nguyên `-3`, `-2`, `-1` |
| **Bộ đếm trang (Counters)** | `UNSIGNED` | `1h` | `30d` | `730d` | Không cần biến đổi |
| **Định danh (`serial`, `model`, `max`)** | `CHAR` / `INTEGER` | `1d` | `7d` | `'0'` (nếu `CHAR`) | `Discard unchanged with heartbeat: 1d` |
| **SNMP Trap Fallback** | `LOG` | — | `14d` | `'0'` | — |

> [!NOTE]
> Mọi `uuid` trong YAML Zabbix 7.0 phải là chuỗi **32 ký tự hex** duy nhất (`[0-9a-f]{32}`). Khi thêm item/trigger mới vào YAML, luôn tạo UUID mới để tránh xung đột khi import đè.

### 1.2. Macros chuẩn ở cấp Template

| Macro | Giá trị mặc định | Mục đích |
| :--- | :--- | :--- |
| `{$SNMP_COMMUNITY}` | `public` | Cho phép ghi đè riêng từng Site/Host nếu đổi community string mà không phải sửa Template |
| `{$TONER_WARN_PCT}` | `15` | Ngưỡng cảnh báo mực thấp (`< 15%`) dùng trong Trigger Prototype |

---

## 2. Danh sách Items bắt buộc & Khuyến nghị (Printer-MIB)

### 2.1. Định danh thiết bị (Inventory / Meta)

| Tên hiển thị      | Key khuyến nghị (hoặc chứa chuỗi)              | OID chuẩn (Printer-MIB / Host-Resources) | Ghi chú                                             |
| :---------------- | :--------------------------------------------- | :--------------------------------------- | :-------------------------------------------------- |
| **Serial Number** | `prtGeneralSerialNumber` (hoặc chứa `serial`)  | `1.3.6.1.2.1.43.5.1.1.17.1`              | Tự động điền cột `S/N` nếu `host.description` thiếu |
| **Model máy in**  | `hrDeviceDescr` / `printer.model` / `sysDescr` | `1.3.6.1.2.1.25.3.2.1.3.1`               | Tự động điền `Model` nếu chưa khai báo              |

### 2.2. Mực in & Vật tư tiêu hao

Backend nhận diện theo `key_` chứa các từ khóa sau (không phân biệt hoa/thường):

| Vật tư               | Key mẫu trên Zabbix                         | OID tham khảo (`prtMarkerSuppliesLevel`) | Quy tắc Preprocessing                             |
| :------------------- | :------------------------------------------ | :--------------------------------------- | :------------------------------------------------ |
| **Mực đen (K)**      | `toner_black`, `toner_k`, `toner.black`     | `1.3.6.1.2.1.43.11.1.1.9.1.1`            | Giữ nguyên `-3`, `-2`, `-1` (**không** ép về `0`) |
| **Mực xanh (C)**     | `toner_cyan`, `toner_c`, `toner.cyan`       | `1.3.6.1.2.1.43.11.1.1.9.1.2`            | Chỉ dùng cho máy in màu (`Color`)                 |
| **Mực đỏ (M)**       | `toner_magenta`, `toner_m`, `toner.magenta` | `1.3.6.1.2.1.43.11.1.1.9.1.3`            | Chỉ dùng cho máy in màu (`Color`)                 |
| **Mực vàng (Y)**     | `toner_yellow`, `toner_y`, `toner.yellow`   | `1.3.6.1.2.1.43.11.1.1.9.1.4`            | Chỉ dùng cho máy in màu (`Color`)                 |
| **Cụm trống (Drum)** | `drum`                                      | `1.3.6.1.2.1.43.11.1.1.9.1.x`            | Tùy dòng máy (thiết bị không hỗ trợ -> `null`)    |
| **Cụm sấy (Fuser)**  | `fuser`                                     | `1.3.6.1.2.1.43.11.1.1.9.1.x`            | Tùy dòng máy                                      |
| **Hộp mực thải**     | `waste`                                     | `1.3.6.1.2.1.43.11.1.1.9.1.x`            | Trạng thái `OK` / `WARNING` / `FULL`              |

> [!IMPORTANT]
> **Xử lý giá trị thô & giá trị âm chuẩn Printer-MIB:**
>
> - Nếu Zabbix trả về phần trăm `[0..100]`: Backend lưu trực tiếp và cảnh báo `Warning` khi **`< 15%`**, `Critical` khi `<= 5%`.
> - Nếu Zabbix trả về giá trị thô (`> 100`) kèm item `...max` hoặc `...capacity`: Backend tự quy đổi `Math.round((level / max) * 100)`.
> - Giá trị `-3` (_someRemaining_), `-2` (_unknown_), `-1` (_other_): **Phải giữ nguyên**, không được dùng Preprocessing chuyển thành `0` (tránh báo giả `0% hết mực`).

### 2.3. Bộ đếm trang in (Counters) & Trạng thái thiết bị

- Key chuẩn trong `zabbix_template_fleetmonitor_snmp.yaml`:
  - `printer.counter_total` (`1.3.6.1.2.1.43.10.2.1.4.1.1` — `prtMarkerLifeCount`)
  - `ricoh.counter_mono` (`1.3.6.1.4.1.367.3.2.1.2.19.1.0`), `ricoh.counter_color` (`1.3.6.1.4.1.367.3.2.1.2.19.2.0`)
  - `printer.device_status` (`hrDeviceStatus`), `printer.display_text` (`prtConsoleDisplayText`), `ricoh.sc_code`
- Với **Mực & Vật tư**, Template YAML dùng Discovery `printer.supplies.discovery` sinh ra `printer.supply.level[{#SNMPINDEX}]` + `printer.supply.max[{#SNMPINDEX}]`; Backend tự khớp theo tên vật tư (`Black`/`Cyan`/`Magenta`/`Yellow`/`Drum`/`Fuser`) và quy đổi `%`.
  - Nếu muốn Zabbix chủ động bắn Webhook khi mực `< 15%`, dùng Trigger Prototype kiểm tra `level >= 0` và `max > 0` với biểu thức `(level / max) * 100 < {$TONER_WARN_PCT}` (bỏ qua giá trị âm `-3`, `-2`, `-1`).
- Bộ đếm là số nguyên tích lũy (`Counter32`); Backend tự xử lý tràn 32-bit và ghi nhận cảnh báo `COUNTER_RESET_DETECTED` nếu bộ đếm tụt bất thường.

---

## 3. Phát hiện Lỗi phần cứng, Kẹt giấy & OID lạ (LLD + Trap)

Theo `AGENTS.md` (Mục 6 & Mục 9.2), Template Zabbix **bắt buộc** có cơ chế phát hiện lỗi động để không bỏ sót mã lỗi mới:

1. **SNMP Low-Level Discovery (LLD) trên `prtAlertTable`:**
   - OID Discovery: `discovery[{#ALERT_DESC},1.3.6.1.2.1.43.18.1.1.8,{#ALERT_CODE},1.3.6.1.2.1.43.18.1.1.7,{#ALERT_SEV},1.3.6.1.2.1.43.18.1.1.2]`
   - Tự động sinh Item & Trigger cho mọi lỗi mới xuất hiện trong bảng cảnh báo động của máy in.
2. **Item `snmptrap.fallback` (nếu bật SNMP Trap):**
   - Hứng toàn bộ SNMP Trap có OID riêng của từng hãng (Enterprise MIB) chưa từng khai báo trước, kích hoạt Trigger đẩy sang Backend.
3. **Loại trừ thao tác tại chỗ (`AGENTS.md` Mục 5.1):**
   - Trong LLD Filter của Zabbix (hoặc để Backend lọc qua `shouldIgnoreLocalProblem`), **không** tạo Incident cho:
     - Mở nắp / cửa máy (`door open`, `cover open`, `prtCoverStatus`).
     - Hết giấy / khay giấy (`paper empty`, `tray empty`, `out of paper`).
4. **Quy tắc Trigger & Đóng sự cố (`manual_close`):**
   - **Tự động đóng (Auto-recovery):** Dùng cho `icmpping` khi mạng thông lại.
   - **`manual_close: 'YES'`:** Dùng cho lỗi phần cứng nghiêm trọng (`printer.device_status=5`, `ricoh.sc_code`, `prtAlertTable`, `snmptrap.fallback`) để tránh tự đóng nhầm khi máy reboot tạm thời.
5. **Mở rộng đa hãng (Vendor Private MIBs):**
   - Nhóm item lõi luôn dùng chuẩn **Printer-MIB (RFC 3805)** và **Host-Resources MIB (RFC 2790)** để chạy được cho mọi hãng (HP, Canon, Brother, Epson, Ricoh).
   - Các OID riêng từng hãng (như `ricoh.sc_code`, `ricoh.counter_mono`, `ricoh.counter_color`) đặt prefix theo hãng; nếu thiết bị hãng khác không hỗ trợ, Zabbix tự chuyển item đó sang *Not supported* mà không ảnh hưởng các item chuẩn khác.

---

## 4. Phân loại 24 Site & Cấu hình Webhook

### 4.1. Host Groups cho 24 Site

- Tạo **24 Host Group** trên Zabbix đặt tên khớp với tên Site (VD: `Site HCM-Q1`, `Site HN-CG`...).
- Hoặc đảm bảo IP của mỗi host nằm đúng dải mạng CIDR đã khai báo trong cột `subnet_cidr` trên FleetMonitor.

### 4.2. Action Webhook đẩy sự cố tức thời

Tạo Action gửi HTTP `POST` khi phát sinh **Problem** và **Recovery** về:

```text
POST http://<backend-host>/api/v1/incidents/zabbix-webhook
```

Payload tối thiểu cần có: `eventid`, `hostid`, `host`, `severity`, `trigger_name`, `status` (`PROBLEM` / `RESOLVED`).

---

## 5. Quy trình Import & Checklist Kiểm tra

1. **Kiểm tra thông mạng VPN & SNMP từ Zabbix Server (trước khi ghép Backend):**
   ```bash
   snmpwalk -v2c -c public <IP_MAY_IN_CHI_NHANH> 1.3.6.1.2.1.43
   ```
   Nếu trả về cây OID `43.x` là router DrayTek/MikroTik và cổng UDP `161` đã thông.
2. **Import Template vào Zabbix:** Vào _Data collection → Templates → Import_, chọn [`zabbix_template_fleetmonitor_snmp.yaml`](./zabbix_template_fleetmonitor_snmp.yaml).
2. **Import Từ điển mã lỗi vào Backend (tùy chọn):** Nạp [`error_dictionary_import.csv`](./error_dictionary_import.csv) qua tính năng Import CSV để giải nghĩa sẵn các mã lỗi SC/E-code phổ biến.
3. **Cấu hình kết nối:** Điền `ZABBIX_API_URL`, `ZABBIX_API_TOKEN` (hoặc `ZABBIX_USER` / `ZABBIX_PASSWORD`) vào `Backend/.env`.
4. **Gọi API kiểm tra thô từ Backend:**
   ```text
   GET /api/v1/printers/zabbix/diagnose
   ```
5. **Xác nhận:**
   - Danh sách `hosts` có đủ IP, Host Group (Site) và `available` của SNMP interface.
   - `items` có `icmpping`, `printer.serial`, `printer.model`, mức mực (`printer.supply.level[...]`), bộ đếm và LLD `prtAlertTable`.
   - `problems` trả về đúng mã lỗi gốc khi máy gặp sự cố phần cứng hoặc kẹt giấy.
