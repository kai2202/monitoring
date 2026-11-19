# FleetMonitor — Đặc Tả Hợp Đồng Giao Diện REST API (Master API Contract)

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Tài liệu:** Đặc Tả Kỹ Thuật Hợp Đồng Dữ Liệu RESTful API (Master API Contract)  
> **Phiên bản:** 2.7.0  
> **Mô hình:** On-Premises (LAN-Only) — Giao thức HTTP/JSON nội bộ  
> **Ranh giới:** Backend không cung cấp endpoint SNMP trực tiếp. Backend cung cấp REST API cho Frontend và tiếp nhận Webhook từ Zabbix Server 7.0 LTS.  
> **Tham chiếu mã nguồn:** `Frontend/src/types/api.ts`, `Backend/src/routes/`

---

## 1. Chuẩn Hóa Cấu Trúc Khung Bao API (Standard Response Envelopes)

Mọi phản hồi từ máy chủ Backend FleetMonitor đều tuân thủ cấu trúc khung bao nhất quán:

### 1.1 Khung bao dữ liệu đơn lẻ (`ApiResponse<T>`)
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;      // ISO 8601 UTC
  isStale?: boolean;       // true khi dữ liệu lấy từ Cache do Zabbix ngắt kết nối
}
```

### 1.2 Khung bao dữ liệu phân trang (`ApiPaginatedResponse<T>`)
```typescript
export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  timestamp: string;
  isStale?: boolean;
}
```

### 1.3 Khung bao thông báo lỗi (`ApiErrorResponse`)
```typescript
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;          // Ví dụ: 'UNAUTHORIZED', 'NOT_FOUND', 'VALIDATION_FAILED'
    message: string;       // Thông điệp tiếng Việt thân thiện
    details?: unknown;
  };
  timestamp: string;
}
```

---

## 2. Danh Mục Các Endpoints Nghiệp Vụ Chính (Core Endpoints)

### 2.1 Nhóm Xác Thực & Người Dùng (`/api/auth`)

| Phương thức | Đường dẫn | Quyền hạn | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/login` | Public | Đăng nhập username/password, trả về Access Token (15m) & set HttpOnly Refresh Cookie (7d) |
| `POST` | `/api/auth/refresh` | Public | Cấp mới Access Token bằng HttpOnly Cookie |
| `POST` | `/api/auth/logout` | All | Hủy Refresh Token và xóa cookie |
| `GET` | `/api/auth/me` | All | Lấy thông tin tài khoản hiện tại kèm vai trò RBAC (`ADMIN`, `FIELD_TECH`, `ASSET_HR`) |

### 2.2 Nhóm Quản Trị Máy In & Tài Sản (`/api/printers`)

| Phương thức | Đường dẫn | Quyền hạn | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/printers` | All | Danh sách máy in (hỗ trợ lọc `floor`, `department`, `status`, `brand`) |
| `GET` | `/api/printers/:id` | All | Chi tiết máy in, telemetry chuẩn hóa gần nhất, mức vật tư và counter |
| `POST` | `/api/printers` | `ADMIN` | Khai báo máy in mới vào hệ thống (đồng bộ tạo Host trên Zabbix Server) |
| `PUT` | `/api/printers/:id` | `ADMIN` | Cập nhật thông số kỹ thuật máy in |
| `PATCH` | `/api/printers/:id/location` | `ADMIN` | Điều chuyển vị trí máy in (Tầng, Phòng ban) |
| `POST` | `/api/printers/sync` | `ADMIN` | Kích hoạt quét đối soát Zabbix Host Discovery tức thời |

### 2.3 Nhóm Quản Lý Bảo Trì CMMS & Phê Duyệt (`/api/tasks`)

| Phương thức | Đường dẫn | Quyền hạn | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/tasks` | All | Danh sách lệnh bảo trì (lọc `status`, `assignedTo`, `floor`, `department`) |
| `POST` | `/api/tasks` | `ADMIN` | Tạo lệnh bảo trì mới cho máy in |
| `PATCH` | `/api/tasks/:id/status` | `ADMIN`, `FIELD_TECH` (Assignee) | Cập nhật trạng thái lệnh (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) |
| `POST` | `/api/tasks/:id/work-log` | `FIELD_TECH` (Assignee), `ADMIN` | Ghi nhật ký sửa chữa, các bước SOP, vật tư thay thế và chi phí |
| `POST` | `/api/tasks/:id/proof-upload` | `FIELD_TECH` (Assignee) | Tạo Presigned URL tải ảnh in test PASSED lên MinIO S3 |
| `POST` | `/api/tasks/:id/review` | `ADMIN` | Phê duyệt nghiệm thu đóng lệnh hoặc yêu cầu KTV làm lại (kèm lý do và reset bước SOP) |

### 2.4 Nhóm Phân Tích Dữ Liệu & Đo Lường (`/api/analytics`)

| Phương thức | Đường dẫn | Query Parameters | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/summary` | `timeframe`, `floor` | KPI tổng sản lượng, tỷ lệ in màu, trang in TB/ngày |
| `GET` | `/api/analytics/trend` | `timeframe`, `floor` | Chuỗi thời gian Soft Spline (timestamps, values, previousPeriod) |
| `GET` | `/api/analytics/distribution`| `floor`, `department` | Danh sách sản lượng từng thiết bị, trang Mono/Color |
| `GET` | `/api/analytics/supplies` | `floor` | Danh sách cảnh báo vật tư, huy hiệu D-Day, hộp mực thải |
| `GET` | `/api/analytics/sla-cost` | `timeframe`, `floor` | Phân bổ chi phí phòng ban, tỷ lệ SLA, ma trận nhiệt sự cố |
| `GET` | `/api/analytics/compare` | `deviceIds` (danh sách ID)| Chỉ số đối chiếu trực diện 1:1 giữa các thiết bị được chọn |

### 2.5 Nhóm Tích Hợp Zabbix & Cài Đặt Hệ Thống (`/api/settings` & `/api/integrations`)

| Phương thức | Đường dẫn | Quyền hạn | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST`| `/api/integrations/zabbix-webhook` | Public (Secret Token Header) | Endpoint tiếp nhận Zabbix Webhook Push (Problem & Recovery events) tức thời |
| `GET` | `/api/settings/zabbix-status` | All (Read-only)| Lấy trạng thái Zabbix Gateway (URL masked, Safe Window 10m, Cache TTL 60s) |
| `POST`| `/api/settings/zabbix-ping` | `ADMIN` | Live ICMP Ping kiểm tra độ trễ latency ms tới Zabbix Server nội bộ |
| `GET` | `/api/settings/error-dictionary`| All | Danh mục từ điển mã lỗi phần cứng đa thương hiệu |
| `POST`| `/api/settings/error-dictionary/import-csv`| `ADMIN` | Nạp CSV từ điển mã lỗi với xác thực Dry-Run 2 bước |

---

## 3. Quy Tắc Toàn Vẹn Dữ Liệu & Bảo Mật (Compliance Mandates)

1. **Quy tắc Giá trị Rỗng (AGENTS.md Rule 5):**
   - Trường số đo lường không xác định hoặc không khả dụng bắt buộc trả về `null` (không trả `0`).
   - Frontend hiển thị `—` hoặc `Chưa có dữ liệu`.
2. **Nghiêm Cấm Trường Bịa Đặt (AGENTS.md Rule 6):**
   - Tuyệt đối không trả trường `actionGuidance` trong API phản hồi sự cố.
3. **Bảo Vệ Phân Quyền Chi Phí & Thao Tác (RBAC Data Scope):**
   - Khi tài khoản có vai trò `FIELD_TECH` gọi API Tasks, các trường chi phí tiền tệ (`costVnd`, `partsCost`, `laborCost`) tự động bị ẩn hoặc gán `null`.
   - Quyền chỉnh sửa Work Order: Chỉ Admin và đúng Kỹ thuật viên được gán (`assignedTo`) mới có quyền chỉnh sửa bước làm việc hoặc cập nhật trạng thái; các tài khoản khác chỉ có quyền xem (Read-Only) và thảo luận trong Activity Stream.
