# TASK-BE-03: Maintenance Management (CMMS): Ticket, Task, Work Log & MinIO Storage

> **Phân hệ:** Backend / Maintenance Operations  
> **Mã nhiệm vụ:** TASK-BE-03  
> **Phiên bản:** 1.0.0 (Tối ưu hóa hạm đội ~100 máy in, MinIO S3 Presigned URLs)  
> **Trạng thái:** Sẵn sàng triển khai (Ready for Implementation)  
> **Tài liệu liên quan:** [Kiến Trúc Hệ Thống](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md), [Bản Ánh Xạ OIDs](file:///f:/Code/Github/Monitoring/docs/Design/frontend_mock_to_oid_mapping.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Nhiệm vụ này xây dựng toàn bộ hệ thống quản trị bảo trì khép kín (Computerized Maintenance Management System - CMMS) phục vụ đội ngũ Kỹ thuật viên bảo trì hiện trường và Kỹ sư NOC, quản lý trọn vẹn **vòng đời 3 tầng**:

```
[1. Ticket (Phiếu Sự Cố)] ──> [2. Task / Work Order (Lệnh Bảo Trì)] ──> [3. Work Log (Nhật Ký & Chi Phí)]
```

1. **Vòng đời 3 tầng phân định:**
   - **Ticket:** Tiếp nhận tự động từ Zabbix SNMP Trigger hoặc tạo thủ công do người dùng báo cáo.
   - **Task (Lệnh bảo trì):** Lập kế hoạch, phân công kỹ thuật viên, gắn hạn xử lý (Due Date), theo dõi tiến trình kiểm tra từng bước (Dynamic Stepper % tự động).
   - **Work Log (Nhật ký thực địa):** Ghi chép chi tiết phiên can thiệp: Giờ bắt đầu/kết thúc, linh kiện thay thế, chi phí vật tư và nhân công (VNĐ), kết quả in thử nghiệm thu (PASSED / FAILED), và số counter lúc bàn giao.
2. **Lưu trữ Tệp đính kèm với MinIO S3 Presigned URLs:**
   - Hỗ trợ tải lên ảnh hiện trường (trước và sau khi sửa), tài liệu kỹ thuật Service Manual, và biên bản nghiệm thu có chữ ký.
   - Backend sinh **Presigned Upload/Download URL có chữ ký bảo mật 15 phút**, Client tải file trực tiếp lên MinIO S3 mà không chiếm dụng băng thông và bộ nhớ RAM của máy chủ Express.
3. **Cơ chế Tái sử dụng Tri thức (Knowledge Reuse Engine):**
   - Tự động gợi ý các bước xử lý và linh kiện thay thế thành công nhất từ các Work Log quá khứ có `test_print_result = 'PASSED'` của các máy in cùng model.

---

## 2. Thiết Kế Prisma Schema Cho Module CMMS

```prisma
// backend/prisma/schema.prisma (Phần CMMS)

model MaintenanceTicket {
  id                 String            @id // TCK-YYYYMM-XXXX
  printerId          String            @map("printer_id")
  title              String
  description        String?
  source             String            // SNMP_TRIGGER, USER_REPORT, PREVENTIVE_SCHEDULE
  severity           String            // Critical, Warning, Info
  status             String            @default("OPEN") // OPEN, IN_PROGRESS, WAITING_PARTS, RESOLVED, CLOSED
  internalErrorCode  String?           @map("internal_error_code")
  rawVendorCode      String?           @map("raw_vendor_code")
  needsMappingReview Boolean           @default(false) @map("needs_mapping_review")
  reportedBy         String?           @map("reported_by")
  createdAt          DateTime          @default(now()) @map("created_at")
  resolvedAt         DateTime?         @map("resolved_at")

  printer            Printer           @relation(fields: [printerId], references: [id])
  tasks              MaintenanceTask[]

  @@map("maintenance_tickets")
}

model MaintenanceTask {
  id                 String               @id // TSK-YYYYMM-XXXX
  ticketId           String?              @map("ticket_id")
  printerId          String               @map("printer_id")
  title              String
  taskType           String               @map("task_type") // CORRECTIVE_REPAIR, PERIODIC_MAINTENANCE, TONER_REPLACEMENT
  priority           String               // P1, P2, P3, P4
  status             String               @default("Planned") // Planned, In Progress, Waiting, Completed
  assignedTo         String?              @map("assigned_to") // UUID Kỹ thuật viên
  dueDate            DateTime?            @map("due_date")
  pendingReason      String?              @map("pending_reason")
  pendingNextCheck   DateTime?            @map("pending_next_check")
  progressPercent    Int                  @default(0) @map("progress_percent")
  dynamicSteps       Json                 @default("[]") @map("dynamic_steps")
  createdAt          DateTime             @default(now()) @map("created_at")
  completedAt        DateTime?            @map("completed_at")

  ticket             MaintenanceTicket?   @relation(fields: [ticketId], references: [id])
  printer            Printer              @relation(fields: [printerId], references: [id])
  workLogs           MaintenanceWorkLog[]

  @@map("maintenance_tasks")
}

model MaintenanceWorkLog {
  id                 String               @id @default(uuid())
  taskId             String               @map("task_id")
  technicianId       String               @map("technician_id")
  startedAt          DateTime             @map("started_at")
  finishedAt         DateTime             @map("finished_at")
  workPerformed      String               @map("work_performed")
  partsReplaced      Json                 @default("[]") @map("parts_replaced")
  partsCostVnd       Decimal              @default(0) @map("parts_cost_vnd") @db.Decimal(12, 2)
  laborCostVnd       Decimal              @default(0) @map("labor_cost_vnd") @db.Decimal(12, 2)
  totalCostVnd       Decimal              @map("total_cost_vnd") @db.Decimal(12, 2)
  testPrintResult    String?              @map("test_print_result") // PASSED, FAILED, MARGINAL
  counterAtService   BigInt?              @map("counter_at_service")
  notes              String?
  createdAt          DateTime             @default(now()) @map("created_at")

  task               MaintenanceTask      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  attachments        WorkLogAttachment[]

  @@map("maintenance_work_logs")
}

model WorkLogAttachment {
  id                 String             @id @default(uuid())
  workLogId          String             @map("work_log_id")
  fileName           String             @map("file_name")
  fileType           String             @map("file_type")
  fileSizeBytes      BigInt             @map("file_size_bytes")
  minioBucket        String             @default("fleetmonitor-maintenance") @map("minio_bucket")
  minioObjectKey     String             @map("minio_object_key")
  uploadedBy         String             @map("uploaded_by")
  uploadedAt         DateTime           @default(now()) @map("uploaded_at")

  workLog            MaintenanceWorkLog @relation(fields: [workLogId], references: [id], onDelete: Cascade)

  @@map("work_log_attachments")
}
```

---

## 3. Danh Sách REST API Endpoints

| Phương thức | Đường dẫn API | Mô tả nghiệp vụ |
| :--- | :--- | :--- |
| `GET` | `/api/maintenance/tasks` | Lấy danh sách lệnh bảo trì (hỗ trợ lọc status: `Planned`, `In Progress`, `Waiting`, `Completed`) |
| `POST` | `/api/maintenance/tasks` | Khởi tạo lệnh bảo trì mới từ Drawer hoặc nút [+ Tạo task vật tư] |
| `GET` | `/api/maintenance/tasks/:id` | Xem chi tiết lệnh bảo trì, danh sách Dynamic Steps và các Work Log |
| `PATCH` | `/api/maintenance/tasks/:id/status` | Cập nhật trạng thái lệnh (bắt buộc nhập `pendingReason` nếu chuyển sang `Waiting`) |
| `POST` | `/api/maintenance/tasks/:id/worklogs` | Ghi nhận nhật ký thực địa, linh kiện thay thế, chi phí VNĐ và in thử nghiệm thu |
| `POST` | `/api/maintenance/worklogs/:id/presigned-upload` | Sinh Presigned Upload URL có chữ ký 15 phút để đẩy ảnh/biên bản lên MinIO S3 |
| `GET` | `/api/maintenance/worklogs/:id/attachments/:attId/download` | Sinh Presigned Download URL để xem ảnh hiện trường trực tiếp trên Drawer |

---

## 4. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [ ] Thực hiện migration Prisma tạo thành công 4 bảng CMMS trong PostgreSQL 16.
- [ ] Tính năng Dynamic Stepper tự động cập nhật `progressPercent` khi kỹ thuật viên tick chọn các bước kiểm tra.
- [ ] Lệnh bảo trì khi chuyển sang `Completed` tự động cập nhật `completedAt` và đồng bộ xóa khỏi biểu đồ Gantt (chuyển sang Kho Lịch Sử).
- [ ] Tải lên ảnh hiện trường thành công qua MinIO Presigned URL không bị lỗi CORS hay timeout.
- [ ] Hạch toán chính xác tổng chi phí: $\text{totalCostVnd} = \text{partsCostVnd} + \text{laborCostVnd}$ theo định dạng tiền tệ VNĐ.

