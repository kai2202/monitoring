# FleetMonitor — Đặc Tả Ánh Xạ Dữ Liệu Frontend Mock Sang Backend APIs, PostgreSQL & SNMP OIDs

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Tài liệu:** Bản Ánh Xạ Dữ Liệu Mock Frontend $\to$ REST APIs, Database Schemas & SNMP OIDs Từ Điển  
> **Phiên bản:** 1.0.0 (Tương thích Kiến Trúc v2.6.0 — Quy mô ~100 máy in, 100% Pure React SVG)  
> **Trạng thái:** Authoritative Engineering Cutover Reference (Tài liệu chuẩn bị đấu nối Backend)

---

## 1. Tổng Quan & Chiến Lược Cắt Chuyển (Decoupling & Cutover Strategy)

### 1.1. Hiện Trạng Mock Trong Frontend (`frontend/src/`)
Qua rà soát toàn bộ thư mục `frontend/src/`, hiện có **hai mô hình tiêu thụ mock data song song**:

1. **Mô hình Hướng Dịch Vụ Tách Rời (Service Provider Pattern - Đạt Chuẩn):**
   - Các trang như `DashboardPage.tsx` và `PrintersPage.tsx` nạp dữ liệu thông qua tầng trừu tượng `services/` (`printerService`, `taskService`, `incidentService`, `dashboardService`, `telemetryService`).
   - Tầng này đã có sẵn switch chuyển đổi tập trung `DATA_SOURCE = 'mock' | 'api'` tại `frontend/src/config/dataSource.ts`.
   - Khi kích hoạt `DATA_SOURCE = 'api'`, hệ thống tự động trỏ sang `ApiPrinterProvider`, `ApiTaskProvider`, v.v. và gọi REST API.

2. **Mô hình Import Trực Tiếp (Direct Import Anti-Pattern - Cần Khắc Phục):**
   - Các components trong phân hệ Phân tích (`features/analytics/`) như `PrintVolumePeakLineChart.tsx`, `ProductionHorizontalBarChart.tsx`, `PinnedComparisonSandbox.tsx`, `SuppliesForecastingSection.tsx`, `SLACostSection.tsx`, `DeviceComparisonModal.tsx` và `AnalyticsPage.tsx` đang import trực tiếp từ `mocks/mockAnalyticsUIData.ts` hoặc `mocks/mockTelemetry.ts`.

### 1.2. Ba Quyết Định Kiến Trúc Đã Được Thống Nhất (/grill-me Alignment)
1. **Mô hình Bóc tách Mock Analytics:** Mở rộng `TelemetryService` theo chuẩn **Provider Factory Pattern** (`MockTelemetryProvider` vs `ApiTelemetryProvider` chuyển đổi qua `DATA_SOURCE = 'mock' | 'api'`), đồng bộ hoàn toàn với kiến trúc đã vận hành ổn định tại `PrinterService` và `TaskService`.
2. **Độ phân giải Chuỗi thời gian 24h:** Áp dụng **Slow Polling Zabbix mỗi 1 giờ** để lấy `prtMarkerLifeCount` cho ~100 máy in, Backend tính toán Delta Rollup lưu trữ vào bảng `printer_hourly_volume` (tối ưu tải CPU/I/O, không gây nghẽn mạng).
3. **Chính sách Null-Safety cho vật tư không hỗ trợ:** Giữ nguyên quy tắc `MetricValue = number | null`, hiển thị dấu `—` khi máy in không hỗ trợ cảm biến Fuser/Drum hoặc là máy in đơn sắc (Mono); tự động **loại trừ các thiết bị này khỏi Bảng Cảnh Báo Khẩn Cấp D-Day** để tránh phát sinh cảnh báo giả gây phiền toái cho Kỹ thuật viên NOC.

---

## 2. Bảng Ánh Xạ Chi Tiết 5 Nhóm Dữ Liệu Mock Sang API, Database & SNMP OIDs

### 2.1. Nhóm 1: Danh Mục Máy In & Đo Lường Thời Gian Thực (Fleet Inventory & Realtime Telemetry)

| Dữ Liệu Mock Frontend | Component Tiêu Thụ | REST API Endpoint | Cột Bảng PostgreSQL | SNMP OID / Nguồn Thu Thập Thực Tế (Fast Polling 30s) |
| :--- | :--- | :--- | :--- | :--- |
| `p.id` (VD: `prt-001`) | `PrinterTableView`, `Drawer` | `GET /api/printers` | `printers.id` (VARCHAR) | Mã định danh nội bộ hệ thống (Primary Key) |
| `p.name`, `p.model`, `p.mfr` | `PrinterTableView`, `DrawerHeader` | `GET /api/printers` | `printers.name`, `model`, `mfr` | RFC 1213 / RFC 3805 `sysDescr` (`1.3.6.1.2.1.1.1.0`) hoặc `prtGeneralPrinterName` (`1.3.6.1.2.1.43.5.1.1.16.1`) |
| `p.ip` | `PrinterTableView`, `DrawerHeader` | `GET /api/printers` | `printers.ip` (INET/VARCHAR) | Cấu hình IP tĩnh hoặc DHCP Reservation từ Zabbix Host |
| `p.serial` | `DiagnosticsCmykTab`, `Drawer` | `GET /api/printers` | `printers.serial` (VARCHAR) | RFC 3805 `prtGeneralSerialNumber` (`1.3.6.1.2.1.43.5.1.1.17.1`) |
| `p.firmware` | `DiagnosticsCmykTab`, `Drawer` | `GET /api/printers` | `printers.firmware` (VARCHAR) | RFC 3805 `prtStorageRefFirmware` hoặc Vendor Enterprise MIB |
| `p.connectionStatus` | `StatusBadge`, `KpiCards` | `GET /api/printers` | `printers.connection_status` | Zabbix Agent / Simple Check ICMP Ping `icmpping[<ip>]` (0: Offline, 1: Online) |
| `p.health` | `StatusBadge`, `AttentionTable` | `GET /api/printers` | `printers.health` (Enum) | RFC 2790 `hrDeviceStatus` (`1.3.6.1.2.1.25.3.2.1.5`) & `hrPrinterDetectedErrorState` (`1.3.6.1.2.1.25.3.5.1.2`) |
| `p.alertSeverity` | `AttentionDevicesTable` | `GET /api/printers` | `printers.alert_severity` | RFC 3805 `prtAlertSeverityLevel` (`1.3.6.1.2.1.43.18.1.1.2`) (1=other, 3=warning, 4=critical) |
| `p.alertText` | `AttentionDevicesTable`, `Drawer` | `GET /api/printers` | `printers.alert_text` (TEXT) | RFC 3805 `prtConsoleDisplayBufferText` (`1.3.6.1.2.1.43.16.5.1.2.1.1`) hoặc `prtAlertDescription` (`1.3.6.1.2.1.43.18.1.1.8`) |
| `p.location` | `PrinterTableView`, `LocationEditor` | `PATCH /api/printers/:id/location` | `printers.location` (TEXT) | Cấu hình quản trị nội bộ / SNMP `sysLocation` (`1.3.6.1.2.1.1.6.0`) |
| `p.lastScrape` | `DrawerHeader`, `Footer` | `GET /api/printers` | `printers.last_scrape` (TIMESTAMPTZ) | Thời điểm Backend thực thi quét dữ liệu Zabbix gần nhất |

---

### 2.2. Nhóm 2: Mức Vật Tư Tiêu Hao & Dự Báo Cạn Kiệt D-Day (Supplies & Consumables)

| Dữ Liệu Mock Frontend | Component Tiêu Thụ | REST API Endpoint | Cột Bảng PostgreSQL | SNMP OID / Công Thức Backend (Slow Polling 1h) |
| :--- | :--- | :--- | :--- | :--- |
| `supplies.black` (K %) | `DiagnosticsCmykTab`, `SuppliesTable` | `GET /api/supplies/overview` | `printer_supplies_snapshot.black` | RFC 3805 `prtMarkerSuppliesLevel` / `prtMarkerSuppliesMaxCapacity` (`1.3.6.1.2.1.43.11.1.1.9` / `.8` với Desc khớp 'Black') |
| `supplies.cyan` (C %) | `DiagnosticsCmykTab`, `SuppliesTable` | `GET /api/supplies/overview` | `printer_supplies_snapshot.cyan` | RFC 3805 `prtMarkerSuppliesTable` (Desc khớp 'Cyan'). Trả về `null` nếu là máy in đơn sắc (Mono) |
| `supplies.magenta` (M %) | `DiagnosticsCmykTab`, `SuppliesTable` | `GET /api/supplies/overview` | `printer_supplies_snapshot.magenta` | RFC 3805 `prtMarkerSuppliesTable` (Desc khớp 'Magenta'). Trả về `null` nếu là máy Mono |
| `supplies.yellow` (Y %) | `DiagnosticsCmykTab`, `SuppliesTable` | `GET /api/supplies/overview` | `printer_supplies_snapshot.yellow` | RFC 3805 `prtMarkerSuppliesTable` (Desc khớp 'Yellow'). Trả về `null` nếu là máy Mono |
| `supplies.waste` (Bình mực thải) | `HighLoadFleetSuppliesTable` | `GET /api/supplies/overview` | `printer_supplies_snapshot.waste` | **Chuẩn RFC 3805:** `prtMarkerSuppliesClass = 4` (receptacle)<br>**Ricoh:** `.1.3.6.1.4.1.367.3.2.1.2.4.2.4.0` (1=OK, 2=Sắp đầy, 3=Đầy)<br>**Canon:** `.1.3.6.1.4.1.1602.1.11.2.1.1.3` |
| `drumLife` (Tuổi thọ Drum %) | `HighLoadFleetSuppliesTable` | `GET /api/supplies/overview` | `printer_supplies_snapshot.drum` | RFC 3805 `prtMarkerSuppliesTable` (Desc chứa 'Drum' / 'OPC'). Trả về `null` nếu thiết bị không hỗ trợ |
| `fuserLife` (Tuổi thọ Sấy %) | `HighLoadFleetSuppliesTable` | `GET /api/supplies/overview` | `printer_supplies_snapshot.fuser` | RFC 3805 `prtMarkerSuppliesTable` (Desc chứa 'Fuser' / 'Fixing'). Trả về `null` nếu không hỗ trợ |
| `dailyBurnRate` (% tiêu hao/ngày) | `UrgentConsumablesAlertsTable` | `GET /api/supplies/alerts` | Tính toán Backend (In-Memory) | $\text{burn\_rate} = \frac{\text{Supply}(t-7) - \text{Supply}(t)}{7}$. Nếu $\le 0$ thì trả về `null` |
| `daysRemaining` (Số ngày [D-Day]) | `UrgentConsumablesAlertsTable` | `GET /api/supplies/alerts` | Tính toán Backend (In-Memory) | $\text{daysRemaining} = \text{round}\left(\frac{\text{CurrentPercent}}{\text{dailyBurnRate}}\right)$. Null-safe |
| `estimatedEmptyDate` | `UrgentConsumablesAlertsTable` | `GET /api/supplies/alerts` | Tính toán Backend (In-Memory) | $\text{Now} + \text{daysRemaining}$ định dạng DD/MM/YYYY |

---

### 2.3. Nhóm 3: Sản Lượng In Ấn & Chuỗi Thời Gian (Print Volume & Time Series Rollup)

| Dữ Liệu Mock Frontend | Component Tiêu Thụ | REST API Endpoint | Cột Bảng PostgreSQL | SNMP OID / Cơ Chế Tính Toán Backend |
| :--- | :--- | :--- | :--- | :--- |
| `counters.total` | `DiagnosticsCmykTab`, `CountersTab` | `GET /api/printers/:id` | `printer_counters.total_count` | **RFC 3805:** `prtMarkerLifeCount` (`1.3.6.1.2.1.43.10.2.1.4.1.1`)<br>**Ricoh:** `.1.3.6.1.4.1.367.3.2.1.2.19.1.0`<br>**Canon:** `.1.3.6.1.4.1.1602.1.11.1.3.1.4.101`<br>**HP:** `.1.3.6.1.4.1.11.2.3.9.4.2.1.4.1.2.5.0` |
| `baseHourly` (24 điểm) | `PrintVolumePeakLineChart` | `GET /api/telemetry/volume-trend?timeframe=hourly` | `printer_hourly_volume.total_pages` | Backend Hourly Rollup Worker: $\Delta \text{LifeCount} = \text{Count}(h) - \text{Count}(h-1)$ (Kiểm tra chống tràn 32-bit) |
| `base7Days` (7 điểm) | `PrintVolumePeakLineChart` | `GET /api/telemetry/volume-trend?timeframe=7days` | `printer_daily_volume.total_pages` | Tổng hợp từ bảng `printer_daily_volume` trong 7 ngày gần nhất |
| `base30Days` (30 điểm) | `PrintVolumePeakLineChart` | `GET /api/telemetry/volume-trend?timeframe=30days` | `printer_daily_volume.total_pages` | Tổng hợp từ bảng `printer_daily_volume` trong 30 ngày gần nhất |
| `monoRatio` / `monoPages` | `ProductionHorizontalBarChart`, `Sandbox` | `GET /api/telemetry/distribution` | `printer_daily_volume.mono_pages` | **Ricoh:** `.1.3.6.1.4.1.367.3.2.1.2.19.5.1.5.2` (Mono Counter)<br>**Canon:** `.1.3.6.1.4.1.1602.1.11.1.3.1.4.103`<br>**HP:** $\text{Total} - \text{Color}$ |
| `colorPages` | `ProductionHorizontalBarChart`, `Sandbox` | `GET /api/telemetry/distribution` | `printer_daily_volume.color_pages` | **Ricoh:** `.1.3.6.1.4.1.367.3.2.1.2.19.5.1.5.1` (Color Counter)<br>**Canon:** `.1.3.6.1.4.1.1602.1.11.1.3.1.4.102`<br>**HP:** `.1.3.6.1.4.1.11.2.3.9.4.2.1.4.1.2.7.0` |
| `peakPill` (Đỉnh tải) | `LineChartSplineSvg` | Trả kèm trong API `volume-trend` | Tính toán Backend (Max Value) | Tìm giá trị $\max(\text{series})$ kèm nhãn mốc giờ/ngày tương ứng |

---

### 2.4. Nhóm 4: Hiệu Suất SLA, Điểm Nóng & Chi Phí (SLA, Hotspot Heatmap & Costs)

| Dữ Liệu Mock Frontend | Component Tiêu Thụ | REST API Endpoint | Cột Bảng PostgreSQL | Nguồn Dữ Liệu / Thuật Toán Backend |
| :--- | :--- | :--- | :--- | :--- |
| `fleetUptime` (VD: 99.4%) | `SLAKpiCards` | `GET /api/telemetry/sla-kpis` | `maintenance_tickets`, `printers` | $\text{Uptime} = \frac{\sum T_{\text{online}}}{T_{\text{total}} \times 100} \times 100\%$ tính trên toàn bộ 100 máy in |
| `avgMtbfHours` (VD: 486h) | `SLAKpiCards` | `GET /api/telemetry/sla-kpis` | `maintenance_tickets` | $MTBF = \frac{\sum T_{\text{online}}}{\text{Count(incidents)}}$ (Thời gian chạy ổn định trung bình) |
| `avgMttrMinutes` (VD: 38m) | `SLAKpiCards` | `GET /api/telemetry/sla-kpis` | `maintenance_work_logs` | $MTTR = \frac{\sum (finished\_at - started\_at)}{\text{Count(work\_logs resolved)}}$ |
| `jamRatePercent` (VD: 1.6%) | `SLAKpiCards` | `GET /api/telemetry/sla-kpis` | `printer_daily_volume`, `tickets` | $\frac{\text{Số vụ kẹt giấy (Subsystem FED)}}{\text{Tổng sản lượng trang in}} \times 1.000$ (tỷ lệ trên ngàn trang) |
| `departmentCosts` (Chi phí phòng ban) | `CostAllocationArcChart` | `GET /api/telemetry/cost-allocation` | `maintenance_work_logs`, `printers` | Group theo `department_id`: $\sum (\text{parts\_cost} + \text{labor\_cost}) + (\text{mono\_pages} \times C_{\text{mono}} + \text{color\_pages} \times C_{\text{color}})$ |
| `avgCostPerPage` (CPP) | `SLAKpiCards` | `GET /api/telemetry/sla-kpis` | Tính toán Backend | $CPP = \frac{\text{Tổng chi phí bảo trì & vật tư}}{\text{Tổng sản lượng in hạm đội}}$ (VNĐ/trang) |
| `INCIDENT_MATRIX_COUNTS` (5x7) | `SLAIncidentHeatmapMatrix` | `GET /api/telemetry/incident-matrix` | `maintenance_tickets` | Truy vấn `COUNT(id)` gom nhóm theo `floor_id` (5 tầng) và ISO 8601 Week (7 tuần gần nhất) |

---

### 2.5. Nhóm 5: Quản Trị Bảo Trì & Chuẩn Hóa Mã Lỗi (CMMS & Error Code Standards)

| Dữ Liệu Mock Frontend | Component Tiêu Thụ | REST API Endpoint | Cột Bảng PostgreSQL | SNMP OID / Cơ Chế Phân Loại Backend |
| :--- | :--- | :--- | :--- | :--- |
| `mockTasks` (Danh sách lệnh) | `WorkOrdersTable`, `Gantt` | `GET /api/maintenance/tasks` | `maintenance_tasks.*` | Lưu trữ trong PostgreSQL 16 (Hỗ trợ lọc theo trạng thái, ngày tới hạn) |
| `dynamicSteps` (Stepper SOP) | `DrawerTasksTab` | `GET /api/maintenance/tasks/:id` | `maintenance_tasks.dynamic_steps` (JSONB) | Mảng các bước kiểm tra động: `[{ id, label, completed, updated_at }]` |
| `workLogs` (Nhật ký thực địa) | `DrawerTasksTab` | `GET /api/maintenance/tasks/:id/worklogs` | `maintenance_work_logs.*` | Ghi nhận chi tiết: Kỹ thuật viên, giờ can thiệp, linh kiện, chi phí VNĐ, in thử |
| `attachments` (Ảnh, biên bản) | `DrawerTasksTab` | `POST /api/maintenance/worklogs/:id/attachments` | `work_log_attachments.*` | MinIO S3 Object Storage (`printers/{id}/tasks/{taskId}/worklogs/{id}/...`) |
| Mã lỗi hãng (VD: `SC542`, `E000`) | `Drawer`, `AttentionTable` | `GET /api/incidents` | `vendor_error_mappings.vendor_code` | **Ricoh SC:** `.1.3.6.1.4.1.367.3.2.1.6.1.1.7.1`<br>**Canon E-code:** `.1.3.6.1.4.1.1602.1.1.1.1.0`<br>**HP Numeric:** `.1.3.6.1.4.1.11.2.3.9.4.2.1.1.2.1.0` |
| Mã lỗi nội bộ `FM-<SUBSYSTEM>-<INDEX>` | `DiagnosticsCmykTab`, `Settings` | `GET /api/error-codes/search` | `internal_error_definitions.id` | Tra cứu tự động từ bảng ánh xạ `vendor_error_mappings` nạp qua CSV |
| Mã lỗi unmapped `FM-UNK-01` | `AttentionTable`, `Settings` | `GET /api/error-codes/unmapped-queue` | `maintenance_tickets.internal_error_code` | Kích hoạt Fallback Engine khi không tìm thấy ánh xạ, giữ nguyên `raw_vendor_code` |

---

## 3. Danh Mục Chi Tiết SNMP OIDs Đa Hãng Đã Được Xác Minh (Verified Facts Only)

Tuân thủ nghiêm ngặt **Quy tắc 1 & 5 trong AGENTS.md** (Tuyệt đối không bịa đặt OID, chỉ sử dụng MIB đã kiểm chứng):

### 3.1. Standard Printer-MIB (RFC 3805) & Host Resources MIB (RFC 2790)
*Áp dụng chung cho toàn bộ các hãng (Ricoh, Canon, HP, Brother, Epson, Xerox):*
- `1.3.6.1.2.1.25.3.2.1.5` — `hrDeviceStatus` (1: unknown, 2: running, 3: warning, 4: testing, 5: down)
- `1.3.6.1.2.1.25.3.5.1.1` — `hrPrinterStatus` (1: other, 2: unknown, 3: idle, 4: printing, 5: warmup)
- `1.3.6.1.2.1.25.3.5.1.2` — `hrPrinterDetectedErrorState` (Bit flags: kẹt giấy, hết giấy, hết mực, mở nắp...)
- `1.3.6.1.2.1.43.5.1.1.16.1` — `prtGeneralPrinterName` (Tên thiết bị gán trong firmware)
- `1.3.6.1.2.1.43.5.1.1.17.1` — `prtGeneralSerialNumber` (Số Serial máy in)
- `1.3.6.1.2.1.43.6.1.1.2` — `prtCoverStatus` (1: other, 3: coverOpen, 4: coverClosed, 5: interlockOpen...)
- `1.3.6.1.2.1.43.8.2.1.10` — `prtInputCurrentLevel` (Mức giấy hiện tại trong khay)
- `1.3.6.1.2.1.43.8.2.1.9` — `prtInputMaxCapacity` (Dung lượng tối đa của khay giấy)
- `1.3.6.1.2.1.43.10.2.1.4.1.1` — `prtMarkerLifeCount` (Tổng số trang in tích lũy cả đời máy - Total Life Counter)
- `1.3.6.1.2.1.43.11.1.1.6` — `prtMarkerSuppliesDescription` (Tên linh kiện/vật tư: Black Toner, Drum Unit...)
- `1.3.6.1.2.1.43.11.1.1.8` — `prtMarkerSuppliesMaxCapacity` (Dung tích tối đa vật tư)
- `1.3.6.1.2.1.43.11.1.1.9` — `prtMarkerSuppliesLevel` (Mức vật tư hiện tại, $-1$: other, $-2$: unknown, $-3$: remaining)
- `1.3.6.1.2.1.43.16.5.1.2.1.1` — `prtConsoleDisplayBufferText` (Dòng chữ hiển thị trên màn hình LCD máy in)
- `1.3.6.1.2.1.43.18.1.1.2` — `prtAlertSeverityLevel` (3: warning, 4: critical)
- `1.3.6.1.2.1.43.18.1.1.8` — `prtAlertDescription` (Chuỗi thông tin cảnh báo kỹ thuật)

### 3.2. Ricoh Private Enterprise MIB (`.1.3.6.1.4.1.367`)
- `.1.3.6.1.4.1.367.3.2.1.2.19.1.0` — Ricoh Total Counter (Tổng số trang)
- `.1.3.6.1.4.1.367.3.2.1.2.19.5.1.5.1` — Ricoh Color Counter (Tổng số trang màu)
- `.1.3.6.1.4.1.367.3.2.1.2.19.5.1.5.2` — Ricoh Black/White Counter (Tổng số trang đơn sắc)
- `.1.3.6.1.4.1.367.3.2.1.2.19.2.1.0` — Ricoh Copier Counter (Trang Photocopy)
- `.1.3.6.1.4.1.367.3.2.1.2.19.3.1.0` — Ricoh Printer Counter (Trang In từ máy tính)
- `.1.3.6.1.4.1.367.3.2.1.2.4.2.4.0` — Ricoh Waste Toner Bottle Status (1: Normal, 2: Near Full, 3: Full)
- `.1.3.6.1.4.1.367.3.2.1.6.1.1.7.1` — Ricoh Service Call Error Code (Chuỗi mã lỗi SC, ví dụ SC542-01)

### 3.3. Canon Private Enterprise MIB (`.1.3.6.1.4.1.1602`)
- `.1.3.6.1.4.1.1602.1.11.1.3.1.4.101` — Canon Total Page Counter
- `.1.3.6.1.4.1.1602.1.11.1.3.1.4.102` — Canon Color Page Counter
- `.1.3.6.1.4.1.1602.1.11.1.3.1.4.103` — Canon Black Page Counter
- `.1.3.6.1.4.1.1602.1.11.2.1.1.3` — Canon Waste Toner Box State
- `.1.3.6.1.4.1.1602.1.1.1.1.0` — Canon E-Code String (Chuỗi mã lỗi E-code, ví dụ E000-0001)

### 3.4. HP Private Enterprise MIB (`.1.3.6.1.4.1.11`)
- `.1.3.6.1.4.1.11.2.3.9.4.2.1.4.1.2.5.0` — HP Total Page Count
- `.1.3.6.1.4.1.11.2.3.9.4.2.1.4.1.2.7.0` — HP Color Page Count
- `.1.3.6.1.4.1.11.2.3.9.4.2.1.4.1.2.10.0` — HP Waste Toner Container Level
- `.1.3.6.1.4.1.11.2.3.9.4.2.1.1.2.1.0` — HP Numeric Hardware Error Code (Ví dụ: 50.1, 49.xxxx)

---

## 4. Danh Sách Các Điểm Trong Code Frontend Cần Refactor Khi Cắt Chuyển (Actionable Refactor List)

Trước khi kích hoạt `DATA_SOURCE = "api"`, các components sau cần loại bỏ việc import trực tiếp từ file mock:

1. **`frontend/src/pages/AnalyticsPage.tsx`:**
   - *Hiện trạng:* Import `MOCK_PRINTER_DEFINITIONS`, `getMockFloorSummaries` từ `mocks/mockAnalyticsUIData`.
   - *Cần sửa:* Nạp dữ liệu qua `telemetryService.getFloorSummaries()` hoặc Redux RTK Query hook `useGetFloorSummariesQuery()`.
2. **`features/analytics/components/linechart/PrintVolumePeakLineChart.tsx`:**
   - *Hiện trạng:* Import `MOCK_PRINTER_DEFINITIONS` để tính `baseHourly`, `base7Days`, `base30Days`.
   - *Cần sửa:* Nhận `timeSeriesData` qua props từ `AnalyticsPage` (đã nạp từ `/api/telemetry/volume-trend`) hoặc fetch qua RTK Query.
3. **`features/analytics/components/distribution/ProductionHorizontalBarChart.tsx` & `PinnedComparisonSandbox.tsx`:**
   - *Hiện trạng:* Import `MOCK_PRINTER_DEFINITIONS` để tính tỷ trọng Mono/Color.
   - *Cần sửa:* Đọc danh sách thiết bị kèm sản lượng từ Redux state hoặc API `/api/telemetry/distribution`.
4. **`features/analytics/components/supplies/SuppliesForecastingSection.tsx`:**
   - *Hiện trạng:* Gán cứng `allAlerts = MOCK_CONSUMABLE_ALERTS` và `getMockPrinterConsumablesOverview()`.
   - *Cần sửa:* Gọi `suppliesService.getConsumableAlerts()` và `suppliesService.getSuppliesOverview()`.
5. **`features/analytics/components/sla/SLACostSection.tsx` & `SLAIncidentHeatmapMatrix.tsx`:**
   - *Hiện trạng:* Gán cứng `MOCK_SLA_OVERVIEW_KPIS`, `MOCK_DEPARTMENT_COSTS` và `slaHeatmapData.ts`.
   - *Cần sửa:* Gọi `telemetryService.getSLAKpis()`, `telemetryService.getDepartmentCosts()`, và `telemetryService.getIncidentHeatmap()`.
6. **`features/analytics/components/comparison/DeviceComparisonModal.tsx`:**
   - *Hiện trạng:* Import `getMockComparisonKPIs(selectedPrinterIds)`.
   - *Cần sửa:* Gọi `telemetryService.getComparisonKPIs(selectedPrinterIds)`.

---

## 5. Quy Chuẩn Xử Lý Giá Trị Thiếu & Biên Độ An Toàn (Null-Safety & Fallback Policy)

Tuân thủ nghiêm ngặt **Quy tắc 5 trong AGENTS.md**:
1. **Giá trị `MetricValue = number | null`:**
   - Tuyệt đối không biến đổi `null` thành số `0`.
   - Nếu máy in không hỗ trợ OID (ví dụ: máy mono không có mực C/M/Y, hoặc máy để bàn không báo chỉ số Fuser/Drum): Giao diện bắt buộc hiển thị dấu gạch ngang `—` hoặc nhãn `Chưa có dữ liệu`.
2. **Cơ chế Stale Data khi mất mạng:**
   - Nếu Backend không kết nối được Zabbix sau thời gian đệm TTL 60s, Backend trả về dữ liệu snapshot gần nhất kèm cờ `isStale = true`.
   - Giao diện hiển thị biểu tượng cảnh báo màu hổ phách và nhãn `Dữ liệu đã cũ`. Tuyệt đối không âm thầm sinh dữ liệu mock để lấp liếm lỗi kết nối.
