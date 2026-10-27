# Hệ Thống Giám Sát & Quản Lý Máy In Mạng Tập Trung (Enterprise Printer Monitoring)

> **Enterprise Network Printer Monitoring & Hardware Fault Management**  
> Giám sát thời gian thực trạng thái kết nối, phát hiện cảnh báo lỗi phần cứng, theo dõi mức vật tư tiêu hao và đối soát dữ liệu sản lượng in ấn của hệ thống máy in văn phòng (trọng tâm là **Ricoh MP C6004** và **Canon imageRUNNER ADVANCE**) thông qua SNMP và Zabbix JSON-RPC API.

---

## 1. Kiến Trúc Hệ Thống & Luồng Dữ Liệu Chuẩn

Hệ thống hoạt động theo mô hình luồng dữ liệu 4 tầng độc lập, bảo vệ card mạng máy in và đảm bảo tính toàn vẹn dữ liệu:

```mermaid
flowchart LR
    subgraph LAN["Hạ Tầng Mạng Máy In"]
        P1["Ricoh MP C6004 (10.48.3.252)"]
        P2["Canon iR-ADV C5535i"]
    end

    subgraph MonitoringInfra["Hạ Tầng Giám Sát Zabbix (Ubuntu VM / Docker)"]
        Z_SRV["Zabbix Server 7.0 LTS (SNMP Poller)"]
        Z_DB[("PostgreSQL 16")]
        Z_WEB["Zabbix Web UI (Port 8080)"]
        Z_API["Zabbix JSON-RPC API"]
    end

    subgraph BackendAPI["Backend API Gateway (Node.js)"]
        B_CLIENT["Zabbix RPC Client"]
        B_CACHE["In-Memory Cache (TTL 60s)"]
        B_MAPPER["Printer Data Mapper & Diagnostics"]
        B_ROUTES["REST API (Port 3001)"]
    end

    subgraph FrontendApp["Giao Diện Người Dùng (Frontend)"]
        UI["React 18 + TypeScript + Vite (Port 3000)"]
        DASH["Midnight Dashboard (5 Phân Hệ)"]
    end

    P1 & P2 -->|SNMP v2c (UDP 161)| Z_SRV
    Z_SRV <--> Z_DB
    Z_SRV <--> Z_WEB
    Z_WEB --- Z_API

    Z_API -->|JSON-RPC 2.0| B_CLIENT
    B_CLIENT --> B_CACHE
    B_CACHE --> B_MAPPER
    B_MAPPER --> B_ROUTES
    B_ROUTES -->|REST JSON| UI
    UI --> DASH
```

### Nguyên lý kiến trúc cốt lõi:
1. **Zabbix Server đảm nhiệm toàn bộ việc thu thập SNMP (SNMP Polling):**
   - Frontend và Backend **tuyệt đối không gửi bản tin SNMP trực tiếp đến máy in**, bảo vệ thiết bị in ấn khỏi tình trạng nghẽn vi điều khiển mạng khi nhiều người dùng cùng truy cập bảng điều khiển.
2. **Backend API Gateway đóng vai trò cầu nối bảo mật:**
   - Kết nối với Zabbix qua giao thức chuẩn **JSON-RPC 2.0** (`api_jsonrpc.php`).
   - Lưu trữ Zabbix Token bảo mật ở phía server, không để lộ thông tin xác thực ra trình duyệt.
   - Tích hợp bộ đệm nhớ **In-Memory Cache (TTL 60s)** với cơ chế *stale-while-revalidate* giúp giảm tải tối đa cho máy chủ Zabbix.
   - Phân loại mã lỗi phần cứng chuyên sâu theo từng hãng (Ricoh SC codes, Canon E-codes).
3. **Web Frontend phản ánh trung thực trạng thái đo đạc:**
   - Xây dựng trên React 18, Vite và TypeScript với thiết kế giao diện tối cao cấp **Midnight Dashboard**.
   - **Tuyệt đối không sử dụng mock data ngầm:** Khi Backend chưa chạy hoặc Zabbix chưa có dữ liệu, hệ thống hiển thị trạng thái `Chờ kết nối / Chưa có dữ liệu` (`No Data / Pending State`) minh bạch.
   - Thống nhất quy ước kiểu dữ liệu đo lường: `MetricValue = number | null` (giá trị thiếu hụt hiển thị `—`, không gán mặc định về 0).

---

## 2. Cấu Trúc Repository (NPM Workspaces Monorepo)

Dự án được cấu trúc theo mô hình Monorepo phẳng, sạch sẽ, đưa các tài nguyên hạ tầng ra trực tiếp thư mục gốc để thuận tiện thao tác:

```text
Monitoring/
├── compose.yaml               # Docker Compose mẫu khởi chạy Zabbix 7.0 LTS + PostgreSQL 16
├── hosts_all_printers.yaml    # Danh bạ 20 máy in mẫu cấu hình sẵn cho Zabbix
├── templates/                 # Mẫu Template Zabbix 7.0 (YAML) xuất sẵn cho từng dòng máy in
├── mibs/                      # Thư viện file MIB chuẩn IETF/RFC và Vendor MIB mount vào Zabbix
├── package.json               # Cấu hình NPM Workspaces Monorepo điều phối toàn bộ dự án
├── .env.example               # Biến môi trường mẫu
│
├── frontend/                  # [Workspace] Ứng dụng Web Client (React 18 + Vite + TypeScript)
│   ├── src/
│   │   ├── pages/             # 5 phân hệ: Dashboard, Printers, Supplies, Incidents, Analytics
│   │   ├── components/        # Component UI chia theo module nghiệp vụ và Modals chi tiết
│   │   ├── diagnostics/       # Bộ quy tắc ánh xạ & phân loại lỗi phần cứng phía client
│   │   ├── services/          # Client API kết nối Backend (/api/printers, /api/incidents)
│   │   ├── hooks/             # Custom hook usePrinterData tự động polling & xử lý trạng thái
│   │   └── types/printer.ts   # Data contracts thống nhất (MetricValue = number | null)
│   └── package.json
│
├── backend/                   # [Workspace] Dịch vụ Backend API Gateway (Express + Prisma)
│   ├── src/
│   │   ├── index.ts           # Điểm khởi chạy ứng dụng Express & mounting REST routes
│   │   ├── zabbix/client.ts   # Zabbix JSON-RPC Client 7.0 LTS kết nối máy chủ Zabbix
│   │   ├── services/          # In-memory cache (60s), data mapping và tổng hợp telemetry
│   │   ├── diagnostics/       # Từ điển mã lỗi phần cứng theo hãng (Ricoh SC, Canon Alarm)
│   │   └── api/routes/        # REST Endpoints (/api/printers, /api/incidents, /api/sync)
│   └── package.json
│
└── docs/                      # TÀI LIỆU HỆ THỐNG & ĐẶC TẢ KỸ THUẬT TẬP TRUNG
    ├── AGENTS.md              # Quy tắc tối cao khi phát triển mã nguồn & kiểm chứng dữ liệu
    ├── SPECIFICATION.md       # Đặc tả yêu cầu chức năng (FR) và phi chức năng (NFR)
    ├── ARCHITECTURE.md        # Thiết kế kiến trúc tổng thể, luồng dữ liệu & quyết định kỹ thuật
    ├── DATA_SOURCES.md        # Bảng tra cứu OID, phương pháp kiểm chứng dữ liệu SNMP
    ├── PRINTER_DATA_REQUIREMENTS.md # Checklist chi tiết đối chiếu 100% UI fields sang Zabbix Items
    ├── snmp-oids/             # Tra cứu OID tiêu chuẩn RFC (MIB-II, Printer-MIB, Host-Resources)
    │   └── standard-mibs.md   # Tổng hợp MIB-II, Printer-MIB, Host-Resources và RFC 3805 Alert Table
    └── models/                # Hồ sơ kỹ thuật và từ điển mã lỗi theo từng dòng máy in
        ├── ricoh-mp-c6004.md  # Dòng tham chiếu chính (Phase 1 verified) & từ điển SC codes
        ├── canon-c5535i.md    # Dòng Canon imageRUNNER ADVANCE C5535i (Phase 2 rollout)
        └── ricoh-aficio-legacy.md # Dòng Ricoh Aficio đơn sắc (MP 4002, 5002)
```

---

## 3. Hướng Dẫn Cài Đặt & Vận Hành Dự Án

Nhờ cấu hình **NPM Workspaces**, bạn chỉ cần đứng tại thư mục gốc `Monitoring/` để thực hiện toàn bộ các thao tác:

### Bước 1: Cài đặt dependencies toàn bộ dự án
```bash
npm install
```
*Lệnh này sẽ tự động cài đặt và liên kết dependencies cho cả Frontend và Backend trong 1 lần duy nhất.*

### Bước 2: Thiết lập cấu hình Backend API
Tạo file `.env` trong thư mục `backend/` từ mẫu `backend/.env.example`:
```bash
cp backend/.env.example backend/.env
```
Cấu hình các thông số kết nối Zabbix và Database:
```env
# Địa chỉ Zabbix Web API trên máy ảo Ubuntu Server
ZABBIX_API_URL=http://<IP_UBUNTU_SERVER>:8080/api_jsonrpc.php
ZABBIX_API_USER=Admin
ZABBIX_API_PASSWORD=your_secure_password

# Hoặc sử dụng Zabbix API Token nếu có
# ZABBIX_API_TOKEN=your_zabbix_api_token

# Cổng dịch vụ Backend
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### Bước 3: Khởi chạy môi trường phát triển
Mở terminal tại thư mục gốc và chạy:
```bash
# Khởi chạy Web Frontend (chạy tại http://localhost:3000)
npm run dev

# Mở terminal thứ hai để chạy Backend API (chạy tại http://localhost:3001)
npm run dev:backend
```

### Bước 4: Kiểm tra chất lượng mã nguồn bắt buộc (Quality Gates)
Trước khi commit mã nguồn, luôn chạy kiểm tra chất lượng từ thư mục gốc:
```bash
# 1. Kiểm tra toàn bộ kiểu dữ liệu TypeScript cả 2 workspaces:
npm run typecheck

# 2. Chạy toàn bộ 79 unit test cases Vitest (100% Pass):
npm run test

# 3. Biên dịch bản sản xuất (Production Build):
npm run build:all
```

---

## 4. (Tùy Chọn) Dựng Cụm Zabbix 7.0 LTS Cục Bộ Bằng Docker

Nếu bạn muốn tự dựng một cụm máy chủ Zabbix 7.0 LTS mới để thử nghiệm trên máy cá nhân:

```bash
docker compose up -d
```

Ngăn xếp bao gồm:
* `zabbix-postgres-db`: PostgreSQL 16 Alpine với volume lưu trữ bền vững.
* `zabbix-server`: Zabbix Server 7.0 LTS với 15 SNMP pollers và thư mục `./mibs` gắn kết tự động.
* `zabbix-web-frontend`: Nginx Web UI quản trị tại cổng `http://localhost:8080`.
* `zabbix-snmptraps`: Bẫy tiếp nhận SNMP Trap trên cổng `162/udp`.

Sau khi Zabbix khởi động, bạn có thể nhập các file template có sẵn trong thư mục `templates/` và danh bạ máy in `hosts_all_printers.yaml` vào giao diện Zabbix Web UI.

---

## 5. Nguyên Tắc Kỹ Thuật Bất Biến Của Dự Án

1. **Ưu tiên số 1: Giám sát lỗi phần cứng tin cậy:** Phát hiện đúng lỗi, đúng mã, đúng phân hệ hỏng hóc và đúng mức độ nghiêm trọng là tiêu chí số một quyết định sự thành công của dự án.
2. **Trung thực về dữ liệu:** Tuyệt đối không tự bịa đặt OID, không tự suy đoán thông số quá khứ khi máy ảo bị tắt, và phân định rõ ràng các trạng thái kiểm chứng (`VERIFIED`, `DOCUMENTED`, `OBSERVED`, `UNSUPPORTED`).
3. **Chuẩn hóa ngôn ngữ & ngữ cảnh:** Toàn bộ thuật ngữ phải sử dụng tiếng Việt tự nhiên cho IT quản trị thiết bị văn phòng (dùng *"toàn hệ thống"*, *"sản lượng in theo thời gian"*, tuyệt đối không dùng các từ dịch máy thô ráp như *"hạm đội"*, *"đường cong tải"*).
4. **Không tạo gánh nặng tải lên máy in:** Toàn bộ polling SNMP định kỳ do Zabbix đảm nhiệm; Web Dashboard chỉ đọc dữ liệu qua Backend API Cache.
