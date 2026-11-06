# FleetMonitor — Kiến Trúc Cơ Sở Dữ Liệu & Hạ Tầng Lưu Trữ (Storage & Database Architecture)

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Tài liệu:** Thiết kế Chi Tiết Cơ Sở Dữ Liệu PostgreSQL 16, Lưu Trữ Vật Thể MinIO S3 & Cơ Chế Xác Thực Dual-Token  
> **Phiên bản:** 1.0.0 (Enterprise Architecture Blueprint)  
> **Trạng thái:** Authoritative (Đã thống nhất qua phiên /grill-me)

---

## 1. Tổng Quan Kiến Trúc Lưu Trữ Đa Tầng (Multi-Tier Storage Architecture)

Hệ thống FleetMonitor áp dụng mô hình lưu trữ 3 tầng phân định ranh giới rõ ràng theo chuẩn Enterprise, tối ưu hóa cho hạm đội **khoảng 100 máy in** phân bổ tại **Toà nhà Trụ sở chính (7 tầng, máy in đặt linh hoạt ở tùy tầng)** kết hợp **các chi nhánh/văn phòng vệ tinh khác** kết nối an toàn qua mạng Site-to-Site VPN / SD-WAN:

```mermaid
flowchart TD
    subgraph ClientLayer ["1. CLIENT RUNTIME (BROWSER)"]
        ReduxState["Redux Store (In-Memory)\n• Access Token (15m)\n• User Profile & Role Claims"]
        BrowserCookie["HttpOnly, Secure Cookie\n• Refresh Token (7d)\n• SameSite=Strict (Chống XSS/CSRF)"]
    end

    subgraph MemoryLayer ["2. IN-MEMORY CACHE (BACKEND NODE.JS)"]
        Cache60s["In-Memory Cache (TTL = 60s, RAM < 1MB)\n• Phản hồi UI < 50ms theo AGENTS.md\n• OID Telemetry Zabbix, Counters, D-Day"]
    end

    subgraph RelationalLayer ["3. RELATIONAL PERSISTENCE (POSTGRESQL 16)"]
        Postgres[(PostgreSQL 16 Database\n• Users & RBAC (3 Roles: ADMIN, FIELD_TECH, ASSET_HR)\n• Printers (~100 máy in: Đa chi nhánh & Trụ sở 7 tầng)\n• Daily Counter Rollups (~36.5k rows/năm)\n• Incidents, Tasks CMMS, Work Logs\n• Error Code Dictionary Mappings)]
    end

    subgraph ObjectStorageLayer ["4. OBJECT STORAGE (MINIO S3)"]
        MinIO[(MinIO S3 Object Storage\n• Bucket: fleetmonitor-proofs (Ảnh in test PASSED)\n• Bucket: fleetmonitor-docs (Tài liệu kỹ thuật / SOP))]
    end

    ReduxState -->|Bearer Token Request| MemoryLayer
    BrowserCookie -.->|Tự động gửi khi refresh token| MemoryLayer
    MemoryLayer -->|Miss / Rollup / Write| Postgres
    MemoryLayer -->|Upload / Presigned URL| MinIO
```

---

## 2. Thư Viện Kiến Trúc Enterprise Đã Bổ Sung

Hệ thống sử dụng bộ thư viện chuẩn công nghiệp, không tự chế thuật toán bảo mật:

### 2.1. Phía Backend (`backend/package.json`):
| Thư viện | Phiên bản | Mục đích kỹ thuật |
| :--- | :--- | :--- |
| **`jsonwebtoken`** | `^9.0.2` | Ký (sign) và xác thực (verify) JWT Access Token (15 phút) & Refresh Token (7 ngày). |
| **`bcryptjs`** | `^2.4.3` | Băm mật khẩu người dùng với thuật toán bcrypt (Salt rounds = 10) trước khi lưu CSDL. |
| **`cookie-parser`**| `^1.4.7` | Middleware phân tích và trích xuất Refresh Token an toàn từ Cookie của trình duyệt. |
| **`multer`** | `^1.4.5-lts.1` | Tiếp nhận file upload từ Client (`multipart/form-data`) trước khi đẩy lên MinIO S3. |
| **`minio`** | `^8.0.2` | SDK chính thức kết nối MinIO Server: tạo bucket, stream file và cấp presigned URL. |
| **`@prisma/client`** & **`prisma`** | `^5.20.0` | ORM quản trị truy vấn PostgreSQL với Type Safety tuyệt đối trong TypeScript. |

### 2.2. Phía Frontend (`frontend/package.json`):
| Thư viện | Phiên bản | Mục đích kỹ thuật |
| :--- | :--- | :--- |
| **`jwt-decode`** | `^4.0.0` | Giải mã payload JWT tại client để kiểm tra thời hạn hết hạn (`exp`) trước khi gửi request. |
| **`@reduxjs/toolkit`** | `^2.4.0` | Quản lý state đăng nhập, phiên người dùng và RTK Query endpoint với cache tự động. |

---

## 3. Cơ Chế Xác Thực Dual-Token Chuẩn OWASP

Hệ thống loại bỏ hoàn toàn việc lưu token nhạy cảm trong `localStorage` (nguy cơ rò rỉ khi dính mã độc XSS), áp dụng quy trình xác thực kép:

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as React Frontend
    participant API as Backend Express API
    participant DB as PostgreSQL 16

    User->>UI: Nhập tài khoản & mật khẩu
    UI->>API: POST /api/auth/login { username, password }
    API->>DB: Truy vấn User theo username
    DB-->>API: Trả về passwordHash & User details
    API->>API: bcrypt.compare(password, passwordHash)
    Note over API: Sinh Access Token (15m) & Refresh Token (7d)
    API->>DB: Lưu tokenHash vào bảng refresh_tokens
    API-->>UI: Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict<br/>JSON Response: { user, accessToken }
    UI->>UI: Lưu accessToken vào Redux Store (In-Memory)
    
    Note over UI,API: Thao tác thông thường
    UI->>API: GET /api/... (Header: Authorization: Bearer <accessToken>)
    API-->>UI: Trả về dữ liệu

    Note over UI,API: Khi Access Token hết hạn (15 phút)
    UI->>API: POST /api/auth/refresh (Cookie tự động gửi)
    API->>DB: Kiểm tra tokenHash còn hạn & chưa bị revoke
    API-->>UI: Cấp Access Token mới (In-Memory)
```

---

## 4. Thiết Kế Lưu Trữ Vật Thể MinIO S3 (Object Storage)

MinIO S3 đóng vai trò là kho lưu trữ phi cấu trúc chuyên biệt cho hai nhóm tài nguyên:

### 4.1. Danh Sách Buckets:
1. **`fleetmonitor-proofs` (Private với Presigned URL / Public Read):**
   - Lưu trữ hình ảnh chụp bản in thử đạt chuẩn **`PASSED`** do Kỹ thuật viên hiện trường (`FIELD_TECH`) tải lên sau khi hoàn thành sửa chữa.
   - Bằng chứng nghiệm thu kỹ thuật chống báo cáo khống, phục vụ HR đối soát KPI và chấm công.
   - Quy chuẩn đặt tên khóa (Object Key): `proofs/{taskId}/{timestamp}_{filename}.jpg`.
2. **`fleetmonitor-docs` (Restricted Read):**
   - Lưu trữ tài liệu hướng dẫn quy trình bảo dưỡng chuẩn (SOP), từ điển OID PDF, biên bản nghiệm thu ký số.
   - Quy chuẩn đặt tên khóa: `docs/{vendor}/{model}_{docType}.pdf`.

### 4.2. Quy Trình Upload Ảnh In Test:
1. Client gửi request `multipart/form-data` chứa file ảnh lên endpoint `POST /api/maintenance/tasks/:id/attachments`.
2. Middleware `multer` nhận buffer vào bộ nhớ tạm thời (RAM buffer, giới hạn tối đa 10MB/ảnh).
3. Backend gọi `minioClient.putObject()` đẩy trực tiếp vào bucket `fleetmonitor-proofs`.
4. Backend ghi một bản ghi vào bảng `task_attachments` trong PostgreSQL liên kết với `taskId` và `uploadedById`.

---

## 5. Đặc Tả Cơ Sở Dữ Liệu PostgreSQL 16 (Prisma Schema)

Hệ thống cơ sở dữ liệu được tổ chức tại tệp `backend/prisma/schema.prisma` với 10 bảng chính:

| Bảng CSDL | Tên bảng SQL | Vai trò nghiệp vụ |
| :--- | :--- | :--- |
| **`User`** | `users` | Lưu thông tin người dùng, mật khẩu băm, vai trò (`ADMIN`, `FIELD_TECH`, `ASSET_HR`) và phạm vi `dataScope`. |
| **`RefreshToken`** | `refresh_tokens` | Lưu vết token hash làm mới phiên đăng nhập để hỗ trợ thu hồi token từ xa khi cần. |
| **`UserDashboardPreference`** | `user_dashboard_preferences` | Lưu danh sách máy in đã ghim 📌, theme sáng/tối và bố cục Bento theo từng tài khoản. |
| **`Branch`** | `branches` | Danh mục Trụ sở & Chi nhánh (Trụ sở chính HQ 7 tầng, Chi nhánh Miền Nam, Miền Trung...). |
| **`Floor`** | `floors` | Sơ đồ Tầng thuộc từng Chi nhánh (quan hệ 1-N với Branch, ràng buộc khóa ngoại Restrict chặn xóa khi còn máy in). |
| **`Printer`** | `printers` | Lưu danh mục ~100 máy in, số serial, hãng (Canon, Ricoh, Epson, HP, Brother, Toshiba, Olivetti), vị trí phân cấp (`branchId`, `floorId`, `department`) và trạng thái. |
| **`CounterRollup`** | `counter_rollups` | Lưu snapshot sản lượng in hàng ngày (Mono, Color, Scan) phục vụ báo cáo và hạch toán chi phí thuê máy. |
| **`Incident`** | `incidents` | Lưu thông tin sự cố kỹ thuật Zabbix phát hiện (mã lỗi nguyên gốc SCxxx, mã chuẩn hóa FM-xxx). |
| **`Task`** | `tasks` | Lệnh bảo trì CMMS, độ ưu tiên P1–P4, tiến độ %, checklist Dynamic Stepper SOP và hạch toán thời gian. |
| **`WorkLog`** | `work_logs` | Nhật ký chi tiết các lần can thiệp kỹ thuật của Kỹ thuật viên (giờ sửa, ghi chú giải pháp). |
| **`TaskAttachment`** | `task_attachments` | Siêu dữ liệu liên kết file ảnh MinIO S3 với lệnh bảo trì, đánh dấu ảnh đạt chuẩn `isTestPrintProof`. |
| **`ErrorDictionary`** | `error_dictionary` | Từ điển chuẩn hóa mã lỗi đa hãng (Ricoh, HP, Canon, Epson...) ánh xạ sang `FM-<SUBSYSTEM>-<INDEX>`. |

---

## 6. Vận Hành Hạ Tầng `database/` Với Docker Compose

Thư mục `database/` tại root dự án chứa toàn bộ kịch bản tự động hóa môi trường:

```bash
# 1. Khởi động PostgreSQL 16 và MinIO S3
cd database
docker compose up -d

# 2. Kiểm tra container hoạt động
docker compose ps

# 3. Đồng bộ schema CSDL bằng Prisma
cd ../backend
npm run prisma:generate
npm run prisma:migrate -- --name init_fleetmonitor_schema
```

*Dữ liệu ban đầu không nạp tự động (Seed Data = Trống theo nguyên tắc AGENTS.md Rule 5 — Accuracy over completeness), dữ liệu sẽ được đồng bộ thực tế qua API hoặc nhập danh mục từ file CSV.*

