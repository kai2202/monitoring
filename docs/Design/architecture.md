# FleetMonitor — Kiến Trúc Hệ Thống & Đặc Tả Kỹ Thuật (System Architecture & Technical Specification)

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Tài liệu:** Kiến Trúc Hệ Thống & Thiết Kế Kỹ Thuật 4 Hạng Mục Trọng Tâm  
> **Phiên bản:** 2.6.0 (Tối ưu hóa hạm đội ~100 máy in, 100% Pure React SVG, Quản trị Bảo trì CMMS, Chuẩn hóa mã lỗi CSV & RBAC Data Scope)  
> **Trạng thái:** Authoritative Architectural Blueprint (Chuẩn thiết kế kỹ thuật)

---

## 1. Kiến Trúc Tổng Thể Hệ Thống (System Overview)

Hệ thống FleetMonitor được xây dựng theo mô hình kiến trúc phân lớp hướng dịch vụ (Layered Service-Oriented Architecture), tối ưu hóa chuyên biệt cho quy mô giám sát **hạm đội khoảng 100 máy in** đa thương hiệu (Chủ lực: **Canon, Ricoh**; Đồng hành: **Epson, HP, Brother, Toshiba, Olivetti**). Hạ tầng trải rộng trên **Toà nhà Trụ sở chính (quy mô 7 tầng, máy in đặt linh hoạt ở tùy tầng)** kết hợp với **các chi nhánh/văn phòng vệ tinh khác** kết nối an toàn qua mạng Site-to-Site VPN / SD-WAN. Hệ thống đảm bảo thời gian phản hồi giao diện $< 50\text{ms}$ thông qua bộ đệm In-Memory Cache và tổng hợp dữ liệu định kỳ (Rollup Aggregation).

```mermaid
flowchart TD
    subgraph FleetLayer ["1. HẠ TẦNG THIẾT BỊ NGOẠI VI (~100 MÁY IN — ĐA CHI NHÁNH & TOÀ NHÀ 7 TẦNG)"]
        HQ["Trụ sở chính: Toà nhà 7 tầng\n(Bố trí máy in linh hoạt tại các tầng có nhu cầu)"]
        Branches["Các Chi Nhánh / Văn phòng vệ tinh ngoại tỉnh\n(Kết nối an toàn qua mạng Site-to-Site VPN / SD-WAN)"]
        Brands["Thương hiệu: Chủ lực (Canon, Ricoh)\nĐồng hành: Epson, HP, Brother, Toshiba, Olivetti"]
        HQ --- Brands
        Branches --- Brands
    end

    subgraph MonitoringLayer ["2. TẦNG THU THẬP & CẢNH BÁO (MONITORING ENGINE)"]
        Zabbix["Zabbix Server 7.0 LTS\n(SNMP Poller v1/v2c/v3 qua LAN nội bộ & Site-to-Site VPN)"]
        MIBs["Từ điển OID MIBs: RFC 3805 (Printer-MIB),\nRicoh MIB, Canon MIB, HP/Brother/Epson/Toshiba"]
    end

    subgraph BackendLayer ["3. MÁY CHỦ DỊCH VỤ BACKEND (NODE.JS / EXPRESS / TYPESCRIPT)"]
        Poller["SNMP/Zabbix Poller & Telemetry Aggregator\n(Fast Polling 30s: Triggers/ICMP | Slow Polling 1h: Counters/Supplies)"]
        Cache["In-Memory Cache Engine (TTL = 60s)\n(Phản hồi UI < 50ms theo AGENTS.md, RAM < 1MB)"]
        AuthMiddleware["RBAC & Data Scope Middleware\n(3 Vai trò: ADMIN, FIELD_TECH, ASSET_HR\nPhân vùng dữ liệu: Branch -> Floor -> Department)"]
        APIGateway["Express REST API Endpoints\n(/api/telemetry, /api/maintenance, /api/error-codes)"]
        CSVEngine["CSV Parser & Validation Engine\n(Nạp danh mục mã lỗi từ giao diện Cài đặt)"]
    end

    subgraph StorageLayer ["4. CƠ SỞ DỮ LIỆU & LƯU TRỮ VẬT THỂ (PERSISTENCE LAYER)"]
        Postgres[(PostgreSQL 16 Database\nPrisma ORM: Rollups ~36.5k rows/năm,\nTickets, Tasks, Work Logs, RBAC, Mappings)]
        MinIO[(MinIO S3 Object Storage\nTài liệu kỹ thuật, Ảnh hiện trường,\nBiên bản bàn giao nghiệm thu)]
    end

    subgraph FrontendLayer ["5. GIAO DIỆN VẬN HÀNH NGƯỜI DÙNG (REACT 18 / TYPESCRIPT)"]
        PureSVG["100% Pure React SVG Data Visualization\n(Spline 2.25px, Cột Ngang Stacked, Sandbox Đối Chiếu, Arc 180°, Dynamic Heatmap)"]
        Dashboards["Role-Based Bento Dashboard (Admin IT/NOC, Field Tech, Asset HR)\nTùy biến bố cục Widget & Bộ lọc Chi nhánh/Tầng"]
        SettingsUI["Settings & CSV Error Code Manager\nTra cứu, nhập/xuất CSV và điều chỉnh ánh xạ lỗi"]
    end

    FleetLayer -->|SNMP Traps / Polling qua VPN & LAN| MonitoringLayer
    MonitoringLayer -->|Zabbix JSON-RPC API| Poller
    Poller --> Cache
    Poller -->|Ghi Snapshot & Rollup| Postgres
    CSVEngine -->|Import/Export Mappings| Postgres
    APIGateway --> Cache
    APIGateway --> Postgres
    APIGateway --> MinIO
    FrontendLayer -->|REST API Requests / JWT Claims| AuthMiddleware
    AuthMiddleware --> APIGateway
```

### 1.1. Chuẩn Kiến Trúc Frontend, Quy Tắc Giới Hạn Code (<300 LOC) & Hệ Sinh Thái Thư Viện

Frontend được xây dựng theo chuẩn **Enterprise Feature-Based Architecture**, tuân thủ nghiêm ngặt các quy định sau:

1. **Quy tắc Giới hạn Độ dài File (< 300 LOC):**
   - **Hard Limit:** Mọi file mã nguồn (`.tsx`, `.ts`) tuyệt đối không vượt quá 300 dòng code (Sweet spot tối ưu: 150 – 250 LOC).
   - **Tự động phân rã:** Khi component hoặc page đạt 200–250 dòng code, bắt buộc phân tách thành các file chuyên biệt:
     - `features/<feature>/components/`: Chứa JSX hiển thị giao diện thuần túy, không ôm đồm logic.
     - `features/<feature>/hooks/`: Bóc tách toàn bộ state phức tạp, tính toán toạ độ SVG.
     - `features/<feature>/slices/`: Redux slices & RTK Query API endpoints.
     - `features/<feature>/types/`: Định nghĩa kiểu dữ liệu TypeScript & Enums cục bộ.

2. **Hệ Sinh Thái Thư Viện Frontend Chuẩn (Approved Tech Stack):**
   - **Khung lõi:** React 18 + TypeScript + Vite.
   - **Điều hướng:** React Router v6 (Lazy Loading với `React.lazy()` + Suspense Skeleton).
   - **Trạng thái & Bộ nhớ đệm API:** Redux Toolkit + RTK Query (với cache tag types và mock fallback baseQuery).
   - **Giao diện:** Tailwind CSS + shadcn/ui Design Tokens & Primitives.
   - **Biểu mẫu:** React Hook Form + Zod schema validation.
   - **Bảng dữ liệu:** `@tanstack/react-table` kết hợp Client-side In-memory Filtering & Phân trang thu gọn (10–25 dòng/trang). Toàn bộ danh mục ~100 máy in (< 50KB payload) được tải vào bộ đệm client, cho phép lọc theo Tầng (T1–T5), Hãng và Trạng thái tức thì ($< 5\text{ms}$), loại bỏ gánh nặng Virtualization phức tạp.
   - **Thông báo Realtime:** `sonner` Toast Notifications chuẩn shadcn/ui.
   - **Hệ thống Biểu Tượng Chuẩn Duy Nhất:** **FontAwesome duy nhất** (`@fortawesome/react-fontawesome`, `@fortawesome/free-solid-svg-icons`). Nghiêm cấm sử dụng hoặc cài đặt các thư viện icon khác (AGENTS.md Rule 7.1).

---

## 2. Đặc Tả Hạng Mục 1: Printer Analytics (~100 Máy In)

### 2.1. Thư Viện Trực Quan Hóa: 100% Pure React SVG

Thay vì nạp các thư viện đồ họa cồng kềnh như Apache ECharts hay WebGL ECharts-GL (gây đội thêm ~2MB bundle size và phụ thuộc GPU), hệ thống chuẩn hóa sử dụng **100% Pure React SVG**. Giải pháp này đảm bảo hiển thị sắc nét tuyệt đối trên mọi độ phân giải (Retina/HiDPI), tương thích hoàn toàn với Tailwind CSS tokens và phản hồi hover tức thời:

1. **Biểu Đồ Xu Hướng Sản Lượng & Đỉnh Tải (Soft Spline Chart):**
   - *Cơ chế hiển thị:* Pure React SVG với đường cong Cubic Bézier Spline (stroke 2.25px `#2563eb`).
   - *Vùng bóng mờ:* Linear Gradient bán trong suốt (`rgba(37, 99, 235, 0.22)` $\to$ `0.0`).
   - *Đỉnh tải (Peak Pill):* Viên nang nổi bật đánh dấu mốc giờ/ngày có sản lượng cao nhất hạm đội.
   - *Trục thời gian:* Trục X hiển thị chu kỳ (24 Giờ, 7 Ngày, 30 Ngày), Trục Y hiển thị số trang in.
   - *Tương tác:* Đường gióng dọc (vertical dashed line) và Tooltip đa tầng khi hover hiển thị chi tiết số trang và đối chiếu kỳ trước.

2. **Biểu Đồ Cột Ngang Phân Bố Sản Lượng (Production Horizontal Bar Chart):**
   - *Trục tung (Y-axis):* Tên/model máy in, vị trí tầng (T1–T5) và phòng ban.
   - *Thanh ngang xếp chồng (Stacked Bar):* Phân định tỷ trọng bản in Đen trắng (Mono `#2563eb`) và Màu (Color `#ec4899`).
   - *Tương tác nhanh:* Nút ghim 📌 (Pin Icon) ở cuối mỗi thanh ngang để đưa máy vào Khung đối chiếu.

3. **Khung Ghim Đối Chiếu (Pinned Comparison Sandbox Bento Dock):**
   - *Vị trí:* Đặt song song bên cạnh biểu đồ cột ngang.
   - *Cơ chế chuẩn hóa:* Căn chỉnh tất cả các máy được ghim trên **cùng một thang đo (common scale)** dựa trên sản lượng lớn nhất trong nhóm đã chọn, cho phép so sánh trực diện độ dài thanh tải, độ lệch tải (% so với máy dẫn đầu), tốc độ PPM thực tế và MTBF.
   - *Nút hành động:* Gỡ ghim trực tiếp từng máy, xóa tất cả ghim, hoặc mở Modal phân tích đối chiếu chuyên sâu 1:1.

4. **Biểu Đồ Vòng Cung Chi Phí Phòng Ban (Cost Allocation 180° Arc):**
   - *Hình học SVG:* Vòng cung bán nguyệt 180° nét mảnh 11px (radius = 86px, strokeWidth = 11px).
   - *Tương tác 2 chiều:* Hover thẻ phòng ban $\to$ lát cắt tương ứng trên vòng cung phát sáng và tâm donut cập nhật tổng chi phí động.

5. **Ma Trận Nhiệt Điểm Nóng Sự Cố (SLA Incident Heatmap Matrix):**
   - *Quy mô ma trận:* 5 khu vực/tầng $\times$ 7 tuần theo dõi.
   - *Dải màu UX:* Xám nhạt (0 vụ) $\to$ Vàng hổ phách `#fef3c7` (1 vụ) $\to$ Đỏ hồng `#ffe4e6` (Điểm nóng $\ge 2$ vụ).
   - *Inspector Panel:* Click ô ma trận để xem danh sách sự cố cụ thể, thời gian khắc phục và mã lỗi nội bộ `FM-...`.

### 2.2. Cơ Chế Backend, Tính Toán Băng Thông & Cơ Sở Dữ Liệu Cho ~100 Thiết Bị

#### 1. Tính Toán Băng Thông & Tải Polling (Network & Polling Sizing):
- **Fast Polling (Chu kỳ 30 giây):**
  - Giám sát ICMP Ping, trạng thái kết nối Online/Offline và SNMP Triggers (Hardware Error, Paper Jam).
  - Tải mạng: $100\text{ hosts} \div 30\text{s} \approx 3.3\text{ req/s}$. Lưu lượng mạng cực thấp ($< 10\text{ KB/s}$), hoàn toàn không ảnh hưởng đến băng thông mạng nội bộ doanh nghiệp.
- **Slow Polling (Chu kỳ 1 giờ):**
  - Quét số counter tổng (Total, Color, Mono) và mức tiêu hao vật tư (CMYK, Drum, Fuser, Waste Toner Box).
  - Tải mạng: $100\text{ hosts} \div 3.600\text{s} \approx 0.027\text{ req/s}$.

#### 2. Kích Thước Lưu Trữ PostgreSQL (Database Sizing):
- **Bảng `printer_daily_volume`:**
  - $100\text{ thiết bị} \times 1\text{ bản ghi/ngày} = 100\text{ bản ghi/ngày} \approx 36.500\text{ bản ghi/năm}$.
  - Kích thước lưu trữ: $\approx 5\text{ MB/năm}$ (bao gồm cả chỉ mục B-Tree).
- **Bảng `printer_monthly_volume`:**
  - $100\text{ bản ghi/tháng} = 1.200\text{ bản ghi/năm} \approx 200\text{ KB/năm}$.
- **In-Memory Cache (TTL 60s):**
  - Snapshot toàn bộ 100 máy in và dữ liệu phân tích chỉ chiếm $< 1\text{ MB}$ RAM trên máy chủ Node.js.
  - Tỷ lệ Cache Hit $> 98\%$, thời gian đáp ứng API $< 10\text{ms}$ (vượt xa mục tiêu $< 50\text{ms}$).

#### Thiết Kế Bảng PostgreSQL Cho Analytics:

```sql
-- 1. Lưu snapshot sản lượng theo ngày
CREATE TABLE printer_daily_volume (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    printer_id VARCHAR(50) NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    start_total_counter BIGINT NOT NULL,
    end_total_counter BIGINT NOT NULL,
    delta_total_pages INTEGER NOT NULL CHECK (delta_total_pages >= 0),
    delta_color_pages INTEGER NOT NULL DEFAULT 0 CHECK (delta_color_pages >= 0),
    delta_mono_pages INTEGER NOT NULL DEFAULT 0 CHECK (delta_mono_pages >= 0),
    is_abnormal_burst BOOLEAN DEFAULT FALSE, -- Cờ đánh dấu đột biến tải
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_printer_date UNIQUE (printer_id, record_date)
);

CREATE INDEX idx_printer_daily_date ON printer_daily_volume (record_date);
CREATE INDEX idx_printer_daily_lookup ON printer_daily_volume (printer_id, record_date);

-- 2. Bảng tổng hợp theo tháng (Monthly Rollup phục vụ báo cáo dài hạn)
CREATE TABLE printer_monthly_volume (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    printer_id VARCHAR(50) NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
    year_month VARCHAR(7) NOT NULL, -- Định dạng: YYYY-MM
    total_pages INTEGER NOT NULL,
    color_pages INTEGER NOT NULL,
    mono_pages INTEGER NOT NULL,
    color_ratio_percent NUMERIC(5, 2),
    uptime_percent NUMERIC(5, 2),
    incident_count INTEGER DEFAULT 0,
    maintenance_cost_vnd NUMERIC(12, 2) DEFAULT NULL, -- Null nếu chưa có dữ liệu chi phí
    CONSTRAINT uq_printer_month UNIQUE (printer_id, year_month)
);

CREATE INDEX idx_printer_monthly_lookup ON printer_monthly_volume (year_month, total_pages DESC);
```

#### Xử Lý Sự Cố Counter Reset & 32-bit Rollover:
- Khi `end_counter < start_counter`:
  - Kiểm tra nếu `start_counter > 4,200,000,000` và `end_counter < 100,000`: Xử lý theo thuật toán 32-bit Rollover: $\text{delta} = (2^{32} - \text{start\_counter}) + \text{end\_counter}$.
  - Nếu không thỏa mãn mốc rollover (ví dụ kỹ thuật viên thay mainboard làm reset counter về 0): Ghi nhận cờ `is_counter_reset = TRUE`, lấy mốc `end_counter` làm cơ sở chu kỳ mới, tuyệt đối không tạo số âm hoặc số liệu giả.

### 2.3. Thuật Toán Tính Toán Backend & Điều Kiện Biên Cốt Lõi

Nhằm đảm bảo dữ liệu hiển thị trung thực tuyệt đối theo nguyên tắc AGENTS.md, Backend phải thực thi các thuật toán tính toán và điều kiện biên sau:

1. **Thuật toán Dự báo Cạn kiệt Vật tư (Days-to-Empty D-Day) theo Tốc độ tiêu hao trượt 7 ngày (7-Day Rolling Burn Rate):**
   - *Tốc độ tiêu hao trung bình ngày:* $\Delta C_{avg} = \frac{C_{t-7} - C_t}{7}$ (%/ngày).
   - *Số ngày còn lại ước tính:* $D = \frac{C_t}{\Delta C_{avg}}$ (ngày).
   - *Phân loại huy hiệu D-Day:*
     + $[D \le 5]$: **Khẩn cấp (Rose `#ef4444`)** — Cần thay thế trong tuần.
     + $[5 < D \le 14]$: **Cần lưu ý (Amber `#f59e0b`)** — Dự trù linh kiện đệm kho.
     + $[D > 14]$: **An toàn (Green `#10b981`)** — Mức vật tư ổn định.
   - *Quy chuẩn xử lý điều kiện biên (Edge Cases — Rule 5 AGENTS.md):*
     + **Máy mới (< 3 ngày dữ liệu) hoặc Không in trong tuần ($\Delta C_{avg} \le 0$):** Trả về `null` (hiển thị `—` hoặc `Chưa đủ dữ liệu`), **tuyệt đối không chia cho 0** tạo ra $\infty$ hoặc số âm giả mạo.
     + **Khi thay mực mới ($C_t > C_{prev}$):** Backend tự động phát hiện bước nhảy tăng % và reset cửa sổ tính toán từ thời điểm thay mới.
     + **Máy in đơn sắc (Monochrome):** Các trường `cyan`, `magenta`, `yellow` bắt buộc trả về `null` (hiển thị `—`), chỉ tính toán cho mực đen K.
     + **Hộp mực thải (Waste Toner Box):** Chuẩn hóa đa hãng về 3 trạng thái: `'OK'`, `'Sắp đầy'` (khi $\ge 80\%$ hoặc nhận SNMP Warning), `'Đầy'` (khi $= 100\%$ hoặc nhận SNMP Critical).

2. **Tỷ lệ Khả dụng Toàn Đội Máy (Fleet Uptime SLA %):**
   - $Uptime\% = \frac{T_{window} - T_{offline}}{T_{window}} \times 100\%$.
   - Khi mất kết nối Zabbix, thiết bị không tự động coi là Offline mà chuyển trạng thái `isStale = true` kèm mốc thời gian scrape thành công gần nhất.

3. **Chỉ số Độ Tin Cậy Vận Hành (MTBF & MTTR):**
   - *MTBF (Thời gian chạy ổn định trung bình):* $MTBF = \frac{\sum T_{online}}{\text{Incident Count}}$ (giờ/máy).
   - *MTTR (Thời gian khắc phục trung bình):* $MTTR = \frac{\sum T_{repair}}{\text{Resolved Repair Count}}$ (phút/vụ).

4. **Hạch Toán Chi Phí Trang In (Cost Per Page - CPP):**
   - $\text{Total Maintenance Cost} = \text{Parts Cost (VNĐ)} + \text{Labor Cost (VNĐ)}$.
   - $CPP = \frac{\text{Total Maintenance Cost}}{\text{Delta Printed Pages}}$ (VNĐ/trang). Nếu không phát sinh trang in, CPP trả về `null`.

---

## 3. Đặc Tả Hạng Mục 2: Maintenance Management (Quản Lý Bảo Trì)

### 3.1. Mô Hình Phân Cấp 3 Tầng: Ticket $\to$ Task $\to$ Work Log

Hệ thống quản lý bảo trì được thiết kế theo quy trình khép kín, phân định rõ ràng giữa yêu cầu sự cố, kế hoạch phân công, và nhật ký thực thi tại hiện trường:

```
[1. TICKET (Yêu Cầu / Sự Cố)]
  │
  ├── Sinh tự động từ Cảnh báo SNMP Zabbix (Hardware Error / Paper Jam / Supplies Critical)
  └── Hoặc do Người dùng / Quản lý tạo thủ công
        │
        ▼ (Phân công kỹ thuật viên & Lập kế hoạch)
[2. TASK / WORK ORDER (Lệnh Công Việc)]
  │
  ├── Chế độ xem: Bảng danh sách, Lịch trình tiến độ Gantt (Timeline)
  ├── Quy trình Dynamic Stepper (Kiểm tra -> Vệ sinh -> Thay thế -> Nghiệm thu)
  ├── Quản lý trạng thái: Planned -> In Progress -> Waiting -> Completed
  └── Tự động nới rộng ô ngày có việc (240px); Hoàn thành tự động chuyển sang Kho Lịch Sử & xóa khỏi Gantt
        │
        ▼ (Ghi chép chi tiết từng phiên can thiệp)
[3. WORK LOG (Nhật Ký Phiên Làm Việc)]
  ├── Người thực hiện, Giờ bắt đầu, Giờ kết thúc
  ├── Chi tiết linh kiện thay thế, Chi phí vật tư & Chi phí nhân công (VNĐ)
  ├── Kết quả in thử nghiệm thu (Đạt / Không đạt)
  └── Đính kèm tài liệu, ảnh chụp lỗi & ảnh sau sửa chữa (Lưu trữ trên MinIO S3)
```

### 3.2. Thiết Kế Cơ Sở Dữ Liệu PostgreSQL Cho Bảo Trì

```sql
-- 1. Bảng Ticket (Phiếu yêu cầu / sự cố tiếp nhận)
CREATE TABLE maintenance_tickets (
    id VARCHAR(50) PRIMARY KEY, -- Định dạng: TCK-202611-001
    printer_id VARCHAR(50) NOT NULL REFERENCES printers(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source VARCHAR(20) NOT NULL CHECK (source IN ('SNMP_TRIGGER', 'USER_REPORT', 'PREVENTIVE_SCHEDULE')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Critical', 'Warning', 'Info')),
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'RESOLVED', 'CLOSED')),
    internal_error_code VARCHAR(50), -- Liên kết tới bộ mã chuẩn hóa FM-...
    reported_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 2. Bảng Task (Lệnh thực thi công việc)
CREATE TABLE maintenance_tasks (
    id VARCHAR(50) PRIMARY KEY, -- Định dạng: TSK-202611-001
    ticket_id VARCHAR(50) REFERENCES maintenance_tickets(id) ON DELETE SET NULL,
    printer_id VARCHAR(50) NOT NULL REFERENCES printers(id),
    title VARCHAR(255) NOT NULL,
    task_type VARCHAR(30) NOT NULL CHECK (task_type IN ('CORRECTIVE_REPAIR', 'PERIODIC_MAINTENANCE', 'TONER_REPLACEMENT', 'FIRMWARE_UPGRADE')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
    status VARCHAR(30) NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Waiting', 'Pending Verification', 'Completed')),
    assigned_to UUID REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    pending_reason TEXT, -- Bắt buộc khi chuyển sang Waiting
    pending_next_check TIMESTAMP WITH TIME ZONE,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    dynamic_steps JSONB DEFAULT '[]'::jsonb, -- Danh sách các bước stepper động
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Bảng Work Log (Nhật ký thực địa & Chi phí chi tiết)
CREATE TABLE maintenance_work_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(50) NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE NOT NULL,
    work_performed TEXT NOT NULL, -- Nội dung kỹ thuật đã can thiệp
    parts_replaced JSONB DEFAULT '[]'::jsonb, -- Danh sách linh kiện [{ part_code, name, qty, unit_cost }]
    parts_cost_vnd NUMERIC(12, 2) DEFAULT 0,
    labor_cost_vnd NUMERIC(12, 2) DEFAULT 0,
    total_cost_vnd NUMERIC(12, 2) GENERATED ALWAYS AS (parts_cost_vnd + labor_cost_vnd) STORED,
    test_print_result VARCHAR(20) CHECK (test_print_result IN ('PASSED', 'FAILED', 'MARGINAL')),
    counter_at_service BIGINT, -- Số counter máy in lúc hoàn tất sửa chữa
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Đính Kèm Tệp Tin Lưu Trữ MinIO
CREATE TABLE work_log_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_log_id UUID NOT NULL REFERENCES maintenance_work_logs(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    minio_bucket VARCHAR(64) NOT NULL DEFAULT 'fleetmonitor-maintenance',
    minio_object_key VARCHAR(512) NOT NULL, -- Đường dẫn tệp trong bucket MinIO
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3. Tích Hợp MinIO S3 Object Storage

- **Cấu trúc lưu trữ (Bucket Storage Layout):**
  - Bucket: `fleetmonitor-maintenance`
  - Object Key Pattern: `printers/{printerId}/tasks/{taskId}/worklogs/{workLogId}/{timestamp}_{filename}`
- **Bảo mật truy cập:**
  - Backend cung cấp API Presigned Upload URL cho Client để upload file trực tiếp lên MinIO mà không làm quá tải CPU máy chủ Backend.
  - Khi xem tài liệu/ảnh trên Drawer, Backend sinh Presigned Download URL có hiệu lực ngắn hạn (15 phút).

### 3.4. Cơ Chế Truy Xuất & Tái Sử Dụng Lịch Sử Bảo Trì (Knowledge Reuse Engine)

Khi một Ticket mới xuất hiện trên thiết bị model $M$ kèm mã lỗi $E$ (ví dụ: `FM-FUS-01` hoặc Ricoh SC542):
1. Hệ thống tự động truy vấn các Work Log có kết quả `test_print_result = 'PASSED'` của các máy in cùng model $M$ trong quá khứ.
2. Trích xuất:
   - Các linh kiện thay thế phổ biến nhất và giá tham khảo.
   - Các bước can thiệp kỹ thuật đạt hiệu quả cao nhất.
   - Thời gian trung bình để khắc phục thành công (MTTR).
3. Hiển thị khối gợi ý giải pháp (Historical Recommended Fix) trực tiếp trong Drawer chẩn đoán để kỹ thuật viên xử lý chính xác ngay từ đầu.

---

## 4. Đặc Tả Hạng Mục 3: Error Code Standardization (Chuẩn Hóa Mã Lỗi)

### 4.1. Quy Trình Nạp & Quản Lý Mã Lỗi Qua CSV Tại Giao Diện Settings

Toàn bộ từ điển mã lỗi được nạp vào PostgreSQL thông qua tính năng **Import/Export CSV** trong phân hệ Cài đặt (`/settings`), hỗ trợ xuất khẩu, tra cứu, và điều chỉnh linh hoạt:

```
[File CSV Chuẩn Hóa từ Chuyên Gia / Hãng]
        │
        ▼ (Upload qua Giao diện /settings)
[Backend CSV Parser & Validator]
        │
        ├── Kiểm tra tính hợp lệ của phân hệ (Subsystem) và cấu trúc FM-...
        ├── Kiểm tra tính toàn vẹn 6 thương hiệu (Ricoh, HP, Canon, Epson, Brother, Xerox)
        └── Ghi vết vào error_code_audit_logs
        │
        ▼
[PostgreSQL Database] ──> [Giao diện Settings: Tra cứu, Sửa trực tiếp, Xuất CSV]
```

### 4.2. Cấu Trúc Bảng PostgreSQL Cho Chuẩn Hóa Mã Lỗi

```sql
-- 1. Bảng Định Danh Mã Lỗi Nội Bộ Chuẩn Hóa
CREATE TABLE internal_error_definitions (
    id VARCHAR(50) PRIMARY KEY, -- Mã chuẩn: FM-<SUBSYSTEM>-<INDEX> (Ví dụ: FM-FUS-01)
    subsystem VARCHAR(10) NOT NULL CHECK (subsystem IN (
        'FUS', -- Cụm sấy (Fuser)
        'OPT', -- Khối quang học / Laser Polygon Motor
        'SCN', -- Khối quét / ADF (Scanner)
        'FED', -- Cơ kéo giấy / Khay giấy / Cụm cuốn (Paper Feed)
        'DRM', -- Cụm trống hình (Drum / Imaging Unit)
        'DEV', -- Cụm từ (Developer Unit)
        'TNR', -- Hệ thống cấp mực / Bơm mực (Toner Supply)
        'TRN', -- Băng tải chuyển ảnh (Transfer Belt)
        'PWR', -- Khối nguồn & Cao áp (Power Supply / High Voltage)
        'NET'  -- Bo mạch điều khiển & Mạng (Controller / Mainboard)
    )),
    name_vi VARCHAR(255) NOT NULL, -- Tên lỗi tiếng Việt chuẩn doanh nghiệp
    root_cause_vi TEXT NOT NULL,   -- Nguyên nhân bản chất kỹ thuật
    default_severity VARCHAR(20) NOT NULL CHECK (default_severity IN ('Critical', 'Warning', 'Info')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Ánh Xạ Mã Hãng Sang Mã Nội Bộ (1 Mã Nội Bộ ánh xạ N Mã Hãng)
CREATE TABLE vendor_error_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_error_id VARCHAR(50) NOT NULL REFERENCES internal_error_definitions(id) ON DELETE CASCADE,
    vendor VARCHAR(30) NOT NULL CHECK (vendor IN ('Ricoh', 'HP', 'Canon', 'Epson', 'Brother', 'Xerox')),
    vendor_code VARCHAR(50) NOT NULL, -- Mã hãng gốc: SC542, E000, 50.1, 010-327,...
    model_pattern VARCHAR(100) DEFAULT '*', -- Mẫu áp dụng (ví dụ: 'Pro C7200s*', '*' cho tất cả model)
    vendor_description TEXT, -- Mô tả kỹ thuật trong Service Manual của hãng
    remedy_steps_vi TEXT, -- Quy trình xử lý khuyến nghị của hãng dịch sang tiếng Việt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_vendor_code_pattern UNIQUE (vendor, vendor_code, model_pattern)
);

CREATE INDEX idx_vendor_code_lookup ON vendor_error_mappings (vendor, vendor_code);

-- 3. Bảng Lưu Vết Lịch Sử Thay Đổi Từ Điển Mã Lỗi (Audit Trail)
CREATE TABLE error_code_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_error_id VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('IMPORT_CSV', 'CREATE', 'UPDATE', 'DELETE')),
    changed_by UUID REFERENCES users(id),
    old_data JSONB,
    new_data JSONB,
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3. Định Dạng Chuẩn File Mẫu CSV Import/Export

File CSV có thể được tạo từ Excel và tải lên hệ thống với cấu trúc cột bắt buộc:

```csv
internal_code,subsystem,name_vi,root_cause_vi,default_severity,vendor,vendor_code,model_pattern,vendor_description,remedy_steps_vi
FM-FUS-01,FUS,Lỗi nhiệt cụm sấy không đạt ngưỡng,Cảm biến nhiệt Thermistor đứt hoặc đèn sấy hỏng,Critical,Ricoh,SC542,*,Fusing temperature warm-up error,Kiểm tra Thermistor và cầu chì nhiệt cụm sấy
FM-FUS-01,FUS,Lỗi nhiệt cụm sấy không đạt ngưỡng,Cảm biến nhiệt Thermistor đứt hoặc đèn sấy hỏng,Critical,Canon,E000,*,Fixing unit warm-up failure,Đo điện trở sấy và vệ sinh thanh nhiệt fixing
FM-FUS-01,FUS,Lỗi nhiệt cụm sấy không đạt ngưỡng,Cảm biến nhiệt Thermistor đứt hoặc đèn sấy hỏng,Critical,HP,50.1,*,Fuser low temperature error,Kiểm tra nguồn AC cấp cụm sấy và cáp kết nối DC controller
FM-FUS-01,FUS,Lỗi nhiệt cụm sấy không đạt ngưỡng,Cảm biến nhiệt Thermistor đứt hoặc đèn sấy hỏng,Critical,Xerox,010-327,*,Fuser warm up fail,Kiểm tra thermostat cụm sấy và thay thế nếu hở mạch
FM-OPT-01,OPT,Lỗi động cơ gương đa giác Polygon Motor,Động cơ quay lăng kính laser không đạt tốc độ đồng bộ,Critical,Ricoh,SC320,*,Polygon motor error,Tra dầu bạc đạn hoặc thay thế cụm laser polygon
FM-FED-01,FED,Kẹt giấy liên tục tại khay kéo giấy,Bánh xe cao su kéo giấy mòn hoặc cảm biến lệch,Warning,Ricoh,SC990,*,Paper feed jam sensor error,Thay bánh xe kéo giấy (Pick-up roller) và vệ sinh sensor
```

### 4.4. Cơ Chế Xử Lý Mã Lỗi Không Hỗ Trợ, Chưa Ánh Xạ & Raw Fallback Engine

Trong môi trường vận hành thực tế hạm đội ~100 máy in, hệ thống có thể tiếp nhận các mã lỗi mà bảng `vendor_error_mappings` chưa ghi nhận (mã lỗi mới của firmware, mã nội bộ đặc thù chưa nạp CSV, hoặc chuỗi raw hexadecimal từ SNMP trap). Nhằm ngăn chặn crash hệ thống và bảo toàn dữ liệu gốc theo nguyên tắc Rule 6 AGENTS.md, Backend thực thi cơ chế Fallback Engine như sau:

```mermaid
flowchart TD
    Trigger["Zabbix SNMP Trigger / Trap Phát Hiện Lỗi"] --> CheckMapping{"Tìm kiếm trong\nvendor_error_mappings?"}
    CheckMapping -->|Tìm thấy| KnownCode["Gán mã nội bộ chuẩn FM-<SUBSYSTEM>-<INDEX>\nLấy mô tả & quy trình khuyến nghị từ MIB/CSV"]
    CheckMapping -->|Không tìm thấy| Fallback["Kích hoạt Fallback Engine\n(Unmapped Error Handler)"]
    
    Fallback --> ParseSubsystem{"Nhận diện được Subsystem\ntừ Trigger Name / OID?"}
    ParseSubsystem -->|Có nhận diện| SubsystemCode["Gán mã FM-<SUBSYSTEM>-99\n(Ví dụ: FM-FUS-99, FM-FED-99)"]
    ParseSubsystem -->|Không nhận diện| GenericCode["Gán mã dự phòng toàn cục FM-UNK-01\n(Lỗi phần cứng chưa xác định)"]
    
    SubsystemCode --> Preserve["Lưu nguyên vẹn raw_vendor_code & chuỗi mô tả gốc của hãng\nKế thừa severity từ Zabbix Trigger"]
    GenericCode --> Preserve
    
    Preserve --> SetFlag["Gắn cờ needs_mapping_review = TRUE trong Ticket/Incident"]
    SetFlag --> NOCAlert["Cảnh báo Kỹ sư NOC trên giao diện /settings\nĐề xuất bổ sung ánh xạ vào từ điển CSV"]
    KnownCode --> CreateTicket["Tạo hoặc Cập nhật Ticket & Incident Khép Kín"]
    NOCAlert --> CreateTicket
```

1. **Nguyên Tắc Bảo Toàn Chuỗi Lỗi Gốc (`raw_vendor_code`):**
   - Tuyệt đối không xóa bỏ, làm tròn hoặc thay thế chuỗi lỗi gốc của hãng.
   - Trường `raw_vendor_code` trong bảng `maintenance_tickets` lưu trữ chính xác mã hãng gửi về (ví dụ: `SC990-00`, `0x80041001`, `E999`).
2. **Quy Tắc Định Danh Mã Dự Phòng:**
   - Nếu nhận diện được phân hệ cơ điện tử từ tên trigger Zabbix (ví dụ chứa từ khóa *Fuser, Heater, Thermistor* $\to$ `FUS`): Gán mã `FM-<SUBSYSTEM>-99` (Ví dụ: `FM-FUS-99`).
   - Nếu không nhận diện được phân hệ: Gán mã dự phòng toàn cục `FM-UNK-01` (*Lỗi phần cứng chưa xác định phân hệ*).
3. **Mức Độ Nghiêm Trọng Kế Thừa (Severity Inheritance):**
   - Độ nghiêm trọng của Ticket (`Critical`, `Warning`, `Info`) được kế thừa trực tiếp từ mức ưu tiên của Zabbix Trigger, không tự ý hạ cấp hoặc nâng cấp vô lý.
4. **Cơ Chế Gắn Cờ Kiểm Duyệt (`needs_mapping_review = TRUE`):**
   - Khi có mã lỗi unmapped xuất hiện, hệ thống gắn cờ `needs_mapping_review = TRUE`.
   - Tại phân hệ Cài đặt (`/settings`), hiển thị danh sách các mã lỗi đang chờ ánh xạ (Unmapped Errors Queue) để Kỹ sư NOC tra cứu Service Manual, điền bổ sung vào file CSV và nạp lại vào PostgreSQL.

---

---

## 5. Đặc Tả Hạng Mục 4: Role-Based Dashboard & RBAC

### 5.1. Ma Trận Phân Quyền 3 Vai Trò Chuẩn Hóa (RBAC 3 Roles Matrix)

Hệ thống chuẩn hóa thành **3 vai trò cốt lõi** bám sát thực tế vận hành doanh nghiệp (xem chi tiết tại [Đặc Tả Phân Quyền RBAC](file:///f:/Code/Github/Monitoring/docs/Design/rbac_roles_and_ui_permissions_spec.md)):

| Nhóm Vai Trò (Role Code) | Đối Tượng Thực Tế | Phạm Vi Truy Cập Dữ Liệu (Data Scope) | Quyền Hạn Chức Năng Cốt Lõi |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | Trưởng phòng IT / Kỹ sư giám sát NOC | **Toàn công ty** (Tất cả chi nhánh, toà nhà 7 tầng, toàn bộ ~100 máy in) | Toàn quyền xem và cấu hình (Full Access); Duy nhất có quyền điều chuyển máy in, tạo lệnh bảo trì, phê duyệt nghiệm thu; quản lý người dùng; nạp CSV mã lỗi. |
| **`FIELD_TECH`** | Kỹ thuật viên bảo trì hiện trường | **Chỉ Lệnh bảo trì được phân công** | Xem danh sách lệnh công việc trong ngày; Lịch trình Gantt; thực thi Dynamic Stepper SOP; chụp ảnh in test PASSED tải lên MinIO S3; **Ẩn hoàn toàn chi phí VNĐ**. |
| **`ASSET_HR`** | Chuyên viên quản lý tài sản / Kế toán | **Quản trị tài sản & Chi phí** (Theo Chi nhánh & Phòng ban) | Quyền xem kiểm kê tài sản (Read-only); xem Vòng cung chi phí 180° đối soát tiền thuê máy; đối soát dữ liệu MTTR/SLA để đánh giá hiệu suất nhân sự. |

### 5.2. Cơ Chế Thực Thi Phân Vùng Dữ Liệu (Data Scope Enforcement)

1. **JWT Payload & Claims:**
   Khi đăng nhập, máy chủ cấp JWT token chứa thông tin vai trò và phạm vi dữ liệu:
   ```json
   {
     "sub": "usr_9981",
     "username": "tech_nam",
     "role": "FIELD_TECH",
     "dataScope": {
       "branchIds": ["branch-hanoi-hq"]
     }
   }
   ```

2. **Backend Express Authorization Middleware:**
   Middleware tự động tiêm điều kiện lọc vào truy vấn ORM Prisma / SQL:
   ```typescript
   // Middleware kiểm tra Data Scope
   export const applyDataScope = (req: Request, res: Response, next: NextFunction) => {
     const user = req.user;
     if (user.role === 'ADMIN') {
       req.dataScopeFilter = {}; // Toàn quyền, không lọc
     } else if (user.role === 'FIELD_TECH') {
       req.dataScopeFilter = { assigned_to: user.id };
     } else if (user.role === 'ASSET_HR') {
       req.dataScopeFilter = { branch_id: { in: user.dataScope.branchIds } };
     }
     next();
   };
   ```

3. **Bảng Lưu Trữ Tùy Biến Giao Diện Người Dùng (Dashboard Preferences):**
   ```sql
   CREATE TABLE user_dashboard_preferences (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       dashboard_layout JSONB NOT NULL DEFAULT '{"widgets": ["hero_trend", "radar", "heatmap", "top_contributors"]}',
       theme_mode VARCHAR(10) DEFAULT 'dark',
       default_period VARCHAR(10) DEFAULT 'monthly',
       pinned_printer_ids JSONB DEFAULT '[]'::jsonb,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       CONSTRAINT uq_user_prefs UNIQUE (user_id)
   );
   ```

---

## 6. Bảng Ánh Xạ Công Nghệ & Tuân Thủ Nguyên Tắc (Compliance Matrix)

| Tiêu Chí | Đặc Tả Kỹ Thuật FleetMonitor (~100 Máy In) | Trạng Thái Tuân Thủ AGENTS.md |
| :--- | :--- | :--- |
| **Giá trị đo lường số** | `MetricValue = number | null`, không tự động gán `0` khi thiếu dữ liệu, hiển thị `—`. | ✅ Tuân thủ 100% mục 5 |
| **Dữ liệu giả lập** | Tuyệt đối không sinh dữ liệu giả khi mất kết nối Zabbix API; hiển thị trạng thái `Stale`. | ✅ Tuân thủ 100% mục 5 |
| **Quy chuẩn mã lỗi** | Chuẩn hóa `FM-<SUBSYSTEM>-<INDEX>`, tách bạch sự cố phần cứng với trạng thái vật tư. | ✅ Tuân thủ 100% mục 6 |
| **Trường cấm** | Tuyệt đối không chứa hoặc sử dụng trường `actionGuidance` trong database và giao diện. | ✅ Tuân thủ 100% mục 6 |
| **Ngôn ngữ hiển thị** | Giao diện thuần Việt chuẩn doanh nghiệp: *Danh sách máy in, Lịch trình, Lệnh bảo trì, Hộp mực thải*. | ✅ Tuân thủ 100% mục 7 |
| **Hiệu năng giao diện** | Phản hồi giao diện $< 50\text{ms}$ nhờ In-Memory Cache TTL 60s và bảng Rollup nhẹ (~36.5k rows/năm). | ✅ Tuân thủ 100% mục 7 |
| **Bảo mật & Phân quyền** | RBAC 4 cấp kết hợp Data Scope tiêm tự động tại Backend, không phụ thuộc Frontend ẩn nút. | ✅ Tuân thủ 100% mục 4 |
| **Giới hạn File Code** | Tất cả file mã nguồn `.tsx`/`.ts` tuân thủ nghiêm ngặt quy định $< 300\text{ LOC}$. | ✅ Tuân thủ 100% mục 7.1 |
| **Chuẩn biểu tượng** | Sử dụng duy nhất FontAwesome (`@/shared/icons/`), cấm thư viện icon khác. | ✅ Tuân thủ 100% mục 7.1 |

---

## 7. Bộ Tiêu Chuẩn Kiểm Duyệt 6 Cổng (6-Gate Cutover Checklist) Trước Khi Nối Backend Thật & Xóa Mock Data

> **Tài liệu tham chiếu chi tiết:** Xem đặc tả toàn bộ OIDs và các điểm mã nguồn cần refactor tại [Bản Ánh Xạ Dữ Liệu Mock Sang OIDs & APIs](file:///f:/Code/Github/Monitoring/docs/Design/frontend_mock_to_oid_mapping.md).

Để tuân thủ tuyệt đối nguyên tắc toàn vẹn dữ liệu trong AGENTS.md (Đặc biệt: *Không được tự ý bịa đặt dữ liệu, không âm thầm dùng mock data khi mất kết nối backend, và chỉ chuyển cờ khi có bằng chứng kiểm thử thực tế*), toàn bộ hệ thống phải vượt qua **Bộ 6 Cổng Kiểm Soát (6-Gate Checklist)** trước khi xóa các file mock và kích hoạt `DATA_SOURCE = "api"`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   BỘ 6 CỔNG KIỂM DUYỆT CẮT CHUYỂN DỮ LIỆU                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ ] CỔNG 1: DATABASE & SCHEMA PRISMA POSTGRESQL 16                          │
│     - Chạy Prisma migration tạo trọn vẹn 10 bảng dữ liệu (Printers,         │
│       Daily/Monthly Rollup, Tickets, Tasks, Work Logs, Attachments, Mappings)│
│     - Kiểm tra toàn vẹn ràng buộc CHECK, FOREIGN KEY và B-Tree Indexes.     │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ ] CỔNG 2: TỪ ĐIỂN MÃ LỖI 6 HÃNG & KIỂM THỬ FALLBACK FM-UNK-01             │
│     - Import thành công file CSV từ điển gốc cho Ricoh, Canon, HP, Brother,  │
│       Epson, Xerox vào PostgreSQL.                                          │
│     - Unit test kịch bản mã lỗi không hỗ trợ (unmapped/raw hex): kiểm tra   │
│       hệ thống tự gán FM-UNK-01, giữ nguyên raw_vendor_code và gắn cờ       │
│       needs_mapping_review = TRUE, không làm crash server.                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ ] CỔNG 3: ZABBIX POLLER GATEWAY (FAST 30S / SLOW 1H) & TEST ROLLOVER 32-BIT│
│     - Kết nối Zabbix 7.0 JSON-RPC API thành công với token hợp lệ.          │
│     - Quét chu kỳ 30s lấy ICMP Ping & Triggers cho ~100 hosts không timeout.│
│     - Quét chu kỳ 1h lấy Counters & Supplies, tính đúng Delta Rollup.       │
│     - Unit test kịch bản Counter Rollover 32-bit và Bo mạch Reset: xác nhận │
│       không phát sinh delta âm hoặc số liệu giả.                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ ] CỔNG 4: IN-MEMORY CACHE TTL 60S & XỬ LÝ SỰ CỐ MẤT MẠNG (STALE DATA)      │
│     - In-Memory Cache TTL 60s hoạt động, độ trễ API < 10ms (vượt chuẩn 50ms)│
│     - Khi Zabbix API bị ngắt: Backend trả dữ liệu đệm cũ kèm isStale = true.│
│     - Khi cache hết hạn và Zabbix vẫn lỗi: Trả mã HTTP 503 chi tiết,        │
│       TUYỆT ĐỐI KHÔNG tự động chuyển sang mock data ngầm (AGENTS.md Rule 5).│
├─────────────────────────────────────────────────────────────────────────────┤
│ [ ] CỔNG 5: ĐỒNG BỘ 100% TYPE CONTRACTS (FRONTEND <-> BACKEND)              │
│     - Khớp 100% TypeScript interfaces giữa Express API và Redux RTK Query.  │
│     - Tất cả giá trị đo lường tuân thủ MetricValue = number | null; thiếu dữ│
│       liệu hiển thị '—' (không thay bằng 0).                                │
│     - Tuyệt đối không xuất hiện trường actionGuidance trong payload API.    │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ ] CỔNG 6: KIỂM THỬ TÍCH HỢP E2E & KÍCH HOẠT LIVE API AN TOÀN              │
│     - Vận hành thử nghiệm liên tục tối thiểu 2 chu kỳ scrape 30s và 1 chu kỳ │
│       rollup 1h với thiết bị in ấn thực tế.                                 │
│     - Chuyển đổi cờ cấu hình DATA_SOURCE = "api" trong Service Provider.    │
│     - Lưu trữ an toàn (archive) thư mục mock data sang archive/ thay vì xóa │
│       đột ngột, phục vụ rollback dự phòng nếu Zabbix môi trường gặp sự cố.  │
└─────────────────────────────────────────────────────────────────────────────┘
```

