# TASK-BE-06: Multi-User RBAC (3 Canonical Roles) & Data Scope Enforcement Middleware

> **Phân hệ:** Backend / Security & Access Control  
> **Mã nhiệm vụ:** TASK-BE-06  
> **Phiên bản:** 1.1.0 (Đồng bộ 3 vai trò chuẩn hoá, Kiểm soát chéo giữa HR & Quản lý vận hành)  
> **Trạng thái:** ✅ Hoàn thành 100% (authController, authMiddleware, requireRoles & sanitizeCostData)  
> **Tài liệu liên quan:** [Kiến Trúc Hệ Thống](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md), [Đặc Tả Phân Quyền RBAC](file:///f:/Code/Github/Monitoring/docs/Design/rbac_roles_and_ui_permissions_spec.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Module chịu trách nhiệm bảo mật, xác thực người dùng và kiểm soát phân quyền 3 cấp kết hợp **Cơ chế phân vùng dữ liệu tự động (Data Scope Enforcement)** tại tầng máy chủ Backend:

1. **Ma Trận Phân Quyền 3 Vai Trò Chuẩn Hóa (RBAC 3 Roles):**
   - **`ADMIN` (Quản trị viên IT & NOC):** Toàn quyền quản trị hạ tầng kỹ thuật (~100 máy in), cấu hình Safe Window, nạp từ điển CSV mã lỗi, giám sát polling Zabbix. **Duy nhất có quyền điều chuyển vị trí/phòng ban máy in và tạo lệnh bảo trì.**
   - **`FIELD_TECH` (Kỹ thuật viên hiện trường):** Chỉ xem các Lệnh bảo trì được phân công (`assignedTo = user.id`); thực thi Dynamic Stepper SOP, ghi Work Log và tải ảnh nghiệm thu MinIO. **Bộ tuần tự hóa (Serializer) của Backend tự động loại bỏ các trường tài chính tiền tệ (VNĐ) trong payload trả về.**
   - **`ASSET_HR` (HR / Kiểm kê tài sản & Hành chính):** Kiểm kê danh mục máy in (Serial, Model, Tầng, Phòng ban), xem sản lượng Mono vs Color để hạch toán chi phí nội bộ; **truy xuất Bảng đối chiếu KPI Hiệu suất Kỹ thuật viên (MTTR, SLA, ảnh nghiệm thu) làm căn cứ chấm công và duyệt thưởng.**
2. **Cơ Chế Phân Vùng Dữ Liệu Tự Động (Data Scope Middleware):**
   - Middleware Express tự động trích xuất thông tin `role` và `dataScope` từ JWT Token và tiêm điều kiện lọc `req.dataScopeFilter` trực tiếp vào câu lệnh Prisma ORM.
   - Tuyệt đối không dựa vào Frontend để ẩn/hiện trường (ngăn chặn hoàn toàn việc can thiệp payload từ DevTools).
3. **Lưu Trữ Tùy Biến Giao Diện (Dashboard Preferences):**
   - Lưu trữ danh sách máy in được ghim (`pinnedPrinterIds`), chế độ giao diện sáng/tối, và bố cục widget bento cho từng người dùng.

---

## 2. Thiết Kế Prisma Schema Cho Module Bảo Mật & RBAC

```prisma
// backend/prisma/schema.prisma (Phần Users & RBAC)

enum UserRole {
  ADMIN
  FIELD_TECH
  ASSET_HR
}

model User {
  id              String                    @id @default(uuid())
  username        String                    @unique
  email           String                    @unique
  passwordHash    String                    @map("password_hash")
  fullName        String                    @map("full_name")
  role            UserRole                  @default(FIELD_TECH)
  dataScope       Json                      @default("{}") @map("data_scope") // { departmentIds: [...], floorIds: [...] }
  isActive        Boolean                   @default(true) @map("is_active")
  createdAt       DateTime                  @default(now()) @map("created_at")
  updatedAt       DateTime                  @updatedAt @map("updated_at")

  preferences     UserDashboardPreference?

  @@map("users")
}

model UserDashboardPreference {
  id               String   @id @default(uuid())
  userId           String   @unique @map("user_id")
  dashboardLayout  Json     @default("{\"widgets\": [\"hero_trend\", \"radar\", \"heatmap\", \"top_contributors\"]}") @map("dashboard_layout")
  themeMode        String   @default("light") @map("theme_mode") // light, dark
  defaultPeriod    String   @default("30days") @map("default_period")
  pinnedPrinterIds Json     @default("[]") @map("pinned_printer_ids")
  updatedAt        DateTime @updatedAt @map("updated_at")

  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_dashboard_preferences")
}
```

---

## 3. Đặc Tả Middleware Thực Thi Data Scope & Field Masking

```typescript
// backend/src/middleware/dataScopeMiddleware.ts

import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  role: 'ADMIN' | 'FIELD_TECH' | 'ASSET_HR';
  dataScope: {
    departmentIds?: string[];
    floorIds?: string[];
  };
}

export const applyDataScope = (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user as AuthenticatedUser;
  if (!user) {
    return next();
  }

  // Admin có toàn quyền truy xuất toàn công ty
  if (user.role === 'ADMIN') {
    (req as any).dataScopeFilter = {};
    return next();
  }

  // Field Tech: Chỉ xem các công việc bảo trì được phân công
  if (user.role === 'FIELD_TECH') {
    (req as any).dataScopeFilter = {
      assignedTo: user.id,
    };
    return next();
  }

  // Asset HR: Xem danh mục tài sản, sản lượng phân bổ và dữ liệu đối soát KPI
  if (user.role === 'ASSET_HR') {
    (req as any).dataScopeFilter = {
      departmentId: user.dataScope.departmentIds ? { in: user.dataScope.departmentIds } : undefined,
    };
    return next();
  }

  next();
};
```

---

## 4. Danh Sách REST API Endpoints

| Endpoint | Method | Vai trò cho phép | Chức năng nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Xác thực người dùng, trả về JWT Token kèm claims `role` và `dataScope` |
| `/api/auth/me` | `GET` | All | Lấy thông tin phiên làm việc, quyền hạn và phạm vi dữ liệu của tài khoản hiện tại |
| `/api/printers/:id/location` | `PATCH` | `ADMIN` | **Chỉ Admin** có quyền cập nhật Tầng / Phòng ban điều chuyển máy in |
| `/api/maintenance/tasks` | `POST` | `ADMIN` | **Chỉ Admin** có quyền tạo lệnh bảo trì thủ công (ngoài trigger Zabbix) |
| `/api/maintenance/technician-kpi` | `GET` | `ADMIN`, `ASSET_HR` | Trả về thống kê MTTR, SLA rate, hoàn thành có ảnh MinIO để HR đánh giá KPI |
| `/api/users/preferences` | `GET` | All | Tải tùy biến giao diện: Máy in đã ghim 📌, chế độ sáng/tối, bố cục widget |
| `/api/users/preferences` | `PUT` | All | Cập nhật cấu hình máy in đã ghim hoặc thay đổi theme giao diện |

---

## 5. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Khi tài khoản `FIELD_TECH` gọi API `/api/maintenance/tasks/:id`, backend không trả về `laborCostVnd`, `partsCostVnd`, `totalCostVnd` (`sanitizeCostData` middleware).
- [x] Khi tài khoản `ASSET_HR` gọi API điều chuyển vị trí `/api/printers/:id/location`, backend trả về mã lỗi `403 Forbidden` (`requireRoles('ADMIN')`).
- [x] Endpoint `/api/maintenance/technician-kpi` cung cấp dữ liệu chính xác về MTTR, tỷ lệ SLA và bằng chứng ảnh MinIO phục vụ HR đối soát tính lương/thưởng.
- [x] Mật khẩu người dùng được băm an toàn qua thuật toán bcrypt (salt rounds = 10, hash xác thực trong `seed.ts` & `authController.ts`).
- [x] Tùy biến máy in ghim so sánh (`pinnedPrinterIds`) và token refresh được lưu trữ trong CSDL.
