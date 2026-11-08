# TASK-BE-04: Zabbix 7.0 JSON-RPC Client & Hybrid Ingestion Gateway

> **Phân hệ:** Backend / Zabbix API Integration  
> **Mã nhiệm vụ:** TASK-BE-04 (Giai đoạn 4 / 18 trong Master Roadmap)  
> **Phiên bản:** 2.0.0 (Hybrid: JSON-RPC Pull + Webhook Receiver, Không SNMP trực tiếp)  
> **Trạng thái:** ✅ Hoàn thành (zabbixApiClient.ts, fastPollingWorker 30s, slowPollingWorker 1h, Safe Window 10m)  
> **Tài liệu liên quan:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [Kiến Trúc Hệ Thống](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md), [Từ Điển Zabbix OIDs](file:///f:/Code/Github/Monitoring/docs/snmp-oids/README.md)

---

## 1. Mục Tiêu & Ranh Giới Kỹ Thuật

Triển khai module **Zabbix Client & Hybrid Ingestion Gateway** chạy trong Backend Express/TypeScript, kết nối tới máy chủ Zabbix 7.0 LTS cục bộ trong mạng LAN.

> [!IMPORTANT]
> **Ranh giới cốt lõi:** Zabbix 7.0 LTS là nền tảng duy nhất giao tiếp SNMP và ICMP với máy in. Backend FleetMonitor **không** trực tiếp polling SNMP, không gửi SNMP walk/get, không thay thế chức năng giám sát của Zabbix. Backend chỉ đóng vai trò trung tâm xử lý dữ liệu nghiệp vụ.

Module chịu trách nhiệm nạp dữ liệu kỹ thuật thông qua hai cơ chế bổ trợ:

1. **Cơ Chế Kéo Chủ Động (Backend Pull Zabbix JSON-RPC 2.0):**
   - **Fast Polling Worker (Chu kỳ 30 giây):**
     - Thu thập trạng thái sống/chết (ICMP Ping `icmpping[<ip>]`) cho toàn bộ máy in.
     - Thu thập các cảnh báo kích hoạt (Active Triggers & Problems) qua `problem.get` và `trigger.get`.
     - Lưu trữ tức thì vào bộ đệm In-Memory Cache (TASK-BE-16) để cung cấp cho API `/api/printers` và `/api/dashboard/kpis`.
   - **Slow Polling Worker (Chu kỳ 1 giờ):**
     - Thu thập số đếm trang in tích lũy cả đời máy (RFC 3805 `prtMarkerLifeCount` và các bộ đếm Color/Mono của Ricoh, Canon, HP, Brother, Epson, Xerox).
     - Thu thập mức vật tư tiêu hao (Toner K, C, M, Y, Drum, Fuser, Hộp mực thải Waste Box).
     - Đẩy dữ liệu cho Telemetry Normalization Engine (TASK-BE-05) để tính toán delta sản lượng và dự báo D-Day.

2. **Cơ Chế Đẩy Tức Thời Bổ Trợ (Zabbix Webhook Receiver):**
   - Tiếp nhận sự kiện `Problem` và `Recovery` qua endpoint `POST /api/v1/integrations/zabbix-webhook`.
   - Cơ chế bảo mật: Xác thực qua Bearer Token / Webhook Secret Header.
   - Cơ chế Idempotency: Kiểm tra `eventid` trong bộ đệm In-Memory Cache để chống xử lý trùng lặp khi cả Webhook và Fast Polling cùng tiếp nhận một sự kiện.

3. **Cơ Chế Cửa Sổ An Toàn (Safe Window 10 phút):**
   - Triệt tiêu hiện tượng báo động giả (Flapping) do chập chờn mạng LAN. Máy in chỉ được chuyển sang `Offline` khi mất kết nối ICMP liên tục trong $\ge 10$ phút.

4. **Khóa Cố Định Cấu Hình (Environment Hardened & Zero-Mock in Backend):**
   - URL Zabbix Server và API Token được cấu hình cố định trong biến môi trường (`.env`).
   - Backend **tuyệt đối không sử dụng mock dữ liệu**: Kết nối trực tiếp tới container Zabbix Server 7.0 LTS thật được khởi chạy qua Docker Compose trong mạng LAN nội bộ.
   - Giao diện người dùng không được phép chỉnh sửa trực tiếp cấu hình Zabbix; Backend chỉ cung cấp endpoint chỉ đọc `GET /api/v1/settings/zabbix-status` (URL đã được che masking bảo mật).

---

## 2. Cấu Trúc Mã Nguồn Module

```
Backend/src/
├── config/
│   └── zabbixConfig.ts           # Đọc biến môi trường ZABBIX_URL, ZABBIX_API_TOKEN, POLL_INTERVAL
├── services/
│   └── zabbix/
│       ├── zabbixApiClient.ts    # Client gửi HTTP POST JSON-RPC 2.0 tới Zabbix Server
│       ├── fastPollingWorker.ts  # Worker chu kỳ 30s thu thập ICMP & Triggers
│       ├── slowPollingWorker.ts  # Worker chu kỳ 1h thu thập Counters & Supplies
│       └── zabbixPollerService.ts# Quản lý khởi động/dừng Poller (Graceful Lifecycle)
├── controllers/
│   └── zabbixWebhookController.ts# Endpoint POST /api/v1/integrations/zabbix-webhook
└── types/
    └── zabbixTypes.ts            # Khai báo TypeScript types cho Zabbix Host, Item, Problem, Trigger
```

---

## 3. Đặc Tả Giao Thức Zabbix JSON-RPC API 2.0

### 3.1 Khung bao yêu cầu chuẩn (JSON-RPC Request)
```json
{
  "jsonrpc": "2.0",
  "method": "host.get",
  "params": {
    "output": ["hostid", "host", "name", "status"],
    "selectInterfaces": ["ip", "dns", "useip", "port"]
  },
  "auth": "042404d977713171152ec9a6c33a109d4484db80a0fe009f",
  "id": 1
}
```

### 3.2 Khung bao phản hồi chuẩn (JSON-RPC Response)
```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "hostid": "10084",
      "host": "RICOH_MP_C3504_T1",
      "name": "Ricoh MP C3504 - Tầng 1 P.Kế Toán",
      "status": "0"
    }
  ],
  "id": 1
}
```

---

## 4. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

1. **Ranh Giới Bắt Buộc:** Backend không chứa bất kỳ thư viện hoặc câu lệnh SNMP trực tiếp nào (`net-snmp`, `snmpjs`...). Mọi dữ liệu kỹ thuật bắt buộc đi qua Zabbix API hoặc Webhook.
2. **Khả Năng Chịu Lỗi:** Khi Zabbix Server tạm thời ngừng hoạt động, Backend ghi log có cấu trúc (Structured Logging), đánh dấu dữ liệu trả về Frontend là `isStale: true`, tuyệt đối không gây sập tiến trình Node.js.
3. **Hiệu Năng & Tài Nguyên:** Chu kỳ Fast Polling 30s hoàn thành trong $< 2$ giây với ~100 máy in; mức sử dụng RAM của Poller Service duy trì dưới 15MB.

