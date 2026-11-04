# FleetMonitor — Kế Hoạch Kiểm Thử Toàn Diện (Master Test Plan)

> **Dự án:** FleetMonitor — Enterprise Printer Monitoring & Management System  
> **Tài liệu:** Kế hoạch Chiến lược Kiểm thử (Master Test Plan)  
> **Phiên bản:** 1.0.0  
> **Phương pháp:** Kiểm thử đa tầng (Unit, Integration, Component, Policy & Performance Testing)

---

## 1. Mục Tiêu & Phạm Vi Kiểm Thử

### 1.1 Mục Tiêu

FleetMonitor là hệ thống giám sát và quản lý phần cứng chuyên dụng, nơi tính chính xác của dữ liệu lỗi và độ tin cậy của thông tin vận hành là ưu tiên cao nhất. Kế hoạch kiểm thử này nhằm đảm bảo:

- **Không xảy ra sai lệch phát hiện lỗi phần cứng:** Mọi mã lỗi SNMP, mã SC Ricoh, mã E Canon được giải mã chính xác 100%.
- **Thực thi nghiêm ngặt các quy tắc an toàn:** Tuyệt đối không tự động đóng sự cố Critical hoặc sự cố do người dùng báo cáo khi chưa xác minh.
- **Tính toàn vẹn của dữ liệu số:** Giá trị đo lường rỗng không bị thay bằng 0; bộ đếm trang reset hoặc giảm không tính ra sản lượng âm.
- **Không gian làm việc Notion-style ổn định:** Đồng bộ dữ liệu mượt mà giữa 4 chế độ xem; ghi vết lịch sử hoạt động bất biến.
- **Tuân thủ hợp đồng giao diện:** Toàn bộ API trả về đúng envelope, metadata freshness và không chứa trường `actionGuidance`.

### 1.2 Phạm Vi Kiểm Thử (Testing Scope)

```text
+---------------------------------------------------------------------------------+
|                                 TẦNG KIỂM THỬ                                   |
+---------------------------------------------------------------------------------+
| 1. Unit Tests (Kiểm thử đơn vị):                                                |
|    - Logic phân loại lỗi (problemClassifier.ts)                                 |
|    - Động cơ tự động đóng sự cố (autoClosureEngine.ts)                           |
|    - Công thức đo lường Telemetry & Lemon Devices (telemetryAggregator.ts)      |
|    - Nghiệp vụ Task, Lập lịch & Audit Log (taskService.ts)                      |
|    - Chuẩn hóa mức vật tư & OID mappers (suppliesService.ts, printerMapper.ts)  |
+---------------------------------------------------------------------------------+
| 2. Integration Tests (Kiểm thử tích hợp API & Database):                        |
|    - RESTful API Endpoints (/api/printers, /api/incidents, /api/tasks, etc.)   |
|    - Tương tác Prisma ORM & Transaction an toàn (PostgreSQL)                     |
|    - Zabbix Client & In-Memory Cache (TTL 60s, stale handling)                  |
|    - Chính sách đồng bộ vị trí 2 bước (PostgreSQL SSoT + Zabbix best-effort)    |
+---------------------------------------------------------------------------------+
| 3. Component & UI Tests (Kiểm thử giao diện):                                   |
|    - Chuyển đổi 4 chế độ xem Notion (TaskViewSwitcher, Board, Table, etc.)     |
|    - Bộ lọc đa năng (TaskFilters, PrinterFilters)                               |
|    - Form nhập liệu có validation (Dời lịch bắt buộc có lý do)                  |
|    - Theme Sáng / Tối và hiển thị nhãn tiếng Việt thuần túy                     |
+---------------------------------------------------------------------------------+
| 4. Policy & Edge-case Tests (Kiểm thử chính sách an toàn):                      |
|    - Khóa cứng Auto-Closure với sự cố Critical & User-Reported                  |
|    - Kiểm tra không xuất hiện trường actionGuidance ở bất kỳ đâu               |
|    - MetricValue = number | null hiển thị dấu "—" thay vì số "0"               |
+---------------------------------------------------------------------------------+
| 5. Performance Tests (Kiểm thử hiệu năng):                                      |
|    - SLA phản hồi API <500ms; Dashboard render <100ms; Tỷ lệ cache hit >85%     |
+---------------------------------------------------------------------------------+
```

### 1.3 Chiến Lược Kiểm Thử Theo Phân Kỳ (Testing Strategy by Phase)

Để bám sát chiến lược **Frontend-First với Mock Data Provider**, quy trình kiểm thử được chia làm 2 giai đoạn rõ ràng:

1. **Kỳ 1 — Kiểm thử Trực quan Giao diện & Tương tác trên Mock Data:**
   - **Xác thực giao diện trực quan:** Kiểm tra hiển thị khi máy in gặp sự cố cụm sấy (Ricoh SC541 / Canon E000), khi mực $\le 10\%$ hoặc hộp mực thải $\ge 80\%$, khi công việc bị quá hạn (`Overdue`) hoặc sắp đến hạn (`Due Soon`).
   - **Xác thực tương tác kéo thả:** Kéo thả thẻ trên Kanban Board (`TaskBoardView`) chuyển trạng thái mượt mà (60fps, không giật lag/layout shift), cập nhật ngày trên Timeline Gantt.
   - **Xác thực Service Layer:** Đảm bảo toàn bộ component chỉ giao tiếp qua Service Provider (`MockProvider`), không import trực tiếp từ `mocks/`.
   - **🏁 Nghiệm thu người dùng:** Người dùng kiểm tra trực tiếp giao diện và trải nghiệm thực tế đạt yêu cầu ("nếu mình oke") mới chuyển sang Kỳ 2.

2. **Kỳ 2 — Kiểm thử Tích hợp Backend, Cơ Sở Dữ Liệu & Chuyển Nguồn (Cutover):**
   - **Kiểm thử Database & REST API:** Chạy kiểm thử Prisma ORM trên PostgreSQL, xác thực các REST routes tuân thủ nghiêm ngặt [`docs/Build/API_CONTRACT.MD`](file:///f:/Code/Github/Monitoring/docs/Build/API_CONTRACT.MD).
   - **Kiểm thử chuyển đổi nguồn dữ liệu:** Đổi `DATA_SOURCE = "api"`, kiểm tra toàn bộ ứng dụng kết nối thông suốt với Backend thật mà mã nguồn component không phải thay đổi.
   - **Kiểm thử Zabbix Client & Cache:** Kiểm tra in-memory cache TTL 60s, cờ `Stale` khi mất kết nối Zabbix, và kiểm thử chính sách đồng bộ vị trí 2 bước.

---

## 2. Công Cụ & Môi Trường Kiểm Thử

- **Test Runner cốt lõi:** **Vitest** (cho cả `frontend/` và `backend/` nhằm tận dụng tốc độ tối đa của Vite và tương thích TypeScript nguyên bản).
- **Frontend Testing Library:** `@testing-library/react`, `@testing-library/user-event`, `jsdom`.
- **API Testing:** `supertest` kết hợp Vitest.
- **Mocking & Spying:** `vi.fn()`, `vi.spyOn()`, `vi.mock()` từ Vitest.
- **Các lệnh thực thi kiểm thử tiêu chuẩn:**
  - `npm run test`: Chạy toàn bộ test suite dự án.
  - `npm run test:backend`: Chạy kiểm thử các module backend trong `Backend/`.
  - `npm run test:frontend`: Chạy kiểm thử giao diện React trong `Frontend/`.
  - `npm run typecheck`: Kiểm tra kiểu tĩnh TypeScript toàn diện.
- **Ranh giới thực thi kiểm thử:** Mọi kiểm thử đơn vị, component và tích hợp chỉ áp dụng cho mã nguồn mới trong `Frontend/` và `Backend/`. Tuyệt đối không can thiệp hay sửa đổi các thư mục cũ `frontend-old/` và `backend-old/` (chỉ dùng tham khảo).

---

## 3. Ma Trận Kịch Bản Kiểm Thử Trọng Yếu (Critical Test Scenarios)

### 3.1 Ma trận Kiểm thử Phân loại Lỗi & Cảnh báo (`problemClassifier`)

| Mã kiểm thử | Tình huống đầu vào                                  | Kết quả mong đợi                                                                                        |
| :---------- | :-------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `TC-CLS-01` | Ricoh SC541 / SC542 (Cụm sấy quá nhiệt/đứt nhiệt)   | Phân hệ: `Fuser`, Severity: `Critical`, Tên tiếng Việt: "Lỗi cụm sấy: Quá nhiệt hoặc đứt thanh nhiệt"   |
| `TC-CLS-02` | Ricoh SC101 (Khối quang học / Scanner lỗi bóng đèn) | Phân hệ: `Scanner_ADF`, Severity: `Warning`, Tên: "Lỗi khối quét hình ảnh / ADF"                        |
| `TC-CLS-03` | Canon E000 / E001 (Lỗi mạch nung cụm sấy)           | Phân hệ: `Fuser`, Severity: `Critical`, Tên: "Lỗi cụm sấy Canon"                                        |
| `TC-CLS-04` | Mã lỗi không xác định (Unknown SC/Error code)       | Phân hệ: `General`, Severity: `Warning`, Tên: "Mã lỗi phần cứng không xác định [Mã]", giữ nguyên mã gốc |
| `TC-CLS-05` | Kẹt giấy thông thường (Paper Jam)                   | Phân loại: Lỗi vận hành có thể phục hồi (`OPERATIONAL_RECOVERABLE`), không gắn cờ hỏng bo mạch          |

### 3.2 Ma trận Kiểm thử Chính sách Auto-Closure (`autoClosureEngine`)

| Mã kiểm thử | Tình huống                                                                        | Kết quả mong đợi                                                                       |
| :---------- | :-------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| `TC-AC-01`  | Sự cố Critical, trigger Zabbix đã clear 15 phút, máy Online                       | **KHÔNG ĐƯỢC ĐÓNG TỰ ĐỘNG.** Trạng thái giữ nguyên hoặc chuyển `Pending Verification`. |
| `TC-AC-02`  | Sự cố do người dùng báo (`USER_REPORTED`), trigger SNMP không báo lỗi             | **KHÔNG ĐƯỢC ĐÓNG TỰ ĐỘNG.** Cần kỹ thuật viên xác nhận thực tế tại chỗ.               |
| `TC-AC-03`  | Sự cố đã phân công kỹ thuật viên hoặc đang có Task xử lý                          | **KHÔNG ĐƯỢC ĐÓNG TỰ ĐỘNG.** Giữ nguyên trạng thái công việc của kỹ thuật viên.        |
| `TC-AC-04`  | Sự cố Warning thoáng qua (Mực thấp vừa nạp), trigger clear $>10$ phút, máy Online | **Tự động đóng hợp lệ.** Ghi log hệ thống lý do đóng tự động kèm bằng chứng.           |

### 3.3 Ma trận Kiểm thử Nghiệp vụ Task & Lập Lịch (`taskService`)

| Mã kiểm thử | Thao tác người dùng                           | Kết quả mong đợi                                                                                |
| :---------- | :-------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| `TC-TSK-01` | Tạo Task mới độc lập hoặc từ Incident         | Mã task dạng `TSK-YYYYMMDD-XXXX`, ghi Activity Log action `CREATED`                             |
| `TC-TSK-02` | Chuyển trạng thái sang `Waiting`              | Bắt buộc có `pendingReason`, nếu thiếu trả lỗi `400 Bad Request`                                |
| `TC-TSK-03` | Dời hạn chót `dueDate` sang ngày khác         | Bắt buộc có trường `reason`, ghi Activity Log action `RESCHEDULED` kèm `oldValue` và `newValue` |
| `TC-TSK-04` | Bàn giao task cho người khác (`reassign`)     | Cập nhật `assignee` mới, ghi Activity Log action `REASSIGNED` kèm ghi chú bàn giao              |
| `TC-TSK-05` | Tính toán trạng thái hạn chót `dueDateStatus` | Quá hạn $\to$ `overdue`; Trong 24h $\to$ `due_soon`; Còn lại $\to$ `on_track`                   |

### 3.4 Ma trận Kiểm thử Telemetry & Lemon Devices (`telemetryAggregator`)

| Mã kiểm thử | Dữ liệu đầu vào                                                     | Kết quả mong đợi                                                             |
| :---------- | :------------------------------------------------------------------ | :--------------------------------------------------------------------------- |
| `TC-TEL-01` | Bộ đếm bình thường: Đầu kỳ 50.000, Cuối kỳ 52.500                   | Sản lượng $\Delta V = 2.500$ trang                                           |
| `TC-TEL-02` | Bộ đếm bị giảm/reset: Đầu kỳ 50.000, Cuối kỳ 1.200 (thay mainboard) | Không tính ra âm; trả về `null` hoặc cờ `ANOMALY_DETECTED`, ghi log cảnh báo |
| `TC-TEL-03` | Khoảng thời gian chỉ có 1 mẫu đo hoặc không có mẫu                  | Trả về `MetricValue = null`, không tự nội suy thành số 0                     |
| `TC-TEL-04` | Máy in có 6 sự cố trong tháng và downtime 80 giờ                    | Gắn cờ `isLemonDevice = true`, đề xuất `Replacement_Candidate`               |

---

## 4. Kế Hoạch Chạy Kiểm Thử Trong Quy Trình CI/CD

Trước khi nghiệm thu bất kỳ thay đổi nào, quy trình kiểm thử tự động sau phải chạy và đạt kết quả xanh 100%:

```bash
# 1. Kiểm tra tính an toàn kiểu dữ liệu TypeScript (Strict Typecheck)
npm run typecheck

# 2. Chạy toàn bộ Unit Tests & Integration Tests
npm run test

# 3. Quét kiểm tra vi phạm quy tắc cốt lõi (Lint & Rule Guardian)
# - Kiểm tra không tồn tại chuỗi "actionGuidance"
# - Kiểm tra không có console.log dư thừa trong production code
```
