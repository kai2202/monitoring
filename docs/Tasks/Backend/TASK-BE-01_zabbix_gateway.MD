# TASK-BE-01: Zabbix 7.0 JSON-RPC Client & SNMP Collector Gateway

> **Phân hệ:** Backend / Data Collection Layer  
> **Mã nhiệm vụ:** TASK-BE-01  
> **Phiên bản:** 1.0.0 (Tối ưu hóa hạm đội ~100 máy in, In-Process Poller Service)  
> **Trạng thái:** ✅ Hoàn thành 100% (zabbixPollerService, fastPollingWorker 30s, slowPollingWorker 1h)  
> **Tài liệu liên quan:** [Kiến Trúc Hệ Thống](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md), [Bản Ánh Xạ OIDs](file:///f:/Code/Github/Monitoring/docs/Design/frontend_mock_to_oid_mapping.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Triển khai module **Zabbix Client & SNMP Collector Gateway** chạy ngầm trong tiến trình Express (In-Process Poller Service), kết nối tới máy chủ Zabbix 7.0 LTS thông qua giao thức JSON-RPC API 2.0. Module chịu trách nhiệm thu thập số liệu vận hành của ~100 máy in phân bổ trên 5 tầng/khu vực mà không gây quá tải mạng LAN hay CPU máy chủ:

1. **Fast Polling (Chu kỳ 30 giây):**
   - Thu thập trạng thái sống/chết (ICMP Ping `icmpping[<ip>]`) cho toàn bộ ~100 máy in tại Toà nhà Trụ sở chính (7 tầng) và các Chi nhánh vệ tinh (kết nối qua kênh VPN/SD-WAN).
   - Thu thập các cảnh báo kích hoạt (Active Triggers & Problems) qua `problem.get` và `trigger.get`.
   - Lưu trữ tức thì vào bộ đệm In-Memory Cache (TASK-BE-02) để cung cấp cho API `/api/printers` và `/api/dashboard/kpis`.
2. **Slow Polling (Chu kỳ 1 giờ):**
   - Thu thập số đếm trang in tích lũy cả đời máy (RFC 3805 `prtMarkerLifeCount` và các bộ đếm Color/Mono của Canon, Ricoh, Epson, HP, Brother, Toshiba, Olivetti).
   - Thu thập mức vật tư tiêu hao (Toner K, C, M, Y, Drum, Fuser, Hộp mực thải Waste Box).
   - Đẩy dữ liệu cho Rollup Aggregator (TASK-BE-04) để tính toán delta sản lượng và dự báo D-Day.
3. **Cơ Chế Safe Window (10 phút):**
   - Ngăn chặn hiện tượng giật trạng thái (Flapping) do chập chờn mạng WiFi/LAN. Một thiết bị chỉ chuyển sang `Offline` khi mất kết nối ICMP liên tục trong 10 phút.
4. **Khóa Cố Định Cấu Hình (Environment Hardened & Read-Only UI):**
   - Thông số Zabbix Server URL, Token và chu kỳ Polling (Fast: 30s, Slow: 1h) được nạp mặc định cố định từ biến môi trường (`backend/.env`).
   - Admin trên giao diện Web UI không có quyền sửa đổi; Backend chỉ cung cấp endpoint chỉ đọc `GET /api/settings/zabbix-status` (trả về trạng thái kết nối và URL đã che masking); từ chối mọi thao tác ghi `PUT/POST`.

---

## 2. Thiết Kế Kiến Trúc & Cấu Trúc File Mã Nguồn

```
backend/src/
├── config/
│   └── zabbixConfig.ts           # Đọc biến môi trường ZABBIX_URL, ZABBIX_API_TOKEN, POLL_INTERVAL
├── services/
│   └── zabbix/
│       ├── zabbixApiClient.ts    # Client gửi HTTP POST JSON-RPC 2.0 tới Zabbix Server
│       ├── fastPollingWorker.ts  # Worker chu kỳ 30s thu thập ICMP & Triggers
│       ├── slowPollingWorker.ts  # Worker chu kỳ 1h thu thập Counters & Supplies
│       └── zabbixPollerService.ts# Quản lý khởi động/dừng Poller (Graceful Lifecycle)
└── types/
    └── zabbixTypes.ts            # Khai báo TypeScript types cho Zabbix Host, Item, Problem, Trigger
```

---

## 3. Đặc Tả Giao Thức Zabbix JSON-RPC API 2.0

### 3.1. Xác thực & Quản trị Token
- Sử dụng Bearer Token cố định (Zabbix 7.0 API Token) truyền trong header `Authorization: Bearer <ZABBIX_API_TOKEN>` hoặc trong body JSON-RPC:
```json
{
  "jsonrpc": "2.0",
  "method": "host.get",
  "params": {
    "output": ["hostid", "host", "name", "status"],
    "selectInterfaces": ["ip", "type", "main"],
    "groupids": ["15"] // Nhóm máy in "Printers-Fleet"
  },
  "auth": "zabbix_api_token_here",
  "id": 1
}
```

### 3.2. Truy Vấn Sự Cố (Fast Polling 30s)
- **Method:** `problem.get` kết hợp `trigger.get`:
```json
{
  "jsonrpc": "2.0",
  "method": "problem.get",
  "params": {
    "output": ["eventid", "objectid", "name", "severity", "clock"],
    "selectAcknowledges": "extend",
    "recent": true,
    "sortfield": ["eventid"],
    "sortorder": "DESC"
  },
  "id": 2
}
```

---

## 4. Xử Lý Lỗi, Timeout & Biên Độ An Toàn (Resilience)

1. **Timeout Control:** Mọi request gửi tới Zabbix API có timeout cứng là **5.000ms** (5 giây). Sử dụng `AbortController` của `fetch` để tự động hủy request khi Zabbix bị treo.
2. **Circuit Breaker:** Khi Zabbix API lỗi liên tiếp 3 lần:
   - Chuyển cờ `zabbixConnected = false`.
   - Ghi nhận `isStale = true` trong bộ đệm In-Memory.
   - Giãn chu kỳ thử lại (Backoff) lên 15 giây thay vì spam request.
3. **Tuân thủ AGENTS.md Rule 5:** Tuyệt đối không sinh dữ liệu giả khi mất kết nối Zabbix API. Trả về snapshot gần nhất kèm cờ `isStale = true`.

---

## 5. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [ ] Kết nối thành công Zabbix 7.0 API với Token cấu hình trong file `.env`.
- [ ] Fast Polling quét đều đặn mỗi 30s không làm rò rỉ bộ nhớ (Memory Leak) hay treo Event Loop.
- [ ] Slow Polling kích hoạt chính xác mỗi 60 phút hoặc kích hoạt cưỡng bức qua endpoint `POST /api/printers/sync`.
- [ ] Safe Window 10 phút ngăn ngừa hiệu quả hiện tượng flapping khi mất gói ICMP đơn lẻ.
- [ ] Tự động ngắt kết nối an toàn (Graceful Shutdown) khi nhận tín hiệu `SIGINT` / `SIGTERM`.

