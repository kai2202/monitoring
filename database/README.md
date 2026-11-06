# FleetMonitor — Hạ Tầng Cơ Sở Dữ Liệu & Lưu Trữ Vật Thể (Database & MinIO Storage)

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Tài liệu:** Hướng dẫn vận hành hạ tầng lưu trữ PostgreSQL 16 & MinIO S3  
> **Phiên bản:** 1.0.0 (Enterprise Architecture)

---

## 1. Cấu Trúc Thư Mục `database/`

```text
database/
├── docker-compose.yml       # Cấu hình container PostgreSQL 16 & MinIO S3
├── init/
│   └── 01-init.sql          # Script kích hoạt uuid-ossp, pgcrypto và timezone UTC+7
└── README.md                # Tài liệu hướng dẫn vận hành (tệp này)
```

---

## 2. Thông Số Dịch Vụ & Cổng Kết Nối

| Dịch vụ | Container Name | Cổng nội bộ | Cổng Host (Exposed) | Tài khoản / Mật khẩu |
| :--- | :--- | :---: | :---: | :--- |
| **PostgreSQL 16** | `fleetmonitor-postgres` | `5432` | `5432` | `fleet_admin` / `fleet_secret_2026`<br>Database: `fleetmonitor` |
| **MinIO S3 API** | `fleetmonitor-minio` | `9000` | `9000` | `fleet_minio_admin` / `minio_secret_2026` |
| **MinIO Console** | `fleetmonitor-minio` | `9001` | `9001` | Đăng nhập giao diện web quản lý file |
| **MinIO Buckets** | `fleetmonitor-minio-init` | — | — | • `fleetmonitor-proofs` (Ảnh in test PASSED)<br>• `fleetmonitor-docs` (Tài liệu kỹ thuật/SOP) |

---

## 3. Lệnh Khởi Chạy Nhanh (Docker Compose)

### 3.1. Khởi động toàn bộ dịch vụ lưu trữ:
```bash
cd database
docker compose up -d
```

### 3.2. Kiểm tra trạng thái container và logs:
```bash
docker compose ps
docker compose logs -f
```

### 3.3. Dừng dịch vụ:
```bash
docker compose down
# Hoặc dừng và xoá toàn bộ volume dữ liệu:
docker compose down -v
```

---

## 4. Biến Môi Trường Cấu Hình Backend (`backend/.env`)

Để Backend kết nối chính xác vào hạ tầng `database/`, cấu hình các biến sau trong tệp `backend/.env`:

```env
# Kết nối PostgreSQL (Prisma ORM)
DATABASE_URL="postgresql://fleet_admin:fleet_secret_2026@localhost:5432/fleetmonitor?schema=public"

# Kết nối MinIO S3 Object Storage
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="fleet_minio_admin"
MINIO_SECRET_KEY="minio_secret_2026"
MINIO_BUCKET_PROOFS="fleetmonitor-proofs"
MINIO_BUCKET_DOCS="fleetmonitor-docs"

# Bảo mật JWT Authentication
JWT_ACCESS_SECRET="fleetmonitor_access_jwt_super_secret_key_2026"
JWT_REFRESH_SECRET="fleetmonitor_refresh_jwt_super_secret_key_2026"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

---

## 5. Đồng Bộ Schema Cơ Sở Dữ Liệu Với Prisma

Schema chính thức của cơ sở dữ liệu được định nghĩa tại `backend/prisma/schema.prisma`. Khi có thay đổi schema, thực hiện các lệnh sau tại thư mục `backend/`:

```bash
cd backend

# 1. Sinh Prisma Client TypeScript
npm run prisma:generate

# 2. Tạo migration và áp dụng vào PostgreSQL
npm run prisma:migrate -- --name init_fleetmonitor_schema
```

