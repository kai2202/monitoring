# Backend API Gateway — FleetMonitor

> **Dịch vụ cầu nối trung gian kết nối Zabbix Web API với Giao diện Giám sát Máy in**  
> Xây dựng trên nền tảng Node.js, Express, TypeScript và Prisma ORM.

---

## 1. Vai Trò & Kiến Trúc Tích Hợp

Trong hệ thống FleetMonitor, Zabbix Server và Web UI được triển khai độc lập (ví dụ trên máy ảo Ubuntu Server). **Backend API Gateway** đóng vai trò là tầng dịch vụ bảo mật và chuẩn hóa dữ liệu:

```mermaid
flowchart LR
    Z_WEB["Zabbix Web UI & API<br/>(Ubuntu Server VM)"] 
    -->|JSON-RPC 2.0<br/>api_jsonrpc.php| B_CLIENT["Zabbix Client<br/>(backend/src/zabbix)"]
    
    subgraph BackendGateway["Backend API Gateway (Port 3001)"]
        B_CLIENT --> B_CACHE["In-Memory Cache<br/>(TTL 60s)"]
        B_CACHE --> B_SERVICE["PrinterDataService<br/>(Data Mapping & Normalization)"]
        B_SERVICE --> B_ROUTES["REST Router<br/>(/api/printers, /api/incidents)"]
        B_SERVICE <--> B_DB[("Prisma ORM<br/>(Incident Lifecycle)")]
    end

    B_ROUTES -->|REST JSON| UI["Frontend Dashboard<br/>(React 18 / Port 3000)"]
```

### Tại sao cần Backend Gateway mà không gọi trực tiếp từ Web Frontend?
1. **Bảo mật bí mật thông tin (Security):** Token API và tài khoản quản trị Zabbix được giữ an toàn tuyệt đối ở phía server, không bao giờ bị lộ ra trình duyệt client.
2. **Giảm tải cho Zabbix (Caching):** Cơ chế in-memory caching với TTL 60 giây gom các yêu cầu từ nhiều người dùng truy cập website, giảm thiểu số lượng truy vấn JSON-RPC tới Zabbix Server.
3. **Khả năng kháng lỗi (Resilience & Stale Data):** Khi máy ảo Zabbix bị tắt hoặc mạng chập chờn, Backend tự động trả về snapshot dữ liệu hợp lệ gần nhất kèm cờ `isStale: true`, giúp giao diện người dùng không bị sập.
4. **Quản lý vòng đời sự cố (Incident Management):** Zabbix kích hoạt Problem khi có lỗi, nhưng Backend và cơ sở dữ liệu ứng dụng đảm nhiệm việc theo dõi vòng đời: ghi nhận thời gian bắt đầu, phân công xử lý, chống trùng lặp (deduplication) và đánh dấu giải quyết sự cố.
5. **Chuẩn hóa mô hình dữ liệu (Schema Adapter):** Chuyển đổi định dạng dữ liệu raw từ Zabbix (Item Keys, bitmask, triggers) thành domain models trực quan cho Frontend (`MetricValue = number | null`).

---

## 2. Cấu Trúc Mã Nguồn

```text
backend/
├── src/
│   ├── index.ts                  # Khởi tạo Express server, CORS, graceful shutdown
│   ├── api/
│   │   └── routes/
│   │       ├── index.ts          # Centralized route registration (/api)
│   │       ├── printers.routes.ts# REST endpoints: GET /api/printers, GET /api/printers/:id
│   │       ├── incidents.routes.ts # REST endpoints: GET /api/incidents, POST /api/incidents/:id/resolve
│   │       ├── sync.routes.ts    # REST endpoints: POST /api/sync/trigger
│   │       └── telemetry.routes.ts # REST endpoints: GET /api/telemetry/history
│   ├── diagnostics/              # Hardware Diagnostics Catalog (Tra cứu SC Codes & Alarm Codes)
│   │   ├── index.ts              # Diagnostic resolver & error severity mapper
│   │   ├── types.ts              # Type definitions cho Subsystem, Severity, Code
│   │   ├── vendors/
│   │   │   ├── ricoh.ts          # Từ điển SC Code máy in Ricoh (SC1xx - SC8xx)
│   │   │   ├── canon.ts          # Từ điển Alarm Code máy in Canon
│   │   │   └── standard.ts       # Từ điển lỗi chuẩn quốc tế RFC 3805 Printer-MIB
│   │   └── __tests__/
│   │       └── diagnostics.test.ts # 15 test cases kiểm thử tra cứu mã lỗi
│   ├── services/
│   │   ├── printerDataService.ts # Service quản lý cache 60s, stale-while-revalidate, sync cycle
│   │   ├── printerMapper.ts      # Chuyển đổi Zabbix raw item keys sang domain model
│   │   ├── problemClassifier.ts  # Phân loại và gán mức độ nghiêm trọng sự cố
│   │   ├── telemetryAggregator.ts# Tổng hợp lịch sử sản lượng in theo khung giờ
│   │   └── __tests__/
│   │       ├── printerDataService.test.ts # 9 test cases kiểm thử core sync & cache
│   │       └── printerDataService.edgeCases.test.ts # 16 test cases kiểm thử edge cases
│   ├── types/
│   │   ├── api.ts                # API Response contracts (MetricValue = number | null)
│   │   └── zabbix.ts             # Zabbix JSON-RPC 2.0 payload interfaces
│   └── zabbix/
│       └── client.ts             # Zabbix JSON-RPC 2.0 Client (login, host.get, item.get, problem.get)
├── prisma/
│   └── schema.prisma             # Database schema lưu trữ IncidentRecord và IncidentAuditLog
├── .env.example                  # Mẫu cấu hình môi trường
├── package.json
└── tsconfig.json
```

---

## 3. Cấu Hình Biến Môi Trường (`.env`)

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Nội dung cấu hình chi tiết:

```env
# ---------------------------------------------------------------------------
# Kết nối Zabbix Web API (chạy trên máy ảo Ubuntu Server)
# ---------------------------------------------------------------------------
# Đường dẫn tới endpoint JSON-RPC trên giao diện Web Zabbix:
ZABBIX_API_URL=http://<IP_UBUNTU_SERVER>:8080/api_jsonrpc.php
ZABBIX_API_USER=Admin
ZABBIX_API_PASSWORD=your_zabbix_password

# ---------------------------------------------------------------------------
# Cấu hình máy chủ Backend
# ---------------------------------------------------------------------------
PORT=3001
NODE_ENV=development

# ---------------------------------------------------------------------------
# Database ứng dụng (PostgreSQL lưu vết sự cố & lịch sử giải quyết)
# ---------------------------------------------------------------------------
DATABASE_URL=postgresql://printer_user:password@localhost:5432/printer_monitoring

# ---------------------------------------------------------------------------
# Cấu hình bộ đệm Cache (ms)
# ---------------------------------------------------------------------------
ZABBIX_POLL_INTERVAL_MS=60000

# ---------------------------------------------------------------------------
# CORS Origin (cho phép Frontend React truy cập)
# ---------------------------------------------------------------------------
CORS_ORIGIN=http://localhost:3000
```

---

## 4. Hướng Dẫn Cài Đặt & Chạy

### 1. Cài đặt dependencies:
```bash
npm install
```

### 2. Sinh mã nguồn Prisma Client:
```bash
npm run db:generate
```

### 3. Khởi chạy và kiểm thử:
```bash
npm run dev         # Chạy backend ở chế độ phát triển (port 3001)
npm run typecheck   # Kiểm tra nghiêm ngặt kiểu dữ liệu TypeScript (0 lỗi)
npm run test        # Chạy toàn bộ 40 unit test cases Vitest (100% pass)
npm run build       # Biên dịch production bundle sang thư mục dist/
```

---

## 5. Danh Mục REST API Endpoints

| Phương thức | Endpoint | Mô tả | Định dạng dữ liệu trả về |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Kiểm tra tình trạng hoạt động của Backend Gateway | `{ status: "ok", timestamp }` |
| `GET` | `/api/printers` | Danh sách toàn bộ máy in kèm telemetry mới nhất (mực, bộ đếm, cảnh báo) | `PrinterResponse[]` |
| `GET` | `/api/printers/:id` | Thông tin chi tiết một máy in theo ID | `PrinterResponse` |
| `GET` | `/api/incidents` | Danh sách sự cố phần cứng đang diễn ra hoặc đã xử lý | `IncidentResponse[]` |
| `POST` | `/api/incidents/:id/resolve` | Đánh dấu xử lý / đóng sự cố phần cứng | `{ success: true, message: string }` |
| `POST` | `/api/sync/trigger` | Kích hoạt chu kỳ đồng bộ Zabbix thủ công tức thì | `{ success: true, timestamp, durationMs }` |
| `GET` | `/api/telemetry/history` | Lấy dữ liệu chuỗi thời gian sản lượng phục vụ biểu đồ | `TelemetryPoint[]` |

---

## 6. Quy Tắc Kỹ Thuật Khi Phát Triển

- Tuân thủ quy định tại [docs/AGENTS.md](file:///f:/Code/Github/Monitoring/docs/AGENTS.md).
- Tuyệt đối không tự bịa đặt dữ liệu đo đạc hoặc OID nếu Zabbix API không trả về.
- Giữ vững quy ước `MetricValue = number | null` cho mọi chỉ số đo lường (mực in, số đếm, khay giấy).
- Luôn kiểm tra tính sẵn sàng của kết nối Zabbix API và xử lý ngoại lệ duyên dáng (Graceful degradation).
